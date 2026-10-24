"use client"

/**
 * @fileoverview Conjunto de las 3 gráficas principales del tablero de Auditoría de Abbers:
 * 1. Correlación Abber vs Laboratorio (ScatterChart con línea diagonal ideal)
 * 2. Tendencia de Desviación (Diferencia Abber - LAC por Línea 1 y Línea 2)
 * 3. Impacto del Porcentaje de Sólidos en el Sistema de Medición de Células
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from "recharts"
import {
  CHART_COLORS as COLORES_GRAFICAS,
  axisProps as propiedades_ejes,
  tooltipStyle as estilo_tooltip
} from "@/lib/chart_config"

/**
 * Tooltip personalizado para el diagrama de dispersión de correlación Abber vs Laboratorio.
 *
 * @param {any} propiedades_tooltip - Propiedades inyectadas por Recharts.
 * @returns {JSX.Element | null} Contenido del tooltip o null.
 */
function TooltipCorrelacionAber({ active, payload }: any) {
  if (active && payload && payload.length) {
    const datos_punto = payload[0].payload
    return (
      <div style={estilo_tooltip.contentStyle} className="p-2 border border-yellow-500/50 bg-black">
        <p className="font-bold text-yellow-500 mb-1">
          {datos_punto.linea} ({datos_punto.fecha})
        </p>
        <p className="text-xs">
          Abber: <span className="text-white">{datos_punto.conteoAber?.toFixed(1)}</span>
        </p>
        <p className="text-xs">
          LAC (Manual): <span className="text-white">{datos_punto.conteoLac?.toFixed(1)}</span>
        </p>
        <p className="text-xs mt-1 pt-1 border-t border-zinc-700">
          Diferencia:{" "}
          <span className={datos_punto.diferencia > 0 ? "text-red-400" : "text-green-400"}>
            {datos_punto.diferencia?.toFixed(1)}
          </span>
        </p>
      </div>
    )
  }
  return null
}

/**
 * Propiedades de las gráficas de validación Aber.
 */
export interface PropiedadesGraficasValidacionAber {
  correlationLinea1: any[]
  correlationLinea2: any[]
  idealLine: any[]
  diffOverTimeData: any[]
}

/**
 * Renderiza las 3 tarjetas expandibles con las gráficas de Auditoría de Abbers.
 *
 * @param {PropiedadesGraficasValidacionAber} propiedades - Datos filtrados por línea y evolución por fecha.
 * @returns {JSX.Element} Fragmento con las 3 gráficas de auditoría Aber.
 */
export function AberValidationCharts({
  correlationLinea1: correlacion_linea_1,
  correlationLinea2: correlacion_linea_2,
  idealLine: linea_ideal,
  diffOverTimeData: datos_desviacion_tiempo
}: PropiedadesGraficasValidacionAber) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpandableCard title="Correlación Abber vs Laboratorio">
          <div className="text-xs text-zinc-400 mb-2 italic">
            Una calibración perfecta debería mostrar todos los puntos sobre la línea diagonal dorada.
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} />
              <XAxis
                type="number"
                dataKey="conteoAber"
                name="Conteo Abber"
                {...propiedades_ejes}
                label={{ value: "Abber", position: "insideBottom", offset: -10, fill: "#888" }}
                domain={[0, "dataMax + 200"]}
              />
              <YAxis
                type="number"
                dataKey="conteoLac"
                name="Conteo LAC"
                {...propiedades_ejes}
                label={{ value: "Laboratorio", angle: -90, position: "insideLeft", fill: "#888" }}
                domain={[0, "dataMax + 200"]}
              />
              <ZAxis type="number" range={[50, 50]} />
              <Tooltip content={<TooltipCorrelacionAber />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                data={linea_ideal}
                dataKey="conteoLac"
                stroke="#eab308"
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
                legendType="none"
              />
              <Scatter name="Línea 1" data={correlacion_linea_1} fill="#3b82f6" opacity={0.8} />
              <Scatter name="Línea 2" data={correlacion_linea_2} fill="#ef4444" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </ExpandableCard>

        <ExpandableCard title="Tendencia de Desviación (Diferencia)">
          <div className="text-xs text-zinc-400 mb-2 italic">
            Diferencia neta (Abber - LAC). Valores cercanos a cero indican precisión.
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datos_desviacion_tiempo}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
              <XAxis dataKey="fecha" {...propiedades_ejes} />
              <YAxis {...propiedades_ejes} />
              <Tooltip contentStyle={estilo_tooltip.contentStyle} cursor={{ fill: "transparent" }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="diffL1" name="Error Línea 1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="diffL2" name="Error Línea 2" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ExpandableCard>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        <ExpandableCard title="Impacto del Porcentaje de Sólidos en el Sistema de Medición de Células">
          <div className="text-xs text-zinc-400 mb-2 italic">
            ¿Un mayor % de sólidos genera mayor error en el sistema de medición Abber?
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={datos_desviacion_tiempo}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
              <XAxis dataKey="fecha" {...propiedades_ejes} />
              <YAxis yAxisId="left" {...propiedades_ejes} label={{ value: "Error", angle: -90, position: "insideLeft", fill: "#888" }} />
              <YAxis yAxisId="right" orientation="right" {...propiedades_ejes} label={{ value: "% Sólidos", angle: 90, position: "insideRight", fill: "#888" }} />
              <Tooltip contentStyle={estilo_tooltip.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line yAxisId="left" type="monotone" dataKey="diffL1" name="Error L1" stroke="#3b82f6" strokeWidth={2} connectNulls />
              <Line yAxisId="right" type="monotone" dataKey="solidosL1" name="% Sólidos L1" stroke="#93c5fd" strokeDasharray="3 3" connectNulls />
              <Line yAxisId="left" type="monotone" dataKey="diffL2" name="Error L2" stroke="#ef4444" strokeWidth={2} connectNulls />
              <Line yAxisId="right" type="monotone" dataKey="solidosL2" name="% Sólidos L2" stroke="#fca5a5" strokeDasharray="3 3" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>
      </div>
    </>
  )
}

export { AberValidationCharts as graficas_validacion_aber }
