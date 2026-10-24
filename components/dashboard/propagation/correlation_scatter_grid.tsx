"use client"

/**
 * @fileoverview Cuadrícula de gráficas de dispersión para correlacionar variables críticas
 * (°P en Mosto, Viabilidad, Temperatura, Vitalidad) contra el Conteo Celular.
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
import { MetricScatterChart } from "@/components/charts/metric_scatter_chart"
import { scatterData as datos_dispersion_simulados } from "@/lib/mock_data"

/**
 * Propiedades de la cuadrícula de dispersión de propagación.
 */
export interface PropiedadesCuadriculaDispersionPropagacion {
  dynamicData?: any[]
}

/**
 * Renderiza la cuadrícula 2x2 de gráficas de dispersión con regresión lineal.
 *
 * @param {PropiedadesCuadriculaDispersionPropagacion} propiedades - Datos dinámicos de propagación.
 * @returns {JSX.Element} Tarjeta expandible con las 4 gráficas de dispersión.
 */
export function CorrelationScatterGrid({
  dynamicData: datos_dinamicos
}: PropiedadesCuadriculaDispersionPropagacion) {
  const datos_dispersion = datos_dinamicos || datos_dispersion_simulados

  return (
    <ExpandableCard
      title="Correlación: Variables Críticas vs Conteo Celular"
      className="h-full"
      contentClassName="flex-1 flex flex-col min-h-0"
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 w-full relative min-h-0">
        <div className="min-h-0 w-full relative">
          <MetricScatterChart
            chartId="scat-plato-conteo"
            title="Conteo Celular vs °P en Mosto"
            data={datos_dispersion}
            xDataKey="plato"
            yDataKey="conteo"
            yDomain={[0, 150]}
          />
        </div>
        <div className="min-h-0 w-full relative">
          <MetricScatterChart
            chartId="scat-viab-conteo"
            title="Conteo Celular vs Viabilidad (%)"
            data={datos_dispersion}
            xDataKey="viabilidad"
            yDataKey="conteo"
            yDomain={[0, 150]}
          />
        </div>
        <div className="min-h-0 w-full relative">
          <MetricScatterChart
            chartId="scat-temp-conteo"
            title="Conteo Celular vs Temperatura (°C)"
            data={datos_dispersion}
            xDataKey="temp"
            yDataKey="conteo"
            yDomain={[0, 150]}
          />
        </div>
        <div className="min-h-0 w-full relative">
          <MetricScatterChart
            chartId="scat-vig-conteo"
            title="Conteo Celular vs Vitalidad (%)"
            data={datos_dispersion}
            xDataKey="vigorosas"
            yDataKey="conteo"
            yDomain={[0, 150]}
          />
        </div>
      </div>
    </ExpandableCard>
  )
}

export { CorrelationScatterGrid as cuadricula_dispersion_correlacion }
