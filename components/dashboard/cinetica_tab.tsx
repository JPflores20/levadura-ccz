"use client"

/**
 * @fileoverview Pestaña de Cinéticas de Fermentación y Reposo.
 * Delega la extracción de propiedades, KPIs de inicio, tabla de compuestos y evolución a `servicio_cinetica_fermentacion`.
 */

import React, { useState } from "react"
import useSWR from "swr"
import { KpiCard } from "@/components/dashboard/kpi_card"
import { CheckboxFilter } from "@/components/dashboard/checkbox_filter"
import { CalendarFilter } from "@/components/dashboard/calendar_filter"
import { FilterStatusBar } from "@/components/dashboard/filter_status_bar"
import { ExcelProcessorKinetics } from "@/components/dashboard/kinetics/excel_processor_kinetics"
import { KineticsEvolutionCharts } from "@/components/dashboard/kinetics/kinetics_evolution_charts"
import { formatear_fecha_excel } from "@/lib/utils"
import {
  RUTAS_API_PANEL,
  CONFIGURACION_SWR_PANEL,
  obtener_datos_json_api
} from "@/lib/constantes_api"
import {
  obtener_propiedad_cinetica,
  construir_kpis_inicio_fermentacion,
  construir_tabla_compuestos_cinetica,
  construir_serie_evolucion_cinetica
} from "@/lib/services/servicio_cinetica_fermentacion"

/**
 * Renderiza la pestaña completa de Cinéticas (Inicio de Fermentación, Capacidad y Evolución Cinética).
 *
 * @returns {JSX.Element} Vista de Cinéticas de Fermentación.
 */
export function CineticaTab() {
  const { data: datos_base_remotos, isLoading: esta_cargando_remotos } = useSWR(
    RUTAS_API_PANEL.OBTENER_CINETICA,
    obtener_datos_json_api,
    CONFIGURACION_SWR_PANEL
  )
  const registros_crudos = datos_base_remotos?.rawData || []

  const [filtro_generacion, establecer_filtro_generacion] = useState<string[]>([])
  const [abierto_generacion, establecer_abierto_generacion] = useState(false)
  const [filtro_vuelta, establecer_filtro_vuelta] = useState<string[]>([])
  const [abierto_vuelta, establecer_abierto_vuelta] = useState(false)
  const [filtro_fechas, establecer_filtro_fechas] = useState<string[]>([])
  const [abierto_fechas, establecer_abierto_fechas] = useState(false)
  const [filtro_etapa, establecer_filtro_etapa] = useState<string[]>([])
  const [abierto_etapa, establecer_abierto_etapa] = useState(false)
  const [filtro_dias, establecer_filtro_dias] = useState<string[]>([])
  const [abierto_dias, establecer_abierto_dias] = useState(false)
  const [filtro_tanques, establecer_filtro_tanques] = useState<string[]>([])
  const [abierto_tanques, establecer_abierto_tanques] = useState(false)
  const [filtro_marca, establecer_filtro_marca] = useState<string[]>([])
  const [abierto_marca, establecer_abierto_marca] = useState(false)

  const extraer_opciones_unicas = (fuente_filas: any[], claves_busqueda: string[], mayusculas = false) =>
    Array.from(
      new Set(
        fuente_filas.map((fila: any) => {
          const texto = obtener_propiedad_cinetica(fila, claves_busqueda)?.toString().trim()
          return mayusculas ? texto?.toUpperCase() : texto
        })
      )
    ).filter(Boolean) as string[]

  const generaciones_unicas = extraer_opciones_unicas(registros_crudos, ["Generacion", "Generación", "Gen", "Gen.", "GeneracionLevadura"]).sort((gen_a, gen_b) => Number(gen_a) - Number(gen_b))
  const vueltas_unicas = extraer_opciones_unicas(registros_crudos, ["Vuelta", "Vueltas", "Vta", "Vta."]).sort((vta_a, vta_b) => Number(vta_a) - Number(vta_b))
  const fechas_unicas = Array.from(new Set(registros_crudos.map((fila: any) => formatear_fecha_excel(obtener_propiedad_cinetica(fila, ["Fecha"]))))).filter((fecha_str: any) => fecha_str && fecha_str !== "N/A") as string[]
  const etapas_unicas = extraer_opciones_unicas(registros_crudos, ["Etapa"])
  const dias_unicos = extraer_opciones_unicas(registros_crudos, ["Dias", "Días"]).sort((dia_a, dia_b) => Number(dia_a) - Number(dia_b))
  const marcas_unicas = extraer_opciones_unicas(registros_crudos, ["Marca", "Cepa"], true).sort()

  const origen_tanques = filtro_marca.length > 0
    ? registros_crudos.filter((fila: any) => filtro_marca.includes(obtener_propiedad_cinetica(fila, ["Marca", "Cepa"])?.toString().trim().toUpperCase()))
    : registros_crudos
  const tanques_unicos = extraer_opciones_unicas(origen_tanques, ["Tanque", "TCC", "Lote"], true).sort((tanque_a, tanque_b) => tanque_a.localeCompare(tanque_b, undefined, { numeric: true }))

  const tiene_algun_filtro =
    filtro_generacion.length > 0 || filtro_vuelta.length > 0 || filtro_fechas.length > 0 ||
    filtro_etapa.length > 0 || filtro_dias.length > 0 || filtro_tanques.length > 0 || filtro_marca.length > 0

  const limpiar_todos_los_filtros = (): void => {
    establecer_filtro_generacion([])
    establecer_filtro_vuelta([])
    establecer_filtro_fechas([])
    establecer_filtro_etapa([])
    establecer_filtro_dias([])
    establecer_filtro_tanques([])
    establecer_filtro_marca([])
  }

  const filas_filtradas = !tiene_algun_filtro
    ? registros_crudos
    : registros_crudos.filter((fila: any) => {
        const gen_fila = obtener_propiedad_cinetica(fila, ["Generacion", "Generación", "Gen", "Gen.", "GeneracionLevadura"])?.toString().trim()
        const vuelta_fila = obtener_propiedad_cinetica(fila, ["Vuelta", "Vueltas", "Vta", "Vta."])?.toString().trim()
        const fecha_fila = formatear_fecha_excel(obtener_propiedad_cinetica(fila, ["Fecha"]))
        const etapa_fila = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim()
        const dias_fila = obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim()
        const tanque_fila = obtener_propiedad_cinetica(fila, ["Tanque", "TCC", "Lote"])?.toString().trim().toUpperCase()
        const marca_fila = obtener_propiedad_cinetica(fila, ["Marca", "Cepa"])?.toString().trim().toUpperCase()

        if (filtro_generacion.length > 0 && !filtro_generacion.includes(gen_fila)) return false
        if (filtro_vuelta.length > 0 && !filtro_vuelta.includes(vuelta_fila)) return false
        if (filtro_fechas.length > 0 && !filtro_fechas.includes(fecha_fila)) return false
        if (filtro_etapa.length > 0 && !filtro_etapa.includes(etapa_fila)) return false
        if (filtro_dias.length > 0 && !filtro_dias.includes(dias_fila)) return false
        if (filtro_tanques.length > 0 && !filtro_tanques.includes(tanque_fila)) return false
        if (filtro_marca.length > 0 && !filtro_marca.includes(marca_fila)) return false
        return true
      })

  const tarjetas_kpi_inicio = construir_kpis_inicio_fermentacion(filas_filtradas)
  const filas_tabla_compuestos = construir_tabla_compuestos_cinetica(filas_filtradas)
  const serie_evolucion_cinetica = construir_serie_evolucion_cinetica(filas_filtradas)

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-cinetica">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3 shadow-lg relative">
        <div className="flex flex-wrap items-center gap-3">
          <CheckboxFilter label="Gen." options={generaciones_unicas} selectedOptions={filtro_generacion} onChange={establecer_filtro_generacion} isOpen={abierto_generacion} setIsOpen={establecer_abierto_generacion} />
          <CheckboxFilter label="Vuelta" options={vueltas_unicas} selectedOptions={filtro_vuelta} onChange={establecer_filtro_vuelta} isOpen={abierto_vuelta} setIsOpen={establecer_abierto_vuelta} />
          <CheckboxFilter label="Marca" options={marcas_unicas} selectedOptions={filtro_marca} onChange={establecer_filtro_marca} isOpen={abierto_marca} setIsOpen={establecer_abierto_marca} />
          <CheckboxFilter label="Tanque" options={tanques_unicos} selectedOptions={filtro_tanques} onChange={establecer_filtro_tanques} isOpen={abierto_tanques} setIsOpen={establecer_abierto_tanques} />
          <CheckboxFilter label="Etapa" options={etapas_unicas} selectedOptions={filtro_etapa} onChange={establecer_filtro_etapa} isOpen={abierto_etapa} setIsOpen={establecer_abierto_etapa} />
          <CheckboxFilter label="Días" options={dias_unicos} selectedOptions={filtro_dias} onChange={establecer_filtro_dias} isOpen={abierto_dias} setIsOpen={establecer_abierto_dias} />
          <CalendarFilter label="Fecha" options={fechas_unicas} selectedOptions={filtro_fechas} onChange={establecer_filtro_fechas} isOpen={abierto_fechas} setIsOpen={establecer_abierto_fechas} />
        </div>
        <FilterStatusBar registros_filtrados={filas_filtradas.length} registros_totales={registros_crudos.length} tiene_filtros_activos={tiene_algun_filtro} al_limpiar_filtros={limpiar_todos_los_filtros} esta_cargando={esta_cargando_remotos}>
          <ExcelProcessorKinetics />
        </FilterStatusBar>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="border-b border-yellow-500/30 pb-2 mb-2">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Inicio de Fermentación</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-fit">
            {tarjetas_kpi_inicio.map((indicador_kpi, indice_kpi) => (
              <KpiCard key={indice_kpi} kpi={indicador_kpi as any} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="border-b border-blue-500/30 pb-2 mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Capacidad de Proceso de la Fermentación</h3>
          </div>
          <div className="bg-[#121212] border border-zinc-800 rounded-lg shadow-lg text-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[240px] custom-scrollbar">
              <table className="w-full text-left relative">
                <thead className="bg-[#1a1a1a] border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Parámetro</th>
                    <th className="px-4 py-3 font-semibold text-right">Mínimo</th>
                    <th className="px-4 py-3 font-semibold text-right">Promedio</th>
                    <th className="px-4 py-3 font-semibold text-right">Máximo</th>
                    <th className="px-4 py-3 font-semibold text-right text-yellow-500">Valor Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filas_tabla_compuestos.map((fila_compuesto, indice_fila) => (
                    <tr key={indice_fila} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-zinc-200">{fila_compuesto.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-400">{fila_compuesto.min}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-blue-400 font-bold">{fila_compuesto.avg}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-400">{fila_compuesto.max}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-yellow-400 font-bold bg-yellow-500/5">{fila_compuesto.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-yellow-500/40 pb-2 mt-4">
        <h2 className="text-sm font-bold text-yellow-500 tracking-widest">EVOLUCIÓN CINÉTICA</h2>
      </div>

      <KineticsEvolutionCharts graphData={serie_evolucion_cinetica} />
    </div>
  )
}

export { CineticaTab as pestana_cinetica }
