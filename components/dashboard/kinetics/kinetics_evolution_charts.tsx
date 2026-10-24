"use client"

/**
 * @fileoverview Cuadrícula de las 4 gráficas combinadas de Evolución Cinética (F0..Fn y R0..Rn):
 * 1. Cinética de Acetaldehído y Diacetilo
 * 2. Ésteres y Alcoholes Superiores
 * 3. Acetato de Etilo e Isoamilo
 * 4. Alcoholes Secundarios (Isobutanol, Propanol, Alcohol Isoamílico)
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts"
import { ExpandableCard } from "@/components/dashboard/expandable_card"
import { CHART_COLORS as COLORES_GRAFICAS, axisProps as propiedades_ejes } from "@/lib/chart_config"

/**
 * Tooltip personalizado para las gráficas de evolución cinética.
 *
 * @param {any} propiedades_tooltip - Propiedades inyectadas por Recharts.
 * @returns {JSX.Element | null} Contenido del tooltip o null.
 */
function TooltipEvolucionCinetica({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-zinc-700 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-yellow-500 mb-2">{label}</p>
        {payload.map((entrada_serie: any, indice_serie: number) => (
          <div key={indice_serie} className="flex flex-col mb-1">
            <span style={{ color: entrada_serie.color }} className="font-bold">
              {entrada_serie.name}: {entrada_serie.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Propiedades de las gráficas de evolución cinética.
 */
export interface PropiedadesGraficasEvolucionCinetica {
  graphData: any[]
}

/**
 * Renderiza las 4 tarjetas expandibles de Evolución Cinética a través de los días de Fermentación y Reposo.
 *
 * @param {PropiedadesGraficasEvolucionCinetica} propiedades - Serie por paso de proceso (F0..Fn, R0..Rn).
 * @returns {JSX.Element} Cuadrícula 2x2 con las gráficas de evolución cinética.
 */
export function KineticsEvolutionCharts({
  graphData: datos_grafica_evolucion
}: PropiedadesGraficasEvolucionCinetica) {
  const etiqueta_eje_x = {
    value: "Días (F=Fermentación, R=Reposo)",
    position: "insideBottom" as const,
    offset: -10,
    fill: "#888"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ExpandableCard title="Cinética de Acetaldehído y Diacetilo">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos_grafica_evolucion} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="paso" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} orientation="left" stroke={COLORES_GRAFICAS.blue} />
            <YAxis yAxisId="right" {...propiedades_ejes} orientation="right" stroke={COLORES_GRAFICAS.yellow} />
            <Tooltip content={<TooltipEvolucionCinetica />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="acetaldehido" stroke={COLORES_GRAFICAS.blue} strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="right" type="monotone" dataKey="diacetilo" stroke={COLORES_GRAFICAS.yellow} strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="left" type="monotone" name="Acetaldehído" dataKey="acetaldehido" stroke={COLORES_GRAFICAS.blue} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            <Line yAxisId="right" type="monotone" name="Diacetilo Total" dataKey="diacetilo" stroke={COLORES_GRAFICAS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>

      <ExpandableCard title="Ésteres y Alcoholes Superiores">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos_grafica_evolucion} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="paso" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} orientation="left" stroke="#10b981" />
            <YAxis yAxisId="right" {...propiedades_ejes} orientation="right" stroke={COLORES_GRAFICAS.yellow} />
            <Tooltip content={<TooltipEvolucionCinetica />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="esteres" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="right" type="monotone" dataKey="alcoholes" stroke={COLORES_GRAFICAS.yellow} strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="left" type="monotone" name="Ésteres Generales" dataKey="esteres" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            <Line yAxisId="right" type="monotone" name="Alcoholes Superiores" dataKey="alcoholes" stroke={COLORES_GRAFICAS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>

      <ExpandableCard title="Acetato de Etilo e Isoamilo">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos_grafica_evolucion} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="paso" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} orientation="left" stroke="#ec4899" />
            <YAxis yAxisId="right" {...propiedades_ejes} orientation="right" stroke="#f97316" />
            <Tooltip content={<TooltipEvolucionCinetica />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="acetatoEtilo" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="right" type="monotone" dataKey="acetatoIsoamilo" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="left" type="monotone" name="Acetato de Etilo" dataKey="acetatoEtilo" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            <Line yAxisId="right" type="monotone" name="Acetato de Isoamilo" dataKey="acetatoIsoamilo" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>

      <ExpandableCard title="Alcoholes Secundarios">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos_grafica_evolucion} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="paso" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} orientation="left" stroke="#06b6d4" />
            <YAxis yAxisId="right" {...propiedades_ejes} orientation="right" stroke="#f43f5e" />
            <Tooltip content={<TooltipEvolucionCinetica />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="isobutanol" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="left" type="monotone" dataKey="propanol" stroke={COLORES_GRAFICAS.yellow} strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="right" type="monotone" dataKey="isoamilico" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" opacity={0.4} connectNulls={true} dot={false} activeDot={false} legendType="none" />
            <Line yAxisId="left" type="monotone" name="Isobutanol" dataKey="isobutanol" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            <Line yAxisId="left" type="monotone" name="Propanol" dataKey="propanol" stroke={COLORES_GRAFICAS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
            <Line yAxisId="right" type="monotone" name="Alcohol Isoamílico" dataKey="isoamilico" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>
    </div>
  )
}

export { KineticsEvolutionCharts as graficas_evolucion_cinetica }
