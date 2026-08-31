"use client"

import { Activity, Droplets, FlaskConical, Gauge, Percent, Thermometer } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"

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
} as const

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = iconMap[kpi.icon as keyof typeof iconMap] ?? Activity
  const valueColor = kpi.status === "ok" ? "text-green-500" : "text-yellow-500"

  return (
    <Card className="overflow-hidden gap-0 border-yellow-500/40 bg-[#121212] py-0 text-white shadow-none">
      <CardContent className="flex flex-col gap-2 p-3 pb-0">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-yellow-500 uppercase">
          <Icon className="size-3.5 text-yellow-500" />
          <span className="truncate">{kpi.label}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className={cn("font-mono text-2xl font-bold tabular-nums", valueColor)}>
            {kpi.value}
          </span>
          <span className="text-xs text-zinc-500">{kpi.unit}</span>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 mb-1">{kpi.lc}</div>
      </CardContent>
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kpi.spark} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
