/**
 * @fileoverview Suite de pruebas unitarias de dominio, estadística de capacidad (Cp/Cpk/Pp/Ppk),
 * regresión lineal, clasificación de compuestos volátiles 4V, fragmentación Firestore y contratos.
 */

import test from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

registerHooks({
  resolve(especificador_modulo, contexto_resolucion, siguiente_resolucion) {
    if (especificador_modulo.startsWith("@/")) {
      const ruta_absoluta = path.join(process.cwd(), `${especificador_modulo.slice(2)}.ts`)
      return siguiente_resolucion(pathToFileURL(ruta_absoluta).href, contexto_resolucion)
    }
    return siguiente_resolucion(especificador_modulo, contexto_resolucion)
  }
})

const {
  calcular_media,
  calcular_desviacion_estandar,
  calcular_mediana,
  calcular_capacidad_proceso
} = await import("../lib/statistics/estadisticas_descriptivas.ts")
const { calcular_regresion_lineal } = await import("../lib/statistics/estadisticas_graficas.ts")
const {
  normalizar_nombre_compuesto_volatil,
  procesar_lote_cinetica
} = await import("../lib/services/servicio_sincronizacion_cinetica.ts")
const {
  es_arreglo_registros_valido,
  extraer_arreglo_desde_cuerpo
} = await import("../lib/types/contratos_dominio.ts")

test("Estadística descriptiva: media, mediana y desviación estándar muestral", () => {
  const muestra_prueba = [92, 94, 96, 98, 100]
  assert.equal(calcular_media(muestra_prueba), 96)
  assert.equal(calcular_mediana(muestra_prueba), 96)
  const desviacion = calcular_desviacion_estandar(muestra_prueba)
  assert.ok(Math.abs(desviacion - Math.sqrt(10)) < 1e-6)
  assert.equal(calcular_media([]), 0)
  assert.equal(calcular_desviacion_estandar([95]), 0)
})

test("Capacidad de proceso: cálculo de Cp, Cpk, Pp, Ppk y protección ante varianza cero", () => {
  const muestra_centrada = [94, 95, 96, 95, 94, 96]
  const indices_capacidad = calcular_capacidad_proceso(muestra_centrada, 90, 100)
  assert.ok(indices_capacidad.cp > 1.5)
  assert.ok(Math.abs(indices_capacidad.cp - indices_capacidad.cpk) < 1e-6)

  const muestra_constante = [95, 95, 95]
  const indices_constantes = calcular_capacidad_proceso(muestra_constante, 90, 100)
  assert.deepEqual(indices_constantes, { cp: 0, cpk: 0, pp: 0, ppk: 0 })
})

test("Regresión lineal: cálculo exacto de pendiente, ordenada y R² = 1 en recta perfecta", () => {
  const pares_abscisa_ordenada = [
    [1, 5],
    [2, 8],
    [3, 11],
    [4, 14]
  ]
  const coordenadas_recta = pares_abscisa_ordenada.map(([abscisa, ordenada]) =>
    Object.fromEntries([
      ["x", abscisa],
      ["y", ordenada]
    ])
  )
  const resultado_regresion = calcular_regresion_lineal(coordenadas_recta)
  assert.ok(Math.abs(resultado_regresion.m - 3) < 1e-9)
  assert.ok(Math.abs(resultado_regresion.b - 2) < 1e-9)
  assert.ok(Math.abs(resultado_regresion.r2 - 1) < 1e-9)
})

test("Normalización 4V: distingue sin colisión Acetato de Isoamilo de Alcohol Isoamílico", () => {
  assert.equal(normalizar_nombre_compuesto_volatil("Acetato de Isoamilo"), "ISOAMILO")
  assert.equal(normalizar_nombre_compuesto_volatil("Alcohol Isoamílico"), "ISOAMILICO")
  assert.equal(normalizar_nombre_compuesto_volatil("Acetato de Etilo"), "ACETATO")
  assert.equal(normalizar_nombre_compuesto_volatil("Diacetilo Total"), "VDK")
  assert.equal(normalizar_nombre_compuesto_volatil("Acetaldehído"), "ACETALDEHIDO")
})

test("Sincronización Cinética: agrupa correctamente por Marca, Tanque y Compuesto sin truncar rawData", () => {
  const registros_entrada = [
    { Marca: "CORONA", Tanque: "FV01", Volatil: "Diacetilo", Dia: 1, Valor: 420 },
    { Marca: "CORONA", Tanque: "FV01", Volatil: "Diacetilo", Dia: 3, Valor: 180 },
    { Marca: "MODELO", Tanque: "FV02", Volatil: "Acetato de Isoamilo", Dia: 2, Valor: 2.4 }
  ]
  const resultado = procesar_lote_cinetica(registros_entrada)
  assert.deepEqual(resultado.marcas_detectadas, ["CORONA", "MODELO"])
  assert.equal(resultado.payload.totalRecords, 3)
  assert.equal(resultado.payload.rawData.length, 3)
  assert.equal(resultado.payload.stats4V.CORONA.FV01.VDK.length, 2)
  assert.equal(resultado.payload.stats4V.MODELO.FV02.ISOAMILO[0].valor, 2.4)
})

test("Contratos de dominio: valida arreglos y desenvuelve payloads { data: [...] }", () => {
  const lote_directo = [{ tanque: "P1", viab: 97 }]
  const lote_envuelto = { data: [{ tanque: "P2", viab: 98 }] }

  assert.equal(es_arreglo_registros_valido(lote_directo), true)
  assert.equal(es_arreglo_registros_valido([]), false)
  assert.equal(es_arreglo_registros_valido(null), false)
  assert.deepEqual(extraer_arreglo_desde_cuerpo(lote_directo), lote_directo)
  assert.deepEqual(extraer_arreglo_desde_cuerpo(lote_envuelto), lote_envuelto.data)
  assert.equal(extraer_arreglo_desde_cuerpo({ invalido: true }), null)
})
