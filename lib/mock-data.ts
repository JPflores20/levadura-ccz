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
