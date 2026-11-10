"use client"

/**
 * @fileoverview Botón e interfaz para cargar archivos Excel de Validación de Equipos Aber
 * (incluyendo la hoja `Aber` de `Propagacion_Levadura.xlsx`) y sincronizarlos con `/api/sync-aber`.
 */

import React, { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatear_fecha_excel } from "@/lib/utils"
import { RUTAS_API_PANEL } from "@/lib/constantes_api"

function a_numero_limpio(valor_celda: any): number {
  if (valor_celda === undefined || valor_celda === null || valor_celda === "") return 0
  const texto = String(valor_celda).replace("%", "").replace(",", ".").trim()
  if (!texto || texto.startsWith("#")) return 0
  const num = parseFloat(texto)
  return isNaN(num) ? 0 : num
}

/**
 * Renderiza el control para subir e importar hojas Excel de Validación Aber.
 */
export function ExcelProcessorAber() {
  const referencia_input_archivo = useRef<HTMLInputElement>(null)
  const [esta_procesando_archivo, establecer_esta_procesando_archivo] = useState(false)
  const { mutate: revalidar_cache_swr } = useSWRConfig()

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
        const nombre_hoja_aber =
          libro_excel.SheetNames.find((nombre) => nombre.toLowerCase().includes("aber")) ||
          libro_excel.SheetNames[0]
        const hoja_trabajo = libro_excel.Sheets[nombre_hoja_aber]
        const matriz_fmt = XLSX.utils.sheet_to_json(hoja_trabajo, { header: 1, raw: false }) as any[][]
        const matriz_raw = XLSX.utils.sheet_to_json(hoja_trabajo, { header: 1, raw: true }) as any[][]

        let indice_encabezados = 6
        for (let idx = 0; idx < Math.min(15, matriz_fmt.length); idx++) {
          const texto_fila = (matriz_fmt[idx] || []).join(" ").toUpperCase()
          if (texto_fila.includes("FECHA") && texto_fila.includes("LINEA")) {
            indice_encabezados = idx
            break
          }
        }

        const registros_aber_procesados: any[] = []

        for (let idx_fila = indice_encabezados + 1; idx_fila < matriz_fmt.length; idx_fila++) {
          const fila_fmt = matriz_fmt[idx_fila] || []
          const fila_raw = matriz_raw[idx_fila] || []
          if (fila_fmt.length === 0) continue

          const col_cero = String(fila_fmt[0] ?? "").trim()
          const es_formato_anterior = col_cero.toUpperCase().includes("LINEA")

          const texto_linea_crudo = es_formato_anterior ? col_cero : String(fila_fmt[7] ?? "").trim()
          const texto_fecha_crudo = es_formato_anterior ? String(fila_fmt[3] || fila_fmt[4] || "").trim() : String(fila_fmt[1] ?? "").trim()
          if (!texto_linea_crudo || !texto_fecha_crudo) continue

          const linea_final = texto_linea_crudo.toUpperCase().includes("LINEA")
            ? texto_linea_crudo.toUpperCase()
            : `LINEA ${texto_linea_crudo}`
          const anio_respaldo = idx_fila <= 25 ? 2025 : 2026
          const fecha_normalizada = formatear_fecha_excel(texto_fecha_crudo, anio_respaldo)
          const marca_final = String(es_formato_anterior ? fila_fmt[1] : (fila_fmt[4] || fila_fmt[8] || "N/A")).trim().toUpperCase()
          const gen_texto = String(fila_fmt[9] || "").trim()
          let tanque_final = String(es_formato_anterior ? fila_fmt[2] : (fila_fmt[3] || "")).trim().toUpperCase()
          if (!tanque_final && /TCC\s*([\d,\s]+)/i.test(gen_texto)) {
            const coincidencia = gen_texto.match(/TCC\s*([\d,\s]+)/i)
            if (coincidencia) tanque_final = `TCC ${coincidencia[1].trim()}`
          }

          const viab_q = a_numero_limpio(fila_fmt[16])
          const viab_l = a_numero_limpio(es_formato_anterior ? fila_fmt[9] : fila_fmt[11])
          const viab_base = viab_q > 0 ? viab_q : viab_l
          const factor_viab = viab_base > 1 ? Number((viab_base / 100).toFixed(4)) : (viab_base > 0 ? viab_base : 0.97)

          const sol_v = a_numero_limpio(typeof fila_raw[21] === "number" ? fila_raw[21] : fila_fmt[21])
          const sol_ap = a_numero_limpio(fila_fmt[41])
          const sol_base = sol_v > 0 ? sol_v : sol_ap
          const solidos_reales = sol_base > 0 && sol_base <= 1.5 ? Number((sol_base * 100).toFixed(2)) : Number(sol_base.toFixed(2))

          const vss_lab_crudo = a_numero_limpio(typeof fila_raw[22] === "number" ? fila_raw[22] : fila_fmt[22])
          const solidos_vivos_lab = vss_lab_crudo > 0
            ? (vss_lab_crudo <= 1.5 ? Number((vss_lab_crudo * 100).toFixed(2)) : Number(vss_lab_crudo.toFixed(2)))
            : (solidos_reales > 0 ? Number((solidos_reales * factor_viab).toFixed(2)) : 0)

          const error_solidos = solidos_reales > 0 && solidos_vivos_lab > 0 ? Number((solidos_reales - solidos_vivos_lab).toFixed(2)) : 0

          const cpm_aber_28 = a_numero_limpio(es_formato_anterior ? fila_fmt[14] : fila_fmt[28])
          const cpm_target_5 = a_numero_limpio(fila_fmt[5])
          const conteo_aber = cpm_aber_28 > 0 ? (cpm_aber_28 >= 1e6 ? Number((cpm_aber_28 / 1e6).toFixed(2)) : cpm_aber_28) : cpm_target_5

          const v1 = a_numero_limpio(fila_fmt[29]), v2 = a_numero_limpio(fila_fmt[30]), v3 = a_numero_limpio(fila_fmt[31])
          const lista_v = [v1, v2, v3].filter((num) => num > 0)
          const prom_vicell = lista_v.length > 0 ? Number((lista_v.reduce((ac, act) => ac + act, 0) / lista_v.length).toFixed(2)) : 0
          const cpm_32 = a_numero_limpio(es_formato_anterior ? fila_fmt[13] : fila_fmt[32])
          const cpm_6 = a_numero_limpio(fila_fmt[6])
          const conteo_lac = prom_vicell > 0 ? prom_vicell : (cpm_32 > 0 ? (cpm_32 >= 1e6 ? Number((cpm_32 / 1e6).toFixed(2)) : cpm_32) : cpm_6)

          if (conteo_aber === 0 && conteo_lac === 0 && solidos_reales === 0) continue

          registros_aber_procesados.push({
            linea: linea_final,
            marca: marca_final,
            tanque: tanque_final,
            generacion: gen_texto,
            fecha: fecha_normalizada,
            viabilidadAvg: factor_viab,
            conteoLacAvg: conteo_lac,
            conteoAber: conteo_aber,
            diferencia: conteo_aber > 0 && conteo_lac > 0 ? Number((conteo_aber - conteo_lac).toFixed(2)) : 0,
            solidosAvg: solidos_reales,
            solidosReales: solidos_reales,
            solidosVivosLab: solidos_vivos_lab,
            errorSolidos: error_solidos
          })
        }

        if (registros_aber_procesados.length === 0) {
          toast.error("No se encontraron filas con datos válidos de Abber.", { id: identificador_toast })
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
            toast.success(`¡${registros_aber_procesados.length} métricas de Abber subidas con éxito!`, { id: identificador_toast })
          })
          .catch(() => {
            toast.error("Error al subir datos al servidor.", { id: identificador_toast })
          })
          .finally(() => {
            establecer_esta_procesando_archivo(false)
            if (referencia_input_archivo.current) referencia_input_archivo.current.value = ""
          })
      } catch {
        toast.error("Error al leer el archivo Excel.", { id: identificador_toast })
        establecer_esta_procesando_archivo(false)
      }
    }

    lector_archivo.readAsBinaryString(archivo_seleccionado)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#121212] border border-yellow-500/20 p-2 rounded-md">
      <input type="file" accept=".xlsx, .xls" className="hidden" ref={referencia_input_archivo} onChange={manejar_subida_archivo_aber} />
      <Button onClick={() => referencia_input_archivo.current?.click()} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold gap-2" disabled={esta_procesando_archivo}>
        <Upload className="w-4 h-4" />
        {esta_procesando_archivo ? "Procesando..." : "Subir Excel de Validación Abber"}
      </Button>
    </div>
  )
}

export { ExcelProcessorAber as procesador_excel_aber }
