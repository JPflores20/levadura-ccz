"use client"

import React, { useState } from "react"
import useSWR from 'swr'
import { Activity, Droplets, Gauge, Percent } from "lucide-react"
import { CultureSummaryColumn } from "./comparison/culture-summary-column"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { ExpandableCard } from "./expandable-card"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ComparacionTab() {
  const { data: dbData } = useSWR('/api/get-propagation', fetcher, { 
    revalidateOnFocus: true,
    dedupingInterval: 60000 
  })
  
  const rawData = dbData?.rawData || []

  // Extraer las combinaciones únicas para los lotes
  const uniqueLotes = rawData.map((d: any, index: number) => {
    return {
      id: index.toString(),
      label: `${d.tanque || 'N/A'} (${d.tipoLev || 'N/A'} - ${d.fecha || 'N/A'})`,
      data: d
    }
  })

  const [loteAId, setLoteAId] = useState<string>(uniqueLotes[0]?.id || "")
  const [loteBId, setLoteBId] = useState<string>(uniqueLotes[1]?.id || uniqueLotes[0]?.id || "")

  const loteA = uniqueLotes.find((l: any) => l.id === loteAId)
  const loteB = uniqueLotes.find((l: any) => l.id === loteBId)

  // Generar KPIs para CultureSummaryColumn
  const getKpis = (lote: any) => {
    if (!lote || !lote.data) return []
    const d = lote.data
    return [
      { label: "VIABILIDAD", value: d.viab?.toString() || "0", unit: "%", icon: Percent, status: (d.viab >= 90 ? "ok" : "warn") },
      { label: "VIGOR", value: d.vigor?.toString() || "0", unit: "pts", icon: Activity, status: (d.vigor >= 2 ? "ok" : "warn") },
      { label: "CONTEO", value: d.conteo?.toString() || "0", unit: "x10^6", icon: Droplets, status: "ok" },
      { label: "°P ACTUAL", value: d.plato?.toString() || "0", unit: "°P", icon: Gauge, status: "ok" },
    ]
  }

  const kpisA = getKpis(loteA)
  const kpisB = getKpis(loteB)

  // Datos para las gráficas de barras comparativas
  const barDataViab = [
    { name: 'Viabilidad (%)', CultivoA: loteA?.data?.viab || 0, CultivoB: loteB?.data?.viab || 0 }
  ]
  const barDataConteo = [
    { name: 'Conteo Celular', CultivoA: loteA?.data?.conteo || 0, CultivoB: loteB?.data?.conteo || 0 }
  ]
  const barDataVigor = [
    { name: 'Vigor', CultivoA: loteA?.data?.vigor || 0, CultivoB: loteB?.data?.vigor || 0 }
  ]
  const barDataPlato = [
    { name: 'Grados Plato (°P)', CultivoA: loteA?.data?.plato || 0, CultivoB: loteB?.data?.plato || 0 }
  ]
  const barDataPh = [
    { name: 'pH', CultivoA: loteA?.data?.ph || 0, CultivoB: loteB?.data?.ph || 0 }
  ]

  const CustomBarChart = ({ data, title }: { data: any[], title: string }) => (
    <ExpandableCard title={title}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle.contentStyle} cursor={{fill: 'transparent'}} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Bar dataKey="CultivoA" name={loteA?.label || "Cultivo A"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="CultivoB" name={loteB?.label || "Cultivo B"} fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ExpandableCard>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Controles de Selección */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-yellow-500/20 p-4 rounded-md shadow-lg">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-blue-500 text-xs font-bold uppercase tracking-wider">🔵 Seleccionar Lote A</label>
          <select 
            value={loteAId}
            onChange={e => setLoteAId(e.target.value)}
            className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueLotes.map((l: any) => <option key={`A-${l.id}`} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-red-500 text-xs font-bold uppercase tracking-wider">🔴 Seleccionar Lote B</label>
          <select 
            value={loteBId}
            onChange={e => setLoteBId(e.target.value)}
            className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueLotes.map((l: any) => <option key={`B-${l.id}`} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Resumen Cultivos (KPIs y Gauges) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lado A */}
        <CultureSummaryColumn
          cultureName={`CULTIVO A: ${loteA?.data?.tipoLev || 'N/A'}`}
          accentColor="#3b82f6"
          kpis={kpisA}
          vitalityIndex={loteA?.data?.viab || 0}
          vitalityLabel={loteA?.data?.viab >= 90 ? "Óptimo" : "Bajo"}
          vitalityColor={loteA?.data?.viab >= 90 ? "#22c55e" : "#ef4444"}
          attenuationEfficiency={0} // No hay eficiencia calculada en propagación
          attenuationLabel="N/A"
          attenuationColor="#52525b"
        />

        {/* Lado B */}
        <CultureSummaryColumn
          cultureName={`CULTIVO B: ${loteB?.data?.tipoLev || 'N/A'}`}
          accentColor="#ef4444"
          kpis={kpisB}
          vitalityIndex={loteB?.data?.viab || 0}
          vitalityLabel={loteB?.data?.viab >= 90 ? "Óptimo" : "Bajo"}
          vitalityColor={loteB?.data?.viab >= 90 ? "#22c55e" : "#ef4444"}
          attenuationEfficiency={0}
          attenuationLabel="N/A"
          attenuationColor="#52525b"
        />
      </div>

      {/* Título Comparativa */}
      <div className="flex items-center justify-between border-b border-yellow-500/40 pb-2 mt-2">
        <h2 className="text-sm font-bold text-yellow-500 tracking-widest">COMPARATIVA DE VARIABLES (CULTIVO A VS B)</h2>
      </div>

      {/* Grillas Comparativas de Barras */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <CustomBarChart data={barDataViab} title="Viabilidad (%)" />
        <CustomBarChart data={barDataConteo} title="Conteo Celular (x10^6/mL)" />
        <CustomBarChart data={barDataVigor} title="Vigor" />
        <CustomBarChart data={barDataPlato} title="Grados Plato (°P)" />
        <CustomBarChart data={barDataPh} title="Evolución del pH" />
      </div>
    </div>
  )
}
