"use client"

/**
 * @fileoverview Conjunto de las 6 gráficas del tablero de Auditoría de Abbers:
 * - 4 gráficas independientes de correlación (Sólidos L1, Sólidos L2, Conteos L1, Conteos L2).
 * - 2 gráficas inferiores de tendencia de error a través del tiempo (Error de Sólidos y Error de Conteos).
 */

import { ExpandableCard } from "@/components/dashboard/expandable_card"
import {
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ZAxis
} from "recharts"
import {
  CHART_COLORS as COLORES_GRAFICAS,
  axisProps as propiedades_ejes,
  tooltipStyle as estilo_tooltip
} from "@/lib/chart_config"

function TooltipCorrelacionAber({ active, payload, modo }: any) {
  if (!active || !payload?.length) return null
  const punto = payload[0].payload
  const es_solidos = modo === "solidos"
  const valor_x = es_solidos ? punto.solidosReales : punto.conteoAber
  const valor_y = es_solidos ? punto.solidosVivosLab : punto.conteoLac
  const error_neto = es_solidos ? punto.errorSolidos : punto.diferencia
  const sufijo = es_solidos ? "%" : ""
  return (
    <div style={estilo_tooltip.contentStyle} className="p-2 border border-yellow-500/50 bg-black">
      <p className="font-bold text-yellow-500 mb-1">{punto.linea} ({punto.fecha})</p>
      <p className="text-xs">
        {es_solidos ? "Sólidos Reales" : "Conteo Abber"}: <span className="text-white">{valor_x?.toFixed(2)}{sufijo}</span>
      </p>
      <p className="text-xs">
        {es_solidos ? "Sólidos Vivos Lab" : "Conteo Laboratorio"}: <span className="text-white">{valor_y?.toFixed(2)}{sufijo}</span>
      </p>
      <p className="text-xs mt-1 pt-1 border-t border-zinc-700">
        Error: <span className={(error_neto ?? 0) > 0 ? "text-red-400" : "text-green-400"}>{error_neto?.toFixed(2)}{sufijo}</span>
      </p>
    </div>
  )
}

interface PropiedadesTarjetaCorrelacion {
  titulo: string
  subtitulo: string
  seriePuntos: any[]
  lineaIdeal: any[]
  llaveEjeX: string
  llaveEjeY: string
  etiquetaEjeX: string
  etiquetaEjeY: string
  nombreSerie: string
  colorPuntos: string
  modoTooltip: "solidos" | "conteos"
  margenDominio: string
}

function TarjetaCorrelacionIndividual(props: PropiedadesTarjetaCorrelacion) {
  return (
    <ExpandableCard title={props.titulo}>
      <div className="text-xs text-zinc-400 mb-2 italic">{props.subtitulo}</div>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} />
          <XAxis
            type="number" dataKey={props.llaveEjeX} name={props.etiquetaEjeX} {...propiedades_ejes}
            label={{ value: props.etiquetaEjeX, position: "insideBottom", offset: -10, fill: "#888" }}
            domain={[0, props.margenDominio]}
          />
          <YAxis
            type="number" dataKey={props.llaveEjeY} name={props.etiquetaEjeY} {...propiedades_ejes}
            label={{ value: props.etiquetaEjeY, angle: -90, position: "insideLeft", fill: "#888" }}
            domain={[0, props.margenDominio]}
          />
          <ZAxis type="number" range={[45, 45]} />
          <Tooltip content={<TooltipCorrelacionAber modo={props.modoTooltip} />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Line data={props.lineaIdeal} dataKey={props.llaveEjeY} stroke="#eab308" strokeDasharray="5 5" dot={false} activeDot={false} legendType="none" />
          <Scatter name={props.nombreSerie} data={props.seriePuntos} fill={props.colorPuntos} opacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
    </ExpandableCard>
  )
}

export interface PropiedadesGraficasValidacionAber {
  correlationLinea1: any[]
  correlationLinea2: any[]
  correlationSolidosL1: any[]
  correlationSolidosL2: any[]
  idealLine: any[]
  idealSolidosLine: any[]
  diffOverTimeData: any[]
}

/**
 * Renderiza las 4 gráficas de correlación independientes y las 2 gráficas inferiores de tendencia de error.
 */
export function AberValidationCharts({
  correlationLinea1: correlacion_conteos_l1,
  correlationLinea2: correlacion_conteos_l2,
  correlationSolidosL1: correlacion_solidos_l1,
  correlationSolidosL2: correlacion_solidos_l2,
  idealLine: linea_ideal_conteos,
  idealSolidosLine: linea_ideal_solidos,
  diffOverTimeData: datos_desviacion_tiempo
}: PropiedadesGraficasValidacionAber) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TarjetaCorrelacionIndividual
          titulo="Correlación de Sólidos — Línea 1" subtitulo="Sólidos reales vs. sólidos vivos de laboratorio (Línea 1)."
          seriePuntos={correlacion_solidos_l1} lineaIdeal={linea_ideal_solidos} llaveEjeX="solidosReales" llaveEjeY="solidosVivosLab"
          etiquetaEjeX="Sólidos Reales (%)" etiquetaEjeY="Sólidos Vivos Lab (%)" nombreSerie="Sólidos Línea 1"
          colorPuntos="#10b981" modoTooltip="solidos" margenDominio="dataMax + 10"
        />
        <TarjetaCorrelacionIndividual
          titulo="Correlación de Sólidos — Línea 2" subtitulo="Sólidos reales vs. sólidos vivos de laboratorio (Línea 2)."
          seriePuntos={correlacion_solidos_l2} lineaIdeal={linea_ideal_solidos} llaveEjeX="solidosReales" llaveEjeY="solidosVivosLab"
          etiquetaEjeX="Sólidos Reales (%)" etiquetaEjeY="Sólidos Vivos Lab (%)" nombreSerie="Sólidos Línea 2"
          colorPuntos="#f59e0b" modoTooltip="solidos" margenDominio="dataMax + 10"
        />
        <TarjetaCorrelacionIndividual
          titulo="Correlación de Conteos — Línea 1" subtitulo="Conteos de laboratorio vs. conteos Aber (Línea 1)."
          seriePuntos={correlacion_conteos_l1} lineaIdeal={linea_ideal_conteos} llaveEjeX="conteoAber" llaveEjeY="conteoLac"
          etiquetaEjeX="Conteo Aber" etiquetaEjeY="Conteo Laboratorio" nombreSerie="Conteos Línea 1"
          colorPuntos="#3b82f6" modoTooltip="conteos" margenDominio="dataMax + 200"
        />
        <TarjetaCorrelacionIndividual
          titulo="Correlación de Conteos — Línea 2" subtitulo="Conteos de laboratorio vs. conteos Aber (Línea 2)."
          seriePuntos={correlacion_conteos_l2} lineaIdeal={linea_ideal_conteos} llaveEjeX="conteoAber" llaveEjeY="conteoLac"
          etiquetaEjeX="Conteo Aber" etiquetaEjeY="Conteo Laboratorio" nombreSerie="Conteos Línea 2"
          colorPuntos="#ef4444" modoTooltip="conteos" margenDominio="dataMax + 200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpandableCard title="Tendencia de Error en Sólidos a través del Tiempo">
          <div className="text-xs text-zinc-400 mb-2 italic">
            Comportamiento temporal del error entre sólidos reales y sólidos vivos de laboratorio (%).
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={datos_desviacion_tiempo} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
              <XAxis dataKey="fecha" {...propiedades_ejes} />
              <YAxis {...propiedades_ejes} />
              <ReferenceLine y={0} stroke="#eab308" strokeDasharray="3 3" />
              <Tooltip contentStyle={estilo_tooltip.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" dataKey="errorSolidosL1" name="Error Sólidos L1 (%)" stroke="#10b981" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="errorSolidosL2" name="Error Sólidos L2 (%)" stroke="#f59e0b" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>

        <ExpandableCard title="Tendencia de Error en Conteos a través del Tiempo">
          <div className="text-xs text-zinc-400 mb-2 italic">
            Comportamiento temporal del error entre conteo Aber y conteo de laboratorio.
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={datos_desviacion_tiempo} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICAS.grid} vertical={false} />
              <XAxis dataKey="fecha" {...propiedades_ejes} />
              <YAxis {...propiedades_ejes} />
              <ReferenceLine y={0} stroke="#eab308" strokeDasharray="3 3" />
              <Tooltip contentStyle={estilo_tooltip.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" dataKey="diffL1" name="Error Conteos L1" stroke="#3b82f6" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="diffL2" name="Error Conteos L2" stroke="#ef4444" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableCard>
      </div>
    </div>
  )
}

export { AberValidationCharts as graficas_validacion_aber }
