"use client"
import React, { useRef, useState } from "react"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { formatExcelDate } from "@/lib/utils"

interface ExcelProcessorProps {
  onDataProcessed: (stats: any[], rawData?: any[]) => void
}

export function ExcelProcessor({ onDataProcessed }: ExcelProcessorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Leer de Excel (Subir al dashboard)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: "binary" })
        
        // Asumimos que la data est en la hoja "Propagacion_Levadura" o la hoja 3 (index 2)
        const sheetName = workbook.SheetNames.includes("Propagacion_Levadura") 
          ? "Propagacion_Levadura" 
          : workbook.SheetNames[2] || workbook.SheetNames[0]
          
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][]
        
        // Aqu procesaremos las columnas para calcular medias, Cp, Cpk...
        // Por ahora pasamos la data cruda para procesar arriba o lo hacemos aqu.
        processExcelData(data)
      } catch (error) {
        console.error("Error procesando Excel:", error)
      } finally {
        setIsProcessing(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsBinaryString(file)
  }

  const processExcelData = async (rows: any[][]) => {
    let headerRowIndex = -1
    for (let i = 0; i < 10; i++) {
      if (rows[i] && rows[i].includes("Viabilidad")) {
        headerRowIndex = i
        break
      }
    }

    if (headerRowIndex === -1) {
      alert("No se encontró el formato esperado en el Excel (Falta columna Viabilidad)")
      return
    }

    const headers = rows[headerRowIndex]
    const dataRows = rows.slice(headerRowIndex + 1)

    // Índices de columnas (Ajustar dinámicamente según cabeceras)
    const idxPlato = headers.findIndex((h: string) => h && h.toString().trim() === "°P")
    const idxPh = headers.findIndex((h: string) => h && h.toString().trim() === "pH.")
    const idxConteo = headers.findIndex((h: string) => h && h.toString().trim() === "Conteo de Celulas x106 (Cel/mL)")
    const idxViab = headers.findIndex((h: string) => h && h.toString().trim() === "Viabilidad")
    
    // Filtros
    const idxFecha = headers.findIndex((h: string) => h && h.toString().includes("Fecha"))
    const idxTipoLev = headers.findIndex((h: string) => h && h.toString().includes("Tipo de Lev"))
    const idxTanque = headers.findIndex((h: string) => h && h.toString().trim() === "Tanque")

    // Buscar columnas de vitalidad flexiblemente
    const idxVigor = headers.findIndex((h: string) => h && h.toString().includes("Vigorosas") && !h.toString().includes("Muy"))
    const idxMuyVigor = headers.findIndex((h: string) => h && h.toString().includes("Muy Vigorosas"))

    const payload: any[] = []

    dataRows.forEach(row => {
      const viab = Number(row[idxViab])
      if (!isNaN(viab) && viab > 0) {
        // Sumar ambas si existen
        const valVigor = idxVigor >= 0 ? (Number(row[idxVigor]) || 0) : 0;
        const valMuyVigor = idxMuyVigor >= 0 ? (Number(row[idxMuyVigor]) || 0) : 0;
        const totalVigor = valVigor + valMuyVigor;
        
        let fechaVal = idxFecha >= 0 ? formatExcelDate(row[idxFecha]) : "N/A"
        
        let tipoLevVal = idxTipoLev >= 0 ? row[idxTipoLev] : "General"
        let tanqueVal = idxTanque >= 0 ? row[idxTanque] : "N/A"
        tanqueVal = tanqueVal ? tanqueVal.toString() : "N/A"

        payload.push({
          fecha: fechaVal,
          tipoLev: tipoLevVal,
          tanque: tanqueVal,
          plato: Number(row[idxPlato]) || 0,
          ph: Number(row[idxPh]) || 0,
          conteo: Number(row[idxConteo]) || 0,
          viab: viab,
          vigor: totalVigor
        })
      }
    })

    if (payload.length > 0) {
      try {
        const res = await fetch("/api/sync-propagation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (res.ok) {
          const apiResponse = await res.json()
          // Actualizamos localmente usando los resultados calculados por la API!
          if (apiResponse.stats) {
            onDataProcessed(apiResponse.stats, payload)
          }
        }
      } catch (e) {
        console.error("Error al conectar con la API local:", e)
      }
    }
  }

  // 2. Escribir a Excel (Exportar desde el dashboard a Excel)
  const handleExportToExcel = () => {
    // Ejemplo de exportacin de la tabla actual a Excel
    const ws = XLSX.utils.json_to_sheet([
      { Indicador: "Viabilidad", Media: 96.7, Cpk: 1.32 },
      { Indicador: "Conteo", Media: 206.3, Cpk: 1.21 }
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Capacidad")
    XLSX.writeFile(wb, "Reporte_Capacidad.xlsx")
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        className="h-7 text-[10px] bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        <Upload className="size-3 mr-1" />
        {isProcessing ? "Procesando..." : "Subir Excel"}
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="h-7 text-[10px] bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={handleExportToExcel}
      >
        <Download className="size-3 mr-1" />
        Exportar
      </Button>
    </div>
  )
}
