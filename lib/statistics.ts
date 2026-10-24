/**
 * @fileoverview Punto de entrada unificado (barrel file) para las funciones estadísticas del proyecto.
 * Re-exporta las funciones en snake_case junto con sus alias de compatibilidad.
 */

import {
  calcular_media,
  calcular_desviacion_estandar,
  calcular_mediana,
  calcular_asimetria,
  calcular_curtosis,
  calcular_percentil,
  calcular_capacidad_proceso,
} from "./statistics/estadisticas_descriptivas"

import {
  generar_histograma,
  filtrar_valores_numericos,
  calcular_rango_ejes,
  calcular_regresion_lineal,
} from "./statistics/estadisticas_graficas"

export {
  calcular_media,
  calcular_desviacion_estandar,
  calcular_mediana,
  calcular_asimetria,
  calcular_curtosis,
  calcular_percentil,
  calcular_capacidad_proceso,
  generar_histograma,
  filtrar_valores_numericos,
  calcular_rango_ejes,
  calcular_regresion_lineal,
  calcular_media as calculateMean,
  calcular_desviacion_estandar as calculateStdDev,
  calcular_mediana as calculateMedian,
  calcular_asimetria as calculateSkewness,
  calcular_curtosis as calculateKurtosis,
  calcular_percentil as calculatePercentile,
  calcular_capacidad_proceso as calculateCpCpk,
  generar_histograma as generateHistogram,
  filtrar_valores_numericos as filterNumbers,
  calcular_rango_ejes as calculateAxisRange,
  calcular_regresion_lineal as calculateRegression,
}
