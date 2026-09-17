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
      if (rows[i] && rows[i].some((cell: any) => cell && cell.toString().toLowerCase().includes("viabilidad"))) {
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

    // Función para buscar en las primeras 10 filas por si los encabezados están muy separados
    const findColumnIndex = (matchFn: (val: string) => boolean) => {
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        if (!rows[r]) continue
        for (let c = 0; c < rows[r].length; c++) {
          const val = rows[r][c]
          if (val && matchFn(val.toString().trim())) {
            return c
          }
        }
      }
      return -1
    }

    // Índices de columnas (Ajustar dinámicamente según cabeceras)
    const idxPlato = headers.findIndex((h: string) => h && h.toString().trim() === "°P")
    const idxPh = headers.findIndex((h: string) => h && h.toString().trim() === "pH.")
    const idxConteo = findColumnIndex((h) => h.toLowerCase().includes("conteo de celulas"))
    const idxViab = findColumnIndex((h) => h.toLowerCase().includes("viabilidad"))
    
    // Filtros
    const idxFecha = findColumnIndex((h) => h.toLowerCase().includes("fecha"))
    const idxHora = findColumnIndex((h) => h.toLowerCase().includes("hora inicio") || h.toLowerCase() === "hora")
    const idxTipoLev = findColumnIndex((h) => h.toLowerCase().includes("tipo de lev"))
    const idxTanque = findColumnIndex((h) => h.toLowerCase().trim() === "tanque")
    
    let idxDobleteo = findColumnIndex((h) => h.toLowerCase().includes("doblete"))
    if (idxDobleteo === -1) idxDobleteo = 19; // Columna T por defecto si falla la búsqueda
    const idxSolidos = findColumnIndex((h) => h.toLowerCase().includes("% de solidos") || h.toLowerCase().includes("% de sólidos"))
    const idxTemp = findColumnIndex((h) => h.toLowerCase().includes("temp del mosto") || h.toLowerCase().includes("temp. en tanque") || h.toLowerCase().includes("temperatura"))

    // Buscar columnas de vitalidad flexiblemente (ignorando mayúsculas/minúsculas y variaciones de s/z, y el error ortográfico "vigososas")
    const idxVigor = findColumnIndex((h) => (h.toLowerCase().includes("vigor") || h.toLowerCase().includes("vigososas")) && !h.toLowerCase().includes("muy"))
    const idxMuyVigor = findColumnIndex((h) => h.toLowerCase().includes("muy vig"))
    const idxDebiles = findColumnIndex((h) => h.toLowerCase().includes("debiles") || h.toLowerCase().includes("débiles"))
    const idxMuertas = findColumnIndex((h) => h.toLowerCase().includes("muertas"))

    const payload: any[] = []

    dataRows.forEach(row => {
      const viab = Number(row[idxViab])
      if (!isNaN(viab) && viab > 0) {
        // Sumar ambas si existen
        const valVigor = idxVigor >= 0 ? (Number(row[idxVigor]) || 0) : 0;
        const valMuyVigor = idxMuyVigor >= 0 ? (Number(row[idxMuyVigor]) || 0) : 0;
        const totalVigor = valVigor + valMuyVigor;
        
        let fechaVal = idxFecha >= 0 ? formatExcelDate(row[idxFecha]) : "N/A"
        let horaVal = idxHora >= 0 ? row[idxHora]?.toString() : "N/A"
        if (horaVal !== "N/A" && !isNaN(Number(horaVal))) {
          // Si Excel lo lee como fracción de día (ej. 0.5 = 12:00)
          const totalMinutes = Math.round(Number(horaVal) * 24 * 60)
          const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
          const mm = (totalMinutes % 60).toString().padStart(2, '0')
          horaVal = `${hh}:${mm}`
        }

        let tipoLevVal = idxTipoLev >= 0 ? row[idxTipoLev] : "General"
        let tanqueVal = idxTanque >= 0 ? row[idxTanque] : "N/A"
        tanqueVal = tanqueVal ? tanqueVal.toString() : "N/A"
        
        let dobleteoVal = idxDobleteo >= 0 ? row[idxDobleteo] : "N/A"
        dobleteoVal = dobleteoVal ? dobleteoVal.toString() : "N/A"

        payload.push({
          fecha: fechaVal,
          hora: horaVal,
          tipoLev: tipoLevVal,
          tanque: tanqueVal,
          dobleteo: dobleteoVal,
          plato: Number(row[idxPlato]) || 0,
          ph: Number(row[idxPh]) || 0,
          conteo: Number(row[idxConteo]) || 0,
          viab: viab,
          vigor: totalVigor,
          debiles: idxDebiles >= 0 ? (Number(row[idxDebiles]) || 0) : null,
          muertas: idxMuertas >= 0 ? (Number(row[idxMuertas]) || 0) : null,
          solidos: idxSolidos >= 0 ? (Number(row[idxSolidos]) || 0) : 0,
          temp: idxTemp >= 0 ? (Number(row[idxTemp]) || 0) : 0
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
