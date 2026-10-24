"use client"

/**
 * @fileoverview Gráfica de tendencia del Conteo Celular (M/mL) con límites USL, LC y LSL persistentes.
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
import {
  CartesianGrid,
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
import { useState, useEffect } from "react"
import { base_datos_firestore } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

/**
 * Propiedades del componente de gráfica de conteo celular.
 */
export interface PropiedadesGraficaConteoCelular {
  dynamicData?: any[]
}

/**
 * Renderiza la gráfica de tendencia del conteo celular con controles para USL, LC y LSL.
 *
 * @param {PropiedadesGraficaConteoCelular} propiedades - Serie dinámica de propagación.
 * @returns {JSX.Element} Tarjeta expandible con la gráfica de conteo celular.
 */
export function CellCountChart({ dynamicData: datos_dinamicos }: PropiedadesGraficaConteoCelular) {
  const registros_base = datos_dinamicos || datos_propagacion_simulados
  const datos_grafica_conteo = registros_base.map((registro_propagacion) => ({
    ...registro_propagacion,
    conteo: registro_propagacion.conteo > 0 ? registro_propagacion.conteo : null
  }))
  const [limite_superior_usl, establecer_limite_superior_usl] = useState(260)
  const [limite_central_lc, establecer_limite_central_lc] = useState(200)
  const [limite_inferior_lsl, establecer_limite_inferior_lsl] = useState(140)

  useEffect(() => {
    const cargar_limites_conteo = async (): Promise<void> => {
      try {
        const referencia_documento = doc(base_datos_firestore, "dashboards", "cellCountLimits")
        const instantanea_documento = await getDoc(referencia_documento)
        if (instantanea_documento.exists()) {
          const datos_limites = instantanea_documento.data()
          if (datos_limites.usl !== undefined) establecer_limite_superior_usl(Number(datos_limites.usl))
          if (datos_limites.lc !== undefined) establecer_limite_central_lc(Number(datos_limites.lc))
          if (datos_limites.lsl !== undefined) establecer_limite_inferior_lsl(Number(datos_limites.lsl))
        } else {
          const usl_respaldo = localStorage.getItem("cell-count-usl")
          if (usl_respaldo) establecer_limite_superior_usl(Number(usl_respaldo))
        }
      } catch (error_lectura) {
        console.error("Error leyendo límites de conteo en Firebase:", error_lectura)
      }
    }
    cargar_limites_conteo()
  }, [])

  /**
   * Guarda los límites USL, LC y LSL tanto en LocalStorage como en Firestore.
   */
  const guardar_limites_en_firebase = async (): Promise<void> => {
    localStorage.setItem("cell-count-usl", limite_superior_usl.toString())
    localStorage.setItem("cell-count-lc", limite_central_lc.toString())
    localStorage.setItem("cell-count-lsl", limite_inferior_lsl.toString())

    try {
      const referencia_documento = doc(base_datos_firestore, "dashboards", "cellCountLimits")
      await setDoc(referencia_documento, {
        usl: limite_superior_usl,
        lc: limite_central_lc,
        lsl: limite_inferior_lsl
      })
    } catch (error_escritura) {
      console.error("Error guardando límites de conteo en Firebase:", error_escritura)
    }
  }

  return (
    <ExpandableCard
      title="Tendencia del Conteo Celular"
      headerAction={
        <div className="flex justify-end gap-3 px-2 text-[10px]">
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">USL:</label>
            <input
              type="number"
              value={limite_superior_usl}
              onChange={(evento_cambio) =>
                establecer_limite_superior_usl(Number(evento_cambio.target.value))
              }
              onBlur={guardar_limites_en_firebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">LC:</label>
            <input
              type="number"
              value={limite_central_lc}
              onChange={(evento_cambio) =>
                establecer_limite_central_lc(Number(evento_cambio.target.value))
              }
              onBlur={guardar_limites_en_firebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">LSL:</label>
            <input
              type="number"
              value={limite_inferior_lsl}
              onChange={(evento_cambio) =>
                establecer_limite_inferior_lsl(Number(evento_cambio.target.value))
              }
              onBlur={guardar_limites_en_firebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
        </div>
      }
    >
      <div className="h-[220px] w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart
            id="prop-count"
            data={datos_grafica_conteo}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...propiedades_ejes} />
            <YAxis {...propiedades_ejes} domain={["auto", "auto"]} />
            <Tooltip {...estilo_tooltip} />
            <ReferenceLine
              y={limite_superior_usl}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: `USL: ${limite_superior_usl}`, fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
            />
            <ReferenceLine
              y={limite_central_lc}
              stroke="#eab308"
              strokeDasharray="4 4"
              label={{ value: `LC: ${limite_central_lc}`, fill: "#eab308", fontSize: 9, position: "insideBottomRight" }}
            />
            <ReferenceLine
              y={limite_inferior_lsl}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: `LSL: ${limite_inferior_lsl}`, fill: "#ef4444", fontSize: 9, position: "insideBottomRight" }}
            />
            <Line
              type="monotone"
              dataKey="conteo"
              name="Conteo M/mL"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: "#eab308", strokeWidth: 0, r: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}

export { CellCountChart as grafica_tendencia_conteo_celular }
