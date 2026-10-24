/**
 * @fileoverview Alias de compatibilidad hacia `/api/get-propagation` para scripts o clientes externos.
 */

import { GET as obtener_propagacion } from "@/app/api/get-propagation/route"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Redirige la lectura de `/api/get-data` al controlador de `/api/get-propagation`.
 */
export const GET = obtener_propagacion
