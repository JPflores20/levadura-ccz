"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { conclusiones as mockConclusiones } from "@/lib/mock-data"
import { tooltipStyle, CHART_COLORS } from "@/lib/chart-config"

export function ExecutiveReport({ stats }: { stats?: any[] }) {
  let capaces = 2;
  let marginales = 2;
  let noCapaces = 1;
  let cpkAvg = 1.17;
  let conclusiones = mockConclusiones;

  if (stats && stats.length > 0) {
    capaces = stats.filter(s => s.evaluationStatus === "green").length;
    marginales = stats.filter(s => s.evaluationStatus === "yellow").length;
    noCapaces = stats.filter(s => s.evaluationStatus === "red").length;
    cpkAvg = stats.reduce((a, b) => a + (b.cpk || 0), 0) / stats.length;
    
    conclusiones = [
      { texto: `Promedio Cpk general: ${cpkAvg.toFixed(2)}`, tipo: 'ok' },
      { texto: `${capaces} indicadores están en control óptimo (Verde).`, tipo: 'ok' },
      { texto: `${marginales} indicadores están marginales (Amarillo).`, tipo: 'warn' },
      { texto: `${noCapaces} indicadores fuera de control (Rojo).`, tipo: 'warn' },
      { texto: "Datos sincronizados desde reporte Excel AB-InBev.", tipo: 'ok' }
    ];
  }

  const total = capaces + marginales + noCapaces || 5;

  const dataCapacidad = [
    { name: "Capaces", value: capaces, color: CHART_COLORS.green },
    { name: "Marginales", value: marginales, color: CHART_COLORS.yellow },
    { name: "No capaces", value: noCapaces, color: CHART_COLORS.red },
  ];

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
                  data={dataCapacidad}
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
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-1">
               <span className="text-xl font-bold text-white">{total}</span>
               <span className="text-[7px] text-zinc-500 leading-none text-center">Indicadores<br/>Evaluados</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {dataCapacidad.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <div className="flex gap-2 text-zinc-400">
                  <span>{item.value}</span>
                  <span className="w-8 text-right">({total > 0 ? Math.round(item.value / total * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-16 flex flex-col items-center justify-center border-l border-zinc-800/50 pl-2">
            <div className="relative size-12 mb-1">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" strokeWidth="4" strokeDasharray={`${Math.min((cpkAvg / 1.5) * 100, 100)}, 100`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${(cpkAvg / 1.5) * 180 - 90}deg)` }}>
                  <polygon points="12 2 15 12 12 22 9 12 12 2" />
                </svg>
              </div>
            </div>
            <span className="text-[8px] text-yellow-500 uppercase font-semibold text-center leading-tight">Promedio Cpk</span>
            <span className="text-sm text-yellow-500 font-bold">{cpkAvg.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-auto border border-zinc-800 rounded p-2 bg-black/20">
          <span className="text-[9px] font-bold text-yellow-500 uppercase mb-1 block">CONCLUSIONES</span>
          <ul className="flex flex-col gap-1">
            {conclusiones.map((conclusion) => (
              <li key={conclusion.texto} className="flex items-start gap-1.5 text-[9px] text-zinc-300">
                <div className={`mt-0.5 size-1.5 shrink-0 rounded-full ${conclusion.tipo === 'ok' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="leading-snug text-pretty">{conclusion.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
