"use client"

/**
 * @fileoverview Botón de captura de pantalla del panel para exportar la vista activa como imagen PNG
 * con indicador de progreso y notificación visual (`toast`).
 */

import { useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import * as htmlToImage from "html-to-image"
import { toast } from "sonner"

/**
 * Renderiza el botón que captura el contenedor `#capture-dashboard` y descarga un archivo PNG.
 *
 * @returns {JSX.Element} Elemento JSX del botón de captura.
 */
export function CaptureButton() {
  const [esta_capturando, establecer_esta_capturando] = useState(false)

  /**
   * Genera la imagen PNG de alta resolución del panel y dispara la descarga en el navegador.
   */
  const ejecutar_captura_pantalla = async (): Promise<void> => {
    const nodo_panel = document.getElementById("capture-dashboard")
    if (!nodo_panel || esta_capturando) return

    establecer_esta_capturando(true)
    const identificador_toast = toast.loading("Generando captura PNG en alta resolución...")

    try {
      const url_imagen_png = await htmlToImage.toPng(nodo_panel, {
        backgroundColor: "#0a0a0a",
        pixelRatio: 2
      })
      const enlace_descarga = document.createElement("a")
      const fecha_iso = new Date().toISOString().split("T")[0]
      enlace_descarga.href = url_imagen_png
      enlace_descarga.download = `Reporte-Dashboard-${fecha_iso}.png`
      enlace_descarga.click()
      toast.success("Captura descargada con éxito.", { id: identificador_toast })
    } catch (error_captura) {
      console.error("Error generando captura de pantalla:", error_captura)
      toast.error("No se pudo generar la captura de pantalla.", { id: identificador_toast })
    } finally {
      establecer_esta_capturando(false)
    }
  }

  return (
    <button
      onClick={ejecutar_captura_pantalla}
      disabled={esta_capturando}
      className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 disabled:opacity-50 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded text-xs transition-colors uppercase font-bold shrink-0"
      title="Capturar pantalla del dashboard"
    >
      {esta_capturando ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
      {esta_capturando ? "Capturando..." : "Captura"}
    </button>
  )
}

export { CaptureButton as boton_captura_pantalla }
