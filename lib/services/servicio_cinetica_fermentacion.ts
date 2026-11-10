/**
 * @fileoverview Servicio de dominio para extracción de propiedades, cálculo de KPIs de arranque
 * de fermentación, tabla resumen de cinética (F1, F3, F6, R6/R8, Valor Final) y evolución (F0..F6 y R1..R12).
 */

/**
 * Busca el valor de una propiedad en un objeto priorizando coincidencia exacta y descartando vacíos.
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
      (llave) => llave.toLowerCase().replace(/[\s\.]/g, "").includes(clave_limpia) && objeto_registro[llave] !== "" && objeto_registro[llave] != null
    )
    if (llave_parcial) return objeto_registro[llave_parcial]
  }
  return null
}

/**
 * Extrae un valor numérico desde una fila de cinética buscando palabras clave y aplicando exclusiones.
 */
export function obtener_valor_numerico_fila(fila_registro: any, palabras_clave: string[], palabras_excluidas?: string[]): number {
  if (!fila_registro) return 0
  for (const palabra_clave of palabras_clave) {
    const clave_limpia = palabra_clave.toLowerCase().replace(/\s+/g, "")
    const llave_encontrada = Object.keys(fila_registro).find((llave_actual) => {
      const llave_normalizada = llave_actual.toLowerCase().replace(/\s+/g, "")
      if (!llave_normalizada.includes(clave_limpia)) return false
      if (palabras_excluidas?.some((excl) => llave_normalizada.includes(excl.toLowerCase().replace(/\s+/g, "")))) return false
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
 */
export function calcular_promedio_columna_cinetica(filas_filtradas: any[], palabras_clave: string[], palabras_excluidas?: string[]): number {
  const valores_positivos = filas_filtradas
    .map((fila_actual) => obtener_valor_numerico_fila(fila_actual, palabras_clave, palabras_excluidas))
    .filter((valor_num) => valor_num > 0)
  if (valores_positivos.length === 0) return 0
  return Number((valores_positivos.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_positivos.length).toFixed(2))
}

/**
 * Construye las 12 tarjetas KPI de Arranque de Fermentación (incluyendo Atemperación en horas).
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
    { id: "atemperacion", label: "Atemperación", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Attemperacion", "Atemperacion", "Atemperación", "Tiempo de Atemperacion", "Tiempo de Atemperación", "Atemperado", "Tiempo de Almacenamiento", "Tiempo Almacenaje"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "aireacion", label: "Aireación", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Aireacion", "Aireación"])), unit: "kg/hl", icon: "Wind", status: "ok" },
    { id: "tempAlm", label: "Temp Almacenaje", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Temperatura de Almacenamiento", "Almacenamiento"])), unit: "°C", icon: "Thermometer", status: "ok" },
    { id: "tiempoAlm", label: "Tiempo Almacenaje", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Tiempo de Almacenamiento"])), unit: "h", icon: "Clock", status: "ok" },
    { id: "viab", label: "Viabilidad", value: fmt(calcular_promedio_columna_cinetica(filas_filtradas, ["Viabilidad Primera", "Viabilidad Primer", "Viabilidad"])), unit: "%", icon: "Activity", status: "ok" },
    { id: "vitalidad", label: "Vitalidad", value: fmt(vitalidad_total), unit: "%", icon: "Activity", status: "ok" },
  ]
}

/**
 * Construye las filas de la tabla Resumen de Cinética con F1 (24h), F3 (72h), F6 (Término), R6/R8 y Valor Final.
 */
export function construir_tabla_compuestos_cinetica(filas_filtradas: any[]) {
  const catalogo_compuestos = [
    { id: "esteres", name: "Ésteres", keys: ["Esteres", "Ésteres"] },
    { id: "alcoholes", name: "Alcoholes Superiores", keys: ["Alcoholes Superiores", "Alcoholes"] },
    { id: "diacetilo", name: "Diacetilo", keys: ["Diacetilo", "Diacetilo total"] },
    { id: "acetaldehido", name: "Acetaldehído", keys: ["Acetaldehido"] },
    { id: "dms", name: "DMS", keys: ["DMS"] },
    { id: "acetatoEtilo", name: "Acetato de Etilo", keys: ["Acetato de etilo"] },
    { id: "acetatoIsoamilo", name: "Acetato de Isoamilo", keys: ["Acetato de isoamilo", "Acetato de isoamil"] },
    { id: "propanol", name: "Propanol", keys: ["Propanol"] },
    { id: "isobutanol", name: "Isobutanol", keys: ["Isobutaol", "Isobutanol"] },
    { id: "isoamilico", name: "Alcohol Isoamílico", keys: ["Isoamil alcohol", "Alcohol isoamilico"] },
  ]

  const obtener_valor_paso = (claves: string[], etapa_sub: string, dia_meta: number): string => {
    const valores_paso = filas_filtradas
      .filter((fila) => {
        const etapa = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim().toUpperCase() || ""
        const dias = parseInt(obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim() || "", 10)
        return etapa.includes(etapa_sub) && dias === dia_meta
      })
      .map((fila) => obtener_valor_numerico_fila(fila, claves))
      .filter((medicion) => medicion > 0 && !isNaN(medicion))
    return valores_paso.length === 0 ? "-" : (valores_paso.reduce((acum, act) => acum + act, 0) / valores_paso.length).toFixed(2)
  }

  return catalogo_compuestos.map((compuesto_actual) => {
    const f1 = obtener_valor_paso(compuesto_actual.keys, "FERM", 1)
    const f3 = obtener_valor_paso(compuesto_actual.keys, "FERM", 3)
    const f6 = obtener_valor_paso(compuesto_actual.keys, "FERM", 6)
    const r6 = obtener_valor_paso(compuesto_actual.keys, "REP", 6)
    const r8 = obtener_valor_paso(compuesto_actual.keys, "REP", 8)
    const r6_r8 = r6 !== "-" && r8 !== "-" ? (r6 === r8 ? r6 : `${r6} / ${r8}`) : (r8 !== "-" ? r8 : r6)
    const valores_comp = filas_filtradas.map((fila) => obtener_valor_numerico_fila(fila, compuesto_actual.keys)).filter((med) => med > 0 && !isNaN(med))
    return {
      name: compuesto_actual.name,
      f1, f3, f6, r6_r8,
      last: valores_comp.length > 0 ? valores_comp[valores_comp.length - 1].toFixed(2) : "-",
    }
  })
}

/**
 * Construye la serie de evolución cinética limitada hasta F6 en fermentación y desde R1 en reposo (sin F7+ ni R0).
 */
export function construir_serie_evolucion_cinetica(filas_filtradas: any[]) {
  const max_ferm = 6, max_rep = 12
  let max_dia_rep_datos = -1
  filas_filtradas.forEach((fila) => {
    const etapa = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim().toUpperCase() || ""
    const num_dia = parseInt(obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim() || "", 10)
    if (!isNaN(num_dia) && num_dia >= 1 && num_dia <= 30 && etapa.includes("REP") && num_dia > max_dia_rep_datos) max_dia_rep_datos = num_dia
  })

  const pasos_proceso: string[] = []
  for (let dia_f = 0; dia_f <= max_ferm; dia_f++) pasos_proceso.push(`F${dia_f}`)
  for (let dia_r = 1; dia_r <= max_rep; dia_r++) pasos_proceso.push(`R${dia_r}`)
  const ultimos_valores: Record<string, number | null> = {}

  return pasos_proceso.map((etiqueta_paso) => {
    const filas_del_paso = filas_filtradas.filter((fila) => {
      const etapa = obtener_propiedad_cinetica(fila, ["Etapa"])?.toString().trim().toUpperCase() || ""
      const dias = obtener_propiedad_cinetica(fila, ["Dias", "Días"])?.toString().trim() || ""
      if (!etapa || dias === "") return false
      const prefijo = etapa.includes("FERM") ? "F" : etapa.includes("REP") ? "R" : etapa.charAt(0)
      return `${prefijo}${dias}` === etiqueta_paso
    })

    const promediar = (claves: string[]) => {
      const clave_id = claves[0]
      const valores_paso = filas_del_paso.map((fila) => obtener_valor_numerico_fila(fila, claves)).filter((med) => med > 0 && !isNaN(med))
      if (valores_paso.length > 0) {
        ultimos_valores[clave_id] = parseFloat((valores_paso.reduce((acum, act) => acum + act, 0) / valores_paso.length).toFixed(2))
        return ultimos_valores[clave_id]
      }
      const es_post_rep = etiqueta_paso.startsWith("R") && Number(etiqueta_paso.slice(1)) > max_dia_rep_datos
      return es_post_rep && ultimos_valores[clave_id] != null ? ultimos_valores[clave_id] : null
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
