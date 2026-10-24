"use client"

/**
 * @fileoverview Mapa de calor (Heatmap) de correlaciones entre variables críticas de fermentación.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

const matriz_correlaciones_cinetica = [
  { variableName: "°P (Plato)", plato: 1.0, ph: -0.85, temperatura: 0.72, conteo: -0.93, viabilidad: -0.88, diacetilo: 0.76, esteres: -0.61, alcoholes: 0.45 },
  { variableName: "pH", plato: -0.85, ph: 1.0, temperatura: 0.68, conteo: 0.86, viabilidad: 0.83, diacetilo: -0.71, esteres: 0.65, alcoholes: 0.48 },
  { variableName: "Temp. (°C)", plato: 0.72, ph: 0.68, temperatura: 1.0, conteo: 0.74, viabilidad: 0.70, diacetilo: 0.55, esteres: 0.42, alcoholes: 0.36 },
  { variableName: "Conteo Celular", plato: -0.93, ph: 0.86, temperatura: 0.74, conteo: 1.0, viabilidad: 0.92, diacetilo: -0.81, esteres: 0.66, alcoholes: 0.50 },
  { variableName: "Viabilidad", plato: -0.88, ph: 0.83, temperatura: 0.70, conteo: 0.92, viabilidad: 1.0, diacetilo: -0.78, esteres: 0.63, alcoholes: 0.48 },
  { variableName: "Diacetilo", plato: 0.76, ph: -0.71, temperatura: 0.55, conteo: -0.81, viabilidad: -0.78, diacetilo: 1.0, esteres: -0.69, alcoholes: -0.57 },
  { variableName: "Esteres", plato: -0.61, ph: 0.65, temperatura: 0.42, conteo: 0.66, viabilidad: 0.63, diacetilo: -0.69, esteres: 1.0, alcoholes: 0.71 },
  { variableName: "Alcoholes Sup.", plato: 0.45, ph: 0.48, temperatura: 0.36, conteo: 0.50, viabilidad: 0.48, diacetilo: -0.57, esteres: 0.71, alcoholes: 1.0 }
]

/**
 * Determina la clase CSS de color según la magnitud y signo del coeficiente de correlación.
 *
 * @param {number} coeficiente_correlacion - Valor entre -1 y 1.
 * @returns {string} Clases Tailwind de fondo y texto.
 */
function obtener_color_celda_correlacion(coeficiente_correlacion: number): string {
  if (coeficiente_correlacion === 1) return "bg-zinc-800"
  if (coeficiente_correlacion > 0.8) return "bg-green-700/80 text-white"
  if (coeficiente_correlacion > 0.5) return "bg-green-600/60 text-white"
  if (coeficiente_correlacion > 0) return "bg-green-500/30"
  if (coeficiente_correlacion < -0.8) return "bg-red-700/80 text-white"
  if (coeficiente_correlacion < -0.5) return "bg-red-600/60 text-white"
  return "bg-red-500/30"
}

/**
 * Renderiza la tarjeta con la matriz de correlación de variables críticas.
 *
 * @returns {JSX.Element} Tarjeta con tabla de mapa de calor.
 */
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
            {matriz_correlaciones_cinetica.map((fila_correlacion) => (
              <TableRow
                key={fila_correlacion.variableName}
                className="border-none hover:bg-transparent"
              >
                <TableCell className="p-1 text-zinc-300 font-medium whitespace-nowrap">
                  {fila_correlacion.variableName}
                </TableCell>
                {(
                  [
                    "plato",
                    "ph",
                    "temperatura",
                    "conteo",
                    "viabilidad",
                    "diacetilo",
                    "esteres",
                    "alcoholes"
                  ] as const
                ).map((clave_columna) => (
                  <TableCell
                    key={clave_columna}
                    className={`p-1 text-center font-mono ${obtener_color_celda_correlacion(
                      fila_correlacion[clave_columna]
                    )}`}
                  >
                    {fila_correlacion[clave_columna].toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { CorrelationHeatmap as mapa_calor_correlaciones }
