/**
 * @fileoverview Configuración visual compartida para las gráficas de Recharts del panel HMI.
 * Define paleta de colores institucionales, estilos de tooltips, ejes y márgenes estándar.
 */

/**
 * Paleta de colores empleada en las series y rejillas de visualización.
 */
export const colores_grafica = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  orange: "#f97316",
  cyan: "#0ea5e9",
  grid: "#27272a",
  axis: "#888888",
  cardBackground: "#121212",
  border: "#eab308",
}

/**
 * Estilo estandarizado para los cuadros emergentes (tooltips) de las gráficas.
 */
export const estilo_tooltip_grafica = {
  contentStyle: {
    backgroundColor: colores_grafica.cardBackground,
    borderColor: colores_grafica.border,
    borderRadius: 8,
    fontSize: 12,
    color: "#fff",
  },
  labelStyle: { color: colores_grafica.yellow },
  itemStyle: { color: "#e4e4e7" },
}

/**
 * Propiedades compartidas para los ejes X e Y de Recharts.
 */
export const propiedades_ejes_grafica = {
  stroke: colores_grafica.axis,
  tick: { fill: colores_grafica.axis, fontSize: 10 },
  tickLine: false,
}

/**
 * Estilo tipográfico para las leyendas inferiores de las gráficas.
 */
export const estilo_leyenda_grafica = {
  fontSize: 10,
  color: colores_grafica.axis,
}

/**
 * Márgenes compactos para los diagramas de dispersión (scatter plots).
 */
export const margen_dispersion_grafica = {
  top: 5,
  right: 5,
  bottom: 10,
  left: -25,
}

export {
  colores_grafica as CHART_COLORS,
  estilo_tooltip_grafica as tooltipStyle,
  propiedades_ejes_grafica as axisProps,
  estilo_leyenda_grafica as legendStyle,
  margen_dispersion_grafica as scatterMargin,
}
