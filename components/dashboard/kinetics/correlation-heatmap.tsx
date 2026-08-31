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

const heatmapData = [
  { variableName: "°P (Plato)", plato: 1.00, ph: -0.85, temperatura: 0.72, conteo: -0.93, viabilidad: -0.88, diacetilo: 0.76, esteres: -0.61, alcoholes: 0.45 },
  { variableName: "pH", plato: -0.85, ph: 1.00, temperatura: 0.68, conteo: 0.86, viabilidad: 0.83, diacetilo: -0.71, esteres: 0.65, alcoholes: 0.48 },
  { variableName: "Temp. (°C)", plato: 0.72, ph: 0.68, temperatura: 1.00, conteo: 0.74, viabilidad: 0.70, diacetilo: 0.55, esteres: 0.42, alcoholes: 0.36 },
  { variableName: "Conteo Celular", plato: -0.93, ph: 0.86, temperatura: 0.74, conteo: 1.00, viabilidad: 0.92, diacetilo: -0.81, esteres: 0.66, alcoholes: 0.50 },
  { variableName: "Viabilidad", plato: -0.88, ph: 0.83, temperatura: 0.70, conteo: 0.92, viabilidad: 1.00, diacetilo: -0.78, esteres: 0.63, alcoholes: 0.48 },
  { variableName: "Diacetilo", plato: 0.76, ph: -0.71, temperatura: 0.55, conteo: -0.81, viabilidad: -0.78, diacetilo: 1.00, esteres: -0.69, alcoholes: -0.57 },
  { variableName: "Esteres", plato: -0.61, ph: 0.65, temperatura: 0.42, conteo: 0.66, viabilidad: 0.63, diacetilo: -0.69, esteres: 1.00, alcoholes: 0.71 },
  { variableName: "Alcoholes Sup.", plato: 0.45, ph: 0.48, temperatura: 0.36, conteo: 0.50, viabilidad: 0.48, diacetilo: -0.57, esteres: 0.71, alcoholes: 1.00 }
]

function getHeatmapColor(val: number) {
  if (val === 1) return "bg-zinc-800"
  if (val > 0.8) return "bg-green-700/80 text-white"
  if (val > 0.5) return "bg-green-600/60 text-white"
  if (val > 0) return "bg-green-500/30"
  if (val < -0.8) return "bg-red-700/80 text-white"
  if (val < -0.5) return "bg-red-600/60 text-white"
  return "bg-red-500/30"
}

export function CorrelationHeatmap() {
  return (
    <Card className="lg:col-span-3 border-yellow-500/40 bg-[#121212] text-white flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-semibold tracking-wide text-yellow-500 uppercase">
          Correlaciones (Variables Críticas)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-1">
         <Table className="text-[8px] border-collapse">
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="p-1 h-auto text-zinc-400"></TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">°P</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">pH</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Temp</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Conteo</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Viab</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Diac</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Est</TableHead>
              <TableHead className="p-1 h-auto text-center text-zinc-400">Alc</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {heatmapData.map((correlationRow) => (
              <TableRow key={correlationRow.variableName} className="border-none hover:bg-transparent">
                <TableCell className="p-1 text-zinc-300 font-medium whitespace-nowrap">{correlationRow.variableName}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.plato)}`}>{correlationRow.plato.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.ph)}`}>{correlationRow.ph.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.temperatura)}`}>{correlationRow.temperatura.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.conteo)}`}>{correlationRow.conteo.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.viabilidad)}`}>{correlationRow.viabilidad.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.diacetilo)}`}>{correlationRow.diacetilo.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.esteres)}`}>{correlationRow.esteres.toFixed(2)}</TableCell>
                <TableCell className={`p-1 text-center font-mono ${getHeatmapColor(correlationRow.alcoholes)}`}>{correlationRow.alcoholes.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
