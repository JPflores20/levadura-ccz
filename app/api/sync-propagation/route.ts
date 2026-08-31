import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase' 
import { doc, setDoc } from "firebase/firestore"
import { calculateMean, calculateStdDev, calculateCpCpk } from "@/lib/statistics"
import fs from 'fs'
import path from 'path'

// Configuración de encabezados CORS permitidos desde cualquier origen
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
    const data = await request.json()
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: false, error: "Formato inválido" }, { status: 400, headers: corsHeaders })
    }

    console.log(`¡Datos recibidos desde Excel! ${data.length} filas procesadas.`)
    
    // Arrays para guardar los valores
    const conteo: number[] = []
    const viab: number[] = []
    const vigor: number[] = []
    const solidos: number[] = []
    const plato: number[] = []
    const temp: number[] = []

    // Extraer datos del payload enviado por el Excel
    data.forEach((row: any) => {
      if (row.conteo !== undefined && !isNaN(row.conteo)) conteo.push(row.conteo)
      if (row.viab !== undefined && !isNaN(row.viab)) viab.push(row.viab)
      if (row.vigor !== undefined && !isNaN(row.vigor)) vigor.push(row.vigor)
      if (row.solidos !== undefined && !isNaN(row.solidos)) solidos.push(row.solidos)
      if (row.plato !== undefined && !isNaN(row.plato)) plato.push(row.plato)
      if (row.temp !== undefined && !isNaN(row.temp)) temp.push(row.temp)
    })

    // Función auxiliar para calcular Media, Desviación, Cp y Cpk
    const calcStats = (vals: number[], targetUSL: number, targetLSL: number, id: string, name: string) => {
      if (vals.length === 0) return null
      const mean = calculateMean(vals)
      const stdDev = calculateStdDev(vals, mean) || 0.001
      
      const { cp, cpk, pp, ppk } = calculateCpCpk(vals, targetLSL, targetUSL, mean, stdDev)
      
      let status = "red"
      if (cpk >= 1.33) status = "green"
      else if (cpk >= 1.0) status = "yellow"

      return {
        id,
        indicatorName: name,
        media: Number(mean.toFixed(2)),
        standardDeviation: Number(stdDev.toFixed(2)),
        cp: Number(Math.max(0, cp).toFixed(2)),
        cpk: Number(Math.max(0, cpk).toFixed(2)),
        pp: Number(Math.max(0, pp).toFixed(2)), 
        ppk: Number(Math.max(0, ppk).toFixed(2)),
        evaluationStatus: status
      }
    }

    // Calcular estadísticas en el orden exacto solicitado
    const results = [
      calcStats(conteo, 260, 180, "conteo", "Conteo Celular (x10^6/mL)"),
      calcStats(viab, 100, 95, "viab", "Viabilidad (%)"),
      calcStats(vigor, 100, 88, "vig", "Vitalidad (%)"),
      calcStats(solidos, 18, 10, "solidos", "Porcentaje de Sólidos (%)"),
      calcStats(plato, 16, 8, "plato", "°P en Mosto"),
      calcStats(temp, 22, 18, "temp", "Temperatura del Tanque (°C)")
    ].filter(Boolean)

    // Guardar localmente en database.json para evitar errores de Firebase
    const DB_FILE = path.join(process.cwd(), 'database.json')
    const finalData = {
      stats: results,
      rawData: data,
      ultimaActualizacion: new Date().toISOString()
    }
    
    // Guardar en Firebase Firestore
    try {
      const docRef = doc(firestoreDatabase, "dashboards", "propagacion_stats")
      await setDoc(docRef, finalData)
      console.log("¡Datos guardados exitosamente en Firebase!")
    } catch (firebaseError) {
      console.error("Fallo al enviar a Firebase (Revisa tus Reglas de Seguridad en la consola):", firebaseError)
    }

    // Guardar localmente como respaldo
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(finalData, null, 2))
    } catch (fsError) {}

    return NextResponse.json({ success: true, stats: results, rawData: data, message: "Datos procesados y guardados en BD" }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error al procesar/guardar datos:", error)
    return NextResponse.json({ success: false, error: "Error procesando datos" }, { status: 500, headers: corsHeaders })
  }
}
