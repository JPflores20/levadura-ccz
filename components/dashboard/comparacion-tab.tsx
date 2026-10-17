"use client"

import React, { useState, useEffect } from "react"
import useSWR from 'swr'
import { Activity, Droplets, Gauge, Percent } from "lucide-react"
import { CultureSummaryColumn } from "./comparison/culture-summary-column"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ExpandableCard } from "./expandable-card"
import { CheckboxFilter } from "./checkbox-filter"
import { CalendarFilter } from "./calendar-filter"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"
import { formatExcelDate } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ComparacionTab() {
  const { data: dbData } = useSWR('/api/get-propagation', fetcher, { 
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000 
  })
  
  const rawData = dbData?.rawData || []

  // Normalizar datos
  const normalizedRawData = rawData.map((d: any) => ({
    ...d,
    fechaFormateada: formatExcelDate(d.fecha || d.Fecha),
    generacionVal: (d["Gen."] || d.generacion || d.gen || d["Gen"] || d["Generacion"] || d["Generación"] || d.Gen || "N/A").toString().trim(),
    tipoLevVal: (d.tipoLev || d.Tipo || d.tipo || d["Tipo de Lev"] || "N/A").toString().trim().toUpperCase(),
    dobleteoVal: (d.dobleteo || d.Dobleteo || d.doblete || d.Doblete || "N/A").toString().trim(),
    tanqueVal: (d.tanque || d.Tanque || d["Tanque"] || "N/A").toString().trim().toUpperCase()
  }))

  const uniqueGeneraciones = Array.from(new Set(normalizedRawData.map((d: any) => d.generacionVal))).filter(g => g && g !== "N/A" && g !== "UNDEFINED") as string[]
  uniqueGeneraciones.sort()

  const uniqueTipos = Array.from(new Set(normalizedRawData.map((d: any) => d.tipoLevVal))).filter(t => t && t !== "N/A" && t !== "UNDEFINED" && t !== "GENERAL") as string[]
  uniqueTipos.sort()

  const uniqueDobleteos = Array.from(new Set(normalizedRawData.map((d: any) => d.dobleteoVal))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]
  uniqueDobleteos.sort()

  const uniqueTanques = Array.from(new Set(normalizedRawData.map((d: any) => d.tanqueVal))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]
  uniqueTanques.sort()

  const uniqueFechas = Array.from(new Set(normalizedRawData.map((d: any) => d.fechaFormateada))).filter(f => f && f !== "N/A" && f !== "UNDEFINED") as string[]

  // Filtros de selección múltiple
  const [filterGeneracion, setFilterGeneracion] = useState<string[]>([])
  const [isOpenGeneracion, setIsOpenGeneracion] = useState(false)

  const [filterTipo, setFilterTipo] = useState<string[]>([])
  const [isOpenTipo, setIsOpenTipo] = useState(false)

  const [filterDobleteo, setFilterDobleteo] = useState<string[]>([])
  const [isOpenDobleteo, setIsOpenDobleteo] = useState(false)

  const [filterTanque, setFilterTanque] = useState<string[]>([])
  const [isOpenTanque, setIsOpenTanque] = useState(false)

  const [filterFecha, setFilterFecha] = useState<string[]>([])
  const [isOpenFecha, setIsOpenFecha] = useState(false)

  // Extraer combinaciones únicas para los lotes (agrupando por tanque, tipoLev, generacion y código)
  const uniqueLotesMap = new Map()
  normalizedRawData.forEach((d: any, index: number) => {
    // Aplicar filtros a los lotes disponibles
    if (filterGeneracion.length > 0 && !filterGeneracion.includes(d.generacionVal)) return;
    if (filterTipo.length > 0 && !filterTipo.includes(d.tipoLevVal)) return;
    if (filterDobleteo.length > 0 && !filterDobleteo.includes(d.dobleteoVal)) return;
    if (filterTanque.length > 0 && !filterTanque.includes(d.tanqueVal)) return;
    if (filterFecha.length > 0 && !filterFecha.includes(d.fechaFormateada)) return;

    const codigo = d["Codigo de Cultivo"] || d.codigoCultivo || d.Codigo || d.codigo || ""
    const codigoStr = codigo && codigo !== "N/A" ? `${codigo} - ` : ""
    const label = `${d.tanqueVal} - ${codigoStr}Gen: ${d.generacionVal} (${d.tipoLevVal})${d.fechaFormateada && d.fechaFormateada !== 'N/A' ? ` [${d.fechaFormateada}]` : ''}`
    
    if (!uniqueLotesMap.has(label)) {
      uniqueLotesMap.set(label, {
        id: index.toString(),
        label,
        data: d,
        gen: d.generacionVal
      })
    }
  })
  const uniqueLotes = Array.from(uniqueLotesMap.values())

  const [loteAId, setLoteAId] = useState<string>("")
  const [loteBId, setLoteBId] = useState<string>("")

  useEffect(() => {
    if (uniqueLotes.length > 0) {
      if (!loteAId || !uniqueLotes.some(l => l.id === loteAId)) {
        setLoteAId(uniqueLotes[0].id)
      }
      if (!loteBId || !uniqueLotes.some(l => l.id === loteBId)) {
        setLoteBId(uniqueLotes[1]?.id || uniqueLotes[0].id)
      }
    }
  }, [uniqueLotes, loteAId, loteBId])

  const loteA = uniqueLotes.find((l: any) => l.id === loteAId) || uniqueLotes[0]
  const loteB = uniqueLotes.find((l: any) => l.id === loteBId) || uniqueLotes[1] || uniqueLotes[0]

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

  // Agrupar los lotes por Código de Cultivo para la cinética
  const getBatchData = (selectedId: string) => {
    const selected = uniqueLotes.find((l: any) => l.id === selectedId)
    if (!selected) return []
    const targetCodigo = selected.data["Codigo de Cultivo"] || selected.data.codigoCultivo || selected.data.Codigo || selected.data.codigo || "S/C"
    
    return rawData.filter((d: any) => {
      const dCodigo = d["Codigo de Cultivo"] || d.codigoCultivo || d.Codigo || d.codigo || "S/C"
      if (targetCodigo !== "S/C") {
        return dCodigo === targetCodigo
      }
      // Fallback: si no hay código, agrupar por tanque y fecha
      return d.tanque === selected.data.tanque && d.fecha === selected.data.fecha
    })
  }

  const batchDataA = getBatchData(loteAId)
  const batchDataB = getBatchData(loteBId)

  const parseTimestamp = (row: any) => {
    if (!row) return null
    let fVal = row.fecha || row.Fecha
    let hVal = row.hora || row["Hora Inicio"]
    let ms = 0
    let isValid = false
    
    if (fVal) {
      if (typeof fVal === 'number') {
        ms = Math.round((fVal - 25569) * 86400 * 1000)
        isValid = true
      } else {
        const d = new Date(fVal)
        if (!isNaN(d.getTime())) {
          ms = d.getTime()
          isValid = true
        }
      }
    }
    
    if (hVal && typeof hVal === 'number') {
      ms += Math.round(hVal * 86400 * 1000)
      isValid = true
    } else if (hVal && typeof hVal === 'string') {
      const parts = hVal.split(':')
      if (parts.length >= 2) {
        ms += (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60) * 1000
        isValid = true
      }
    }
    return isValid ? ms : null
  }

  const getElapsedTime = (row: any, startMs: number | null, index: number) => {
    if (!row) return null
    if (row["Tiempo Total"] !== undefined) {
      const tt = parseFloat(row["Tiempo Total"])
      if (!isNaN(tt)) return tt
    }
    const currentMs = parseTimestamp(row)
    if (currentMs !== null && startMs !== null) {
      return Math.max(0, (currentMs - startMs) / 3600000) // horas
    }
    return index * 12 // fallback generico si no hay fechas
  }

  const startMsA = batchDataA.length > 0 ? parseTimestamp(batchDataA[0]) : null
  const startMsB = batchDataB.length > 0 ? parseTimestamp(batchDataB[0]) : null

  // Combinar los datos por índice
  const maxLen = Math.max(batchDataA.length, batchDataB.length)
  const kineticsData: any[] = [] // AQUÍ SE CORRIGIÓ EL ERROR DE TYPESCRIPT
  
  for (let i = 0; i < maxLen; i++) {
    const a = batchDataA[i]
    const b = batchDataB[i]
    
    const timeA = getElapsedTime(a, startMsA, i)
    const timeB = getElapsedTime(b, startMsB, i)
    
    // El eje X representará el tiempo de la Muestra A si existe, si no el de la B
    const displayTime = timeA !== null ? timeA : timeB
    
    kineticsData.push({
      paso: displayTime !== null ? `${displayTime.toFixed(1)}h` : `Muestra ${i + 1}`,
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
          <p className="font-bold text-yellow-500 mb-2">Tiempo: {label}</p>
          {payload.map((entry: any, index: number) => {
            const isA = entry.dataKey.endsWith('A')
            const timeLabel = isA ? data.tooltipA : data.tooltipB
            return (
              <div key={index} className="flex flex-col mb-1">
                <span style={{ color: entry.color }} className="font-bold">{entry.name}: {entry.value}</span>
                {timeLabel && <span className="text-zinc-400 text-[10px]">Origen: {timeLabel}</span>}
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
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg">
      
      {/* Filtros Globales y de Selección Combinados */}
      <div className="flex flex-col gap-3 bg-[#121212] border border-yellow-500/20 p-3 rounded-md shadow-lg">
        {/* Barra de Filtros en orden estándar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/80 pb-3">
          <CheckboxFilter label="Gen." options={uniqueGeneraciones} selectedOptions={filterGeneracion} onChange={setFilterGeneracion} isOpen={isOpenGeneracion} setIsOpen={setIsOpenGeneracion} />
          <CheckboxFilter label="Tipo de Levadura" options={uniqueTipos} selectedOptions={filterTipo} onChange={setFilterTipo} isOpen={isOpenTipo} setIsOpen={setIsOpenTipo} />
          <CheckboxFilter label="Dobleteo" options={uniqueDobleteos} selectedOptions={filterDobleteo} onChange={setFilterDobleteo} isOpen={isOpenDobleteo} setIsOpen={setIsOpenDobleteo} />
          <CheckboxFilter label="Tanque" options={uniqueTanques} selectedOptions={filterTanque} onChange={setFilterTanque} isOpen={isOpenTanque} setIsOpen={setIsOpenTanque} />
          <CalendarFilter label="Fecha" options={uniqueFechas} selectedOptions={filterFecha} onChange={setFilterFecha} isOpen={isOpenFecha} setIsOpen={setIsOpenFecha} />
        </div>

        {/* Selectores de Cultivo A y B */}
        <div className="flex flex-col md:flex-row gap-4 pt-1">
          <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
            <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">🔵 Cultivo A (Gen.)</label>
            <select 
              value={loteAId}
              onChange={e => setLoteAId(e.target.value)}
              className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-blue-500 truncate"
            >
              <option value="" disabled>Seleccione un cultivo...</option>
              {uniqueLotes.map((l: any) => <option key={`A-${l.id}`} value={l.id}>{l.label}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
            <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">🔴 Cultivo B (Gen.)</label>
            <select 
              value={loteBId}
              onChange={e => setLoteBId(e.target.value)}
              className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-red-500 truncate"
            >
              <option value="" disabled>Seleccione un cultivo...</option>
              {uniqueLotes.map((l: any) => <option key={`B-${l.id}`} value={l.id}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen Cultivos (KPIs) */}
      <div className="flex flex-col gap-4">
        {/* Lado A */}
        <CultureSummaryColumn
          cultureName={`CULTIVO A: ${loteA?.data?.tipoLevVal || loteA?.data?.tipoLev || 'N/A'} (Gen: ${loteA?.gen || 'N/A'})`}
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
          cultureName={`CULTIVO B: ${loteB?.data?.tipoLevVal || loteB?.data?.tipoLev || 'N/A'} (Gen: ${loteB?.gen || 'N/A'})`}
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