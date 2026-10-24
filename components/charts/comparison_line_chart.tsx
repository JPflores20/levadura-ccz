/**
 * @fileoverview Gráfica de líneas comparativa reutilizable para contrastar dos series temporales (A vs B).
 */

"use client"

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts"
import { estilo_tooltip_grafica, propiedades_ejes_grafica, colores_grafica } from "@/lib/chart_config"
import { ExpandableCard } from "@/components/dashboard/expandable_card"

interface PropiedadesGraficaComparativa {
  chartId: string
  title: string
  data: Record<string, unknown>[]
  dataKeyA: string
  dataKeyB: string
  nameA?: string
  nameB?: string
  yDomain?: [number | string, number | string]
}

/**
 * Renderiza una tarjeta expandible con dos líneas superpuestas para comparar Cultivo A y Cultivo B.
 * @param propiedades_entrada - Datos y llaves de serie para ambos cultivos.
 * @returns Elemento JSX con la tarjeta y gráfica de líneas.
 */
export function ComparisonLineChart({
  chartId: identificador_grafica,
  title: titulo_grafica,
  data: serie_datos,
  dataKeyA: clave_serie_a,
  dataKeyB: clave_serie_b,
  nameA: nombre_serie_a = "Cultivo A",
  nameB: nombre_serie_b = "Cultivo B",
  yDomain: dominio_eje_y,
}: PropiedadesGraficaComparativa) {
  return (
    <ExpandableCard title={titulo_grafica} contentClassName="p-2 pt-0" headerClassName="pt-3 px-3">
      <div className="h-40 w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id={identificador_grafica} data={serie_datos} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colores_grafica.grid} />
            <XAxis dataKey="hora" {...propiedades_ejes_grafica} tick={{ fontSize: 8 }} />
            <YAxis domain={dominio_eje_y} {...propiedades_ejes_grafica} tick={{ fontSize: 8 }} />
            <Tooltip {...estilo_tooltip_grafica} itemStyle={{ fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey={clave_serie_a}
              name={nombre_serie_a}
              stroke={colores_grafica.blue}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey={clave_serie_b}
              name={nombre_serie_b}
              stroke={colores_grafica.red}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
