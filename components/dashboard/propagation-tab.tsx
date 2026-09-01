"use client"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { kpis as mockKpis } from "@/lib/mock-data"
import { CapabilityTable } from "./propagation/capability-table"
import { ViabilityChart } from "./propagation/viability-chart"
import { VitalityCompositionChart } from "./propagation/vitality-composition-chart"
import { CorrelationScatterGrid } from "./propagation/correlation-scatter-grid"
import { CellCountChart } from "./propagation/cell-count-chart"
import { ExecutiveReport } from "./propagation/executive-report"
import { formatExcelDate } from "@/lib/utils"
import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PropagationTab() {
  const [realData, setRealData] = useState<any>(null)

  const [filterFechas, setFilterFechas] = useState<string[]>([])
  const [filterTipos, setFilterTipos] = useState<string[]>([])
  const [filterTanques, setFilterTanques] = useState<string[]>([])
  const [filterDobleteo, setFilterDobleteo] = useState<string[]>([])

  const { data: dbData } = useSWR('/api/get-propagation', fetcher, { refreshInterval: 2000 })

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

  const displayKpis = mockKpis.map(kpi => {
    let val: any = kpi.value
    
    // Mapeo de IDs de KPI a IDs de stats
    let statId = kpi.id
    if (kpi.id === "viabilidad") statId = "viab"

    const stat = realData?.stats?.find((s: any) => s.id === statId)
    
    if (kpi.id === "vitalidad") {
      // Calcular vitalidad (Vigorosas - Muy Vigorosas - Débiles - Muertas)
      // Usaremos los promedios si están disponibles, sino el último válido
      let viab = 0;
      let vigor = 0;
      
      const statViab = realData?.stats?.find((s: any) => s.id === "viab")
      const statVigor = realData?.stats?.find((s: any) => s.id === "vigor")
      
      if (statViab && statVigor) {
        viab = statViab.media
        vigor = statVigor.media
      } else {
        const lastValid = [...propagationPoints].reverse().find(p => p.viabilidad > 0)
        if (lastValid) {
          viab = lastValid.viabilidad
          vigor = lastValid.vigorosas
        }
      }
      
      const vigorosas = Math.max(0, viab - vigor).toFixed(0)
      const muyVigorosas = Math.max(0, vigor).toFixed(0)
      const debiles = Math.max(0, (100 - viab) * 0.6).toFixed(0)
      const muertas = Math.max(0, (100 - viab) * 0.4).toFixed(0)
      
      val = `${vigorosas}-${muyVigorosas}-${debiles}-${muertas}`
      
    } else if (stat && stat.media !== undefined && stat.media !== null) {
      // Usar el promedio de la tabla de capacidad (2 decimales para coincidir exactamente)
      val = stat.media.toFixed(2)
    } else {
      // Fallback a los últimos datos (para cuando no hay stats globales)
      if (kpi.id === "viabilidad") {
        const lastValid = [...propagationPoints].reverse().find(p => p.viabilidad > 0)
        if (lastValid) val = lastValid.viabilidad.toFixed(1)
      }
      if (kpi.id === "conteo") {
        const lastValid = [...propagationPoints].reverse().find(p => p.conteo > 0)
        if (lastValid) val = lastValid.conteo.toFixed(0)
      }
      if (kpi.id === "plato" || kpi.id === "plato_2") {
        const lastValid = [...propagationPoints].reverse().find(p => p.plato > 0)
        if (lastValid) val = lastValid.plato.toFixed(2)
      }
      if (kpi.id === "ph") {
        const lastValid = [...propagationPoints].reverse().find(p => p.ph > 0)
        if (lastValid) val = lastValid.ph.toFixed(2)
      }
      if (kpi.id === "aireacion") {
        const lastValid = [...propagationPoints].reverse().find(p => p.aireacion > 0)
        if (lastValid) val = lastValid.aireacion.toFixed(1)
      }
      if (kpi.id === "zn") {
        const lastValid = [...propagationPoints].reverse().find(p => p.zn > 0)
        if (lastValid) val = lastValid.zn.toFixed(2)
      }
      if (kpi.id === "temp") {
        const lastValid = [...propagationPoints].reverse().find(p => p.temp > 0)
        if (lastValid) val = lastValid.temp.toFixed(1)
      }
    }
    
    return { ...kpi, value: val }
  })

  const row1And2 = displayKpis.slice(0, 8)
  const row3 = displayKpis.slice(8)

  const toggleFilter = (setter: any, current: string[], val: string) => {
    if (current.includes(val)) {
      setter(current.filter(v => v !== val))
    } else {
      setter([...current, val])
    }
  }

  const [isOpenFechas, setIsOpenFechas] = useState(false)
  const [isOpenTipos, setIsOpenTipos] = useState(false)
  const [isOpenTanques, setIsOpenTanques] = useState(false)
  const [isOpenDobleteo, setIsOpenDobleteo] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center bg-[#121212] border border-yellow-500/20 rounded-md p-2">
        <div className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
          Filtros de Lote
        </div>
        <div className="flex gap-4">
          
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs">Fecha:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenFechas(!isOpenFechas)} 
                className="bg-black border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 text-xs rounded px-2 py-1 flex items-center justify-between min-w-[140px]"
              >
                <span className="truncate">
                  {filterFechas.length === 0 ? "Todas las fechas" : `${filterFechas.length} seleccionadas`}
                </span>
                <span className="ml-2 text-[8px]">▼</span>
              </button>
              
              {isOpenFechas && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-48 overflow-y-auto">
                  {uniqueFechas.length === 0 && <span className="text-zinc-600 text-[10px]">Sin datos</span>}
                  
                  {uniqueFechas.length > 0 && (
                    <label className="flex items-center gap-2 text-xs text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1 rounded border-b border-zinc-700 pb-2 mb-1">
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
                    <label key={f} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterFechas.length === 0 || filterFechas.includes(f)} 
                        onChange={() => {
                          if (filterFechas.length === 0) {
                            setFilterFechas([f])
                          } else {
                            toggleFilter(setFilterFechas, filterFechas, f)
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

          <div className="h-4 w-px bg-zinc-700 mx-1" />

          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs">Tipo de Lev:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenTipos(!isOpenTipos)} 
                className="bg-black border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 text-xs rounded px-2 py-1 flex items-center justify-between min-w-[140px]"
              >
                <span className="truncate">
                  {filterTipos.length === 0 ? "Todos los tipos" : filterTipos.join(", ")}
                </span>
                <span className="ml-2 text-[8px]">▼</span>
              </button>
              
              {isOpenTipos && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-48 overflow-y-auto">
                  {uniqueTipos.length === 0 && <span className="text-zinc-600 text-[10px]">Sin datos</span>}
                  
                  {uniqueTipos.length > 0 && (
                    <label className="flex items-center gap-2 text-xs text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1 rounded border-b border-zinc-700 pb-2 mb-1">
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
                    <label key={t} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTipos.length === 0 || filterTipos.includes(t)} 
                        onChange={() => {
                          if (filterTipos.length === 0) {
                            setFilterTipos([t])
                          } else {
                            toggleFilter(setFilterTipos, filterTipos, t)
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

          <div className="h-4 w-px bg-zinc-700 mx-1" />

          <div className="flex items-center gap-2">
            <label className="text-zinc-400 text-xs">Tanque:</label>
            <div className="relative">
              <button 
                onClick={() => setIsOpenTanques(!isOpenTanques)} 
                className="bg-black border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 text-xs rounded px-2 py-1 flex items-center justify-between min-w-[140px]"
              >
                <span className="truncate">
                  {filterTanques.length === 0 ? "Todos los tanques" : filterTanques.join(", ")}
                </span>
                <span className="ml-2 text-[8px]">▼</span>
              </button>
              
              {isOpenTanques && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-48 overflow-y-auto">
                  {uniqueTanques.length === 0 && <span className="text-zinc-600 text-[10px]">Sin datos</span>}
                  
                  {uniqueTanques.length > 0 && (
                    <label className="flex items-center gap-2 text-xs text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1 rounded border-b border-zinc-700 pb-2 mb-1">
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
                    <label key={t} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1 rounded">
                      <input 
                        type="checkbox" 
                        className="accent-yellow-500"
                        checked={filterTanques.length === 0 || filterTanques.includes(t)} 
                        onChange={() => {
                          if (filterTanques.length === 0) {
                            setFilterTanques([t])
                          } else {
                            toggleFilter(setFilterTanques, filterTanques, t)
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

          <div className="h-4 w-px bg-zinc-700 mx-1" />

            <div className="flex items-center gap-2">
              <label className="text-zinc-400 text-xs">Dobleteo:</label>
              <div className="relative">
                <button 
                  onClick={() => setIsOpenDobleteo(!isOpenDobleteo)} 
                  className="bg-black border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 text-xs rounded px-2 py-1 flex items-center justify-between min-w-[140px]"
                >
                  <span className="truncate">
                    {filterDobleteo.length === 0 ? "Todos (Calberg, Antes...)" : filterDobleteo.join(", ")}
                  </span>
                  <span className="ml-2 text-[8px]">▼</span>
                </button>
                
                {isOpenDobleteo && (
                  <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-zinc-700 rounded shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[140px] max-h-48 overflow-y-auto">
                    {uniqueDobleteo.length === 0 && <span className="text-zinc-600 text-[10px]">Sin datos</span>}
                    
                    {uniqueDobleteo.length > 0 && (
                      <label className="flex items-center gap-2 text-xs text-yellow-500 font-bold cursor-pointer hover:bg-zinc-800 p-1 rounded border-b border-zinc-700 pb-2 mb-1">
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
                      <label key={t} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800 p-1 rounded">
                        <input 
                          type="checkbox" 
                          className="accent-yellow-500"
                          checked={filterDobleteo.length === 0 || filterDobleteo.includes(t)} 
                          onChange={() => {
                            if (filterDobleteo.length === 0) {
                              setFilterDobleteo([t])
                            } else {
                              toggleFilter(setFilterDobleteo, filterDobleteo, t)
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
