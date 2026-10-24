/**
 * @fileoverview Servicio de seguridad y cabeceras CORS para los endpoints de sincronización API.
 * Valida tokens de autorización cuando la variable de entorno `SYNC_API_SECRET` está configurada.
 */

import { NextResponse } from "next/server"

/**
 * Cabeceras CORS estándar para permitir peticiones desde Excel Online, Excel Desktop y clientes autorizados.
 */
export const CABECERAS_CORS_API: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key"
}

/**
 * Resultado de la verificación de seguridad de una petición entrante.
 */
export interface ResultadoVerificacionSeguridad {
  autorizado: boolean
  respuesta_error?: NextResponse
}

/**
 * Verifica si una petición `POST` de sincronización incluye una clave válida cuando `SYNC_API_SECRET`
 * está definida en el entorno del servidor.
 *
 * @param {Request} peticion_entrante - Objeto Request de la ruta API.
 * @returns {ResultadoVerificacionSeguridad} Estado de autorización y respuesta HTTP 401 si falla.
 */
export function verificar_autorizacion_sincronizacion(
  peticion_entrante: Request
): ResultadoVerificacionSeguridad {
  const secreto_configurado = process.env.SYNC_API_SECRET?.trim()

  // Si no se ha definido SYNC_API_SECRET en el entorno, se mantiene compatibilidad con el botón de Excel actual.
  if (!secreto_configurado) {
    return { autorizado: true }
  }

  const clave_cabecera = peticion_entrante.headers.get("x-api-key")?.trim()
  const cabecera_autorizacion = peticion_entrante.headers.get("authorization")?.trim()
  const token_portador = cabecera_autorizacion?.startsWith("Bearer ")
    ? cabecera_autorizacion.slice(7).trim()
    : undefined

  if (clave_cabecera === secreto_configurado || token_portador === secreto_configurado) {
    return { autorizado: true }
  }

  return {
    autorizado: false,
    respuesta_error: NextResponse.json(
      { error: "No autorizado: clave de sincronización inválida o ausente." },
      { status: 401, headers: CABECERAS_CORS_API }
    )
  }
}

/**
 * Genera una respuesta preflight `OPTIONS` estándar con cabeceras CORS habilitadas.
 *
 * @returns {NextResponse} Respuesta HTTP 200 vacía con cabeceras CORS.
 */
export function construir_respuesta_preflight_cors(): NextResponse {
  return NextResponse.json({}, { headers: CABECERAS_CORS_API })
}
