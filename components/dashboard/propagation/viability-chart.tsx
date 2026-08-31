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

export function ViabilityChart({ dynamicData }: { dynamicData?: any[] }) {
  const data = dynamicData || propagationData;

  return (
    <ExpandableCard title="Tendencia de Viabilidad y % Células Vigorosas">
      <div className="h-52 w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id="prop-viab" data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} />
            <YAxis domain={[80, 100]} {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
            <ReferenceLine y={limits.usl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "USL", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }} />
            <ReferenceLine y={limits.lsl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "LSL", fill: "#ef4444", fontSize: 9, position: "insideBottomRight" }} />
            <Line type="monotone" dataKey="viabilidad" name="Viabilidad %" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="vigorosas" name="% Células Vigorosas" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
