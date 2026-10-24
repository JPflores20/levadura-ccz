/**
 * @fileoverview Constantes centralizadas de rutas de API y utilidades de revalidación SWR.
 * Evita discrepancias entre endpoints de lectura/escritura y sincroniza el estado entre pestañas.
 */

/**
 * Mapa inmutable con todas las rutas internas de la API del tablero de levadura y fermentación.
 */
export const RUTAS_API_PANEL = {
  OBTENER_PROPAGACION: "/api/get-propagation",
  OBTENER_CINETICA: "/api/get-kinetics",
  OBTENER_ABER: "/api/get-aber",
  SINCRONIZAR_PROPAGACION: "/api/sync-propagation",
  SINCRONIZAR_CINETICA: "/api/sync-kinetics",
  SINCRONIZAR_ABER: "/api/sync-aber",
  SINCRONIZAR_TODO: "/api/sync-all"
} as const

/**
 *Configuración estándar para las consultas SWR del tablero industrial.
 */
export const CONFIGURACION_SWR_PANEL = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000
} as const

/**
 * Función de consulta HTTP JSON genérica para hooks `useSWR`.
 *
 * @param {string} url_consulta - Ruta del endpoint a consultar.
 * @returns {Promise<any>} Promesa con el cuerpo JSON de la respuesta.
 */
export async function obtener_datos_json_api(url_consulta: string): Promise<any> {
  const respuesta_http = await fetch(url_consulta)
  return respuesta_http.json()
}
