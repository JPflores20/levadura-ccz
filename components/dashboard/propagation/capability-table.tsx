"use client"
import { useState, useEffect, useMemo } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { firestoreDatabase } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExcelProcessor } from "./excel-processor"
import { calculateMean, calculateStdDev, calculateCpCpk } from "@/lib/statistics"

const LIMITS: Record<string, { lsl: number, usl: number }> = {
  viab: { lsl: 95, usl: 100 },
  conteo: { lsl: 180, usl: 260 },
  vig: { lsl: 88, usl: 100 },
  ph: { lsl: 4.0, usl: 5.5 },
  plato: { lsl: 8, usl: 16 },
  solidos: { lsl: 0, usl: 0 },
  temp: { lsl: 0, usl: 0 }
}

const defaultMockData = [
  { id: "conteo", indicatorName: "Conteo Celular (x10^6/mL)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "viab", indicatorName: "Viabilidad (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "vig", indicatorName: "Vitalidad (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "solidos", indicatorName: "Porcentaje de Sólidos (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "plato", indicatorName: "°P en Mosto", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "temp", indicatorName: "Temperatura del Tanque (°C)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" }
]

export function CapabilityTable({ onLocalUpdate, stats, lastUpdateGlobal, dynamicData }: { onLocalUpdate?: (data: any) => void, stats?: any[], lastUpdateGlobal?: string, dynamicData?: any[] }) {
  const [tableData, setTableData] = useState<any[]>(defaultMockData)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const enforceOrder = (incomingStats: any[]) => {
    const desiredOrder = ["conteo", "viab", "vig", "solidos", "plato", "temp"];
    const ordered: any[] = [];
    
    desiredOrder.forEach(id => {
      let stat = incomingStats.find(s => s.id === id || (id === "vig" && s.id === "vigor"));
      
      if (!stat) {
        stat = defaultMockData.find(s => s.id === id);
      }
      
      if (stat) {
        stat = { ...stat };
        if (id === "conteo") stat.indicatorName = "Conteo Celular (x10^6/mL)";
        if (id === "viab") stat.indicatorName = "Viabilidad (%)";
        if (id === "vig") {
          stat.id = "vig";
          stat.indicatorName = "Vitalidad (%)";
        }
        if (id === "solidos") stat.indicatorName = "Porcentaje de Sólidos (%)";
        if (id === "plato") stat.indicatorName = "°P en Mosto";
        if (id === "temp") stat.indicatorName = "Temperatura del Tanque (°C)";
        
        ordered.push(stat);
      }
    });
    
    return ordered.length > 0 ? ordered : defaultMockData;
  }

  useEffect(() => {
    if (stats && stats.length > 0) {
      setTableData(enforceOrder(stats))
    }
    if (lastUpdateGlobal) {
      setLastUpdate(new Date(lastUpdateGlobal).toLocaleTimeString())
    }
  }, [stats, lastUpdateGlobal])

  const handleLocalUpload = (newStats: any[], rawData?: any[]) => {
    const orderedStats = enforceOrder(newStats);
    setTableData(orderedStats);
    setLastUpdate(new Date().toLocaleTimeString());
    if (onLocalUpdate) {
      onLocalUpdate({ stats: orderedStats, rawData, ultimaActualizacion: new Date().toISOString() });
    }
  }

  const processedTableData = useMemo(() => {
    return tableData.map(indicator => {
      let minStr = "-"
      let maxStr = "-"
      let updatedIndicator = { ...indicator }

      if (dynamicData && dynamicData.length > 0) {
        let key = ""
        if (indicator.id === "viab") key = "viabilidad"
        if (indicator.id === "conteo") key = "conteo"
        if (indicator.id === "vigor" || indicator.id === "vig") key = "vigorosas"
        if (indicator.id === "solidos") key = "solidos"
        if (indicator.id === "plato") key = "plato"
        if (indicator.id === "temp") key = "temp"

        if (key) {
          const vals = dynamicData.map(d => Number(d[key])).filter(v => v !== undefined && !isNaN(v) && v !== 0)
          
          if (vals.length > 0) {
            minStr = Math.min(...vals).toFixed(2)
            maxStr = Math.max(...vals).toFixed(2)

            const limits = LIMITS[indicator.id] || { lsl: 0, usl: 0 }
            const media = calculateMean(vals)
            const std = calculateStdDev(vals, media) || 0.001
            
            let cp = 0, cpk = 0, pp = 0, ppk = 0;
            let status = "red"
            
            if (limits.usl > 0 || limits.lsl > 0) {
              const res = calculateCpCpk(vals, limits.lsl, limits.usl, media, std)
              cp = res.cp; cpk = res.cpk; pp = res.pp; ppk = res.ppk;
              if (cpk >= 1.33) status = "green"
              else if (cpk >= 1.0) status = "yellow"
            }

            updatedIndicator = {
              ...updatedIndicator,
              media: Number(media.toFixed(2)),
              standardDeviation: Number(std.toFixed(2)),
              cp: Number(Math.max(0, cp).toFixed(2)),
              cpk: Number(Math.max(0, cpk).toFixed(2)),
              pp: Number(Math.max(0, pp).toFixed(2)),
              ppk: Number(Math.max(0, ppk).toFixed(2)),
              evaluationStatus: status
            }
          }
        }
      }
      
      return { ...updatedIndicator, min: minStr, max: maxStr }
    })
  }, [tableData, dynamicData])

  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase">
            Capacidad del Proceso y Variables
          </CardTitle>
          {lastUpdate && (
            <span className="text-[9px] text-zinc-500 mt-0.5">
              Última act. desde Excel: {lastUpdate}
            </span>
          )}
        </div>
        <ExcelProcessor onDataProcessed={handleLocalUpload} />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
         <Table className="text-[10px]">
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 py-1 h-auto">INDICADOR</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">PROMEDIO (MEDIA)</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÍNIMO</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÁXIMO</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">DESV. EST.</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cpk</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Pp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Ppk</TableHead>
              <TableHead className="text-center text-zinc-400 py-1 h-auto">EVAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedTableData.map((indicator) => {
              return (
                <TableRow key={indicator.id} className="border-zinc-800/50 hover:bg-zinc-800/40">
                  <TableCell className="font-medium text-zinc-200 py-1 whitespace-nowrap">{indicator.indicatorName}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-mono py-1">{indicator.media}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.min}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.max}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.standardDeviation}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.cp}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.cpk}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.pp}</TableCell>
                  <TableCell className="text-right font-mono py-1">{indicator.ppk}</TableCell>
                  <TableCell className="text-center py-1">
                    <div className={`mx-auto size-2.5 rounded-full ${indicator.evaluationStatus === 'green' ? 'bg-green-500' : indicator.evaluationStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} title={indicator.evaluationStatus === 'green' ? 'Capaz' : indicator.evaluationStatus === 'yellow' ? 'Marginal' : 'No capaz'} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="flex items-center gap-4 mt-2 text-[9px] text-zinc-500">
          <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-green-500"/> Capaz (≥ 1.33)</div>
          <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-yellow-500"/> Marginal (1.00 - 1.33)</div>
          <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-red-500"/> No capaz (&lt; 1.00)</div>
        </div>
      </CardContent>
    </Card>
  )
}
