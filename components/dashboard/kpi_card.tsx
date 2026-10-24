/**
 * @fileoverview Tarjeta compacta para visualización de un indicador clave de desempeño (KPI).
 */

"use client"

import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Percent,
  Thermometer,
  Wind,
  Maximize,
  ArrowDownToLine,
  Trash2,
  Clock,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { combinar_clases_css } from "@/lib/utils"
import type { Kpi } from "@/lib/mock_data"

const catalogo_iconos_kpi = {
  Percent,
  Activity,
  FlaskConical,
  Gauge,
  Droplets,
  Thermometer,
  Wind,
  Maximize,
  ArrowDownToLine,
  Trash2,
  Clock,
} as const

/**
 * Renderiza una tarjeta individual de KPI con icono, etiqueta, límite de control y valor coloreado por estado.
 * @param propiedades_componente - Objeto KPI con metadatos y valor actual.
 * @returns Elemento JSX de la tarjeta KPI.
 */
export function KpiCard({ kpi: indicador_kpi }: { kpi: Kpi }) {
  const IconoSeleccionado =
    catalogo_iconos_kpi[indicador_kpi.icon as keyof typeof catalogo_iconos_kpi] ?? Activity
  const clase_color_valor = indicador_kpi.status === "ok" ? "text-green-500" : "text-yellow-500"

  return (
    <Card className="overflow-hidden border-yellow-500/40 bg-[#121212] text-white shadow-none">
      <CardContent className="flex flex-col justify-between p-1.5 h-full">
        <div className="flex items-center gap-1 text-[8px] font-bold tracking-tight text-yellow-500 uppercase">
          <IconoSeleccionado className="size-2.5 text-yellow-500 shrink-0" />
          <span className="truncate">{indicador_kpi.label}</span>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div className="text-[7px] font-mono text-zinc-500 truncate mr-1 pb-0.5">{indicador_kpi.lc}</div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <span className={combinar_clases_css("font-mono text-sm font-bold tabular-nums leading-none", clase_color_valor)}>
              {indicador_kpi.value}
            </span>
            <span className="text-[7px] text-zinc-500 leading-none">{indicador_kpi.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
