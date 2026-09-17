"use client"

import { ExpandableCard } from "@/components/dashboard/expandable-card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { composicionData } from "@/lib/mock-data"
import { tooltipStyle, axisProps } from "@/lib/chart-config"

import { useState } from "react"
import { Trophy, Clock } from "lucide-react"

export function VitalityCompositionChart({ dynamicData }: { dynamicData?: any[] }) {
  const [mode, setMode] = useState<'evolution' | 'top10'>('evolution')

  // Helper para procesar datos
  let chartData: any[] = []

  if (!dynamicData || dynamicData.length === 0) {
    chartData = composicionData
  } else if (mode === 'evolution') {
    chartData = dynamicData.map((p: any) => ({
      name: p.hora,
      vitales: p.vigorosas,
      moderadas: p.debiles != null ? p.debiles : (p.viabilidad - p.vigorosas),
      muertas: p.muertas != null ? p.muertas : ((100 - p.viabilidad) * 0.4)
    }))
  } else {
    // Mode Top 10
    // 1. Agrupar por lote (tanque + fecha)
    const lotes = new Map<string, any>()
    dynamicData.forEach(p => {
      const key = `${p.tanque || 'Desc'} (${p.fecha || 'Sin fecha'})`
      // Asumimos que los datos vienen ordenados cronológicamente, así que siempre guardamos el último
      lotes.set(key, p)
    })

    // 2. Extraer el último punto de cada lote, calcular score y formatear
    const finalPoints = Array.from(lotes.entries()).map(([key, p]) => {
      const viab = p.viabilidad || 0
      const vig = p.vigorosas || 0
      return {
        name: key,
        vitales: vig,
        moderadas: p.debiles != null ? p.debiles : (viab - vig),
        muertas: p.muertas != null ? p.muertas : ((100 - viab) * 0.4),
        score: (viab * 0.4) + (vig * 0.6)
      }
    })

    // 3. Ordenar por score descendente y tomar top 10
    finalPoints.sort((a, b) => b.score - a.score)
    chartData = finalPoints.slice(0, 10).map((p, i) => ({
      ...p,
      name: `#${i + 1} ${p.name}`
    }))
  }

  return (
    <ExpandableCard 
      title={mode === 'evolution' ? "Composición del Cultivo (Evolución)" : "Top 10 Mejores Cultivos (Vitalidad)"}
      headerAction={
        <button
          onClick={() => setMode(mode === 'evolution' ? 'top10' : 'evolution')}
          className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 transition-colors"
          title={mode === 'evolution' ? "Ver Top 10" : "Ver Evolución"}
        >
          {mode === 'evolution' ? <Trophy className="size-3 text-yellow-500" /> : <Clock className="size-3 text-blue-400" />}
          <span>{mode === 'evolution' ? "Top 10 Cultivos" : "Ver Evolución"}</span>
        </button>
      }
    >
      <div className="h-52 w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart id="prop-comp" data={chartData} margin={{ top: 8, right: 12, bottom: mode === 'top10' ? 20 : 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="name" 
              {...axisProps} 
              tick={{...axisProps.tick, fontSize: mode === 'top10' ? 9 : 11}}
              angle={mode === 'top10' ? -45 : 0}
              textAnchor={mode === 'top10' ? "end" : "middle"}
              height={mode === 'top10' ? 50 : 30}
            />
            <YAxis domain={[50, 100]} allowDataOverflow={true} tickFormatter={(v) => `${Math.round(v)}%`} {...axisProps} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} cursor={{ fill: '#ffffff10' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
            <Bar dataKey="moderadas" name="Débiles / Moderadas" stackId="a" fill="#eab308" />
            <Bar dataKey="vitales" name="Vitales (Vig + Muy Vig)" stackId="a" fill="#22c55e" />
            <Bar dataKey="muertas" name="Muertas" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
