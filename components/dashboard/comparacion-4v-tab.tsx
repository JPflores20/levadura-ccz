"use client"
import React, { useState, useRef, useEffect } from "react"
import useSWR from 'swr'
import { ExpandableCard } from "./expandable-card"
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

  // Unique Marcas
  const uniqueMarcas = Array.from(new Set(statsData.map((d: any) => d.cepa?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A") as string[]
  uniqueMarcas.sort()

  const [marcaA, setMarcaA] = useState<string>("")
  const [marcaB, setMarcaB] = useState<string>("")

  // Unique Tanques A & B based on Marca
  const getTanquesForMarca = (marca: string) => {
    const data = marca ? statsData.filter((d: any) => d.cepa?.toString().trim().toUpperCase() === marca) : statsData
    const tqs = Array.from(new Set(data.map((d: any) => d.tanque?.toString().trim().toUpperCase()))).filter(t => t && t !== "N/A") as string[]
    tqs.sort()
    return tqs
  }

  const tanquesA = getTanquesForMarca(marcaA)
  const tanquesB = getTanquesForMarca(marcaB)

  const [tanqueA, setTanqueA] = useState<string>("")
  const [tanqueB, setTanqueB] = useState<string[]>([])
  const [isOpenTanqueB, setIsOpenTanqueB] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenTanqueB(false)
      }
    }
    if (isOpenTanqueB) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpenTanqueB, setIsOpenTanqueB])

  const colorsB = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#ec4899", "#8b5cf6"]
  const getColorB = (idx: number) => colorsB[idx % colorsB.length]

  React.useEffect(() => {
    if (uniqueMarcas.length > 0) {
      if (!marcaA) setMarcaA(uniqueMarcas[0])
      if (!marcaB) setMarcaB(uniqueMarcas[0])
    }
  }, [uniqueMarcas.length, marcaA, marcaB])

  React.useEffect(() => {
    if (tanquesA.length > 0 && (!tanqueA || !tanquesA.includes(tanqueA))) {
      setTanqueA(tanquesA[0])
    }
  }, [tanquesA, tanqueA])

  React.useEffect(() => {
    if (tanquesB.length > 0) {
      const validTanquesB = tanqueB.filter(t => tanquesB.includes(t))
      if (validTanquesB.length === 0) {
        setTanqueB([tanquesB[0]])
      } else if (validTanquesB.length !== tanqueB.length) {
        setTanqueB(validTanquesB)
      }
    }
  }, [tanquesB, tanqueB])

  const getTanqueData = (t: string) => {
    if (!t) return []
    return statsData.filter((d: any) => (d.tanque?.toString().trim().toUpperCase() === t))
  }

  const dataA = getTanqueData(tanqueA)
  const dataBMap = tanqueB.map(t => ({ name: t, data: getTanqueData(t) }))

  const prepareChartData = (volatilName: string) => {
    const chartData: any[] = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

    let maxFerm = 0;
    let maxRep = 0;
    let hasZeroFerm = false;
    let hasZeroRep = false;

    statsData.forEach((d: any) => {
      const etapa = (d.etapa || "").toString().toUpperCase();
      if (d.vueltas) {
         Object.keys(d.vueltas).forEach(k => {
            const v = parseInt(k);
            if (!isNaN(v)) {
              if (etapa.includes("FERM")) {
                if (v > maxFerm) maxFerm = v;
                if (v === 0) hasZeroFerm = true;
              }
              if (etapa.includes("REP")) {
                if (v > maxRep) maxRep = v;
                if (v === 0) hasZeroRep = true;
              }
            }
         })
      }
    })

    const axisPoints: Array<{ label: string; day: number; isFerm: boolean }> = [];
    const startFerm = hasZeroFerm ? 0 : 1;
    for (let i = startFerm; i <= maxFerm; i++) {
       axisPoints.push({ label: `F${i}`, day: i, isFerm: true });
    }
    const startRep = hasZeroRep ? 0 : 1;
    for (let i = startRep; i <= maxRep; i++) {
       axisPoints.push({ label: `R${i}`, day: i, isFerm: false });
    }

    axisPoints.forEach(pt => {
      const point: any = { vuelta: pt.label }
      
      const filterRows = (dataArr: any[]) => dataArr.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        const e = (d.etapa || "").toString().toUpperCase()
        const isMatchEtapa = pt.isFerm ? e.includes("FERM") : e.includes("REP")
        return v.includes(normalizedVolatilName) && isMatchEtapa && d.vueltas && d.vueltas[pt.day] !== undefined && d.vueltas[pt.day] !== null
      })

      // Tanque A
      const rowsA = filterRows(dataA)
      point.valorA = rowsA.length > 0 ? (rowsA.reduce((acc: number, r: any) => acc + Number(r.vueltas[pt.day]), 0) / rowsA.length) : null

      // Tanque B (multiple)
      dataBMap.forEach((bInfo, idx) => {
        const rowsB = filterRows(bInfo.data)
        point[`valorB_${idx}`] = rowsB.length > 0 ? (rowsB.reduce((acc: number, r: any) => acc + Number(r.vueltas[pt.day]), 0) / rowsB.length) : null
      })

      chartData.push(point)
    })
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

  const renderComparativeChart = (data: any[], baseColor: string, lightColor: string) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días (F=Fermentación, R=Reposo)', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        
        <Line type="monotone" name={`Tanque A (${tanqueA})`} dataKey="valorA" stroke={baseColor} strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`B-${idx}`} type="monotone" name={`Tanque B (${tB})`} dataKey={`valorB_${idx}`} stroke={lightColor} strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderDiacAcetChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días (F=Fermentación, R=Reposo)', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" {...axisProps} label={{ value: 'Diacetilo (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Acetaldehído (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Diacetilo (Left Axis) - Color: Amarillo (Mantequilla) */}
        <Line yAxisId="left" type="monotone" name={`Diac. Tanque A (${tanqueA})`} dataKey="diac_A" stroke="#eab308" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`diac_B_${idx}`} yAxisId="left" type="monotone" name={`Diac. Tanque B (${tB})`} dataKey={`diac_B_${idx}`} stroke="#fef08a" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}

        {/* Acetaldehído (Right Axis) - Color: Verde (Manzana) */}
        <Line yAxisId="right" type="monotone" name={`Acet. Tanque A (${tanqueA})`} dataKey="acet_A" stroke="#22c55e" strokeWidth={4} dot={{ r: 4 }} connectNulls />
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
        <XAxis dataKey="vuelta" {...axisProps} label={{ value: 'Días (F=Fermentación, R=Reposo)', position: 'insideBottom', offset: -10, fill: '#888' }} />
        <YAxis yAxisId="left" {...axisProps} label={{ value: 'Ésteres (ppm)', angle: -90, position: 'insideLeft', fill: '#888', dy: 40, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Alcoholes (ppm)', angle: 90, position: 'insideRight', fill: '#888', dy: 40, dx: 10 }} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={customFormatter} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        
        {/* Esteres (Left Axis) - Color: Rojo */}
        <Line yAxisId="left" type="monotone" name={`Est. Tanque A (${tanqueA})`} dataKey="est_A" stroke="#ef4444" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`est_B_${idx}`} yAxisId="left" type="monotone" name={`Est. Tanque B (${tB})`} dataKey={`est_B_${idx}`} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}

        {/* Alcoholes (Right Axis) - Color: Azul */}
        <Line yAxisId="right" type="monotone" name={`Alc. Tanque A (${tanqueA})`} dataKey="alc_A" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} connectNulls />
        {tanqueB.map((tB, idx) => (
          <Line key={`alc_B_${idx}`} yAxisId="right" type="monotone" name={`Alc. Tanque B (${tB})`} dataKey={`alc_B_${idx}`} stroke="#93c5fd" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  
  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-4v">
      
              {/* Controles Principales */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#121212] border border-zinc-800 p-4 rounded-md shadow-lg items-center justify-between">
          
          {/* Lado A */}
          <div className="flex-1 flex flex-col gap-2 p-2 border border-blue-500/30 rounded">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">Marca A</label>
                <select 
                  value={marcaA}
                  onChange={e => setMarcaA(e.target.value)}
                  className="bg-black border border-blue-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Seleccione marca...</option>
                  {uniqueMarcas.map(m => <option key={`MA-${m}`} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-[2] flex flex-col gap-1">
                <label className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">Tanque A</label>
                <select 
                  value={tanqueA}
                  onChange={e => setTanqueA(e.target.value)}
                  className="bg-black border border-blue-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Seleccione un tanque...</option>
                  {tanquesA.map(c => <option key={`A-${c}`} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Lado B */}
          <div className="flex-1 flex flex-col gap-2 p-2 border border-red-500/30 rounded" ref={dropdownRef}>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Marca B</label>
                <select 
                  value={marcaB}
                  onChange={e => setMarcaB(e.target.value)}
                  className="bg-black border border-red-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-red-500"
                >
                  <option value="" disabled>Seleccione marca...</option>
                  {uniqueMarcas.map(m => <option key={`MB-${m}`} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-[2] flex flex-col gap-1 relative">
                <label className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Tanque(s) B</label>
                <div className="relative w-full">
                  <button 
                    onClick={() => setIsOpenTanqueB(!isOpenTanqueB)}
                    className="w-full bg-black border border-red-500/50 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-red-500 text-left flex justify-between items-center h-[32px]"
                  >
                    <span className="truncate">{tanqueB.length > 0 ? `${tanqueB.length} seleccionados` : "Seleccionar..."}</span>
                    <span className="text-[10px]">?</span>
                  </button>
                  
                  {isOpenTanqueB && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-red-500/50 rounded shadow-xl p-2 z-50 flex flex-col gap-1 w-full max-h-60 overflow-y-auto">
                      {tanquesB.map(f => (
                        <label key={f} className="flex items-center gap-2 text-zinc-300 text-sm hover:bg-zinc-800/50 p-1.5 rounded cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="accent-red-500"
                            checked={tanqueB.includes(f)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTanqueB([...tanqueB, f])
                              } else {
                                setTanqueB(tanqueB.filter(x => x !== f))
                              }
                            }}
                          />
                          <span className="truncate" title={f}>{f}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
          {renderComparativeChart(acetatoIsoamiloData, "#ef4444", "#fca5a5")}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Acetato de Etilo (ppm)">
          {renderComparativeChart(acetatoEtiloData, "#ef4444", "#fca5a5")}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Propanol (ppm)">
          {renderComparativeChart(propanolData, "#3b82f6", "#93c5fd")}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Alcohol Isoamílico (ppm)">
          {renderComparativeChart(alcoholIsoamilicoData, "#3b82f6", "#93c5fd")}
        </ExpandableCard>

        <ExpandableCard title="Comparativa de Isobutanol (ppm)">
          {renderComparativeChart(isobutanolData, "#3b82f6", "#93c5fd")}
        </ExpandableCard>
      </div>

    </div>
  )
}
