/**
 * @fileoverview Funciones de estadística descriptiva y cálculo de capacidad de proceso (Cp, Cpk, Pp, Ppk).
 * Desacopla las fórmulas matemáticas del renderizado de componentes visuales.
 */

/**
 * Calcula la media aritmética de una colección de valores numéricos.
 * @param valores_muestra - Arreglo de números a promediar.
 * @returns Media aritmética o 0 si el arreglo está vacío.
 */
export function calcular_media(valores_muestra: number[]): number {
  if (valores_muestra.length === 0) return 0
  return valores_muestra.reduce((acumulador, valor_actual) => acumulador + valor_actual, 0) / valores_muestra.length
}

/**
 * Calcula la desviación estándar muestral (n - 1) de un conjunto de datos.
 * @param valores_muestra - Arreglo de números de la muestra.
 * @param media_precalculada - Media opcional si ya fue calculada previamente.
 * @returns Desviación estándar muestral.
 */
export function calcular_desviacion_estandar(valores_muestra: number[], media_precalculada?: number): number {
  if (valores_muestra.length < 2) return 0
  const valor_media = media_precalculada ?? calcular_media(valores_muestra)
  const varianza_muestral =
    valores_muestra.reduce(
      (suma_cuadrados, valor_actual) => suma_cuadrados + Math.pow(valor_actual - valor_media, 2),
      0
    ) /
    (valores_muestra.length - 1)
  return Math.sqrt(varianza_muestral)
}

/**
 * Calcula un percentil específico mediante interpolación lineal sobre los datos ordenados.
 * @param valores_muestra - Arreglo de números de entrada.
 * @param proporcion_percentil - Proporción entre 0 y 1 (ej. 0.5 para la mediana).
 * @returns Valor interpolado correspondiente al percentil solicitado.
 */
export function calcular_percentil(valores_muestra: number[], proporcion_percentil: number): number {
  if (valores_muestra.length === 0) return 0
  const datos_ordenados = [...valores_muestra].sort((primer_num, segundo_num) => primer_num - segundo_num)
  const posicion_indice = (datos_ordenados.length - 1) * proporcion_percentil
  const indice_base = Math.floor(posicion_indice)
  const parte_fraccionaria = posicion_indice - indice_base
  if (datos_ordenados[indice_base + 1] !== undefined) {
    return datos_ordenados[indice_base] + parte_fraccionaria * (datos_ordenados[indice_base + 1] - datos_ordenados[indice_base])
  }
  return datos_ordenados[indice_base]
}

/**
 * Calcula la mediana (percentil 50) de un conjunto de valores numéricos.
 * @param valores_muestra - Arreglo de números de entrada.
 * @returns Valor de la mediana.
 */
export function calcular_mediana(valores_muestra: number[]): number {
  if (valores_muestra.length === 0) return 0
  return calcular_percentil(valores_muestra, 0.5)
}

/**
 * Calcula el coeficiente de asimetría muestral (fórmula equivalente a Excel).
 * @param valores_muestra - Arreglo de números de la muestra.
 * @param media_precalculada - Media opcional precalculada.
 * @param desviacion_precalculada - Desviación estándar opcional precalculada.
 * @returns Coeficiente de asimetría.
 */
export function calcular_asimetria(
  valores_muestra: number[],
  media_precalculada?: number,
  desviacion_precalculada?: number
): number {
  if (valores_muestra.length < 3) return 0
  const valor_media = media_precalculada ?? calcular_media(valores_muestra)
  const desviacion_estandar = desviacion_precalculada ?? calcular_desviacion_estandar(valores_muestra, valor_media)
  if (desviacion_estandar === 0) return 0

  let suma_desviaciones_cubicas = 0
  for (const valor_actual of valores_muestra) {
    suma_desviaciones_cubicas += Math.pow((valor_actual - valor_media) / desviacion_estandar, 3)
  }
  const tamano_muestra = valores_muestra.length
  return (tamano_muestra / ((tamano_muestra - 1) * (tamano_muestra - 2))) * suma_desviaciones_cubicas
}

/**
 * Calcula la curtosis muestral de una distribución de datos.
 * @param valores_muestra - Arreglo de números de la muestra.
 * @param media_precalculada - Media opcional precalculada.
 * @param desviacion_precalculada - Desviación estándar opcional precalculada.
 * @returns Coeficiente de curtosis muestral.
 */
export function calcular_curtosis(
  valores_muestra: number[],
  media_precalculada?: number,
  desviacion_precalculada?: number
): number {
  if (valores_muestra.length < 4) return 0
  const valor_media = media_precalculada ?? calcular_media(valores_muestra)
  const desviacion_estandar = desviacion_precalculada ?? calcular_desviacion_estandar(valores_muestra, valor_media)
  if (desviacion_estandar === 0) return 0

  let suma_desviaciones_cuarticas = 0
  for (const valor_actual of valores_muestra) {
    suma_desviaciones_cuarticas += Math.pow((valor_actual - valor_media) / desviacion_estandar, 4)
  }
  const tamano_muestra = valores_muestra.length
  const factor_uno = (tamano_muestra * (tamano_muestra + 1)) / ((tamano_muestra - 1) * (tamano_muestra - 2) * (tamano_muestra - 3))
  const factor_dos = (3 * Math.pow(tamano_muestra - 1, 2)) / ((tamano_muestra - 2) * (tamano_muestra - 3))
  return factor_uno * suma_desviaciones_cuarticas - factor_dos
}

/**
 * Calcula los índices de capacidad y desempeño del proceso (Cp, Cpk, Pp, Ppk).
 * @param valores_muestra - Arreglo de mediciones del proceso.
 * @param limite_inferior_especificacion - Límite inferior de especificación (LSL).
 * @param limite_superior_especificacion - Límite superior de especificación (USL).
 * @param media_precalculada - Media opcional precalculada.
 * @param desviacion_precalculada - Desviación estándar opcional precalculada.
 * @param rango_medio - Rango móvil promedio opcional para sigma de corto plazo.
 * @param constante_d2 - Constante d2 para estimación de sigma de corto plazo.
 * @returns Objeto con los índices cp, cpk, pp y ppk.
 */
export function calcular_capacidad_proceso(
  valores_muestra: number[],
  limite_inferior_especificacion: number,
  limite_superior_especificacion: number,
  media_precalculada?: number,
  desviacion_precalculada?: number,
  rango_medio?: number,
  constante_d2?: number
) {
  const valor_media = media_precalculada ?? calcular_media(valores_muestra)
  const desviacion_estandar = desviacion_precalculada ?? calcular_desviacion_estandar(valores_muestra, valor_media)
  if (desviacion_estandar === 0) return { cp: 0, cpk: 0, pp: 0, ppk: 0 }

  const desempeno_pp = (limite_superior_especificacion - limite_inferior_especificacion) / (6 * desviacion_estandar)
  const desempeno_inferior = (valor_media - limite_inferior_especificacion) / (3 * desviacion_estandar)
  const desempeno_superior = (limite_superior_especificacion - valor_media) / (3 * desviacion_estandar)
  const indice_ppk = Math.min(desempeno_inferior, desempeno_superior)

  const sigma_corto_plazo =
    rango_medio !== undefined && constante_d2 !== undefined && constante_d2 > 0
      ? rango_medio / constante_d2
      : desviacion_estandar

  const capacidad_cp =
    sigma_corto_plazo > 0
      ? (limite_superior_especificacion - limite_inferior_especificacion) / (6 * sigma_corto_plazo)
      : 0
  const indice_cpk =
    sigma_corto_plazo > 0
      ? Math.min(
          (valor_media - limite_inferior_especificacion) / (3 * sigma_corto_plazo),
          (limite_superior_especificacion - valor_media) / (3 * sigma_corto_plazo)
        )
      : 0

  return { cp: capacidad_cp, cpk: indice_cpk, pp: desempeno_pp, ppk: indice_ppk }
}
