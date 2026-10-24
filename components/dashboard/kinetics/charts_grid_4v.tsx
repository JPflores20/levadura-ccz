"use client"

/**
 * @fileoverview Cuadrícula de las 7 gráficas comparativas de compuestos volátiles (Tanque A vs Tanques B)
 * para la pestaña de Comparación Cinéticas (4V).
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
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
import {
  CHART_COLORS as COLORES_GRAFICAS,
  axisProps as propiedades_ejes,
  tooltipStyle as estilo_tooltip
} from "@/lib/chart_config"

/**
 * Propiedades de la cuadrícula de gráficas comparativas 4V.
 */
export interface PropiedadesCuadriculaGraficas4v {
  tanqueA: string
  tanqueB: string[]
  diacetiloAcetaldehidoData: any[]
  esteresAlcoholesData: any[]
  acetatoIsoamiloData: any[]
  acetatoEtiloData: any[]
  propanolData: any[]
  alcoholIsoamilicoData: any[]
  isobutanolData: any[]
}

const formatear_valor_numerico = (valor_celda: any) =>
  typeof valor_celda === "number" ? valor_celda.toFixed(2) : valor_celda

const etiqueta_eje_x = {
  value: "Días (F=Fermentación, R=Reposo)",
  position: "insideBottom" as const,
  offset: -10,
  fill: "#888"
}

/**
 * Renderiza las 7 tarjetas expandibles de comparación de volátiles entre Tanque A y Tanques B.
 *
 * @param {PropiedadesCuadriculaGraficas4v} propiedades - Series preparadas y tanques seleccionados.
 * @returns {JSX.Element} Cuadrícula con las 7 gráficas comparativas.
 */
export function ChartsGrid4v({
  tanqueA: codigo_tanque_a,
  tanqueB: lista_tanques_b,
  diacetiloAcetaldehidoData: datos_diacetilo_acetaldehido,
  esteresAlcoholesData: datos_esteres_alcoholes,
  acetatoIsoamiloData: datos_acetato_isoamilo,
  acetatoEtiloData: datos_acetato_etilo,
  propanolData: datos_propanol,
  alcoholIsoamilicoData: datos_alcohol_isoamilico,
  isobutanolData: datos_isobutanol
}: PropiedadesCuadriculaGraficas4v) {
  const renderizar_grafica_simple = (
    datos_serie: any[],
    color_base: string,
    color_claro: string
  ) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={datos_serie} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...propiedades_ejes} label={etiqueta_eje_x} />
        <YAxis {...propiedades_ejes} />
        <Tooltip contentStyle={estilo_tooltip.contentStyle} formatter={formatear_valor_numerico} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        <Line type="monotone" name={`Tanque A (${codigo_tanque_a})`} dataKey="valorA" stroke={color_base} strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {lista_tanques_b.map((nombre_tanque_b, indice_b) => (
          <Line key={`B-${indice_b}`} type="monotone" name={`Tanque B (${nombre_tanque_b})`} dataKey={`valorB_${indice_b}`} stroke={color_claro} strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <ExpandableCard title="Comparativa de Diacetilo y Acetaldehído" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={datos_diacetilo_acetaldehido} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="vuelta" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} label={{ value: "Diacetilo (ppm)", angle: -90, position: "insideLeft", fill: "#888", dy: 40, dx: -10 }} />
            <YAxis yAxisId="right" orientation="right" {...propiedades_ejes} label={{ value: "Acetaldehído (ppm)", angle: 90, position: "insideRight", fill: "#888", dy: 40, dx: 10 }} />
            <Tooltip contentStyle={estilo_tooltip.contentStyle} formatter={formatear_valor_numerico} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" name={`Diac. Tanque A (${codigo_tanque_a})`} dataKey="diac_A" stroke="#eab308" strokeWidth={4} dot={{ r: 4 }} connectNulls />
            {lista_tanques_b.map((nombre_tanque_b, indice_b) => (
              <Line key={`diac_B_${indice_b}`} yAxisId="left" type="monotone" name={`Diac. Tanque B (${nombre_tanque_b})`} dataKey={`diac_B_${indice_b}`} stroke="#fef08a" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
            <Line yAxisId="right" type="monotone" name={`Acet. Tanque A (${codigo_tanque_a})`} dataKey="acet_A" stroke="#22c55e" strokeWidth={4} dot={{ r: 4 }} connectNulls />
            {lista_tanques_b.map((nombre_tanque_b, indice_b) => (
              <Line key={`acet_B_${indice_b}`} yAxisId="right" type="monotone" name={`Acet. Tanque B (${nombre_tanque_b})`} dataKey={`acet_B_${indice_b}`} stroke="#86efac" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>

      <ExpandableCard title="Comparativa de Ésteres y Alcoholes Generales" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={datos_esteres_alcoholes} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
            <XAxis dataKey="vuelta" {...propiedades_ejes} label={etiqueta_eje_x} />
            <YAxis yAxisId="left" {...propiedades_ejes} label={{ value: "Ésteres (ppm)", angle: -90, position: "insideLeft", fill: "#888", dy: 40, dx: -10 }} />
            <YAxis yAxisId="right" orientation="right" {...propiedades_ejes} label={{ value: "Alcoholes (ppm)", angle: 90, position: "insideRight", fill: "#888", dy: 40, dx: 10 }} />
            <Tooltip contentStyle={estilo_tooltip.contentStyle} formatter={formatear_valor_numerico} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line yAxisId="left" type="monotone" name={`Est. Tanque A (${codigo_tanque_a})`} dataKey="est_A" stroke="#ef4444" strokeWidth={4} dot={{ r: 4 }} connectNulls />
            {lista_tanques_b.map((nombre_tanque_b, indice_b) => (
              <Line key={`est_B_${indice_b}`} yAxisId="left" type="monotone" name={`Est. Tanque B (${nombre_tanque_b})`} dataKey={`est_B_${indice_b}`} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
            <Line yAxisId="right" type="monotone" name={`Alc. Tanque A (${codigo_tanque_a})`} dataKey="alc_A" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} connectNulls />
            {lista_tanques_b.map((nombre_tanque_b, indice_b) => (
              <Line key={`alc_B_${indice_b}`} yAxisId="right" type="monotone" name={`Alc. Tanque B (${nombre_tanque_b})`} dataKey={`alc_B_${indice_b}`} stroke="#93c5fd" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ExpandableCard>

      <ExpandableCard title="Comparativa de Acetato de Isoamilo (ppm)">{renderizar_grafica_simple(datos_acetato_isoamilo, "#ef4444", "#fca5a5")}</ExpandableCard>
      <ExpandableCard title="Comparativa de Acetato de Etilo (ppm)">{renderizar_grafica_simple(datos_acetato_etilo, "#ef4444", "#fca5a5")}</ExpandableCard>
      <ExpandableCard title="Comparativa de Propanol (ppm)">{renderizar_grafica_simple(datos_propanol, "#3b82f6", "#93c5fd")}</ExpandableCard>
      <ExpandableCard title="Comparativa de Alcohol Isoamílico (ppm)">{renderizar_grafica_simple(datos_alcohol_isoamilico, "#3b82f6", "#93c5fd")}</ExpandableCard>
      <ExpandableCard title="Comparativa de Isobutanol (ppm)">{renderizar_grafica_simple(datos_isobutanol, "#3b82f6", "#93c5fd")}</ExpandableCard>
    </div>
  )
}

export { ChartsGrid4v as cuadricula_graficas_4v }
