import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, setDoc } from "firebase/firestore"
import { calculateMean, calculateStdDev, calculateCpCpk } from "@/lib/statistics"
import fs from 'fs'
import path from 'path'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { propagacion, cineticas } = await request.json()

    if (!propagacion || !cineticas) {
      return NextResponse.json({ error: "Faltan hojas en el payload" }, { status: 400, headers: corsHeaders })
    }

    // 1. PROCESAR PROPAGACION
    const statsPropagacion = procesarPropagacion(propagacion)
    const dataPropagacion = {
      ultimaActualizacion: new Date().toISOString(),
      stats: statsPropagacion,
      rawData: propagacion
    }
    await setDoc(doc(firestoreDatabase, "dashboards", "propagacion_stats"), dataPropagacion).catch(() => {})
    try { fs.writeFileSync(path.join(process.cwd(), 'database.json'), JSON.stringify(dataPropagacion, null, 2)) } catch(e){}

    // 2. PROCESAR CINETICAS
    const rawKineticData = procesarCineticas(cineticas)
    const dataCineticas = {
      ultimaActualizacion: new Date().toISOString(),
      rawData: cineticas,
      stats: rawKineticData
    }
    await setDoc(doc(firestoreDatabase, "dashboards", "kinetics_stats"), dataCineticas).catch(() => {})
    try { fs.writeFileSync(path.join(process.cwd(), 'database_kinetics.json'), JSON.stringify(dataCineticas, null, 2)) } catch(e){}

    return NextResponse.json({ success: true, message: "Todas las hojas procesadas" }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error en sync-all:", error)
    return NextResponse.json({ error: "Error procesando archivo general" }, { status: 500, headers: corsHeaders })
  }
}

function procesarPropagacion(data: any[]) {
    const viab: number[] = []; const ph: number[] = []; const conteo: number[] = []; const vigor: number[] = []; const plato: number[] = [];
    data.forEach((row: any) => {
      if (row.viab) viab.push(row.viab); if (row.ph) ph.push(row.ph); if (row.conteo) conteo.push(row.conteo);
      if (row.vigor) vigor.push(row.vigor); if (row.plato) plato.push(row.plato);
    })
    const calcStats = (vals: number[], targetUSL: number, targetLSL: number, id: string, name: string) => {
      if (vals.length === 0) return null
      const mean = calculateMean(vals); const stdDev = calculateStdDev(vals, mean) || 0.001
      const { cp, cpk, pp, ppk } = calculateCpCpk(vals, targetLSL, targetUSL, mean, stdDev)
      let status = "red"
      if (cpk >= 1.33) status = "green"
      else if (cpk >= 1.0) status = "yellow"
      return { id, indicatorName: name, media: Number(mean.toFixed(2)), standardDeviation: Number(stdDev.toFixed(2)), cp: Number(Math.max(0, cp).toFixed(2)), cpk: Number(Math.max(0, cpk).toFixed(2)), pp: Number(Math.max(0, pp).toFixed(2)), ppk: Number(Math.max(0, ppk).toFixed(2)), evaluationStatus: status }
    }
    return [
      calcStats(viab, 100, 95, "viab", "Viabilidad (%)"),
      calcStats(conteo, 260, 180, "conteo", "Conteo Celular (x10^6/mL)"),
      calcStats(vigor, 100, 88, "vig", "% Células Vigorosas"),
      calcStats(ph, 5.5, 4.0, "ph", "pH"),
      calcStats(plato, 16, 8, "plato", "°P en Mosto (Plato)")
    ].filter(Boolean)
}

function procesarCineticas(rows: any[]) {
    const groupedData: Record<string, any> = {}
    const compuestos = ["Acetaldehido", "Diacetilo", "Acetato de etilo", "Propanol", "Isobutaol", "Isobutanol", "Acetato de isoamilo", "Isoamil alcohol", "Alcohol isoamilico", "Alcoholes Superiores", "Esteres", "Ésteres"]

    rows.forEach(row => {
        // Case-insensitive key lookup
        const getVal = (keys: string[]) => {
            for (let k of Object.keys(row)) {
                if (keys.some(key => k.toLowerCase().includes(key.toLowerCase()))) return row[k];
            }
            return undefined;
        }

        const fecha = getVal(["Fecha"]) || "N/A"; 
        const cepa = getVal(["Marca", "cepa"]) || "N/A"; 
        const etapa = getVal(["Etapa"]) || "FERMENTACION";
        const vuelta = getVal(["Vuelta"]); 
        const propagacion = "N/A"
        
        if (!vuelta) return;
        
        compuestos.forEach(volatil => {
            const rowVal = getVal([volatil]);
            const val = parseFloat(rowVal)
            if (!isNaN(val)) {
                let volatilLimpio = volatil.toUpperCase().includes("DIACETILO") ? "DIACETILO" : volatil.toUpperCase()
                if (volatilLimpio.includes("ISOBUTA")) volatilLimpio = "ISOBUTANOL";
                if (volatilLimpio.includes("ISOAMIL")) volatilLimpio = "ISOAMILICO";
                if (volatilLimpio.includes("ESTERES") || volatilLimpio.includes("ÉSTERES")) volatilLimpio = "ESTERES";
                if (volatilLimpio.includes("ETILO")) volatilLimpio = "ETILO";
                if (volatilLimpio.includes("ALCOHOLES SUPERIORES")) volatilLimpio = "ALCOHOLES";

                const key = `${fecha}_${propagacion}_${cepa}_${volatilLimpio}_${etapa}`
                if (!groupedData[key]) groupedData[key] = { fecha, propagacion, cepa, volatil: volatilLimpio, etapa, vueltas: {} }
                groupedData[key].vueltas[vuelta.toString()] = val
            }
        })
    })
    return Object.values(groupedData)
}
