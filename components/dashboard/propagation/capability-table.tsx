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
  { id: "viab", indicatorName: "Viabilidad (%)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "conteo", indicatorName: "Conteo Celular (x10^6/mL)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "vigor", indicatorName: "% Células Vigorosas", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "ph", indicatorName: "pH", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" },
  { id: "plato", indicatorName: "°P en Mosto (Plato)", media: 0, standardDeviation: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, evaluationStatus: "red" }
]

export function CapabilityTable({ onLocalUpdate, stats, lastUpdateGlobal }: { onLocalUpdate?: (data: any) => void, stats?: any[], lastUpdateGlobal?: string }) {
  const [tableData, setTableData] = useState<any[]>(defaultMockData)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  // Sincronizar con el estado global si viene por props
  useEffect(() => {
    if (stats && stats.length > 0) {
      setTableData(stats)
    }
    if (lastUpdateGlobal) {
      setLastUpdate(new Date(lastUpdateGlobal).toLocaleTimeString())
    }
  }, [stats, lastUpdateGlobal])

  const handleLocalUpload = (newStats: any[], rawData?: any[]) => {
    setTableData(newStats);
    setLastUpdate(new Date().toLocaleTimeString());
    if (onLocalUpdate) {
      onLocalUpdate({ stats: newStats, rawData, ultimaActualizacion: new Date().toISOString() });
    }
  }

  return (
    <Card className="lg:col-span-5 border-yellow-500/40 bg-[#121212] text-white flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase">
            Capacidad del Proceso (Últimos Cultivos)
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
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MEDIA</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">DESV. EST.</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cpk</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Pp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Ppk</TableHead>
              <TableHead className="text-center text-zinc-400 py-1 h-auto">EVAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((indicator) => (
              <TableRow key={indicator.id} className="border-zinc-800/50 hover:bg-zinc-800/40">
                <TableCell className="font-medium text-zinc-200 py-1 whitespace-nowrap">{indicator.indicatorName}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.media}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.standardDeviation}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.cp}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.cpk}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.pp}</TableCell>
                <TableCell className="text-right font-mono py-1">{indicator.ppk}</TableCell>
                <TableCell className="text-center py-1">
                  <div className={`mx-auto size-2.5 rounded-full ${indicator.evaluationStatus === 'green' ? 'bg-green-500' : indicator.evaluationStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                </TableCell>
              </TableRow>
            ))}
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
