"use client"

/**
 * @fileoverview Cuadrícula de gráficas comparativas simuladas entre Cultivo A y Cultivo B.
 */

import {
  kineticsData as datos_cinetica_base,
  kineticsCellsData as datos_celulas_cinetica,
  kineticsFlavorData as datos_sabores_cinetica
} from "@/lib/mock_data"
import { ComparisonLineChart } from "@/components/charts/comparison_line_chart"

/**
 * Renderiza una cuadrícula de 6 gráficas comparativas entre dos cultivos.
 *
 * @returns {JSX.Element} Cuadrícula de gráficas de líneas comparativas.
 */
export function ComparisonChartsGrid() {
  const datos_comparacion = datos_cinetica_base.map((punto_cinetica, indice_punto) => {
    const punto_celulas = datos_celulas_cinetica[indice_punto]
    const punto_sabores = datos_sabores_cinetica[indice_punto]
    const tiempo_normalizado = indice_punto / (datos_cinetica_base.length - 1)

    return {
      hora: punto_cinetica.hora,
      platoA: punto_cinetica.plato,
      velA: 15 * Math.exp(-tiempo_normalizado * 3) + (Math.sin(indice_punto * 10) * 0.5 + 0.5),
      tempA: punto_cinetica.temp,
      conteoA: punto_celulas.conteo,
      phA: punto_cinetica.ph,
      diacA: punto_sabores.diacetilo,
      platoB: Math.min(14, punto_cinetica.plato + tiempo_normalizado * 2 + 0.5),
      velB: 12 * Math.exp(-tiempo_normalizado * 2.5) + (Math.sin(indice_punto * 15) * 0.5 + 0.5),
      tempB: punto_cinetica.temp - 0.5 + (Math.sin(indice_punto * 20) * 0.25 + 0.25),
      conteoB: Math.max(0, punto_celulas.conteo * 0.85 + Math.sin(indice_punto * 25) * 5),
      phB: Math.min(5.5, punto_cinetica.ph + 0.15),
      diacB: punto_sabores.diacetilo * 1.3 + tiempo_normalizado * 5
    }
  })

  const configuraciones_graficas = [
    { chartId: "comp-aten", title: "Atenuación (°P)", dataKeyA: "platoA", dataKeyB: "platoB" },
    { chartId: "comp-vel", title: "Velocidad de Fermentación", dataKeyA: "velA", dataKeyB: "velB" },
    {
      chartId: "comp-temp",
      title: "Temperatura (°C)",
      dataKeyA: "tempA",
      dataKeyB: "tempB",
      yDomain: [8, 16]
    },
    {
      chartId: "comp-conteo",
      title: "Conteo Celular (x10^6/mL)",
      dataKeyA: "conteoA",
      dataKeyB: "conteoB"
    },
    {
      chartId: "comp-ph",
      title: "Evolución del pH",
      dataKeyA: "phA",
      dataKeyB: "phB",
      yDomain: [3.5, 5.5]
    },
    {
      chartId: "comp-sabor",
      title: "Perfil de Sabores (Diacetilo)",
      dataKeyA: "diacA",
      dataKeyB: "diacB"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {configuraciones_graficas.map((configuracion_grafica) => (
        <ComparisonLineChart
          key={configuracion_grafica.chartId}
          chartId={configuracion_grafica.chartId}
          title={configuracion_grafica.title}
          data={datos_comparacion}
          dataKeyA={configuracion_grafica.dataKeyA}
          dataKeyB={configuracion_grafica.dataKeyB}
          nameA="Cultivo A"
          nameB="Cultivo B"
          yDomain={configuracion_grafica.yDomain as [number, number] | undefined}
        />
      ))}
    </div>
  )
}

export { ComparisonChartsGrid as cuadricula_graficas_comparacion }
