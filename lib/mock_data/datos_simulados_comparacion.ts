/**
 * @fileoverview Datos simulados de respaldo para el módulo de Comparación de Cultivos.
 */

export const indicadores_comparacion_cultivos = [
  { label: "Viabilidad Inicial", unit: "%", valA: 0, valB: 0, better: "A" },
  { label: "Conteo Máximo", unit: "M/mL", valA: 0, valB: 0, better: "A" },
  { label: "Atenuación Aparente", unit: "%", valA: 0, valB: 0, better: "A" },
  { label: "Tiempo Final", unit: "h", valA: 0, valB: 0, better: "A" },
  { label: "pH Final", unit: "", valA: 0, valB: 0, better: "A" },
  { label: "Velocidad Promedio", unit: "°P/d", valA: 0, valB: 0, better: "A" },
  { label: "Diacetilo Final", unit: "ppm", valA: 0, valB: 0, better: "A" },
  { label: "Esteres Totales", unit: "ppm", valA: 0, valB: 0, better: "A" },
]

export const resumen_comparacion_cultivos = [
  { parametro: "Cinética de Fermentación", ganador: "Cultivo A", diff: "+15% vel." },
  { parametro: "Rendimiento (Atenuación)", ganador: "Cultivo A", diff: "+2.3%" },
  { parametro: "Perfil Sensorial", ganador: "Cultivo A", diff: "Menor Diac." },
  { parametro: "Salud y Cosecha", ganador: "Cultivo B", diff: "+5% Viab. Fin" },
]

export const series_comparacion_simuladas = Array.from({ length: 29 }).map((_, indice_paso) => {
  const horas_transcurridas = indice_paso * 6
  const fraccion_tiempo = indice_paso / 28

  const plato_cultivo_a = 2.4 + 10.2 * Math.exp(-fraccion_tiempo * 4.0) + Math.sin(indice_paso * 12.1) * 0.05
  const plato_cultivo_b = 2.8 + 9.8 * Math.exp(-fraccion_tiempo * 3.2) + Math.sin(indice_paso * 13.1) * 0.05

  const velocidad_cultivo_a =
    Math.max(0, (10.2 * 4.0 * Math.exp(-fraccion_tiempo * 4.0)) / 4) + Math.sin(indice_paso * 14.1) * 0.1
  const velocidad_cultivo_b =
    Math.max(0, (9.8 * 3.2 * Math.exp(-fraccion_tiempo * 3.2)) / 4) + Math.sin(indice_paso * 15.1) * 0.1

  const ph_cultivo_a = 4.15 + 1.15 * Math.exp(-fraccion_tiempo * 3.0) + Math.sin(indice_paso * 16.1) * 0.025
  const ph_cultivo_b = 4.25 + 1.05 * Math.exp(-fraccion_tiempo * 2.5) + Math.sin(indice_paso * 17.1) * 0.025

  const diacetilo_cultivo_a =
    (fraccion_tiempo < 0.2 ? 0.05 + fraccion_tiempo * 0.5 : 0.15 - (fraccion_tiempo - 0.2) * 0.2) *
      (1 - fraccion_tiempo) +
    Math.sin(indice_paso * 18.1) * 0.005
  const diacetilo_cultivo_b =
    (fraccion_tiempo < 0.25 ? 0.05 + fraccion_tiempo * 0.6 : 0.2 - (fraccion_tiempo - 0.25) * 0.15) *
      (1 - fraccion_tiempo * 0.5) +
    Math.sin(indice_paso * 19.1) * 0.005

  return {
    hora: `${horas_transcurridas}h`,
    platoA: Number(plato_cultivo_a.toFixed(2)),
    platoB: Number(plato_cultivo_b.toFixed(2)),
    velA: Number(velocidad_cultivo_a.toFixed(2)),
    velB: Number(velocidad_cultivo_b.toFixed(2)),
    phA: Number(ph_cultivo_a.toFixed(2)),
    phB: Number(ph_cultivo_b.toFixed(2)),
    diacA: Math.max(0, Number(diacetilo_cultivo_a.toFixed(3))),
    diacB: Math.max(0, Number(diacetilo_cultivo_b.toFixed(3))),
  }
})
