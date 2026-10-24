/**
 * @fileoverview Servicio de dominio para normalizar y agrupar las series temporales de Cinéticas
 * y Compuestos Volátiles (4V) al sincronizar desde Excel hacia Firebase.
 */

/**
 * Busca el valor de una columna en un registro de Excel priorizando coincidencia exacta y no vacía.
 * @param registro_fila - Objeto que representa una fila del Excel de cinéticas.
 * @param nombres_posibles - Lista de posibles encabezados para el campo buscado.
 * @returns El valor encontrado en la fila o cadena vacía si no existe.
 */
export function extraer_valor_columna_cinetica(
  registro_fila: Record<string, any>,
  nombres_posibles: string[]
): unknown {
  const llaves_registro = Object.keys(registro_fila)

  for (const nombre_candidato of nombres_posibles) {
    const llave_exacta = llaves_registro.find(
      (llave_actual) => llave_actual.trim().toLowerCase() === nombre_candidato.toLowerCase()
    )
    if (
      llave_exacta &&
      registro_fila[llave_exacta] !== "" &&
      registro_fila[llave_exacta] !== null &&
      registro_fila[llave_exacta] !== undefined
    ) {
      return registro_fila[llave_exacta]
    }
  }

  for (const nombre_candidato of nombres_posibles) {
    const llave_parcial = llaves_registro.find((llave_actual) =>
      llave_actual.toLowerCase().includes(nombre_candidato.toLowerCase())
    )
    if (
      llave_parcial &&
      registro_fila[llave_parcial] !== "" &&
      registro_fila[llave_parcial] !== null &&
      registro_fila[llave_parcial] !== undefined
    ) {
      return registro_fila[llave_parcial]
    }
  }

  return ""
}

/**
 * Clasifica y normaliza el nombre de un compuesto volátil evitando colisiones entre
 * Acetato de Isoamilo ("ISOAMILO") y Alcohol Isoamílico ("ISOAMILICO").
 * @param texto_volatil_crudo - Nombre original del compuesto volátil.
 * @returns Clave interna estandarizada del compuesto.
 */
export function normalizar_nombre_compuesto_volatil(texto_volatil_crudo: string): string {
  const volatil_mayusculas = texto_volatil_crudo.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

  if (volatil_mayusculas.includes("ACETATO") && volatil_mayusculas.includes("ISOAMIL")) {
    return "ISOAMILO"
  }
  if (volatil_mayusculas.includes("ACETATO")) return "ACETATO"
  if (volatil_mayusculas.includes("ACETALDEH")) return "ACETALDEHIDO"
  if (volatil_mayusculas.includes("PROPANOL")) return "PROPANOL"
  if (volatil_mayusculas.includes("ISOBUTA")) return "ISOBUTANOL"
  if (volatil_mayusculas.includes("ISOAMIL")) return "ISOAMILICO"
  if (volatil_mayusculas.includes("SUPERIORES") || volatil_mayusculas.includes("ALCOHOLES")) {
    return "SUPERIORES"
  }
  if (
    volatil_mayusculas.includes("VDK") ||
    volatil_mayusculas.includes("DIACETIL") ||
    volatil_mayusculas.includes("PENTANODIONA")
  ) {
    return "VDK"
  }
  if (volatil_mayusculas.includes("DMS") || volatil_mayusculas.includes("DIMETIL")) {
    return "DMS"
  }

  return volatil_mayusculas
}

/**
 * Procesa el lote crudo de cinéticas de fermentación generando la estructura jerárquica
 * Marca -> Tanque -> Compuesto -> Serie de días lista para guardar en Firebase.
 * @param registros_crudos_cinetica - Filas crudas enviadas desde Excel.
 * @returns Paquete de datos con estadísticas 4V, marcas detectadas y registros crudos.
 */
export function procesar_lote_cinetica(registros_crudos_cinetica: Record<string, any>[]) {
  const registros_limpios = registros_crudos_cinetica.map((fila_actual) => {
    const marca_cerveza = String(
      extraer_valor_columna_cinetica(fila_actual, ["Marca", "Brand", "Cerveza"])
    ).trim().toUpperCase()
    const codigo_tanque = String(
      extraer_valor_columna_cinetica(fila_actual, ["Tanque", "FV", "Fermentador", "Tqe", "Unitank"])
    ).trim().toUpperCase()
    const numero_dia =
      Number(
        extraer_valor_columna_cinetica(fila_actual, [
          "Dia fermentación",
          "Dia fermentacion",
          "Día",
          "Dia",
          "Day",
          "Tiempo",
          "Dias",
        ])
      ) || 0
    const valor_medicion =
      Number(
        extraer_valor_columna_cinetica(fila_actual, [
          "Valor",
          "Resultado",
          "Value",
          "Medicion",
          "Concentracion",
          "ppm",
          "ppb",
        ])
      ) || 0
    const volatil_crudo = String(
      extraer_valor_columna_cinetica(fila_actual, [
        "Volatil",
        "Volátil",
        "Compuesto",
        "Parametro",
        "Análisis",
        "Analisis",
      ])
    )

    return {
      marca: marca_cerveza,
      tanque: codigo_tanque,
      volatil: normalizar_nombre_compuesto_volatil(volatil_crudo),
      dia: numero_dia,
      valor: valor_medicion,
    }
  })

  const lista_compuestos = [
    "ACETATO", "ACETALDEHIDO", "PROPANOL", "ISOBUTANOL",
    "ISOAMILO", "ISOAMILICO", "SUPERIORES", "VDK", "DMS",
  ]
  const marcas_unicas = [...new Set(registros_limpios.map((item_limpio) => item_limpio.marca))].filter(Boolean)
  const estadisticas_4v: Record<string, any> = {}

  marcas_unicas.forEach((nombre_marca) => {
    estadisticas_4v[nombre_marca] = {}
    const registros_de_marca = registros_limpios.filter((item_limpio) => item_limpio.marca === nombre_marca)
    const tanques_unicos = [...new Set(registros_de_marca.map((item_limpio) => item_limpio.tanque))].filter(Boolean)

    tanques_unicos.forEach((nombre_tanque) => {
      estadisticas_4v[nombre_marca][nombre_tanque] = {}
      const registros_de_tanque = registros_de_marca.filter((item_limpio) => item_limpio.tanque === nombre_tanque)

      lista_compuestos.forEach((clave_compuesto) => {
        const registros_compuesto = registros_de_tanque.filter(
          (item_limpio) => item_limpio.volatil === clave_compuesto
        )
        const valores_por_dia: Record<number, number> = {}
        registros_compuesto.forEach((item_compuesto) => {
          if (item_compuesto.valor > 0) valores_por_dia[item_compuesto.dia] = item_compuesto.valor
        })

        const serie_temporal = Object.keys(valores_por_dia)
          .map(Number)
          .sort((dia_a, dia_b) => dia_a - dia_b)
          .map((numero_dia) => ({
            dia: `D${numero_dia}`,
            diaNum: numero_dia,
            valor: valores_por_dia[numero_dia],
          }))

        if (serie_temporal.length > 0) {
          estadisticas_4v[nombre_marca][nombre_tanque][clave_compuesto] = serie_temporal
        }
      })
    })
  })

  return {
    payload: {
      lastUpdated: new Date().toISOString(),
      totalRecords: registros_crudos_cinetica.length,
      stats4V: estadisticas_4v,
      rawData: registros_crudos_cinetica,
    },
    marcas_detectadas: marcas_unicas,
  }
}
