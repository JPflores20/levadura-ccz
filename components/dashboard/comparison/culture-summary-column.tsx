"use client"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

type KpiItem = { label: string; value: string | number; unit: string; icon: any; status: string }


function KpiSimple({ kpiItem }: { kpiItem: KpiItem }) {
  const Icon = kpiItem.icon
  return (
    <Card className="border-yellow-500/40 bg-[#121212] py-2 px-3 text-white flex flex-col gap-1 justify-center">
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
        <Icon className="size-3 text-yellow-500" />
        <span className="truncate">{kpiItem.label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-lg font-bold tabular-nums ${kpiItem.status === 'ok' ? 'text-green-500' : 'text-yellow-500'}`}>
          {kpiItem.value}
        </span>
        <span className="text-[10px] text-zinc-500">{kpiItem.unit}</span>
      </div>
    </Card>
  )
}

function GaugeCard({ title, value, color, desc }: { title: string, value: number, color: string, desc: string }) {
  const pieData = [
    { name: "Value", value: value },
    { name: "Empty", value: 100 - value }
  ]
  return (
    <Card className="border-yellow-500/40 bg-[#121212] text-white flex flex-col items-center justify-center p-3 relative overflow-hidden">
      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide z-10">{title}</span>
      <div className="h-20 w-32 relative mt-2">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={40}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={color} />
              <Cell fill="#27272a" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
           <span className="text-xl font-bold font-mono" style={{color}}>{value}%</span>
        </div>
      </div>
      <span className="text-[9px] text-zinc-400 mt-1">{desc}</span>
    </Card>
  )
}

export function CultureSummaryColumn({
  cultureName,
  kpis,
  vitalityIndex,
  vitalityLabel,
  vitalityColor,
  attenuationEfficiency,
  attenuationLabel,
  attenuationColor,
  accentColor
}: {
  cultureName: string
  kpis: KpiItem[]
  vitalityIndex: number
  vitalityLabel: string
  vitalityColor: string
  attenuationEfficiency: number
  attenuationLabel: string
  attenuationColor: string
  accentColor: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-yellow-500/40 pb-2">
        <div className="size-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <h2 className="text-sm font-bold text-white tracking-widest">{cultureName}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kpis.map((kpiItem, index) => <KpiSimple key={index} kpiItem={kpiItem} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <GaugeCard title="Índice Vitalidad General" value={vitalityIndex} color={vitalityColor} desc={vitalityLabel} />
        <GaugeCard title="Eficiencia Atenuación" value={attenuationEfficiency} color={attenuationColor} desc={attenuationLabel} />
      </div>
    </div>
  )
}
