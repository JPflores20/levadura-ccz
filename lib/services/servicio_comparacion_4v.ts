/**
 * @fileoverview Servicio de dominio para la pestaña de Comparación Cinéticas (4V).
 * Agrupa los compuestos volátiles por marca, generación, vuelta, tanque, etapa y día.
 */

const CATALOGO_COMPUESTOS_4V = [
  "Acetaldehido", "Diacetilo", "Acetato de etilo", "Propanol",
  "Isobutaol", "Isobutanol", "Acetato de isoamilo", "Acetato de isoamil",
  "Isoamil alcohol", "Alcohol isoamilico", "Alcoholes Superiores", "Esteres", "Ésteres"
]

const LLAVES_GENERACION_4V = ["Generacion", "Generación", "Gen", "Gen.", "GeneracionLevadura"]
const LLAVES_VUELTA_4V = ["Vuelta", "Vueltas", "Vta", "Vta.", "Vuelta de la levadura"]

/**
 * Busca el valor de una llave en un registro de cinética priorizando coincidencia exacta y no vacía.
 * @param fila_registro - Objeto de fila de cinética.
 * @param llaves_objetivo - Nombres posibles para la columna.
 * @param palabras_excluidas - Subcadenas que invalidan una coincidencia parcial.
 * @returns Valor encontrado o undefined.
 */
function extraer_valor_celda_4v(fila_registro: Record<string, any>, llaves_objetivo: string[], palabras_excluidas?: string[]): any {
  const llaves_fila = Object.keys(fila_registro)
  const limpiar_texto = (texto: string) => texto.toLowerCase().replace(/[\s\.]/g, "")
  for (const llave_meta of llaves_objetivo) {
    const coincidencia_exacta = llaves_fila.find((llave) => limpiar_texto(llave) === limpiar_texto(llave_meta))
    if (coincidencia_exacta && fila_registro[coincidencia_exacta] !== "" && fila_registro[coincidencia_exacta] != null) return fila_registro[coincidencia_exacta]
  }
  for (const llave_meta of llaves_objetivo) {
    for (const llave_actual of llaves_fila) {
      const actual_limpia = limpiar_texto(llave_actual)
      const esta_excluida = palabras_excluidas?.some((excluida) => actual_limpia.includes(limpiar_texto(excluida)))
      if (!esta_excluida && actual_limpia.includes(limpiar_texto(llave_meta)) && fila_registro[llave_actual] !== "" && fila_registro[llave_actual] != null) return fila_registro[llave_actual]
    }
  }
  return undefined
}

/**
 * Agrupa los registros crudos de cinética por tanque, cepa, generación, vuelta, compuesto volátil y etapa.
 * @param registros_crudos - Arreglo de registros provenientes de /api/get-kinetics.
 * @returns Arreglo de series agrupadas por compuesto y tanque.
 */
export function agrupar_estadisticas_volatiles_4v(registros_crudos: Record<string, any>[]) {
  if (!registros_crudos.length) return []
  const mapa_agrupado: Record<string, any> = {}
  const mapa_meta_tanque: Record<string, { generacion?: string; vuelta?: string }> = {}

  registros_crudos.forEach((fila_actual) => {
    const cepa_fila = (extraer_valor_celda_4v(fila_actual, ["Marca", "cepa"]) || "N/A").toString().trim().toUpperCase()
    const tanque_fila = (extraer_valor_celda_4v(fila_actual, ["Tanque", "TCC", "Lote"]) || "N/A").toString().trim().toUpperCase()
    const clave_tanque = `${cepa_fila}_${tanque_fila}`
    if (!mapa_meta_tanque[clave_tanque]) mapa_meta_tanque[clave_tanque] = {}
    const gen_celda = extraer_valor_celda_4v(fila_actual, LLAVES_GENERACION_4V)?.toString().trim().toUpperCase()
    const vuelta_celda = extraer_valor_celda_4v(fila_actual, LLAVES_VUELTA_4V, ["viabilidad"])?.toString().trim()
    if (gen_celda && !mapa_meta_tanque[clave_tanque].generacion) mapa_meta_tanque[clave_tanque].generacion = gen_celda
    if (vuelta_celda && !mapa_meta_tanque[clave_tanque].vuelta) mapa_meta_tanque[clave_tanque].vuelta = vuelta_celda
  })

  registros_crudos.forEach((fila_actual) => {
    const fecha_fila = extraer_valor_celda_4v(fila_actual, ["Fecha"]) || "N/A"
    const cepa_fila = (extraer_valor_celda_4v(fila_actual, ["Marca", "cepa"]) || "N/A").toString().trim().toUpperCase()
    const etapa_fila = (extraer_valor_celda_4v(fila_actual, ["Etapa"]) || "FERMENTACION").toString().trim().toUpperCase()
    const dia_proceso = fila_actual["Dias"] ?? fila_actual["Días"] ?? fila_actual["Día"]
    const tanque_fila = (extraer_valor_celda_4v(fila_actual, ["Tanque", "TCC", "Lote"]) || "N/A").toString().trim().toUpperCase()
    if (dia_proceso === undefined || dia_proceso === null || dia_proceso === "") return

    const clave_tanque = `${cepa_fila}_${tanque_fila}`
    const generacion_fila = (extraer_valor_celda_4v(fila_actual, LLAVES_GENERACION_4V)?.toString().trim().toUpperCase()) || mapa_meta_tanque[clave_tanque]?.generacion || "N/A"
    const vuelta_fila = (extraer_valor_celda_4v(fila_actual, LLAVES_VUELTA_4V, ["viabilidad"])?.toString().trim()) || mapa_meta_tanque[clave_tanque]?.vuelta || "N/A"

    CATALOGO_COMPUESTOS_4V.forEach((nombre_volatil) => {
      const celda_valor = extraer_valor_celda_4v(fila_actual, [nombre_volatil])
      if (celda_valor === undefined || celda_valor === null || celda_valor === "") return
      const valor_numerico = parseFloat(String(celda_valor).replace(",", "."))

      if (!isNaN(valor_numerico) && valor_numerico > 0) {
        let volatil_estandar = nombre_volatil.toUpperCase().includes("DIACETILO") ? "DIACETILO" : nombre_volatil.toUpperCase()
        if (volatil_estandar.includes("ISOBUTA")) volatil_estandar = "ISOBUTANOL"
        else if (volatil_estandar.includes("ACETATO") && volatil_estandar.includes("ISOAMIL")) volatil_estandar = "ISOAMILO"
        else if (volatil_estandar.includes("ISOAMIL")) volatil_estandar = "ISOAMILICO"
        else if (volatil_estandar.includes("ESTERES") || volatil_estandar.includes("ÉSTERES")) volatil_estandar = "ESTERES"
        else if (volatil_estandar === "ACETATO DE ETILO" || volatil_estandar === "ETILO") volatil_estandar = "ETILO"
        else if (volatil_estandar.includes("ALCOHOLES SUPERIORES")) volatil_estandar = "ALCOHOLES"

        const clave_grupo = `${fecha_fila}_${generacion_fila}_${vuelta_fila}_${cepa_fila}_${tanque_fila}_${volatil_estandar}_${etapa_fila}`
        if (!mapa_agrupado[clave_grupo]) {
          mapa_agrupado[clave_grupo] = {
            fecha: fecha_fila, propagacion: "N/A", cepa: cepa_fila,
            generacion: generacion_fila, vuelta: vuelta_fila,
            tanque: tanque_fila, volatil: volatil_estandar, etapa: etapa_fila, vueltas: {}
          }
        }
        mapa_agrupado[clave_grupo].vueltas[dia_proceso.toString().trim()] = valor_numerico
      }
    })
  })

  return Object.values(mapa_agrupado)
}

/**
 * Extrae las opciones únicas de Generación y Vuelta disponibles en los registros de cinética.
 * @param registros_crudos - Filas crudas de cinética.
 * @param estadisticas_agrupadas - Series agrupadas 4V.
 * @returns Listas ordenadas de generaciones y vueltas únicas.
 */
export function extraer_opciones_gen_vuelta_4v(registros_crudos: Record<string, any>[], estadisticas_agrupadas: any[]) {
  const conjunto_gen = new Set<string>(), conjunto_vuelta = new Set<string>()
  estadisticas_agrupadas.forEach((serie) => {
    if (serie.generacion && serie.generacion !== "N/A") conjunto_gen.add(String(serie.generacion))
    if (serie.vuelta && serie.vuelta !== "N/A") conjunto_vuelta.add(String(serie.vuelta))
  })
  registros_crudos.forEach((fila) => {
    const gen_cruda = extraer_valor_celda_4v(fila, LLAVES_GENERACION_4V)?.toString().trim().toUpperCase()
    const vuelta_cruda = extraer_valor_celda_4v(fila, LLAVES_VUELTA_4V, ["viabilidad"])?.toString().trim()
    if (gen_cruda && gen_cruda !== "N/A") conjunto_gen.add(gen_cruda)
    if (vuelta_cruda && vuelta_cruda !== "N/A") conjunto_vuelta.add(vuelta_cruda)
  })
  const ordenar = (lista: string[]) => lista.sort((texto_a, texto_b) => texto_a.localeCompare(texto_b, undefined, { numeric: true }))
  return { generaciones: ordenar([...conjunto_gen]), vueltas: ordenar([...conjunto_vuelta]) }
}

/**
 * Ordena los tanques de una marca priorizando aquellos con mayor cantidad de compuestos registrados.
 * @param datos_agrupados - Arreglo de series agrupadas 4V.
 * @param marca_seleccionada - Marca de cerveza activa.
 * @param lista_tanques - Lista de códigos de tanque disponibles.
 * @returns Arreglo de tanques ordenados por completitud de datos.
 */
export function ordenar_tanques_por_completitud(datos_agrupados: any[], marca_seleccionada: string, lista_tanques: string[]): string[] {
  if (lista_tanques.length === 0) return []
  return [...lista_tanques]
    .map((codigo_tanque) => {
      const filas = datos_agrupados.filter((serie) => serie.tanque === codigo_tanque && (!marca_seleccionada || serie.cepa === marca_seleccionada))
      return { codigo_tanque, total: new Set(filas.map((fila) => fila.volatil)).size }
    })
    .sort((item_a, item_b) => item_b.total - item_a.total)
    .map((elemento_ordenado) => elemento_ordenado.codigo_tanque)
}

/**
 * Prepara la serie comparativa entre Tanque A y Tanques B asegurando eje y proyección hasta R12.
 * @param nombre_volatil - Clave del compuesto volátil ("DIACETILO", "ISOAMILO", etc.).
 * @param datos_tanque_a - Series correspondientes al Tanque A.
 * @param mapa_datos_tanques_b - Arreglo de objetos con las series de cada Tanque B seleccionado.
 * @returns Serie lista para graficar en Recharts siempre hasta R12.
 */
export function preparar_serie_comparativa_volatil(nombre_volatil: string, datos_tanque_a: any[], mapa_datos_tanques_b: Array<{ name: string; data: any[] }>) {
  const volatil_norm = nombre_volatil.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  const norm_vol = (serie: any) => (serie.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  let max_ferm = 6, cero_ferm = false, cero_rep = false
  const max_rep = 12

  ;[...datos_tanque_a, ...mapa_datos_tanques_b.flatMap((info_b) => info_b.data)].forEach((item_serie) => {
    const etapa = (item_serie.etapa || "").toString().toUpperCase()
    Object.keys(item_serie.vueltas || {}).forEach((clave_dia) => {
      const num_dia = parseInt(clave_dia, 10)
      if (!isNaN(num_dia)) {
        if (etapa.includes("FERM")) { if (num_dia > max_ferm) max_ferm = num_dia; if (num_dia === 0) cero_ferm = true }
        if (etapa.includes("REP") && num_dia === 0) cero_rep = true
      }
    })
  })

  const puntos_eje: Array<{ label: string; day: number; isFerm: boolean }> = []
  for (let dia_f = cero_ferm ? 0 : 1; dia_f <= max_ferm; dia_f++) puntos_eje.push({ label: `F${dia_f}`, day: dia_f, isFerm: true })
  for (let dia_r = cero_rep ? 0 : 1; dia_r <= max_rep; dia_r++) puntos_eje.push({ label: `R${dia_r}`, day: dia_r, isFerm: false })

  const evaluar_serie = (arreglo_series: any[]) => {
    let ultimo_valor: number | null = null, max_dia_rep = -1
    arreglo_series.forEach((serie) => {
      if (norm_vol(serie).includes(volatil_norm) && String(serie.etapa || "").toUpperCase().includes("REP")) {
        Object.keys(serie.vueltas || {}).forEach((dia_str) => { if (Number(dia_str) > max_dia_rep) max_dia_rep = Number(dia_str) })
      }
    })
    return puntos_eje.map((punto_eje) => {
      const filas = arreglo_series.filter((serie) => {
        const etapa_ok = punto_eje.isFerm ? String(serie.etapa || "").toUpperCase().includes("FERM") : String(serie.etapa || "").toUpperCase().includes("REP")
        return norm_vol(serie).includes(volatil_norm) && etapa_ok && serie.vueltas?.[punto_eje.day] != null
      })
      if (filas.length > 0) {
        ultimo_valor = filas.reduce((acum: number, serie: any) => acum + Number(serie.vueltas[punto_eje.day]), 0) / filas.length
        return ultimo_valor
      }
      return !punto_eje.isFerm && punto_eje.day > max_dia_rep && ultimo_valor !== null ? ultimo_valor : null
    })
  }

  const valores_a = evaluar_serie(datos_tanque_a), matriz_valores_b = mapa_datos_tanques_b.map((info_b) => evaluar_serie(info_b.data))
  return puntos_eje.map((punto_eje, indice_punto) => {
    const registro_punto: any = { vuelta: punto_eje.label, valorA: valores_a[indice_punto] }
    matriz_valores_b.forEach((valores_b, indice_b) => { registro_punto[`valorB_${indice_b}`] = valores_b[indice_punto] })
    return registro_punto
  })
}
