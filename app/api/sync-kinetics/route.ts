import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, setDoc } from "firebase/firestore"
import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'database_kinetics.json')

// CORS headers para permitir que Excel Web envíe peticiones
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

function procesarCineticas(rows: any[]) {
    const groupedData: Record<string, any> = {}
    const compuestos = ["Acetaldehido", "Diacetilo", "Acetato de etilo", "Propanol", "Isobutaol", "Isobutanol", "Acetato de isoamilo", "Isoamil alcohol", "Alcohol isoamilico", "Alcoholes Superiores", "Esteres", "Ésteres"]

    rows.forEach(row => {
        const getVal = (keys: string[]) => {
            for (let k of Object.keys(row)) {
                const kClean = k.toLowerCase().replace(/[\s\.]/g, '');
                if (keys.some(key => kClean.includes(key.toLowerCase().replace(/[\s\.]/g, '')))) return row[k];
            }
            return undefined;
        }

        const fecha = getVal(["Fecha"]) || "N/A"; 
        const cepa = getVal(["Marca", "cepa"]) || "N/A"; 
        const etapa = getVal(["Etapa"]) || "FERMENTACION";
        const vuelta = row["Dias"] !== undefined ? row["Dias"] : (row["Días"] !== undefined ? row["Días"] : row["Día"] !== undefined ? row["Día"] : undefined);
        const propagacion = "N/A";
        const tanque = getVal(["Tanque", "TCC", "Lote", "Item"]) || "N/A";
        
        if (vuelta === undefined || vuelta === null || vuelta === "") return;
        
        compuestos.forEach(volatil => {
            const rowVal = getVal([volatil]);
            const val = parseFloat(rowVal)
            if (!isNaN(val)) {
                let volatilLimpio = volatil.toUpperCase().includes("DIACETILO") ? "DIACETILO" : volatil.toUpperCase()
                if (volatilLimpio.includes("ISOBUTA")) volatilLimpio = "ISOBUTANOL";
                if (volatilLimpio.includes("ISOAMIL")) volatilLimpio = "ISOAMILICO";
                if (volatilLimpio.includes("ESTERES") || volatilLimpio.includes("ÉSTERES")) volatilLimpio = "ESTERES";
                if (volatilLimpio === "ACETATO DE ETILO" || volatilLimpio === "ETILO") volatilLimpio = "ETILO";
                if (volatilLimpio.includes("ALCOHOLES SUPERIORES")) volatilLimpio = "ALCOHOLES";

                const key = `${fecha}_${propagacion}_${cepa}_${tanque}_${volatilLimpio}_${etapa}`
                if (!groupedData[key]) groupedData[key] = { fecha, propagacion, cepa, tanque, volatil: volatilLimpio, etapa, vueltas: {} }
                groupedData[key].vueltas[vuelta.toString()] = val
            }
        })
    })
    return Object.values(groupedData)
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json()

    if (!rawData || !Array.isArray(rawData)) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400, headers: corsHeaders })
    }

    const finalData = {
      ultimaActualizacion: new Date().toISOString(),
      rawData: rawData,
      stats: procesarCineticas(rawData)
    }

    try {
      const docRef = doc(firestoreDatabase, "dashboards", "kinetics_stats")
      await setDoc(docRef, finalData)
    } catch (firebaseError) {
      console.error("Fallo al enviar a Firebase (Cinética):", firebaseError)
    }

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(finalData, null, 2))
    } catch (fsError) {
      console.error("Fallo al guardar archivo local (Cinética):", fsError)
    }

    return NextResponse.json({ success: true, message: "Datos de cinética procesados" }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error general en sync-kinetics:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: corsHeaders })
  }
}
