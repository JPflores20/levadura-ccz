/**
 * @fileoverview Utilidades de análisis y conversión de fechas para el componente selector de calendario.
 */

export const NOMBRES_MESES_ESPANOL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

/**
 * Convierte cualquier cadena de fecha (serial de Excel, DD/MM/YYYY, YYYY-MM-DD o texto con mes)
 * en un objeto Date y su representación ISO YYYY-MM-DD.
 * @param texto_fecha_entrada - Cadena de fecha original disponible en los filtros.
 * @returns Objeto con la instancia Date, la cadena ISO y el texto original.
 */
export function parsear_fecha_calendario(texto_fecha_entrada: string): {
  date: Date | null
  isoStr: string
  original: string
} {
  let fecha_convertida: Date | null = null
  const texto_limpio = texto_fecha_entrada.trim()

  if (!isNaN(Number(texto_limpio))) {
    const epoca_excel = new Date(1899, 11, 30)
    fecha_convertida = new Date(epoca_excel.getTime() + Number(texto_limpio) * 86400000)
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(texto_limpio)) {
    const [anio_num, mes_num, dia_num] = texto_limpio.split("-").map(Number)
    fecha_convertida = new Date(anio_num, mes_num - 1, dia_num)
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto_limpio)) {
    const [dia_num, mes_num, anio_num] = texto_limpio.split("/").map(Number)
    fecha_convertida = new Date(anio_num, mes_num - 1, dia_num)
  } else {
    const segmentos_texto = texto_limpio.split(/[\s\-]+/)
    if (segmentos_texto.length >= 2) {
      const numero_dia = parseInt(segmentos_texto[0], 10)
      const fragmento_mes = segmentos_texto[1].toLowerCase()
      const indice_mes = NOMBRES_MESES_ESPANOL.findIndex((nombre_mes) =>
        nombre_mes.toLowerCase().startsWith(fragmento_mes.substring(0, 3))
      )
      if (!isNaN(numero_dia) && indice_mes !== -1) {
        fecha_convertida = new Date(new Date().getFullYear(), indice_mes, numero_dia)
      } else {
        fecha_convertida = new Date(texto_limpio)
      }
    } else {
      fecha_convertida = new Date(texto_limpio)
    }
  }

  if (fecha_convertida && isNaN(fecha_convertida.getTime())) {
    fecha_convertida = null
  }

  let cadena_iso = texto_limpio
  if (fecha_convertida) {
    const anio_str = fecha_convertida.getFullYear()
    const mes_str = String(fecha_convertida.getMonth() + 1).padStart(2, "0")
    const dia_str = String(fecha_convertida.getDate()).padStart(2, "0")
    cadena_iso = `${anio_str}-${mes_str}-${dia_str}`
  }

  return { date: fecha_convertida, isoStr: cadena_iso, original: texto_limpio }
}

/**
 * Construye el mapa de fechas disponibles (ISO -> opción original) y detecta la fecha más reciente.
 * @param opciones_fecha - Arreglo de cadenas de fecha disponibles.
 * @returns Mapa de fechas ISO y la fecha más reciente encontrada.
 */
export function construir_mapa_fechas_disponibles(opciones_fecha: string[]) {
  const mapa_fechas_disponibles = new Map<string, string>()
  let fecha_mas_reciente: Date | null = null

  opciones_fecha.forEach((opcion_actual) => {
    if (!opcion_actual || opcion_actual === "N/A") return
    const { date: fecha_obj, isoStr: clave_iso, original: texto_original } = parsear_fecha_calendario(opcion_actual)
    if (fecha_obj) {
      mapa_fechas_disponibles.set(clave_iso, texto_original)
      if (!fecha_mas_reciente || fecha_obj > fecha_mas_reciente) {
        fecha_mas_reciente = fecha_obj
      }
    } else {
      mapa_fechas_disponibles.set(opcion_actual, opcion_actual)
    }
  })

  return { mapa_fechas_disponibles, fecha_mas_reciente }
}
