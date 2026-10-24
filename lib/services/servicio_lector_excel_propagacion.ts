/**
 * @fileoverview Servicio de lectura y exportación de archivos Excel (.xlsx/.xls) para el módulo
 * de Propagación de Levadura.
 */

import * as XLSX from "xlsx"
import { formatear_fecha_excel } from "@/lib/utils"

/**
 * Busca el índice de una columna en las cabeceras o en las primeras 10 filas de la hoja de cálculo.
 * @param filas_hoja - Matriz bidimensional de celdas del archivo Excel.
 * @param cabeceras_principales - Arreglo de cabeceras de la fila principal.
 * @param predicado_coincidencia - Función evaluadora del texto de cabecera.
 * @returns Índice de la columna encontrada o -1 si no existe.
 */
function buscar_indice_columna_excel(
  filas_hoja: any[][],
  cabeceras_principales: any[],
  predicado_coincidencia: (texto_celda: string) => boolean
): number {
  const indice_cabecera = cabeceras_principales.findIndex(
    (celda_cabecera: any) => celda_cabecera && predicado_coincidencia(celda_cabecera.toString().trim())
  )
  if (indice_cabecera !== -1) return indice_cabecera

  for (let indice_fila = 0; indice_fila < Math.min(filas_hoja.length, 10); indice_fila++) {
    const fila_actual = filas_hoja[indice_fila]
    if (!fila_actual) continue
    for (let indice_columna = 0; indice_columna < fila_actual.length; indice_columna++) {
      const valor_celda = fila_actual[indice_columna]
      if (valor_celda && predicado_coincidencia(valor_celda.toString().trim())) {
        return indice_columna
      }
    }
  }
  return -1
}

/**
 * Extrae y normaliza los registros de propagación desde la matriz de filas leída de un archivo Excel.
 * @param filas_excel - Matriz bidimensional de celdas de la hoja de propagación.
 * @returns Arreglo de objetos de propagación normalizados o null si falta la cabecera de Viabilidad.
 */
export function extraer_registros_excel_propagacion(filas_excel: any[][]): Record<string, any>[] | null {
  let indice_fila_cabecera = -1
  for (let indice_busqueda = 0; indice_busqueda < Math.min(10, filas_excel.length); indice_busqueda++) {
    const fila_candidata = filas_excel[indice_busqueda]
    if (
      fila_candidata &&
      fila_candidata.some(
        (celda_actual: any) => celda_actual && celda_actual.toString().toLowerCase().includes("viabilidad")
      )
    ) {
      indice_fila_cabecera = indice_busqueda
      break
    }
  }

  if (indice_fila_cabecera === -1) return null

  const cabeceras_hoja = filas_excel[indice_fila_cabecera]
  const filas_datos = filas_excel.slice(indice_fila_cabecera + 1)

  const idx_plato = cabeceras_hoja.findIndex((cab: string) => cab && cab.toString().trim() === "°P")
  const idx_ph = cabeceras_hoja.findIndex((cab: string) => cab && cab.toString().trim() === "pH.")
  const idx_conteo = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("conteo de celulas") || texto.toLowerCase() === "conteo"
  )
  const idx_viab = buscar_indice_columna_excel(filas_excel, cabeceras_hoja, (texto) =>
    texto.toLowerCase().includes("viabilidad")
  )
  const idx_fecha = buscar_indice_columna_excel(filas_excel, cabeceras_hoja, (texto) =>
    texto.toLowerCase().includes("fecha")
  )
  const idx_hora = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("hora inicio") || texto.toLowerCase() === "hora"
  )
  const idx_tipo_lev = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("tipo de lev") || texto.toLowerCase() === "cepa" || texto.toLowerCase() === "marca"
  )
  const idx_tanque = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().trim() === "tanque" || texto.toLowerCase().trim() === "tcc"
  )
  const idx_gen = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("gen.") || texto.toLowerCase() === "gen" || texto.toLowerCase().includes("generaci")
  )
  const idx_vuelta = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("vuelta") || texto.toLowerCase() === "vta" || texto.toLowerCase() === "vta."
  )
  const idx_codigo = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("codigo") || texto.toLowerCase().includes("código")
  )
  let idx_dobleteo = buscar_indice_columna_excel(filas_excel, cabeceras_hoja, (texto) =>
    texto.toLowerCase().includes("doblete")
  )
  if (idx_dobleteo === -1) idx_dobleteo = 19

  const idx_solidos = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("% de solidos") || texto.toLowerCase().includes("% de sólidos")
  )
  const idx_temp = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("temp del mosto") || texto.toLowerCase().includes("temp. en tanque") || texto.toLowerCase().includes("temperatura")
  )
  const idx_vigor = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => (texto.toLowerCase().includes("vigor") || texto.toLowerCase().includes("vigososas")) && !texto.toLowerCase().includes("muy")
  )
  const idx_muy_vigor = buscar_indice_columna_excel(filas_excel, cabeceras_hoja, (texto) =>
    texto.toLowerCase().includes("muy vig")
  )
  const idx_debiles = buscar_indice_columna_excel(
    filas_excel,
    cabeceras_hoja,
    (texto) => texto.toLowerCase().includes("debiles") || texto.toLowerCase().includes("débiles")
  )
  const idx_muertas = buscar_indice_columna_excel(filas_excel, cabeceras_hoja, (texto) =>
    texto.toLowerCase().includes("muertas")
  )

  const registros_extraidos: Record<string, any>[] = []

  filas_datos.forEach((fila_actual) => {
    const valor_viabilidad_crudo = Number(fila_actual[idx_viab])
    const valor_viabilidad = !isNaN(valor_viabilidad_crudo) && valor_viabilidad_crudo > 0 ? valor_viabilidad_crudo : 0
    const valor_plato = Number(fila_actual[idx_plato]) || 0
    const valor_ph = Number(fila_actual[idx_ph]) || 0
    const valor_conteo = Number(fila_actual[idx_conteo]) || 0
    const valor_temp = idx_temp >= 0 ? Number(fila_actual[idx_temp]) || 0 : 0
    const texto_fecha = idx_fecha >= 0 ? formatear_fecha_excel(fila_actual[idx_fecha]) : "N/A"
    const tiene_metricas_validas =
      valor_viabilidad > 0 || valor_conteo > 0 || valor_plato > 0 || valor_ph > 0 || valor_temp > 0

    if (texto_fecha !== "N/A" && tiene_metricas_validas) {
      const valor_vigorosas = idx_vigor >= 0 ? Number(fila_actual[idx_vigor]) || 0 : 0
      const valor_muy_vigorosas = idx_muy_vigor >= 0 ? Number(fila_actual[idx_muy_vigor]) || 0 : 0
      let texto_hora = idx_hora >= 0 ? fila_actual[idx_hora]?.toString() : "N/A"
      if (texto_hora !== "N/A" && !isNaN(Number(texto_hora))) {
        const minutos_totales = Math.round(Number(texto_hora) * 24 * 60)
        const horas_str = Math.floor(minutos_totales / 60).toString().padStart(2, "0")
        const minutos_str = (minutos_totales % 60).toString().padStart(2, "0")
        texto_hora = `${horas_str}:${minutos_str}`
      }

      registros_extraidos.push({
        fecha: texto_fecha,
        hora: texto_hora,
        tipoLev: idx_tipo_lev >= 0 && fila_actual[idx_tipo_lev] ? fila_actual[idx_tipo_lev].toString().trim() : "General",
        tanque: idx_tanque >= 0 && fila_actual[idx_tanque] ? fila_actual[idx_tanque].toString().trim() : "N/A",
        dobleteo: idx_dobleteo >= 0 && fila_actual[idx_dobleteo] ? fila_actual[idx_dobleteo].toString().trim() : "N/A",
        generacion: idx_gen >= 0 && fila_actual[idx_gen] !== undefined && fila_actual[idx_gen] !== "" ? fila_actual[idx_gen].toString().trim() : "N/A",
        vuelta: idx_vuelta >= 0 && fila_actual[idx_vuelta] !== undefined && fila_actual[idx_vuelta] !== "" ? fila_actual[idx_vuelta].toString().trim() : "1",
        codigoCultivo: idx_codigo >= 0 && fila_actual[idx_codigo] !== undefined ? fila_actual[idx_codigo].toString().trim() : "N/A",
        plato: valor_plato,
        ph: valor_ph,
        conteo: valor_conteo,
        viab: valor_viabilidad,
        vigor: valor_vigorosas + valor_muy_vigorosas,
        debiles: idx_debiles >= 0 ? Number(fila_actual[idx_debiles]) || 0 : null,
        muertas: idx_muertas >= 0 ? Number(fila_actual[idx_muertas]) || 0 : null,
        solidos: idx_solidos >= 0 ? Number(fila_actual[idx_solidos]) || 0 : 0,
        temp: valor_temp,
      })
    }
  })

  return registros_extraidos
}

/**
 * Genera y descarga un archivo Excel resumen de capacidad de proceso.
 */
export function exportar_reporte_capacidad_excel(): void {
  const hoja_calculo = XLSX.utils.json_to_sheet([
    { Indicador: "Viabilidad", Media: 96.7, Cpk: 1.32 },
    { Indicador: "Conteo", Media: 206.3, Cpk: 1.21 },
  ])
  const libro_excel = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro_excel, hoja_calculo, "Capacidad")
  XLSX.writeFile(libro_excel, "Reporte_Capacidad.xlsx")
}
