"use client"

import { ResponsiveContainer, ScatterChart, XAxis, YAxis, Tooltip, Scatter } from "recharts"
import { tooltipStyle, axisProps, scatterMargin } from "@/lib/chart-config"

interface MetricScatterChartProps {
  chartId: string
  title: string
  data: Record<string, unknown>[]
  xDataKey: string
  yDataKey: string
  color?: string
  titleFontSize?: string
  tickFontSize?: number
  yDomain?: [number | string, number | string]
}

export function MetricScatterChart({
  chartId,
  title,
  data,
  xDataKey,
  yDataKey,
  color = "#eab308",
  titleFontSize = "text-[9px]",
  tickFontSize = 8,
  yDomain = ['auto', 'auto'],
}: MetricScatterChartProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <span className={`${titleFontSize} text-zinc-300 text-center uppercase tracking-wider mb-1`}>
        {title}
      </span>
      <ResponsiveContainer width="99%" height="100%">
        <ScatterChart id={chartId} margin={scatterMargin}>
          <XAxis dataKey={xDataKey} type="number" domain={['auto', 'auto']} {...axisProps} tick={{ fontSize: tickFontSize }} />
          <YAxis dataKey={yDataKey} type="number" domain={yDomain} allowDataOverflow={true} {...axisProps} tick={{ fontSize: tickFontSize }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle.contentStyle} itemStyle={{ fontSize: 10 }} />
          <Scatter name="Datos" data={data} fill={color} shape="circle" isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
