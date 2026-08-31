"use client"
import { useState, useEffect } from "react"
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
      // Find the stat in the incoming data
      let stat = incomingStats.find(s => s.id === id || (id === "vig" && s.id === "vigor"));
      
      if (!stat) {
        // Fallback to default mock data if not found in incoming stats
        stat = defaultMockData.find(s => s.id === id);
      }
      
      if (stat) {
        // Clone to modify names safely
        stat = { ...stat };
        // Rename for consistency regardless of what the backend sent
        if (id === "conteo") stat.indicatorName = "Conteo Celular (x10^6/mL)";
        if (id === "viab") stat.indicatorName = "Viabilidad (%)";
        if (id === "vig") {
          stat.id = "vig"; // normalize ID
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

  // Sincronizar con el estado global si viene por props
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

  const getMinMax = (id: string) => {
    if (!dynamicData || dynamicData.length === 0) return { min: "-", max: "-" }
    
    let key = ""
    if (id === "viab") key = "viabilidad"
    if (id === "conteo") key = "conteo"
    if (id === "vigor" || id === "vig") key = "vigorosas"
    if (id === "solidos") key = "solidos"
    if (id === "plato") key = "plato"
    if (id === "temp") key = "temp"

    if (!key) return { min: "-", max: "-" }
    
    const vals = dynamicData.map(d => d[key]).filter(v => v !== undefined && !isNaN(v) && v !== 0)
    if (vals.length === 0) return { min: "-", max: "-" }
    return { 
      min: Math.min(...vals).toFixed(2), 
      max: Math.max(...vals).toFixed(2) 
    }
  }

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
      <CardContent className="flex-1 overflow-auto">
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
            {tableData.map((indicator) => {
              const { min, max } = getMinMax(indicator.id)
              return (
                <TableRow key={indicator.id} className="border-zinc-800/50 hover:bg-zinc-800/40">
                  <TableCell className="font-medium text-zinc-200 py-1 whitespace-nowrap">{indicator.indicatorName}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-mono py-1">{indicator.media}</TableCell>
                  <TableCell className="text-right font-mono py-1">{min}</TableCell>
                  <TableCell className="text-right font-mono py-1">{max}</TableCell>
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
