/**
 * @fileoverview Servicio de dominio para extracción de propiedades, cálculo de KPIs de inicio
 * de fermentación, tabla de compuestos y evolución cinética (F0..Fn y R0..Rn).
 */

/**
 * Busca el valor de una propiedad en un objeto priorizando coincidencia exacta y descartando vacíos.
 * @param objeto_registro - Fila de datos de cinética.
 * @param llaves_candidatas - Lista de nombres de columna posibles.
 * @returns El valor encontrado o null si no existe.
 */
export function obtener_propiedad_cinetica(objeto_registro: any, llaves_candidatas: string[]): any {
  if (!objeto_registro) return null
  const llaves_objeto = Object.keys(objeto_registro)

  for (const llave_buscada of llaves_candidatas) {
    const clave_limpia = llave_buscada.toLowerCase().replace(/[\s\.]/g, "")
    const llave_exacta = llaves_objeto.find((llave) => llave.toLowerCase().replace(/[\s\.]/g, "") === clave_limpia)
    if (llave_exacta && objeto_registro[llave_exacta] !== "" && objeto_registro[llave_exacta] != null) {
      return objeto_registro[llave_exacta]
    }
  }

  for (const llave_buscada of llaves_candidatas) {
    const clave_limpia = llave_buscada.toLowerCase().replace(/[\s\.]/g, "")
    const llave_parcial = llaves_objeto.find(
      (llave) =>
        llave.toLowerCase().replace(/[\s\.]/g, "").includes(clave_limpia) &&
        objeto_registro[llave] !== "" &&
        objeto_registro[llave] != null
    )
    if (llave_parcial) return objeto_registro[llave_parcial]
  }
  return null
}

/**
 * Extrae un valor numérico desde una fila de cinética buscando palabras clave y aplicando exclusiones.
 * @param fila_registro - Objeto de fila individual.
 * @param palabras_clave - Palabras clave para localizar la columna.
 * @param palabras_excluidas - Subcadenas que invalidan la coincidencia de columna.
 * @returns Valor numérico encontrado o 0 si no existe.
 */
export function obtener_valor_numerico_fila(
  fila_registro: any,
  palabras_clave: string[],
  palabras_excluidas?: string[]
): number {
  if (!fila_registro) return 0
  for (const palabra_clave of palabras_clave) {
    const clave_limpia = palabra_clave.toLowerCase().replace(/\s+/g, "")
    const llave_encontrada = Object.keys(fila_registro).find((llave_actual) => {
      const llave_normalizada = llave_actual.toLowerCase().replace(/\s+/g, "")
      if (!llave_normalizada.includes(clave_limpia)) return false
      if (palabras_excluidas?.some((excl) => llave_normalizada.includes(excl.toLowerCase().replace(/\s+/g, "")))) {
        return false
      }
      return fila_registro[llave_actual] !== undefined && fila_registro[llave_actual] !== "" && fila_registro[llave_actual] !== null
    })
    if (llave_encontrada) {
      const numero_convertido = parseFloat(String(fila_registro[llave_encontrada]).replace(",", "."))
      if (!isNaN(numero_convertido)) return numero_convertido
    }
  }
  return 0
}

/**
 * Calcula el promedio de los valores positivos de una columna sobre un conjunto de filas.
 * @param filas_filtradas - Arreglo de filas de cinética.
 * @param palabras_clave - Palabras clave de la columna.
 * @param palabras_excluidas - Subcadenas a excluir.
 * @returns Promedio redondeado a 2 decimales o 0 si no hay datos.
 */
export function calcular_promedio_columna_cinetica(
  filas_filtradas: any[],
  palabras_clave: string[],
  palabras_excluidas?: string[]
): number {
  const valores_positivos = filas_filtradas
    .map((fila_actual) => obtener_valor_numerico_fila(fila_actual, palabras_clave, palabras_excluidas))
    .filter((valor_num) => valor_num > 0)
  if (valores_positivos.length === 0) return 0
  return Number((valores_positivos.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_positivos.length).toFixed(2))
}

/**
 * Construye las 11 tarjetas KPI de Inicio de Fermentación para la pestaña de Cinéticas.
 * @param filas_filtradas - Registros de cinética filtrados actualmente.
 * @returns Arreglo de tarjetas KPI con valores formateados.
 */
export function construir_kpis_inicio_fermentacion(filas_filtradas: any[]) {
  const fmt = (valor_num: number) => (valor_num === 0 ? "-" : valor_num.toString())
  const prom_vig = calcular_promedio_columna_cinetica(filas_filtradas, ["Vitalidad", "Celulas Vigorosas", "Vigorosas", "vigososas"], ["muy"])
  const prom_muy_vig = calcular_promedio_columna_cinetica(filas_filtradas, ["Muy Vigorosas", "Muy Vig"])
  const vitalidad_total = Number((prom_vig + prom_muy_vig).toFixed(2))

  return [
    { id: "glucosa", label: "% Glucosa", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Glucosa"])), unit: "%", icon: "Percent", status: "ok" },
    { id: "fan", label: "FAN Mosto", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["FAN Mosto", "FAN"])), unit: "mg/L", icon: "FlaskConical", status: "ok" },
    { id: "el", label: "E.L", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["E.L", "Extracto Limite"])), unit: "°P", icon: "Gauge", status: "ok" },
    { id: "conteo", label: "Conteo Llenado", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Conteo de Celulas", "Conteo"])), unit: "x10^6", icon: "Activity", status: "ok" },
    { id: "temp", label: "Temp Llenado", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Temperatura de Llenado", "Temp. Llenado", "Temp"])), unit: "°C", icon: "Thermometer", status: "ok" },
    { id: "tiempo", label: "Tiempo Llenado", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Tiempo de Llenado", "Tiempo"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "aireacion", label: "Aireación", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Aireacion", "Aireación"])), unit: "kg/hl", icon: "Wind", status: "ok" },
    { id: "tempAlm", label: "Temp Almacenaje", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Temperatura de Almacenamiento", "Almacenamiento"])), unit: "°C", icon: "Thermometer", status: "ok" },
    { id: "tiempoAlm", label: "Tiempo Almacenaje", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Tiempo de Almacenamiento"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "viab", label: "Viabilidad", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Viabilidad Primera", "Viabilidad Primer", "Viabilidad"])), unit: "%", icon: "Activity", status: "ok" },
    { id: "vitalidad", label: "Vitalidad", value: fmt(vitalidad_total), unit: "%", icon: "Activity", status: "ok" },
  ]
}

/**
 * Construye las filas de la tabla resumen de compuestos aromáticos y volátiles de fermentación.
 * @param filas_filtradas - Registros de cinética filtrados.
 * @returns Arreglo con mínimo, promedio, máximo y valor final por compuesto.
 */
export function construir_tabla_compuestos_cinetica(filas_filtradas: any[]) {
  const catalogo_compuestos = [
    { id: "esteres", name: "Ésteres", keys: ["Esteres", "Ésteres"] },
    { id: "alcoholes", name: "Alcoholes Superiores", keys: ["Alcoholes Superiores", "Alcoholes"] },
    { id: "diacetilo", name: "Diacetilo", keys: ["Diacetilo"] },
    { id: "acetaldehido", name: "Acetaldehído", keys: ["Acetaldehido"] },
    { id: "dms", name: "DMS", keys: ["DMS"] },
    { id: "acetatoEtilo", name: "Acetato de Etilo", keys: ["Acetato de etilo"] },
    { id: "acetatoIsoamilo", name: "Acetato de Isoamilo", keys: ["Acetato de isoamilo", "Acetato de isoamil"] },
    { id: "propanol", name: "Propanol", keys: ["Propanol"] },
    { id: "isobutanol", name: "Isobutanol", keys: ["Isobutaol", "Isobutanol"] },
    { id: "isoamilico", name: "Alcohol Isoamílico", keys: ["Isoamil alcohol", "Alcohol isoamilico"] },
  ]

  return catalogo_compuestos.map((compuesto_actual) => {
    const valores_comp = filas_filtradas.map((fila) => obtener_valor_numerico_fila(fila, compuesto_actual.keys)).filter((valor_medido) => valor_medido > 0)
    return {
      name: compuesto_actual.name,
      avg: valores_comp.length ? (valores_comp.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_comp.length).toFixed(2) : "0",
      min: valores_comp.length ? Math.min(...valores_comp).toFixed(2) : "0",
      max: valores_comp.length ? Math.max(...valores_comp).toFixed(2) : "0",
      last: valores_comp.length ? valores_comp[valores_comp.length - 1].toFixed(2) : "0",
    }
  })
}

/**
 * Construye la serie temporal de evolución cinética a través de los días de Fermentación (F) y Reposo (R).
 * @param filas_filtradas - Registros de cinética filtrados.
 * @returns Arreglo de puntos por paso de proceso con promedios de cada compuesto.
 */
export function construir_serie_evolucion_cinetica(filas_filtradas: any[]) {
  let max_ferm = 7
  let max_rep = 7
  filas_filtradas.forEach((fila) => {
    const etapa = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim().toUpperCase() || ""
    const num_dia = parseInt(obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim() || "", 10)
    if (!isNaN(num_dia) && num_dia >= 0 && num_dia <= 30) {
      if (etapa.includes("FERM") && num_dia > max_ferm) max_ferm = num_dia
      if (etapa.includes("REP") && num_dia > max_rep) max_rep = num_dia
    }
  })

  const pasos_proceso: string[] = []
  for (let dia_f = 0; dia_f <= max_ferm; dia_f++) pasos_proceso.push(`F${dia_f}`)
  for (let dia_r = 0; dia_r <= max_rep; dia_r++) pasos_proceso.push(`R${dia_r}`)

  return pasos_proceso.map((etiqueta_paso) => {
    const filas_del_paso = filas_filtradas.filter((fila) => {
      const etapa = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim().toUpperCase() || ""
      const dias = obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim() || ""
      if (!etapa || dias === "") return false
      const prefijo = etapa.includes("FERM") ? "F" : etapa.includes("REP") ? "R" : etapa.charAt(0)
      return `${prefijo}${dias}` === etiqueta_paso
    })

    const promediar = (claves: string[]) => {
      if (filas_del_paso.length === 0) return null
      const valores_paso = filas_del_paso.map((fila) => obtener_valor_numerico_fila(fila, claves)).filter((valor_medido) => valor_medido > 0 && !isNaN(valor_medido))
      return valores_paso.length ? parseFloat((valores_paso.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_paso.length).toFixed(2)) : null
    }

    return {
      paso: etiqueta_paso,
      acetaldehido: promediar(["Acetaldehido"]),
      diacetilo: promediar(["Diacetilo"]),
      esteres: promediar(["Esteres", "Ésteres"]),
      alcoholes: promediar(["Alcoholes Superiores"]),
      acetatoEtilo: promediar(["Acetato de etilo"]),
      acetatoIsoamilo: promediar(["Acetato de isoamilo", "Acetato de isoamil"]),
      isobutanol: promediar(["Isobutaol", "Isobutanol"]),
      propanol: promediar(["Propanol"]),
      isoamilico: promediar(["Isoamil alcohol", "Alcohol isoamilico"]),
    }
  })
}
