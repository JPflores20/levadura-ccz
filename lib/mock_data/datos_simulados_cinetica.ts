/**
 * @fileoverview Series temporales simuladas y estructura de datos de respaldo para Cinética de Fermentación.
 */

export type KineticPoint = {
  hora: string
  h: number
  plato: number
  ph: number
  temp: number
}

export type MiniKpi = {
  id: string
  label: string
  value: string
  unit: string
  icon: string
  delta: string
  trend: "up" | "down" | "flat"
  status: "ok" | "marginal" | "alert"
}

/**
 * Genera una serie temporal de fermentación de 0 a 168 horas muestreada cada 6 horas.
 * @returns Arreglo de puntos cinéticos simulados.
 */
function generar_serie_cinetica_simulada(): KineticPoint[] {
  const lista_puntos: KineticPoint[] = []
  const total_pasos = 29
  for (let indice_paso = 0; indice_paso < total_pasos; indice_paso++) {
    const horas_transcurridas = indice_paso * 6
    const fraccion_tiempo = indice_paso / (total_pasos - 1)
    const grados_plato = 2.6 + 10 * Math.exp(-fraccion_tiempo * 3.4) + Math.sin(indice_paso * 33.3) * 0.09
    const nivel_ph = 4.1 + 1.2 * Math.exp(-fraccion_tiempo * 2.6) + Math.sin(indice_paso * 44.4) * 0.02

    let temperatura_tanque: number
    if (fraccion_tiempo < 0.55) temperatura_tanque = 12 + (fraccion_tiempo / 0.55) * 8
    else if (fraccion_tiempo < 0.75) temperatura_tanque = 20
    else temperatura_tanque = 20 - ((fraccion_tiempo - 0.75) / 0.25) * 16
    temperatura_tanque += Math.sin(indice_paso * 55.5) * 0.2

    lista_puntos.push({
      hora: `${horas_transcurridas}h`,
      h: horas_transcurridas,
      plato: Number(grados_plato.toFixed(2)),
      ph: Number(nivel_ph.toFixed(2)),
      temp: Number(temperatura_tanque.toFixed(1)),
    })
  }
  return lista_puntos
}

export const datos_cinetica_simulados = generar_serie_cinetica_simulada()

const primer_punto_cinetica = datos_cinetica_simulados[0]
const ultimo_punto_cinetica = datos_cinetica_simulados[datos_cinetica_simulados.length - 1]

const atenuacion_aparente =
  ((primer_punto_cinetica.plato - ultimo_punto_cinetica.plato) / primer_punto_cinetica.plato) * 100
const alcohol_estimado = (primer_punto_cinetica.plato - ultimo_punto_cinetica.plato) * 0.516
const velocidad_fermentacion =
  (primer_punto_cinetica.plato - ultimo_punto_cinetica.plato) / (ultimo_punto_cinetica.h / 24)

export const indicadores_kpi_cinetica: MiniKpi[] = [
  { id: "og", label: "Densidad Inicial", value: primer_punto_cinetica.plato.toFixed(1), unit: "°P", icon: "Gauge", delta: "OG", trend: "flat", status: "ok" },
  { id: "ap", label: "Extracto Aparente", value: ultimo_punto_cinetica.plato.toFixed(2), unit: "°P", icon: "Activity", delta: "-0.12 °P/6h", trend: "down", status: "ok" },
  { id: "aten", label: "Atenuación Ap.", value: atenuacion_aparente.toFixed(1), unit: "%", icon: "Percent", delta: "objetivo 80%", trend: "up", status: atenuacion_aparente >= 78 ? "ok" : "marginal" },
  { id: "abv", label: "Alcohol Est.", value: alcohol_estimado.toFixed(2), unit: "% v/v", icon: "FlaskConical", delta: "+0.06 /6h", trend: "up", status: "ok" },
  { id: "ph", label: "pH Actual", value: ultimo_punto_cinetica.ph.toFixed(2), unit: "", icon: "Droplets", delta: "estable", trend: "flat", status: ultimo_punto_cinetica.ph >= 4.0 && ultimo_punto_cinetica.ph <= 4.6 ? "ok" : "marginal" },
  { id: "temp", label: "Temp. Tanque", value: ultimo_punto_cinetica.temp.toFixed(1), unit: "°C", icon: "Thermometer", delta: "crash frío", trend: "down", status: ultimo_punto_cinetica.temp <= 6 ? "ok" : "alert" },
  { id: "vel", label: "Vel. Fermentación", value: velocidad_fermentacion.toFixed(2), unit: "°P/día", icon: "TrendingDown", delta: "en descenso", trend: "down", status: "ok" },
  { id: "diace", label: "Diacetilo", value: "0.08", unit: "ppm", icon: "Waves", delta: "< 0.10 umbral", trend: "down", status: "ok" },
]

export const fases_cinetica_fermentacion = [
  { h: 24, label: "Fase Alta" },
  { h: 96, label: "Descanso Diacetilo" },
  { h: 132, label: "Crash Frío" },
]

export const datos_celulas_cinetica = datos_cinetica_simulados.map((punto_cinetico, indice_paso) => {
  const fraccion_tiempo = indice_paso / (datos_cinetica_simulados.length - 1)
  const valor_viabilidad = 98 - fraccion_tiempo * 15 + Math.sin(indice_paso * 66.6)
  const valor_conteo = 150 + Math.sin(fraccion_tiempo * Math.PI) * 120 + Math.sin(indice_paso * 77.7) * 5
  return {
    hora: punto_cinetico.hora,
    viabilidad: Math.max(0, Math.min(100, valor_viabilidad)),
    conteo: Math.max(0, valor_conteo),
  }
})

export const datos_sabores_cinetica = datos_cinetica_simulados.map((punto_cinetico, indice_paso) => {
  const fraccion_tiempo = indice_paso / (datos_cinetica_simulados.length - 1)
  const nivel_diacetilo =
    (fraccion_tiempo < 0.3 ? 0.05 + fraccion_tiempo * 0.8 : 0.29 - (fraccion_tiempo - 0.3) * 0.4) +
    Math.sin(indice_paso * 88.8) * 0.01
  const nivel_esteres = fraccion_tiempo * 12 + Math.sin(indice_paso * 99.9) * 0.5
  const nivel_alcoholes = fraccion_tiempo * 8 + Math.sin(indice_paso * 10.1) * 0.25
  return {
    hora: punto_cinetico.hora,
    diacetilo: Math.max(0, nivel_diacetilo),
    esteres: Math.max(0, nivel_esteres),
    alcoholes: Math.max(0, nivel_alcoholes),
  }
})

export const datos_dispersion_cinetica = datos_sabores_cinetica.map((punto_sabor, indice_paso) => ({
  ...punto_sabor,
  ...datos_cinetica_simulados[indice_paso],
  ...datos_celulas_cinetica[indice_paso],
}))

export const datos_proceso_cinetica = [
  { indicator: "Extracto Final", spec: "< 2.8 °P", mean: "2.65", cpk: "1.24", status: "ok" },
  { indicator: "Atenuación", spec: "> 78 %", mean: "79.1", cpk: "1.10", status: "ok" },
  { indicator: "pH Final", spec: "4.0 - 4.4", mean: "4.2", cpk: "1.35", status: "ok" },
  { indicator: "Diacetilo", spec: "< 0.10 ppm", mean: "0.08", cpk: "0.95", status: "warn" },
  { indicator: "Viabilidad Cosecha", spec: "> 85 %", mean: "83.5", cpk: "0.80", status: "alert" },
]

export const informe_ejecutivo_cinetica = [
  { text: "Fermentación completada en tiempo esperado (168h).", type: "ok" },
  { text: "Perfil de atenuación conforme al estándar de la cepa.", type: "ok" },
  { text: "Niveles de diacetilo en límite marginal (0.08 ppm).", type: "warn" },
  { text: "Viabilidad final por debajo del 85%, evaluar para reprópago.", type: "alert" },
]
