/**
 * @fileoverview Utilidades transversales para combinación de clases CSS, conversión de fechas
 * seriales de Excel, ordenamiento de códigos de cultivo y normalización de propagación.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const MAPA_MESES_CORTOS: Record<string, string> = {
  ene: "01", jan: "01", feb: "02", mar: "03", abr: "04", apr: "04",
  may: "05", jun: "06", jul: "07", ago: "08", aug: "08", sep: "09",
  oct: "10", nov: "11", dic: "12", dec: "12",
}

/**
 * Combina clases condicionales de Tailwind CSS resolviendo conflictos de especificidad.
 * @param lista_clases_entrada - Clases CSS o expresiones condicionales a fusionar.
 * @returns Cadena de clases CSS unificada y limpia.
 */
export function combinar_clases_css(...lista_clases_entrada: ClassValue[]): string {
  return twMerge(clsx(lista_clases_entrada))
}

/**
 * Convierte un valor de fecha (serial numérico de Excel o cadena de texto) al formato DD/MM/YYYY.
 * @param valor_fecha_crudo - Valor de fecha proveniente de Excel o Firebase.
 * @param anio_respaldo - Año opcional cuando la celda solo contiene día y mes (ej. "16-Jul").
 * @returns Cadena de fecha formateada o "N/A" si el valor no es válido.
 */
export function formatear_fecha_excel(valor_fecha_crudo: unknown, anio_respaldo?: unknown): string {
  if (valor_fecha_crudo === undefined || valor_fecha_crudo === null || valor_fecha_crudo === "") return "N/A"
  const texto_limpio = String(valor_fecha_crudo).trim()
  if (!texto_limpio || texto_limpio.toUpperCase() === "N/A" || texto_limpio.toUpperCase() === "UNDEFINED") return "N/A"
  const numero_serial = Number(texto_limpio)
  if (!isNaN(numero_serial) && numero_serial > 20000 && numero_serial < 100000) {
    const dias_utc = Math.floor(numero_serial + 0.0001 - 25569)
    const fecha_calculada = new Date(dias_utc * 86400 * 1000)
    const dia_mes = String(fecha_calculada.getUTCDate()).padStart(2, "0")
    const mes_anio = String(fecha_calculada.getUTCMonth() + 1).padStart(2, "0")
    return `${dia_mes}/${mes_anio}/${fecha_calculada.getUTCFullYear()}`
  }
  const coincidencia_texto = texto_limpio.match(/^(\d{1,2})[-\/\s]([a-zA-ZáéíóúÁÉÍÓÚ]{3,})(?:[-\/\s](\d{2,4}))?$/)
  if (coincidencia_texto) {
    const mes_cod = MAPA_MESES_CORTOS[coincidencia_texto[2].slice(0, 3).toLowerCase()]
    const anio_explicito = coincidencia_texto[3]
      ? (coincidencia_texto[3].length === 2 ? `20${coincidencia_texto[3]}` : coincidencia_texto[3])
      : (anio_respaldo && /^20\d{2}$/.test(String(anio_respaldo).trim()) ? String(anio_respaldo).trim() : "")
    if (mes_cod && anio_explicito) {
      return `${coincidencia_texto[1].padStart(2, "0")}/${mes_cod}/${anio_explicito}`
    }
  }
  return texto_limpio
}

/**
 * Extrae un número de punto flotante válido desde cualquier celda cruda de Excel o JSON.
 * @param valor_celda_crudo - Valor numérico o texto con decimales a convertir.
 * @returns Número válido o 0 cuando la celda está vacía o contiene "N/A".
 */
export function parsear_valor_numerico(valor_celda_crudo: unknown): number {
  if (valor_celda_crudo === undefined || valor_celda_crudo === null || valor_celda_crudo === "") return 0
  if (typeof valor_celda_crudo === "number") return isNaN(valor_celda_crudo) ? 0 : valor_celda_crudo
  const texto_normalizado = String(valor_celda_crudo).trim().replace(",", ".")
  if (!texto_normalizado || texto_normalizado.toUpperCase() === "N/A" || texto_normalizado === "-") return 0
  const numero_convertido = parseFloat(texto_normalizado)
  return isNaN(numero_convertido) ? 0 : numero_convertido
}

/**
 * Convierte un numeral romano o arábigo (con o sin año, ej. "XIX-2025") en clave de ordenamiento.
 * @param gen_a - Primera generación o código de cultivo.
 * @param gen_b - Segunda generación o código de cultivo.
 * @returns Diferencia numérica para Array.prototype.sort.
 */
export function comparar_generaciones_cultivo(gen_a: string, gen_b: string): number {
  const evaluar = (texto_gen: string) => {
    const limpio = String(texto_gen || "").trim().toUpperCase()
    const num_directo = Number(limpio)
    if (!isNaN(num_directo)) return { anio: 0, orden: num_directo }
    const coincidencia_anio = limpio.match(/\b(20\d{2})\b/)
    const anio = coincidencia_anio ? Number(coincidencia_anio[1]) : 9999
    const codigo = limpio.replace(/\b20\d{2}\b/g, "").replace(/[^IVXLCDM0-9]/g, "")
    if (/^\d+$/.test(codigo)) return { anio, orden: Number(codigo) }
    const valores_romanos: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 }
    let suma_romana = 0
    for (let idx = 0; idx < codigo.length; idx++) {
      const actual = valores_romanos[codigo[idx]] || 0
      const siguiente = valores_romanos[codigo[idx + 1]] || 0
      suma_romana += actual < siguiente ? -actual : actual
    }
    return { anio, orden: suma_romana || 999 }
  }
  const par_a = evaluar(gen_a), par_b = evaluar(gen_b)
  return par_a.anio !== par_b.anio ? par_a.anio - par_b.anio : par_a.orden - par_b.orden
}

/**
 * Normaliza una fila cruda de propagación unificando cabeceras, generación (código de cultivo + año) y tiempos.
 * @param registro_crudo - Objeto de fila original almacenado en Firebase o archivo JSON/CSV.
 * @returns Objeto de fila normalizado con todas las propiedades requeridas por el panel.
 */
export function normalizar_fila_propagacion(registro_crudo: Record<string, any>): Record<string, any> {
  if (!registro_crudo || typeof registro_crudo !== "object") return {}
  const anio_crudo = registro_crudo["Año"] ?? registro_crudo.anio ?? registro_crudo.Anio
  const fecha_formateada = formatear_fecha_excel(registro_crudo.Fecha ?? registro_crudo["Fecha "] ?? registro_crudo.fecha ?? "", anio_crudo)
  const hora_cruda = registro_crudo["Hora Inicio"] ?? registro_crudo.hora
  let hora_formateada = "N/A"
  if (hora_cruda !== undefined && hora_cruda !== null && hora_cruda !== "" && hora_cruda !== "N/A") {
    const fraccion_horaria = Number(hora_cruda)
    if (!isNaN(fraccion_horaria) && fraccion_horaria >= 0 && fraccion_horaria < 1) {
      const minutos_totales = Math.round(fraccion_horaria * 24 * 60)
      hora_formateada = `${String(Math.floor(minutos_totales / 60)).padStart(2, "0")}:${String(minutos_totales % 60).padStart(2, "0")}`
    } else {
      hora_formateada = String(hora_cruda).trim()
    }
  }

  const codigo_cultivo_limpio = String(
    registro_crudo["Codigo de Cultivo"] ?? registro_crudo.codigoCultivo ?? registro_crudo.Codigo ?? "S/C"
  ).trim().toUpperCase()
  const anio_extraido = (anio_crudo && /^20\d{2}$/.test(String(anio_crudo).trim()))
    ? String(anio_crudo).trim()
    : (fecha_formateada.match(/\b(20\d{2})\b/)?.[1] || "")
  const gen_respaldo = String(registro_crudo["Gen."] ?? registro_crudo.generacion ?? registro_crudo.gen ?? registro_crudo["Gen"] ?? "N/A").trim()
  const tiene_codigo_valido = Boolean(codigo_cultivo_limpio && codigo_cultivo_limpio !== "S/C" && codigo_cultivo_limpio !== "N/A" && codigo_cultivo_limpio !== "UNDEFINED")
  const generacion_limpia = tiene_codigo_valido
    ? (/\b20\d{2}\b/.test(codigo_cultivo_limpio) ? codigo_cultivo_limpio : `${codigo_cultivo_limpio}-${anio_extraido || new Date().getFullYear()}`)
    : gen_respaldo

  const texto_dobleteo = String(registro_crudo.Dobleteo ?? registro_crudo.dobleteo ?? "N/A").trim()
  const dobleteo_mayus = texto_dobleteo.toUpperCase()
  const dobleteo_limpio = dobleteo_mayus === "ANTES" ? "Antes" : (dobleteo_mayus === "DESPUES" || dobleteo_mayus === "DESPUÉS" ? "Despues" : texto_dobleteo)

  const muy_vig = parsear_valor_numerico(registro_crudo["Vitalidad ( muy vigososas )"] ?? registro_crudo["Vitalidad (Muy Vigorosas)"] ?? registro_crudo.muyVigorosas)
  const vig_solo = parsear_valor_numerico(registro_crudo["Vitalidad ( Vigorosas)"] ?? registro_crudo["Vitalidad (Vigorosas)"] ?? registro_crudo.vigorosasSolo)
  const vitalidad_total = (muy_vig > 0 || vig_solo > 0) ? Number((muy_vig + vig_solo).toFixed(2)) : parsear_valor_numerico(registro_crudo.vigor ?? registro_crudo.vig ?? registro_crudo.vigorosas)

  let conteo_celular = parsear_valor_numerico(registro_crudo["Conteo de Celulas x106 (Cel/mL)"] ?? registro_crudo.conteo)
  if (conteo_celular > 1000) conteo_celular = Number((conteo_celular / 1000).toFixed(2))

  const temp_tanque = parsear_valor_numerico(registro_crudo["Temp.en Tanque (°C)"] ?? registro_crudo["Temp. en Tanque (°C)"])
  const temp_mosto = parsear_valor_numerico(registro_crudo["Temp del mosto frio (°C)"] ?? registro_crudo["Temp del mosto frío (°C)"])
  const p_tanque = parsear_valor_numerico(registro_crudo["Presion en Tanque (Bar)"])
  const p_aire = parsear_valor_numerico(registro_crudo["Presion de Aire ( Bar)"])

  const t_crudo = registro_crudo["Atemperacion"] ?? registro_crudo["Atemperación"] ?? registro_crudo["Attemperacion (Hrs)"] ?? registro_crudo.atemperacion ?? registro_crudo["Tiempo de Operación"] ?? registro_crudo["Tiempo Total"]
  let horas_atemperacion = 0
  if (typeof t_crudo === "string" && t_crudo.includes(":")) {
    const partes = t_crudo.split(":").map(Number)
    if (!isNaN(partes[0])) horas_atemperacion = Number((partes[0] + (partes[1] || 0) / 60).toFixed(2))
  } else {
    horas_atemperacion = Number(parsear_valor_numerico(t_crudo).toFixed(2))
  }

  return {
    ...registro_crudo,
    fecha: fecha_formateada,
    hora: hora_formateada,
    generacion: generacion_limpia,
    tipoLev: String(registro_crudo["Tipo de Lev"] ?? registro_crudo.tipoLev ?? registro_crudo.Tipo ?? "N/A").trim().toUpperCase(),
    dobleteo: dobleteo_limpio,
    tanque: String(registro_crudo.Tanque ?? registro_crudo.tanque ?? "N/A").trim().replace(/\s+/g, " ").toUpperCase(),
    codigoCultivo: codigo_cultivo_limpio,
    viab: parsear_valor_numerico(registro_crudo["Viabilidad   %"] ?? registro_crudo["Viabilidad %"] ?? registro_crudo.viab ?? registro_crudo.viabilidad),
    vigor: vitalidad_total,
    vig: vitalidad_total,
    muyVigorosas: muy_vig > 0 ? muy_vig : vitalidad_total,
    vigorosasSolo: vig_solo,
    debiles: parsear_valor_numerico(registro_crudo["Vitalidad (Debiles)"] ?? registro_crudo.debiles),
    muertas: parsear_valor_numerico(registro_crudo["Vitalidad (Muertas)"] ?? registro_crudo.muertas),
    conteo: conteo_celular,
    plato: parsear_valor_numerico(registro_crudo["°P"] ?? registro_crudo.plato),
    ph: parsear_valor_numerico(registro_crudo["pH."] ?? registro_crudo["pH"] ?? registro_crudo.ph),
    solidos: parsear_valor_numerico(registro_crudo["% de Solidos"] ?? registro_crudo.solidos),
    temp: temp_tanque > 0 ? temp_tanque : (temp_mosto > 0 ? temp_mosto : parsear_valor_numerico(registro_crudo.temp)),
    escalamiento: parsear_valor_numerico(registro_crudo["Escalamiento"] ?? registro_crudo.escalamiento),
    presion: p_tanque > 0 ? p_tanque : (p_aire > 0 ? p_aire : parsear_valor_numerico(registro_crudo.presion)),
    purga: parsear_valor_numerico(registro_crudo["Tiempo de Purga de TRUB (Seg)"] ?? registro_crudo.purga),
    aireacion: parsear_valor_numerico(registro_crudo["Aireacion (Kg/Hl)"] ?? registro_crudo.aireacion),
    zn: parsear_valor_numerico(registro_crudo["Zn en mosto (gr / Hl)"] ?? registro_crudo.zn),
    atemperacion: horas_atemperacion,
  }
}

export {
  combinar_clases_css as cn,
  formatear_fecha_excel as formatExcelDate,
  parsear_valor_numerico as parseNumericValue,
  normalizar_fila_propagacion as normalizePropagationRow,
}
