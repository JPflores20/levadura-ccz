"use client"

import React, { useState } from "react"
import useSWR from 'swr'
import { ExcelProcessorAber } from "./cultivo/excel-processor-aber"
import { ExpandableCard } from "./expandable-card"
import * as htmlToImage from 'html-to-image'
import { Camera } from 'lucide-react'
import { 
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis 
} from "recharts"
import { CHART_COLORS, axisProps, tooltipStyle } from "@/lib/chart-config"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ValidacionAberTab() {
  const { data: dbData } = useSWR('/api/get-aber', fetcher, { 
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000 
  })
  
  const rawData = dbData?.rawData || []

  // Normalizar datos para manejar tanto el formato viejo como el nuevo (directo del Excel)
  const normalizedData = rawData.map((d: any) => {
    // Helper para buscar múltiples keys
    const getNum = (keys: string[]) => {
      for(const k of keys) {
        if (d[k] !== undefined && d[k] !== null && d[k] !== "") {
          const val = parseFloat(d[k])
          if (!isNaN(val)) return val;
        }
      }
      return null;
    }

    const linea = String(d.linea || d.Linea || d["LINEA"] || d["LINEA "] || "N/A").trim()
    const fecha = String(d.fecha || d.Fecha || d["FECHA "] || d["FECHA"] || "N/A").trim()
    const conteoAber = getNum(["conteoAber", "Aber", "CONTEO ABER B.F", "CONTEO EN EL ABER", "CONTEO ABER"])
    const conteoLac = getNum(["conteoLacAvg", "conteoLac", "ConteoLac", "PROMEDIO DE CONTEO LAC", "PROMEDIO DE CONTEO LAC "])
    const diferencia = getNum(["diferencia", "Diferencia", "DIFERENCIA ", "DIFERENCIA"])
    const solidosAvg = getNum(["solidosAvg", "solidos", "Solidos", "% Solidos", "PROMEDIO DE % SOLIDOS", "PROMEDIO DE % SOLIDOS "])

    return {
      linea,
      fecha,
      conteoAber,
      conteoLac,
      diferencia,
      solidosAvg
    }
  }).filter((d: any) => d.conteoAber !== null && d.conteoLac !== null)

  const correlationData = normalizedData

  // Filtramos por línea
  const correlationLinea1 = correlationData.filter((d: any) => String(d.linea).includes("1"))
  const correlationLinea2 = correlationData.filter((d: any) => String(d.linea).includes("2"))

  // Line Chart Data for Diferencia over time
  // Agrupar por fecha
  const fechasUnicas = Array.from(new Set(normalizedData.map((d: any) => d.fecha))) as string[]
  const diffOverTimeData = fechasUnicas.map(f => {
    const l1 = normalizedData.find((d: any) => d.fecha === f && String(d.linea).includes("1"))
    const l2 = normalizedData.find((d: any) => d.fecha === f && String(d.linea).includes("2"))
    return {
      fecha: f,
      diffL1: l1 ? l1.diferencia : null,
      diffL2: l2 ? l2.diferencia : null,
      solidosL1: l1 ? l1.solidosAvg : null,
      solidosL2: l2 ? l2.solidosAvg : null
    }
  })

  // Ideal Line para Scatter Plot
  const maxVal = Math.max(
    ...correlationData.map((d: any) => Math.max(d.conteoAber || 0, d.conteoLac || 0)),
    0
  )
  
  const idealLine = [
    { conteoAber: 0, conteoLac: 0 },
    { conteoAber: maxVal, conteoLac: maxVal }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={tooltipStyle.contentStyle} className="p-2 border border-yellow-500/50 bg-black">
          <p className="font-bold text-yellow-500 mb-1">Línea {data.linea} ({data.fecha})</p>
          <p className="text-xs">ABER: <span className="text-white">{data.conteoAber?.toFixed(1)}</span></p>
          <p className="text-xs">LAC (Manual): <span className="text-white">{data.conteoLac?.toFixed(1)}</span></p>
          <p className="text-xs mt-1 pt-1 border-t border-zinc-700">
            Diferencia: <span className={data.diferencia > 0 ? 'text-red-400' : 'text-green-400'}>
              {data.diferencia?.toFixed(1)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleCapture = async () => {
    const element = document.getElementById('capture-validacion-aber');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Reporte-Sensores-ABER-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-[#0a0a0a] p-2 rounded-lg" id="capture-validacion-aber">
      {/* Header and Upload */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-3 relative">
        <button 
          onClick={handleCapture}
          className="absolute -top-3 right-4 flex items-center gap-1.5 bg-[#0a0a0a] hover:bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold z-10"
          title="Capturar pantalla"
        >
          <Camera size={12} />
          Captura
        </button>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-yellow-500 tracking-widest">VALIDACIÓN DE SENSORES ABER</h2>
          <p className="text-xs text-zinc-400">Comparativa Conteo Automatizado vs Siembra Microbiológica</p>
        </div>
        <ExcelProcessorAber />
      </div>

      {rawData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-400">Sube el archivo de Validación ABER para ver las métricas.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* SCATTER PLOT CORRELATION */}
            <ExpandableCard title="Correlación ABER vs Laboratorio">
              <div className="text-xs text-zinc-400 mb-2 italic">Una calibración perfecta debería mostrar todos los puntos sobre la línea diagonal dorada.</div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis type="number" dataKey="conteoAber" name="Conteo ABER" {...axisProps} label={{ value: 'Sensor ABER', position: 'insideBottom', offset: -10, fill: '#888' }} domain={[0, 'dataMax + 200']} />
                  <YAxis type="number" dataKey="conteoLac" name="Conteo LAC" {...axisProps} label={{ value: 'Laboratorio', angle: -90, position: 'insideLeft', fill: '#888' }} domain={[0, 'dataMax + 200']} />
                  <ZAxis type="number" range={[50, 50]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  
                  {/* Ideal Line */}
                  <Line data={idealLine} dataKey="conteoLac" stroke="#eab308" strokeDasharray="5 5" dot={false} activeDot={false} legendType="none" />
                  
                  <Scatter name="Línea 1" data={correlationLinea1} fill="#3b82f6" opacity={0.8} />
                  <Scatter name="Línea 2" data={correlationLinea2} fill="#ef4444" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </ExpandableCard>

            {/* ERROR TENDENCY */}
            <ExpandableCard title="Tendencia de Desviación (Diferencia)">
              <div className="text-xs text-zinc-400 mb-2 italic">Diferencia neta (ABER - LAC). Valores cercanos a cero indican precisión.</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diffOverTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="fecha" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle.contentStyle} cursor={{fill: 'transparent'}} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="diffL1" name="Error Línea 1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diffL2" name="Error Línea 2" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ExpandableCard>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-2">
            <ExpandableCard title="Impacto del Porcentaje de Sólidos en el Sensor">
              <div className="text-xs text-zinc-400 mb-2 italic">¿Un mayor % de sólidos genera mayor error en el sensor ABER?</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={diffOverTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="fecha" {...axisProps} />
                  <YAxis yAxisId="left" {...axisProps} label={{ value: 'Error', angle: -90, position: 'insideLeft', fill: '#888' }} />
                  <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: '% Sólidos', angle: 90, position: 'insideRight', fill: '#888' }} />
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  
                  <Line yAxisId="left" type="monotone" dataKey="diffL1" name="Error L1" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="solidosL1" name="% Sólidos L1" stroke="#93c5fd" strokeDasharray="3 3" />
                  
                  <Line yAxisId="left" type="monotone" dataKey="diffL2" name="Error L2" stroke="#ef4444" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="solidosL2" name="% Sólidos L2" stroke="#fca5a5" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </ExpandableCard>
          </div>
        </>
      )}
    </div>
  )
}