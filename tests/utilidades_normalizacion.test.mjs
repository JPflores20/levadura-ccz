/**
 * @fileoverview Suite de 25 pruebas unitarias para utilidades transversales (`lib/utils.ts`):
 * combinación de clases CSS, fechas seriales de Excel, parseo numérico y normalización de propagación.
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  combinar_clases_css,
  formatear_fecha_excel,
  parsear_valor_numerico,
  normalizar_fila_propagacion
} = await import("../lib/utils.ts")

test("48. combinar_clases_css une clases simples de Tailwind", () => {
  assert.equal(combinar_clases_css("bg-black", "text-white"), "bg-black text-white")
})

test("49. combinar_clases_css resuelve conflictos de especificidad Tailwind conservando la última", () => {
  assert.equal(combinar_clases_css("p-2", "p-4"), "p-4")
})

test("50. combinar_clases_css ignora valores falsos o nulos", () => {
  assert.equal(combinar_clases_css("flex", false && "hidden", null, undefined, "gap-2"), "flex gap-2")
})

test("51. formatear_fecha_excel devuelve N/A para null, undefined o cadena vacía", () => {
  assert.equal(formatear_fecha_excel(null), "N/A")
  assert.equal(formatear_fecha_excel(undefined), "N/A")
  assert.equal(formatear_fecha_excel(""), "N/A")
})

test("52. formatear_fecha_excel devuelve N/A para textos 'N/A' o 'undefined'", () => {
  assert.equal(formatear_fecha_excel("n/a"), "N/A")
  assert.equal(formatear_fecha_excel("UNDEFINED"), "N/A")
})

test("53. formatear_fecha_excel convierte serial de Excel 45854 a 16/07/2025", () => {
  assert.equal(formatear_fecha_excel(45854), "16/07/2025")
})

test("54. formatear_fecha_excel convierte serial de Excel pasado como string '45856' a 18/07/2025", () => {
  assert.equal(formatear_fecha_excel("45856"), "18/07/2025")
})

test("55. formatear_fecha_excel respeta una fecha ya formateada como DD/MM/YYYY", () => {
  assert.equal(formatear_fecha_excel("24/10/2026"), "24/10/2026")
})

test("56. parsear_valor_numerico devuelve 0 para null, undefined y cadena vacía", () => {
  assert.equal(parsear_valor_numerico(null), 0)
  assert.equal(parsear_valor_numerico(undefined), 0)
  assert.equal(parsear_valor_numerico(""), 0)
})

test("57. parsear_valor_numerico devuelve 0 para 'N/A', '-' y NaN", () => {
  assert.equal(parsear_valor_numerico("N/A"), 0)
  assert.equal(parsear_valor_numerico("-"), 0)
  assert.equal(parsear_valor_numerico(NaN), 0)
})

test("58. parsear_valor_numerico convierte decimales con coma ('16,4') a flotante 16.4", () => {
  assert.equal(parsear_valor_numerico("16,4"), 16.4)
})

test("59. parsear_valor_numerico conserva números negativos y flotantes directos", () => {
  assert.equal(parsear_valor_numerico(-3.5), -3.5)
  assert.equal(parsear_valor_numerico(98.75), 98.75)
})

test("60. normalizar_fila_propagacion devuelve objeto vacío si recibe null o tipo primitivo", () => {
  assert.deepEqual(normalizar_fila_propagacion(null), {})
})

test("61. normalizar_fila_propagacion convierte fracción horaria de Excel 0.5 a '12:00'", () => {
  const fila = normalizar_fila_propagacion({ "Hora Inicio": 0.5 })
  assert.equal(fila.hora, "12:00")
})

test("62. normalizar_fila_propagacion convierte fracción horaria 0.5013888888888889 a '12:02'", () => {
  const fila = normalizar_fila_propagacion({ "Hora Inicio": 0.5013888888888889 })
  assert.equal(fila.hora, "12:02")
})

test("63. normalizar_fila_propagacion preserva hora en texto cuando ya viene en formato HH:MM", () => {
  const fila = normalizar_fila_propagacion({ hora: "08:45" })
  assert.equal(fila.hora, "08:45")
})

test("64. normalizar_fila_propagacion estandariza Dobleteo ('ANTES' -> 'Antes', 'DESPUÉS' -> 'Despues')", () => {
  assert.equal(normalizar_fila_propagacion({ Dobleteo: "ANTES" }).dobleteo, "Antes")
  assert.equal(normalizar_fila_propagacion({ Dobleteo: "DESPUÉS" }).dobleteo, "Despues")
  assert.equal(normalizar_fila_propagacion({ Dobleteo: "Calberg" }).dobleteo, "Calberg")
})

test("65. normalizar_fila_propagacion limpia espacios múltiples y pasa a mayúsculas el Tanque", () => {
  const fila = normalizar_fila_propagacion({ Tanque: "  tcc   16  " })
  assert.equal(fila.tanque, "TCC 16")
})

test("66. normalizar_fila_propagacion suma Vitalidad muy vigorosas + vigorosas cuando ambas existen", () => {
  const fila = normalizar_fila_propagacion({
    "Vitalidad ( muy vigososas )": 94.2,
    "Vitalidad ( Vigorosas)": 3.8
  })
  assert.equal(fila.vigor, 98)
  assert.equal(fila.vig, 98)
})

test("67. normalizar_fila_propagacion usa vigor precalculado cuando no vienen columnas desglosadas", () => {
  const fila = normalizar_fila_propagacion({ vigor: 95.5 })
  assert.equal(fila.vigor, 95.5)
  assert.equal(fila.muyVigorosas, 95.5)
})

test("68. normalizar_fila_propagacion corrige escala de conteo cuando supera 1000 (dividiendo entre 1000)", () => {
  const fila = normalizar_fila_propagacion({ "Conteo de Celulas x106 (Cel/mL)": 45600 })
  assert.equal(fila.conteo, 45.6)
})

test("69. normalizar_fila_propagacion conserva conteo normal menor o igual a 1000", () => {
  const fila = normalizar_fila_propagacion({ conteo: 68.4 })
  assert.equal(fila.conteo, 68.4)
})

test("70. normalizar_fila_propagacion usa Temp del mosto frío como respaldo si Temp en Tanque es N/A", () => {
  const fila = normalizar_fila_propagacion({
    "Temp.en Tanque (°C)": "N/A",
    "Temp del mosto frio (°C)": 13.4
  })
  assert.equal(fila.temp, 13.4)
})

test("71. normalizar_fila_propagacion usa Presion de Aire como respaldo si Presion en Tanque es 0", () => {
  const fila = normalizar_fila_propagacion({
    "Presion en Tanque (Bar)": 0,
    "Presion de Aire ( Bar)": 0.5
  })
  assert.equal(fila.presion, 0.5)
})

test("72. normalizar_fila_propagacion asigna viab = 0 cuando Viabilidad % es 'N/A' sin descartar la fila", () => {
  const fila = normalizar_fila_propagacion({
    Fecha: 45854,
    Tanque: "TP1",
    "Viabilidad %": "N/A",
    "Conteo de Celulas x106 (Cel/mL)": 32.6
  })
  assert.equal(fila.fecha, "16/07/2025")
  assert.equal(fila.viab, 0)
  assert.equal(fila.conteo, 32.6)
})
