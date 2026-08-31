import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DB_FILE = path.join(process.cwd(), 'database.json')

export async function GET() {
  try {
    // 1. Intentar leer de Firebase primero (persistente en producción)
    if (firestoreDatabase) {
      try {
        const docRef = doc(firestoreDatabase, "dashboards", "propagacion_stats")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return NextResponse.json(docSnap.data())
        }
      } catch (fbError) {
        console.error("Error leyendo de Firebase:", fbError)
      }
    }

    // 2. Fallback a archivo local (para desarrollo)
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(data))
    }
    
    return NextResponse.json({ stats: null, rawData: null })
  } catch (error) {
    return NextResponse.json({ stats: null, rawData: null }, { status: 500 })
  }
}
