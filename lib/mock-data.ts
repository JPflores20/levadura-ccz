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
    const viabilidad = 97.5 - Math.sin(t * Math.PI) * 4.5 + (Math.sin(i * 12.34) * 0.6)
    // Células vigorosas: sigue a la viabilidad pero por debajo
    const vigorosas = viabilidad - 6 - Math.sin(t * Math.PI) * 3 + (Math.sin(i * 56.78) * 0.75)
    // Conteo celular: curva de crecimiento sigmoide
    const conteo = 40 + 180 / (1 + Math.exp(-(t - 0.45) * 9)) + (Math.sin(i * 90.12) * 3)
    // °P en mosto: consumo de azúcares -> desciende
    const plato = 14.2 - t * 6.8 + (Math.sin(i * 34.56) * 0.2)
    // pH: leve descenso
    const ph = 5.4 - t * 0.9 + (Math.sin(i * 78.90) * 0.03)
    // Temperatura controlada alrededor de 20°C
    const temp = 20 + Math.sin(t * Math.PI * 2) * 1.1 + (Math.sin(i * 23.45) * 0.25)

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

export const propagationData: PropagationPoint[] = []

const last = propagationData.length > 0 ? propagationData[propagationData.length - 1] : {
  viabilidad: 0,
  vigorosas: 0,
  conteo: 0,
  plato: 0,
  ph: 0,
  temp: 0
} as PropagationPoint

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
    id: "vitalidad",
    label: "Vitalidad",
    value: 0, // se llenará dinámicamente
    unit: "",
    icon: "Activity",
    lc: "V-MV-D-M",
    status: "ok",
    spark: [],
  },
  {
    id: "plato", // Plato es literalmente el porcentaje de sólidos
    label: "Porcentaje de Sólidos",
    value: last.plato,
    unit: "%",
    icon: "Gauge",
    lc: "LC: 8.0 %",
    status: last.plato <= 8 ? "ok" : "marginal",
    spark: spark("plato"),
  },
  {
    id: "aireacion",
    label: "Aireación",
    value: 15,
    unit: "L/min",
    icon: "Wind",
    lc: "LC: 10 - 20",
    status: "ok",
    spark: [],
  },
  {
    id: "zn",
    label: "Zn",
    value: 0.15,
    unit: "mg/L",
    icon: "FlaskConical",
    lc: "LC: 0.15 - 0.25",
    status: "ok",
    spark: [],
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
  {
    id: "escalamiento",
    label: "Escalamiento",
    value: 0,
    unit: "",
    icon: "Maximize",
    lc: "N/A",
    status: "ok",
    spark: [],
  },
  {
    id: "plato_2",
    label: "Plato",
    value: last.plato,
    unit: "°P",
    icon: "Gauge",
    lc: "LC: 8.0 °P",
    status: last.plato <= 8 ? "ok" : "marginal",
    spark: [],
  },
  {
    id: "ph",
    label: "pH",
    value: last.ph,
    unit: "",
    icon: "Droplets",
    lc: "LC: 4.4 - 5.2",
    status: last.ph >= 4.4 && last.ph <= 5.2 ? "ok" : "marginal",
    spark: [],
  },
  {
    id: "presion",
    label: "Presión del Tanque",
    value: 0,
    unit: "bar",
    icon: "ArrowDownToLine",
    lc: "N/A",
    status: "ok",
    spark: [],
  },
  {
    id: "purga",
    label: "Purga de Trub",
    value: 0,
    unit: "",
    icon: "Trash2",
    lc: "N/A",
    status: "ok",
    spark: [],
  }
]

// Datos para diagramas de dispersión
export const scatterData = propagationData.map((p, i) => {
  const t = i / (propagationData.length - 1)
  const aireacion = 15 - t * 5 + (Math.sin(i * 11.1) * 1) // L/min
  const zn = 0.15 + (Math.sin(i * 22.2) * 0.025) // mg/L
  return {
    ...p,
    aireacion: Number(aireacion.toFixed(2)),
    zn: Number(zn.toFixed(2))
  }
})


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
  { name: "Excelentes", value: 78, fill: "#22c55e" },
  { name: "Capaces", value: 15, fill: "#eab308" },
  { name: "No capaces", value: 7, fill: "#ef4444" },
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
    const plato = 2.6 + 10 * Math.exp(-t * 3.4) + (Math.sin(i * 33.3) * 0.09)
    // pH: desciende de 5.3 a ~4.1 y se estabiliza
    const ph = 4.1 + 1.2 * Math.exp(-t * 2.6) + (Math.sin(i * 44.4) * 0.02)
    // Temp: rampa de fermentación 12 -> 20°C con descanso diacetilo, luego crash a 4°C
    let temp: number
    if (t < 0.55) temp = 12 + (t / 0.55) * 8
    else if (t < 0.75) temp = 20
    else temp = 20 - ((t - 0.75) / 0.25) * 16
    temp += (Math.sin(i * 55.5) * 0.2)

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

export const kineticsCellsData = kineticsData.map((d, i) => {
  const t = i / (kineticsData.length - 1)
  const viabilidad = 98 - t * 15 + (Math.sin(i * 66.6) * 1) // Starts 98, ends 83
  const conteo = 150 + Math.sin(t * Math.PI) * 120 + (Math.sin(i * 77.7) * 5) // Peaks in middle
  return {
    hora: d.hora,
    viabilidad: Math.max(0, Math.min(100, viabilidad)),
    conteo: Math.max(0, conteo)
  }
})

export const kineticsFlavorData = kineticsData.map((d, i) => {
  const t = i / (kineticsData.length - 1)
  const diacetilo = (t < 0.3 ? 0.05 + t * 0.8 : 0.29 - (t - 0.3) * 0.4) + (Math.sin(i * 88.8) * 0.01)
  const esteres = t * 12 + (Math.sin(i * 99.9) * 0.5)
  const alcoholes = t * 8 + (Math.sin(i * 10.1) * 0.25)
  return {
    hora: d.hora,
    diacetilo: Math.max(0, diacetilo),
    esteres: Math.max(0, esteres),
    alcoholes: Math.max(0, alcoholes)
  }
})

export const kineticsScatterData = kineticsFlavorData.map((f, i) => {
  const d = kineticsData[i]
  const c = kineticsCellsData[i]
  return {
    ...f,
    ...d,
    ...c
  }
})

export const kineticsProcessData = [
  { indicator: "Extracto Final", spec: "< 2.8 °P", mean: "2.65", cpk: "1.24", status: "ok" },
  { indicator: "Atenuación", spec: "> 78 %", mean: "79.1", cpk: "1.10", status: "ok" },
  { indicator: "pH Final", spec: "4.0 - 4.4", mean: "4.2", cpk: "1.35", status: "ok" },
  { indicator: "Diacetilo", spec: "< 0.10 ppm", mean: "0.08", cpk: "0.95", status: "warn" },
  { indicator: "Viabilidad Cosecha", spec: "> 85 %", mean: "83.5", cpk: "0.80", status: "alert" },
]

export const kineticsExecutiveReport = [
  { text: "Fermentación completada en tiempo esperado (168h).", type: "ok" },
  { text: "Perfil de atenuación conforme al estándar de la cepa.", type: "ok" },
  { text: "Niveles de diacetilo en límite marginal (0.08 ppm).", type: "warn" },
  { text: "Viabilidad final por debajo del 85%, evaluar para reprópago.", type: "alert" },
]

// ---------------------------------------------------------------------------
// Comparación de Cultivos (FASE 3)
// ---------------------------------------------------------------------------

export const comparacionKpis = [
  { label: "Viabilidad Inicial", unit: "%", valA: 0, valB: 0, better: "A" },
  { label: "Conteo Máximo", unit: "M/mL", valA: 0, valB: 0, better: "A" },
  { label: "Atenuación Aparente", unit: "%", valA: 0, valB: 0, better: "A" },
  { label: "Tiempo Final", unit: "h", valA: 0, valB: 0, better: "A" },
  { label: "pH Final", unit: "", valA: 0, valB: 0, better: "A" },
  { label: "Velocidad Promedio", unit: "°P/d", valA: 0, valB: 0, better: "A" },
  { label: "Diacetilo Final", unit: "ppm", valA: 0, valB: 0, better: "A" },
  { label: "Esteres Totales", unit: "ppm", valA: 0, valB: 0, better: "A" },
]

export const comparacionResumen = [
  { parametro: "Cinética de Fermentación", ganador: "Cultivo A", diff: "+15% vel." },
  { parametro: "Rendimiento (Atenuación)", ganador: "Cultivo A", diff: "+2.3%" },
  { parametro: "Perfil Sensorial", ganador: "Cultivo A", diff: "Menor Diac." },
  { parametro: "Salud y Cosecha", ganador: "Cultivo B", diff: "+5% Viab. Fin" },
]

export const comparacionSeriesData = Array.from({ length: 29 }).map((_, i) => {
  const h = i * 6
  const t = i / 28
  
  // Atenuación (°P)
  const platoA = 2.4 + 10.2 * Math.exp(-t * 4.0) + (Math.sin(i * 12.1) * 0.05)
  const platoB = 2.8 + 9.8 * Math.exp(-t * 3.2) + (Math.sin(i * 13.1) * 0.05)
  
  // Velocidad (°P/d) (derivada simulada)
  const velA = Math.max(0, 10.2 * 4.0 * Math.exp(-t * 4.0) / 4) + (Math.sin(i * 14.1) * 0.1)
  const velB = Math.max(0, 9.8 * 3.2 * Math.exp(-t * 3.2) / 4) + (Math.sin(i * 15.1) * 0.1)
  
  // pH
  const phA = 4.15 + 1.15 * Math.exp(-t * 3.0) + (Math.sin(i * 16.1) * 0.025)
  const phB = 4.25 + 1.05 * Math.exp(-t * 2.5) + (Math.sin(i * 17.1) * 0.025)
  
  // Diacetilo
  const diacA = (t < 0.2 ? 0.05 + t * 0.5 : 0.15 - (t - 0.2) * 0.2) * (1 - t) + (Math.sin(i * 18.1) * 0.005)
  const diacB = (t < 0.25 ? 0.05 + t * 0.6 : 0.20 - (t - 0.25) * 0.15) * (1 - t * 0.5) + (Math.sin(i * 19.1) * 0.005)

  return {
    hora: `${h}h`,
    platoA: Number(platoA.toFixed(2)),
    platoB: Number(platoB.toFixed(2)),
    velA: Number(velA.toFixed(2)),
    velB: Number(velB.toFixed(2)),
    phA: Number(phA.toFixed(2)),
    phB: Number(phB.toFixed(2)),
    diacA: Math.max(0, Number(diacA.toFixed(3))),
    diacB: Math.max(0, Number(diacB.toFixed(3))),
  }
})
