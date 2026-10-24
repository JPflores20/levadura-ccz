"use client"

/**
 * @fileoverview Tabla de Capacidad del Proceso y Variables (Cp, Cpk, Pp, Ppk) para Propagación
 * con edición persistente de límites LEI/LES en `localStorage`.
 */

import { useState, useEffect, useMemo } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { ExcelProcessor } from "@/components/dashboard/propagation/excel_processor"
import {
  CLAVE_ALMACENAMIENTO_LIMITES,
  LIMITES_ESPECIFICACION_PROCESO,
  FILAS_CAPACIDAD_POR_DEFECTO,
  leer_limites_personalizados,
  ordenar_estadisticas_capacidad,
  calcular_filas_tabla_capacidad
} from "@/lib/services/servicio_tabla_capacidad"

/**
 * Propiedades del componente CapabilityTable.
 */
export interface PropiedadesTablaCapacidad {
  onLocalUpdate?: (paquete_actualizado: any) => void
  stats?: any
  lastUpdateGlobal?: string
  dynamicData?: any[]
}

/**
 * Renderiza la tarjeta de Capacidad del Proceso con límites LEI/LES editables y persistentes.
 *
 * @param {PropiedadesTablaCapacidad} propiedades - Estadísticas, fecha de actualización y puntos filtrados.
 * @returns {JSX.Element} Tarjeta con tabla de capacidad del proceso.
 */
export function CapabilityTable({
  onLocalUpdate: al_actualizar_localmente,
  stats: estadisticas_entrantes,
  lastUpdateGlobal: ultima_actualizacion_global,
  dynamicData: datos_dinamicos
}: PropiedadesTablaCapacidad) {
  const [filas_base_tabla, establecer_filas_base_tabla] = useState<any[]>(FILAS_CAPACIDAD_POR_DEFECTO)
  const [texto_ultima_actualizacion, establecer_texto_ultima_actualizacion] = useState<string>("")
  const [mapa_limites_editables, establecer_mapa_limites_editables] = useState<
    Record<string, { lsl: number; usl: number }>
  >(LIMITES_ESPECIFICACION_PROCESO)
  const [tiene_limites_personalizados, establecer_tiene_limites_personalizados] = useState(false)

  useEffect(() => {
    const limites_guardados = leer_limites_personalizados()
    establecer_mapa_limites_editables(limites_guardados)
    establecer_tiene_limites_personalizados(
      Boolean(window.localStorage.getItem(CLAVE_ALMACENAMIENTO_LIMITES))
    )
  }, [])

  useEffect(() => {
    if (estadisticas_entrantes) {
      establecer_filas_base_tabla(ordenar_estadisticas_capacidad(estadisticas_entrantes))
    }
    if (ultima_actualizacion_global) {
      establecer_texto_ultima_actualizacion(
        new Date(ultima_actualizacion_global).toLocaleTimeString()
      )
    }
  }, [estadisticas_entrantes, ultima_actualizacion_global])

  const actualizar_limite_indicador = (
    id_indicador: string,
    campo_limite: "lsl" | "usl",
    valor_texto: string
  ): void => {
    const numero_limite = parseFloat(valor_texto)
    const valor_final = isNaN(numero_limite) ? 0 : numero_limite
    const nuevos_limites = {
      ...mapa_limites_editables,
      [id_indicador]: {
        ...(mapa_limites_editables[id_indicador] || { lsl: 0, usl: 0 }),
        [campo_limite]: valor_final
      }
    }
    establecer_mapa_limites_editables(nuevos_limites)
    establecer_tiene_limites_personalizados(true)
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO_LIMITES, JSON.stringify(nuevos_limites))
  }

  const restaurar_limites_por_defecto = (): void => {
    window.localStorage.removeItem(CLAVE_ALMACENAMIENTO_LIMITES)
    establecer_mapa_limites_editables({ ...LIMITES_ESPECIFICACION_PROCESO })
    establecer_tiene_limites_personalizados(false)
    toast.success("Límites LEI/LES restaurados a los valores estándar.")
  }

  const manejar_carga_local = (nuevas_estadisticas: any[], registros_crudos?: any[]): void => {
    const estadisticas_ordenadas = ordenar_estadisticas_capacidad(nuevas_estadisticas)
    establecer_filas_base_tabla(estadisticas_ordenadas)
    establecer_texto_ultima_actualizacion(new Date().toLocaleTimeString())
    if (al_actualizar_localmente) {
      al_actualizar_localmente({
        stats: estadisticas_ordenadas,
        rawData: registros_crudos,
        ultimaActualizacion: new Date().toISOString()
      })
    }
  }

  const filas_procesadas_tabla = useMemo(
    () => calcular_filas_tabla_capacidad(filas_base_tabla, datos_dinamicos, mapa_limites_editables),
    [filas_base_tabla, datos_dinamicos, mapa_limites_editables]
  )

  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <div className="flex flex-col">
          <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase">
            Capacidad del Proceso y Variables
          </CardTitle>
          {texto_ultima_actualizacion && (
            <span className="text-[9px] text-zinc-500 mt-0.5">
              Última act. desde Excel: {texto_ultima_actualizacion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tiene_limites_personalizados && (
            <button
              onClick={restaurar_limites_por_defecto}
              className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-[9px] text-zinc-300 hover:bg-zinc-700"
              title="Restaurar límites LEI/LES por defecto"
            >
              <RotateCcw className="size-2.5" />
              Restaurar LEI/LES
            </button>
          )}
          <ExcelProcessor onDataProcessed={manejar_carga_local} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <Table className="text-[10px]">
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 py-1 h-auto">INDICADOR</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MEDIA</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÍN</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">MÁX</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">LEI</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">LES</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">DESV.</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Cpk</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Pp</TableHead>
              <TableHead className="text-right text-zinc-400 py-1 h-auto">Ppk</TableHead>
              <TableHead className="text-center text-zinc-400 py-1 h-auto">EVAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas_procesadas_tabla.map((fila_indicador) => (
              <TableRow key={fila_indicador.id} className="border-zinc-800/50 hover:bg-zinc-800/40">
                <TableCell className="font-medium text-zinc-200 py-1 whitespace-nowrap">{fila_indicador.indicatorName}</TableCell>
                <TableCell className="text-right text-yellow-500 font-mono py-1">{fila_indicador.media}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.min}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.max}</TableCell>
                <TableCell className="text-right py-1">
                  <input type="number" step="any" value={fila_indicador.lsl ?? 0} onChange={(evento) => actualizar_limite_indicador(fila_indicador.id, "lsl", evento.target.value)} className="w-12 rounded border border-zinc-800 bg-black/50 px-1 py-0.5 text-right font-mono text-[10px] text-zinc-300 focus:border-yellow-500 outline-none" />
                </TableCell>
                <TableCell className="text-right py-1">
                  <input type="number" step="any" value={fila_indicador.usl ?? 0} onChange={(evento) => actualizar_limite_indicador(fila_indicador.id, "usl", evento.target.value)} className="w-12 rounded border border-zinc-800 bg-black/50 px-1 py-0.5 text-right font-mono text-[10px] text-zinc-300 focus:border-yellow-500 outline-none" />
                </TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.standardDeviation}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.cp}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.cpk}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.pp}</TableCell>
                <TableCell className="text-right font-mono py-1">{fila_indicador.ppk}</TableCell>
                <TableCell className="text-center py-1">
                  <div className={`mx-auto size-2.5 rounded-full ${fila_indicador.evaluationStatus === "green" ? "bg-green-500" : fila_indicador.evaluationStatus === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { CapabilityTable as tabla_capacidad_proceso }
