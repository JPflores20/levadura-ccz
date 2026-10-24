/**
 * @fileoverview Endpoint POST para sincronizar exclusivamente datos de Cinéticas y 4V.
 * Incluye verificación de seguridad opcional, validación de esquema y particionamiento en Firestore.
 */

import { NextResponse } from "next/server"
import { procesar_lote_cinetica } from "@/lib/services/servicio_sincronizacion_cinetica"
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
 * Procesa el arreglo de registros de cinéticas recibido y persiste el resultado
 * en Firestore (con fragmentación automática) y en `database_kinetics.json`.
 *
 * @param {Request} peticion_entrante - Objeto Request con los datos de cinéticas.
 * @returns {Promise<NextResponse>} Respuesta JSON con el resumen de marcas y registros procesados.
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

    const { payload: paquete_cinetica, marcas_detectadas } =
      procesar_lote_cinetica(registros_crudos)
    const resultado_guardado = await guardar_documento_respaldado(
      "kinetics_stats",
      "database_kinetics.json",
      paquete_cinetica
    )

    return NextResponse.json(
      {
        message: "Cinéticas y 4V procesadas con éxito",
        totalRecords: registros_crudos.length,
        marcasDetectadas: marcas_detectadas,
        chunks: resultado_guardado.total_fragmentos
      },
      { status: 200, headers: CABECERAS_CORS_API }
    )
  } catch (error_general) {
    console.error("Error procesando cinéticas:", error_general)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar cinéticas" },
      { status: 500, headers: CABECERAS_CORS_API }
    )
  }
}
