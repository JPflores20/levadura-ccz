"use client"

/**
 * @fileoverview Informe ejecutivo de capacidad del proceso de propagación con gráfica de dona y conclusiones.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { conclusiones as conclusiones_simuladas } from "@/lib/mock_data"
import { tooltipStyle as estilo_tooltip, CHART_COLORS as COLORES_GRAFICAS } from "@/lib/chart_config"

/**
 * Propiedades del informe ejecutivo de propagación.
 */
export interface PropiedadesInformeEjecutivo {
  stats?: any[]
}

/**
 * Renderiza el resumen ejecutivo de capacidad del proceso (Excelentes, Capaces, No capaces y Cpk promedio).
 *
 * @param {PropiedadesInformeEjecutivo} propiedades - Arreglo de estadísticas de capacidad por indicador.
 * @returns {JSX.Element} Tarjeta con gráfica circular, velocímetro Cpk y lista de conclusiones.
 */
export function ExecutiveReport({ stats: estadisticas_indicadores }: PropiedadesInformeEjecutivo) {
  let cantidad_excelentes = 2
  let cantidad_capaces = 2
  let cantidad_no_capaces = 1
  let promedio_cpk_general = 1.17
  let lista_conclusiones = conclusiones_simuladas

  if (estadisticas_indicadores && estadisticas_indicadores.length > 0) {
    cantidad_excelentes = estadisticas_indicadores.filter(
      (indicador) => indicador.evaluationStatus === "green"
    ).length
    cantidad_capaces = estadisticas_indicadores.filter(
      (indicador) => indicador.evaluationStatus === "yellow"
    ).length
    cantidad_no_capaces = estadisticas_indicadores.filter(
      (indicador) => indicador.evaluationStatus === "red"
    ).length
    promedio_cpk_general =
      estadisticas_indicadores.reduce(
        (acumulado_cpk, indicador) => acumulado_cpk + (indicador.cpk || 0),
        0
      ) / estadisticas_indicadores.length

    lista_conclusiones = [
      { texto: `Promedio Cpk general: ${promedio_cpk_general.toFixed(2)}`, tipo: "ok" },
      { texto: `${cantidad_excelentes} indicadores están en nivel excelente (Verde).`, tipo: "ok" },
      { texto: `${cantidad_capaces} indicadores están capaces (Amarillo).`, tipo: "warn" },
      { texto: `${cantidad_no_capaces} indicadores fuera de control (Rojo).`, tipo: "warn" },
      { texto: "Datos sincronizados desde reporte Excel AB-InBev.", tipo: "ok" }
    ]
  }

  const total_indicadores_evaluados =
    cantidad_excelentes + cantidad_capaces + cantidad_no_capaces || 5

  const datos_distribucion_capacidad = [
    { name: "Excelentes", value: cantidad_excelentes, color: COLORES_GRAFICAS.green },
    { name: "Capaces", value: cantidad_capaces, color: COLORES_GRAFICAS.yellow },
    { name: "No capaces", value: cantidad_no_capaces, color: COLORES_GRAFICAS.red }
  ]

  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold tracking-wide text-yellow-500 uppercase">
          Informe de Capacidad – Resumen Ejecutivo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-4 h-24">
          <div className="h-full w-24 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos_distribucion_capacidad}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip {...estilo_tooltip} formatter={(valor_porcentaje: any) => `${Number(valor_porcentaje ?? 0)}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-1">
              <span className="text-xl font-bold text-white">{total_indicadores_evaluados}</span>
              <span className="text-[7px] text-zinc-500 leading-none text-center">
                Indicadores
                <br />
                Evaluados
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {datos_distribucion_capacidad.map((categoria_capacidad) => (
              <div
                key={categoria_capacidad.name}
                className="flex items-center justify-between text-[10px]"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: categoria_capacidad.color }}
                  />
                  <span className="text-zinc-300">{categoria_capacidad.name}</span>
                </div>
                <div className="flex gap-2 text-zinc-400">
                  <span>{categoria_capacidad.value}</span>
                  <span className="w-8 text-right">
                    (
                    {total_indicadores_evaluados > 0
                      ? Math.round((categoria_capacidad.value / total_indicadores_evaluados) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-16 flex flex-col items-center justify-center border-l border-zinc-800/50 pl-2">
            <div className="relative size-12 mb-1">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="4"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="4"
                  strokeDasharray={`${Math.min((promedio_cpk_general / 1.5) * 100, 100)}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: `rotate(${(promedio_cpk_general / 1.5) * 180 - 90}deg)` }}
                >
                  <polygon points="12 2 15 12 12 22 9 12 12 2" />
                </svg>
              </div>
            </div>
            <span className="text-[8px] text-yellow-500 uppercase font-semibold text-center leading-tight">
              Promedio Cpk
            </span>
            <span className="text-sm text-yellow-500 font-bold">
              {promedio_cpk_general.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-auto border border-zinc-800 rounded p-2 bg-black/20">
          <span className="text-[9px] font-bold text-yellow-500 uppercase mb-1 block">
            CONCLUSIONES
          </span>
          <ul className="flex flex-col gap-1">
            {lista_conclusiones.map((registro_conclusion) => (
              <li
                key={registro_conclusion.texto}
                className="flex items-start gap-1.5 text-[9px] text-zinc-300"
              >
                <div
                  className={`mt-0.5 size-1.5 shrink-0 rounded-full ${
                    registro_conclusion.tipo === "ok" ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="leading-snug text-pretty">{registro_conclusion.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { ExecutiveReport as informe_ejecutivo_capacidad }
