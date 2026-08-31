import { NextResponse } from 'next/server'
import { firestoreDatabase } from '@/lib/firebase'
import { doc, getDoc } from "firebase/firestore"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const docRef = doc(firestoreDatabase, "dashboards", "kinetics_stats")
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data())
    }
    
    return NextResponse.json({ rawData: [] })
  } catch (error) {
    return NextResponse.json({ rawData: [] })
  }
}
