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
import { CheckCircle2, AlertTriangle } from "lucide-react"

const analisisCapacidadData = [
  { indicatorName: "Diacetilo Total (ppb)", specification: "≤ 20", media: 15.2, standardDeviation: 3.8, cp: 1.32, cpk: 1.28, pp: 1.25, ppk: 1.21, evaluationStatus: "green" },
  { indicatorName: "Esteres Totales (ppm)", specification: "≤ 25", media: 24.6, standardDeviation: 4.1, cp: 1.02, cpk: 0.96, pp: 0.98, ppk: 0.92, evaluationStatus: "yellow" },
  { indicatorName: "Alcoholes Sup. (ppm)", specification: "≤ 120", media: 112.5, standardDeviation: 14.2, cp: 1.12, cpk: 1.08, pp: 1.06, ppk: 1.02, evaluationStatus: "green" },
  { indicatorName: "Viabilidad (%)", specification: "≥ 95", media: 97.4, standardDeviation: 1.8, cp: 1.67, cpk: 1.49, pp: 1.55, ppk: 1.37, evaluationStatus: "green" },
  { indicatorName: "°P Final (Plato)", specification: "2.5 - 4.0", media: 3.2, standardDeviation: 0.35, cp: 1.58, cpk: 1.40, pp: 1.51, ppk: 1.33, evaluationStatus: "green" },
  { indicatorName: "pH Final", specification: "4.50 - 5.20", media: 4.52, standardDeviation: 0.18, cp: 1.94, cpk: 1.84, pp: 1.88, ppk: 1.78, evaluationStatus: "green" },
  { indicatorName: "Conteo Celular (x10^6)", specification: "≥ 200", media: 210, standardDeviation: 28, cp: 1.28, cpk: 1.12, pp: 1.18, ppk: 1.03, evaluationStatus: "green" }
]

export function KineticsCapabilityReport() {
  return (
    <>
      {/* Análisis de Capacidad */}
      <Card className="lg:col-span-3 border-yellow-500/40 bg-[#121212] text-white flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold tracking-wide text-yellow-500 uppercase">
            Análisis de Capacidad del Proceso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-1">
           <Table className="text-[8px]">
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 p-1 h-auto">INDICADOR</TableHead>
                <TableHead className="text-right text-zinc-400 p-1 h-auto">ESP.</TableHead>
                <TableHead className="text-right text-zinc-400 p-1 h-auto">MEDIA</TableHead>
                <TableHead className="text-right text-zinc-400 p-1 h-auto">Cp</TableHead>
                <TableHead className="text-right text-zinc-400 p-1 h-auto">Cpk</TableHead>
                <TableHead className="text-center text-zinc-400 p-1 h-auto">EVAL.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analisisCapacidadData.map((row) => (
                <TableRow key={row.indicatorName} className="border-zinc-800/50 hover:bg-zinc-800/40">
                  <TableCell className="text-zinc-200 p-1 whitespace-nowrap truncate max-w-[80px]">{row.indicatorName}</TableCell>
                  <TableCell className="text-right font-mono p-1">{row.specification}</TableCell>
                  <TableCell className="text-right font-mono p-1">{row.media}</TableCell>
                  <TableCell className="text-right font-mono p-1">{row.cp}</TableCell>
                  <TableCell className="text-right font-mono p-1">{row.cpk}</TableCell>
                  <TableCell className="text-center p-1">
                    <div className={`mx-auto size-1.5 rounded-full ${row.evaluationStatus === 'green' ? 'bg-green-500' : row.evaluationStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Informe Ejecutivo */}
      <Card className="lg:col-span-2 border-yellow-500/40 bg-[#121212] text-white flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold tracking-wide text-yellow-500 uppercase">
            Informe Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-3 pt-0">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-1 text-[9px] text-zinc-300">
              <CheckCircle2 className="size-3 text-green-500 shrink-0" />
              <span className="leading-snug">La fermentación mostró un comportamiento normal y estable.</span>
            </li>
            <li className="flex items-start gap-1 text-[9px] text-zinc-300">
              <CheckCircle2 className="size-3 text-green-500 shrink-0" />
              <span className="leading-snug">La viabilidad se mantuvo por encima del 95% durante todo el proceso.</span>
            </li>
            <li className="flex items-start gap-1 text-[9px] text-zinc-300">
              <CheckCircle2 className="size-3 text-green-500 shrink-0" />
              <span className="leading-snug">El diacetilo disminuyó a niveles aceptables en la fase de maduración.</span>
            </li>
            <li className="flex items-start gap-1 text-[9px] text-zinc-300">
              <AlertTriangle className="size-3 text-yellow-500 shrink-0" />
              <span className="leading-snug">Los ésteres están cercanos al límite superior, monitorear temperatura.</span>
            </li>
          </ul>

          <div className="mt-3 text-[10px] font-bold text-green-500 uppercase text-center border border-green-500/30 bg-green-500/10 p-1.5 rounded">
            PROCESO CAPAZ (5 de 7 ind. Cpk ≥ 1.00)
          </div>
        </CardContent>
      </Card>
    </>
  )
}
