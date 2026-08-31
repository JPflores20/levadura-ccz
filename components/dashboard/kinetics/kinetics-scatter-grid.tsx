"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { kineticsScatterData } from "@/lib/mock-data"
import { MetricScatterChart } from "@/components/charts/metric-scatter-chart"

export function KineticsScatterGrid() {
  return (
    <Card className="lg:col-span-4 border-yellow-500/40 bg-[#121212] text-white flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-[10px] font-semibold tracking-wide text-yellow-500 uppercase">
          Diagrama de Dispersión – Variables vs Sabores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-[400px] md:h-44">
          <MetricScatterChart 
            chartId="cin-sc-1" 
            title="Diacetilo vs pH" 
            data={kineticsScatterData} 
            xDataKey="ph" 
            yDataKey="diacetilo" 
            color="#22c55e" 
            titleFontSize={8} 
            tickFontSize={7} 
          />
          <MetricScatterChart 
            chartId="cin-sc-2" 
            title="Esteres vs °P" 
            data={kineticsScatterData} 
            xDataKey="plato" 
            yDataKey="esteres" 
            color="#eab308" 
            titleFontSize={8} 
            tickFontSize={7} 
          />
          <MetricScatterChart 
            chartId="cin-sc-3" 
            title="Alcoholes vs Temp" 
            data={kineticsScatterData} 
            xDataKey="temp" 
            yDataKey="alcoholes" 
            color="#ef4444" 
            titleFontSize={8} 
            tickFontSize={7} 
          />
          <MetricScatterChart 
            chartId="cin-sc-4" 
            title="Diac. vs Conteo" 
            data={kineticsScatterData} 
            xDataKey="conteo" 
            yDataKey="diacetilo" 
            color="#22c55e" 
            titleFontSize={8} 
            tickFontSize={7} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
