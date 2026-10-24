/**
 * @fileoverview Suite de 25 pruebas unitarias para estadística descriptiva (media, mediana,
 * desviación estándar muestral) e índices de capacidad de proceso (Cp, Cpk, Pp, Ppk).
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  calcular_media,
  calcular_desviacion_estandar,
  calcular_mediana,
  calcular_capacidad_proceso
} = await import("../lib/statistics/estadisticas_descriptivas.ts")

test("1. calcular_media devuelve 0 para arreglo vacío", () => {
  assert.equal(calcular_media([]), 0)
})

test("2. calcular_media devuelve el mismo valor para un único elemento", () => {
  assert.equal(calcular_media([97.5]), 97.5)
})

test("3. calcular_media calcula promedio exacto de enteros positivos", () => {
  assert.equal(calcular_media([92, 94, 96, 98, 100]), 96)
})

test("4. calcular_media maneja números negativos y positivos simétricos", () => {
  assert.equal(calcular_media([-20, -10, 0, 10, 20]), 0)
})

test("5. calcular_media mantiene precisión con números decimales de proceso", () => {
  const resultado_media = calcular_media([14.2, 14.4, 14.6, 14.8])
  assert.ok(Math.abs(resultado_media - 14.5) < 1e-9)
})

test("6. calcular_media procesa lotes grandes de 1000 mediciones constantes", () => {
  const lote_grande = new Array(1000).fill(96.8)
  assert.ok(Math.abs(calcular_media(lote_grande) - 96.8) < 1e-9)
})

test("7. calcular_mediana devuelve 0 para arreglo vacío", () => {
  assert.equal(calcular_mediana([]), 0)
})

test("8. calcular_mediana devuelve el único elemento cuando hay 1 registro", () => {
  assert.equal(calcular_mediana([42.3]), 42.3)
})

test("9. calcular_mediana identifica el valor central en arreglo impar ordenado", () => {
  assert.equal(calcular_mediana([10, 20, 30, 40, 50]), 30)
})

test("10. calcular_mediana ordena internamente un arreglo impar desordenado", () => {
  assert.equal(calcular_mediana([99, 91, 95, 97, 93]), 95)
})

test("11. calcular_mediana promedia los dos valores centrales en arreglo par", () => {
  assert.equal(calcular_mediana([10, 20, 30, 40]), 25)
})

test("12. calcular_mediana no muta el arreglo original recibido por parámetro", () => {
  const muestra_original = [30, 10, 20]
  calcular_mediana(muestra_original)
  assert.deepEqual(muestra_original, [30, 10, 20])
})

test("13. calcular_mediana es resistente a valores atípicos extremos", () => {
  assert.equal(calcular_mediana([95, 96, 97, 98, 5000]), 97)
})

test("14. calcular_desviacion_estandar devuelve 0 para arreglo vacío", () => {
  assert.equal(calcular_desviacion_estandar([]), 0)
})

test("15. calcular_desviacion_estandar devuelve 0 para un solo elemento (n=1)", () => {
  assert.equal(calcular_desviacion_estandar([96]), 0)
})

test("16. calcular_desviacion_estandar devuelve 0 cuando todos los valores son idénticos", () => {
  assert.equal(calcular_desviacion_estandar([95, 95, 95, 95]), 0)
})

test("17. calcular_desviacion_estandar calcula varianza muestral (n-1) exacta", () => {
  const desviacion = calcular_desviacion_estandar([92, 94, 96, 98, 100])
  assert.ok(Math.abs(desviacion - Math.sqrt(10)) < 1e-9)
})

test("18. calcular_desviacion_estandar acepta media precalculada como segundo parámetro", () => {
  const muestra_datos = [2, 4, 6, 8]
  const desviacion = calcular_desviacion_estandar(muestra_datos, 5)
  assert.ok(Math.abs(desviacion - Math.sqrt(20 / 3)) < 1e-9)
})

test("19. calcular_capacidad_proceso devuelve ceros cuando la desviación es 0", () => {
  const capacidad = calcular_capacidad_proceso([95, 95, 95], 90, 100)
  assert.deepEqual(capacidad, { cp: 0, cpk: 0, pp: 0, ppk: 0 })
})

test("20. calcular_capacidad_proceso devuelve ceros para arreglo vacío", () => {
  const capacidad = calcular_capacidad_proceso([], 90, 100)
  assert.deepEqual(capacidad, { cp: 0, cpk: 0, pp: 0, ppk: 0 })
})

test("21. calcular_capacidad_proceso iguala Cp y Cpk cuando el proceso está perfectamente centrado", () => {
  const muestra_centrada = [94, 95, 96, 95, 94, 96]
  const capacidad = calcular_capacidad_proceso(muestra_centrada, 90, 100)
  assert.ok(Math.abs(capacidad.cp - capacidad.cpk) < 1e-6)
  assert.ok(capacidad.cp > 1.8)
})

test("22. calcular_capacidad_proceso reduce Cpk respecto a Cp cuando la media se desplaza hacia LES", () => {
  const muestra_descentrada = [98, 99, 98.5, 99.2, 98.8]
  const capacidad = calcular_capacidad_proceso(muestra_descentrada, 90, 100)
  assert.ok(capacidad.cp > capacidad.cpk)
})

test("23. calcular_capacidad_proceso reduce Cpk cuando la media se desplaza hacia LEI", () => {
  const muestra_baja = [90.5, 91.0, 90.8, 91.2, 90.6]
  const capacidad = calcular_capacidad_proceso(muestra_baja, 90, 100)
  assert.ok(capacidad.cp > capacidad.cpk)
})

test("24. calcular_capacidad_proceso arroja Cpk negativo cuando la media supera el límite superior", () => {
  const muestra_fuera = [102, 103, 104, 103, 102]
  const capacidad = calcular_capacidad_proceso(muestra_fuera, 90, 100)
  assert.ok(capacidad.cpk < 0)
})

test("25. calcular_capacidad_proceso respeta media y desviación pasadas explícitamente", () => {
  const capacidad = calcular_capacidad_proceso([95, 96], 90, 102, 96, 1)
  assert.equal(capacidad.cp, 2)
  assert.equal(capacidad.cpk, 2)
})
