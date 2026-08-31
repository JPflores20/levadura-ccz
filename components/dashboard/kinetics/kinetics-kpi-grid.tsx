"use client"

import { KpiCard } from "@/components/dashboard/kpi-card"

const kpisCinetica = [
  { id: "diacetilo", label: "DIACETILO TOTAL (ppb)", value: 15.2, unit: "ppb", icon: "FlaskConical", lc: "LC: 20.0", status: "ok", spark: [{v:20},{v:18},{v:16},{v:15.2}] },
  { id: "esteres", label: "ESTERES TOTALES (ppm)", value: 24.6, unit: "ppm", icon: "Activity", lc: "LC: 25.0", status: "ok", spark: [{v:15},{v:20},{v:23},{v:24.6}] },
  { id: "alcoholes", label: "ALCOHOLES SUPERIORES (ppm)", value: 112.5, unit: "ppm", icon: "FlaskConical", lc: "LC: 120.0", status: "ok", spark: [{v:80},{v:100},{v:110},{v:112.5}] },
  { id: "conteo", label: "CONTEO CELULAR (x10^6 cel/mL)", value: 210, unit: "cel/mL", icon: "Droplets", lc: "LC: 200", status: "ok", spark: [{v:100},{v:150},{v:190},{v:210}] },
  { id: "viab", label: "VIABILIDAD (%)", value: 97.4, unit: "%", icon: "Percent", lc: "LC: 95.0%", status: "ok", spark: [{v:99},{v:98},{v:97.8},{v:97.4}] },
  { id: "ph", label: "pH ACTUAL", value: 4.52, unit: "", icon: "Activity", lc: "LC: 4.50 - 5.20", status: "ok", spark: [{v:5.1},{v:4.8},{v:4.6},{v:4.52}] },
  { id: "plato", label: "°P ACTUAL", value: 3.2, unit: "%", icon: "Gauge", lc: "LC: 2.5 - 4.0", status: "ok", spark: [{v:12},{v:8},{v:5},{v:3.2}] },
  { id: "temp", label: "TEMP. ACTUAL (°C)", value: 11.8, unit: "°C", icon: "Thermometer", lc: "LC: 11.0 - 13.0", status: "ok", spark: [{v:12},{v:12.5},{v:12},{v:11.8}] }
]

export function KineticsKpiGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {kpisCinetica.map((kpiData) => (
        <KpiCard key={kpiData.id} kpi={kpiData as any} />
      ))}
    </div>
  )
}
