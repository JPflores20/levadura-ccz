"use client"

import { Card } from "@/components/ui/card"

const resumenLote = [
  { label: "Lote / Cultivo", value: "L-240531-01" },
  { label: "Tipo de Levadura", value: "Ale" },
  { label: "Generación (Gen.)", value: "5" },
  { label: "Volumen de Inoculo", value: "2.0 % v/v" },
  { label: "Temperatura de Inoculo", value: "12.0 °C" },
  { label: "Tiempo de Almacenamiento", value: "24 h" },
  { label: "Vuelta", value: "2" }
]

export function BatchSummaryCard() {
  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex-1 overflow-hidden flex flex-col">
      <div className="p-2 border-b border-zinc-800 shrink-0">
        <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Resumen del Lote</h3>
      </div>
      <div className="overflow-auto flex-1 p-2 max-h-28">
        <ul className="flex flex-col gap-1 text-[9px]">
          {resumenLote.map(summaryItem => (
            <li key={summaryItem.label} className="flex justify-between border-b border-zinc-800/50 pb-0.5">
              <span className="text-zinc-400">{summaryItem.label}</span>
              <span className="text-zinc-200 font-medium">{summaryItem.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
