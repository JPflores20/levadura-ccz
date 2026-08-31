"use client"

import { kineticsData, kineticsCellsData, kineticsFlavorData } from "@/lib/mock-data"
import { ComparisonLineChart } from "@/components/charts/comparison-line-chart"

export function ComparisonChartsGrid() {
  const comparisonData = kineticsData.map((kineticsPoint, index) => {
    const cellsPoint = kineticsCellsData[index]
    const flavorPoint = kineticsFlavorData[index]
    
    // Cultivo B es ligeramente peor/diferente
    const normalizedTime = index / (kineticsData.length - 1)
    
    return {
      hora: kineticsPoint.hora,
      // A
      platoA: kineticsPoint.plato,
      velA: 15 * Math.exp(-normalizedTime * 3) + (Math.sin(index * 10) * 0.5 + 0.5),
      tempA: kineticsPoint.temp,
      conteoA: cellsPoint.conteo,
      phA: kineticsPoint.ph,
      diacA: flavorPoint.diacetilo,
      
      // B
      platoB: Math.min(14, kineticsPoint.plato + normalizedTime * 2 + 0.5),
      velB: 12 * Math.exp(-normalizedTime * 2.5) + (Math.sin(index * 15) * 0.5 + 0.5),
      tempB: kineticsPoint.temp - 0.5 + (Math.sin(index * 20) * 0.25 + 0.25),
      conteoB: Math.max(0, cellsPoint.conteo * 0.85 + (Math.sin(index * 25) * 5)),
      phB: Math.min(5.5, kineticsPoint.ph + 0.15),
      diacB: flavorPoint.diacetilo * 1.3 + normalizedTime * 5
    }
  })

  const comparisonCharts = [
    { chartId: "comp-aten", title: "Atenuación (°P)", dataKeyA: "platoA", dataKeyB: "platoB" },
    { chartId: "comp-vel", title: "Velocidad de Fermentación", dataKeyA: "velA", dataKeyB: "velB" },
    { chartId: "comp-temp", title: "Temperatura (°C)", dataKeyA: "tempA", dataKeyB: "tempB", yDomain: [8, 16] },
    { chartId: "comp-conteo", title: "Conteo Celular (x10^6/mL)", dataKeyA: "conteoA", dataKeyB: "conteoB" },
    { chartId: "comp-ph", title: "Evolución del pH", dataKeyA: "phA", dataKeyB: "phB", yDomain: [3.5, 5.5] },
    { chartId: "comp-sabor", title: "Perfil de Sabores (Diacetilo)", dataKeyA: "diacA", dataKeyB: "diacB" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {comparisonCharts.map((chartConf) => (
        <ComparisonLineChart
          key={chartConf.chartId}
          chartId={chartConf.chartId}
          title={chartConf.title}
          data={comparisonData}
          dataKeyA={chartConf.dataKeyA}
          dataKeyB={chartConf.dataKeyB}
          nameA="Cultivo A"
          nameB="Cultivo B"
          yDomain={chartConf.yDomain as [number, number] | undefined}
        />
      ))}
    </div>
  )
}
