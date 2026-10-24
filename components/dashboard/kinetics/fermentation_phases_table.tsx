"use client"

/**
 * @fileoverview Tabla de fases de fermentación (Latencia, Crecimiento, Fermentación Activa, Maduración, Estabilización).
 */

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

const lista_fases_fermentacion = [
  { fase: "Latencia", horas: "0 - 8", description: "Adaptación de levadura" },
  { fase: "Crecimiento", horas: "8 - 36", description: "Incremento de población" },
  { fase: "Fermentación Activa", horas: "36 - 96", description: "Consumo de azúcares" },
  { fase: "Maduración", horas: "96 - 144", description: "Reducción de diacetilo" },
  { fase: "Estabilización", horas: "144 - 168", description: "Clarificación y balance" }
]

/**
 * Renderiza la tarjeta con las fases cronológicas de la fermentación.
 *
 * @returns {JSX.Element} Tarjeta con tabla de fases.
 */
export function FermentationPhasesTable() {
  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex-1 overflow-hidden flex flex-col">
      <div className="p-2 border-b border-zinc-800 shrink-0">
        <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">
          Fases de Fermentación
        </h3>
      </div>
      <div className="overflow-auto flex-1 max-h-36">
        <Table className="text-[9px]">
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 py-1 h-auto">FASE</TableHead>
              <TableHead className="text-zinc-400 py-1 h-auto">HORAS</TableHead>
              <TableHead className="text-zinc-400 py-1 h-auto">DESCRIPCIÓN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista_fases_fermentacion.map((registro_fase) => (
              <TableRow
                key={registro_fase.fase}
                className="border-zinc-800/50 hover:bg-zinc-800/40"
              >
                <TableCell className="py-1 text-zinc-200">{registro_fase.fase}</TableCell>
                <TableCell className="py-1 font-mono text-zinc-300">
                  {registro_fase.horas}
                </TableCell>
                <TableCell className="py-1 text-zinc-400">{registro_fase.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export { FermentationPhasesTable as tabla_fases_fermentacion }
