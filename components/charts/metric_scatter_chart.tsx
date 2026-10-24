/**
 * @fileoverview Gráfica de dispersión reutilizable (ScatterChart) para correlacionar dos métricas numéricas.
 */

"use client"

import { ResponsiveContainer, ScatterChart, XAxis, YAxis, Tooltip, Scatter } from "recharts"
import { estilo_tooltip_grafica, propiedades_ejes_grafica, margen_dispersion_grafica } from "@/lib/chart_config"

interface PropiedadesGraficaDispersion {
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

/**
 * Renderiza un diagrama de dispersión filtrando los registros con valores positivos en ambos ejes.
 * @param propiedades_entrada - Configuración visual y llaves de datos para los ejes X e Y.
 * @returns Elemento JSX con la gráfica de dispersión responsiva.
 */
export function MetricScatterChart({
  chartId: identificador_grafica,
  title: titulo_grafica,
  data: registros_entrada,
  xDataKey: clave_eje_x,
  yDataKey: clave_eje_y,
  color: color_puntos = "#eab308",
  titleFontSize: clase_tamano_titulo = "text-[9px]",
  tickFontSize: tamano_fuente_ejes = 8,
  yDomain: dominio_eje_y = ["auto", "auto"],
}: PropiedadesGraficaDispersion) {
  const puntos_validos = (registros_entrada || []).filter(
    (registro_actual) => Number(registro_actual[clave_eje_x]) > 0 && Number(registro_actual[clave_eje_y]) > 0
  )

  return (
    <div className="w-full h-full flex flex-col">
      <span className={`${clase_tamano_titulo} text-zinc-300 text-center uppercase tracking-wider mb-1`}>
        {titulo_grafica}
      </span>
      <ResponsiveContainer width="99%" height="100%">
        <ScatterChart id={identificador_grafica} margin={margen_dispersion_grafica}>
          <XAxis
            dataKey={clave_eje_x}
            type="number"
            domain={["auto", "auto"]}
            {...propiedades_ejes_grafica}
            tick={{ fontSize: tamano_fuente_ejes }}
          />
          <YAxis
            dataKey={clave_eje_y}
            type="number"
            domain={dominio_eje_y}
            allowDataOverflow={true}
            {...propiedades_ejes_grafica}
            tick={{ fontSize: tamano_fuente_ejes }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={estilo_tooltip_grafica.contentStyle}
            itemStyle={{ fontSize: 10 }}
          />
          <Scatter name="Datos" data={puntos_validos} fill={color_puntos} shape="circle" isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
