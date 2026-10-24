"use client"

/**
 * @fileoverview Pestaña principal del Tablero de Propagación de Levadura.
 * Delega la normalización, extracción de opciones y cálculo de KPIs a `servicio_propagacion_panel`.
 */

import { useEffect, useState } from "react"
import useSWR from "swr"
import { KpiCard } from "@/components/dashboard/kpi_card"
import { CheckboxFilter } from "@/components/dashboard/checkbox_filter"
import { CalendarFilter } from "@/components/dashboard/calendar_filter"
import { FilterStatusBar } from "@/components/dashboard/filter_status_bar"
import { CapabilityTable } from "@/components/dashboard/propagation/capability_table"
import { ViabilityChart } from "@/components/dashboard/propagation/viability_chart"
import { VitalityCompositionChart } from "@/components/dashboard/propagation/vitality_composition_chart"
import { CorrelationScatterGrid } from "@/components/dashboard/propagation/correlation_scatter_grid"
import { CellCountChart } from "@/components/dashboard/propagation/cell_count_chart"
import { ExecutiveReport } from "@/components/dashboard/propagation/executive_report"
import { normalizar_fila_propagacion } from "@/lib/utils"
import {
  RUTAS_API_PANEL,
  CONFIGURACION_SWR_PANEL,
  obtener_datos_json_api
} from "@/lib/constantes_api"
import {
  extraer_opciones_filtro_propagacion,
  construir_puntos_propagacion_filtrados,
  calcular_tarjetas_kpi_propagacion
} from "@/lib/services/servicio_propagacion_panel"

/**
 * Renderiza la pestaña completa de Propagación de Levadura con filtros multicriterio y gráficas.
 *
 * @returns {JSX.Element} Vista de Propagación de Levadura.
 */
export function PropagationTab() {
  const [datos_reales_propagacion, establecer_datos_reales_propagacion] = useState<any>(null)

  const [filtro_generaciones, establecer_filtro_generaciones] = useState<string[]>([])
  const [abierto_generacion, establecer_abierto_generacion] = useState(false)
  const [filtro_tipos_levadura, establecer_filtro_tipos_levadura] = useState<string[]>([])
  const [abierto_tipos_levadura, establecer_abierto_tipos_levadura] = useState(false)
  const [filtro_dobleteos, establecer_filtro_dobleteos] = useState<string[]>([])
  const [abierto_dobleteo, establecer_abierto_dobleteo] = useState(false)
  const [filtro_tanques, establecer_filtro_tanques] = useState<string[]>([])
  const [abierto_tanques, establecer_abierto_tanques] = useState(false)
  const [filtro_fechas, establecer_filtro_fechas] = useState<string[]>([])
  const [abierto_fechas, establecer_abierto_fechas] = useState(false)

  const { data: datos_base_remotos, isLoading: esta_cargando_remotos } = useSWR(
    RUTAS_API_PANEL.OBTENER_PROPAGACION,
    obtener_datos_json_api,
    CONFIGURACION_SWR_PANEL
  )

  useEffect(() => {
    if (datos_base_remotos && (datos_base_remotos.stats || datos_base_remotos.rawData)) {
      establecer_datos_reales_propagacion(datos_base_remotos)
    }
  }, [datos_base_remotos])

  const registros_normalizados = (datos_reales_propagacion?.rawData || []).map(
    (registro_crudo: any) => normalizar_fila_propagacion(registro_crudo)
  )

  const opciones_filtros = extraer_opciones_filtro_propagacion(registros_normalizados)

  const puntos_propagacion = construir_puntos_propagacion_filtrados(registros_normalizados, {
    generaciones: filtro_generaciones,
    tipos_levadura: filtro_tipos_levadura,
    dobleteos: filtro_dobleteos,
    tanques: filtro_tanques,
    fechas: filtro_fechas
  })

  const tiene_filtros_activos =
    filtro_generaciones.length > 0 ||
    filtro_tipos_levadura.length > 0 ||
    filtro_dobleteos.length > 0 ||
    filtro_tanques.length > 0 ||
    filtro_fechas.length > 0

  const limpiar_todos_los_filtros = (): void => {
    establecer_filtro_generaciones([])
    establecer_filtro_tipos_levadura([])
    establecer_filtro_dobleteos([])
    establecer_filtro_tanques([])
    establecer_filtro_fechas([])
  }

  const tiene_datos_disponibles = puntos_propagacion.length > 0
  const tarjetas_kpi_mostradas = calcular_tarjetas_kpi_propagacion(puntos_propagacion)

  return (
    <div className="flex flex-col gap-3 min-w-0 bg-[#0a0a0a] p-2 rounded-lg">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-4 relative">
        <div className="flex flex-wrap items-center gap-2">
          <CheckboxFilter label="Gen." options={opciones_filtros.generaciones_unicas} selectedOptions={filtro_generaciones} onChange={establecer_filtro_generaciones} isOpen={abierto_generacion} setIsOpen={establecer_abierto_generacion} />
          <CheckboxFilter label="Tipo de Levadura" options={opciones_filtros.tipos_unicos} selectedOptions={filtro_tipos_levadura} onChange={establecer_filtro_tipos_levadura} isOpen={abierto_tipos_levadura} setIsOpen={establecer_abierto_tipos_levadura} />
          <CheckboxFilter label="Dobleteo" options={opciones_filtros.dobleteos_unicos} selectedOptions={filtro_dobleteos} onChange={establecer_filtro_dobleteos} isOpen={abierto_dobleteo} setIsOpen={establecer_abierto_dobleteo} />
          <CheckboxFilter label="Tanque" options={opciones_filtros.tanques_unicos} selectedOptions={filtro_tanques} onChange={establecer_filtro_tanques} isOpen={abierto_tanques} setIsOpen={establecer_abierto_tanques} />
          <CalendarFilter label="Fecha" options={opciones_filtros.fechas_unicas} selectedOptions={filtro_fechas} onChange={establecer_filtro_fechas} isOpen={abierto_fechas} setIsOpen={establecer_abierto_fechas} />
        </div>
        <FilterStatusBar
          registros_filtrados={puntos_propagacion.length}
          registros_totales={registros_normalizados.length}
          tiene_filtros_activos={tiene_filtros_activos}
          al_limpiar_filtros={limpiar_todos_los_filtros}
          esta_cargando={esta_cargando_remotos}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-2 h-fit">
          {tarjetas_kpi_mostradas.map((indicador_kpi) => (
            <KpiCard key={indicador_kpi.id} kpi={indicador_kpi} />
          ))}
        </div>
        <div className="lg:col-span-6 h-full">
          <CapabilityTable
            onLocalUpdate={establecer_datos_reales_propagacion}
            stats={datos_reales_propagacion?.stats}
            lastUpdateGlobal={
              datos_reales_propagacion?.lastUpdated ||
              datos_reales_propagacion?.ultimaActualizacion
            }
            dynamicData={tiene_datos_disponibles ? puntos_propagacion : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 flex flex-col gap-3">
          <ViabilityChart dynamicData={tiene_datos_disponibles ? puntos_propagacion : undefined} />
          <CellCountChart dynamicData={tiene_datos_disponibles ? puntos_propagacion : undefined} />
        </div>
        <div className="lg:col-span-2 h-full">
          <CorrelationScatterGrid dynamicData={tiene_datos_disponibles ? puntos_propagacion : undefined} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="lg:col-span-1">
          <VitalityCompositionChart dynamicData={tiene_datos_disponibles ? puntos_propagacion : undefined} />
        </div>
        <div className="lg:col-span-1">
          <ExecutiveReport stats={datos_reales_propagacion?.stats} />
        </div>
      </div>
    </div>
  )
}

export { PropagationTab as pestana_propagacion }
