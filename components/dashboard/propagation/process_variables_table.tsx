"use client"

/**
 * @fileoverview Tabla resumen de variables del proceso de propagación (Promedio, LC, Mínimo, Máximo).
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
import { processVars as variables_proceso_simuladas } from "@/lib/mock_data"

/**
 * Propiedades de la tabla de variables del proceso.
 */
export interface PropiedadesTablaVariablesProceso {
  dynamicData?: any[]
}

/**
 * Renderiza la tabla resumen de promedios, mínimos y máximos de variables del proceso.
 *
 * @param {PropiedadesTablaVariablesProceso} propiedades - Serie dinámica de propagación.
 * @returns {JSX.Element} Tarjeta con la tabla de variables del proceso.
 */
export function ProcessVariablesTable({
  dynamicData: datos_dinamicos
}: PropiedadesTablaVariablesProceso) {
  let filas_variables_proceso: any[] = variables_proceso_simuladas

  if (datos_dinamicos && datos_dinamicos.length > 0) {
    const calcular_resumen_variable = (
      clave_campo: string,
      etiqueta_variable: string,
      limite_central: number
    ) => {
      const valores_validos = datos_dinamicos
        .map((registro_propagacion) => registro_propagacion[clave_campo])
        .filter((valor_metrica) => valor_metrica !== undefined && !isNaN(valor_metrica))
      const valor_minimo = Math.min(...valores_validos)
      const valor_maximo = Math.max(...valores_validos)
      const valor_promedio =
        valores_validos.reduce(
          (suma_acumulada, valor_actual) => suma_acumulada + valor_actual,
          0
        ) / valores_validos.length
      return {
        variable: etiqueta_variable,
        promedio: valor_promedio.toFixed(2),
        lc: limite_central.toFixed(2),
        min: valor_minimo.toFixed(2),
        max: valor_maximo.toFixed(2)
      }
    }

    filas_variables_proceso = [
      calcular_resumen_variable("viabilidad", "Viabilidad (%)", 95.0),
      calcular_resumen_variable("vigorosas", "Vigorosas (%)", 88.0),
      calcular_resumen_variable("conteo", "Conteo (M/mL)", 180),
      calcular_resumen_variable("plato", "°P Mosto", 8.0),
      calcular_resumen_variable("ph", "pH", 4.8),
      calcular_resumen_variable("temp", "Temp. (°C)", 20.0)
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
            {filas_variables_proceso.map((fila_variable) => (
              <TableRow
                key={fila_variable.variable}
                className="border-zinc-800/50 hover:bg-zinc-800/40"
              >
                <TableCell className="font-medium text-zinc-200 py-1">
                  {fila_variable.variable}
                </TableCell>
                <TableCell className="text-right text-yellow-500 font-mono py-1">
                  {fila_variable.promedio}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">
                  {fila_variable.lc}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">
                  {fila_variable.min || fila_variable.minimo}
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-400 py-1">
                  {fila_variable.max || fila_variable.maximo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { ProcessVariablesTable as tabla_variables_proceso }
