"use client"
import { ExpandableCard } from "@/components/dashboard/expandable-card"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { propagationData, limits } from "@/lib/mock-data"
import { tooltipStyle, axisProps, legendStyle, CHART_COLORS } from "@/lib/chart-config"

import { useState } from "react"

export function ViabilityChart({ dynamicData }: { dynamicData?: any[] }) {
  const rawData = dynamicData || propagationData;
  
  // Mapeamos los datos para calcular Vigorosas y Muy Vigorosas correctamente
  const data = rawData.map(d => ({
    ...d,
    vigorosasReales: d.viabilidad - (d.vigorosas || 0), // La porción amarilla
    muyVigorosas: d.vigorosas || 0 // La porción verde
  }))

  return (
    <ExpandableCard 
      title="Tendencia de Viabilidad y Vitalidad"
    >
      <div className="h-[220px] flex flex-col w-full relative shrink-0 gap-4">
        {/* Gráfica 1: Viabilidad y Vitalidad */}
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart id="prop-viab-only" data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hora" {...axisProps} />
              {/* Eje Único (0-100) */}
              <YAxis domain={[0, 100]} {...axisProps} />
              
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
              
              <ReferenceLine y={95} stroke="#22c55e" strokeOpacity={0.5} strokeDasharray="3 3" label={{ value: "Min 95%", fill: "#22c55e", fontSize: 9, position: "insideBottomLeft" }} />
              
              <Line type="monotone" dataKey="viabilidad" name="Viabilidad %" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="vigorosas" name="Vitalidad %" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ExpandableCard>
  )
}
