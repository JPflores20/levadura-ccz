/**
 * @fileoverview Servicio de dominio para normalizar, filtrar y agrupar las mediciones de
 * Auditoría de Abbers (comparativa entre sensor Abber en línea y laboratorio Vicell/LAC).
 */

import { formatear_fecha_excel } from "@/lib/utils"

export interface RegistroAberNormalizado {
  linea: string
  fecha: string
  marca: string
  tanque: string
  conteoAber: number | null
  conteoLac: number | null
  diferencia: number | null
  solidosAvg: number | null
}

/**
 * Normaliza los registros crudos de validación Abber unificando nombres de columnas de Excel y Firebase.
 * @param registros_crudos - Arreglo de registros crudos obtenidos desde /api/get-aber.
 * @returns Arreglo de registros de validación Abber con tipos numéricos limpios.
 */
export function normalizar_registros_aber(registros_crudos: Record<string, any>[]): RegistroAberNormalizado[] {
  return registros_crudos.map((fila_actual) => {
    const extraer_numero = (llaves_candidatas: string[]) => {
      for (const llave_actual of llaves_candidatas) {
        if (
          fila_actual[llave_actual] !== undefined &&
          fila_actual[llave_actual] !== null &&
          fila_actual[llave_actual] !== ""
        ) {
          const numero_convertido = parseFloat(String(fila_actual[llave_actual]).replace(",", "."))
          if (!isNaN(numero_convertido)) return numero_convertido
        }
      }
      return null
    }

    const linea_limpia = String(
      fila_actual.linea || fila_actual.Linea || fila_actual["LINEA"] || fila_actual["LINEA "] || "N/A"
    )
      .trim()
      .toUpperCase()
    const fecha_cruda = String(
      fila_actual.fecha || fila_actual.Fecha || fila_actual["FECHA "] || fila_actual["FECHA"] || "N/A"
    ).trim()
    const fecha_formateada = formatear_fecha_excel(fecha_cruda)
    const marca_limpia = String(
      fila_actual.marca || fila_actual.Marca || fila_actual.cepa || fila_actual.Cepa || ""
    )
      .trim()
      .toUpperCase()
    const tanque_limpio = String(
      fila_actual.tanque || fila_actual.Tanque || fila_actual.TCC || fila_actual.Lote || ""
    )
      .trim()
      .toUpperCase()

    const conteo_aber = extraer_numero([
      "conteoAber",
      "Aber",
      "CONTEO ABER B.F",
      "CONTEO EN EL ABER",
      "CONTEO ABER",
    ])
    const conteo_lac = extraer_numero([
      "conteoLacAvg",
      "conteoLac",
      "ConteoLac",
      "PROMEDIO DE CONTEO LAC",
      "PROMEDIO DE CONTEO LAC ",
    ])
    const diferencia_cruda = extraer_numero(["diferencia", "Diferencia", "DIFERENCIA ", "DIFERENCIA"])
    const solidos_promedio = extraer_numero([
      "solidosAvg",
      "solidos",
      "Solidos",
      "% Solidos",
      "PROMEDIO DE % SOLIDOS",
      "PROMEDIO DE % SOLIDOS ",
    ])

    const diferencia_calculada =
      conteo_aber !== null && conteo_lac !== null && conteo_aber > 0 && conteo_lac > 0
        ? Number((conteo_aber - conteo_lac).toFixed(2))
        : diferencia_cruda

    return {
      linea: linea_limpia,
      fecha: fecha_formateada,
      marca: marca_limpia,
      tanque: tanque_limpio,
      conteoAber: conteo_aber,
      conteoLac: conteo_lac,
      diferencia: diferencia_calculada,
      solidosAvg: solidos_promedio,
    }
  })
}

/**
 * Filtra prioritariamente los registros que cuentan con lectura real tanto en Abber como en Laboratorio (> 0).
 * @param registros_normalizados - Todos los registros de validación Abber normalizados.
 * @returns Subconjunto de registros con mediciones válidas para correlación.
 */
export function obtener_base_mediciones_validas_aber(
  registros_normalizados: RegistroAberNormalizado[]
): RegistroAberNormalizado[] {
  const mediciones_completas = registros_normalizados.filter(
    (registro_actual) =>
      registro_actual.conteoAber !== null &&
      registro_actual.conteoLac !== null &&
      registro_actual.conteoAber > 0 &&
      registro_actual.conteoLac > 0
  )
  if (mediciones_completas.length > 0) return mediciones_completas
  return registros_normalizados.filter(
    (registro_actual) => registro_actual.conteoAber !== null && registro_actual.conteoLac !== null
  )
}

/**
 * Agrupa las desviaciones (Abber - LAC) y porcentajes de sólidos por fecha para Línea 1 y Línea 2.
 * @param datos_correlacion - Registros de validación Abber filtrados.
 * @returns Arreglo de puntos agrupados por fecha para las gráficas de barras y líneas.
 */
export function agrupar_desviacion_por_fecha_aber(datos_correlacion: RegistroAberNormalizado[]) {
  const fechas_unicas = Array.from(
    new Set(datos_correlacion.map((registro_actual) => registro_actual.fecha))
  )

  return fechas_unicas.map((fecha_actual) => {
    const filas_linea_1 = datos_correlacion.filter(
      (registro_actual) => registro_actual.fecha === fecha_actual && String(registro_actual.linea).includes("1")
    )
    const filas_linea_2 = datos_correlacion.filter(
      (registro_actual) => registro_actual.fecha === fecha_actual && String(registro_actual.linea).includes("2")
    )

    const calcular_promedio = (filas_linea: RegistroAberNormalizado[], clave_campo: "diferencia" | "solidosAvg") => {
      const valores_validos = filas_linea
        .map((fila) => fila[clave_campo])
        .filter((valor): valor is number => valor !== null && valor !== undefined && !isNaN(valor))
      return valores_validos.length > 0
        ? Number((valores_validos.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_validos.length).toFixed(2))
        : null
    }

    return {
      fecha: fecha_actual,
      diffL1: calcular_promedio(filas_linea_1, "diferencia"),
      diffL2: calcular_promedio(filas_linea_2, "diferencia"),
      solidosL1: calcular_promedio(filas_linea_1, "solidosAvg"),
      solidosL2: calcular_promedio(filas_linea_2, "solidosAvg"),
    }
  })
}
