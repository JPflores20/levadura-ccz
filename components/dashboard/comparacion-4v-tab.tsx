"use client"

import React, { useState } from "react"
import useSWR from 'swr'
import { ExpandableCard } from "./expandable-card"
import * as htmlToImage from 'html-to-image'
import { Camera } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"
import { formatExcelDate } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Comparacion4vTab() {
  const { data: dbData } = useSWR('/api/get-kinetics', fetcher, { 
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000 
  })
  
  const rawData = dbData?.rawData || []
  const statsData = dbData?.stats || []

  const uniqueFechas = Array.from(new Set(rawData.map((d: any) => formatExcelDate(d.Fecha || d.fecha)))).filter(Boolean) as string[]
  const uniqueEtapas = Array.from(new Set(rawData.map((d: any) => (d.Etapa || d.etapa)?.toString().trim()))).filter(Boolean) as string[]
  const uniqueTanques = Array.from(new Set(rawData.map((d: any) => (d.Tanque || d.TCC || d.Lote || d.Item)?.toString().trim().toUpperCase()))).filter(Boolean) as string[]
  const uniqueMarcas = Array.from(new Set(rawData.map((d: any) => (d.Marca || d.cepa)?.toString().trim().toUpperCase()))).filter(Boolean) as string[]

  const [filterFecha, setFilterFecha] = useState<string>("TODAS")
  const [filterEtapa, setFilterEtapa] = useState<string>("TODAS")
  const [filterTanque, setFilterTanque] = useState<string>("TODOS")
  const [filterMarca, setFilterMarca] = useState<string>("TODAS")

  const filteredRawData = rawData.filter((d: any) => {
    const fFecha = formatExcelDate(d.Fecha || d.fecha)
    const fEtapa = (d.Etapa || d.etapa)?.toString().trim()
    const fTanque = (d.Tanque || d.TCC || d.Lote || d.Item)?.toString().trim().toUpperCase()
    const fMarca = (d.Marca || d.cepa)?.toString().trim().toUpperCase()

    if (filterFecha !== "TODAS" && fFecha !== filterFecha) return false
    if (filterEtapa !== "TODAS" && fEtapa !== filterEtapa) return false
    if (filterTanque !== "TODOS" && fTanque !== filterTanque) return false
    if (filterMarca !== "TODAS" && fMarca !== filterMarca) return false
    return true
  })

  // Extraer las combinaciones únicas (Fecha - Cepa) del rawData filtrado
  const uniqueCultivos = Array.from(new Set(filteredRawData.map((d: any) => {
    const fecha = formatExcelDate(d.Fecha || d.fecha) || "N/A"
    const cepa = (d.Marca || d.cepa)?.toString().trim().toUpperCase() || "N/A"
    return `${fecha} - ${cepa}`
  }))).filter(c => c !== "N/A - N/A") as string[]

  const [cultivoA, setCultivoA] = useState<string>("")
  const [cultivoB, setCultivoB] = useState<string>("")

  // Auto-seleccionar los primeros cultivos disponibles cuando se cargan los datos
  React.useEffect(() => {
    if (uniqueCultivos.length > 0) {
      if (!uniqueCultivos.includes(cultivoA)) setCultivoA(uniqueCultivos[0])
      if (!uniqueCultivos.includes(cultivoB)) setCultivoB(uniqueCultivos.length > 1 ? uniqueCultivos[1] : uniqueCultivos[0])
    }
  }, [uniqueCultivos.length, cultivoA, cultivoB])

  // Función para filtrar y extraer la data de un cultivo específico
  const getCultivoData = (cultivoName: string) => {
    if (!cultivoName) return []
    const [fecha, cepa] = cultivoName.split(" - ")
    return statsData.filter((d: any) => {
      const dFecha = formatExcelDate(d.fecha?.toString().trim()) || "N/A"
      const dCepa = d.cepa?.toString().trim().toUpperCase() || "N/A"
      return dFecha === fecha && dCepa === cepa
    })
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

  const handleCapture = async () => {
    const element = document.getElementById('capture-4v');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Reporte-Comparacion-4V-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-4v">
      
      {/* Filtros Globales (Fecha, Etapa, Tanque, Marca) */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Fecha</label>
          <select 
            value={filterFecha}
            onChange={e => setFilterFecha(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODAS">TODAS</option>
            {uniqueFechas.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Etapa</label>
          <select 
            value={filterEtapa}
            onChange={e => setFilterEtapa(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODAS">TODAS</option>
            {uniqueEtapas.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tanque</label>
          <select 
            value={filterTanque}
            onChange={e => setFilterTanque(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODOS">TODOS</option>
            {uniqueTanques.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Marca</label>
          <select 
            value={filterMarca}
            onChange={e => setFilterMarca(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-yellow-500"
          >
            <option value="TODAS">TODAS</option>
            {uniqueMarcas.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {/* Controles de Selección */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-yellow-500/20 p-4 rounded-md shadow-lg relative">
        <button 
          onClick={handleCapture}
          className="absolute -top-3 right-4 flex items-center gap-1.5 bg-[#0a0a0a] hover:bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold z-10"
          title="Capturar pantalla"
        >
          <Camera size={12} />
          Captura
        </button>
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
