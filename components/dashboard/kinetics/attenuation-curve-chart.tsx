"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts"
import { ExpandableCard } from "@/components/dashboard/expandable-card"
import { kineticsData } from "@/lib/mock-data"
import { tooltipStyle, axisProps } from "@/lib/chart-config"

export function AttenuationCurveChart() {
  return (
    <ExpandableCard title="Curva de Atenuación (°P vs Tiempo)" className="lg:col-span-3 xl:col-span-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id="cin-atenuacion" data={kineticsData} margin={{ top: 15, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} tick={{fontSize: 9}} />
            <YAxis domain={[0, 20]} {...axisProps} tick={{fontSize: 9}} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={13.8} stroke="#888888" strokeDasharray="3 3" label={{ value: "°P Inicial: 13.8", fill: "#888", fontSize: 8, position: "insideTopRight" }} />
            <ReferenceLine y={3.2} stroke="#888888" strokeDasharray="3 3" label={{ value: "°P Final: 3.2", fill: "#888", fontSize: 8, position: "insideBottomRight" }} />
            <Line type="monotone" dataKey="plato" name="°P" stroke="#3b82f6" strokeWidth={2} dot={{fill: "#3b82f6", strokeWidth: 0, r: 3}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
