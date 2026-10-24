/**
 * @fileoverview Servicio de cálculo de índices de capacidad (Cp, Cpk, Pp, Ppk) y persistencia
 * de límites de especificación (LEI/LES) para la tabla de Capacidad del Proceso en Propagación.
 */

import {
  calcular_media,
  calcular_desviacion_estandar,
  calcular_capacidad_proceso
} from "@/lib/statistics"

export const CLAVE_ALMACENAMIENTO_LIMITES = "levadura_ccz_limites_capacidad_v1"

export const LIMITES_ESPECIFICACION_PROCESO: Record<string, { lsl: number; usl: number }> = {
  viab: { lsl: 95, usl: 100 },
  conteo: { lsl: 180, usl: 260 },
  vig: { lsl: 88, usl: 100 },
  ph: { lsl: 4.0, usl: 5.5 },
  plato: { lsl: 8, usl: 16 },
  solidos: { lsl: 0, usl: 0 },
  temp: { lsl: 0, usl: 0 }
}

export const FILAS_CAPACIDAD_POR_DEFECTO = [
  { id: "conteo", indicatorName: "Conteo Celular (x10^6/mL)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "viab", indicatorName: "Viabilidad (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "vig", indicatorName: "Vitalidad (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "solidos", indicatorName: "Porcentaje de Sólidos (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "plato", indicatorName: "°P en Mosto", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "temp", indicatorName: "Temperatura del Tanque (°C)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" }
]

/**
 * Lee los límites de especificación personalizados desde `localStorage` o devuelve los valores por defecto.
 *
 * @returns {Record<string, { lsl: number; usl: number }>} Mapa de límites LEI/LES por indicador.
 */
export function leer_limites_personalizados(): Record<string, { lsl: number; usl: number }> {
  if (typeof window === "undefined") return { ...LIMITES_ESPECIFICACION_PROCESO }
  try {
    const texto_guardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO_LIMITES)
    if (!texto_guardado) return { ...LIMITES_ESPECIFICACION_PROCESO }
    const objeto_guardado = JSON.parse(texto_guardado)
    return { ...LIMITES_ESPECIFICACION_PROCESO, ...objeto_guardado }
  } catch {
    return { ...LIMITES_ESPECIFICACION_PROCESO }
  }
}

/**
 * Ordena y normaliza las filas de estadísticas entrantes según el orden estándar de indicadores.
 *
 * @param {any} estadisticas_entrantes - Arreglo u objeto de estadísticas proveniente de la API o carga local.
 * @returns {any[]} Arreglo ordenado de 6 indicadores de capacidad.
 */
export function ordenar_estadisticas_capacidad(estadisticas_entrantes: any): any[] {
  const lista_entrante = Array.isArray(estadisticas_entrantes)
    ? estadisticas_entrantes
    : FILAS_CAPACIDAD_POR_DEFECTO

  const orden_deseado = ["conteo", "viab", "vig", "solidos", "plato", "temp"]
  const nombres_indicadores: Record<string, string> = {
    conteo: "Conteo Celular (x10^6/mL)",
    viab: "Viabilidad (%)",
    vig: "Vitalidad (%)",
    solidos: "Porcentaje de Sólidos (%)",
    plato: "°P en Mosto",
    temp: "Temperatura del Tanque (°C)"
  }

  const resultado_ordenado: any[] = []
  orden_deseado.forEach((identificador_actual) => {
    let fila_encontrada = lista_entrante.find(
      (item_estadistica: any) =>
        item_estadistica.id === identificador_actual ||
        (identificador_actual === "vig" && item_estadistica.id === "vigor")
    )
    if (!fila_encontrada) {
      fila_encontrada = FILAS_CAPACIDAD_POR_DEFECTO.find(
        (item_defecto) => item_defecto.id === identificador_actual
      )
    }
    if (fila_encontrada) {
      resultado_ordenado.push({
        ...fila_encontrada,
        id: identificador_actual,
        indicatorName: nombres_indicadores[identificador_actual]
      })
    }
  })

  return resultado_ordenado.length > 0 ? resultado_ordenado : FILAS_CAPACIDAD_POR_DEFECTO
}

/**
 * Recalcula dinámicamente media, mínimo, máximo, desviación estándar e índices Cp/Cpk/Pp/Ppk
 * a partir de los puntos de propagación filtrados y los límites LEI/LES activos.
 *
 * @param {any[]} filas_base - Filas de indicadores base de la tabla.
 * @param {any[]} [datos_dinamicos] - Puntos de propagación filtrados actualmente.
 * @param {Record<string, { lsl: number; usl: number }>} [mapa_limites] - Mapa de límites LEI/LES.
 * @returns {any[]} Filas de la tabla de capacidad con todas las métricas actualizadas.
 */
export function calcular_filas_tabla_capacidad(
  filas_base: any[],
  datos_dinamicos?: any[],
  mapa_limites: Record<string, { lsl: number; usl: number }> = LIMITES_ESPECIFICACION_PROCESO
) {
  const mapa_claves_datos: Record<string, string> = {
    viab: "viabilidad",
    conteo: "conteo",
    vigor: "vigorosas",
    vig: "vigorosas",
    solidos: "solidos",
    plato: "plato",
    temp: "temp"
  }

  return filas_base.map((indicador_base) => {
    let texto_minimo = "-"
    let texto_maximo = "-"
    const limites_indicador = mapa_limites[indicador_base.id] ||
      LIMITES_ESPECIFICACION_PROCESO[indicador_base.id] || { lsl: 0, usl: 0 }
    let indicador_actualizado = {
      ...indicador_base,
      lsl: limites_indicador.lsl,
      usl: limites_indicador.usl
    }

    if (datos_dinamicos && datos_dinamicos.length > 0) {
      const clave_dato = mapa_claves_datos[indicador_base.id] || ""
      if (clave_dato) {
        const valores_validos = datos_dinamicos
          .map((punto_actual) => Number(punto_actual[clave_dato]))
          .filter((valor_num) => valor_num !== undefined && !isNaN(valor_num) && valor_num !== 0)

        if (valores_validos.length > 0) {
          texto_minimo = Math.min(...valores_validos).toFixed(2)
          texto_maximo = Math.max(...valores_validos).toFixed(2)

          const valor_media = calcular_media(valores_validos)
          const desviacion_est = calcular_desviacion_estandar(valores_validos, valor_media) || 0.001

          let valor_cp = 0
          let valor_cpk = 0
          let valor_pp = 0
          let valor_ppk = 0
          let color_evaluacion = "red"

          if (limites_indicador.usl > 0 || limites_indicador.lsl > 0) {
            const resultado_cap = calcular_capacidad_proceso(
              valores_validos,
              limites_indicador.lsl,
              limites_indicador.usl,
              valor_media,
              desviacion_est
            )
            valor_cp = resultado_cap.cp
            valor_cpk = resultado_cap.cpk
            valor_pp = resultado_cap.pp
            valor_ppk = resultado_cap.ppk
            if (valor_cpk >= 1.33) color_evaluacion = "green"
            else if (valor_cpk >= 1.0) color_evaluacion = "yellow"
          }

          indicador_actualizado = {
            ...indicador_actualizado,
            media: Number(valor_media.toFixed(2)),
            standardDeviation: Number(desviacion_est.toFixed(2)),
            cp: Number(Math.max(0, valor_cp).toFixed(2)),
            cpk: Number(Math.max(0, valor_cpk).toFixed(2)),
            pp: Number(Math.max(0, valor_pp).toFixed(2)),
            ppk: Number(Math.max(0, valor_ppk).toFixed(2)),
            evaluationStatus: color_evaluacion
          }
        }
      }
    }

    return { ...indicador_actualizado, min: texto_minimo, max: texto_maximo }
  })
}
