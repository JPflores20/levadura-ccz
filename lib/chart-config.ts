// Configuración compartida para todas las gráficas de Recharts

export const CHART_COLORS = {
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

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: CHART_COLORS.cardBackground,
    borderColor: CHART_COLORS.border,
    borderRadius: 8,
    fontSize: 12,
    color: "#fff"
  },
  labelStyle: { color: CHART_COLORS.yellow },
  itemStyle: { color: "#e4e4e7" },
}

export const axisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, fontSize: 10 },
  tickLine: false,
}

export const legendStyle = { fontSize: 10, color: CHART_COLORS.axis }

export const scatterMargin = { top: 5, right: 5, bottom: 10, left: -25 }
