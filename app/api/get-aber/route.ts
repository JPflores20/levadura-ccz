import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, getDoc } from "firebase/firestore"
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DB_FILE = path.join(process.cwd(), 'database_aber.json')

export async function GET() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(fileData))
    }
    
    // Fallback Firebase
    const docRef = doc(firestoreDatabase, "dashboards", "aber_stats")
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data())
    }
    
    return NextResponse.json({ rawData: [] })
  } catch (error) {
    return NextResponse.json({ rawData: [] })
  }
}
