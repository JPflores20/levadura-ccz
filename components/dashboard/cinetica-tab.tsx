"use client"

import React, { useState, useMemo } from "react"
import useSWR from 'swr'
import { KpiCard } from "./kpi-card"
import { ExpandableCard } from "./expandable-card"
import { CheckboxFilter } from "./checkbox-filter"
import { CalendarFilter } from "./calendar-filter"
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

  // Función auxiliar para buscar llaves sin importar mayúsculas
  const getProp = (obj: any, keys: string[]) => {
    if (!obj) return null;
    const lowerKeys = keys.map(k => k.toLowerCase().replace(/[\s\.]/g, ''));
    const foundKey = Object.keys(obj).find(k => {
      const kLower = k.toLowerCase().replace(/[\s\.]/g, '');
      return lowerKeys.some(lk => kLower.includes(lk));
    });
    return foundKey ? obj[foundKey] : null;
  }

  // Extracción de valores únicos para los filtros
  const uniqueFechas = Array.from(new Set(rawData.map((d: any) => formatExcelDate(getProp(d, ['Fecha']))))).filter(Boolean) as string[]
  const uniqueEtapas = Array.from(new Set(rawData.map((d: any) => getProp(d, ['Etapa'])?.toString().trim()))).filter(Boolean) as string[]
  const uniqueDias = Array.from(new Set(rawData.map((d: any) => getProp(d, ['Dias', 'Días'])?.toString().trim()))).filter(Boolean) as string[]
  const uniqueTanques = Array.from(new Set(rawData.map((d: any) => getProp(d, ['Tanque', 'TCC', 'Lote', 'Item'])?.toString().trim().toUpperCase()))).filter(Boolean) as string[]
  const uniqueMarcas = Array.from(new Set(rawData.map((d: any) => getProp(d, ['Marca', 'Cepa'])?.toString().trim().toUpperCase()))).filter(Boolean) as string[]

  const [filterFechas, setFilterFechas] = useState<string[]>([])
  const [isOpenFechas, setIsOpenFechas] = useState(false)
  const [filterEtapa, setFilterEtapa] = useState<string[]>([])
  const [isOpenEtapa, setIsOpenEtapa] = useState(false)
  const [filterDias, setFilterDias] = useState<string[]>([])
  const [isOpenDias, setIsOpenDias] = useState(false)
  const [filterTanques, setFilterTanques] = useState<string[]>([])
  const [isOpenTanques, setIsOpenTanques] = useState(false)
  const [filterMarca, setFilterMarca] = useState<string[]>([])
  const [isOpenMarca, setIsOpenMarca] = useState(false)

  // Filtrado de rawData
  const filteredData = rawData.filter((d: any) => {
    const dFecha = formatExcelDate(getProp(d, ['Fecha']))
    const dEtapa = getProp(d, ['Etapa'])?.toString().trim()
    const dDias = getProp(d, ['Dias', 'Días'])?.toString().trim()
    const dTanque = getProp(d, ['Tanque', 'TCC', 'Lote', 'Item'])?.toString().trim().toUpperCase()
    const dMarca = getProp(d, ['Marca', 'Cepa'])?.toString().trim().toUpperCase()

    if (filterFechas.length > 0 && !filterFechas.includes(dFecha)) return false
    if (filterEtapa.length > 0 && !filterEtapa.includes(dEtapa)) return false
    if (filterDias.length > 0 && !filterDias.includes(dDias)) return false
    if (filterTanques.length > 0 && !filterTanques.includes(dTanque)) return false
    if (filterMarca.length > 0 && !filterMarca.includes(dMarca)) return false
    return true
  })

  // Helpers de extraccion de Excel
  const getValFirst = (rows: any[], keywords: string[], exclude?: string[]): number => {
    for (let row of rows) {
      if (!row) continue
      for (let kw of keywords) {
        const kwClean = kw.toLowerCase().replace(/\s+/g,'')
        const key = Object.keys(row).find(k => {
          const kClean = k.toLowerCase().replace(/\s+/g, '')
          if (!kClean.includes(kwClean)) return false
          if (exclude && exclude.some(ex => kClean.includes(ex.toLowerCase().replace(/\s+/g,'')))) return false
          return true
        })
        if (key && row[key] !== undefined && row[key] !== "") {
          const val = parseFloat(row[key])
          if (!isNaN(val)) return val
        }
      }
    }
    return 0
  }

  const getValSingle = (row: any, keywords: string[], exclude?: string[]): number => {
    if (!row) return 0
    for (let kw of keywords) {
      const kwClean = kw.toLowerCase().replace(/\s+/g,'')
      const key = Object.keys(row).find(k => {
        const kClean = k.toLowerCase().replace(/\s+/g, '')
        if (!kClean.includes(kwClean)) return false
        if (exclude && exclude.some(ex => kClean.includes(ex.toLowerCase().replace(/\s+/g,'')))) return false
        return true
      })
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
    { 
      id: "vitalidad", 
      label: "Vitalidad", 
      value: formatKpi(
        getValFirst(filteredData, ["Vitalidad", "Celulas Vigorosas", "Vigorosas", "vigososas"], ["muy"]) + 
        getValFirst(filteredData, ["Muy Vigorosas", "Muy Vig"])
      ), 
      unit: "%", icon: "Activity", status: "ok" 
    }
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

  // Capture function removed

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-cinetica">
      {/* Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3 shadow-lg relative">
        <div className="flex flex-wrap items-center gap-4">
          <CalendarFilter label="Fecha" options={uniqueFechas} selectedOptions={filterFechas} onChange={setFilterFechas} isOpen={isOpenFechas} setIsOpen={setIsOpenFechas} />
          <CheckboxFilter label="Etapa" options={uniqueEtapas} selectedOptions={filterEtapa} onChange={setFilterEtapa} isOpen={isOpenEtapa} setIsOpen={setIsOpenEtapa} />
          <CheckboxFilter label="Días" options={uniqueDias} selectedOptions={filterDias} onChange={setFilterDias} isOpen={isOpenDias} setIsOpen={setIsOpenDias} />
          <CheckboxFilter label="Tanque" options={uniqueTanques} selectedOptions={filterTanques} onChange={setFilterTanques} isOpen={isOpenTanques} setIsOpen={setIsOpenTanques} />
          <CheckboxFilter label="Marca" options={uniqueMarcas} selectedOptions={filterMarca} onChange={setFilterMarca} isOpen={isOpenMarca} setIsOpen={setIsOpenMarca} />
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