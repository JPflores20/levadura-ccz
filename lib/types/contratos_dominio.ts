/**
 * @fileoverview Contratos de tipos, interfaces de dominio y validadores de esquemas
 * para Propagación de Levadura, Cinéticas de Fermentación (4V) y Auditoría Abber.
 */

/**
 * Representa un indicador clave de desempeño (KPI) mostrado en las tarjetas del panel.
 */
export interface ContratoTarjetaKpi {
  id: string
  label: string
  value: string | number
  unit: string
  target?: string
  status?: "optimal" | "warning" | "critical"
}

/**
 * Representa las métricas estadísticas de capacidad de proceso para un parámetro.
 */
export interface EstadisticaCapacidadParametro {
  parametro: string
  unidad: string
  media: number
  mediana?: number
  desv: number
  min: number
  max: number
  lei: number | null
  les: number | null
  objetivo: number | null
  cp: number | null
  cpk: number | null
  pp: number | null
  ppk: number | null
  n: number
}

/**
 * Registro normalizado de una medición de Propagación de Levadura.
 */
export interface RegistroPropagacionNormalizado {
  id: string | number
  fecha: string
  tanque: string
  generacion: string | number
  tipoLev: string
  dobleteo: string | number
  codigo: string
  viab: number
  conteo: number
  vitalidad: number
  ph: number
  brix: number
  temp: number
  oxigeno: number
  pres: number
  consistencia?: number
  edad?: number
  muertas?: number
  gemas?: number
  [clave_adicional: string]: unknown
}

/**
 * Paquete persistido en Firestore y en `database.json` para Propagación.
 */
export interface PaqueteSincronizacionPropagacion {
  lastUpdated: string
  totalRecords: number
  stats: EstadisticaCapacidadParametro[]
  rawData: Record<string, unknown>[]
  totalChunks?: number
}

/**
 * Punto de una serie temporal de compuesto volátil por día de fermentación.
 */
export interface PuntoSerieVolatilDia {
  dia: string
  diaNum: number
  valor: number
}

/**
 * Paquete persistido en Firestore y en `database_kinetics.json` para Cinéticas y 4V.
 */
export interface PaqueteSincronizacionCinetica {
  lastUpdated: string
  totalRecords: number
  stats4V: Record<string, Record<string, Record<string, PuntoSerieVolatilDia[]>>>
  rawData: Record<string, unknown>[]
  totalChunks?: number
}

/**
 * Paquete persistido en Firestore y en `database_aber.json` para Validación Abber.
 */
export interface PaqueteSincronizacionAber {
  lastUpdated?: string
  ultimaActualizacion?: string
  totalRecords?: number
  rawData: Record<string, unknown>[]
  totalChunks?: number
}

/**
 * Verifica de manera segura si un valor desconocido es un arreglo no vacío de objetos.
 *
 * @param {unknown} candidato_arreglo - Valor recibido en el cuerpo de una petición HTTP.
 * @returns {candidato_arreglo is Record<string, unknown>[]} Verdadero si es un arreglo válido de registros.
 */
export function es_arreglo_registros_valido(
  candidato_arreglo: unknown
): candidato_arreglo is Record<string, unknown>[] {
  if (!Array.isArray(candidato_arreglo) || candidato_arreglo.length === 0) {
    return false
  }
  const primer_elemento = candidato_arreglo[0]
  return typeof primer_elemento === "object" && primer_elemento !== null
}

/**
 * Extrae el arreglo de registros desde un cuerpo JSON que puede venir como arreglo directo
 * o envuelto dentro de la propiedad `{ data: [...] }`.
 *
 * @param {unknown} cuerpo_peticion - Cuerpo JSON decodificado de la petición entrante.
 * @returns {Record<string, unknown>[] | null} Arreglo de registros o `null` si el formato no es válido.
 */
export function extraer_arreglo_desde_cuerpo(
  cuerpo_peticion: unknown
): Record<string, unknown>[] | null {
  if (Array.isArray(cuerpo_peticion)) {
    return cuerpo_peticion as Record<string, unknown>[]
  }
  if (
    typeof cuerpo_peticion === "object" &&
    cuerpo_peticion !== null &&
    "data" in cuerpo_peticion &&
    Array.isArray((cuerpo_peticion as { data: unknown }).data)
  ) {
    return (cuerpo_peticion as { data: Record<string, unknown>[] }).data
  }
  return null
}
