/**
 * @fileoverview Utilidades transversales para combinación de clases CSS, conversión de fechas
 * seriales de Excel y normalización de registros de propagación de levadura.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
 * @returns Cadena de fecha formateada o "N/A" si el valor no es válido.
 */
export function formatear_fecha_excel(valor_fecha_crudo: unknown): string {
  if (valor_fecha_crudo === undefined || valor_fecha_crudo === null || valor_fecha_crudo === "") return "N/A"
  const texto_limpio = String(valor_fecha_crudo).trim()
  if (!texto_limpio || texto_limpio.toUpperCase() === "N/A" || texto_limpio.toUpperCase() === "UNDEFINED") return "N/A"
  const numero_serial = Number(texto_limpio)
  if (!isNaN(numero_serial) && numero_serial > 20000 && numero_serial < 100000) {
    const dias_utc = Math.floor(numero_serial - 25569)
    const fecha_calculada = new Date(dias_utc * 86400 * 1000)
    const dia_mes = String(fecha_calculada.getUTCDate()).padStart(2, "0")
    const mes_anio = String(fecha_calculada.getUTCMonth() + 1).padStart(2, "0")
    const anio_completo = fecha_calculada.getUTCFullYear()
    return `${dia_mes}/${mes_anio}/${anio_completo}`
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
 * Normaliza una fila cruda de propagación proveniente de Excel/Firebase unificando cabeceras
 * y corrigiendo escalas numéricas (como suma de vitalidades y punto decimal de conteo).
 * @param registro_crudo - Objeto de fila original almacenado en Firebase o archivo JSON.
 * @returns Objeto de fila normalizado con todas las propiedades requeridas por el panel.
 */
export function normalizar_fila_propagacion(registro_crudo: Record<string, any>): Record<string, any> {
  if (!registro_crudo || typeof registro_crudo !== "object") return {}

  const fecha_formateada = formatear_fecha_excel(registro_crudo.Fecha ?? registro_crudo.fecha ?? "")
  const hora_cruda = registro_crudo["Hora Inicio"] ?? registro_crudo.hora
  let hora_formateada = "N/A"
  if (hora_cruda !== undefined && hora_cruda !== null && hora_cruda !== "" && hora_cruda !== "N/A") {
    const fraccion_horaria = Number(hora_cruda)
    if (!isNaN(fraccion_horaria) && fraccion_horaria >= 0 && fraccion_horaria < 1) {
      const minutos_totales = Math.round(fraccion_horaria * 24 * 60)
      const horas_reloj = String(Math.floor(minutos_totales / 60)).padStart(2, "0")
      const minutos_reloj = String(minutos_totales % 60).padStart(2, "0")
      hora_formateada = `${horas_reloj}:${minutos_reloj}`
    } else {
      hora_formateada = String(hora_cruda).trim()
    }
  }

  const generacion_limpia = String(
    registro_crudo["Gen."] ?? registro_crudo.generacion ?? registro_crudo.gen ?? registro_crudo["Gen"] ?? "N/A"
  ).trim()
  const tipo_levadura_limpio = String(
    registro_crudo["Tipo de Lev"] ?? registro_crudo.tipoLev ?? registro_crudo.Tipo ?? "N/A"
  ).trim().toUpperCase()

  const texto_dobleteo = String(registro_crudo.Dobleteo ?? registro_crudo.dobleteo ?? "N/A").trim()
  const dobleteo_mayusculas = texto_dobleteo.toUpperCase()
  const dobleteo_limpio =
    dobleteo_mayusculas === "ANTES" ? "Antes" :
    dobleteo_mayusculas === "DESPUES" || dobleteo_mayusculas === "DESPUÉS" ? "Despues" :
    texto_dobleteo

  const tanque_limpio = String(registro_crudo.Tanque ?? registro_crudo.tanque ?? "N/A")
    .trim().replace(/\s+/g, " ").toUpperCase()
  const codigo_cultivo_limpio = String(
    registro_crudo["Codigo de Cultivo"] ?? registro_crudo.codigoCultivo ?? registro_crudo.Codigo ?? "S/C"
  ).trim().toUpperCase()

  const porcentaje_viabilidad = parsear_valor_numerico(
    registro_crudo["Viabilidad   %"] ?? registro_crudo["Viabilidad %"] ?? registro_crudo.viab ?? registro_crudo.viabilidad
  )
  const porcentaje_muy_vigorosas = parsear_valor_numerico(
    registro_crudo["Vitalidad ( muy vigososas )"] ?? registro_crudo["Vitalidad (Muy Vigorosas)"] ?? registro_crudo.muyVigorosas
  )
  const porcentaje_vigorosas_solo = parsear_valor_numerico(
    registro_crudo["Vitalidad ( Vigorosas)"] ?? registro_crudo["Vitalidad (Vigorosas)"] ?? registro_crudo.vigorosasSolo
  )
  const porcentaje_vitalidad_total = (porcentaje_muy_vigorosas > 0 || porcentaje_vigorosas_solo > 0)
    ? Number((porcentaje_muy_vigorosas + porcentaje_vigorosas_solo).toFixed(2))
    : parsear_valor_numerico(registro_crudo.vigor ?? registro_crudo.vig ?? registro_crudo.vigorosas)

  let conteo_celular = parsear_valor_numerico(
    registro_crudo["Conteo de Celulas x106 (Cel/mL)"] ?? registro_crudo.conteo
  )
  if (conteo_celular > 1000) conteo_celular = Number((conteo_celular / 1000).toFixed(2))

  const temp_tanque = parsear_valor_numerico(registro_crudo["Temp.en Tanque (°C)"] ?? registro_crudo["Temp. en Tanque (°C)"])
  const temp_mosto = parsear_valor_numerico(registro_crudo["Temp del mosto frio (°C)"] ?? registro_crudo["Temp del mosto frío (°C)"])
  const temperatura_final = temp_tanque > 0 ? temp_tanque : (temp_mosto > 0 ? temp_mosto : parsear_valor_numerico(registro_crudo.temp))

  const presion_tanque = parsear_valor_numerico(registro_crudo["Presion en Tanque (Bar)"])
  const presion_aire = parsear_valor_numerico(registro_crudo["Presion de Aire ( Bar)"])

  return {
    ...registro_crudo,
    fecha: fecha_formateada,
    hora: hora_formateada,
    generacion: generacion_limpia,
    tipoLev: tipo_levadura_limpio,
    dobleteo: dobleteo_limpio,
    tanque: tanque_limpio,
    codigoCultivo: codigo_cultivo_limpio,
    viab: porcentaje_viabilidad,
    vigor: porcentaje_vitalidad_total,
    vig: porcentaje_vitalidad_total,
    muyVigorosas: porcentaje_muy_vigorosas > 0 ? porcentaje_muy_vigorosas : porcentaje_vitalidad_total,
    vigorosasSolo: porcentaje_vigorosas_solo,
    debiles: parsear_valor_numerico(registro_crudo["Vitalidad (Debiles)"] ?? registro_crudo.debiles),
    muertas: parsear_valor_numerico(registro_crudo["Vitalidad (Muertas)"] ?? registro_crudo.muertas),
    conteo: conteo_celular,
    plato: parsear_valor_numerico(registro_crudo["°P"] ?? registro_crudo.plato),
    ph: parsear_valor_numerico(registro_crudo["pH."] ?? registro_crudo["pH"] ?? registro_crudo.ph),
    solidos: parsear_valor_numerico(registro_crudo["% de Solidos"] ?? registro_crudo.solidos),
    temp: temperatura_final,
    escalamiento: parsear_valor_numerico(registro_crudo["Escalamiento"] ?? registro_crudo.escalamiento),
    presion: presion_tanque > 0 ? presion_tanque : (presion_aire > 0 ? presion_aire : parsear_valor_numerico(registro_crudo.presion)),
    purga: parsear_valor_numerico(registro_crudo["Tiempo de Purga de TRUB (Seg)"] ?? registro_crudo.purga),
    aireacion: parsear_valor_numerico(registro_crudo["Aireacion (Kg/Hl)"] ?? registro_crudo.aireacion),
    zn: parsear_valor_numerico(registro_crudo["Zn en mosto (gr / Hl)"] ?? registro_crudo.zn),
  }
}

export {
  combinar_clases_css as cn,
  formatear_fecha_excel as formatExcelDate,
  parsear_valor_numerico as parseNumericValue,
  normalizar_fila_propagacion as normalizePropagationRow,
}
