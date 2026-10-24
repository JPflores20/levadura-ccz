"use client"

/**
 * @fileoverview Columna de resumen de indicadores KPI por cultivo para la vista de comparación.
 */

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

/**
 * Estructura de un indicador KPI simple dentro de la columna de cultivo.
 */
export interface ElementoKpiCultivo {
  label: string
  value: string | number
  unit: string
  icon: any
  status: string
}

/**
 * Renderiza una tarjeta compacta de indicador KPI individual.
 *
 * @param {{ kpiItem: ElementoKpiCultivo }} propiedades - Datos del KPI.
 * @returns {JSX.Element} Tarjeta compacta de KPI.
 */
function TarjetaKpiSimple({ kpiItem: elemento_kpi }: { kpiItem: ElementoKpiCultivo }) {
  const IconoComponente = elemento_kpi.icon
  return (
    <Card className="border-yellow-500/40 bg-[#121212] py-2 px-3 text-white flex flex-col gap-1 justify-center">
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
        <IconoComponente className="size-3 text-yellow-500" />
        <span className="truncate">{elemento_kpi.label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            elemento_kpi.status === "ok" ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {elemento_kpi.value}
        </span>
        <span className="text-[10px] text-zinc-500">{elemento_kpi.unit}</span>
      </div>
    </Card>
  )
}

/**
 * Renderiza una tarjeta de medidor semicircular (Gauge) opcional.
 *
 * @param {object} propiedades - Título, valor porcentual, color y descripción.
 * @returns {JSX.Element} Tarjeta de medidor semicircular.
 */
export function TarjetaMedidorSemicircular({
  title: titulo_medidor,
  value: valor_porcentaje,
  color: color_acento,
  desc: descripcion_medidor
}: {
  title: string
  value: number
  color: string
  desc: string
}) {
  const datos_medidor = [
    { name: "Value", value: valor_porcentaje },
    { name: "Empty", value: 100 - valor_porcentaje }
  ]
  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col items-center justify-center p-3 relative overflow-hidden">
      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide z-10">
        {titulo_medidor}
      </span>
      <div className="h-20 w-32 relative mt-2">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={datos_medidor}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={40}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={color_acento} />
              <Cell fill="#27272a" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
          <span className="text-xl font-bold font-mono" style={{ color: color_acento }}>
            {valor_porcentaje}%
          </span>
        </div>
      </div>
      <span className="text-[9px] text-zinc-400 mt-1">{descripcion_medidor}</span>
    </Card>
  )
}

/**
 * Renderiza la columna resumen de KPIs de un cultivo (Cultivo A o Cultivo B).
 *
 * @param {object} propiedades - Nombre del cultivo, lista de KPIs y colores de acento.
 * @returns {JSX.Element} Columna de resumen de cultivo.
 */
export function CultureSummaryColumn({
  cultureName: nombre_cultivo,
  kpis: lista_kpis,
  accentColor: color_acento
}: {
  cultureName: string
  kpis: ElementoKpiCultivo[]
  vitalityIndex: number
  vitalityLabel: string
  vitalityColor: string
  attenuationEfficiency: number
  attenuationLabel: string
  attenuationColor: string
  accentColor: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-yellow-500/40 pb-2">
        <div className="size-2.5 rounded-full" style={{ backgroundColor: color_acento }} />
        <h2 className="text-sm font-bold text-white tracking-widest">{nombre_cultivo}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {lista_kpis.map((elemento_kpi, indice_kpi) => (
          <TarjetaKpiSimple key={indice_kpi} kpiItem={elemento_kpi} />
        ))}
      </div>
    </div>
  )
}

export { CultureSummaryColumn as columna_resumen_cultivo }
