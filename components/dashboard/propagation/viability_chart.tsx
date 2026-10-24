"use client"

/**
 * @fileoverview Gráfica de tendencia de Viabilidad (%) y Vitalidad (%) durante la propagación.
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { propagationData as datos_propagacion_simulados } from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Propiedades del componente de gráfica de viabilidad.
 */
export interface PropiedadesGraficaViabilidad {
  dynamicData?: any[]
}

/**
 * Renderiza la gráfica de líneas de Viabilidad y Vitalidad con umbral mínimo de 95%.
 *
 * @param {PropiedadesGraficaViabilidad} propiedades - Serie dinámica de propagación.
 * @returns {JSX.Element} Tarjeta expandible con la gráfica de viabilidad.
 */
export function ViabilityChart({ dynamicData: datos_dinamicos }: PropiedadesGraficaViabilidad) {
  const registros_base = datos_dinamicos || datos_propagacion_simulados

  // Si en un registro no se midió vitalidad (0), se usa null para conectar la línea sin caer a 0
  const datos_grafica_viabilidad = registros_base.map((registro_propagacion) => ({
    ...registro_propagacion,
    viabilidad: registro_propagacion.viabilidad > 0 ? registro_propagacion.viabilidad : null,
    vigorosas: registro_propagacion.vigorosas > 0 ? registro_propagacion.vigorosas : null,
    vigorosasReales: registro_propagacion.viabilidad - (registro_propagacion.vigorosas || 0),
    muyVigorosas: registro_propagacion.vigorosas || 0
  }))

  return (
    <ExpandableCard title="Tendencia de Viabilidad y Vitalidad">
      <div className="h-[220px] flex flex-col w-full relative shrink-0 gap-4">
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              id="prop-viab-only"
              data={datos_grafica_viabilidad}
              margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hora" {...propiedades_ejes} />
              <YAxis domain={[0, 100]} {...propiedades_ejes} />
              <Tooltip {...estilo_tooltip} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
              <ReferenceLine
                y={95}
                stroke="#22c55e"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
                label={{
                  value: "Min 95%",
                  fill: "#22c55e",
                  fontSize: 9,
                  position: "insideBottomLeft"
                }}
              />
              <Line
                type="monotone"
                dataKey="viabilidad"
                name="Viabilidad %"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="vigorosas"
                name="Vitalidad %"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ExpandableCard>
  )
}

export { ViabilityChart as grafica_tendencia_viabilidad }
