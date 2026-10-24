"use client"

/**
 * @fileoverview Barra de navegación superior del sistema HMI con escucha en tiempo real
 * de Firestore (`onSnapshot`) y botón de sincronización inmediata de caché SWR.
 */

import { useEffect, useRef, useState } from "react"
import { Crown, RefreshCw, Wifi } from "lucide-react"
import { useSWRConfig } from "swr"
import { doc, onSnapshot } from "firebase/firestore"
import { toast } from "sonner"
import { base_datos_firestore } from "@/lib/firebase"
import { RUTAS_API_PANEL } from "@/lib/constantes_api"

/**
 * Renderiza el encabezado institucional con estado de conexión en tiempo real y botón de refresco.
 *
 * @returns {JSX.Element} Elemento JSX del encabezado superior.
 */
export function TopNav() {
  const { mutate: revalidar_cache_swr } = useSWRConfig()
  const [esta_sincronizando, establecer_esta_sincronizando] = useState(false)
  const [hora_ultima_sincronizacion, establecer_hora_ultima_sincronizacion] = useState<string>("")
  const [conectado_tiempo_real, establecer_conectado_tiempo_real] = useState(false)
  const carga_inicial_completada = useRef<Record<string, boolean>>({})

  useEffect(() => {
    establecer_hora_ultima_sincronizacion(new Date().toLocaleTimeString())

    const suscripciones_documentos = [
      { id_doc: "propagacion_stats", ruta_swr: RUTAS_API_PANEL.OBTENER_PROPAGACION },
      { id_doc: "kinetics_stats", ruta_swr: RUTAS_API_PANEL.OBTENER_CINETICA },
      { id_doc: "aber_stats", ruta_swr: RUTAS_API_PANEL.OBTENER_ABER }
    ]

    const funciones_cancelacion = suscripciones_documentos.map(({ id_doc, ruta_swr }) => {
      try {
        const referencia_doc = doc(base_datos_firestore, "dashboards", id_doc)
        return onSnapshot(
          referencia_doc,
          (instantanea_actual) => {
            establecer_conectado_tiempo_real(true)
            if (!carga_inicial_completada.current[id_doc]) {
              carga_inicial_completada.current[id_doc] = true
              return
            }
            if (instantanea_actual.exists()) {
              establecer_hora_ultima_sincronizacion(new Date().toLocaleTimeString())
              const datos_instantanea = instantanea_actual.data()
              if (Number(datos_instantanea.totalChunks || 1) <= 1 && Array.isArray(datos_instantanea.rawData)) {
                revalidar_cache_swr(ruta_swr, datos_instantanea, { revalidate: false })
              } else {
                revalidar_cache_swr(ruta_swr)
              }
            }
          },
          () => {
            establecer_conectado_tiempo_real(false)
          }
        )
      } catch {
        return () => {}
      }
    })

    return () => {
      funciones_cancelacion.forEach((cancelar_escucha) => cancelar_escucha())
    }
  }, [revalidar_cache_swr])

  /**
   * Revalida manualmente todas las rutas SWR del panel contra el servidor.
   */
  const ejecutar_sincronizacion_manual = async (): Promise<void> => {
    establecer_esta_sincronizando(true)
    try {
      await Promise.all([
        revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_PROPAGACION),
        revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_CINETICA),
        revalidar_cache_swr(RUTAS_API_PANEL.OBTENER_ABER)
      ])
      establecer_hora_ultima_sincronizacion(new Date().toLocaleTimeString())
      toast.success("Panel sincronizado con los últimos datos del servidor.")
    } catch {
      toast.error("No se pudo sincronizar con el servidor.")
    } finally {
      establecer_esta_sincronizando(false)
    }
  }

  return (
    <header className="flex flex-col gap-3 border-b border-yellow-500/40 bg-[#0a0a0a] px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-yellow-500/40 bg-yellow-500/10">
          <Crown className="size-5 text-yellow-500" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            Analisis de Levadura y Cineticas de Fermentacion- Reposo
          </h1>
          <span className="text-[10px] font-mono tracking-wide text-zinc-500">
            HMI · CERVECERÍA · v2.4
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded border border-zinc-800 bg-[#121212] px-2.5 py-1 text-[10px] text-zinc-400">
          <span
            className={`size-2 rounded-full ${
              conectado_tiempo_real ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            }`}
          />
          <Wifi className="size-3 text-zinc-400" />
          <span>
            {conectado_tiempo_real ? "En vivo" : "Local"}
            {hora_ultima_sincronizacion ? ` · ${hora_ultima_sincronizacion}` : ""}
          </span>
        </div>

        <button
          onClick={ejecutar_sincronizacion_manual}
          disabled={esta_sincronizando}
          className="flex items-center gap-1.5 rounded border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-yellow-500 transition-colors hover:bg-yellow-500/20 disabled:opacity-50"
          title="Refrescar datos desde Firebase / Servidor"
        >
          <RefreshCw className={`size-3 ${esta_sincronizando ? "animate-spin" : ""}`} />
          {esta_sincronizando ? "Sincronizando..." : "Sincronizar"}
        </button>
      </div>
    </header>
  )
}

export { TopNav as barra_navegacion_superior }
