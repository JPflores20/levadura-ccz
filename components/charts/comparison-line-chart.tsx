"use client"

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts"
import { tooltipStyle, axisProps, CHART_COLORS } from "@/lib/chart-config"
import { ExpandableCard } from "@/components/dashboard/expandable-card"

interface ComparisonLineChartProps {
  chartId: string
  title: string
  data: Record<string, unknown>[]
  dataKeyA: string
  dataKeyB: string
  nameA?: string
  nameB?: string
  yDomain?: [number | string, number | string]
}

export function ComparisonLineChart({
  chartId,
  title,
  data,
  dataKeyA,
  dataKeyB,
  nameA = "Cultivo A",
  nameB = "Cultivo B",
  yDomain,
}: ComparisonLineChartProps) {
  return (
    <ExpandableCard title={title} contentClassName="p-2 pt-0" headerClassName="pt-3 px-3">
      <div className="h-40 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id={chartId} data={data} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="hora" {...axisProps} tick={{ fontSize: 8 }} />
            <YAxis domain={yDomain} {...axisProps} tick={{ fontSize: 8 }} />
            <Tooltip {...tooltipStyle} itemStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey={dataKeyA} name={nameA} stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey={dataKeyB} name={nameB} stroke={CHART_COLORS.red} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
