"use client"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { kpis as mockKpis } from "@/lib/mock-data"
import { CapabilityTable } from "./propagation/capability-table"
import { ViabilityChart } from "./propagation/viability-chart"
import { VitalityCompositionChart } from "./propagation/vitality-composition-chart"
import { CorrelationScatterGrid } from "./propagation/correlation-scatter-grid"
import { CultureSummaryColumn } from "./comparison/culture-summary-column"
import * as htmlToImage from 'html-to-image'
import { Camera } from 'lucide-react'
import { CellCountChart } from "./propagation/cell-count-chart"
import { ExecutiveReport } from "./propagation/executive-report"
import { formatExcelDate } from "@/lib/utils"
import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PropagationTab() {
  const [realData, setRealData] = useState<any>(null)

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
  
  const uniqueFechas = Array.from(new Set(rawDataRaw.map((d: any) => d.fecha?.toString().trim()))).filter(f => f && f !== "N/A" && f !== "UNDEFINED") as string[]
  const uniqueTipos = Array.from(new Set(rawDataRaw.map((d: any) => d.tipoLev?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED" && t !== "GENERAL") as string[]
  const uniqueTanques = Array.from(new Set(rawDataRaw.map((d: any) => d.tanque?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]
  const uniqueDobleteo = Array.from(new Set(rawDataRaw.map((d: any) => (d.dobleteo || d.Dobleteo || d.doblete || d.Doblete)?.toString().trim()))).filter(t => t && t !== "N/A" && t !== "UNDEFINED") as string[]

  // Apply filters
  const rawData = rawDataRaw.filter((d: any) => {
    const dFecha = d.fecha?.toString().trim()
    const dTipo = d.tipoLev?.toString().trim().toUpperCase()
    const dTanque = d.tanque?.toString().trim().toUpperCase()
    const dDobleteo = (d.dobleteo || d.Dobleteo || d.doblete || d.Doblete)?.toString().trim()

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
    const lastValid = [...propagationPoints].reverse().find(p => p[key] > 0)
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

  const handleCapture = async () => {
    const element = document.getElementById('capture-dashboard');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Reporte-Propagacion-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-3 min-w-0 bg-[#0a0a0a] p-2 rounded-lg" id="capture-dashboard">
      <div className="flex justify-between items-center bg-[#121212] border border-yellow-500/20 rounded-md p-2">
        <div className="flex items-center gap-4">
          <div className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
            Filtros de Lote
          </div>
          <button 
            onClick={handleCapture}
            className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold"
            title="Capturar pantalla del dashboard"
          >
            <Camera size={12} />
            Captura
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenFechas(false)}>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Fecha:</label>
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
          
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenTipos(false)}>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tipo de Lev:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenTipos(!isOpenTipos)} 
                className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
              >
                <span className="truncate">
                  {filterTipos.length === 0 ? "(Todos)" : `${filterTipos.length} seleccionados`}
                </span>
                <span className="ml-2 text-[10px]">▼</span>
              </button>
              
              {isOpenTipos && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {uniqueTipos.length === 0 && <span className="text-zinc-500 text-xs">Sin datos</span>}
                  
                  {uniqueTipos.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTipos.length === 0} 
                        onChange={() => setFilterTipos([])} 
                      />
                      (Todos)
                    </label>
                  )}

                  {uniqueTipos.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTipos.length === 0 || filterTipos.includes(t)} 
                        onChange={() => {
                          if (filterTipos.length === 0) setFilterTipos([t])
                          else if (filterTipos.includes(t)) setFilterTipos(filterTipos.filter(v => v !== t))
                          else setFilterTipos([...filterTipos, t])
                        }} 
                      />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenTanques(false)}>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tanque:</label>
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
                          if (filterTanques.length === 0) setFilterTanques([t])
                          else if (filterTanques.includes(t)) setFilterTanques(filterTanques.filter(v => v !== t))
                          else setFilterTanques([...filterTanques, t])
                        }} 
                      />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2" onMouseLeave={() => setIsOpenDobleteo(false)}>
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Dobleteo:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenDobleteo(!isOpenDobleteo)} 
                className="bg-black border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none hover:border-yellow-500 focus:border-yellow-500 min-w-[120px] flex justify-between items-center"
              >
                <span className="truncate">
                  {filterDobleteo.length === 0 ? "(Todos)" : `${filterDobleteo.length} seleccionados`}
                </span>
                <span className="ml-2 text-[10px]">▼</span>
              </button>
              
              {isOpenDobleteo && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {uniqueDobleteo.length === 0 && <span className="text-zinc-500 text-xs">Sin datos</span>}
                  
                  {uniqueDobleteo.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1.5 rounded border-b border-zinc-700 pb-2 mb-1">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterDobleteo.length === 0} 
                        onChange={() => setFilterDobleteo([])} 
                      />
                      (Todos)
                    </label>
                  )}

                  {uniqueDobleteo.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterDobleteo.length === 0 || filterDobleteo.includes(t)} 
                        onChange={() => {
                          if (filterDobleteo.length === 0) setFilterDobleteo([t])
                          else if (filterDobleteo.includes(t)) setFilterDobleteo(filterDobleteo.filter(v => v !== t))
                          else setFilterDobleteo([...filterDobleteo, t])
                        }} 
                      />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
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
