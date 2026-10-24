/**
 * @fileoverview Funciones de soporte estadístico para histogramas, escalado de ejes y regresión lineal.
 */

import { calcular_media, calcular_desviacion_estandar } from "@/lib/statistics/estadisticas_descriptivas"

/**
 * Genera los intervalos (bins), frecuencias y curva de densidad normal para un histograma.
 * @param valores_muestra - Arreglo de números de entrada.
 * @param valor_minimo - Límite mínimo del rango del histograma.
 * @param valor_maximo - Límite máximo del rango del histograma.
 * @param cantidad_intervalos - Número de barras o intervalos (por defecto 10).
 * @returns Objeto con las etiquetas de intervalos, frecuencias absolutas y curva normal ajustada.
 */
export function generar_histograma(
  valores_muestra: number[],
  valor_minimo: number,
  valor_maximo: number,
  cantidad_intervalos = 10
) {
  if (valores_muestra.length === 0) return { bins: [], frequencies: [], curve: [] }

  const ancho_intervalo = (valor_maximo - valor_minimo) / cantidad_intervalos || 1
  const etiquetas_intervalos: string[] = []
  const frecuencias_intervalos: number[] = new Array(cantidad_intervalos).fill(0)

  for (let indice_intervalo = 0; indice_intervalo < cantidad_intervalos; indice_intervalo++) {
    etiquetas_intervalos.push((valor_minimo + indice_intervalo * ancho_intervalo).toFixed(2))
  }

  valores_muestra.forEach((valor_actual) => {
    let indice_ubicacion = Math.floor((valor_actual - valor_minimo) / ancho_intervalo)
    if (indice_ubicacion >= cantidad_intervalos) indice_ubicacion = cantidad_intervalos - 1
    if (indice_ubicacion < 0) indice_ubicacion = 0
    frecuencias_intervalos[indice_ubicacion]++
  })

  const valor_media = calcular_media(valores_muestra)
  const desviacion_estandar = calcular_desviacion_estandar(valores_muestra, valor_media)

  const curva_normal = etiquetas_intervalos.map((texto_intervalo) => {
    const centro_intervalo = parseFloat(texto_intervalo)
    if (desviacion_estandar === 0) return 0
    const puntaje_z = (centro_intervalo - valor_media) / desviacion_estandar
    const densidad_probabilidad =
      Math.exp(-0.5 * puntaje_z * puntaje_z) / (desviacion_estandar * Math.sqrt(2 * Math.PI))
    return densidad_probabilidad * valores_muestra.length * ancho_intervalo
  })

  return { bins: etiquetas_intervalos, frequencies: frecuencias_intervalos, curve: curva_normal }
}

/**
 * Filtra y convierte una lista de argumentos arbitrarios conservando únicamente números válidos.
 * @param lista_argumentos - Valores mixtos a depurar.
 * @returns Arreglo de números finitos válidos.
 */
export function filtrar_valores_numericos(...lista_argumentos: unknown[]): number[] {
  return lista_argumentos
    .map((valor_entrada) =>
      valor_entrada !== undefined && valor_entrada !== null && valor_entrada !== ""
        ? Number(valor_entrada)
        : NaN
    )
    .filter((numero_evaluado) => !isNaN(numero_evaluado))
}

/**
 * Calcula el rango óptimo para un eje gráfico añadiendo un margen proporcional de holgura.
 * @param rango_valores - Objeto con el mínimo y máximo observados.
 * @param limites_referencia - Límites de control o especificación adicionales a incluir.
 * @param proporcion_holgura - Porcentaje de margen adicional (por defecto 0.2).
 * @returns Objeto con el mínimo y máximo expandidos para el eje.
 */
export function calcular_rango_ejes(
  rango_valores: { min: number; max: number },
  limites_referencia: unknown[],
  proporcion_holgura = 0.2
) {
  const todos_los_limites = filtrar_valores_numericos(
    rango_valores.min,
    rango_valores.max,
    ...limites_referencia
  )
  const minimo_total = Math.min(...todos_los_limites)
  const maximo_total = Math.max(...todos_los_limites)
  const margen_holgura =
    (maximo_total - minimo_total) * proporcion_holgura ||
    (maximo_total === 0 && minimo_total === 0 ? 1 : Math.abs(maximo_total) * 0.1)

  return {
    min: minimo_total - margen_holgura,
    max: maximo_total + margen_holgura,
  }
}

/**
 * Calcula la regresión lineal por mínimos cuadrados y el coeficiente de determinación R².
 * @param pares_coordenadas - Arreglo de puntos bidimensionales { x, y }.
 * @returns Coeficientes de correlación, pendiente, intersección, ecuación y línea de tendencia.
 */
export function calcular_regresion_lineal(pares_coordenadas: { x: number; y: number }[]) {
  let coeficiente_correlacion = 0
  let coeficiente_determinacion = 0
  let pendiente_recta = 0
  let ordenada_origen = 0
  let ecuacion_formateada = "N/A"
  let puntos_tendencia: number[][] = []

  if (pares_coordenadas.length > 1) {
    const media_eje_x =
      pares_coordenadas.reduce((acumulador, punto_actual) => acumulador + punto_actual.x, 0) /
      pares_coordenadas.length
    const media_eje_y =
      pares_coordenadas.reduce((acumulador, punto_actual) => acumulador + punto_actual.y, 0) /
      pares_coordenadas.length

    let numerador_covarianza = 0
    let suma_cuadrados_x = 0
    let suma_cuadrados_y = 0

    pares_coordenadas.forEach((punto_actual) => {
      const diferencia_x = punto_actual.x - media_eje_x
      const diferencia_y = punto_actual.y - media_eje_y
      numerador_covarianza += diferencia_x * diferencia_y
      suma_cuadrados_x += diferencia_x * diferencia_x
      suma_cuadrados_y += diferencia_y * diferencia_y
    })

    if (suma_cuadrados_x > 0 && suma_cuadrados_y > 0) {
      coeficiente_correlacion = numerador_covarianza / Math.sqrt(suma_cuadrados_x * suma_cuadrados_y)
      coeficiente_determinacion = coeficiente_correlacion * coeficiente_correlacion
      pendiente_recta = numerador_covarianza / suma_cuadrados_x
      ordenada_origen = media_eje_y - pendiente_recta * media_eje_x

      const minimo_x = Math.min(...pares_coordenadas.map((punto_actual) => punto_actual.x))
      const maximo_x = Math.max(...pares_coordenadas.map((punto_actual) => punto_actual.x))
      puntos_tendencia = [
        [minimo_x, pendiente_recta * minimo_x + ordenada_origen],
        [maximo_x, pendiente_recta * maximo_x + ordenada_origen],
      ]

      const signo_interseccion = ordenada_origen >= 0 ? "+" : "-"
      ecuacion_formateada = `y = ${pendiente_recta.toFixed(4)}x ${signo_interseccion} ${Math.abs(ordenada_origen).toFixed(4)}`
    }
  }

  return {
    r: coeficiente_correlacion,
    r2: coeficiente_determinacion,
    m: pendiente_recta,
    b: ordenada_origen,
    formula: ecuacion_formateada,
    trendlineData: puntos_tendencia,
  }
}
