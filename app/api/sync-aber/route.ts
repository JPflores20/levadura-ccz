/**
 * @fileoverview Endpoint POST para sincronizar los registros de Auditoría de equipos Abber.
 * Incluye verificación de seguridad opcional, validación de esquema y particionamiento en Firestore.
 */

import { NextResponse } from "next/server"
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
 * Persiste los registros de validación Abber en Firestore (con fragmentación automática)
 * y en `database_aber.json`.
 *
 * @param {Request} peticion_entrante - Objeto Request con el arreglo de mediciones Abber.
 * @returns {Promise<NextResponse>} Respuesta JSON indicando el éxito de la operación.
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
        { error: "Datos inválidos: se requiere un arreglo no vacío de registros." },
        { status: 400, headers: CABECERAS_CORS_API }
      )
    }

    const paquete_final = {
      ultimaActualizacion: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalRecords: registros_crudos.length,
      rawData: registros_crudos
    }

    const resultado_guardado = await guardar_documento_respaldado(
      "aber_stats",
      "database_aber.json",
      paquete_final
    )

    return NextResponse.json(
      {
        success: true,
        message: "Datos de ABER procesados",
        chunks: resultado_guardado.total_fragmentos
      },
      { headers: CABECERAS_CORS_API }
    )
  } catch (error_general) {
    console.error("Error general en sync-aber:", error_general)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: CABECERAS_CORS_API }
    )
  }
}
