"use client"

/**
 * @fileoverview Selector desplegable oscuro con casillas de verificación (estilo Tanque B).
 * Soporta selección única o múltiple, cierre automático al hacer clic fuera y temas azul/rojo.
 */

import React, { useState, useRef, useEffect } from "react"

/**
 * Opción individual dentro del selector desplegable.
 */
export interface OpcionSelectorDesplegable {
  valor: string
  etiqueta: string
}

/**
 * Propiedades del componente CustomDropdownSelect.
 */
export interface PropiedadesSelectorDesplegable {
  etiqueta_titulo: string
  color_tema: "blue" | "red"
  opciones: (string | OpcionSelectorDesplegable)[]
  valor_unico?: string
  al_cambiar_unico?: (nuevo_valor: string) => void
  valores_multiples?: string[]
  al_cambiar_multiple?: (nuevos_valores: string[]) => void
  modo_multiple?: boolean
  texto_vacio?: string
}

/**
 * Renderiza un selector desplegable oscuro con casillas de verificación homogéneo en todo el panel.
 *
 * @param {PropiedadesSelectorDesplegable} propiedades - Configuración de opciones, tema y callbacks.
 * @returns {JSX.Element} Selector desplegable estilizado.
 */
export function CustomDropdownSelect({
  etiqueta_titulo,
  color_tema,
  opciones,
  valor_unico = "",
  al_cambiar_unico,
  valores_multiples = [],
  al_cambiar_multiple,
  modo_multiple = false,
  texto_vacio = "Seleccionar..."
}: PropiedadesSelectorDesplegable) {
  const [esta_abierto, establecer_esta_abierto] = useState(false)
  const referencia_contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function manejar_clic_exterior(evento_raton: MouseEvent) {
      if (
        referencia_contenedor.current &&
        !referencia_contenedor.current.contains(evento_raton.target as Node)
      ) {
        establecer_esta_abierto(false)
      }
    }
    if (esta_abierto) document.addEventListener("mousedown", manejar_clic_exterior)
    return () => document.removeEventListener("mousedown", manejar_clic_exterior)
  }, [esta_abierto])

  const opciones_normalizadas: OpcionSelectorDesplegable[] = opciones.map((entrada_opcion) =>
    typeof entrada_opcion === "string"
      ? { valor: entrada_opcion, etiqueta: entrada_opcion }
      : entrada_opcion
  )

  const clases_color =
    color_tema === "blue"
      ? {
          etiqueta: "text-blue-500",
          borde: "border-blue-500/50 focus:border-blue-500",
          borde_menu: "border-blue-500/50",
          acento: "accent-blue-500"
        }
      : {
          etiqueta: "text-red-500",
          borde: "border-red-500/50 focus:border-red-500",
          borde_menu: "border-red-500/50",
          acento: "accent-red-500"
        }

  const obtener_texto_boton = (): string => {
    if (modo_multiple) {
      return valores_multiples.length > 0
        ? `${valores_multiples.length} seleccionados (${valores_multiples.join(", ")})`
        : texto_vacio
    }
    const opcion_activa = opciones_normalizadas.find((opcion) => opcion.valor === valor_unico)
    return opcion_activa ? opcion_activa.etiqueta : valor_unico || texto_vacio
  }

  const alternar_opcion = (valor_opcion: string): void => {
    if (modo_multiple && al_cambiar_multiple) {
      const ya_existe = valores_multiples.includes(valor_opcion)
      const nueva_lista = ya_existe
        ? valores_multiples.filter((actual) => actual !== valor_opcion)
        : [...valores_multiples, valor_opcion]
      al_cambiar_multiple(nueva_lista)
    } else if (al_cambiar_unico) {
      al_cambiar_unico(valor_opcion)
      establecer_esta_abierto(false)
    }
  }

  return (
    <div className="flex flex-col gap-1 relative w-full" ref={referencia_contenedor}>
      <label className={`${clases_color.etiqueta} text-[10px] font-bold uppercase tracking-wider`}>
        {etiqueta_titulo}
      </label>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => establecer_esta_abierto(!esta_abierto)}
          className={`w-full bg-black border ${clases_color.borde} text-zinc-200 text-xs rounded px-2 py-1.5 outline-none text-left flex justify-between items-center h-[32px] gap-2`}
        >
          <span className="truncate">{obtener_texto_boton()}</span>
          <span className="text-[10px] shrink-0">▼</span>
        </button>

        {esta_abierto && (
          <div
            className={`absolute top-full left-0 mt-1 bg-[#1a1a1a] border ${clases_color.borde_menu} rounded shadow-xl p-2 z-50 flex flex-col gap-1 w-full max-h-60 overflow-y-auto custom-scrollbar`}
          >
            {opciones_normalizadas.map((opcion_item) => {
              const esta_marcado = modo_multiple
                ? valores_multiples.includes(opcion_item.valor)
                : valor_unico === opcion_item.valor

              return (
                <label
                  key={opcion_item.valor}
                  className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className={clases_color.acento}
                    checked={esta_marcado}
                    onChange={() => alternar_opcion(opcion_item.valor)}
                  />
                  <span className="truncate" title={opcion_item.etiqueta}>
                    {opcion_item.etiqueta}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { CustomDropdownSelect as selector_desplegable_personalizado }
