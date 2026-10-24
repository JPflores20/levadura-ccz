/**
 * @fileoverview Servicio de dominio para la pestaña de Comparación Cinéticas (4V).
 * Agrupa los compuestos volátiles por marca, tanque, etapa y día, evitando colisiones de nombres.
 */

const CATALOGO_COMPUESTOS_4V = [
  "Acetaldehido",
  "Diacetilo",
  "Acetato de etilo",
  "Propanol",
  "Isobutaol",
  "Isobutanol",
  "Acetato de isoamilo",
  "Acetato de isoamil",
  "Isoamil alcohol",
  "Alcohol isoamilico",
  "Alcoholes Superiores",
  "Esteres",
  "Ésteres",
]

/**
 * Busca el valor de una llave en un registro de cinética priorizando coincidencia exacta y no vacía.
 * @param fila_registro - Objeto de fila de cinética.
 * @param llaves_objetivo - Nombres posibles para la columna.
 * @returns Valor encontrado o undefined.
 */
function extraer_valor_celda_4v(fila_registro: Record<string, any>, llaves_objetivo: string[]): any {
  const llaves_fila = Object.keys(fila_registro)
  for (const llave_meta of llaves_objetivo) {
    const meta_limpia = llave_meta.toLowerCase().replace(/[\s\.]/g, "")
    const coincidencia_exacta = llaves_fila.find((llave) => llave.toLowerCase().replace(/[\s\.]/g, "") === meta_limpia)
    if (coincidencia_exacta && fila_registro[coincidencia_exacta] !== "" && fila_registro[coincidencia_exacta] != null) {
      return fila_registro[coincidencia_exacta]
    }
  }
  for (const llave_meta of llaves_objetivo) {
    const meta_limpia = llave_meta.toLowerCase().replace(/[\s\.]/g, "")
    for (const llave_actual of llaves_fila) {
      if (
        llave_actual.toLowerCase().replace(/[\s\.]/g, "").includes(meta_limpia) &&
        fila_registro[llave_actual] !== "" &&
        fila_registro[llave_actual] != null
      ) {
        return fila_registro[llave_actual]
      }
    }
  }
  return undefined
}

/**
 * Agrupa los registros crudos de cinética por tanque, cepa, compuesto volátil y etapa.
 * @param registros_crudos - Arreglo de registros provenientes de /api/get-kinetics.
 * @returns Arreglo de series agrupadas por compuesto y tanque.
 */
export function agrupar_estadisticas_volatiles_4v(registros_crudos: Record<string, any>[]) {
  if (!registros_crudos.length) return []
  const mapa_agrupado: Record<string, any> = {}

  registros_crudos.forEach((fila_actual) => {
    const fecha_fila = extraer_valor_celda_4v(fila_actual, ["Fecha"]) || "N/A"
    const cepa_fila = (extraer_valor_celda_4v(fila_actual, ["Marca", "cepa"]) || "N/A").toString().trim().toUpperCase()
    const etapa_fila = (extraer_valor_celda_4v(fila_actual, ["Etapa"]) || "FERMENTACION").toString().trim().toUpperCase()
    const dia_proceso = fila_actual["Dias"] ?? fila_actual["Días"] ?? fila_actual["Día"]
    const tanque_fila = (extraer_valor_celda_4v(fila_actual, ["Tanque", "TCC", "Lote"]) || "N/A").toString().trim().toUpperCase()

    if (dia_proceso === undefined || dia_proceso === null || dia_proceso === "") return

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

        const clave_grupo = `${fecha_fila}_NA_${cepa_fila}_${tanque_fila}_${volatil_estandar}_${etapa_fila}`
        if (!mapa_agrupado[clave_grupo]) {
          mapa_agrupado[clave_grupo] = {
            fecha: fecha_fila,
            propagacion: "N/A",
            cepa: cepa_fila,
            tanque: tanque_fila,
            volatil: volatil_estandar,
            etapa: etapa_fila,
            vueltas: {},
          }
        }
        mapa_agrupado[clave_grupo].vueltas[dia_proceso.toString().trim()] = valor_numerico
      }
    })
  })

  return Object.values(mapa_agrupado)
}

/**
 * Ordena los tanques de una marca priorizando aquellos con mayor cantidad de compuestos registrados.
 * @param datos_agrupados - Arreglo de series agrupadas 4V.
 * @param marca_seleccionada - Marca de cerveza activa.
 * @param lista_tanques - Lista de códigos de tanque disponibles.
 * @returns Arreglo de tanques ordenados por completitud de datos.
 */
export function ordenar_tanques_por_completitud(
  datos_agrupados: any[],
  marca_seleccionada: string,
  lista_tanques: string[]
): string[] {
  if (lista_tanques.length === 0) return []
  return [...lista_tanques]
    .map((codigo_tanque) => {
      const filas = datos_agrupados.filter(
        (registro_serie) => registro_serie.tanque === codigo_tanque && (!marca_seleccionada || registro_serie.cepa === marca_seleccionada)
      )
      return { codigo_tanque, total: new Set(filas.map((fila) => fila.volatil)).size }
    })
    .sort((item_a, item_b) => item_b.total - item_a.total)
    .map((elemento_ordenado) => elemento_ordenado.codigo_tanque)
}

/**
 * Prepara la serie comparativa entre Tanque A y Tanques B para un compuesto volátil específico.
 * @param nombre_volatil - Clave del compuesto volátil ("DIACETILO", "ISOAMILO", etc.).
 * @param datos_tanque_a - Series correspondientes al Tanque A.
 * @param mapa_datos_tanques_b - Arreglo de objetos con las series de cada Tanque B seleccionado.
 * @returns Serie lista para graficar en Recharts.
 */
export function preparar_serie_comparativa_volatil(
  nombre_volatil: string,
  datos_tanque_a: any[],
  mapa_datos_tanques_b: Array<{ name: string; data: any[] }>
) {
  const volatil_norm = nombre_volatil.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  let max_ferm = 0
  let max_rep = 0
  let cero_ferm = false
  let cero_rep = false

  const seleccionados = [...datos_tanque_a, ...mapa_datos_tanques_b.flatMap((info_b) => info_b.data)]
  seleccionados.forEach((item_serie) => {
    const etapa = (item_serie.etapa || "").toString().toUpperCase()
    Object.keys(item_serie.vueltas || {}).forEach((clave_dia) => {
      const num_dia = parseInt(clave_dia, 10)
      if (!isNaN(num_dia)) {
        if (etapa.includes("FERM")) {
          if (num_dia > max_ferm) max_ferm = num_dia
          if (num_dia === 0) cero_ferm = true
        }
        if (etapa.includes("REP")) {
          if (num_dia > max_rep) max_rep = num_dia
          if (num_dia === 0) cero_rep = true
        }
      }
    })
  })

  const puntos_eje: Array<{ label: string; day: number; isFerm: boolean }> = []
  for (let dia_f = cero_ferm ? 0 : 1; dia_f <= max_ferm; dia_f++) puntos_eje.push({ label: `F${dia_f}`, day: dia_f, isFerm: true })
  for (let dia_r = cero_rep ? 0 : 1; dia_r <= max_rep; dia_r++) puntos_eje.push({ label: `R${dia_r}`, day: dia_r, isFerm: false })

  return puntos_eje.map((punto_eje) => {
    const registro_punto: any = { vuelta: punto_eje.label }
    const filtrar = (arreglo_series: any[]) =>
      arreglo_series.filter((registro_serie) => {
        const vol_item = (registro_serie.volatil || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
        const etapa_item = (registro_serie.etapa || "").toString().toUpperCase()
        const coincide_etapa = punto_eje.isFerm ? etapa_item.includes("FERM") : etapa_item.includes("REP")
        return vol_item.includes(volatil_norm) && coincide_etapa && registro_serie.vueltas?.[punto_eje.day] != null
      })

    const filas_a = filtrar(datos_tanque_a)
    registro_punto.valorA = filas_a.length
      ? filas_a.reduce((acum: number, registro_serie: any) => acum + Number(registro_serie.vueltas[punto_eje.day]), 0) / filas_a.length
      : null

    mapa_datos_tanques_b.forEach((info_b, indice_b) => {
      const filas_b = filtrar(info_b.data)
      registro_punto[`valorB_${indice_b}`] = filas_b.length
        ? filas_b.reduce((acum: number, registro_serie: any) => acum + Number(registro_serie.vueltas[punto_eje.day]), 0) / filas_b.length
        : null
    })
    return registro_punto
  })
}
