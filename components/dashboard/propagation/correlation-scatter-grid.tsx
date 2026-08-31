"use client"

import { ExpandableCard } from "@/components/dashboard/expandable-card"
import { MetricScatterChart } from "@/components/charts/metric-scatter-chart"
import { scatterData } from "@/lib/mock-data"

export function CorrelationScatterGrid({ dynamicData }: { dynamicData?: any[] }) {
  const data = dynamicData || scatterData;

  return (
    <ExpandableCard title="Correlación: Variables Críticas vs % Células Vigorosas">
      <div className="grid grid-cols-2 gap-2 h-52 w-full relative shrink-0">
        <div className="h-24"><MetricScatterChart chartId="scat-plato" title="°P en Mosto vs % Vigorosas" data={data} xDataKey="plato" yDataKey="vigorosas" /></div>
        <div className="h-24"><MetricScatterChart chartId="scat-ph" title="pH vs % Vigorosas" data={data} xDataKey="ph" yDataKey="vigorosas" /></div>
        <div className="h-24"><MetricScatterChart chartId="scat-aire" title="Aireación vs % Vigorosas" data={data} xDataKey="aireacion" yDataKey="vigorosas" /></div>
        <div className="h-24"><MetricScatterChart chartId="scat-zn" title="Zn vs % Vigorosas" data={data} xDataKey="zn" yDataKey="vigorosas" /></div>
      </div>
    </ExpandableCard>
  )
}
