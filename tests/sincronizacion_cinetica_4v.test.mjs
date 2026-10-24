/**
 * @fileoverview Suite de 24 pruebas unitarias para Cinéticas de Fermentación y Compuestos Volátiles (4V):
 * `servicio_sincronizacion_cinetica`, `servicio_cinetica_fermentacion` y `servicio_comparacion_4v`.
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  extraer_valor_columna_cinetica,
  normalizar_nombre_compuesto_volatil,
  procesar_lote_cinetica
} = await import("../lib/services/servicio_sincronizacion_cinetica.ts")

const {
  obtener_propiedad_cinetica,
  obtener_valor_numerico_fila,
  calcular_promedio_columna_cinetica,
  construir_kpis_inicio_fermentacion,
  construir_tabla_compuestos_cinetica,
  construir_serie_evolucion_cinetica
} = await import("../lib/services/servicio_cinetica_fermentacion.ts")

const {
  agrupar_estadisticas_volatiles_4v,
  ordenar_tanques_por_completitud,
  preparar_serie_comparativa_volatil
} = await import("../lib/services/servicio_comparacion_4v.ts")

test("89. extraer_valor_columna_cinetica prioriza coincidencia exacta sobre coincidencia parcial", () => {
  const fila = { "Viabilidad Primer Vuelta": 94, Viabilidad: 98 }
  assert.equal(extraer_valor_columna_cinetica(fila, ["Viabilidad"]), 98)
})

test("90. extraer_valor_columna_cinetica usa coincidencia parcial cuando no hay llave exacta", () => {
  const fila = { "Conteo de Celulas x106 (Cel/mL)": 17.81 }
  assert.equal(extraer_valor_columna_cinetica(fila, ["Conteo de Celulas"]), 17.81)
})

test("91. extraer_valor_columna_cinetica devuelve cadena vacía cuando la columna no existe o está vacía", () => {
  assert.equal(extraer_valor_columna_cinetica({ Marca: "" }, ["Marca"]), "")
})

test("92. normalizar_nombre_compuesto_volatil distingue Acetato de Isoamilo de Alcohol Isoamílico", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("Acetato de Isoamilo"), "ISOAMILO")
  assert.equal(normalizar_nombre_compuesto_volatil("Alcohol Isoamílico"), "ISOAMILICO")
  assert.equal(normalizar_nombre_compuesto_volatil("Isoamil alcohol"), "ISOAMILICO")
})

test("93. normalizar_nombre_compuesto_volatil clasifica Acetato de Etilo y Acetaldehído", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("Acetato de etilo"), "ACETATO")
  assert.equal(normalizar_nombre_compuesto_volatil("Acetaldehído"), "ACETALDEHIDO")
})

test("94. normalizar_nombre_compuesto_volatil clasifica Propanol, Isobutanol (con typo Isobutaol) y Superiores", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("Propanol"), "PROPANOL")
  assert.equal(normalizar_nombre_compuesto_volatil("Isobutaol"), "ISOBUTANOL")
  assert.equal(normalizar_nombre_compuesto_volatil("Alcoholes Superiores"), "SUPERIORES")
})

test("95. normalizar_nombre_compuesto_volatil clasifica Diacetilo, Pentanodiona y VDK bajo 'VDK'", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("Diacetilo total"), "VDK")
  assert.equal(normalizar_nombre_compuesto_volatil("2,3-Pentanodiona"), "VDK")
  assert.equal(normalizar_nombre_compuesto_volatil("VDK"), "VDK")
})

test("96. normalizar_nombre_compuesto_volatil clasifica DMS y Sulfuro de Dimetilo bajo 'DMS'", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("DMS"), "DMS")
  assert.equal(normalizar_nombre_compuesto_volatil("Dimetil Sulfuro"), "DMS")
})

test("97. procesar_lote_cinetica agrupa por Marca, Tanque y Compuesto ordenando días ascendentemente", () => {
  const resultado = procesar_lote_cinetica([
    { Marca: "CORONA", Tanque: "FV01", Volatil: "Diacetilo", Dia: 3, Valor: 180 },
    { Marca: "CORONA", Tanque: "FV01", Volatil: "Diacetilo", Dia: 1, Valor: 420 }
  ])
  const serie_vdk = resultado.payload.stats4V.CORONA.FV01.VDK
  assert.equal(serie_vdk.length, 2)
  assert.equal(serie_vdk[0].dia, "D1")
  assert.equal(serie_vdk[1].dia, "D3")
})

test("98. obtener_propiedad_cinetica ignora espacios y puntos al buscar columnas", () => {
  assert.equal(obtener_propiedad_cinetica({ "pH.": 4.52 }, ["pH"]), 4.52)
  assert.equal(obtener_propiedad_cinetica({ "Gen.": "II" }, ["Gen"]), "II")
})

test("99. obtener_valor_numerico_fila respeta lista de palabras excluidas (ej. excluir 'muy' en Vigorosas)", () => {
  const fila = { "Celulas Muy Vigorosas": 92, "Celulas Vigorosas": 6 }
  assert.equal(obtener_valor_numerico_fila(fila, ["Vigorosas"], ["muy"]), 6)
})

test("100. calcular_promedio_columna_cinetica promedia únicamente valores positivos", () => {
  const filas = [{ "E.L": 0 }, { "E.L": 3.5 }, { "E.L": 4.5 }]
  assert.equal(calcular_promedio_columna_cinetica(filas, ["E.L"]), 4)
})

test("101. construir_kpis_inicio_fermentacion genera las 11 tarjetas KPI sumando Vigorosas + Muy Vigorosas", () => {
  const kpis = construir_kpis_inicio_fermentacion([
    { "Celulas Vigorosas": 5, "Celulas Muy Vigorosas": 93, Viabilidad: 98, "E.L": 3.8 }
  ])
  assert.equal(kpis.length, 11)
  assert.equal(kpis.find((tarjeta) => tarjeta.id === "vitalidad").value, "98")
  assert.equal(kpis.find((tarjeta) => tarjeta.id === "el").value, "3.8")
})

test("102. construir_kpis_inicio_fermentacion muestra '-' cuando una métrica no tiene mediciones", () => {
  const kpis = construir_kpis_inicio_fermentacion([{ Marca: "CORONA" }])
  assert.equal(kpis.find((tarjeta) => tarjeta.id === "glucosa").value, "-")
})

test("103. construir_tabla_compuestos_cinetica calcula avg, min, max y last para los 10 compuestos", () => {
  const tabla = construir_tabla_compuestos_cinetica([
    { Esteres: 30, "Diacetilo total": 200 },
    { Esteres: 40, "Diacetilo total": 100 }
  ])
  assert.equal(tabla.length, 10)
  const fila_esteres = tabla.find((compuesto) => compuesto.name === "Ésteres")
  assert.equal(fila_esteres.avg, "35.00")
  assert.equal(fila_esteres.min, "30.00")
  assert.equal(fila_esteres.max, "40.00")
  assert.equal(fila_esteres.last, "40.00")
})

test("104. construir_serie_evolucion_cinetica construye pasos F0..Fn y R0..Rn", () => {
  const serie = construir_serie_evolucion_cinetica([
    { Etapa: "Fermentación", Dias: 1, Acetaldehido: 24.5 },
    { Etapa: "Reposo", Dias: 2, Acetaldehido: 8.2 }
  ])
  assert.equal(serie.find((punto) => punto.paso === "F1").acetaldehido, 24.5)
  assert.equal(serie.find((punto) => punto.paso === "R2").acetaldehido, 8.2)
})

test("105. agrupar_estadisticas_volatiles_4v extrae series desde tabla ancha con columna TCC", () => {
  const agrupados = agrupar_estadisticas_volatiles_4v([
    { Fecha: 46214, Marca: "CORONA", Etapa: "Fermentación", Dias: 2, TCC: "108", "Diacetilo total": 310 }
  ])
  assert.equal(agrupados.length, 1)
  assert.equal(agrupados[0].tanque, "108")
  assert.equal(agrupados[0].volatil, "DIACETILO")
  assert.equal(agrupados[0].vueltas["2"], 310)
})

test("106. agrupar_estadisticas_volatiles_4v separa correctamente ISOAMILO de ISOAMILICO", () => {
  const agrupados = agrupar_estadisticas_volatiles_4v([
    { Fecha: 46214, Marca: "BL", Etapa: "Fermentación", Dias: 3, TCC: "201", "Acetato de isoamilo": 3.5, "Isoamil alcohol": 115 }
  ])
  const compuestos = agrupados.map((serie) => serie.volatil).sort()
  assert.deepEqual(compuestos, ["ISOAMILICO", "ISOAMILO"])
})

test("107. agrupar_estadisticas_volatiles_4v mapea Acetato de etilo a ETILO y Alcoholes Superiores a ALCOHOLES", () => {
  const agrupados = agrupar_estadisticas_volatiles_4v([
    { Fecha: 46214, Marca: "MICHELOB", Etapa: "Reposo", Dias: 1, TCC: "305", "Acetato de etilo": 28, "Alcoholes Superiores": 160 }
  ])
  const compuestos = agrupados.map((serie) => serie.volatil).sort()
  assert.deepEqual(compuestos, ["ALCOHOLES", "ETILO"])
})

test("108. ordenar_tanques_por_completitud prioriza el tanque con más compuestos registrados", () => {
  const datos_agrupados = [
    { tanque: "101", cepa: "CORONA", volatil: "DIACETILO" },
    { tanque: "102", cepa: "CORONA", volatil: "DIACETILO" },
    { tanque: "102", cepa: "CORONA", volatil: "ESTERES" },
    { tanque: "102", cepa: "CORONA", volatil: "PROPANOL" }
  ]
  const ordenados = ordenar_tanques_por_completitud(datos_agrupados, "CORONA", ["101", "102"])
  assert.deepEqual(ordenados, ["102", "101"])
})

test("109. ordenar_tanques_por_completitud devuelve arreglo vacío si la lista de tanques está vacía", () => {
  assert.deepEqual(ordenar_tanques_por_completitud([], "CORONA", []), [])
})

test("110. preparar_serie_comparativa_volatil alinea Tanque A y Tanques B en pasos F y R", () => {
  const datos_a = [{ volatil: "DIACETILO", etapa: "FERMENTACION", vueltas: { "1": 400, "2": 250 } }]
  const datos_b = [{ name: "109", "data": [{ volatil: "DIACETILO", etapa: "FERMENTACION", vueltas: { "1": 380, "2": 210 } }] }]
  const serie = preparar_serie_comparativa_volatil("DIACETILO", datos_a, datos_b)
  assert.equal(serie.length, 2)
  assert.equal(serie[0].vuelta, "F1")
  assert.equal(serie[0].valorA, 400)
  assert.equal(serie[0].valorB_0, 380)
})

test("111. preparar_serie_comparativa_volatil incluye F0 y R0 cuando existen mediciones en día 0", () => {
  const datos_a = [
    { volatil: "ESTERES", etapa: "FERMENTACION", vueltas: { "0": 5, "1": 15 } },
    { volatil: "ESTERES", etapa: "REPOSO", vueltas: { "0": 32, "1": 35 } }
  ]
  const serie = preparar_serie_comparativa_volatil("ESTERES", datos_a, [])
  assert.deepEqual(serie.map((punto) => punto.vuelta), ["F0", "F1", "R0", "R1"])
})

test("112. construir_serie_evolucion_cinetica amplía dinámicamente max_ferm cuando supera 7 días", () => {
  const serie = construir_serie_evolucion_cinetica([{ Etapa: "Fermentación", Dias: 10, Esteres: 41.2 }])
  assert.ok(serie.some((punto) => punto.paso === "F10" && punto.esteres === 41.2))
})
