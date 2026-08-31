"use client"

import { ExpandableCard } from "@/components/dashboard/expandable-card"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { propagationData } from "@/lib/mock-data"
import { tooltipStyle, axisProps } from "@/lib/chart-config"
import { useState, useEffect } from "react"
import { firestoreDatabase } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

export function CellCountChart({ dynamicData }: { dynamicData?: any[] }) {
  const data = dynamicData || propagationData;
  const [usl, setUsl] = useState(260)
  const [lc, setLc] = useState(200)
  const [lsl, setLsl] = useState(140)

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const docRef = doc(firestoreDatabase, "dashboards", "cellCountLimits")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.usl !== undefined) setUsl(Number(data.usl))
          if (data.lc !== undefined) setLc(Number(data.lc))
          if (data.lsl !== undefined) setLsl(Number(data.lsl))
        } else {
          // Fallback
          const savedUsl = localStorage.getItem("cell-count-usl")
          if (savedUsl) setUsl(Number(savedUsl))
        }
      } catch (error) {
        console.error("Firebase read error", error)
      }
    }
    fetchLimits()
  }, [])

  const handleSaveToFirebase = async () => {
    // También guardamos localmente como respaldo instantáneo
    localStorage.setItem("cell-count-usl", usl.toString())
    localStorage.setItem("cell-count-lc", lc.toString())
    localStorage.setItem("cell-count-lsl", lsl.toString())

    try {
      const docRef = doc(firestoreDatabase, "dashboards", "cellCountLimits")
      await setDoc(docRef, { usl, lc, lsl })
      console.log("Límites guardados en Firebase")
    } catch (error) {
      console.error("Error guardando en Firebase:", error)
    }
  }

  return (
    <ExpandableCard 
      title="Tendencia del Conteo Celular"
      headerAction={
        <div className="flex justify-end gap-3 px-2 text-[10px]">
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">USL:</label>
            <input 
              type="number" 
              value={usl}
              onChange={(e) => setUsl(Number(e.target.value))}
              onBlur={handleSaveToFirebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">LC:</label>
            <input 
              type="number" 
              value={lc}
              onChange={(e) => setLc(Number(e.target.value))}
              onBlur={handleSaveToFirebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-zinc-400">LSL:</label>
            <input 
              type="number" 
              value={lsl}
              onChange={(e) => setLsl(Number(e.target.value))}
              onBlur={handleSaveToFirebase}
              className="w-12 bg-black border border-zinc-700 rounded px-1 py-0.5 text-zinc-200 text-center"
            />
          </div>
        </div>
      }
    >
      <div className="h-[220px] w-full relative shrink-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart id="prop-count" data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hora" {...axisProps} />
            <YAxis {...axisProps} domain={['auto', 'auto']} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={usl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `USL: ${usl}`, fill: "#ef4444", fontSize: 9, position: "insideTopRight" }} />
            <ReferenceLine y={lc} stroke="#eab308" strokeDasharray="4 4" label={{ value: `LC: ${lc}`, fill: "#eab308", fontSize: 9, position: "insideBottomRight" }} />
            <ReferenceLine y={lsl} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `LSL: ${lsl}`, fill: "#ef4444", fontSize: 9, position: "insideBottomRight" }} />
            <Line type="monotone" dataKey="conteo" name="Conteo M/mL" stroke="#eab308" strokeWidth={2} dot={{fill: "#eab308", strokeWidth: 0, r: 2}} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ExpandableCard>
  )
}
