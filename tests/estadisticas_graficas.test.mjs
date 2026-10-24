/**
 * @fileoverview Suite de 22 pruebas unitarias para funciones estadísticas gráficas:
 * generación de histogramas, curva normal, filtrado numérico, rango de ejes y regresión lineal.
 */

import test from "node:test"
import assert from "node:assert/strict"
import "./configuracion_pruebas.mjs"

const {
  generar_histograma,
  filtrar_valores_numericos,
  calcular_rango_ejes,
  calcular_regresion_lineal
} = await import("../lib/statistics/estadisticas_graficas.ts")

test("26. generar_histograma devuelve arreglos vacíos cuando la muestra está vacía", () => {
  const histograma = generar_histograma([], 0, 100, 10)
  assert.deepEqual(histograma, { bins: [], frequencies: [], curve: [] })
})

test("27. generar_histograma crea exactamente la cantidad solicitada de intervalos", () => {
  const histograma = generar_histograma([10, 20, 30, 40, 50], 0, 50, 5)
  assert.equal(histograma.bins.length, 5)
  assert.equal(histograma.frequencies.length, 5)
  assert.equal(histograma.curve.length, 5)
})

test("28. generar_histograma conserva la suma de frecuencias igual al tamaño de la muestra", () => {
  const muestra_entrada = [12, 15, 18, 22, 25, 29, 31, 35, 40, 48]
  const histograma = generar_histograma(muestra_entrada, 10, 50, 8)
  const suma_frecuencias = histograma.frequencies.reduce((acum, frec) => acum + frec, 0)
  assert.equal(suma_frecuencias, muestra_entrada.length)
})

test("29. generar_histograma agrupa valores inferiores al mínimo en el primer intervalo", () => {
  const histograma = generar_histograma([-50, 15], 0, 20, 4)
  assert.equal(histograma.frequencies[0], 1)
})

test("30. generar_histograma agrupa valores superiores al máximo en el último intervalo", () => {
  const histograma = generar_histograma([5, 500], 0, 20, 4)
  assert.equal(histograma.frequencies[3], 1)
})

test("31. generar_histograma devuelve curva en ceros cuando la desviación estándar es cero", () => {
  const histograma = generar_histograma([10, 10, 10], 5, 15, 5)
  assert.ok(histograma.curve.every((punto_curva) => punto_curva === 0))
})

test("32. generar_histograma genera valores de densidad positivos cuando hay varianza", () => {
  const histograma = generar_histograma([94, 95, 96, 97, 98], 90, 100, 5)
  assert.ok(histograma.curve.every((punto_curva) => punto_curva > 0))
})

test("33. filtrar_valores_numericos conserva números y cadenas numéricas válidas", () => {
  const depurados = filtrar_valores_numericos(10, "25.5", 0, -4)
  assert.deepEqual(depurados, [10, 25.5, 0, -4])
})

test("34. filtrar_valores_numericos descarta null, undefined, cadenas vacías y texto no numérico", () => {
  const depurados = filtrar_valores_numericos(null, undefined, "", "N/A", "texto", 42)
  assert.deepEqual(depurados, [42])
})

test("35. calcular_rango_ejes expande el rango con holgura del 20% por defecto", () => {
  const rango = calcular_rango_ejes({ min: 10, max: 20 }, [])
  assert.equal(rango.min, 8)
  assert.equal(rango.max, 22)
})

test("36. calcular_rango_ejes incorpora límites de referencia USL y LSL externos al rango observado", () => {
  const rango = calcular_rango_ejes({ min: 95, max: 98 }, [90, 100], 0.1)
  assert.equal(rango.min, 89)
  assert.equal(rango.max, 101)
})

test("37. calcular_rango_ejes maneja caso donde min y max son iguales a cero", () => {
  const rango = calcular_rango_ejes({ min: 0, max: 0 }, [])
  assert.equal(rango.min, -1)
  assert.equal(rango.max, 1)
})

test("38. calcular_rango_ejes maneja caso donde min y max son iguales y distintos de cero", () => {
  const rango = calcular_rango_ejes({ min: 50, max: 50 }, [])
  assert.equal(rango.min, 45)
  assert.equal(rango.max, 55)
})

test("39. calcular_regresion_lineal devuelve valores neutros para arreglo vacío", () => {
  const regresion = calcular_regresion_lineal([])
  assert.equal(regresion.r, 0)
  assert.equal(regresion.r2, 0)
  assert.equal(regresion.formula, "N/A")
  assert.deepEqual(regresion.trendlineData, [])
})

test("40. calcular_regresion_lineal devuelve valores neutros cuando solo hay 1 punto", () => {
  const regresion = calcular_regresion_lineal([Object.fromEntries([["x", 10], ["y", 20]])])
  assert.equal(regresion.r2, 0)
  assert.equal(regresion.formula, "N/A")
})

test("41. calcular_regresion_lineal calcula pendiente positiva perfecta y R² = 1", () => {
  const puntos_recta = [[1, 5], [2, 8], [3, 11], [4, 14]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos_recta)
  assert.ok(Math.abs(regresion.m - 3) < 1e-9)
  assert.ok(Math.abs(regresion.b - 2) < 1e-9)
  assert.ok(Math.abs(regresion.r2 - 1) < 1e-9)
  assert.equal(regresion.formula, "y = 3.0000x + 2.0000")
})

test("42. calcular_regresion_lineal calcula pendiente negativa perfecta y signo menos en fórmula", () => {
  const puntos_recta = [[1, -5], [2, -8], [3, -11]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos_recta)
  assert.ok(Math.abs(regresion.m - -3) < 1e-9)
  assert.ok(Math.abs(regresion.b - -2) < 1e-9)
  assert.ok(Math.abs(regresion.r - -1) < 1e-9)
  assert.equal(regresion.formula, "y = -3.0000x - 2.0000")
})

test("43. calcular_regresion_lineal protege contra división por cero cuando X es constante", () => {
  const puntos_verticales = [[5, 10], [5, 20], [5, 30]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos_verticales)
  assert.equal(regresion.r2, 0)
  assert.equal(regresion.formula, "N/A")
})

test("44. calcular_regresion_lineal protege contra división por cero cuando Y es constante", () => {
  const puntos_horizontales = [[1, 50], [2, 50], [3, 50]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos_horizontales)
  assert.equal(regresion.r2, 0)
  assert.equal(regresion.formula, "N/A")
})

test("45. calcular_regresion_lineal genera 2 extremos en trendlineData correspondientes a minX y maxX", () => {
  const puntos = [[2, 10], [5, 25], [10, 50]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos)
  assert.equal(regresion.trendlineData.length, 2)
  assert.equal(regresion.trendlineData[0][0], 2)
  assert.equal(regresion.trendlineData[1][0], 10)
})

test("46. calcular_regresion_lineal obtiene R² intermedio (0 < R² < 1) para dispersión con ruido", () => {
  const puntos_ruido = [[1, 2], [2, 5], [3, 4], [4, 8], [5, 7]].map(([abscisa, ordenada]) =>
    Object.fromEntries([["x", abscisa], ["y", ordenada]])
  )
  const regresion = calcular_regresion_lineal(puntos_ruido)
  assert.ok(regresion.r2 > 0.5 && regresion.r2 < 1)
})

test("47. generar_histograma utiliza 10 intervalos por defecto cuando se omite el cuarto parámetro", () => {
  const histograma = generar_histograma([1, 2, 3, 4, 5], 0, 10)
  assert.equal(histograma.bins.length, 10)
})
