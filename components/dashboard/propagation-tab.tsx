"use client"

import { CheckCircle2, AlertTriangle } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/dashboard/kpi-card"
import {
  capacidadData,
  composicionData,
  conclusiones,
  kpis,
  limits,
  processVars,
  propagationData,
} from "@/lib/mock-data"

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#18181b",
    borderColor: "#3f3f46",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#a1a1aa" },
  itemStyle: { color: "#e4e4e7" },
}

const axisProps = {
  stroke: "#52525b",
  tick: { fill: "#71717a", fontSize: 11 },
  tickLine: false,
}

export function PropagationTab() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Fila 1: KPIs */}
      {kpis.map((kpi) => (
        <div key={kpi.id} className="col-span-6 md:col-span-4 lg:col-span-2">
          <KpiCard kpi={kpi} />
        </div>
      ))}

      {/* Fila 2: Gráficos principales */}
      <Card className="col-span-12 border-yellow-600/30 bg-zinc-900 text-white lg:col-span-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Tendencia de Viabilidad y Células Vigorosas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={propagationData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="hora" {...axisProps} />
                <YAxis domain={[80, 100]} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
                <ReferenceLine y={limits.usl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "USL", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
                <ReferenceLine y={limits.lsl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "LSL", fill: "#ef4444", fontSize: 10, position: "insideBottomRight" }} />
                <Line type="monotone" dataKey="viabilidad" name="Viabilidad %" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="vigorosas" name="Vigorosas %" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12 border-yellow-600/30 bg-zinc-900 text-white lg:col-span-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Composición del Cultivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={composicionData} stackOffset="expand" margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="hora" {...axisProps} />
                <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} {...axisProps} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
                <Bar dataKey="vitales" name="Vitales" stackId="a" fill="#15803d" />
                <Bar dataKey="moderadas" name="Moderadas" stackId="a" fill="#65a30d" />
                <Bar dataKey="estresadas" name="Estresadas" stackId="a" fill="#ea580c" />
                <Bar dataKey="muertas" name="Muertas" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fila 3: Análisis detallado */}
      <Card className="col-span-12 border-yellow-600/30 bg-zinc-900 text-white lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Tendencia del Conteo Celular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={propagationData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="hora" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="conteo" name="Conteo M/mL" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12 border-yellow-600/30 bg-zinc-900 text-white lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Variables del Proceso · Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Variable</TableHead>
                <TableHead className="text-right text-zinc-400">Prom.</TableHead>
                <TableHead className="text-right text-zinc-400">LC</TableHead>
                <TableHead className="text-right text-zinc-400">Mín</TableHead>
                <TableHead className="text-right text-zinc-400">Máx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processVars.map((v) => (
                <TableRow key={v.variable} className="border-zinc-800 hover:bg-zinc-800/40">
                  <TableCell className="font-medium text-zinc-200">{v.variable}</TableCell>
                  <TableCell className="text-right font-mono text-yellow-500">{v.promedio}</TableCell>
                  <TableCell className="text-right font-mono text-zinc-400">{v.lc}</TableCell>
                  <TableCell className="text-right font-mono text-zinc-400">{v.min}</TableCell>
                  <TableCell className="text-right font-mono text-zinc-400">{v.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="col-span-12 border-yellow-600/30 bg-zinc-900 text-white lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Informe de Capacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacidadData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={64}
                  paddingAngle={2}
                  stroke="#18181b"
                  isAnimationActive={false}
                >
                  {capacidadData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex flex-col gap-2">
            {conclusiones.map((c) => (
              <li key={c.texto} className="flex items-start gap-2 text-xs text-zinc-300">
                {c.tipo === "ok" ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                )}
                <span className="text-pretty">{c.texto}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
