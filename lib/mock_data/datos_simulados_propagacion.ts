/**
 * @fileoverview Datos base y estructura de indicadores KPI para el módulo de Propagación de Levadura.
 */

export type PropagationPoint = {
  hora: string
  viabilidad: number
  vigorosas: number
  conteo: number
  plato: number
  ph: number
  temp: number
}

export type Kpi = {
  id: string
  label: string
  value: number | string
  unit: string
  icon: string
  lc: string
  status: "ok" | "marginal" | "fuera"
  spark: { v: number }[]
}

export type ProcessVar = {
  variable: string
  promedio: string
  lc: string
  min: string
  max: string
}

export type Conclusion = {
  texto: string
  tipo: "ok" | "warn"
}

export const datos_propagacion_simulados: PropagationPoint[] = []

const ultimo_punto_propagacion: PropagationPoint = {
  hora: "0h",
  viabilidad: 0,
  vigorosas: 0,
  conteo: 0,
  plato: 0,
  ph: 0,
  temp: 0,
}

export const datos_composicion_simulados = datos_propagacion_simulados
  .filter((_, indice_paso) => indice_paso % 3 === 0)
  .map((punto_propagacion) => {
    const porcentaje_vitales = punto_propagacion.vigorosas
    const porcentaje_moderadas = punto_propagacion.viabilidad - punto_propagacion.vigorosas
    const porcentaje_no_viables = 100 - punto_propagacion.viabilidad
    return {
      hora: punto_propagacion.hora,
      vitales: Number(porcentaje_vitales.toFixed(1)),
      moderadas: Number(porcentaje_moderadas.toFixed(1)),
      estresadas: Number((porcentaje_no_viables * 0.6).toFixed(1)),
      muertas: Number((porcentaje_no_viables * 0.4).toFixed(1)),
    }
  })

/**
 * Genera el arreglo de minigráfica (sparkline) para una métrica dada.
 * @param clave_metrica - Propiedad numérica del punto de propagación.
 * @returns Arreglo de objetos con la propiedad numérica v.
 */
function generar_sparkline_propagacion(clave_metrica: keyof PropagationPoint) {
  return datos_propagacion_simulados.map((punto_actual) => ({ v: Number(punto_actual[clave_metrica]) }))
}

export const indicadores_kpi_propagacion: Kpi[] = [
  { id: "conteo", label: "Conteo Celular", value: ultimo_punto_propagacion.conteo, unit: "M/mL", icon: "FlaskConical", lc: "LC: 180 M/mL", status: "marginal", spark: generar_sparkline_propagacion("conteo") },
  { id: "viabilidad", label: "Viabilidad", value: ultimo_punto_propagacion.viabilidad, unit: "%", icon: "Percent", lc: "LC: 95.0 %", status: "marginal", spark: generar_sparkline_propagacion("viabilidad") },
  { id: "vitalidad", label: "Vitalidad", value: 0, unit: "", icon: "Activity", lc: "V-MV-D-M", status: "ok", spark: [] },
  { id: "plato", label: "Porcentaje de Sólidos", value: ultimo_punto_propagacion.plato, unit: "%", icon: "Gauge", lc: "LC: 8.0 %", status: "ok", spark: generar_sparkline_propagacion("plato") },
  { id: "aireacion", label: "Aireación", value: 15, unit: "L/min", icon: "Wind", lc: "LC: 10 - 20", status: "ok", spark: [] },
  { id: "zn", label: "Zn", value: 0.15, unit: "mg/L", icon: "FlaskConical", lc: "LC: 0.15 - 0.25", status: "ok", spark: [] },
  { id: "temp", label: "Temp. Mosto", value: ultimo_punto_propagacion.temp, unit: "°C", icon: "Thermometer", lc: "LC: 18 - 22 °C", status: "marginal", spark: generar_sparkline_propagacion("temp") },
  { id: "escalamiento", label: "Escalamiento", value: 0, unit: "", icon: "Maximize", lc: "N/A", status: "ok", spark: [] },
  { id: "plato_2", label: "Plato", value: ultimo_punto_propagacion.plato, unit: "°P", icon: "Gauge", lc: "LC: 8.0 °P", status: "ok", spark: [] },
  { id: "ph", label: "pH", value: ultimo_punto_propagacion.ph, unit: "", icon: "Droplets", lc: "LC: 4.4 - 5.2", status: "marginal", spark: [] },
  { id: "presion", label: "Presión del Tanque", value: 0, unit: "bar", icon: "ArrowDownToLine", lc: "N/A", status: "ok", spark: [] },
  { id: "purga", label: "Purga de Trub", value: 0, unit: "", icon: "Trash2", lc: "N/A", status: "ok", spark: [] },
]

export const datos_dispersion_propagacion = datos_propagacion_simulados.map((punto_actual, indice_paso) => {
  const fraccion_tiempo = indice_paso / Math.max(1, datos_propagacion_simulados.length - 1)
  const valor_aireacion = 15 - fraccion_tiempo * 5 + Math.sin(indice_paso * 11.1)
  const valor_zinc = 0.15 + Math.sin(indice_paso * 22.2) * 0.025
  return {
    ...punto_actual,
    aireacion: Number(valor_aireacion.toFixed(2)),
    zn: Number(valor_zinc.toFixed(2)),
  }
})

export const variables_proceso_propagacion: ProcessVar[] = [
  { variable: "Viabilidad (%)", promedio: "0.0", lc: "95.0", min: "0.0", max: "0.0" },
  { variable: "Vigorosas (%)", promedio: "0.0", lc: "88.0", min: "0.0", max: "0.0" },
  { variable: "Conteo (M/mL)", promedio: "0", lc: "180", min: "0", max: "0" },
  { variable: "°P Mosto", promedio: "0.00", lc: "8.00", min: "0.00", max: "0.00" },
  { variable: "pH", promedio: "0.00", lc: "4.80", min: "0.00", max: "0.00" },
  { variable: "Temp. (°C)", promedio: "0.0", lc: "20.0", min: "0.0", max: "0.0" },
]

export const datos_capacidad_resumen = [
  { name: "Excelentes", value: 78, fill: "#22c55e" },
  { name: "Capaces", value: 15, fill: "#eab308" },
  { name: "No capaces", value: 7, fill: "#ef4444" },
]

export const conclusiones_propagacion: Conclusion[] = [
  { texto: "Viabilidad promedio sobre el LC (95%)", tipo: "ok" },
  { texto: "Conteo celular alcanza el objetivo de propagación", tipo: "ok" },
  { texto: "pH dentro del rango de control óptimo", tipo: "ok" },
  { texto: "% Vigorosas marginal en fase intermedia", tipo: "warn" },
  { texto: "Cpk temperatura = 1.12 (revisar control térmico)", tipo: "warn" },
]

export const limites_control_propagacion = { usl: 99, lsl: 90 }
