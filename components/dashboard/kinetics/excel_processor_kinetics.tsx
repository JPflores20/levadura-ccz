"use client"

/**
 * @fileoverview Botón e interfaz para cargar archivos Excel de Cinética de Fermentación
 * y sincronizarlos con el endpoint `/api/sync-kinetics`.
 */

import React, { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { RUTAS_API_PANEL } from "@/lib/constantes_api"

/**
 * Renderiza el control de carga de archivos Excel (.xlsx/.xls) de Cinética.
 *
 * @returns {JSX.Element} Contenedor con botón de carga de Excel de Cinética.
 */
export function ExcelProcessorKinetics() {
  const referencia_input_archivo = useRef<HTMLInputElement>(null)
  const [esta_procesando_archivo, establecer_esta_procesando_archivo] = useState(false)
  const { mutate: revalidar_cache_swr } = useSWRConfig()

  /**
   * Lee el archivo Excel seleccionado, localiza la fila de cabeceras y envía los registros a `/api/sync-kinetics`.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} evento_cambio_archivo - Evento de selección de archivo.
   */
  const manejar_subida_archivo_cinetica = (
    evento_cambio_archivo: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const archivo_seleccionado = evento_cambio_archivo.target.files?.[0]
    if (!archivo_seleccionado) return
    establecer_esta_procesando_archivo(true)

    const identificador_toast = toast.loading("Procesando Excel...")
    const lector_archivo = new FileReader()

    lector_archivo.onload = (evento_lectura) => {
      try {
        const cadena_binaria = evento_lectura.target?.result
        const libro_excel = XLSX.read(cadena_binaria, { type: "binary" })
        const nombre_hoja = libro_excel.SheetNames.includes("Resumen")
          ? "Resumen"
          : libro_excel.SheetNames[0]

        const hoja_trabajo = libro_excel.Sheets[nombre_hoja]
        const matriz_filas_excel = XLSX.utils.sheet_to_json(hoja_trabajo, {
          header: 1,
          raw: false
        }) as any[][]

        let indice_fila_cabecera = 0
        for (
          let indice_busqueda = 0;
          indice_busqueda < Math.min(20, matriz_filas_excel.length);
          indice_busqueda++
        ) {
          const fila_candidata = matriz_filas_excel[indice_busqueda]
          if (
            fila_candidata &&
            fila_candidata.some((celda_actual) => {
              if (!celda_actual) return false
              const texto_celda = String(celda_actual).toUpperCase()
              return (
                texto_celda.includes("TCC") ||
                texto_celda.includes("TANQUE") ||
                texto_celda.includes("MARCA") ||
                texto_celda.includes("FECHA") ||
                texto_celda.includes("GLUCOSA")
              )
            })
          ) {
            indice_fila_cabecera = indice_busqueda
            break
          }
        }

        const datos_json_crudos = XLSX.utils.sheet_to_json(hoja_trabajo, {
          header: indice_fila_cabecera + 1,
          defval: ""
        })

        const carga_util_filtrada = datos_json_crudos.filter((fila_json: any) => {
          const claves_fila = Object.keys(fila_json)
          return claves_fila.length > 2
        })

        if (carga_util_filtrada.length === 0) {
          toast.error("No se encontraron datos válidos.", { id: identificador_toast })
          establecer_esta_procesando_archivo(false)
          return
        }

        fetch(RUTAS_API_PANEL.SINCRONIZAR_CINETICA, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carga_util_filtrada)
        })
          .then((respuesta_http) => respuesta_http.json())
          .then(() => {
            revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_CINETICA)
            toast.success(
              `¡Datos de cinética (${carga_util_filtrada.length} registros) subidos con éxito!`,
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
        onChange={manejar_subida_archivo_cinetica}
      />
      <Button
        onClick={() => referencia_input_archivo.current?.click()}
        className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold gap-2"
        disabled={esta_procesando_archivo}
      >
        <Upload className="w-4 h-4" />
        {esta_procesando_archivo ? "Procesando..." : "Subir Excel de Cinética"}
      </Button>
    </div>
  )
}

export { ExcelProcessorKinetics as procesador_excel_cinetica }
