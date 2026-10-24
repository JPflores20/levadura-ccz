"use client"

/**
 * @fileoverview Selector desplegable de calendario mensual para filtrar registros por fechas disponibles.
 */

import React, { useState, useRef, useEffect, useMemo } from "react"
import {
  NOMBRES_MESES_ESPANOL,
  parsear_fecha_calendario,
  construir_mapa_fechas_disponibles
} from "@/lib/services/servicio_fechas_calendario"

interface PropiedadesFiltroCalendario {
  label: string
  options: string[]
  selectedOptions: string[]
  onChange: (fechas_seleccionadas: string[]) => void
  isOpen: boolean
  setIsOpen: (estado_abierto: boolean) => void
}

/**
 * Renderiza un calendario interactivo que resalta únicamente los días con datos registrados.
 *
 * @param {PropiedadesFiltroCalendario} propiedades_calendario - Opciones de fecha, selección activa y control de apertura.
 * @returns {JSX.Element} Elemento JSX del filtro de calendario.
 */
export function CalendarFilter({
  label: etiqueta_filtro,
  options: opciones_fecha,
  selectedOptions: fechas_seleccionadas,
  onChange: actualizar_fechas,
  isOpen: esta_abierto,
  setIsOpen: cambiar_estado_abierto
}: PropiedadesFiltroCalendario) {
  const referencia_contenedor = useRef<HTMLDivElement>(null)
  const estaba_abierto_anteriormente = useRef<boolean>(false)
  const [mes_visible, cambiar_mes_visible] = useState<Date>(new Date())

  const clave_opciones = opciones_fecha.join("|")
  const { mapa_fechas_disponibles, fecha_mas_reciente } = useMemo(
    () => construir_mapa_fechas_disponibles(opciones_fecha),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clave_opciones]
  )

  useEffect(() => {
    if (esta_abierto && !estaba_abierto_anteriormente.current) {
      let fecha_objetivo = fecha_mas_reciente || new Date()
      if (fechas_seleccionadas.length > 0) {
        const { date: ultima_fecha_activa } = parsear_fecha_calendario(
          fechas_seleccionadas[fechas_seleccionadas.length - 1]
        )
        if (ultima_fecha_activa) fecha_objetivo = ultima_fecha_activa
      }
      cambiar_mes_visible(new Date(fecha_objetivo.getFullYear(), fecha_objetivo.getMonth(), 1))
    }
    estaba_abierto_anteriormente.current = esta_abierto
  }, [esta_abierto, fecha_mas_reciente, fechas_seleccionadas])

  useEffect(() => {
    function manejar_clic_exterior(evento_raton: MouseEvent) {
      if (
        referencia_contenedor.current &&
        !referencia_contenedor.current.contains(evento_raton.target as Node)
      ) {
        cambiar_estado_abierto(false)
      }
    }
    if (esta_abierto) document.addEventListener("mousedown", manejar_clic_exterior)
    return () => document.removeEventListener("mousedown", manejar_clic_exterior)
  }, [esta_abierto, cambiar_estado_abierto])

  const alternar_seleccion_fecha = (fecha_original: string) => {
    if (fechas_seleccionadas.includes(fecha_original)) {
      actualizar_fechas(
        fechas_seleccionadas.filter((fecha_guardada) => fecha_guardada !== fecha_original)
      )
    } else {
      actualizar_fechas([...fechas_seleccionadas, fecha_original])
    }
  }

  const renderizar_celdas_dias = () => {
    const anio_actual = mes_visible.getFullYear()
    const mes_actual = mes_visible.getMonth()
    const total_dias_mes = new Date(anio_actual, mes_actual + 1, 0).getDate()
    const primer_dia_semana = new Date(anio_actual, mes_actual, 1).getDay()
    const celdas_calendario = []

    for (let indice_relleno = 0; indice_relleno < primer_dia_semana; indice_relleno++) {
      celdas_calendario.push(<div key={`pad-${indice_relleno}`} className="w-8 h-8" />)
    }

    for (let numero_dia = 1; numero_dia <= total_dias_mes; numero_dia++) {
      const clave_iso = `${anio_actual}-${String(mes_actual + 1).padStart(2, "0")}-${String(numero_dia).padStart(2, "0")}`
      const fecha_original = mapa_fechas_disponibles.get(clave_iso)
      const esta_disponible = Boolean(fecha_original)
      const esta_seleccionada = esta_disponible && fechas_seleccionadas.includes(fecha_original!)

      celdas_calendario.push(
        <button
          type="button"
          key={numero_dia}
          disabled={!esta_disponible}
          onClick={() => esta_disponible && alternar_seleccion_fecha(fecha_original!)}
          className={`w-8 h-8 flex items-center justify-center text-xs rounded-full transition-all ${
            !esta_disponible
              ? "text-zinc-700 cursor-not-allowed opacity-50"
              : esta_seleccionada
                ? "bg-yellow-500 text-black font-bold"
                : "text-zinc-200 hover:bg-zinc-800 hover:text-yellow-500 border border-zinc-800 bg-[#121212]"
          }`}
        >
          {numero_dia}
        </button>
      )
    }
    return celdas_calendario
  }

  const avanzar_mes_siguiente = (evento_clic: React.MouseEvent) => {
    evento_clic.stopPropagation()
    cambiar_mes_visible((fecha_previa) => new Date(fecha_previa.getFullYear(), fecha_previa.getMonth() + 1, 1))
  }

  const retroceder_mes_anterior = (evento_clic: React.MouseEvent) => {
    evento_clic.stopPropagation()
    cambiar_mes_visible((fecha_previa) => new Date(fecha_previa.getFullYear(), fecha_previa.getMonth() - 1, 1))
  }

  return (
    <div className="flex items-center gap-2" ref={referencia_contenedor}>
      <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{etiqueta_filtro}</label>
      <div className="relative">
        <button type="button" onClick={() => cambiar_estado_abierto(!esta_abierto)} className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center">
          <span className="truncate">{fechas_seleccionadas.length === 0 ? "(Vacío)" : `${fechas_seleccionadas.length} seleccionadas`}</span>
          <span className="ml-2 text-[10px]">▼</span>
        </button>

        {esta_abierto && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-2xl p-3 z-50 flex flex-col gap-2 min-w-[260px]">
            <div className="flex justify-between items-center mb-2">
              <button type="button" onClick={retroceder_mes_anterior} className="text-zinc-400 hover:text-yellow-500 px-2 py-1">◀</button>
              <div className="text-sm font-bold text-yellow-500">{NOMBRES_MESES_ESPANOL[mes_visible.getMonth()]} {mes_visible.getFullYear()}</div>
              <button type="button" onClick={avanzar_mes_siguiente} className="text-zinc-400 hover:text-yellow-500 px-2 py-1">▶</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"].map((abreviatura_dia) => (
                <div key={abreviatura_dia} className="text-[10px] text-zinc-500 font-bold">{abreviatura_dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{renderizar_celdas_dias()}</div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800">
              <button type="button" onClick={() => actualizar_fechas([])} className="text-xs text-zinc-400 hover:text-yellow-500 transition-colors">Limpiar</button>
              <div className="text-[10px] text-zinc-500">{mapa_fechas_disponibles.size} fechas disp.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
