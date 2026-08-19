// Datos simulados para el sistema de análisis de levadura (propagación)

export type PropagationPoint = {
  hora: string
  viabilidad: number
  vigorosas: number
  conteo: number // millones de células / mL
  plato: number // °P en mosto
  ph: number
  temp: number // °C
}

// Genera una serie temporal realista de propagación de levadura (0h - 46h)
function generateSeries(): PropagationPoint[] {
  const points: PropagationPoint[] = []
  const total = 24
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1)
    // Viabilidad: comienza alta, ligera caída y recuperación
    const viabilidad = 97.5 - Math.sin(t * Math.PI) * 4.5 + (Math.random() - 0.5) * 1.2
    // Células vigorosas: sigue a la viabilidad pero por debajo
    const vigorosas = viabilidad - 6 - Math.sin(t * Math.PI) * 3 + (Math.random() - 0.5) * 1.5
    // Conteo celular: curva de crecimiento sigmoide
    const conteo = 40 + 180 / (1 + Math.exp(-(t - 0.45) * 9)) + (Math.random() - 0.5) * 6
    // °P en mosto: consumo de azúcares -> desciende
    const plato = 14.2 - t * 6.8 + (Math.random() - 0.5) * 0.4
    // pH: leve descenso
    const ph = 5.4 - t * 0.9 + (Math.random() - 0.5) * 0.06
    // Temperatura controlada alrededor de 20°C
    const temp = 20 + Math.sin(t * Math.PI * 2) * 1.1 + (Math.random() - 0.5) * 0.5

    points.push({
      hora: `${i * 2}h`,
      viabilidad: Number(viabilidad.toFixed(1)),
      vigorosas: Number(Math.max(vigorosas, 0).toFixed(1)),
      conteo: Number(conteo.toFixed(0)),
      plato: Number(plato.toFixed(2)),
      ph: Number(ph.toFixed(2)),
      temp: Number(temp.toFixed(1)),
    })
  }
  return points
}

export const propagationData = generateSeries()

const last = propagationData[propagationData.length - 1]

// Composición del cultivo (barras apiladas 100%) por punto de muestreo
export const composicionData = propagationData
  .filter((_, i) => i % 3 === 0)
  .map((p) => {
    const vitales = p.vigorosas
    const viablesNoVigorosas = p.viabilidad - p.vigorosas
    const noViables = 100 - p.viabilidad
    return {
      hora: p.hora,
      vitales: Number(vitales.toFixed(1)),
      moderadas: Number(viablesNoVigorosas.toFixed(1)),
      estresadas: Number((noViables * 0.6).toFixed(1)),
      muertas: Number((noViables * 0.4).toFixed(1)),
    }
  })

// KPIs principales con sparkline
export type Kpi = {
  id: string
  label: string
  value: number
  unit: string
  icon: string
  lc: string
  status: "ok" | "marginal"
  spark: { v: number }[]
}

function spark(key: keyof PropagationPoint) {
  return propagationData.map((p) => ({ v: Number(p[key]) }))
}

export const kpis: Kpi[] = [
  {
    id: "viabilidad",
    label: "Viabilidad",
    value: last.viabilidad,
    unit: "%",
    icon: "Percent",
    lc: "LC: 95.0 %",
    status: last.viabilidad >= 95 ? "ok" : "marginal",
    spark: spark("viabilidad"),
  },
  {
    id: "vigorosas",
    label: "% Células Vigorosas",
    value: last.vigorosas,
    unit: "%",
    icon: "Activity",
    lc: "LC: 88.0 %",
    status: last.vigorosas >= 88 ? "ok" : "marginal",
    spark: spark("vigorosas"),
  },
  {
    id: "conteo",
    label: "Conteo Celular",
    value: last.conteo,
    unit: "M/mL",
    icon: "FlaskConical",
    lc: "LC: 180 M/mL",
    status: last.conteo >= 180 ? "ok" : "marginal",
    spark: spark("conteo"),
  },
  {
    id: "plato",
    label: "°P en Mosto",
    value: last.plato,
    unit: "°P",
    icon: "Gauge",
    lc: "LC: 8.0 °P",
    status: last.plato <= 8 ? "ok" : "marginal",
    spark: spark("plato"),
  },
  {
    id: "ph",
    label: "pH",
    value: last.ph,
    unit: "",
    icon: "Droplets",
    lc: "LC: 4.4 - 5.2",
    status: last.ph >= 4.4 && last.ph <= 5.2 ? "ok" : "marginal",
    spark: spark("ph"),
  },
  {
    id: "temp",
    label: "Temp. Mosto",
    value: last.temp,
    unit: "°C",
    icon: "Thermometer",
    lc: "LC: 18 - 22 °C",
    status: last.temp >= 18 && last.temp <= 22 ? "ok" : "marginal",
    spark: spark("temp"),
  },
]

// Tabla de variables del proceso
export type ProcessVar = {
  variable: string
  promedio: string
  lc: string
  min: string
  max: string
}

function stats(key: keyof PropagationPoint) {
  const vals = propagationData.map((p) => Number(p[key]))
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return {
    avg,
    min: Math.min(...vals),
    max: Math.max(...vals),
  }
}

export const processVars: ProcessVar[] = [
  (() => {
    const s = stats("viabilidad")
    return { variable: "Viabilidad (%)", promedio: s.avg.toFixed(1), lc: "95.0", min: s.min.toFixed(1), max: s.max.toFixed(1) }
  })(),
  (() => {
    const s = stats("vigorosas")
    return { variable: "Vigorosas (%)", promedio: s.avg.toFixed(1), lc: "88.0", min: s.min.toFixed(1), max: s.max.toFixed(1) }
  })(),
  (() => {
    const s = stats("conteo")
    return { variable: "Conteo (M/mL)", promedio: s.avg.toFixed(0), lc: "180", min: s.min.toFixed(0), max: s.max.toFixed(0) }
  })(),
  (() => {
    const s = stats("plato")
    return { variable: "°P Mosto", promedio: s.avg.toFixed(2), lc: "8.00", min: s.min.toFixed(2), max: s.max.toFixed(2) }
  })(),
  (() => {
    const s = stats("ph")
    return { variable: "pH", promedio: s.avg.toFixed(2), lc: "4.80", min: s.min.toFixed(2), max: s.max.toFixed(2) }
  })(),
  (() => {
    const s = stats("temp")
    return { variable: "Temp. (°C)", promedio: s.avg.toFixed(1), lc: "20.0", min: s.min.toFixed(1), max: s.max.toFixed(1) }
  })(),
]

// Informe de capacidad (dona)
export const capacidadData = [
  { name: "Conformes", value: 78, fill: "#22c55e" },
  { name: "Marginales", value: 15, fill: "#eab308" },
  { name: "No conformes", value: 7, fill: "#ef4444" },
]

export type Conclusion = { texto: string; tipo: "ok" | "warn" }

export const conclusiones: Conclusion[] = [
  { texto: "Viabilidad promedio sobre el LC (95%)", tipo: "ok" },
  { texto: "Conteo celular alcanza el objetivo de propagación", tipo: "ok" },
  { texto: "pH dentro del rango de control óptimo", tipo: "ok" },
  { texto: "% Vigorosas marginal en fase intermedia", tipo: "warn" },
  { texto: "Cpk temperatura = 1.12 (revisar control térmico)", tipo: "warn" },
]

// Límites de control para el gráfico de tendencia
export const limits = {
  usl: 99,
  lsl: 90,
}

// ---------------------------------------------------------------------------
// Cinética de Fermentación (Monitoreo)
// ---------------------------------------------------------------------------

export type KineticPoint = {
  hora: string
  h: number
  plato: number // °P extracto aparente
  ph: number
  temp: number // °C
}

// Serie de fermentación de 0h a 168h (7 días), muestreada cada 6h
function generateKinetics(): KineticPoint[] {
  const points: KineticPoint[] = []
  const total = 29 // 0..168h cada 6h
  for (let i = 0; i < total; i++) {
    const h = i * 6
    const t = i / (total - 1)
    // °P: curva de atenuación exponencial de ~12.6 -> ~2.6
    const plato = 2.6 + 10 * Math.exp(-t * 3.4) + (Math.random() - 0.5) * 0.18
    // pH: desciende de 5.3 a ~4.1 y se estabiliza
    const ph = 4.1 + 1.2 * Math.exp(-t * 2.6) + (Math.random() - 0.5) * 0.04
    // Temp: rampa de fermentación 12 -> 20°C con descanso diacetilo, luego crash a 4°C
    let temp: number
    if (t < 0.55) temp = 12 + (t / 0.55) * 8
    else if (t < 0.75) temp = 20
    else temp = 20 - ((t - 0.75) / 0.25) * 16
    temp += (Math.random() - 0.5) * 0.4

    points.push({
      hora: `${h}h`,
      h,
      plato: Number(plato.toFixed(2)),
      ph: Number(ph.toFixed(2)),
      temp: Number(temp.toFixed(1)),
    })
  }
  return points
}

export const kineticsData = generateKinetics()

const kFirst = kineticsData[0]
const kLast = kineticsData[kineticsData.length - 1]

// Atenuación aparente (%) y otros derivados
const atenuacion = ((kFirst.plato - kLast.plato) / kFirst.plato) * 100
const alcohol = (kFirst.plato - kLast.plato) * 0.516 // aprox. ABV
const velocidad =
  (kFirst.plato - kLast.plato) / (kLast.h / 24) // °P por día

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

export const kineticsKpis: MiniKpi[] = [
  { id: "og", label: "Densidad Inicial", value: kFirst.plato.toFixed(1), unit: "°P", icon: "Gauge", delta: "OG", trend: "flat", status: "ok" },
  { id: "ap", label: "Extracto Aparente", value: kLast.plato.toFixed(2), unit: "°P", icon: "Activity", delta: "-0.12 °P/6h", trend: "down", status: "ok" },
  { id: "aten", label: "Atenuación Ap.", value: atenuacion.toFixed(1), unit: "%", icon: "Percent", delta: "objetivo 80%", trend: "up", status: atenuacion >= 78 ? "ok" : "marginal" },
  { id: "abv", label: "Alcohol Est.", value: alcohol.toFixed(2), unit: "% v/v", icon: "FlaskConical", delta: "+0.06 /6h", trend: "up", status: "ok" },
  { id: "ph", label: "pH Actual", value: kLast.ph.toFixed(2), unit: "", icon: "Droplets", delta: "estable", trend: "flat", status: kLast.ph >= 4.0 && kLast.ph <= 4.6 ? "ok" : "marginal" },
  { id: "temp", label: "Temp. Tanque", value: kLast.temp.toFixed(1), unit: "°C", icon: "Thermometer", delta: "crash frío", trend: "down", status: kLast.temp <= 6 ? "ok" : "alert" },
  { id: "vel", label: "Vel. Fermentación", value: velocidad.toFixed(2), unit: "°P/día", icon: "TrendingDown", delta: "en descenso", trend: "down", status: "ok" },
  { id: "diace", label: "Diacetilo", value: "0.08", unit: "ppm", icon: "Waves", delta: "< 0.10 umbral", trend: "down", status: "ok" },
]

// Fases del proceso para marcar en el eje X
export const kineticsPhases = [
  { h: 24, label: "Fase Alta" },
  { h: 96, label: "Descanso Diacetilo" },
  { h: 132, label: "Crash Frío" },
]
