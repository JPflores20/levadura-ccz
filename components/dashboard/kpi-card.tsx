"use client"

import { Activity, Droplets, FlaskConical, Gauge, Percent, Thermometer, Wind, Maximize, ArrowDownToLine, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Kpi } from "@/lib/mock-data"

const iconMap = {
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
} as const

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = iconMap[kpi.icon as keyof typeof iconMap] ?? Activity
  const valueColor = kpi.status === "ok" ? "text-green-500" : "text-yellow-500"

  return (
    <Card className="overflow-hidden border-yellow-500/40 bg-[#121212] text-white shadow-none">
      <CardContent className="flex flex-col justify-between p-1.5 h-full">
        <div className="flex items-center gap-1 text-[8px] font-bold tracking-tight text-yellow-500 uppercase">
          <Icon className="size-2.5 text-yellow-500 shrink-0" />
          <span className="truncate">{kpi.label}</span>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div className="text-[7px] font-mono text-zinc-500 truncate mr-1 pb-0.5">{kpi.lc}</div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <span className={cn("font-mono text-sm font-bold tabular-nums leading-none", valueColor)}>
              {kpi.value}
            </span>
            <span className="text-[7px] text-zinc-500 leading-none">{kpi.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
