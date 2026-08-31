"use client"

import { ExpandableCard } from "@/components/dashboard/expandable-card"
import { MetricScatterChart } from "@/components/charts/metric-scatter-chart"
import { scatterData } from "@/lib/mock-data"

export function CorrelationScatterGrid({ dynamicData }: { dynamicData?: any[] }) {
  const data = dynamicData || scatterData;

  return (
    <ExpandableCard 
      title="Correlación: Variables Críticas vs Conteo Celular"
      className="h-full"
      contentClassName="flex-1 flex flex-col min-h-0"
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 w-full relative min-h-0">
        <div className="min-h-0 w-full relative"><MetricScatterChart chartId="scat-plato-conteo" title="Conteo Celular vs °P en Mosto" data={data} xDataKey="plato" yDataKey="conteo" yDomain={[0, 150]} /></div>
        <div className="min-h-0 w-full relative"><MetricScatterChart chartId="scat-viab-conteo" title="Conteo Celular vs Viabilidad (%)" data={data} xDataKey="viabilidad" yDataKey="conteo" yDomain={[0, 150]} /></div>
        <div className="min-h-0 w-full relative"><MetricScatterChart chartId="scat-temp-conteo" title="Conteo Celular vs Temperatura (°C)" data={data} xDataKey="temp" yDataKey="conteo" yDomain={[0, 150]} /></div>
        <div className="min-h-0 w-full relative"><MetricScatterChart chartId="scat-vig-conteo" title="Conteo Celular vs Vitalidad (%)" data={data} xDataKey="vigorosas" yDataKey="conteo" yDomain={[0, 150]} /></div>
      </div>
    </ExpandableCard>
  )
}
