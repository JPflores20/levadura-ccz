/**
 * @fileoverview Endpoint GET para consultar los datos de Cinéticas de Fermentación y 4V.
 * Utiliza `leer_documento_respaldado` con reconstrucción de fragmentos en Firestore y respaldo en `database_kinetics.json`.
 */

import { NextResponse } from "next/server"
import { leer_documento_respaldado } from "@/lib/services/servicio_almacenamiento_json"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Obtiene los registros y estadísticas 4V de cinéticas desde Firestore o respaldo local.
 *
 * @returns {Promise<NextResponse>} Respuesta JSON con los datos de cinéticas.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const datos_documento = await leer_documento_respaldado(
      "kinetics_stats",
      "database_kinetics.json"
    )
    if (datos_documento) {
      return NextResponse.json(datos_documento)
    }
    return NextResponse.json({ rawData: [] })
  } catch (error_general) {
    console.error("Error leyendo datos de cinéticas:", error_general)
    return NextResponse.json({ rawData: [] })
  }
}
