"use client"

/**
 * @fileoverview Pestaña de Auditoría de Abbers (comparación entre equipo Abber en línea y laboratorio Vicell/LAC).
 * Delega la normalización y agrupación de desviaciones a `servicio_validacion_aber`.
 */

import React, { useState } from "react"
import useSWR from "swr"
import { CheckboxFilter } from "@/components/dashboard/checkbox_filter"
import { CalendarFilter } from "@/components/dashboard/calendar_filter"
import { FilterStatusBar } from "@/components/dashboard/filter_status_bar"
import { ExcelProcessorAber } from "@/components/dashboard/cultivo/excel_processor_aber"
import { AberValidationCharts } from "@/components/dashboard/aber/aber_validation_charts"
import {
  RUTAS_API_PANEL,
  CONFIGURACION_SWR_PANEL,
  obtener_datos_json_api
} from "@/lib/constantes_api"
import {
  normalizar_registros_aber,
  obtener_base_mediciones_validas_aber,
  agrupar_desviacion_por_fecha_aber
} from "@/lib/services/servicio_validacion_aber"

/**
 * Renderiza la pestaña completa de Auditoría de Abbers con filtros por línea, marca, tanque y fecha.
 *
 * @returns {JSX.Element} Vista de Auditoría de Abbers.
 */
export function ValidacionAberTab() {
  const { data: datos_base_remotos, isLoading: esta_cargando_remotos } = useSWR(
    RUTAS_API_PANEL.OBTENER_ABER,
    obtener_datos_json_api,
    CONFIGURACION_SWR_PANEL
  )

  const registros_crudos = datos_base_remotos?.rawData || []

  const [filtro_linea, establecer_filtro_linea] = useState<string[]>([])
  const [abierto_linea, establecer_abierto_linea] = useState(false)
  const [filtro_fecha, establecer_filtro_fecha] = useState<string[]>([])
  const [abierto_fecha, establecer_abierto_fecha] = useState(false)
  const [filtro_marca, establecer_filtro_marca] = useState<string[]>([])
  const [abierto_marca, establecer_abierto_marca] = useState(false)
  const [filtro_tanque, establecer_filtro_tanque] = useState<string[]>([])
  const [abierto_tanque, establecer_abierto_tanque] = useState(false)

  const todos_normalizados = normalizar_registros_aber(registros_crudos)
  const datos_base_validos = obtener_base_mediciones_validas_aber(todos_normalizados)

  const lineas_unicas = (Array.from(new Set(datos_base_validos.map((registro) => registro.linea))).filter((linea) => linea && linea !== "N/A") as string[]).sort()
  const fechas_unicas = Array.from(new Set(datos_base_validos.map((registro) => registro.fecha))).filter((fecha) => fecha && fecha !== "N/A") as string[]
  const marcas_unicas = (Array.from(new Set(datos_base_validos.map((registro) => registro.marca))).filter(Boolean) as string[]).sort()

  const origen_tanques = filtro_marca.length > 0
    ? datos_base_validos.filter((registro) => filtro_marca.includes(registro.marca))
    : datos_base_validos
  const tanques_unicos = (Array.from(new Set(origen_tanques.map((registro) => registro.tanque))).filter(Boolean) as string[]).sort()

  const tiene_filtros_activos =
    filtro_linea.length > 0 || filtro_fecha.length > 0 || filtro_marca.length > 0 || filtro_tanque.length > 0

  const limpiar_todos_los_filtros = (): void => {
    establecer_filtro_linea([])
    establecer_filtro_fecha([])
    establecer_filtro_marca([])
    establecer_filtro_tanque([])
  }

  const datos_correlacion_filtrados = datos_base_validos.filter((registro) => {
    if (filtro_linea.length > 0 && !filtro_linea.includes(registro.linea)) return false
    if (filtro_fecha.length > 0 && !filtro_fecha.includes(registro.fecha)) return false
    if (filtro_marca.length > 0 && !filtro_marca.includes(registro.marca)) return false
    if (filtro_tanque.length > 0 && !filtro_tanque.includes(registro.tanque)) return false
    return true
  })

  const correlacion_linea_1 = datos_correlacion_filtrados.filter((registro) => String(registro.linea).includes("1"))
  const correlacion_linea_2 = datos_correlacion_filtrados.filter((registro) => String(registro.linea).includes("2"))
  const datos_desviacion_tiempo = agrupar_desviacion_por_fecha_aber(datos_correlacion_filtrados)

  const valor_maximo_conteo = Math.max(
    ...datos_correlacion_filtrados.map((registro) => Math.max(registro.conteoAber || 0, registro.conteoLac || 0)),
    0
  )

  const linea_calibracion_ideal = [
    { conteoAber: 0, conteoLac: 0 },
    { conteoAber: valor_maximo_conteo, conteoLac: valor_maximo_conteo }
  ]

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-validacion-aber">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3 relative">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-yellow-500 tracking-widest">AUDITORÍA DE ABBERS</h2>
          <p className="text-xs text-zinc-400">
            Comparación Medición en Abber (Equipo) vs Medición en Vicell (Laboratorio)
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <CheckboxFilter label="Línea" options={lineas_unicas} selectedOptions={filtro_linea} onChange={establecer_filtro_linea} isOpen={abierto_linea} setIsOpen={establecer_abierto_linea} />
          {marcas_unicas.length > 0 && (
            <CheckboxFilter label="Marca" options={marcas_unicas} selectedOptions={filtro_marca} onChange={establecer_filtro_marca} isOpen={abierto_marca} setIsOpen={establecer_abierto_marca} />
          )}
          {tanques_unicos.length > 0 && (
            <CheckboxFilter label="Tanque" options={tanques_unicos} selectedOptions={filtro_tanque} onChange={establecer_filtro_tanque} isOpen={abierto_tanque} setIsOpen={establecer_abierto_tanque} />
          )}
          <CalendarFilter label="Fecha" options={fechas_unicas} selectedOptions={filtro_fecha} onChange={establecer_filtro_fecha} isOpen={abierto_fecha} setIsOpen={establecer_abierto_fecha} />
          <FilterStatusBar registros_filtrados={datos_correlacion_filtrados.length} registros_totales={datos_base_validos.length} tiene_filtros_activos={tiene_filtros_activos} al_limpiar_filtros={limpiar_todos_los_filtros} esta_cargando={esta_cargando_remotos}>
            <ExcelProcessorAber />
          </FilterStatusBar>
        </div>
      </div>

      {registros_crudos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400">
            Sube el archivo de Validación Abber para ver las métricas.
          </p>
        </div>
      ) : (
        <AberValidationCharts
          correlationLinea1={correlacion_linea_1}
          correlationLinea2={correlacion_linea_2}
          idealLine={linea_calibracion_ideal}
          diffOverTimeData={datos_desviacion_tiempo}
        />
      )}
    </div>
  )
}

export { ValidacionAberTab as pestana_validacion_aber }
