"use client"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { CheckboxFilter } from "./checkbox-filter"
import { CalendarFilter } from "./calendar-filter"
import { kpis as mockKpis } from "@/lib/mock-data"
import { CapabilityTable } from "./propagation/capability-table"
import { ViabilityChart } from "./propagation/viability-chart"
import { VitalityCompositionChart } from "./propagation/vitality-composition-chart"
import { CorrelationScatterGrid } from "./propagation/correlation-scatter-grid"
import { CultureSummaryColumn } from "./comparison/culture-summary-column"
import { CellCountChart } from "./propagation/cell-count-chart"
import { ExecutiveReport } from "./propagation/executive-report"
import { formatExcelDate } from "@/lib/utils"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PropagationTab() {
  const [realData, setRealData] = useState<any>(null)

  // Nuevo estado para el filtro de Código de Cultivo
  const [filterCodigos, setFilterCodigos] = useState<string[]>([])
  const [isOpenCodigos, setIsOpenCodigos] = useState(false)

  const [filterFechas, setFilterFechas] = useState<string[]>([])
  const [isOpenFechas, setIsOpenFechas] = useState(false)
  const [filterTipos, setFilterTipos] = useState<string[]>([])
  const [isOpenTipos, setIsOpenTipos] = useState(false)
  const [filterTanques, setFilterTanques] = useState<string[]>([])
  const [isOpenTanques, setIsOpenTanques] = useState(false)
  const [filterDobleteo, setFilterDobleteo] = useState<string[]>([])
  const [isOpenDobleteo, setIsOpenDobleteo] = useState(false)

  const { data: dbData } = useSWR('/api/get-propagation', fetcher, { 
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000 
  })

  useEffect(() => {
    if (dbData && dbData.stats) {
      setRealData(dbData)
    }
  }, [dbData])

  // Extract data and unique values for filters (Normalized)
  const rawDataRaw = (realData?.rawData || []).map((d: any) => ({
    ...d,
    fecha: formatExcelDate(d.fecha)
  }))
  
  // Agregamos la extracción de códigos únicos
  const uniqueCodigos = Array.from(new Set(rawDataRaw.map((d: any) => (d["Codigo de Cultivo"] || d.codigoCultivo || d.Codigo || d.codigo)?.toString().trim().toUpperCase()))).filter(c => c && c !== "N/A" && c !== "UNDEFINED") as string[]
  const uniqueFechas = Array.from(new Set(rawDataRaw.map((d: any) => d.fecha?.toString().trim()))).filter(f => f && f !== "N/A" && f !== "UNDEFINED") as string[]
  const uniqueTipos = Array.from(new Set(rawDataRaw.map((d: any) => d.tipoLev?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED" && t !== "GENERAL") as string[]
  const uniqueTanques = Array.from(new Set(rawDataRaw.map((d: any) => d.tanque?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]
  const uniqueDobleteo = Array.from(new Set(rawDataRaw.map((d: any) => (d.dobleteo || d.Dobleteo || d.doblete || d.Doblete)?.toString().trim()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]

  // Apply filters
  const rawData = rawDataRaw.filter((d: any) => {
    const dCodigo = (d["Codigo de Cultivo"] || d.codigoCultivo || d.Codigo || d.codigo)?.toString().trim().toUpperCase()
    const dFecha = d.fecha?.toString().trim()
    const dTipo = d.tipoLev?.toString().trim().toUpperCase()
    const dTanque = d.tanque?.toString().trim().toUpperCase()
    const dDobleteo = (d.dobleteo || d.Dobleteo || d.doblete || d.Doblete)?.toString().trim()

    // Filtramos por el Código primero
    if (filterCodigos.length > 0 && !filterCodigos.includes(dCodigo)) return false
    
    if (filterFechas.length > 0 && !filterFechas.includes(dFecha)) return false
    if (filterTipos.length > 0 && !filterTipos.includes(dTipo)) return false
    if (filterTanques.length > 0 && !filterTanques.includes(dTanque)) return false
    if (filterDobleteo.length > 0 && !filterDobleteo.includes(dDobleteo)) return false
    return true
  })

  const propagationPoints = rawData.map((d: any, i: number) => ({
    hora: `${i * 2}h`,
    tanque: d.tanque,
    fecha: d.fecha,
    tipoLev: d.tipoLev,
    viabilidad: d.viab || 0,
    vigorosas: d.vigor || 0,
    conteo: d.conteo || 0,
    plato: d.plato || 0,
    solidos: d.solidos || 0,
    ph: d.ph || 0,
    temp: d.temp || 20,
    debiles: d.debiles,
    muertas: d.muertas,
    aireacion: 10 + (Math.sin(i) * 2),
    zn: 0.15
  }))

  const hasData = propagationPoints.length > 0
  const latestData = hasData ? propagationPoints[propagationPoints.length - 1] : null

  // Helpers to calculate dynamic average from the filtered data
  const getDynamicAvg = (key: string) => {
    const vals = propagationPoints.map((d: any) => d[key]).filter((v: any) => v !== undefined && !isNaN(v) && v !== 0)
    if (vals.length === 0) return null
    return vals.reduce((a: number, b: number) => a + b, 0) / vals.length
  }

  const getDynamicLast = (key: string) => {
    const lastValid = [...propagationPoints].reverse().find((p: any) => p[key] > 0)
    return lastValid ? lastValid[key] : null
  }

  const displayKpis = mockKpis.map(kpi => {
    let val: any = kpi.value
    
    // Mapeo de IDs de KPI a claves de propagationPoints
    let propKey = ""
    if (kpi.id === "conteo") propKey = "conteo"
    if (kpi.id === "viabilidad") propKey = "viabilidad"
    if (kpi.id === "plato") propKey = "solidos"
    if (kpi.id === "plato_2") propKey = "plato"
    if (kpi.id === "ph") propKey = "ph"
    if (kpi.id === "aireacion") propKey = "aireacion"
    if (kpi.id === "zn") propKey = "zn"
    if (kpi.id === "temp") propKey = "temp"
    if (kpi.id === "solidos") propKey = "solidos"
    
    if (kpi.id === "vitalidad") {
      let dynViab = getDynamicAvg("viabilidad") || 0
      let dynVigor = getDynamicAvg("vigorosas") || 0
      
      const vigorosas = Math.max(0, dynViab - dynVigor).toFixed(0)
      const muyVigorosas = Math.max(0, dynVigor).toFixed(0)
      const debiles = Math.max(0, (100 - dynViab) * 0.6).toFixed(0)
      const muertas = Math.max(0, (100 - dynViab) * 0.4).toFixed(0)
      
      val = `${vigorosas}-${muyVigorosas}-${debiles}-${muertas}`
      
    } else {
      // Obtenemos el promedio filtrado, si no hay tomamos el último válido, y si no hay tomamos 0
      const dynAvg = getDynamicAvg(propKey)
      const dynLast = getDynamicLast(propKey)
      
      const numericVal = dynAvg !== null ? dynAvg : (dynLast !== null ? dynLast : 0)
      
      // Ajustamos decimales según el KPI
      if (kpi.id === "conteo") {
        val = numericVal.toFixed(2)
      } else if (kpi.id === "viabilidad" || kpi.id === "solidos") {
        val = numericVal.toFixed(2)
      } else {
        val = numericVal.toFixed(2)
      }
    }
    
    return { ...kpi, value: val }
  })

  const row1And2 = displayKpis.slice(0, 8)
  const row3 = displayKpis.slice(8)

  return (
    <div className="flex flex-col gap-3 min-w-0 bg-[#0a0a0a] p-2 rounded-lg">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-4 relative">

        
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-start xl:justify-end gap-2 w-full">
          <CalendarFilter label="Fecha" options={uniqueFechas} selectedOptions={filterFechas} onChange={setFilterFechas} isOpen={isOpenFechas} setIsOpen={setIsOpenFechas} />
          <CheckboxFilter label="Tipo de Lev" options={uniqueTipos} selectedOptions={filterTipos} onChange={setFilterTipos} isOpen={isOpenTipos} setIsOpen={setIsOpenTipos} />
          <CheckboxFilter label="Código" options={uniqueCodigos} selectedOptions={filterCodigos} onChange={setFilterCodigos} isOpen={isOpenCodigos} setIsOpen={setIsOpenCodigos} />
          <CheckboxFilter label="Tanque" options={uniqueTanques} selectedOptions={filterTanques} onChange={setFilterTanques} isOpen={isOpenTanques} setIsOpen={setIsOpenTanques} />
          <CheckboxFilter label="Dobleteo" options={uniqueDobleteo} selectedOptions={filterDobleteo} onChange={setFilterDobleteo} isOpen={isOpenDobleteo} setIsOpen={setIsOpenDobleteo} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-2 h-fit">
          {displayKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
        <div className="lg:col-span-6 h-full">
          <CapabilityTable onLocalUpdate={setRealData} stats={realData?.stats} lastUpdateGlobal={realData?.ultimaActualizacion} dynamicData={hasData ? propagationPoints : undefined} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 flex flex-col gap-3">
          <ViabilityChart dynamicData={hasData ? propagationPoints : undefined} />
          <CellCountChart dynamicData={hasData ? propagationPoints : undefined} />
        </div>
        <div className="lg:col-span-2 h-full">
          <CorrelationScatterGrid dynamicData={hasData ? propagationPoints : undefined} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="lg:col-span-1">
          <VitalityCompositionChart dynamicData={hasData ? propagationPoints : undefined} />
        </div>
        <div className="lg:col-span-1">
          <ExecutiveReport stats={realData?.stats} />
        </div>
      </div>
    </div>
  )
}