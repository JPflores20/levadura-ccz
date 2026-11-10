/**
 * @fileoverview Servicio de preparación de datos, filtros y cálculo de tarjetas KPI para la
 * pestaña de Propagación de Levadura.
 */

import { indicadores_kpi_propagacion, type Kpi } from "@/lib/mock_data"
import { comparar_generaciones_cultivo } from "@/lib/utils"

export interface FiltrosPropagacionActivos {
  generaciones: string[]
  tipos_levadura: string[]
  dobleteos: string[]
  tanques: string[]
  fechas: string[]
}

/**
 * Extrae las listas únicas y ordenadas de opciones para los selectores de filtro de propagación.
 * @param registros_normalizados - Arreglo de registros de propagación ya normalizados.
 * @returns Opciones únicas para generación, tipo de levadura, dobleteo, tanque y fecha.
 */
export function extraer_opciones_filtro_propagacion(
  registros_normalizados: Record<string, any>[],
  tipos_seleccionados: string[] = [],
  generaciones_seleccionadas: string[] = []
) {
  const es_valor_valido = (texto_evaluado: string) =>
    Boolean(texto_evaluado && texto_evaluado !== "N/A" && texto_evaluado !== "UNDEFINED")
  const extraer_unicos = (fuente: Record<string, any>[], selector: (fila: Record<string, any>) => string) =>
    Array.from(new Set(fuente.map(selector))).filter(es_valor_valido)

  const tipos_unicos = extraer_unicos(registros_normalizados, (fila) => fila.tipoLev?.toString().trim().toUpperCase())
    .filter((tipo_actual) => tipo_actual !== "GENERAL").sort()

  const base_por_tipo = tipos_seleccionados.length > 0
    ? registros_normalizados.filter((fila) => tipos_seleccionados.includes(fila.tipoLev?.toString().trim().toUpperCase()))
    : registros_normalizados

  const generaciones_unicas = extraer_unicos(base_por_tipo, (fila) => fila.generacion?.toString().trim())
    .sort(comparar_generaciones_cultivo)

  const base_cascada = generaciones_seleccionadas.length > 0
    ? base_por_tipo.filter((fila) => generaciones_seleccionadas.includes(fila.generacion?.toString().trim()))
    : base_por_tipo

  return {
    generaciones_unicas,
    tipos_unicos,
    dobleteos_unicos: extraer_unicos(base_cascada, (fila) => fila.dobleteo?.toString().trim()).sort(),
    tanques_unicos: extraer_unicos(base_cascada, (fila) => fila.tanque?.toString().trim().toUpperCase()).sort(),
    fechas_unicas: extraer_unicos(base_cascada, (fila) => fila.fecha?.toString().trim()),
  }
}

/**
 * Filtra los registros de propagación según los filtros seleccionados y construye los puntos para las gráficas.
 * @param registros_normalizados - Todos los registros de propagación disponibles.
 * @param filtros_activos - Filtros seleccionados por el usuario.
 * @returns Arreglo de puntos de propagación listos para graficar y promediar.
 */
export function construir_puntos_propagacion_filtrados(
  registros_normalizados: Record<string, any>[],
  filtros_activos: FiltrosPropagacionActivos
) {
  const tiene_algun_filtro =
    filtros_activos.generaciones.length > 0 ||
    filtros_activos.tipos_levadura.length > 0 ||
    filtros_activos.dobleteos.length > 0 ||
    filtros_activos.tanques.length > 0 ||
    filtros_activos.fechas.length > 0

  const registros_filtrados = !tiene_algun_filtro
    ? registros_normalizados
    : registros_normalizados.filter((fila_actual) => {
        const gen_fila = fila_actual.generacion?.toString().trim()
        const tipo_fila = fila_actual.tipoLev?.toString().trim().toUpperCase()
        const dobleteo_fila = fila_actual.dobleteo?.toString().trim()
        const tanque_fila = fila_actual.tanque?.toString().trim().toUpperCase()
        const fecha_fila = fila_actual.fecha?.toString().trim()

        if (filtros_activos.generaciones.length > 0 && !filtros_activos.generaciones.includes(gen_fila)) return false
        if (filtros_activos.tipos_levadura.length > 0 && !filtros_activos.tipos_levadura.includes(tipo_fila)) return false
        if (filtros_activos.dobleteos.length > 0 && !filtros_activos.dobleteos.includes(dobleteo_fila)) return false
        if (filtros_activos.tanques.length > 0 && !filtros_activos.tanques.includes(tanque_fila)) return false
        if (filtros_activos.fechas.length > 0 && !filtros_activos.fechas.includes(fecha_fila)) return false
        return true
      })

  return registros_filtrados.map((fila_actual, indice_muestra) => ({
    hora: `${indice_muestra * 2}h`,
    tanque: fila_actual.tanque,
    fecha: fila_actual.fecha,
    tipoLev: fila_actual.tipoLev,
    generacion: fila_actual.generacion,
    dobleteo: fila_actual.dobleteo,
    viabilidad: fila_actual.viab || 0,
    vigorosas: fila_actual.vigor || 0,
    muyVigorosas: fila_actual.muyVigorosas || 0,
    vigorosasSolo: fila_actual.vigorosasSolo || 0,
    conteo: fila_actual.conteo || 0,
    plato: fila_actual.plato || 0,
    solidos: fila_actual.solidos || 0,
    ph: fila_actual.ph || 0,
    temp: fila_actual.temp || 0,
    debiles: fila_actual.debiles || 0,
    muertas: fila_actual.muertas || 0,
    escalamiento: fila_actual.escalamiento || 0,
    presion: fila_actual.presion || 0,
    purga: fila_actual.purga || 0,
    aireacion: fila_actual.aireacion || 0,
    zn: fila_actual.zn || 0,
    atemperacion: fila_actual.atemperacion || 0,
  }))
}

/**
 * Calcula los valores dinámicos y el semáforo de estado para las 12 tarjetas KPI de Propagación.
 * @param puntos_propagacion - Puntos de propagación filtrados.
 * @returns Arreglo de objetos KPI actualizados.
 */
export function calcular_tarjetas_kpi_propagacion(puntos_propagacion: Record<string, any>[]): Kpi[] {
  const calcular_promedio_clave = (clave_buscada: string) => {
    const valores_positivos = puntos_propagacion
      .map((punto_actual) => punto_actual[clave_buscada])
      .filter((valor_numerico) => valor_numerico !== undefined && !isNaN(valor_numerico) && valor_numerico > 0)
    if (valores_positivos.length === 0) return null
    return valores_positivos.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_positivos.length
  }

  const mapa_claves_kpi: Record<string, string> = {
    conteo: "conteo",
    viabilidad: "viabilidad",
    plato: "solidos",
    plato_2: "plato",
    ph: "ph",
    aireacion: "aireacion",
    zn: "zn",
    temp: "temp",
    solidos: "solidos",
    escalamiento: "escalamiento",
    presion: "presion",
    purga: "purga",
    atemperacion: "atemperacion",
  }

  return indicadores_kpi_propagacion.map((tarjeta_base) => {
    let valor_formateado: string | number = tarjeta_base.value
    let estado_evaluado: "ok" | "marginal" | "fuera" = tarjeta_base.status

    if (tarjeta_base.id === "vitalidad") {
      const filas_con_vitalidad = puntos_propagacion.filter((punto_actual) => punto_actual.vigorosas > 0)
      if (filas_con_vitalidad.length > 0) {
        const total_filas = filas_con_vitalidad.length
        const prom_vig = filas_con_vitalidad.reduce((acum, fila) => acum + (fila.vigorosasSolo || 0), 0) / total_filas
        const prom_muy_vig = filas_con_vitalidad.reduce((acum, fila) => acum + (fila.muyVigorosas || 0), 0) / total_filas
        const prom_debiles = filas_con_vitalidad.reduce((acum, fila) => acum + (fila.debiles || 0), 0) / total_filas
        const prom_muertas = filas_con_vitalidad.reduce((acum, fila) => acum + (fila.muertas || 0), 0) / total_filas
        valor_formateado = `${Math.round(prom_vig)}-${Math.round(prom_muy_vig)}-${Math.round(prom_debiles)}-${Math.round(prom_muertas)}`
        estado_evaluado = prom_vig + prom_muy_vig >= 90 ? "ok" : "marginal"
      } else {
        valor_formateado = "0-0-0-0"
      }
    } else {
      const clave_propiedad = mapa_claves_kpi[tarjeta_base.id] || ""
      const valor_promedio = calcular_promedio_clave(clave_propiedad) ?? 0
      valor_formateado =
        tarjeta_base.id === "escalamiento" || tarjeta_base.id === "purga"
          ? valor_promedio > 0 ? valor_promedio.toFixed(0) : "0.00"
          : valor_promedio.toFixed(2)

      if (valor_promedio > 0) {
        if (tarjeta_base.id === "conteo") estado_evaluado = valor_promedio >= 50 && valor_promedio <= 120 ? "ok" : "marginal"
        if (tarjeta_base.id === "viabilidad") estado_evaluado = valor_promedio >= 95 ? "ok" : "marginal"
        if (tarjeta_base.id === "plato") estado_evaluado = valor_promedio >= 60 && valor_promedio <= 80 ? "ok" : "marginal"
        if (tarjeta_base.id === "temp") estado_evaluado = valor_promedio >= 10 && valor_promedio <= 16 ? "ok" : "marginal"
        if (tarjeta_base.id === "plato_2") estado_evaluado = valor_promedio >= 10 && valor_promedio <= 18 ? "ok" : "marginal"
        if (tarjeta_base.id === "ph") estado_evaluado = valor_promedio >= 4.0 && valor_promedio <= 5.6 ? "ok" : "marginal"
      }
    }

    return { ...tarjeta_base, value: valor_formateado, status: estado_evaluado }
  })
}
