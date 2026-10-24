/**
 * @fileoverview Endpoint maestro POST para sincronizar en un solo paso Propagación, Cinéticas y Abber
 * desde el botón con Office Script en Excel hacia Firestore (con fragmentación automática) y archivos locales.
 */

import { NextResponse } from "next/server"
import { procesar_lote_propagacion } from "@/lib/services/servicio_sincronizacion_propagacion"
import { procesar_lote_cinetica } from "@/lib/services/servicio_sincronizacion_cinetica"
import { guardar_documento_respaldado } from "@/lib/services/servicio_almacenamiento_json"
import {
  CABECERAS_CORS_API,
  construir_respuesta_preflight_cors,
  verificar_autorizacion_sincronizacion
} from "@/lib/services/servicio_seguridad_api"
import { es_arreglo_registros_valido } from "@/lib/types/contratos_dominio"

/**
 * Responde a las peticiones preflight CORS enviadas desde Excel Online / Desktop.
 *
 * @returns {NextResponse} Respuesta vacía con cabeceras CORS habilitadas.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return construir_respuesta_preflight_cors()
}

/**
 * Procesa y persiste los lotes de Propagación, Cinéticas y Abber recibidos desde el script de Excel.
 *
 * @param {Request} peticion_entrante - Objeto Request con el cuerpo JSON de las hojas del libro de Excel.
 * @returns {Promise<NextResponse>} Respuesta JSON con el conteo de registros sincronizados por dominio.
 */
export async function POST(peticion_entrante: Request): Promise<NextResponse> {
  const verificacion = verificar_autorizacion_sincronizacion(peticion_entrante)
  if (!verificacion.autorizado && verificacion.respuesta_error) {
    return verificacion.respuesta_error
  }

  try {
    const cuerpo_peticion = await peticion_entrante.json()
    const {
      propagacion: lista_propagacion,
      cheetah: lista_cheetah,
      aber: lista_aber
    } = cuerpo_peticion
    const lista_cinetica = cuerpo_peticion.cinetica ?? cuerpo_peticion.cineticas

    let conteo_propagacion = 0
    let conteo_cinetica = 0
    let conteo_aber = 0

    if (es_arreglo_registros_valido(lista_propagacion)) {
      const paquete_propagacion = procesar_lote_propagacion(lista_propagacion)
      await guardar_documento_respaldado("propagacion_stats", "database.json", paquete_propagacion)
      conteo_propagacion = lista_propagacion.length
    }

    if (es_arreglo_registros_valido(lista_cinetica)) {
      const { payload: paquete_cinetica } = procesar_lote_cinetica(lista_cinetica)
      await guardar_documento_respaldado(
        "kinetics_stats",
        "database_kinetics.json",
        paquete_cinetica
      )
      conteo_cinetica = lista_cinetica.length
    }

    const registros_aber_entrantes = es_arreglo_registros_valido(lista_aber)
      ? lista_aber
      : es_arreglo_registros_valido(lista_cheetah)
        ? lista_cheetah
        : null

    if (registros_aber_entrantes) {
      const paquete_aber = {
        lastUpdated: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString(),
        totalRecords: registros_aber_entrantes.length,
        rawData: registros_aber_entrantes
      }
      await guardar_documento_respaldado("aber_stats", "database_aber.json", paquete_aber)
      conteo_aber = registros_aber_entrantes.length
    }

    return NextResponse.json(
      {
        message: "Sincronización Total Exitosa",
        registrosPropagacion: conteo_propagacion,
        registrosCinetica: conteo_cinetica,
        registrosAber: conteo_aber
      },
      { status: 200, headers: CABECERAS_CORS_API }
    )
  } catch (error_general) {
    console.error("Error en Sync-All:", error_general)
    return NextResponse.json(
      { error: "Error procesando los datos maestros" },
      { status: 500, headers: CABECERAS_CORS_API }
    )
  }
}
