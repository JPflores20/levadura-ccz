"use client"

/**
 * @fileoverview Gráfica de Curva de Atenuación (°P vs Tiempo) para Cinética.
 */

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
import { ExpandableCard } from "@/components/dashboard/expandable_card"
import { kineticsData as datos_cinetica_simulados } from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Renderiza la tarjeta expandible con la curva de atenuación (°P vs Tiempo).
 *
 * @returns {JSX.Element} Tarjeta con gráfica de línea de atenuación.
 */
export function AttenuationCurveChart() {
  return (
    <ExpandableCard
      title="Curva de Atenuación (°P vs Tiempo)"
      className="lg:col-span-3 xl:col-span-3"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart
            id="cin-atenuacion"
            data={datos_cinetica_simulados}
            margin={{ top: 15, right: 5, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...propiedades_ejes} tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 20]} {...propiedades_ejes} tick={{ fontSize: 9 }} />
            <Tooltip {...estilo_tooltip} />
            <ReferenceLine
              y={13.8}
              stroke="#888888"
              strokeDasharray="3 3"
              label={{
                value: "°P Inicial: 13.8",
                fill: "#888",
                fontSize: 8,
                position: "insideTopRight"
              }}
            />
            <ReferenceLine
              y={3.2}
              stroke="#888888"
              strokeDasharray="3 3"
              label={{
                value: "°P Final: 3.2",
                fill: "#888",
                fontSize: 8,
                position: "insideBottomRight"
              }}
            />
            <Line
              type="monotone"
              dataKey="plato"
              name="°P"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}

export { AttenuationCurveChart as grafica_curva_atenuacion }
