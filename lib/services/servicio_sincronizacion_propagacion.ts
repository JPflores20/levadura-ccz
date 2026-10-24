/**
 * @fileoverview Servicio de dominio para normalizar y calcular las métricas de capacidad
 * del proceso de Propagación de Levadura al sincronizar desde Excel hacia Firebase.
 */

import { normalizar_fila_propagacion } from "@/lib/utils"

/**
 * Calcula media, desviación estándar, mínimo y máximo para una lista de valores positivos.
 * @param valores_metricas - Arreglo de valores numéricos de una variable del proceso.
 * @returns Estadísticas descriptivas redondeadas a 2 decimales.
 */
export function calcular_estadisticas_basicas(valores_metricas: number[]) {
  const valores_validos = valores_metricas.filter(
    (valor_actual) => typeof valor_actual === "number" && !isNaN(valor_actual) && valor_actual > 0
  )
  if (valores_validos.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 }

  const total_elementos = valores_validos.length
  const media_aritmetica =
    valores_validos.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / total_elementos
  const varianza_muestral =
    valores_validos.reduce(
      (acumulador, valor_actual) => acumulador + Math.pow(valor_actual - media_aritmetica, 2),
      0
    ) / (total_elementos > 1 ? total_elementos - 1 : 1)

  return {
    mean: Number(media_aritmetica.toFixed(2)),
    stdDev: Number(Math.sqrt(varianza_muestral).toFixed(2)),
    min: Math.min(...valores_validos),
    max: Math.max(...valores_validos),
  }
}

/**
 * Calcula los índices de capacidad potencial (Cp) y real (Cpk) del proceso.
 * @param estadisticas_base - Objeto con media y desviación estándar.
 * @param limite_inferior - Límite inferior de especificación (LSL).
 * @param limite_superior - Límite superior de especificación (USL).
 * @returns Objeto con los valores cp y cpk redondeados a 2 decimales.
 */
export function calcular_indices_capacidad(
  estadisticas_base: { mean: number; stdDev: number },
  limite_inferior: number,
  limite_superior: number
) {
  const { mean: media_proceso, stdDev: desviacion_proceso } = estadisticas_base
  if (desviacion_proceso === 0) return { cp: 0, cpk: 0 }

  const capacidad_potencial = (limite_superior - limite_inferior) / (6 * desviacion_proceso)
  const capacidad_superior = (limite_superior - media_proceso) / (3 * desviacion_proceso)
  const capacidad_inferior = (media_proceso - limite_inferior) / (3 * desviacion_proceso)

  return {
    cp: Number(capacidad_potencial.toFixed(2)),
    cpk: Number(Math.min(capacidad_superior, capacidad_inferior).toFixed(2)),
  }
}

/**
 * Procesa el arreglo crudo de propagación recibido desde Excel y genera el documento final
 * listo para persistir en Firebase y en el respaldo local.
 * @param registros_crudos_propagacion - Filas enviadas por el script de Excel.
 * @returns Objeto estructurado con estadísticas de capacidad y registros normalizados.
 */
export function procesar_lote_propagacion(registros_crudos_propagacion: Record<string, any>[]) {
  const registros_normalizados = registros_crudos_propagacion.map((fila_cruda) =>
    normalizar_fila_propagacion(fila_cruda)
  )

  const estadisticas_conteo = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.conteo))
  )
  const estadisticas_viabilidad = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.viab))
  )
  const estadisticas_vitalidad = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.vig))
  )
  const estadisticas_solidos = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.solidos))
  )
  const estadisticas_plato = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.plato))
  )
  const estadisticas_temperatura = calcular_estadisticas_basicas(
    registros_normalizados.map((fila_actual) => Number(fila_actual.temp))
  )

  return {
    lastUpdated: new Date().toISOString(),
    totalRecords: registros_normalizados.length,
    stats: {
      conteo: { ...estadisticas_conteo, ...calcular_indices_capacidad(estadisticas_conteo, 50, 120) },
      viabilidad: { ...estadisticas_viabilidad, ...calcular_indices_capacidad(estadisticas_viabilidad, 95, 100) },
      vitalidad: { ...estadisticas_vitalidad, ...calcular_indices_capacidad(estadisticas_vitalidad, 90, 100) },
      solidos: { ...estadisticas_solidos, ...calcular_indices_capacidad(estadisticas_solidos, 60, 80) },
      plato: { ...estadisticas_plato, ...calcular_indices_capacidad(estadisticas_plato, 10, 18) },
      temp: { ...estadisticas_temperatura, ...calcular_indices_capacidad(estadisticas_temperatura, 10, 16) },
    },
    rawData: registros_normalizados,
  }
}
