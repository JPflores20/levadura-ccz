"use client"
import React, { useState } from "react"
import useSWR from 'swr'
import { ExpandableCard } from "./expandable-card"
import { CheckboxFilter } from "./checkbox-filter"
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
  
  const statsData = dbData?.stats || []

  // Unique Tanques
  const uniqueTanques = Array.from(new Set(statsData.map((d: any) => d.tanque?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A") as string[]
  uniqueTanques.sort()

  const [tanqueA, setTanqueA] = useState<string>(uniqueTanques[0] || "")
  const [tanqueB, setTanqueB] = useState<string[]>([])
  const [isOpenTanqueB, setIsOpenTanqueB] = useState(false)

  const colorsB = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#ec4899", "#8b5cf6"]
  const getColorB = (idx: number) => colorsB[idx % colorsB.length]

  React.useEffect(() => {
    if (uniqueTanques.length > 0) {
      if (!tanqueA) setTanqueA(uniqueTanques[0])
      if (tanqueB.length === 0 && uniqueTanques.length > 1) setTanqueB([uniqueTanques[1]])
    }
  }, [uniqueTanques.length, tanqueA, tanqueB])

  const getTanqueData = (t: string) => {
    if (!t) return []
    return statsData.filter((d: any) => (d.tanque?.toString().trim().toUpperCase() === t))
  }

  const dataA = getTanqueData(tanqueA)
  const dataBMap = tanqueB.map(t => ({ name: t, data: getTanqueData(t) }))

  const prepareChartData = (volatilName: string) => {
    const chartData = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

    // Find the max 'vuelta' across all data to size the X-axis properly
    let maxVuelta = 10;
    statsData.forEach((d: any) => {
      if (d.vueltas) {
         Object.keys(d.vueltas).forEach(k => {
            const v = parseInt(k);
            if (!isNaN(v) && v > maxVuelta) maxVuelta = v;
         })
      }
    })

    for (let i = 0; i <= maxVuelta; i++) {
      const point: any = { vuelta: i.toString() }
      
      // Tanque A
      const rowsA = dataA.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && d.vueltas && d.vueltas[i] !== undefined && d.vueltas[i] !== null
      })
      point.valorA = rowsA.length > 0 ? (rowsA.reduce((acc: number, r: any) => acc + Number(r.vueltas[i]), 0) / rowsA.length) : null

      // Tanque B (multiple)
      dataBMap.forEach((bInfo, idx) => {
        const rowsB = bInfo.data.filter((d: any) => {
          const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
          return v.includes(normalizedVolatilName) && d.vueltas && d.vueltas[i] !== undefined && d.vueltas[i] !== null
        })
        point[`valorB_${idx}`] = rowsB.length > 0 ? (rowsB.reduce((acc: number, r: any) => acc + Number(r.vueltas[i]), 0) / rowsB.length) : null
      })

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

  const diacetiloAcetaldehidoData = diacetiloData.map((d, i) => {
    const base: any = {
      vuelta: d.vuelta,
      diac_A: d.valorA,
      acet_A: acetaldehidoData[i].valorA
    }
    tanqueB.forEach((_, idx) => {
      base[`diac_B_${idx}`] = d[`valorB_${idx}`]
      base[`acet_B_${idx}`] = acetaldehidoData[i][`valorB_${idx}`]
    })
    return base
  })

  const esteresAlcoholesData = esteresData.map((d, i) => {
    const base: any = {
      vuelta: d.vuelta,
      est_A: d.valorA,
      alc_A: alcoholesData[i].valorA
    }
    tanqueB.forEach((_, idx) => {
      base[`est_B_${idx}`] = d[`valorB_${idx}`]
      base[`alc_B_${idx}`] = alcoholesData[i][`valorB_${idx}`]
    })
    return base
  })

  const customFormatter = (val: any) => typeof val === 'number' ? val.toFixed(2) : val;

  const renderComparativeChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días de Fermentación', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        
        <Line type="monotone" name={`Tanque A (${tanqueA})`} dataKey="valorA" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`B-${idx}`} type="monotone" name={`Tanque B (${tB})`} dataKey={`valorB_${idx}`} stroke={getColorB(idx)} strokeWidth={3} dot={{ r: 4 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderDiacAcetChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días de Fermentación', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" {...axisProps} label={{ value: 'Diacetilo (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Acetaldehído (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Diacetilo (Left Axis) - Color: Amarillo (Mantequilla) */}
        <Line yAxisId="left" type="monotone" name={`Diac. Tanque A`} dataKey="diac_A" stroke="#eab308" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`diac_B_${idx}`} yAxisId="left" type="monotone" name={`Diac. Tanque B (${tB})`} dataKey={`diac_B_${idx}`} stroke="#fef08a" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}

        {/* Acetaldehído (Right Axis) - Color: Verde (Manzana) */}
        <Line yAxisId="right" type="monotone" name={`Acet. Tanque A`} dataKey="acet_A" stroke="#22c55e" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`acet_B_${idx}`} yAxisId="right" type="monotone" name={`Acet. Tanque B (${tB})`} dataKey={`acet_B_${idx}`} stroke="#86efac" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderEstAlcChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días de Fermentación', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" {...axisProps} label={{ value: 'Ésteres (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Alcoholes (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Esteres (Left Axis) - Color: Rojo */}
        <Line yAxisId="left" type="monotone" name={`Est. Tanque A`} dataKey="est_A" stroke="#ef4444" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`est_B_${idx}`} yAxisId="left" type="monotone" name={`Est. Tanque B (${tB})`} dataKey={`est_B_${idx}`} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}

        {/* Alcoholes (Right Axis) - Color: Azul */}
        <Line yAxisId="right" type="monotone" name={`Alc. Tanque A`} dataKey="alc_A" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`alc_B_${idx}`} yAxisId="right" type="monotone" name={`Alc. Tanque B (${tB})`} dataKey={`alc_B_${idx}`} stroke="#93c5fd" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
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
      
      {/* Controles Principales */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-blue-500 text-xs font-bold uppercase tracking-wider">🔵 Seleccionar Tanque A</label>
            <select 
              value={tanqueA}
              onChange={e => setTanqueA(e.target.value)}
              className="bg-black border border-blue-500/50 text-zinc-200 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="" disabled>Seleccione un tanque...</option>
              {uniqueTanques.map(c => <option key={`A-${c}`} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <CheckboxFilter 
              label="🔴 Seleccionar Tanque(s) B"
              options={uniqueTanques}
              selectedOptions={tanqueB}
              onChange={setTanqueB}
              isOpen={isOpenTanqueB}
              setIsOpen={setIsOpenTanqueB}
            />
          </div>
        </div>
        
        <button 
          onClick={handleCapture}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded text-xs font-bold transition-colors self-end md:self-center"
        >
          <Camera size={16} />
          CAPTURA
        </button>
      </div>

      {/* Gráficas Empalmadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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
