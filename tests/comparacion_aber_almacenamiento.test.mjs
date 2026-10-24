/**
 * @fileoverview Suite de 28 pruebas unitarias para Comparación de Cultivos, Validación Abber,
 * Almacenamiento Híbrido (fragmentación y compactación), Fechas de Calendario y Contratos.
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  normalizar_registros_para_comparacion,
  extraer_lotes_unicos_comparacion,
  construir_kpis_resumen_lote,
  construir_serie_cinetica_comparativa
} = await import("../lib/services/servicio_comparacion_cultivos.ts")

const {
  normalizar_registros_aber,
  obtener_base_mediciones_validas_aber,
  agrupar_desviacion_por_fecha_aber
} = await import("../lib/services/servicio_validacion_aber.ts")

const {
  compactar_registros_para_nube,
  dividir_arreglo_en_fragmentos
} = await import("../lib/services/servicio_almacenamiento_json.ts")

const {
  parsear_fecha_calendario,
  construir_mapa_fechas_disponibles
} = await import("../lib/services/servicio_fechas_calendario.ts")

const {
  es_arreglo_registros_valido,
  extraer_arreglo_desde_cuerpo
} = await import("../lib/types/contratos_dominio.ts")

test("113. normalizar_registros_para_comparacion añade fechaFormateada, tanqueVal y codigoVal", () => {
  const normalizados = normalizar_registros_para_comparacion([
    { Fecha: 45854, Tanque: "tp1", "Codigo de Cultivo": "xix", "Gen.": 1, "Tipo de Lev": "Americana" }
  ])
  assert.equal(normalizados[0].fechaFormateada, "16/07/2025")
  assert.equal(normalizados[0].tanqueVal, "TP1")
  assert.equal(normalizados[0].codigoVal, "XIX")
})

test("114. extraer_lotes_unicos_comparacion consolida filas repetidas conservando métricas positivas", () => {
  const registros = normalizar_registros_para_comparacion([
    { Fecha: 45854, Tanque: "TP1", "Codigo de Cultivo": "XIX", "Gen.": 1, "Tipo de Lev": "Americana", conteo: 32.6, viab: 0 },
    { Fecha: 45854, Tanque: "TP1", "Codigo de Cultivo": "XIX", "Gen.": 1, "Tipo de Lev": "Americana", conteo: 0, viab: 97.5 }
  ])
  const lotes = extraer_lotes_unicos_comparacion(registros, {
    generaciones: [],
    tipos_levadura: [],
    dobleteos: [],
    tanques: [],
    fechas: []
  })
  assert.equal(lotes.length, 1)
  assert.equal(lotes[0].data.conteo, 32.6)
  assert.equal(lotes[0].data.viab, 97.5)
})

test("115. construir_kpis_resumen_lote genera 4 tarjetas KPI y evalúa umbrales de viabilidad y vigor", () => {
  const kpis = construir_kpis_resumen_lote({
    data: { viab: 96.4, vigor: 91.2, conteo: 54.3, plato: 14.1 }
  })
  assert.equal(kpis.length, 4)
  assert.equal(kpis[0].status, "ok")
  assert.equal(kpis[1].status, "ok")
})

test("116. construir_kpis_resumen_lote devuelve arreglo vacío si el lote es nulo", () => {
  assert.deepEqual(construir_kpis_resumen_lote(null), [])
})

test("117. construir_serie_cinetica_comparativa alinea muestras de Cultivo A y Cultivo B", () => {
  const serie = construir_serie_cinetica_comparativa(
    [{ fechaFormateada: "16/07/2025", hora: "08:00", viab: 97, conteo: 40, vigor: 92, plato: 14 }],
    [{ fechaFormateada: "18/07/2025", hora: "10:00", viab: 98, conteo: 55, vigor: 95, plato: 13 }]
  )
  assert.equal(serie.length, 1)
  assert.equal(serie[0].viabA, 97)
  assert.equal(serie[0].viabB, 98)
})

test("118. normalizar_registros_aber calcula diferencia (conteoAber - conteoLac) automáticamente", () => {
  const normalizados = normalizar_registros_aber([
    { LINEA: "Línea 1", FECHA: 45854, Marca: "CORONA", TCC: "108", "CONTEO ABER": 52.5, "PROMEDIO DE CONTEO LAC": 50.0, "% Solidos": 72 }
  ])
  assert.equal(normalizados[0].fecha, "16/07/2025")
  assert.equal(normalizados[0].diferencia, 2.5)
  assert.equal(normalizados[0].solidosAvg, 72)
})

test("119. obtener_base_mediciones_validas_aber filtra registros con ambos conteos > 0", () => {
  const normalizados = normalizar_registros_aber([
    { linea: "L1", fecha: "16/07/2025", conteoAber: 45, conteoLac: 44 },
    { linea: "L2", fecha: "16/07/2025", conteoAber: 0, conteoLac: 44 }
  ])
  const validos = obtener_base_mediciones_validas_aber(normalizados)
  assert.equal(validos.length, 1)
  assert.equal(validos[0].linea, "L1")
})

test("120. agrupar_desviacion_por_fecha_aber separa promedios de Línea 1 y Línea 2 por fecha", () => {
  const datos = [
    { linea: "LINEA 1", fecha: "16/07/2025", marca: "CORONA", tanque: "101", conteoAber: 52, conteoLac: 50, diferencia: 2, solidosAvg: 70 },
    { linea: "LINEA 2", fecha: "16/07/2025", marca: "CORONA", tanque: "102", conteoAber: 48, conteoLac: 50, diferencia: -2, solidosAvg: 74 }
  ]
  const agrupados = agrupar_desviacion_por_fecha_aber(datos)
  assert.equal(agrupados.length, 1)
  assert.equal(agrupados[0].diffL1, 2)
  assert.equal(agrupados[0].diffL2, -2)
  assert.equal(agrupados[0].solidosL1, 70)
  assert.equal(agrupados[0].solidosL2, 74)
})

test("121. compactar_registros_para_nube elimina propiedades vacías ('', null, undefined)", () => {
  const compactados = compactar_registros_para_nube([
    { Marca: "CORONA", Vacio: "", Nulo: null, Indefinido: undefined, CeroValido: 0 }
  ])
  assert.deepEqual(compactados[0], { Marca: "CORONA", CeroValido: 0 })
})

test("122. dividir_arreglo_en_fragmentos particiona un arreglo de 1200 elementos en bloques de 500", () => {
  const lista = new Array(1200).fill(1)
  const fragmentos = dividir_arreglo_en_fragmentos(lista, 500)
  assert.equal(fragmentos.length, 3)
  assert.equal(fragmentos[0].length, 500)
  assert.equal(fragmentos[1].length, 500)
  assert.equal(fragmentos[2].length, 200)
})

test("123. dividir_arreglo_en_fragmentos devuelve [[]] cuando recibe un arreglo vacío", () => {
  assert.deepEqual(dividir_arreglo_en_fragmentos([]), [[]])
})

test("124. parsear_fecha_calendario convierte formato DD/MM/YYYY a cadena ISO YYYY-MM-DD", () => {
  const resultado = parsear_fecha_calendario("16/07/2025")
  assert.equal(resultado.isoStr, "2025-07-16")
  assert.equal(resultado.original, "16/07/2025")
})

test("125. parsear_fecha_calendario convierte formato YYYY-MM-DD conservando la fecha exacta", () => {
  const resultado = parsear_fecha_calendario("2026-10-24")
  assert.equal(resultado.isoStr, "2026-10-24")
})

test("126. parsear_fecha_calendario convierte serial numérico de Excel en cadena ISO", () => {
  const resultado = parsear_fecha_calendario("45854")
  assert.equal(resultado.isoStr, "2025-07-16")
})

test("127. construir_mapa_fechas_disponibles ignora 'N/A' y detecta la fecha más reciente", () => {
  const { mapa_fechas_disponibles, fecha_mas_reciente } = construir_mapa_fechas_disponibles([
    "16/07/2025",
    "N/A",
    "24/10/2026",
    "01/01/2026"
  ])
  assert.equal(mapa_fechas_disponibles.size, 3)
  assert.equal(fecha_mas_reciente.getFullYear(), 2026)
  assert.equal(fecha_mas_reciente.getMonth(), 9)
})

test("128. es_arreglo_registros_valido valida arreglos no vacíos y rechaza vacíos o nulos", () => {
  assert.equal(es_arreglo_registros_valido([{ tanque: "TP1" }]), true)
  assert.equal(es_arreglo_registros_valido([]), false)
  assert.equal(es_arreglo_registros_valido(null), false)
})

test("129. extraer_arreglo_desde_cuerpo desenvuelve tanto arreglos directos como objetos { data: [...] }", () => {
  const arreglo_directo = [{ tanque: "TP1" }]
  assert.deepEqual(extraer_arreglo_desde_cuerpo(arreglo_directo), arreglo_directo)
  assert.deepEqual(extraer_arreglo_desde_cuerpo({ data: arreglo_directo }), arreglo_directo)
  assert.equal(extraer_arreglo_desde_cuerpo({ sin_datos: true }), null)
})
