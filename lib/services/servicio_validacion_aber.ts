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
  viabilidadAvg: number | null
  solidosReales: number | null
  solidosVivosLab: number | null
  errorSolidos: number | null
}

/**
 * Normaliza los registros crudos de validación Abber unificando nombres de columnas de Excel y Firebase.
 * @param registros_crudos - Arreglo de registros crudos obtenidos desde /api/get-aber o hoja Aber.
 * @returns Arreglo de registros de validación Abber con tipos numéricos limpios.
 */
export function normalizar_registros_aber(registros_crudos: Record<string, any>[]): RegistroAberNormalizado[] {
  return registros_crudos.map((fila_actual) => {
    const extraer_numero = (llaves_candidatas: string[]) => {
      for (const llave_actual of llaves_candidatas) {
        const valor_celda = fila_actual[llave_actual]
        if (valor_celda !== undefined && valor_celda !== null && valor_celda !== "") {
          const texto_limpio = String(valor_celda).replace("%", "").replace(",", ".").trim()
          if (texto_limpio.startsWith("#")) continue
          const numero_convertido = parseFloat(texto_limpio)
          if (!isNaN(numero_convertido)) return numero_convertido
        }
      }
      return null
    }

    const linea_cruda = String(
      fila_actual.linea || fila_actual.Linea || fila_actual["Linea "] || fila_actual["LINEA"] || fila_actual["LINEA "] || "N/A"
    ).trim().toUpperCase()
    const linea_limpia = /^[12]$/.test(linea_cruda) ? `LINEA ${linea_cruda}` : linea_cruda

    const fecha_original = String(
      fila_actual.fecha || fila_actual.Fecha || fila_actual["FECHA "] || fila_actual["FECHA"] || "N/A"
    ).trim()
    const turno_original = String(fila_actual.turno || fila_actual.Turno || "").trim()
    const fecha_cruda = /^[123]$/.test(fecha_original) && turno_original && !/^[123]$/.test(turno_original) ? turno_original : fecha_original
    const fecha_formateada = formatear_fecha_excel(fecha_cruda, fila_actual.anio || fila_actual["Año"])

    const marca_limpia = String(
      fila_actual.marca || fila_actual.MARCA || fila_actual.Marca || fila_actual.Cepa || fila_actual.cepa || ""
    ).trim().toUpperCase()

    const gen_texto = String(fila_actual.generacion || fila_actual["Generación"] || "").trim()
    let tanque_limpio = String(fila_actual.tanque || fila_actual.Tanque || fila_actual.TCC || fila_actual.Lote || "").trim().toUpperCase()
    if (!tanque_limpio && /TCC\s*([\d,\s]+)/i.test(gen_texto)) {
      const coincidencia_tcc = gen_texto.match(/TCC\s*([\d,\s]+)/i)
      if (coincidencia_tcc) tanque_limpio = `TCC ${coincidencia_tcc[1].trim()}`
    }

    const conteo_aber_crudo = extraer_numero([
      "conteoAber", "CPM\r\nABER ", "CPM ABER", "CONTEO\r\nABER TARGET", "CONTEO ABER TARGET",
      "Aber", "CONTEO ABER B.F", "CONTEO EN EL ABER", "CONTEO ABER"
    ])
    const conteo_aber = conteo_aber_crudo !== null && conteo_aber_crudo >= 1e6
      ? Number((conteo_aber_crudo / 1e6).toFixed(2))
      : conteo_aber_crudo

    const conteo_lac_crudo = extraer_numero([
      "conteoLacAvg", "conteoLac", "ConteoLac", "PROMEDIO DE\r\n CPM VICELL", "PROMEDIO DE CPM VICELL",
      "CONTEO\r\nLABORATORIO", "CONTEO LABORATORIO", "PROMEDIO DE CONTEO LAC", "PROMEDIO DE CONTEO LAC "
    ])
    const conteo_lac = conteo_lac_crudo !== null && conteo_lac_crudo >= 1e6
      ? Number((conteo_lac_crudo / 1e6).toFixed(2))
      : conteo_lac_crudo

    const diferencia_cruda = extraer_numero(["diferencia", "Diferencia", "DIFERENCIA ", "DIFERENCIA", "% ERROR CPM"])

    const viabilidad_cruda = extraer_numero([
      "viabilidadAvg", "PROMEDIO DE \r\nVIABILIDAD ", "PROMEDIO DE VIABILIDAD",
      "PROMEDIO\r\nVIABILIDAD", "VIABILIDAD\r\n", "viabilidad", "Viabilidad", "% VIABILIDAD"
    ])
    const factor_viabilidad =
      viabilidad_cruda !== null && viabilidad_cruda > 0
        ? viabilidad_cruda > 100
          ? viabilidad_cruda / 10000
          : viabilidad_cruda > 1
            ? viabilidad_cruda / 100
            : viabilidad_cruda
        : 0.97

    const a_porcentaje = (valor_num: number | null): number | null => {
      if (valor_num === null || valor_num <= 0) return valor_num
      return valor_num <= 1.5 ? Number((valor_num * 100).toFixed(2)) : Number(valor_num.toFixed(2))
    }

    const solidos_promedio = a_porcentaje(extraer_numero([
      "PROMEDIO SOLIDOS", "solidosAvg", "PROMEDIO DE % SOLIDOS", "PROMEDIO DE % SOLIDOS ",
      "solidos", "Solidos", "% Solidos"
    ]))
    const solidos_reales_crudo = a_porcentaje(extraer_numero([
      "solidosReales", "%VSS\r\nABER", "%VSS ABER", "solidosAber", "SOLIDOS REALES", "SOLIDOS ABER"
    ])) ?? solidos_promedio
    const solidos_vivos_crudo = a_porcentaje(extraer_numero([
      "solidosVivosLab", "%VSS\r\nLABORATORIO", "%VSS LABORATORIO", "solidosVivos", "solidosLab", "solidosLac", "SOLIDOS VIVOS LAB"
    ]))
    const error_solidos_crudo = extraer_numero(["errorSolidos", "diferenciaSolidos", "ERROR SOLIDOS", "% ERROR"])

    const solidos_vivos_calculado =
      solidos_vivos_crudo !== null && solidos_vivos_crudo > 0
        ? solidos_vivos_crudo
        : solidos_reales_crudo !== null && solidos_reales_crudo > 0
          ? Number((solidos_reales_crudo * factor_viabilidad).toFixed(2))
          : null

    const error_solidos_calculado =
      error_solidos_crudo !== null && error_solidos_crudo !== 0
        ? error_solidos_crudo
        : solidos_reales_crudo !== null && solidos_vivos_calculado !== null
          ? Number((solidos_reales_crudo - solidos_vivos_calculado).toFixed(2))
          : null

    const ambos_conteos_positivos = conteo_aber !== null && conteo_lac !== null && conteo_aber > 0 && conteo_lac > 0
    const es_diferencia_falsa =
      diferencia_cruda === -100 ||
      difference_is_missing_aber(conteo_aber, conteo_lac, diferencia_cruda)
    const diferencia_calculada = ambos_conteos_positivos
      ? Number((conteo_aber - conteo_lac).toFixed(2))
      : es_diferencia_falsa
        ? null
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
      viabilidadAvg: factor_viabilidad,
      solidosReales: solidos_reales_crudo,
      solidosVivosLab: solidos_vivos_calculado,
      errorSolidos: error_solidos_calculado,
    }
  })
}

function difference_is_missing_aber(aber: number | null, lac: number | null, diff: number | null): boolean {
  if (diff === null || diff === 0) return true
  if ((aber === null || aber === 0) && lac !== null && Math.abs(diff + lac) < 0.05) return true
  return false
}

export function obtener_base_mediciones_validas_aber(registros: RegistroAberNormalizado[]): RegistroAberNormalizado[] {
  const completas = registros.filter((reg) => reg.conteoAber !== null && reg.conteoLac !== null && reg.conteoAber > 0 && reg.conteoLac > 0)
  return completas.length > 0 ? completas : registros.filter((reg) => reg.conteoAber !== null && reg.conteoLac !== null)
}

export function obtener_mediciones_solidos_validas_aber(registros: RegistroAberNormalizado[]): RegistroAberNormalizado[] {
  return registros.filter((reg) => reg.solidosReales !== null && reg.solidosVivosLab !== null && reg.solidosReales > 0 && reg.solidosVivosLab > 0)
}

export function agrupar_desviacion_por_fecha_aber(datos_correlacion: RegistroAberNormalizado[]) {
  const fechas_unicas = Array.from(new Set(datos_correlacion.map((registro_actual) => registro_actual.fecha)))
  return fechas_unicas.map((fecha_actual) => {
    const filas_l1 = datos_correlacion.filter((reg) => reg.fecha === fecha_actual && String(reg.linea).includes("1"))
    const filas_l2 = datos_correlacion.filter((reg) => reg.fecha === fecha_actual && String(reg.linea).includes("2"))
    const promediar = (filas: RegistroAberNormalizado[], campo: "diferencia" | "solidosAvg" | "errorSolidos") => {
      const validos = filas.map((fila) => fila[campo]).filter((valor): valor is number => valor !== null && !isNaN(valor))
      return validos.length > 0 ? Number((validos.reduce((acum, act) => acum + act, 0) / validos.length).toFixed(2)) : null
    }
    return {
      fecha: fecha_actual,
      diffL1: promediar(filas_l1, "diferencia"),
      diffL2: promediar(filas_l2, "diferencia"),
      solidosL1: promediar(filas_l1, "solidosAvg"),
      solidosL2: promediar(filas_l2, "solidosAvg"),
      errorSolidosL1: promediar(filas_l1, "errorSolidos"),
      errorSolidosL2: promediar(filas_l2, "errorSolidos"),
    }
  })
}
