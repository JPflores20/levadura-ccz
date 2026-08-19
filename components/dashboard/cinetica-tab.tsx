"use client"

import {
  Activity,
  Droplets,
  FlaskConical,
  Gauge,
  Percent,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Minus,
  Waves,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { kineticsData, kineticsKpis, kineticsPhases, type MiniKpi } from "@/lib/mock-data"

const iconMap = {
  Percent,
  Activity,
  FlaskConical,
  Gauge,
  Droplets,
  Thermometer,
  TrendingDown,
  Waves,
} as const

const trendMap = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const

const statusColor = {
  ok: "text-green-500",
  marginal: "text-yellow-500",
  alert: "text-red-500",
} as const

function MiniKpiCard({ kpi }: { kpi: MiniKpi }) {
  const Icon = iconMap[kpi.icon as keyof typeof iconMap] ?? Activity
  const Trend = trendMap[kpi.trend]

  return (
    <Card className="gap-0 border-yellow-600/30 bg-zinc-900 py-0 text-white shadow-none">
      <CardContent className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
          <Icon className="size-3.5 shrink-0 text-yellow-500/80" />
          <span className="truncate">{kpi.label}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className={cn("font-mono text-xl font-bold tabular-nums", statusColor[kpi.status])}>
            {kpi.value}
          </span>
          {kpi.unit ? <span className="text-[11px] text-zinc-500">{kpi.unit}</span> : null}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Trend
            className={cn(
              "size-3 shrink-0",
              kpi.trend === "up" && "text-green-500/80",
              kpi.trend === "down" && "text-blue-400/80",
              kpi.trend === "flat" && "text-zinc-500",
            )}
          />
          <span className="truncate font-mono">{kpi.delta}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#18181b",
    borderColor: "#3f3f46",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#a1a1aa" },
  itemStyle: { color: "#e4e4e7" },
}

// Colores por serie / eje
const platoColor = "#eab308" // °P (ámbar)
const phColor = "#38bdf8" // pH (cian)
const tempColor = "#f97316" // Temp (naranja)

export function CineticaTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Fila superior: 8 KPIs pequeños */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {kineticsKpis.map((kpi) => (
          <MiniKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Gráfico gigante multi-eje */}
      <Card className="border-yellow-600/30 bg-zinc-900 text-white">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Cinética de Fermentación · °P / pH / Temperatura
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
            <LegendDot color={platoColor} label="Extracto (°P)" />
            <LegendDot color={phColor} label="pH" />
            <LegendDot color={tempColor} label="Temp (°C)" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[440px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kineticsData} margin={{ top: 12, right: 64, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="hora"
                  stroke="#52525b"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  interval={1}
                />

                {/* Eje Y izquierdo: °P */}
                <YAxis
                  yAxisId="plato"
                  orientation="left"
                  domain={[0, 14]}
                  stroke={platoColor}
                  tick={{ fill: platoColor, fontSize: 11 }}
                  tickLine={false}
                  label={{ value: "°P", angle: -90, position: "insideLeft", fill: platoColor, fontSize: 11 }}
                />

                {/* Eje Y derecho: pH */}
                <YAxis
                  yAxisId="ph"
                  orientation="right"
                  domain={[3.5, 5.5]}
                  stroke={phColor}
                  tick={{ fill: phColor, fontSize: 11 }}
                  tickLine={false}
                  label={{ value: "pH", angle: 90, position: "insideRight", fill: phColor, fontSize: 11 }}
                />

                {/* Segundo eje Y derecho: Temperatura (offset) */}
                <YAxis
                  yAxisId="temp"
                  orientation="right"
                  domain={[0, 24]}
                  stroke={tempColor}
                  tick={{ fill: tempColor, fontSize: 11 }}
                  tickLine={false}
                  dx={48}
                  label={{ value: "°C", angle: 90, position: "insideRight", fill: tempColor, fontSize: 11, dx: 48 }}
                />

                <Tooltip {...tooltipStyle} />

                {/* Marcadores de fase */}
                {kineticsPhases.map((phase) => (
                  <ReferenceLine
                    key={phase.h}
                    yAxisId="plato"
                    x={`${phase.h}h`}
                    stroke="#52525b"
                    strokeDasharray="4 4"
                    label={{ value: phase.label, fill: "#a1a1aa", fontSize: 9, position: "top" }}
                  />
                ))}

                <Line
                  yAxisId="plato"
                  type="monotone"
                  dataKey="plato"
                  name="Extracto °P"
                  stroke={platoColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="ph"
                  type="monotone"
                  dataKey="ph"
                  name="pH"
                  stroke={phColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temp"
                  name="Temp °C"
                  stroke={tempColor}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
