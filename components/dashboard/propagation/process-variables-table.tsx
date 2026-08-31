"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { processVars as mockProcessVars } from "@/lib/mock-data"

export function ProcessVariablesTable({ dynamicData }: { dynamicData?: any[] }) {
  let displayVars = mockProcessVars;

  if (dynamicData && dynamicData.length > 0) {
    const calcVar = (key: string, name: string, lc: number) => {
      const vals = dynamicData.map(d => d[key]).filter(v => v !== undefined && !isNaN(v))
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      return { variable: name, promedio: avg.toFixed(2), lc: lc.toFixed(2), min: min.toFixed(2), max: max.toFixed(2) }
    }
    
    displayVars = [
      calcVar('viabilidad', 'Viabilidad (%)', 95.0),
      calcVar('vigorosas', 'Vigorosas (%)', 88.0),
      calcVar('conteo', 'Conteo (M/mL)', 180),
      calcVar('plato', '°P Mosto', 8.0),
      calcVar('ph', 'pH', 4.8),
      calcVar('temp', 'Temp. (°C)', 20.0)
    ]
  }

  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase">
          Variables del Proceso – Promedio
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table className="text-[10px]">
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 py-1 h-auto">VARIABLE</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">PROMEDIO</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">LC</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÍNIMO</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÁXIMO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayVars.map((v, i) => (
              <TableRow key={i} className="border-zinc-800/50 hover:bg-zinc-800/40">
                <TableCell className="font-medium text-zinc-200 py-1">{v.variable}</TableCell>
                <TableCell className="text-right text-yellow-500 font-mono py-1">{v.promedio}</TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">{v.lc}</TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">{v.min || v.minimo}</TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">{v.max || v.maximo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
