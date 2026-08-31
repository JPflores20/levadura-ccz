"use client"

import { ExpandableCard } from "@/components/dashboard/expandable-card"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { propagationData } from "@/lib/mock-data"
import { tooltipStyle, axisProps } from "@/lib/chart-config"

export function CellCountChart({ dynamicData }: { dynamicData?: any[] }) {
  const data = dynamicData || propagationData;

  return (
    <ExpandableCard title="Tendencia del Conteo Celular">
      <div className="h-44 w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id="prop-count" data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={260} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "USL: 260", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }} />
            <ReferenceLine y={200} stroke="#eab308" strokeDasharray="4 4" label={{ value: "LC: 200", fill: "#eab308", fontSize: 9, position: "insideBottomRight" }} />
            <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "LSL: 140", fill: "#ef4444", fontSize: 9, position: "insideBottomRight" }} />
            <Line type="monotone" dataKey="conteo" name="Conteo M/mL" stroke="#a855f7" strokeWidth={2} dot={{fill: "#a855f7", strokeWidth: 0, r: 2}} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
