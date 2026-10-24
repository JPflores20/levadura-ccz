"use client"

/**
 * @fileoverview Barra de estado de muestra filtrada, indicador de carga y botón para limpiar filtros.
 * Se integra en los encabezados de Propagación, Comparación, Cinéticas y Auditoría Abber.
 */

import React from "react"
import { RotateCcw, Loader2, Filter } from "lucide-react"

/**
 * Propiedades del componente FilterStatusBar.
 */
export interface PropiedadesBarraEstadoFiltros {
  registros_filtrados: number
  registros_totales: number
  tiene_filtros_activos: boolean
  al_limpiar_filtros: () => void
  esta_cargando?: boolean
  children?: React.ReactNode
}

/**
 * Renderiza el contador de muestra activa (`filtrados / totales`), estado de carga
 * y botón de restablecimiento de filtros.
 *
 * @param {PropiedadesBarraEstadoFiltros} propiedades - Conteos de registros y callback de limpieza.
 * @returns {JSX.Element} Contenedor compacto con estado de filtros y acciones adicionales.
 */
export function FilterStatusBar({
  registros_filtrados,
  registros_totales,
  tiene_filtros_activos,
  al_limpiar_filtros,
  esta_cargando = false,
  children: elementos_adicionales
}: PropiedadesBarraEstadoFiltros) {
  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {esta_cargando && (
        <span className="flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-medium text-yellow-500">
          <Loader2 className="size-3 animate-spin" />
          Cargando...
        </span>
      )}

      <span
        className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-mono ${
          tiene_filtros_activos
            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
            : "border-zinc-800 bg-black/40 text-zinc-400"
        }`}
        title="Registros mostrados respecto al total disponible"
      >
        <Filter className="size-2.5" />
        Muestra: <strong>{registros_filtrados}</strong> / {registros_totales}
      </span>

      {tiene_filtros_activos && (
        <button
          onClick={al_limpiar_filtros}
          className="flex items-center gap-1 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase text-red-400 transition-colors hover:bg-red-500/20"
          title="Restablecer todos los filtros activos"
        >
          <RotateCcw className="size-2.5" />
          Limpiar filtros
        </button>
      )}

      {elementos_adicionales}
    </div>
  )
}

export { FilterStatusBar as barra_estado_filtros }
