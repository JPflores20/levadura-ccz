/**
 * @fileoverview Endpoint GET para consultar los datos y estadísticas de Propagación de Levadura.
 * Utiliza `leer_documento_respaldado` con reconstrucción de fragmentos en Firestore y respaldo en `database.json`.
 */

import { NextResponse } from "next/server"
import { leer_documento_respaldado } from "@/lib/services/servicio_almacenamiento_json"
import { normalizar_fila_propagacion } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Obtiene los registros normalizados y estadísticas de propagación desde Firestore o disco local.
 *
 * @returns {Promise<NextResponse>} Respuesta JSON con el paquete de propagación.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const datos_documento = await leer_documento_respaldado("propagacion_stats", "database.json")

    if (datos_documento) {
      const registros_normalizados = Array.isArray(datos_documento.rawData)
        ? datos_documento.rawData.map((fila_cruda: Record<string, any>) =>
            normalizar_fila_propagacion(fila_cruda)
          )
        : []

      return NextResponse.json({
        ...datos_documento,
        rawData: registros_normalizados
      })
    }

    return NextResponse.json({ message: "No data found yet", rawData: [] }, { status: 404 })
  } catch (error_general) {
    console.error("Error leyendo datos de propagación:", error_general)
    return NextResponse.json({ error: "Error leyendo datos" }, { status: 500 })
  }
}
