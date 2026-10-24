"use client"

/**
 * @fileoverview Botón e interfaz de carga y exportación de archivos Excel (.xlsx/.xls) para Propagación.
 * Delega la extracción y exportación al servicio `servicio_lector_excel_propagacion`.
 */

import React, { useRef, useState } from "react"
import { Upload, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { RUTAS_API_PANEL } from "@/lib/constantes_api"
import {
  extraer_registros_excel_propagacion,
  exportar_reporte_capacidad_excel
} from "@/lib/services/servicio_lector_excel_propagacion"

/**
 * Propiedades del procesador de archivos Excel de propagación.
 */
export interface PropiedadesProcesadorExcel {
  onDataProcessed: (estadisticas_calculadas: any[], registros_crudos?: any[]) => void
}

/**
 * Renderiza los botones para subir un archivo Excel de propagación y exportar el reporte de capacidad.
 *
 * @param {PropiedadesProcesadorExcel} propiedades - Callback ejecutado al procesar los datos.
 * @returns {JSX.Element} Contenedor con botones Subir Excel y Exportar.
 */
export function ExcelProcessor({
  onDataProcessed: al_procesar_datos
}: PropiedadesProcesadorExcel) {
  const referencia_input_archivo = useRef<HTMLInputElement>(null)
  const [esta_procesando_archivo, establecer_esta_procesando_archivo] = useState(false)
  const { mutate: revalidar_cache_swr } = useSWRConfig()

  /**
   * Envía las filas extraídas de la hoja Excel a `/api/sync-propagation`.
   *
   * @param {any[][]} matriz_filas_excel - Matriz bidimensional leída del archivo Excel.
   */
  const procesar_matriz_excel = async (matriz_filas_excel: any[][]): Promise<void> => {
    const carga_util_extraida = extraer_registros_excel_propagacion(matriz_filas_excel)
    if (!carga_util_extraida) {
      alert("No se encontró el formato esperado en el Excel (Falta columna Viabilidad)")
      return
    }

    if (carga_util_extraida.length > 0) {
      try {
        const respuesta_http = await fetch(RUTAS_API_PANEL.SINCRONIZAR_PROPAGACION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carga_util_extraida)
        })

        if (respuesta_http.ok) {
          const respuesta_api = await respuesta_http.json()
          if (respuesta_api.stats) {
            al_procesar_datos(respuesta_api.stats, carga_util_extraida)
            await revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_PROPAGACION)
          }
        }
      } catch (error_conexion) {
        console.error("Error al conectar con la API local:", error_conexion)
      }
    }
  }

  /**
   * Maneja la selección del archivo Excel desde el explorador de archivos.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} evento_cambio_archivo - Evento del input file.
   */
  const manejar_subida_archivo = (
    evento_cambio_archivo: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const archivo_seleccionado = evento_cambio_archivo.target.files?.[0]
    if (!archivo_seleccionado) return
    establecer_esta_procesando_archivo(true)

    const lector_archivo = new FileReader()
    lector_archivo.onload = (evento_lectura) => {
      try {
        const cadena_binaria = evento_lectura.target?.result
        const libro_excel = XLSX.read(cadena_binaria, { type: "binary" })
        const nombre_hoja = libro_excel.SheetNames.includes("Propagacion_Levadura")
          ? "Propagacion_Levadura"
          : libro_excel.SheetNames[2] || libro_excel.SheetNames[0]

        const hoja_trabajo = libro_excel.Sheets[nombre_hoja]
        const matriz_filas_excel = XLSX.utils.sheet_to_json(hoja_trabajo, {
          header: 1,
          raw: false
        }) as any[][]
        procesar_matriz_excel(matriz_filas_excel)
      } catch (error_lectura) {
        console.error("Error procesando Excel:", error_lectura)
      } finally {
        establecer_esta_procesando_archivo(false)
        if (referencia_input_archivo.current) referencia_input_archivo.current.value = ""
      }
    }
    lector_archivo.readAsBinaryString(archivo_seleccionado)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={referencia_input_archivo}
        onChange={manejar_subida_archivo}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400"
        onClick={() => referencia_input_archivo.current?.click()}
        disabled={esta_procesando_archivo}
      >
        <Upload className="size-3 mr-1" />
        {esta_procesando_archivo ? "Procesando..." : "Subir Excel"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={exportar_reporte_capacidad_excel}
      >
        <Download className="size-3 mr-1" />
        Exportar
      </Button>
    </div>
  )
}

export { ExcelProcessor as procesador_excel_propagacion }
