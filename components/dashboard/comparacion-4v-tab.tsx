"use client"

import React, { useState } from "react"
import useSWR from 'swr'
import { ExpandableCard } from "./expandable-card"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Comparacion4vTab() {
  const { data: dbData } = useSWR('/api/get-kinetics', fetcher, { 
    revalidateOnFocus: true,
    dedupingInterval: 60000 
  })
  
  const rawData = dbData?.rawData || []

  // Extraer las combinaciones únicas de Cepa + Propagación para identificar cada "Cultivo"
  const uniqueCultivos = Array.from(new Set(rawData.map((d: any) => {
    const cepa = d.cepa?.toString().trim().toUpperCase() || "N/A"
    const prop = d.propagacion?.toString().trim().toUpperCase() || "N/A"
    return `${cepa} - ${prop}`
  }))).filter(c => c !== "N/A - N/A") as string[]

  const [cultivoA, setCultivoA] = useState<string>(uniqueCultivos[0] || "")
  const [cultivoB, setCultivoB] = useState<string>(uniqueCultivos[1] || uniqueCultivos[0] || "")

  // Función para filtrar y extraer la data de un cultivo específico
  const getCultivoData = (cultivoName: string) => {
    if (!cultivoName) return []
    const [cepa, prop] = cultivoName.split(" - ")
    return rawData.filter((d: any) => 
      d.cepa?.toString().trim().toUpperCase() === cepa && 
      d.propagacion?.toString().trim().toUpperCase() === prop
    )
  }

  const dataA = getCultivoData(cultivoA)
  const dataB = getCultivoData(cultivoB)

  // Generar la data para recharts (empalmando Cultivo A y Cultivo B por vuelta)
  const prepareChartData = (volatilName: string) => {
    const chartData = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

    for (let i = 0; i <= 10; i++) {
      const point: any = { vuelta: i.toString() }
      
      // Cultivo A
      const fermRowsA = dataA.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("FERM")
      })
      const repoRowsA = dataA.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("REP")
      })
      point.fermentacionA = fermRowsA.length > 0 ? (fermRowsA.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / fermRowsA.length) : null
      point.reposoA = repoRowsA.length > 0 ? (repoRowsA.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / repoRowsA.length) : null

      // Cultivo B
      const fermRowsB = dataB.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("FERM")
      })
      const repoRowsB = dataB.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("REP")
      })
      point.fermentacionB = fermRowsB.length > 0 ? (fermRowsB.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / fermRowsB.length) : null
      point.reposoB = repoRowsB.length > 0 ? (repoRowsB.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / repoRowsB.length) : null

      chartData.push(point)
    }
    return chartData
  }

  const diacetiloData = prepareChartData("DIACETILO")
  const acetaldehidoData = prepareChartData("ACETALDEHIDO")
  const esteresData = prepareChartData("ESTERES")
  const acetatoIsoamiloData = prepareChartData("ISOAMILO")
  const acetatoEtiloData = prepareChartData("ETILO")
  const alcoholesData = prepareChartData("ALCOHOLES")
  const propanolData = prepareChartData("PROPANOL")
  const alcoholIsoamilicoData = prepareChartData("ISOAMILICO")
  const isobutanolData = prepareChartData("ISOBUTAN")

  const renderComparativeChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        
        {/* Líneas Cultivo A */}
        <Line type="monotone" name={`Ferm. A (${cultivoA})`} dataKey="fermentacionA" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line type="monotone" name={`Reposo A`} dataKey="reposoA" stroke="#93c5fd" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        
        {/* Líneas Cultivo B */}
        <Line type="monotone" name={`Ferm. B (${cultivoB})`} dataKey="fermentacionB" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line type="monotone" name={`Reposo B`} dataKey="reposoB" stroke="#fca5a5" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="flex flex-col gap-4">
      
      {/* Controles de Selección */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-yellow-500/20 p-4 rounded-md shadow-lg">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-blue-500 text-xs font-bold uppercase tracking-wider">🔴 Seleccionar Cultivo A</label>
          <select 
            value={cultivoA}
            onChange={e => setCultivoA(e.target.value)}
            className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueCultivos.map(c => <option key={`A-${c}`} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-red-500 text-xs font-bold uppercase tracking-wider">🔵 Seleccionar Cultivo B</label>
          <select 
            value={cultivoB}
            onChange={e => setCultivoB(e.target.value)}
            className="bg-black border border-red-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="" disabled>Seleccione un lote...</option>
            {uniqueCultivos.map(c => <option key={`B-${c}`} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Gráficas Empalmadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpandableCard title="Comparativa de Diacetilo (ppm)">
          {renderComparativeChart(diacetiloData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetaldehído (ppm)">
          {renderComparativeChart(acetaldehidoData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Esteres Generales (ppm)">
          {renderComparativeChart(esteresData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetato de Isoamilo (ppm)">
          {renderComparativeChart(acetatoIsoamiloData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetato de Etilo (ppm)">
          {renderComparativeChart(acetatoEtiloData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Alcoholes Generales (ppm)">
          {renderComparativeChart(alcoholesData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Propanol (ppm)">
          {renderComparativeChart(propanolData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Alcohol Isoamílico (ppm)">
          {renderComparativeChart(alcoholIsoamilicoData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Isobutanol (ppm)">
          {renderComparativeChart(isobutanolData)}
        </ExpandableCard>
      </div>

    </div>
  )
}
