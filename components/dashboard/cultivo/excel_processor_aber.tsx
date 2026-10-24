"use client"

/**
 * @fileoverview Botón e interfaz para cargar archivos Excel de Validación de Equipos Aber
 * y sincronizarlos con el endpoint `/api/sync-aber`.
 */

import React, { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatear_fecha_excel } from "@/lib/utils"
import { RUTAS_API_PANEL } from "@/lib/constantes_api"

/**
 * Renderiza el control para subir e importar hojas Excel de Validación Aber.
 *
 * @returns {JSX.Element} Contenedor con botón de subida de archivo Excel.
 */
export function ExcelProcessorAber() {
  const referencia_input_archivo = useRef<HTMLInputElement>(null)
  const [esta_procesando_archivo, establecer_esta_procesando_archivo] = useState(false)
  const { mutate: revalidar_cache_swr } = useSWRConfig()

  /**
   * Lee el archivo Excel seleccionado, extrae las filas de LINEA 1 / LINEA 2 y las envía al servidor.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} evento_cambio_archivo - Evento de selección de archivo.
   */
  const manejar_subida_archivo_aber = (
    evento_cambio_archivo: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const archivo_seleccionado = evento_cambio_archivo.target.files?.[0]
    if (!archivo_seleccionado) return
    establecer_esta_procesando_archivo(true)

    const identificador_toast = toast.loading("Procesando Excel de Validación Abber...")
    const lector_archivo = new FileReader()

    lector_archivo.onload = (evento_lectura) => {
      try {
        const cadena_binaria = evento_lectura.target?.result
        const libro_excel = XLSX.read(cadena_binaria, { type: "binary" })
        const nombre_primera_hoja = libro_excel.SheetNames[0]
        const hoja_trabajo = libro_excel.Sheets[nombre_primera_hoja]
        const matriz_filas_excel = XLSX.utils.sheet_to_json(hoja_trabajo, {
          header: 1,
          raw: false
        }) as any[][]

        const indice_fila_encabezados = 2
        const filas_datos = matriz_filas_excel.slice(indice_fila_encabezados + 1)
        const registros_aber_procesados: any[] = []

        filas_datos.forEach((fila_actual) => {
          if (!fila_actual || fila_actual.length === 0) return
          const texto_linea = fila_actual[0]?.toString().trim()
          if (!texto_linea || !texto_linea.toUpperCase().includes("LINEA")) return

          const texto_marca = fila_actual[1]?.toString().trim() || "N/A"
          const texto_turno = fila_actual[3]?.toString().trim() || "N/A"
          const fecha_normalizada = formatear_fecha_excel(fila_actual[4])

          const promedio_viabilidad =
            parseFloat(fila_actual[9]?.toString().replace("%", "")) || 0
          const promedio_conteo_lac = parseFloat(fila_actual[13]?.toString()) || 0
          const conteo_equipo_aber = parseFloat(fila_actual[14]?.toString()) || 0
          const diferencia_porcentual = parseFloat(fila_actual[15]?.toString()) || 0
          const promedio_solidos = parseFloat(fila_actual[21]?.toString()) || 0

          if (conteo_equipo_aber === 0 && promedio_conteo_lac === 0) return

          registros_aber_procesados.push({
            linea: texto_linea,
            marca: texto_marca,
            turno: texto_turno,
            fecha: fecha_normalizada,
            viabilidadAvg: promedio_viabilidad,
            conteoLacAvg: promedio_conteo_lac,
            conteoAber: conteo_equipo_aber,
            diferencia: diferencia_porcentual,
            solidosAvg: promedio_solidos
          })
        })

        if (registros_aber_procesados.length === 0) {
          toast.error("No se encontraron filas con datos válidos de Abber.", {
            id: identificador_toast
          })
          establecer_esta_procesando_archivo(false)
          return
        }

        fetch(RUTAS_API_PANEL.SINCRONIZAR_ABER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registros_aber_procesados)
        })
          .then((respuesta_http) => respuesta_http.json())
          .then(() => {
            revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_ABER)
            toast.success(
              `¡${registros_aber_procesados.length} métricas de Abber subidas con éxito!`,
              { id: identificador_toast }
            )
          })
          .catch((error_red) => {
            console.error(error_red)
            toast.error("Error al subir datos al servidor.", { id: identificador_toast })
          })
          .finally(() => {
            establecer_esta_procesando_archivo(false)
            if (referencia_input_archivo.current) referencia_input_archivo.current.value = ""
          })
      } catch (error_lectura) {
        console.error(error_lectura)
        toast.error("Error al leer el archivo Excel.", { id: identificador_toast })
        establecer_esta_procesando_archivo(false)
      }
    }

    lector_archivo.readAsBinaryString(archivo_seleccionado)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#121212] border border-yellow-500/20 p-2 rounded-md">
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={referencia_input_archivo}
        onChange={manejar_subida_archivo_aber}
      />
      <Button
        onClick={() => referencia_input_archivo.current?.click()}
        className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold gap-2"
        disabled={esta_procesando_archivo}
      >
        <Upload className="w-4 h-4" />
        {esta_procesando_archivo ? "Procesando..." : "Subir Excel de Validación Abber"}
      </Button>
    </div>
  )
}

export { ExcelProcessorAber as procesador_excel_aber }
