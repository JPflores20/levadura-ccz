"use client"
import React, { useState } from "react"
import { ExcelProcessorKinetics } from "./kinetics/excel-processor-kinetics"
import useSWR from 'swr'
import { ExpandableCard } from "./expandable-card"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function CineticaTab() {
  // SWR guarda automáticamente en caché. Al quitar el refreshInterval, evitamos consultas innecesarias.
  // Solo volverá a consultar si el usuario cambia de pestaña y regresa, o recarga la página.
  const { data: dbData } = useSWR('/api/get-kinetics', fetcher, { 
    revalidateOnFocus: true,
    dedupingInterval: 60000 // Cachea por 1 minuto mínimo
  })
  const rawData = dbData?.rawData || []

  const uniqueCepas = Array.from(new Set(rawData.map((d: any) => d.cepa?.toString().trim().toUpperCase()))).filter(Boolean) as string[]
  const uniqueLotes = Array.from(new Set(rawData.map((d: any) => d.propagacion?.toString().trim().toUpperCase()))).filter(Boolean) as string[]

  const [filterCepa, setFilterCepa] = useState<string>("TODAS")
  const [filterLote, setFilterLote] = useState<string>("TODOS")

  const filteredData = rawData.filter((d: any) => {
    const cepa = d.cepa?.toString().trim().toUpperCase()
    const lote = d.propagacion?.toString().trim().toUpperCase()
    if (filterCepa !== "TODAS" && cepa !== filterCepa) return false
    if (filterLote !== "TODOS" && lote !== filterLote) return false
    return true
  })

  // Group by Volatil (Diacetilo / Acetaldehido)
  const prepareChartData = (volatilName: string) => {
    const chartData = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    
    for (let i = 0; i <= 10; i++) {
      const point: any = { vuelta: i.toString() }
      
      const fermRows = filteredData.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("FERM")
      })
      const repoRows = filteredData.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        return v.includes(normalizedVolatilName) && (d.etapa || "").toString().toUpperCase().includes("REP")
      })
      
      const fermAvg = fermRows.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / (fermRows.length || 1)
      const repoAvg = repoRows.reduce((acc: number, r: any) => acc + (r.vueltas?.[i] || 0), 0) / (repoRows.length || 1)

      point.fermentacion = fermRows.length > 0 ? fermAvg : null
      point.reposo = repoRows.length > 0 ? repoAvg : null

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

  const renderLineChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Vuelta', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        <Line type="monotone" name="Fermentación" dataKey="fermentacion" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 4 }} connectNulls />
        <Line type="monotone" name="Reposo" dataKey="reposo" stroke={CHART_COLORS.yellow} strokeWidth={2} dot={{ r: 4 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3">
        <ExcelProcessorKinetics />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs uppercase">Cepa:</label>
            <select 
              value={filterCepa}
              onChange={e => setFilterCepa(e.target.value)}
              className="bg-black border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 outline-none"
            >
              <option value="TODAS">TODAS</option>
              {uniqueCepas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs uppercase">Lote (Propagación):</label>
            <select 
              value={filterLote}
              onChange={e => setFilterLote(e.target.value)}
              className="bg-black border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 outline-none"
            >
              <option value="TODOS">TODOS</option>
              {uniqueLotes.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ExpandableCard title="Evolución de Diacetilo por Vuelta (ppm)">
          {renderLineChart(diacetiloData)}
        </ExpandableCard>

        <ExpandableCard title="Evolución de Acetaldehído por Vuelta (ppm)">
          {renderLineChart(acetaldehidoData)}
        </ExpandableCard>

        <ExpandableCard title="Esteres Generales por Vuelta (ppm)">
          {renderLineChart(esteresData)}
        </ExpandableCard>

        <ExpandableCard title="Acetato de Isoamilo por Vuelta (ppm)">
          {renderLineChart(acetatoIsoamiloData)}
        </ExpandableCard>

        <ExpandableCard title="Acetato de Etilo por Vuelta (ppm)">
          {renderLineChart(acetatoEtiloData)}
        </ExpandableCard>

        <ExpandableCard title="Alcoholes Generales por Vuelta (ppm)">
          {renderLineChart(alcoholesData)}
        </ExpandableCard>

        <ExpandableCard title="Propanol por Vuelta (ppm)">
          {renderLineChart(propanolData)}
        </ExpandableCard>

        <ExpandableCard title="Alcohol Isoamílico por Vuelta (ppm)">
          {renderLineChart(alcoholIsoamilicoData)}
        </ExpandableCard>

        <ExpandableCard title="Isobutanol por Vuelta (ppm)">
          {renderLineChart(isobutanolData)}
        </ExpandableCard>
      </div>
    </div>
  )
}
