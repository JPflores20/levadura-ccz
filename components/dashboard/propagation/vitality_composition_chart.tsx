"use client"

/**
 * @fileoverview Gráfica de barras apiladas de Composición del Cultivo (Vitales, Moderadas, Muertas)
 * con modo alternable entre Evolución Temporal y Top 10 Mejores Cultivos.
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
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
import { composicionData as datos_composicion_simulados } from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, axisProps as propiedades_ejes } from "@/lib/chart_config"
import { useState } from "react"
import { Trophy, Clock } from "lucide-react"

/**
 * Propiedades de la gráfica de composición de vitalidad.
 */
export interface PropiedadesGraficaComposicionVitalidad {
  dynamicData?: any[]
}

/**
 * Renderiza la gráfica de barras apiladas de composición celular.
 *
 * @param {PropiedadesGraficaComposicionVitalidad} propiedades - Serie dinámica de propagación.
 * @returns {JSX.Element} Tarjeta expandible con la gráfica de composición.
 */
export function VitalityCompositionChart({
  dynamicData: datos_dinamicos
}: PropiedadesGraficaComposicionVitalidad) {
  const [modo_visualizacion, establecer_modo_visualizacion] = useState<"evolution" | "top10">(
    "evolution"
  )

  const registros_con_vitalidad = datos_dinamicos
    ? datos_dinamicos.filter((punto_registro: any) => (punto_registro.vigorosas || 0) > 0)
    : []
  const datos_origen =
    registros_con_vitalidad.length > 0 ? registros_con_vitalidad : datos_dinamicos || []

  let datos_grafica_composicion: any[] = []

  if (!datos_origen || datos_origen.length === 0) {
    datos_grafica_composicion = datos_composicion_simulados
  } else if (modo_visualizacion === "evolution") {
    datos_grafica_composicion = datos_origen.map((punto_registro: any) => ({
      name: punto_registro.hora,
      vitales: punto_registro.vigorosas,
      moderadas:
        punto_registro.debiles != null
          ? punto_registro.debiles
          : Math.max(0, punto_registro.viabilidad - punto_registro.vigorosas),
      muertas:
        punto_registro.muertas != null
          ? punto_registro.muertas
          : Math.max(0, (100 - punto_registro.viabilidad) * 0.4)
    }))
  } else {
    const mapa_lotes_cultivo = new Map<string, any>()
    datos_origen.forEach((punto_registro: any) => {
      const clave_lote = `${punto_registro.tanque || "Desc"} (${punto_registro.fecha || "Sin fecha"})`
      mapa_lotes_cultivo.set(clave_lote, punto_registro)
    })

    const puntos_finales_por_lote = Array.from(mapa_lotes_cultivo.entries()).map(
      ([clave_lote, punto_registro]) => {
        const porcentaje_viabilidad = punto_registro.viabilidad || 0
        const porcentaje_vigorosas = punto_registro.vigorosas || 0
        return {
          name: clave_lote,
          vitales: porcentaje_vigorosas,
          moderadas:
            punto_registro.debiles != null
              ? punto_registro.debiles
              : Math.max(0, porcentaje_viabilidad - porcentaje_vigorosas),
          muertas:
            punto_registro.muertas != null
              ? punto_registro.muertas
              : Math.max(0, (100 - porcentaje_viabilidad) * 0.4),
          puntaje_calidad: porcentaje_viabilidad * 0.4 + porcentaje_vigorosas * 0.6
        }
      }
    )

    puntos_finales_por_lote.sort(
      (primer_lote, segundo_lote) => segundo_lote.puntaje_calidad - primer_lote.puntaje_calidad
    )
    datos_grafica_composicion = puntos_finales_por_lote
      .slice(0, 10)
      .map((punto_lote, indice_ranking) => ({
        ...punto_lote,
        name: `#${indice_ranking + 1} ${punto_lote.name}`
      }))
  }

  return (
    <ExpandableCard
      title={
        modo_visualizacion === "evolution"
          ? "Composición del Cultivo (Evolución)"
          : "Top 10 Mejores Cultivos (Vitalidad)"
      }
      headerAction={
        <button
          onClick={() =>
            establecer_modo_visualizacion(
              modo_visualizacion === "evolution" ? "top10" : "evolution"
            )
          }
          className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 transition-colors"
          title={modo_visualizacion === "evolution" ? "Ver Top 10" : "Ver Evolución"}
        >
          {modo_visualizacion === "evolution" ? (
            <Trophy className="size-3 text-yellow-500" />
          ) : (
            <Clock className="size-3 text-blue-400" />
          )}
          <span>{modo_visualizacion === "evolution" ? "Top 10 Cultivos" : "Ver Evolución"}</span>
        </button>
      }
    >
      <div className="h-52 w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            id="prop-comp"
            data={datos_grafica_composicion}
            margin={{
              top: 8,
              right: 12,
              bottom: modo_visualizacion === "top10" ? 20 : 0,
              left: -12
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="name"
              {...propiedades_ejes}
              tick={{
                ...propiedades_ejes.tick,
                fontSize: modo_visualizacion === "top10" ? 9 : 11
              }}
              angle={modo_visualizacion === "top10" ? -45 : 0}
              textAnchor={modo_visualizacion === "top10" ? "end" : "middle"}
              height={modo_visualizacion === "top10" ? 50 : 30}
            />
            <YAxis
              domain={[50, 100]}
              allowDataOverflow={true}
              tickFormatter={(valor_eje) => `${Math.round(valor_eje)}%`}
              {...propiedades_ejes}
            />
            <Tooltip
              {...estilo_tooltip}
              formatter={(valor_celda: any) => `${Number(valor_celda ?? 0).toFixed(1)}%`}
              cursor={{ fill: "#ffffff10" }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: "#888888" }} />
            <Bar dataKey="moderadas" name="Débiles / Moderadas" stackId="a" fill="#eab308" />
            <Bar dataKey="vitales" name="Vitales (Vig + Muy Vig)" stackId="a" fill="#22c55e" />
            <Bar dataKey="muertas" name="Muertas" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}

export { VitalityCompositionChart as grafica_composicion_vitalidad }
