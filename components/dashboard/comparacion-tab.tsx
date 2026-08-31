"use client"

import React, { useState } from "react"
import useSWR from 'swr'
import { Activity, Droplets, Gauge, Percent } from "lucide-react"
import { CultureSummaryColumn } from "./comparison/culture-summary-column"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ExpandableCard } from "./expandable-card"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ComparacionTab() {
  const { data: dbData } = useSWR('/api/get-propagation', fetcher, { 
    revalidateOnFocus: true,
    dedupingInterval: 60000 
  })
  
  const rawData = dbData?.rawData || []

  // Extraer combinaciones únicas para los lotes (agrupando por tanque, tipoLev y fecha inicial)
  const uniqueLotesMap = new Map()
  rawData.forEach((d: any, index: number) => {
    const label = `${d.tanque || 'N/A'} (${d.tipoLev || 'N/A'} - ${d.fecha || 'N/A'})`
    if (!uniqueLotesMap.has(label)) {
      uniqueLotesMap.set(label, {
        id: index.toString(),
        label,
        data: d
      })
    }
  })
  const uniqueLotes = Array.from(uniqueLotesMap.values())

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

  // Agrupar los lotes por tanque y tipo de levadura para la cinética
  const getBatchData = (selectedId: string) => {
    const selected = uniqueLotes.find((l: any) => l.id === selectedId)
    if (!selected) return []
    return rawData.filter((d: any) => d.tanque === selected.data.tanque && d.tipoLev === selected.data.tipoLev)
  }

  const batchDataA = getBatchData(loteAId)
  const batchDataB = getBatchData(loteBId)

  // Combinar los datos por índice para que Recharts pueda graficar dos líneas empalmadas
  const maxLen = Math.max(batchDataA.length, batchDataB.length)
  const kineticsData = []
  for (let i = 0; i < maxLen; i++) {
    const a = batchDataA[i]
    const b = batchDataB[i]
    kineticsData.push({
      paso: `Muestra ${i + 1}`,
      tooltipA: a ? `${a.fecha || ''} ${a.hora && a.hora !== 'N/A' ? a.hora : ''}`.trim() : null,
      tooltipB: b ? `${b.fecha || ''} ${b.hora && b.hora !== 'N/A' ? b.hora : ''}`.trim() : null,
      viabA: a ? a.viab : null,
      viabB: b ? b.viab : null,
      conteoA: a ? a.conteo : null,
      conteoB: b ? b.conteo : null,
      vigorA: a ? a.vigor : null,
      vigorB: b ? b.vigor : null,
      platoA: a ? a.plato : null,
      platoB: b ? b.plato : null,
    })
  }

  const CustomKineticsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#1a1a1a] border border-zinc-700 p-3 rounded shadow-xl text-xs">
          <p className="font-bold text-yellow-500 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isA = entry.dataKey.endsWith('A')
            const timeLabel = isA ? data.tooltipA : data.tooltipB
            return (
              <div key={index} className="flex flex-col mb-1">
                <span style={{ color: entry.color }} className="font-bold">{entry.name}: {entry.value}</span>
                {timeLabel && <span className="text-zinc-400 text-[10px]">Fecha/Hora: {timeLabel}</span>}
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  const CustomLineChart = ({ dataKeyA, dataKeyB, title, yAxisLabel }: { dataKeyA: string, dataKeyB: string, title: string, yAxisLabel: string }) => (
    <ExpandableCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={kineticsData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis dataKey="paso" {...axisProps} />
          <YAxis {...axisProps} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#888', dy: 40 }} />
          <Tooltip content={<CustomKineticsTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Line type="monotone" dataKey={dataKeyA} name={loteA?.label || "Cultivo A"} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey={dataKeyB} name={loteB?.label || "Cultivo B"} stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        </LineChart>
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

      {/* Resumen Cultivos (KPIs) */}
      <div className="flex flex-col gap-4">
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
        <h2 className="text-sm font-bold text-yellow-500 tracking-widest">CINÉTICA COMPARATIVA (CULTIVO A VS B)</h2>
      </div>

      {/* Grillas Comparativas de Líneas (Cinéticas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomLineChart dataKeyA="conteoA" dataKeyB="conteoB" title="Cinética de Conteo Celular" yAxisLabel="x10^6 Cel/mL" />
        <CustomLineChart dataKeyA="viabA" dataKeyB="viabB" title="Cinética de Viabilidad" yAxisLabel="%" />
        <CustomLineChart dataKeyA="vigorA" dataKeyB="vigorB" title="Cinética de Vitalidad (Vigor)" yAxisLabel="Puntos" />
        <CustomLineChart dataKeyA="platoA" dataKeyB="platoB" title="Cinética de Grados Plato" yAxisLabel="°P" />
      </div>
    </div>
  )
}
