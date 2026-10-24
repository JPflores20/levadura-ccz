/**
 * @fileoverview Selector desplegable de selección múltiple mediante casillas de verificación (checkboxes).
 */

"use client"

import React, { useRef, useEffect } from "react"

interface PropiedadesFiltroCasillas {
  label: string
  options: string[]
  selectedOptions: string[]
  onChange: (opciones_nuevas: string[]) => void
  isOpen: boolean
  setIsOpen: (estado_abierto: boolean) => void
}

/**
 * Renderiza un filtro desplegable multi-opción con cierre automático al hacer clic fuera del contenedor.
 * @param propiedades_filtro - Etiqueta, opciones disponibles, opciones activas y manejadores de estado.
 * @returns Elemento JSX del filtro de casillas.
 */
export function CheckboxFilter({
  label: etiqueta_filtro,
  options: opciones_disponibles,
  selectedOptions: opciones_seleccionadas,
  onChange: actualizar_seleccion,
  isOpen: esta_abierto,
  setIsOpen: cambiar_estado_abierto,
}: PropiedadesFiltroCasillas) {
  const referencia_contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function manejar_clic_exterior(evento_raton: MouseEvent) {
      if (
        referencia_contenedor.current &&
        !referencia_contenedor.current.contains(evento_raton.target as Node)
      ) {
        cambiar_estado_abierto(false)
      }
    }
    if (esta_abierto) {
      document.addEventListener("mousedown", manejar_clic_exterior)
    }
    return () => {
      document.removeEventListener("mousedown", manejar_clic_exterior)
    }
  }, [esta_abierto, cambiar_estado_abierto])

  return (
    <div className="flex items-center gap-2" ref={referencia_contenedor}>
      <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{etiqueta_filtro}</label>
      <div className="relative">
        <button
          onClick={() => cambiar_estado_abierto(!esta_abierto)}
          className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
        >
          <span className="truncate">
            {opciones_seleccionadas.length === 0
              ? "(Vacío)"
              : `${opciones_seleccionadas.length} seleccionadas`}
          </span>
          <span className="ml-2 text-[10px]">▼</span>
        </button>

        {esta_abierto && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
            {opciones_disponibles.length === 0 && (
              <span className="text-zinc-500 text-xs">Sin datos</span>
            )}

            {opciones_disponibles.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                <input
                  type="checkbox"
                  className="accent-yellow-500"
                  checked={opciones_seleccionadas.length === 0}
                  onChange={() => actualizar_seleccion([])}
                />
                (Vacío)
              </label>
            )}

            {opciones_disponibles.map((opcion_texto) => (
              <label
                key={opcion_texto}
                className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-yellow-500"
                  checked={opciones_seleccionadas.includes(opcion_texto)}
                  onChange={(evento_cambio) => {
                    if (evento_cambio.target.checked) {
                      actualizar_seleccion([...opciones_seleccionadas, opcion_texto])
                    } else {
                      actualizar_seleccion(
                        opciones_seleccionadas.filter((elemento_actual) => elemento_actual !== opcion_texto)
                      )
                    }
                  }}
                />
                <span className="truncate" title={opcion_texto}>
                  {opcion_texto}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
