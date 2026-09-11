"use client"

import React, { useState } from "react"
import { ExcelProcessorKinetics } from "./kinetics/excel-processor-kinetics"
import useSWR from 'swr'
import { KpiCard } from "./kpi-card"
import { ExpandableCard } from "./expandable-card"
import * as htmlToImage from 'html-to-image'
import { Camera } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { CHART_COLORS, axisProps } from "@/lib/chart-config"
import { formatExcelDate } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function CineticaTab() {
  const { data: dbData } = useSWR('/api/get-kinetics', fetcher, { 
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000 
  })
  const rawData = dbData?.rawData || []

  // Extracción de valores únicos para los filtros
  const uniqueFechas = Array.from(new Set(rawData.map((d: any) => formatExcelDate(d.Fecha || d.fecha)))).filter(Boolean) as string[]
  const uniqueEtapas = Array.from(new Set(rawData.map((d: any) => (d.Etapa || d.etapa)?.toString().trim()))).filter(Boolean) as string[]
  const uniqueDias = Array.from(new Set(rawData.map((d: any) => (d.Dias || d["Días"] || d.dias)?.toString().trim()))).filter(Boolean) as string[]
  const uniqueTanques = Array.from(new Set(rawData.map((d: any) => (d.Tanque || d.TCC || d.Lote || d.Item)?.toString().trim().toUpperCase()))).filter(Boolean) as string[]
  const uniqueMarcas = Array.from(new Set(rawData.map((d: any) => (d.Marca || d.cepa)?.toString().trim().toUpperCase()))).filter(Boolean) as string[]

  const [filterFechas, setFilterFechas] = useState<string[]>([])
  const [isOpenFechas, setIsOpenFechas] = useState(false)
  const [filterEtapa, setFilterEtapa] = useState<string>("TODAS")
  const [filterDias, setFilterDias] = useState<string>("TODOS")
  const [filterTanques, setFilterTanques] = useState<string[]>([])
  const [isOpenTanques, setIsOpenTanques] = useState(false)
  const [filterMarca, setFilterMarca] = useState<string>("TODAS")

  // Filtrado de rawData
  const filteredData = rawData.filter((d: any) => {
    const dFecha = formatExcelDate(d.Fecha || d.fecha)
    const dEtapa = (d.Etapa || d.etapa)?.toString().trim()
    const dDias = (d.Dias || d["Días"] || d.dias)?.toString().trim()
    const dTanque = (d.Tanque || d.TCC || d.Lote || d.Item)?.toString().trim().toUpperCase()
    const dMarca = (d.Marca || d.cepa)?.toString().trim().toUpperCase()

    if (filterFechas.length > 0 && !filterFechas.includes(dFecha)) return false
    if (filterEtapa !== "TODAS" && dEtapa !== filterEtapa) return false
    if (filterDias !== "TODOS" && dDias !== filterDias) return false
    if (filterTanques.length > 0 && !filterTanques.includes(dTanque)) return false
    if (filterMarca !== "TODAS" && dMarca !== filterMarca) return false
    return true
  })

  // Helpers de extraccion de Excel
  const getValFirst = (rows: any[], keywords: string[]): number => {
    for (let row of rows) {
      if (!row) continue
      for (let kw of keywords) {
        const kwClean = kw.toLowerCase().replace(/\s+/g,'')
        const key = Object.keys(row).find(k => k.toLowerCase().replace(/\s+/g,'').includes(kwClean))
        if (key && row[key] !== undefined && row[key] !== "") {
          const val = parseFloat(row[key])
          if (!isNaN(val)) return val
        }
      }
    }
    return 0
  }

  const getValSingle = (row: any, keywords: string[]): number => {
    if (!row) return 0
    for (let kw of keywords) {
      const kwClean = kw.toLowerCase().replace(/\s+/g,'')
      const key = Object.keys(row).find(k => k.toLowerCase().replace(/\s+/g,'').includes(kwClean))
      if (key && row[key] !== undefined && row[key] !== "") {
        const val = parseFloat(row[key])
        if (!isNaN(val)) return val
      }
    }
    return 0
  }

  const formatKpi = (val: number) => val === 0 ? "-" : val.toString()

  // 1. Tarjetas de inicio de fermentación
  const kpiData = [
    { id: "glucosa", label: "% Glucosa", value: formatKpi(getValFirst(filteredData, ["Glucosa"])), unit: "%", icon: "Percent", status: "ok" },
    { id: "fan", label: "FAN Mosto", value: formatKpi(getValFirst(filteredData, ["FAN Mosto", "FAN"])), unit: "mg/L", icon: "FlaskConical", status: "ok" },
    { id: "el", label: "E.L", value: formatKpi(getValFirst(filteredData, ["E.L", "Extracto Limite"])), unit: "°P", icon: "Gauge", status: "ok" },
    { id: "conteo", label: "Conteo Llenado", value: formatKpi(getValFirst(filteredData, ["Conteo de Celulas", "Conteo"])), unit: "x10^6", icon: "Activity", status: "ok" },
    { id: "temp", label: "Temp Llenado", value: formatKpi(getValFirst(filteredData, ["Temperatura de Llenado", "Temp. Llenado", "Temp"])), unit: "°C", icon: "Thermometer", status: "ok" },
    { id: "tiempo", label: "Tiempo Llenado", value: formatKpi(getValFirst(filteredData, ["Tiempo de Llenado", "Tiempo"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "aireacion", label: "Aireación", value: formatKpi(getValFirst(filteredData, ["Aireacion", "Aireación"])), unit: "kg/hl", icon: "Wind", status: "ok" },
    { id: "tempAlm", label: "Temp Almacenaje", value: formatKpi(getValFirst(filteredData, ["Temperatura de Almacenamiento", "Almacenamiento"])), unit: "°C", icon: "Thermometer", status: "ok" },
    { id: "tiempoAlm", label: "Tiempo Almacenaje", value: formatKpi(getValFirst(filteredData, ["Tiempo de Almacenamiento"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "viab", label: "Viabilidad", value: formatKpi(getValFirst(filteredData, ["Viabilidad Primera", "Viabilidad Primer", "Viabilidad"])), unit: "%", icon: "Activity", status: "ok" },
    { id: "vitalidad", label: "Vitalidad", value: formatKpi(getValFirst(filteredData, ["Vitalidad", "Celulas Vigorosas", "Vigorosas"])), unit: "%", icon: "Activity", status: "ok" }
  ]

  // 2. Tabla de Capacidad de Proceso
  const compoundsTable = [
    { id: "esteres", name: "Ésteres", keys: ["Esteres", "Ésteres"] },
    { id: "alcoholes", name: "Alcoholes Superiores", keys: ["Alcoholes Superiores", "Alcoholes"] },
    { id: "diacetilo", name: "Diacetilo", keys: ["Diacetilo"] },
    { id: "acetaldehido", name: "Acetaldehído", keys: ["Acetaldehido"] },
    { id: "dms", name: "DMS", keys: ["DMS"] },
    { id: "acetatoEtilo", name: "Acetato de Etilo", keys: ["Acetato de etilo"] },
    { id: "acetatoIsoamilo", name: "Acetato de Isoamilo", keys: ["Acetato de isoamilo", "Acetato de isoamil"] },
    { id: "propanol", name: "Propanol", keys: ["Propanol"] },
    { id: "isobutanol", name: "Isobutanol", keys: ["Isobutaol", "Isobutanol"] },
    { id: "isoamilico", name: "Alcohol Isoamílico", keys: ["Isoamil alcohol", "Alcohol isoamilico"] }
  ]

  const tableData = compoundsTable.map(comp => {
    // Solución al error ts(7006): especificar (v: number)
    const vals = filteredData.map((d: any) => getValSingle(d, comp.keys)).filter((v: number) => v > 0)
    return {
      name: comp.name,
      // Solución al error ts(7006): especificar (a: number, b: number)
      avg: vals.length ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(2) : "0",
      min: vals.length ? Math.min(...vals).toFixed(2) : "0",
      max: vals.length ? Math.max(...vals).toFixed(2) : "0",
      last: vals.length ? vals[vals.length - 1].toFixed(2) : "0"
    }
  })

  // 3. Preparación de datos para gráficos
  const graphData = filteredData.map((row: any, i: number) => {
    return {
      paso: `Muestra ${i+1}`,
      acetaldehido: getValSingle(row, ["Acetaldehido"]),
      diacetilo: getValSingle(row, ["Diacetilo"]),
      esteres: getValSingle(row, ["Esteres", "Ésteres"]),
      alcoholes: getValSingle(row, ["Alcoholes Superiores"]),
      acetatoEtilo: getValSingle(row, ["Acetato de etilo"]),
      acetatoIsoamilo: getValSingle(row, ["Acetato de isoamilo"]),
      isobutanol: getValSingle(row, ["Isobutaol", "Isobutanol"]),
      propanol: getValSingle(row, ["Propanol"]),
      isoamilico: getValSingle(row, ["Isoamil alcohol", "Alcohol isoamilico"])
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-zinc-700 p-3 rounded shadow-xl text-xs">
          <p className="font-bold text-yellow-500 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col mb-1">
              <span style={{ color: entry.color }} className="font-bold">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const handleCapture = async () => {
    const element = document.getElementById('capture-cinetica');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Reporte-Cinetica-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-cinetica">
      {/* Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3 shadow-lg relative">
        <button 
          onClick={handleCapture}
          className="absolute -top-3 right-4 flex items-center gap-1.5 bg-[#0a0a0a] hover:bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold z-10"
          title="Capturar pantalla"
        >
          <Camera size={12} />
          Captura
        </button>
        <ExcelProcessorKinetics />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenFechas(false)}>
            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Fecha:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenFechas(!isOpenFechas)} 
                className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
              >
                <span className="truncate">
                  {filterFechas.length === 0 ? "(Todas)" : `${filterFechas.length} seleccionadas`}
                </span>
                <span className="ml-2 text-[10px]">▼</span>
              </button>
              
              {isOpenFechas && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {uniqueFechas.length === 0 && <span className="text-zinc-500 text-xs">Sin datos</span>}
                  
                  {uniqueFechas.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterFechas.length === 0} 
                        onChange={() => setFilterFechas([])} 
                      />
                      (Todas)
                    </label>
                  )}

                  {uniqueFechas.map(f => (
                    <label key={f} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterFechas.length === 0 || filterFechas.includes(f)} 
                        onChange={() => {
                          if (filterFechas.length === 0) {
                            setFilterFechas([f])
                          } else {
                            if (filterFechas.includes(f)) {
                              setFilterFechas(filterFechas.filter(v => v !== f))
                            } else {
                              setFilterFechas([...filterFechas, f])
                            }
                          }
                        }} 
                      />
                      {f}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Etapa:</label>
            <select 
              value={filterEtapa}
              onChange={e => setFilterEtapa(e.target.value)}
              className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
            >
              <option value="TODAS">TODAS</option>
              {uniqueEtapas.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Días:</label>
            <select 
              value={filterDias}
              onChange={e => setFilterDias(e.target.value)}
              className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
            >
              <option value="TODOS">TODOS</option>
              {uniqueDias.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenTanques(false)}>
            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Tanque:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenTanques(!isOpenTanques)} 
                className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
              >
                <span className="truncate">
                  {filterTanques.length === 0 ? "(Todos)" : `${filterTanques.length} seleccionados`}
                </span>
                <span className="ml-2 text-[10px]">▼</span>
              </button>
              
              {isOpenTanques && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {uniqueTanques.length === 0 && <span className="text-zinc-500 text-xs">Sin datos</span>}
                  
                  {uniqueTanques.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTanques.length === 0} 
                        onChange={() => setFilterTanques([])} 
                      />
                      (Todos)
                    </label>
                  )}

                  {uniqueTanques.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTanques.length === 0 || filterTanques.includes(t)} 
                        onChange={() => {
                          if (filterTanques.length === 0) {
                            setFilterTanques([t])
                          } else {
                            if (filterTanques.includes(t)) {
                              setFilterTanques(filterTanques.filter(v => v !== t))
                            } else {
                              setFilterTanques([...filterTanques, t])
                            }
                          }
                        }} 
                      />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Marca:</label>
            <select 
              value={filterMarca}
              onChange={e => setFilterMarca(e.target.value)}
              className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-yellow-500"
            >
              <option value="TODAS">TODAS</option>
              {uniqueMarcas.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Lado Izquierdo: Tarjetas KPI */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="border-b border-yellow-500/30 pb-2 mb-2">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Inicio de Fermentación</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-fit">
            {kpiData.map((kpi, idx) => (
              <KpiCard key={idx} kpi={kpi as any} />
            ))}
          </div>
        </div>

        {/* Lado Derecho: Tabla de Capacidad de Proceso */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="border-b border-blue-500/30 pb-2 mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Capacidad de Proceso de la Fermentación</h3>
          </div>
          <div className="bg-[#121212] border border-zinc-800 rounded-lg shadow-lg text-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[240px] custom-scrollbar">
              <table className="w-full text-left relative">
                <thead className="bg-[#1a1a1a] border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Parámetro</th>
                    <th className="px-4 py-3 font-semibold text-right">Mínimo</th>
                    <th className="px-4 py-3 font-semibold text-right">Promedio</th>
                    <th className="px-4 py-3 font-semibold text-right">Máximo</th>
                    <th className="px-4 py-3 font-semibold text-right text-yellow-500">Valor Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-zinc-200">{row.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-400">{row.min}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-blue-400 font-bold">{row.avg}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-400">{row.max}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-yellow-400 font-bold bg-yellow-500/5">{row.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-yellow-500/40 pb-2 mt-4">
        <h2 className="text-sm font-bold text-yellow-500 tracking-widest">EVOLUCIÓN CINÉTICA</h2>
      </div>

      {/* 4 Gráficos Combinados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <ExpandableCard title="Cinética de Acetaldehído y Diacetilo">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="paso" {...axisProps} />
              {/* Eje Y 1 (Izquierdo) */}
              <YAxis yAxisId="left" {...axisProps} orientation="left" stroke={CHART_COLORS.blue} />
              {/* Eje Y 2 (Derecho) */}
              <YAxis yAxisId="right" {...axisProps} orientation="right" stroke={CHART_COLORS.yellow} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line yAxisId="left" type="monotone" name="Acetaldehído" dataKey="acetaldehido" stroke={CHART_COLORS.blue} strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line yAxisId="right" type="monotone" name="Diacetilo Total" dataKey="diacetilo" stroke={CHART_COLORS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>

        <ExpandableCard title="Ésteres y Alcoholes Superiores">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="paso" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" name="Ésteres Generales" dataKey="esteres" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" name="Alcoholes Superiores" dataKey="alcoholes" stroke={CHART_COLORS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>

        <ExpandableCard title="Acetato de Etilo e Isoamilo">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="paso" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" name="Acetato de Etilo" dataKey="acetatoEtilo" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" name="Acetato de Isoamilo" dataKey="acetatoIsoamilo" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>

        <ExpandableCard title="Alcoholes Secundarios">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="paso" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" name="Isobutanol" dataKey="isobutanol" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" name="Propanol" dataKey="propanol" stroke={CHART_COLORS.yellow} strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" name="Alcohol Isoamílico" dataKey="isoamilico" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>

      </div>
    </div>
  )
}