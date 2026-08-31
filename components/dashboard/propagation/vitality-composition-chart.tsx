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

export function VitalityCompositionChart({ dynamicData }: { dynamicData?: any[] }) {
  // Si hay datos dinámicos, calculamos la composición
  const data = dynamicData 
    ? dynamicData.map((p: any) => ({
        hora: p.hora,
        vitales: p.vigorosas,
        moderadas: p.viabilidad - p.vigorosas,
        estresadas: (100 - p.viabilidad) * 0.6,
        muertas: (100 - p.viabilidad) * 0.4
      }))
    : composicionData;

  return (
    <ExpandableCard title="Composición del Cultivo – Proporción de Vitalidad">
      <div className="h-52 w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart id="prop-comp" data={data} stackOffset="expand" margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} />
            <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} {...axisProps} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} cursor={{ fill: 'transparent' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
            <Bar dataKey="vitales" name="Muy Vigorosas" stackId="a" fill="#22c55e" />
            <Bar dataKey="moderadas" name="Vigorosas" stackId="a" fill="#eab308" />
            <Bar dataKey="estresadas" name="Débiles" stackId="a" fill="#f97316" />
            <Bar dataKey="muertas" name="Muertas" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
