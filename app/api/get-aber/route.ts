/**
 * @fileoverview Endpoint GET para consultar los datos de Auditoría y Validación de equipos Abber.
 * Utiliza `leer_documento_respaldado` con reconstrucción de fragmentos en Firestore y respaldo en `database_aber.json`.
 */

import { NextResponse } from "next/server"
import { leer_documento_respaldado } from "@/lib/services/servicio_almacenamiento_json"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Obtiene los registros de validación Abber desde Firestore o `database_aber.json`.
 *
 * @returns {Promise<NextResponse>} Respuesta JSON con los registros de validación Abber.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const datos_documento = await leer_documento_respaldado("aber_stats", "database_aber.json")
    if (
      datos_documento &&
      Array.isArray(datos_documento.rawData) &&
      datos_documento.rawData.length > 0
    ) {
      return NextResponse.json(datos_documento)
    }
    return NextResponse.json({ message: "No data found yet", rawData: [] }, { status: 404 })
  } catch (error_general) {
    console.error("Error leyendo datos Aber:", error_general)
    return NextResponse.json({ error: "Error leyendo datos" }, { status: 500 })
  }
}
