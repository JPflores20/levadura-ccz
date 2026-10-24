"use client"

/**
 * @fileoverview Pestaña de Comparación de Cultivos (Cultivo A vs Cultivo B).
 * Delega la normalización, agrupación de lotes y construcción de series a `servicio_comparacion_cultivos`.
 */

import React, { useState, useEffect } from "react"
import useSWR from "swr"
import { CultureSummaryColumn } from "@/components/dashboard/comparison/culture_summary_column"
import { ComparisonKineticsCharts } from "@/components/dashboard/comparison/comparison_kinetics_charts"
import { CheckboxFilter } from "@/components/dashboard/checkbox_filter"
import { CalendarFilter } from "@/components/dashboard/calendar_filter"
import { FilterStatusBar } from "@/components/dashboard/filter_status_bar"
import { CustomDropdownSelect } from "@/components/dashboard/custom_dropdown_select"
import {
  RUTAS_API_PANEL,
  CONFIGURACION_SWR_PANEL,
  obtener_datos_json_api
} from "@/lib/constantes_api"
import {
  normalizar_registros_para_comparacion,
  extraer_lotes_unicos_comparacion,
  construir_kpis_resumen_lote,
  construir_serie_cinetica_comparativa
} from "@/lib/services/servicio_comparacion_cultivos"

/**
 * Renderiza la pestaña completa de Comparación de Cultivos (Lote A vs Lote B).
 *
 * @returns {JSX.Element} Vista de comparación de cultivos.
 */
export function ComparacionTab() {
  const { data: datos_base_remotos, isLoading: esta_cargando_remotos } = useSWR(
    RUTAS_API_PANEL.OBTENER_PROPAGACION,
    obtener_datos_json_api,
    CONFIGURACION_SWR_PANEL
  )

  const registros_crudos = datos_base_remotos?.rawData || []
  const registros_normalizados = normalizar_registros_para_comparacion(registros_crudos)

  const es_opcion_valida = (valor_texto: string) =>
    Boolean(valor_texto && valor_texto !== "N/A" && valor_texto !== "UNDEFINED")

  const generaciones_unicas = Array.from(new Set(registros_normalizados.map((registro: any) => registro.generacionVal))).filter(es_opcion_valida) as string[]
  generaciones_unicas.sort((gen_a, gen_b) => Number(gen_a) - Number(gen_b))
  const tipos_unicos = (Array.from(new Set(registros_normalizados.map((registro: any) => registro.tipoLevVal))).filter((tipo) => es_opcion_valida(tipo) && tipo !== "GENERAL") as string[]).sort()
  const dobleteos_unicos = (Array.from(new Set(registros_normalizados.map((registro: any) => registro.dobleteoVal))).filter(es_opcion_valida) as string[]).sort()
  const tanques_unicos = (Array.from(new Set(registros_normalizados.map((registro: any) => registro.tanqueVal))).filter(es_opcion_valida) as string[]).sort()
  const fechas_unicas = Array.from(new Set(registros_normalizados.map((registro: any) => registro.fechaFormateada))).filter(es_opcion_valida) as string[]

  const [filtro_generacion, establecer_filtro_generacion] = useState<string[]>([])
  const [abierto_generacion, establecer_abierto_generacion] = useState(false)
  const [filtro_tipo, establecer_filtro_tipo] = useState<string[]>([])
  const [abierto_tipo, establecer_abierto_tipo] = useState(false)
  const [filtro_dobleteo, establecer_filtro_dobleteo] = useState<string[]>([])
  const [abierto_dobleteo, establecer_abierto_dobleteo] = useState(false)
  const [filtro_tanque, establecer_filtro_tanque] = useState<string[]>([])
  const [abierto_tanque, establecer_abierto_tanque] = useState(false)
  const [filtro_fecha, establecer_filtro_fecha] = useState<string[]>([])
  const [abierto_fecha, establecer_abierto_fecha] = useState(false)

  const tiene_filtros_activos =
    filtro_generacion.length > 0 || filtro_tipo.length > 0 || filtro_dobleteo.length > 0 ||
    filtro_tanque.length > 0 || filtro_fecha.length > 0

  const limpiar_todos_los_filtros = (): void => {
    establecer_filtro_generacion([])
    establecer_filtro_tipo([])
    establecer_filtro_dobleteo([])
    establecer_filtro_tanque([])
    establecer_filtro_fecha([])
  }

  const lotes_unicos = extraer_lotes_unicos_comparacion(registros_normalizados, {
    generaciones: filtro_generacion,
    tipos_levadura: filtro_tipo,
    dobleteos: filtro_dobleteo,
    tanques: filtro_tanque,
    fechas: filtro_fecha
  })
  const lotes_totales = extraer_lotes_unicos_comparacion(registros_normalizados, {
    generaciones: [], tipos_levadura: [], dobleteos: [], tanques: [], fechas: []
  })

  const [identificador_lote_a, establecer_identificador_lote_a] = useState<string>("")
  const [identificador_lote_b, establecer_identificador_lote_b] = useState<string>("")

  useEffect(() => {
    if (lotes_unicos.length > 0) {
      if (!identificador_lote_a || !lotes_unicos.some((lote) => lote.id === identificador_lote_a)) {
        establecer_identificador_lote_a(lotes_unicos[0].id)
      }
      if (!identificador_lote_b || !lotes_unicos.some((lote) => lote.id === identificador_lote_b)) {
        const primer_codigo = lotes_unicos[0]?.data?.codigoVal
        const lote_distinto = lotes_unicos.find((lote) => lote.data?.codigoVal !== primer_codigo) || lotes_unicos[1] || lotes_unicos[0]
        establecer_identificador_lote_b(lote_distinto.id)
      }
    }
  }, [lotes_unicos, identificador_lote_a, identificador_lote_b])

  const lote_seleccionado_a = lotes_unicos.find((lote: any) => lote.id === identificador_lote_a) || lotes_unicos[0]
  const lote_seleccionado_b = lotes_unicos.find((lote: any) => lote.id === identificador_lote_b) || lotes_unicos[1] || lotes_unicos[0]

  const kpis_lote_a = construir_kpis_resumen_lote(lote_seleccionado_a)
  const kpis_lote_b = construir_kpis_resumen_lote(lote_seleccionado_b)

  const obtener_muestras_lote = (id_seleccionado: string) => {
    const lote_objetivo = lotes_unicos.find((lote: any) => lote.id === id_seleccionado)
    if (!lote_objetivo) return []
    const codigo_objetivo = lote_objetivo.data.codigoVal || "S/C"
    return registros_normalizados.filter((registro: any) => {
      if (codigo_objetivo !== "S/C" && codigo_objetivo !== "N/A") {
        return registro.codigoVal === codigo_objetivo
      }
      return registro.tanqueVal === lote_objetivo.data.tanqueVal && registro.fechaFormateada === lote_objetivo.data.fechaFormateada
    })
  }

  const muestras_lote_a = obtener_muestras_lote(identificador_lote_a)
  const muestras_lote_b = obtener_muestras_lote(identificador_lote_b)
  const serie_cinetica_comparativa = construir_serie_cinetica_comparativa(muestras_lote_a, muestras_lote_b)

  const opciones_lotes_selector = lotes_unicos.map((lote: any) => ({
    valor: lote.id,
    etiqueta: lote.label
  }))

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg">
      <div className="flex flex-col gap-3 bg-[#121212] border border-yellow-500/20 p-3 rounded-md shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <CheckboxFilter label="Gen." options={generaciones_unicas} selectedOptions={filtro_generacion} onChange={establecer_filtro_generacion} isOpen={abierto_generacion} setIsOpen={establecer_abierto_generacion} />
            <CheckboxFilter label="Tipo de Levadura" options={tipos_unicos} selectedOptions={filtro_tipo} onChange={establecer_filtro_tipo} isOpen={abierto_tipo} setIsOpen={establecer_abierto_tipo} />
            <CheckboxFilter label="Dobleteo" options={dobleteos_unicos} selectedOptions={filtro_dobleteo} onChange={establecer_filtro_dobleteo} isOpen={abierto_dobleteo} setIsOpen={establecer_abierto_dobleteo} />
            <CheckboxFilter label="Tanque" options={tanques_unicos} selectedOptions={filtro_tanque} onChange={establecer_filtro_tanque} isOpen={abierto_tanque} setIsOpen={establecer_abierto_tanque} />
            <CalendarFilter label="Fecha" options={fechas_unicas} selectedOptions={filtro_fecha} onChange={establecer_filtro_fecha} isOpen={abierto_fecha} setIsOpen={establecer_abierto_fecha} />
          </div>
          <FilterStatusBar registros_filtrados={lotes_unicos.length} registros_totales={lotes_totales.length} tiene_filtros_activos={tiene_filtros_activos} al_limpiar_filtros={limpiar_todos_los_filtros} esta_cargando={esta_cargando_remotos} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-1">
          <div className="flex-1 min-w-[220px]">
            <CustomDropdownSelect etiqueta_titulo="🔵 Cultivo A (Gen.)" color_tema="blue" opciones={opciones_lotes_selector} valor_unico={identificador_lote_a} al_cambiar_unico={establecer_identificador_lote_a} texto_vacio="Seleccione un cultivo..." />
          </div>

          <div className="flex-1 min-w-[220px]">
            <CustomDropdownSelect etiqueta_titulo="🔴 Cultivo B (Gen.)" color_tema="red" opciones={opciones_lotes_selector} valor_unico={identificador_lote_b} al_cambiar_unico={establecer_identificador_lote_b} texto_vacio="Seleccione un cultivo..." />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <CultureSummaryColumn cultureName={`CULTIVO A: ${lote_seleccionado_a?.data?.tipoLevVal || lote_seleccionado_a?.data?.tipoLev || "N/A"} (Gen: ${lote_seleccionado_a?.gen || "N/A"})`} accentColor="#3b82f6" kpis={kpis_lote_a} vitalityIndex={lote_seleccionado_a?.data?.viab || 0} vitalityLabel={lote_seleccionado_a?.data?.viab >= 90 ? "Óptimo" : "Bajo"} vitalityColor={lote_seleccionado_a?.data?.viab >= 90 ? "#22c55e" : "#ef4444"} attenuationEfficiency={0} attenuationLabel="N/A" attenuationColor="#52525b" />
        <CultureSummaryColumn cultureName={`CULTIVO B: ${lote_seleccionado_b?.data?.tipoLevVal || lote_seleccionado_b?.data?.tipoLev || "N/A"} (Gen: ${lote_seleccionado_b?.gen || "N/A"})`} accentColor="#ef4444" kpis={kpis_lote_b} vitalityIndex={lote_seleccionado_b?.data?.viab || 0} vitalityLabel={lote_seleccionado_b?.data?.viab >= 90 ? "Óptimo" : "Bajo"} vitalityColor={lote_seleccionado_b?.data?.viab >= 90 ? "#22c55e" : "#ef4444"} attenuationEfficiency={0} attenuationLabel="N/A" attenuationColor="#52525b" />
      </div>

      <div className="flex items-center justify-between border-b border-yellow-500/40 pb-2 mt-2">
        <h2 className="text-sm font-bold text-yellow-500 tracking-widest">CINÉTICA COMPARATIVA (CULTIVO A VS B)</h2>
      </div>

      <ComparisonKineticsCharts kineticsData={serie_cinetica_comparativa} labelA={lote_seleccionado_a?.label || "Cultivo A"} labelB={lote_seleccionado_b?.label || "Cultivo B"} />
    </div>
  )
}

export { ComparacionTab as pestana_comparacion }
