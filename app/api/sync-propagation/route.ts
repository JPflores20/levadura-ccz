/**
 * @fileoverview Endpoint POST para sincronizar exclusivamente datos de Propagación de Levadura.
 * Incluye verificación de seguridad opcional, validación de esquema y particionamiento en Firestore.
 */

import { NextResponse } from "next/server"
import { procesar_lote_propagacion } from "@/lib/services/servicio_sincronizacion_propagacion"
import { guardar_documento_respaldado } from "@/lib/services/servicio_almacenamiento_json"
import {
  CABECERAS_CORS_API,
  construir_respuesta_preflight_cors,
  verificar_autorizacion_sincronizacion
} from "@/lib/services/servicio_seguridad_api"
import {
  es_arreglo_registros_valido,
  extraer_arreglo_desde_cuerpo
} from "@/lib/types/contratos_dominio"

/**
 * Responde a las peticiones preflight CORS.
 *
 * @returns {NextResponse} Respuesta vacía con cabeceras CORS habilitadas.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return construir_respuesta_preflight_cors()
}

/**
 * Recibe un arreglo de registros de propagación, calcula sus estadísticas de capacidad
 * y los persiste en Firestore (con fragmentación automática) y en `database.json`.
 *
 * @param {Request} peticion_entrante - Objeto Request con los datos de propagación.
 * @returns {Promise<NextResponse>} Respuesta JSON con las estadísticas calculadas.
 */
export async function POST(peticion_entrante: Request): Promise<NextResponse> {
  const verificacion = verificar_autorizacion_sincronizacion(peticion_entrante)
  if (!verificacion.autorizado && verificacion.respuesta_error) {
    return verificacion.respuesta_error
  }

  try {
    const cuerpo_peticion = await peticion_entrante.json()
    const registros_crudos = extraer_arreglo_desde_cuerpo(cuerpo_peticion)

    if (!es_arreglo_registros_valido(registros_crudos)) {
      return NextResponse.json(
        { error: "Formato inválido: se requiere un arreglo no vacío de registros." },
        { status: 400, headers: CABECERAS_CORS_API }
      )
    }

    const paquete_propagacion = procesar_lote_propagacion(registros_crudos)
    const resultado_guardado = await guardar_documento_respaldado(
      "propagacion_stats",
      "database.json",
      paquete_propagacion
    )

    return NextResponse.json(
      {
        message: "Datos procesados y guardados con éxito",
        stats: paquete_propagacion.stats,
        chunks: resultado_guardado.total_fragmentos
      },
      { status: 200, headers: CABECERAS_CORS_API }
    )
  } catch (error_general) {
    console.error("Error procesando datos de propagación:", error_general)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: CABECERAS_CORS_API }
    )
  }
}
