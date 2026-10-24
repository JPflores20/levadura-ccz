"use client"

/**
 * @fileoverview Fila de 3 gráficas secundarias de Cinética:
 * 1. Conteo Celular y Viabilidad
 * 2. pH y Temperatura
 * 3. Perfil de Compuestos de Sabor
 */

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { ExpandableCard } from "@/components/dashboard/expandable_card"
import {
  kineticsData as datos_cinetica_base,
  kineticsCellsData as datos_celulas_cinetica,
  kineticsFlavorData as datos_sabores_cinetica
} from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Renderiza la fila con las 3 gráficas secundarias de Cinética.
 *
 * @returns {JSX.Element} Cuadrícula de 3 columnas con gráficas secundarias.
 */
export function SecondaryChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <ExpandableCard title="Conteo Celular y Viabilidad">
        <div className="h-48 w-full">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              id="cin-conteo"
              data={datos_celulas_cinetica}
              margin={{ top: 5, right: -10, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hora" {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" domain={[0, 500]} {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[60, 100]}
                {...propiedades_ejes}
                tick={{ fontSize: 9 }}
              />
              <Tooltip {...estilo_tooltip} />
              <Legend wrapperStyle={{ fontSize: 9, color: "#888888" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="conteo"
                name="Conteo Celular"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: "#0ea5e9", r: 2, strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="viabilidad"
                name="Viabilidad (%)"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#a855f7", r: 2, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ExpandableCard>

      <ExpandableCard title="pH y Temperatura">
        <div className="h-48 w-full">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              id="cin-ph"
              data={datos_cinetica_base}
              margin={{ top: 5, right: -10, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hora" {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" domain={[3.0, 6.0]} {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[8, 18]}
                {...propiedades_ejes}
                tick={{ fontSize: 9 }}
              />
              <Tooltip {...estilo_tooltip} />
              <Legend wrapperStyle={{ fontSize: 9, color: "#888888" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ph"
                name="pH"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 2, strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temp"
                name="Temperatura (°C)"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ fill: "#eab308", r: 2, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ExpandableCard>

      <ExpandableCard title="Perfil de Compuestos de Sabor">
        <div className="h-48 w-full">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              id="cin-sabor"
              data={datos_sabores_cinetica}
              margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hora" {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 200]} {...propiedades_ejes} tick={{ fontSize: 9 }} />
              <Tooltip {...estilo_tooltip} />
              <Legend wrapperStyle={{ fontSize: 9, color: "#888888" }} />
              <Line
                type="monotone"
                dataKey="diacetilo"
                name="Diacetilo Total (ppb)"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="esteres"
                name="Esteres Totales (ppm)"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="alcoholes"
                name="Alcoholes Superiores (ppm)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ExpandableCard>
    </div>
  )
}

export { SecondaryChartsRow as fila_graficas_secundarias }
