/**
 * @fileoverview Suite de 24 pruebas unitarias para los servicios del dominio de Propagación:
 * `servicio_sincronizacion_propagacion`, `servicio_propagacion_panel` y `servicio_tabla_capacidad`.
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  calcular_estadisticas_basicas,
  calcular_indices_capacidad,
  procesar_lote_propagacion
} = await import("../lib/services/servicio_sincronizacion_propagacion.ts")

const {
  extraer_opciones_filtro_propagacion,
  construir_puntos_propagacion_filtrados,
  calcular_tarjetas_kpi_propagacion
} = await import("../lib/services/servicio_propagacion_panel.ts")

const {
  ordenar_estadisticas_capacidad,
  calcular_filas_tabla_capacidad,
  FILAS_CAPACIDAD_POR_DEFECTO
} = await import("../lib/services/servicio_tabla_capacidad.ts")

test("73. calcular_estadisticas_basicas ignora ceros, negativos y NaN", () => {
  const stats = calcular_estadisticas_basicas([0, -5, NaN, 96, 98, 100])
  assert.equal(stats.mean, 98)
  assert.equal(stats.min, 96)
  assert.equal(stats.max, 100)
  assert.equal(stats.stdDev, 2)
})

test("74. calcular_estadisticas_basicas devuelve todo en 0 cuando no hay valores positivos", () => {
  assert.deepEqual(calcular_estadisticas_basicas([0, 0, -1]), { mean: 0, stdDev: 0, min: 0, max: 0 })
})

test("75. calcular_indices_capacidad devuelve cp=0 y cpk=0 cuando stdDev es 0", () => {
  assert.deepEqual(calcular_indices_capacidad({ mean: 97, stdDev: 0 }, 95, 100), { cp: 0, cpk: 0 })
})

test("76. calcular_indices_capacidad calcula Cp y Cpk redondeados a 2 decimales", () => {
  const indices = calcular_indices_capacidad({ mean: 97.5, stdDev: 0.5 }, 95, 100)
  assert.equal(indices.cp, 1.67)
  assert.equal(indices.cpk, 1.67)
})

test("77. procesar_lote_propagacion conserva más de 500 registros sin truncar rawData", () => {
  const lote_600 = Array.from({ length: 600 }, (_, indice_fila) => ({
    Fecha: 45854,
    Tanque: `TP${(indice_fila % 5) + 1}`,
    "Tipo de Lev": "Americana",
    "Gen.": "1",
    conteo: 60 + (indice_fila % 20),
    viab: 97
  }))
  const paquete = procesar_lote_propagacion(lote_600)
  assert.equal(paquete.totalRecords, 600)
  assert.equal(paquete.rawData.length, 600)
})

test("78. procesar_lote_propagacion calcula estadísticas de los 6 indicadores clave", () => {
  const paquete = procesar_lote_propagacion([
    { Fecha: 45854, conteo: 80, viab: 98, vigor: 95, solidos: 70, plato: 14, "temp": 12 },
    { Fecha: 45855, conteo: 90, viab: 96, vigor: 93, solidos: 72, plato: 15, "temp": 13 }
  ])
  assert.equal(paquete.stats.conteo.mean, 85)
  assert.equal(paquete.stats.viabilidad.mean, 97)
  assert.equal(paquete.stats.vitalidad.mean, 94)
  assert.equal(paquete.stats.solidos.mean, 71)
  assert.equal(paquete.stats.plato.mean, 14.5)
  assert.equal(paquete.stats.temp.mean, 12.5)
})

test("79. extraer_opciones_filtro_propagacion excluye valores N/A, UNDEFINED y GENERAL en tipoLev", () => {
  const opciones = extraer_opciones_filtro_propagacion([
    { generacion: "2", tipoLev: "MODELO", dobleteo: "Despues", tanque: "TP2", fecha: "18/07/2025" },
    { generacion: "1", tipoLev: "GENERAL", dobleteo: "N/A", tanque: "TP1", fecha: "16/07/2025" }
  ])
  assert.deepEqual(opciones.generaciones_unicas, ["1", "2"])
  assert.deepEqual(opciones.tipos_unicos, ["MODELO"])
  assert.deepEqual(opciones.dobleteos_unicos, ["Despues"])
  assert.deepEqual(opciones.tanques_unicos, ["TP1", "TP2"])
  assert.equal(opciones.fechas_unicas.length, 2)
})

test("80. construir_puntos_propagacion_filtrados devuelve todos los puntos cuando no hay filtros", () => {
  const puntos = construir_puntos_propagacion_filtrados(
    [
      { tanque: "TP1", generacion: "1", tipoLev: "MODELO", dobleteo: "Antes", fecha: "16/07/2025", conteo: 40 },
      { tanque: "TP2", generacion: "2", tipoLev: "AMERICANA", dobleteo: "Despues", fecha: "17/07/2025", conteo: 50 }
    ],
    { generaciones: [], tipos_levadura: [], dobleteos: [], tanques: [], fechas: [] }
  )
  assert.equal(puntos.length, 2)
  assert.equal(puntos[0].hora, "0h")
  assert.equal(puntos[1].hora, "2h")
})

test("81. construir_puntos_propagacion_filtrados filtra por generación, cepa, dobleteo, tanque y fecha", () => {
  const registros = [
    { tanque: "TP1", generacion: "1", tipoLev: "MODELO", dobleteo: "Antes", fecha: "16/07/2025", conteo: 40 },
    { tanque: "TP2", generacion: "2", tipoLev: "AMERICANA", dobleteo: "Despues", fecha: "17/07/2025", conteo: 50 }
  ]
  const filtrados = construir_puntos_propagacion_filtrados(registros, {
    generaciones: ["2"],
    tipos_levadura: ["AMERICANA"],
    dobleteos: ["Despues"],
    tanques: ["TP2"],
    fechas: ["17/07/2025"]
  })
  assert.equal(filtrados.length, 1)
  assert.equal(filtrados[0].tanque, "TP2")
})

test("82. calcular_tarjetas_kpi_propagacion formatea la tarjeta de vitalidad como Vig-MuyVig-Deb-Muer", () => {
  const tarjetas = calcular_tarjetas_kpi_propagacion([
    { vigorosas: 96, vigorosasSolo: 4, muyVigorosas: 92, debiles: 3, muertas: 1 }
  ])
  const kpi_vitalidad = tarjetas.find((kpi_actual) => kpi_actual.id === "vitalidad")
  assert.equal(kpi_vitalidad.value, "4-92-3-1")
  assert.equal(kpi_vitalidad.status, "ok")
})

test("83. calcular_tarjetas_kpi_propagacion muestra '0-0-0-0' en vitalidad cuando no hay mediciones > 0", () => {
  const tarjetas = calcular_tarjetas_kpi_propagacion([{ vigorosas: 0, conteo: 45 }])
  const kpi_vitalidad = tarjetas.find((kpi_actual) => kpi_actual.id === "vitalidad")
  assert.equal(kpi_vitalidad.value, "0-0-0-0")
})

test("84. calcular_tarjetas_kpi_propagacion evalúa estado 'ok' cuando viabilidad >= 95 y conteo en [50, 120]", () => {
  const tarjetas = calcular_tarjetas_kpi_propagacion([{ viabilidad: 97.5, conteo: 85 }])
  assert.equal(tarjetas.find((kpi_actual) => kpi_actual.id === "viabilidad").status, "ok")
  assert.equal(tarjetas.find((kpi_actual) => kpi_actual.id === "conteo").status, "ok")
})

test("85. calcular_tarjetas_kpi_propagacion evalúa estado 'marginal' cuando viabilidad < 95", () => {
  const tarjetas = calcular_tarjetas_kpi_propagacion([{ viabilidad: 91.0, conteo: 30 }])
  assert.equal(tarjetas.find((kpi_actual) => kpi_actual.id === "viabilidad").status, "marginal")
  assert.equal(tarjetas.find((kpi_actual) => kpi_actual.id === "conteo").status, "marginal")
})

test("86. ordenar_estadisticas_capacidad devuelve las 6 filas en el orden estándar", () => {
  const ordenadas = ordenar_estadisticas_capacidad([{ id: "viab", media: 97 }])
  assert.deepEqual(
    ordenadas.map((fila_cap) => fila_cap.id),
    ["conteo", "viab", "vig", "solidos", "plato", "temp"]
  )
})

test("87. ordenar_estadisticas_capacidad mapea el alias 'vigor' hacia el indicador 'vig'", () => {
  const ordenadas = ordenar_estadisticas_capacidad([{ id: "vigor", media: 94.5 }])
  const fila_vig = ordenadas.find((fila_cap) => fila_cap.id === "vig")
  assert.equal(fila_vig.media, 94.5)
})

test("88. calcular_filas_tabla_capacidad recalcula min, max, media, Cp y Cpk con límites personalizados", () => {
  const puntos = [
    { viabilidad: 96, conteo: 200 },
    { viabilidad: 98, conteo: 220 },
    { viabilidad: 97, conteo: 210 }
  ]
  const resultado = calcular_filas_tabla_capacidad(FILAS_CAPACIDAD_POR_DEFECTO, puntos, {
    viab: { lsl: 94, usl: 100 },
    conteo: { lsl: 180, usl: 240 }
  })
  const fila_viab = resultado.find((fila_cap) => fila_cap.id === "viab")
  assert.equal(fila_viab.min, "96.00")
  assert.equal(fila_viab.max, "98.00")
  assert.equal(fila_viab.media, 97)
  assert.equal(fila_viab.evaluationStatus, "yellow")
})
