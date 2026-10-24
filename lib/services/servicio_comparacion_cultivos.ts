/**
 * @fileoverview Servicio de dominio para normalización, agrupación de lotes y construcción
 * de series temporales comparativas entre Cultivo A y Cultivo B.
 */

import { Activity, Droplets, Gauge, Percent } from "lucide-react"
import { formatear_fecha_excel, normalizar_fila_propagacion } from "@/lib/utils"

export interface FiltrosComparacionCultivos {
  generaciones: string[]
  tipos_levadura: string[]
  dobleteos: string[]
  tanques: string[]
  fechas: string[]
}

/**
 * Normaliza cada fila de propagación añadiendo claves limpias para filtrado y agrupación de lotes.
 * @param registros_crudos - Arreglo de registros crudos obtenidos de la API.
 * @returns Arreglo de registros enriquecidos y normalizados.
 */
export function normalizar_registros_para_comparacion(registros_crudos: Record<string, any>[]) {
  return registros_crudos.map((fila_cruda) => {
    const fila_normalizada = normalizar_fila_propagacion(fila_cruda)
    return {
      ...fila_normalizada,
      fechaFormateada: formatear_fecha_excel(fila_normalizada.fecha || fila_normalizada.Fecha),
      generacionVal: (fila_normalizada.generacion || "N/A").toString().trim(),
      tipoLevVal: (fila_normalizada.tipoLev || "N/A").toString().trim().toUpperCase(),
      dobleteoVal: (fila_normalizada.dobleteo || "N/A").toString().trim(),
      tanqueVal: (fila_normalizada.tanque || "N/A").toString().trim().toUpperCase(),
      codigoVal: (fila_normalizada.codigoCultivo || fila_normalizada["Codigo de Cultivo"] || "S/C")
        .toString()
        .trim()
        .toUpperCase(),
    }
  })
}

/**
 * Agrupa los registros normalizados en lotes únicos aplicando los filtros activos.
 * @param registros_normalizados - Registros con campos de filtro normalizados.
 * @param filtros_activos - Filtros seleccionados en la barra superior.
 * @returns Arreglo de lotes únicos con su etiqueta descriptiva y datos consolidados.
 */
export function extraer_lotes_unicos_comparacion(
  registros_normalizados: Record<string, any>[],
  filtros_activos: FiltrosComparacionCultivos
) {
  const mapa_lotes_unicos = new Map<string, any>()

  registros_normalizados.forEach((fila_actual, indice_fila) => {
    if (filtros_activos.generaciones.length > 0 && !filtros_activos.generaciones.includes(fila_actual.generacionVal)) return
    if (filtros_activos.tipos_levadura.length > 0 && !filtros_activos.tipos_levadura.includes(fila_actual.tipoLevVal)) return
    if (filtros_activos.dobleteos.length > 0 && !filtros_activos.dobleteos.includes(fila_actual.dobleteoVal)) return
    if (filtros_activos.tanques.length > 0 && !filtros_activos.tanques.includes(fila_actual.tanqueVal)) return
    if (filtros_activos.fechas.length > 0 && !filtros_activos.fechas.includes(fila_actual.fechaFormateada)) return

    const codigo_lote = fila_actual.codigoVal !== "S/C" ? fila_actual.codigoVal : ""
    const prefijo_codigo = codigo_lote && codigo_lote !== "N/A" ? `${codigo_lote} - ` : ""
    const sufijo_fecha =
      fila_actual.fechaFormateada && fila_actual.fechaFormateada !== "N/A"
        ? ` [${fila_actual.fechaFormateada}]`
        : ""
    const etiqueta_lote = `${fila_actual.tanqueVal} - ${prefijo_codigo}Gen: ${fila_actual.generacionVal} (${fila_actual.tipoLevVal})${sufijo_fecha}`

    if (!mapa_lotes_unicos.has(etiqueta_lote)) {
      mapa_lotes_unicos.set(etiqueta_lote, {
        id: indice_fila.toString(),
        label: etiqueta_lote,
        data: fila_actual,
        gen: fila_actual.generacionVal,
      })
    } else {
      const lote_existente = mapa_lotes_unicos.get(etiqueta_lote)
      mapa_lotes_unicos.set(etiqueta_lote, {
        ...lote_existente,
        data: {
          ...fila_actual,
          vigor: fila_actual.vigor > 0 ? fila_actual.vigor : lote_existente.data.vigor,
          viab: fila_actual.viab > 0 ? fila_actual.viab : lote_existente.data.viab,
          conteo: fila_actual.conteo > 0 ? fila_actual.conteo : lote_existente.data.conteo,
          plato: fila_actual.plato > 0 ? fila_actual.plato : lote_existente.data.plato,
        },
      })
    }
  })

  return Array.from(mapa_lotes_unicos.values())
}

/**
 * Construye las 4 tarjetas de resumen de un lote seleccionado para CultureSummaryColumn.
 * @param lote_seleccionado - Objeto de lote con sus métricas consolidadas.
 * @returns Arreglo de tarjetas KPI de resumen del lote.
 */
export function construir_kpis_resumen_lote(lote_seleccionado: any) {
  if (!lote_seleccionado || !lote_seleccionado.data) return []
  const datos_lote = lote_seleccionado.data
  return [
    { label: "VIABILIDAD", value: datos_lote.viab ? Number(datos_lote.viab).toFixed(1) : "0", unit: "%", icon: Percent, status: datos_lote.viab >= 90 ? "ok" : "warn" },
    { label: "VIGOR", value: datos_lote.vigor ? Number(datos_lote.vigor).toFixed(1) : "0", unit: "%", icon: Activity, status: datos_lote.vigor >= 85 ? "ok" : "warn" },
    { label: "CONTEO", value: datos_lote.conteo ? Number(datos_lote.conteo).toFixed(1) : "0", unit: "x10^6", icon: Droplets, status: "ok" },
    { label: "°P ACTUAL", value: datos_lote.plato ? Number(datos_lote.plato).toFixed(1) : "0", unit: "°P", icon: Gauge, status: "ok" },
  ]
}

/**
 * Convierte la fecha y hora de un registro de cultivo en milisegundos Unix.
 * @param fila_muestra - Registro individual del cultivo.
 * @returns Marca de tiempo en milisegundos o null si no es posible calcularla.
 */
function parsear_marca_tiempo_muestra(fila_muestra: any): number | null {
  if (!fila_muestra) return null
  const valor_fecha = fila_muestra.Fecha || fila_muestra.fecha
  const valor_hora = fila_muestra["Hora Inicio"] || fila_muestra.hora
  let milisegundos_acumulados = 0
  let es_fecha_valida = false

  if (valor_fecha !== undefined && valor_fecha !== null && valor_fecha !== "") {
    const numero_serial = Number(valor_fecha)
    if (!isNaN(numero_serial) && numero_serial > 20000 && numero_serial < 100000) {
      milisegundos_acumulados = Math.round((numero_serial - 25569) * 86400 * 1000)
      es_fecha_valida = true
    } else {
      const objeto_fecha = new Date(valor_fecha)
      if (!isNaN(objeto_fecha.getTime())) {
        milisegundos_acumulados = objeto_fecha.getTime()
        es_fecha_valida = true
      }
    }
  }

  if (valor_hora !== undefined && valor_hora !== null && valor_hora !== "") {
    const fraccion_hora = Number(valor_hora)
    if (!isNaN(fraccion_hora) && fraccion_hora >= 0 && fraccion_hora < 1) {
      milisegundos_acumulados += Math.round(fraccion_hora * 86400 * 1000)
      es_fecha_valida = true
    } else if (typeof valor_hora === "string") {
      const segmentos_hora = valor_hora.split(":")
      if (segmentos_hora.length >= 2) {
        milisegundos_acumulados += (parseInt(segmentos_hora[0]) * 3600 + parseInt(segmentos_hora[1]) * 60) * 1000
        es_fecha_valida = true
      }
    }
  }
  return es_fecha_valida ? milisegundos_acumulados : null
}

/**
 * Construye la serie combinada de puntos cinéticos para comparar dos lotes de cultivo (A vs B).
 * @param muestras_lote_a - Registros pertenecientes al Cultivo A.
 * @param muestras_lote_b - Registros pertenecientes al Cultivo B.
 * @returns Arreglo de puntos comparativos indexados por muestra.
 */
export function construir_serie_cinetica_comparativa(muestras_lote_a: any[], muestras_lote_b: any[]) {
  const calcular_horas_muestra = (fila_muestra: any, inicio_ms: number | null, indice_muestra: number) => {
    if (!fila_muestra) return null
    if (fila_muestra["Tiempo Total"] !== undefined) {
      const tiempo_total = parseFloat(fila_muestra["Tiempo Total"])
      if (!isNaN(tiempo_total) && tiempo_total > 0) return tiempo_total
    }
    const actual_ms = parsear_marca_tiempo_muestra(fila_muestra)
    if (actual_ms !== null && inicio_ms !== null) {
      const diferencia_horas = (actual_ms - inicio_ms) / 3600000
      if (diferencia_horas > 0) return diferencia_horas
    }
    return indice_muestra * 4
  }

  const inicio_ms_a = muestras_lote_a.length > 0 ? parsear_marca_tiempo_muestra(muestras_lote_a[0]) : null
  const inicio_ms_b = muestras_lote_b.length > 0 ? parsear_marca_tiempo_muestra(muestras_lote_b[0]) : null
  const longitud_maxima = Math.max(muestras_lote_a.length, muestras_lote_b.length)
  const serie_comparativa: any[] = []

  for (let indice_muestra = 0; indice_muestra < longitud_maxima; indice_muestra++) {
    const muestra_a = muestras_lote_a[indice_muestra]
    const muestra_b = muestras_lote_b[indice_muestra]
    const horas_a = calcular_horas_muestra(muestra_a, inicio_ms_a, indice_muestra)
    const horas_b = calcular_horas_muestra(muestra_b, inicio_ms_b, indice_muestra)
    const tiempo_visible = horas_a !== null ? horas_a : horas_b

    serie_comparativa.push({
      paso: `M${indice_muestra + 1}${tiempo_visible !== null ? ` (${tiempo_visible.toFixed(0)}h)` : ""}`,
      tooltipA: muestra_a ? `${muestra_a.fechaFormateada || ""} ${muestra_a.hora && muestra_a.hora !== "N/A" ? muestra_a.hora : ""}`.trim() : null,
      tooltipB: muestra_b ? `${muestra_b.fechaFormateada || ""} ${muestra_b.hora && muestra_b.hora !== "N/A" ? muestra_b.hora : ""}`.trim() : null,
      viabA: muestra_a && muestra_a.viab > 0 ? muestra_a.viab : null,
      viabB: muestra_b && muestra_b.viab > 0 ? muestra_b.viab : null,
      conteoA: muestra_a && muestra_a.conteo > 0 ? muestra_a.conteo : null,
      conteoB: muestra_b && muestra_b.conteo > 0 ? muestra_b.conteo : null,
      vigorA: muestra_a && muestra_a.vigor > 0 ? muestra_a.vigor : null,
      vigorB: muestra_b && muestra_b.vigor > 0 ? muestra_b.vigor : null,
      platoA: muestra_a && muestra_a.plato > 0 ? muestra_a.plato : null,
      platoB: muestra_b && muestra_b.plato > 0 ? muestra_b.plato : null,
    })
  }

  return serie_comparativa
}
