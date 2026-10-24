"use client"

/**
 * @fileoverview Gráfica principal combinada de variables de fermentación (°P, pH, Temperatura, Viabilidad y Conteo).
 */

import { useMemo } from "react"
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
  kineticsCellsData as datos_celulas_cinetica
} from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Renderiza la tarjeta expandible con la tendencia combinada de variables principales durante la fermentación.
 *
 * @returns {JSX.Element} Tarjeta con gráfica multieje de fermentación.
 */
export function MainFermentationChart() {
  const serie_cinetica_combinada = useMemo(() => {
    return datos_cinetica_base.map((punto_cinetica, indice_punto) => {
      const punto_celulas = datos_celulas_cinetica[indice_punto]
      return {
        ...punto_cinetica,
        ...punto_celulas
      }
    })
  }, [])

  return (
    <ExpandableCard
      title="Tendencia de Variables Principales Durante la Fermentación"
      className="lg:col-span-6 xl:col-span-7"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart
            id="cin-main"
            data={serie_cinetica_combinada}
            margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...propiedades_ejes} tick={{ fontSize: 9 }} />
            <YAxis
              yAxisId="plato"
              domain={[0, 20]}
              stroke="#3b82f6"
              tick={{ fill: "#3b82f6", fontSize: 9 }}
              tickLine={false}
            />
            <YAxis
              yAxisId="ph"
              orientation="right"
              domain={[3.0, 6.0]}
              stroke="#22c55e"
              tick={{ fill: "#22c55e", fontSize: 9 }}
              tickLine={false}
            />
            <Tooltip {...estilo_tooltip} />
            <Legend wrapperStyle={{ fontSize: 9, color: "#888888" }} />
            <Line
              yAxisId="plato"
              type="monotone"
              dataKey="plato"
              name="°P (Plato)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="ph"
              type="monotone"
              dataKey="ph"
              name="pH"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="ph"
              type="monotone"
              dataKey="temp"
              name="Temperatura (°C)"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="plato"
              type="monotone"
              dataKey="viabilidad"
              name="Viabilidad (%)"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 3"
            />
            <Line
              yAxisId="plato"
              type="monotone"
              dataKey="conteo"
              name="Conteo Celular"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}

export { MainFermentationChart as grafica_fermentacion_principal }
