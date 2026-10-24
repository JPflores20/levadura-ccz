"use client"

/**
 * @fileoverview Cuadrícula de las 4 gráficas de línea de Cinética Comparativa (Cultivo A vs Cultivo B):
 * Conteo Celular, Viabilidad, Vitalidad (Vigor) y Grados Plato.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { ExpandableCard } from "@/components/dashboard/expandable_card"
import { CHART_COLORS as COLORES_GRAFICAS, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Tooltip personalizado para las gráficas comparativas de cinética entre Cultivo A y Cultivo B.
 *
 * @param {any} propiedades_tooltip - Propiedades inyectadas por Recharts.
 * @returns {JSX.Element | null} Contenido del tooltip o null si está inactivo.
 */
function TooltipCineticaComparativa({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const datos_punto = payload[0].payload
    return (
      <div className="bg-[#1a1a1a] border border-zinc-700 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-yellow-500 mb-2">Muestra: {label}</p>
        {payload.map((entrada_serie: any, indice_serie: number) => {
          const es_cultivo_a = entrada_serie.dataKey.endsWith("A")
          const etiqueta_tiempo = es_cultivo_a ? datos_punto.tooltipA : datos_punto.tooltipB
          return (
            <div key={indice_serie} className="flex flex-col mb-1">
              <span style={{ color: entrada_serie.color }} className="font-bold">
                {entrada_serie.name}: {entrada_serie.value}
              </span>
              {etiqueta_tiempo && (
                <span className="text-zinc-400 text-[10px]">Origen: {etiqueta_tiempo}</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

/**
 * Propiedades de la cuadrícula de gráficas comparativas de cinética.
 */
export interface PropiedadesGraficasCineticaComparacion {
  kineticsData: any[]
  labelA: string
  labelB: string
}

/**
 * Renderiza la cuadrícula 2x2 de gráficas comparativas entre dos lotes de cultivo.
 *
 * @param {PropiedadesGraficasCineticaComparacion} propiedades - Serie combinada y etiquetas de ambos lotes.
 * @returns {JSX.Element} Cuadrícula con las 4 gráficas comparativas.
 */
export function ComparisonKineticsCharts({
  kineticsData: serie_cinetica_comparativa,
  labelA: etiqueta_lote_a,
  labelB: etiqueta_lote_b
}: PropiedadesGraficasCineticaComparacion) {
  const definiciones_graficas = [
    { clave_a: "conteoA", clave_b: "conteoB", titulo: "Cinética de Conteo Celular", etiqueta_y: "x10^6 Cel/mL" },
    { clave_a: "viabA", clave_b: "viabB", titulo: "Cinética de Viabilidad", etiqueta_y: "%" },
    { clave_a: "vigorA", clave_b: "vigorB", titulo: "Cinética de Vitalidad (Vigor)", etiqueta_y: "%" },
    { clave_a: "platoA", clave_b: "platoB", titulo: "Cinética de Grados Plato", etiqueta_y: "°P" }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {definiciones_graficas.map((definicion_grafica) => (
        <ExpandableCard key={definicion_grafica.titulo} title={definicion_grafica.titulo}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={serie_cinetica_comparativa}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORES_GRAFICAS.grid}
                vertical={false}
              />
              <XAxis dataKey="paso" {...propiedades_ejes} />
              <YAxis
                {...propiedades_ejes}
                label={{
                  value: definicion_grafica.etiqueta_y,
                  angle: -90,
                  position: "insideLeft",
                  fill: "#888",
                  dy: 40
                }}
              />
              <Tooltip content={<TooltipCineticaComparativa />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey={definicion_grafica.clave_a}
                name={etiqueta_lote_a}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={definicion_grafica.clave_b}
                name={etiqueta_lote_b}
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>
      ))}
    </div>
  )
}

export { ComparisonKineticsCharts as graficas_cinetica_comparacion }
