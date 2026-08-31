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

  const diacetiloAcetaldehidoData = diacetiloData.map((d, i) => ({
    vuelta: d.vuelta,
    diac_ferm_A: d.fermentacionA,
    diac_rep_A: d.reposoA,
    diac_ferm_B: d.fermentacionB,
    diac_rep_B: d.reposoB,
    acet_ferm_A: acetaldehidoData[i].fermentacionA,
    acet_rep_A: acetaldehidoData[i].reposoA,
    acet_ferm_B: acetaldehidoData[i].fermentacionB,
    acet_rep_B: acetaldehidoData[i].reposoB,
  }))

  const esteresAlcoholesData = esteresData.map((d, i) => ({
    vuelta: d.vuelta,
    est_ferm_A: d.fermentacionA,
    est_rep_A: d.reposoA,
    est_ferm_B: d.fermentacionB,
    est_rep_B: d.reposoB,
    alc_ferm_A: alcoholesData[i].fermentacionA,
    alc_rep_A: alcoholesData[i].reposoA,
    alc_ferm_B: alcoholesData[i].fermentacionB,
    alc_rep_B: alcoholesData[i].reposoB,
  }))

  const renderComparativeChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        
        <Line type="monotone" name={`Ferm. A (${cultivoA})`} dataKey="fermentacionA" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line type="monotone" name={`Reposo A`} dataKey="reposoA" stroke="#93c5fd" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        
        <Line type="monotone" name={`Ferm. B (${cultivoB})`} dataKey="fermentacionB" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line type="monotone" name={`Reposo B`} dataKey="reposoB" stroke="#fca5a5" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderDiacAcetChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" domain={[200, 1000]} {...axisProps} label={{ value: 'Diacetilo (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 15]} {...axisProps} label={{ value: 'Acetaldehído (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Diacetilo (Left Axis) - Colors: Blue/Red */}
        <Line yAxisId="left" type="monotone" name={`Diac. Ferm A`} dataKey="diac_ferm_A" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Diac. Reposo A`} dataKey="diac_rep_A" stroke="#93c5fd" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Diac. Ferm B`} dataKey="diac_ferm_B" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Diac. Reposo B`} dataKey="diac_rep_B" stroke="#fca5a5" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />

        {/* Acetaldehído (Right Axis) - Colors: Green/Yellow */}
        <Line yAxisId="right" type="monotone" name={`Acet. Ferm A`} dataKey="acet_ferm_A" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Acet. Reposo A`} dataKey="acet_rep_A" stroke="#86efac" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Acet. Ferm B`} dataKey="acet_ferm_B" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Acet. Reposo B`} dataKey="acet_rep_B" stroke="#fef08a" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderEstAlcChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" {...axisProps} label={{ value: 'Ésteres (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Alcoholes (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Esteres (Left Axis) */}
        <Line yAxisId="left" type="monotone" name={`Est. Ferm A`} dataKey="est_ferm_A" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Est. Reposo A`} dataKey="est_rep_A" stroke="#93c5fd" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Est. Ferm B`} dataKey="est_ferm_B" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="left" type="monotone" name={`Est. Reposo B`} dataKey="est_rep_B" stroke="#fca5a5" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />

        {/* Alcoholes (Right Axis) */}
        <Line yAxisId="right" type="monotone" name={`Alc. Ferm A`} dataKey="alc_ferm_A" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Alc. Reposo A`} dataKey="alc_rep_A" stroke="#d8b4fe" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Alc. Ferm B`} dataKey="alc_ferm_B" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        <Line yAxisId="right" type="monotone" name={`Alc. Reposo B`} dataKey="alc_rep_B" stroke="#fdba74" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
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
        <ExpandableCard title="Comparativa de Diacetilo y Acetaldehído" className="lg:col-span-2">
          {renderDiacAcetChart(diacetiloAcetaldehidoData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Ésteres y Alcoholes Generales" className="lg:col-span-2">
          {renderEstAlcChart(esteresAlcoholesData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetato de Isoamilo (ppm)">
          {renderComparativeChart(acetatoIsoamiloData)}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetato de Etilo (ppm)">
          {renderComparativeChart(acetatoEtiloData)}
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
