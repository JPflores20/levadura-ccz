"use client"

/**
 * @fileoverview Tarjeta de resumen de metadatos del lote de fermentación.
 */

import { Card } from "@/components/ui/card"

const campos_resumen_lote = [
  { label: "Lote / Cultivo", value: "L-240531-01" },
  { label: "Tipo de Levadura", value: "Ale" },
  { label: "Generación (Gen.)", value: "5" },
  { label: "Volumen de Inoculo", value: "2.0 % v/v" },
  { label: "Temperatura de Inoculo", value: "12.0 °C" },
  { label: "Tiempo de Almacenamiento", value: "24 h" },
  { label: "Vuelta", value: "2" }
]

/**
 * Renderiza la tarjeta con los metadatos principales del lote evaluado.
 *
 * @returns {JSX.Element} Tarjeta de resumen del lote.
 */
export function BatchSummaryCard() {
  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex-1 overflow-hidden flex flex-col">
      <div className="p-2 border-b border-zinc-800 shrink-0">
        <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">
          Resumen del Lote
        </h3>
      </div>
      <div className="overflow-auto flex-1 p-2 max-h-28">
        <ul className="flex flex-col gap-1 text-[9px]">
          {campos_resumen_lote.map((elemento_resumen) => (
            <li
              key={elemento_resumen.label}
              className="flex justify-between border-b border-zinc-800/50 pb-0.5"
            >
              <span className="text-zinc-400">{elemento_resumen.label}</span>
              <span className="text-zinc-200 font-medium">{elemento_resumen.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export { BatchSummaryCard as tarjeta_resumen_lote }
