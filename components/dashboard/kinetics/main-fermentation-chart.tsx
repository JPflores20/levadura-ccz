"use client"

import { useMemo } from "react"
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ExpandableCard } from "@/components/dashboard/expandable-card"
import { kineticsData, kineticsCellsData } from "@/lib/mock-data"
import { tooltipStyle, axisProps } from "@/lib/chart-config"

export function MainFermentationChart() {
  const combinedKinetics = useMemo(() => {
    return kineticsData.map((kineticsPoint, index) => {
      const cellsPoint = kineticsCellsData[index]
      return {
        ...kineticsPoint,
        ...cellsPoint
      }
    })
  }, [])

  return (
    <ExpandableCard title="Tendencia de Variables Principales Durante la Fermentación" className="lg:col-span-6 xl:col-span-7">
      <div className="h-64 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id="cin-main" data={combinedKinetics} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} tick={{fontSize: 9}} />
            <YAxis yAxisId="plato" domain={[0, 20]} stroke="#3b82f6" tick={{fill: "#3b82f6", fontSize: 9}} tickLine={false} />
            <YAxis yAxisId="ph" orientation="right" domain={[3.0, 6.0]} stroke="#22c55e" tick={{fill: "#22c55e", fontSize: 9}} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 9, color: "#888888" }} />
            <Line yAxisId="plato" type="monotone" dataKey="plato" name="°P (Plato)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line yAxisId="ph" type="monotone" dataKey="ph" name="pH" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line yAxisId="ph" type="monotone" dataKey="temp" name="Temperatura (°C)" stroke="#eab308" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line yAxisId="plato" type="monotone" dataKey="viabilidad" name="Viabilidad (%)" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="3 3" />
            <Line yAxisId="plato" type="monotone" dataKey="conteo" name="Conteo Celular" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
