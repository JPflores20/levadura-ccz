import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, setDoc } from "firebase/firestore"
import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'database_aber.json')

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
    const rawData = await request.json()

    if (!rawData || !Array.isArray(rawData)) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400, headers: corsHeaders })
    }

    const finalData = {
      ultimaActualizacion: new Date().toISOString(),
      rawData: rawData
    }

    try {
      const docRef = doc(firestoreDatabase, "dashboards", "aber_stats")
      await setDoc(docRef, finalData)
    } catch (firebaseError) {
      console.error("Fallo al enviar a Firebase (ABER):", firebaseError)
    }

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(finalData, null, 2))
    } catch (fsError) {
      console.error("Fallo al guardar archivo local (ABER):", fsError)
    }

    return NextResponse.json({ success: true, message: "Datos de ABER procesados" }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error general en sync-aber:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: corsHeaders })
  }
}
