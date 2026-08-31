import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DB_FILE = path.join(process.cwd(), 'database.json')

export async function GET() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8')
      return NextResponse.json(JSON.parse(data))
    }
    return NextResponse.json({ stats: null, rawData: null })
  } catch (error) {
    return NextResponse.json({ stats: null, rawData: null }, { status: 500 })
  }
}
