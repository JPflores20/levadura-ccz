"use client"
import React, { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatExcelDate } from "@/lib/utils"

export function ExcelProcessorAber() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessing(true)
    
    const toastId = toast.loading("Procesando Excel de Validación Abber...")

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][]
        
        let headerRowIndex = 2 // Fila 3 del Excel (índice 2)
        const headers = data[headerRowIndex] || []
        const dataRows = data.slice(headerRowIndex + 1)
  
        const payload: any[] = []

        dataRows.forEach(row => {
          if (!row || row.length === 0) return
          const linea = row[0]?.toString().trim()
          
          // Solo procesamos las filas que tengan escrito LINEA 1 o LINEA 2 (para descartar filas vacías o subtotales)
          if (!linea || !linea.toUpperCase().includes("LINEA")) return

          const marca = row[1]?.toString().trim() || "N/A"
          const turno = row[3]?.toString().trim() || "N/A"
          const fecha = formatExcelDate(row[4])
          
          // Extraer promedios (índices 9, 13, 14, 15 según el mapeo)
          const viabilidadAvg = parseFloat(row[9]?.toString().replace('%', '')) || 0
          const conteoLacAvg = parseFloat(row[13]?.toString()) || 0
          const conteoAber = parseFloat(row[14]?.toString()) || 0
          const diferencia = parseFloat(row[15]?.toString()) || 0
          const solidosAvg = parseFloat(row[21]?.toString()) || 0

          // Ignorar si no hay datos reales de Abber
          if (conteoAber === 0 && conteoLacAvg === 0) return

          payload.push({
            linea,
            marca,
            turno,
            fecha,
            viabilidadAvg,
            conteoLacAvg,
            conteoAber,
            diferencia,
            solidosAvg
          })
        })

        if (payload.length === 0) {
          toast.error("No se encontraron filas con datos válidos de Abber.", { id: toastId })
          setIsProcessing(false)
          return
        }

        fetch('/api/sync-aber', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          console.log("Datos subidos:", data)
          toast.success(`¡${payload.length} métricas de Abber subidas con éxito!`, { id: toastId })
        })
        .catch(err => {
          console.error(err)
          toast.error("Error al subir datos al servidor.", { id: toastId })
        })
        .finally(() => {
          setIsProcessing(false)
          if (fileInputRef.current) fileInputRef.current.value = ""
        })
      } catch (err) {
        console.error(err)
        toast.error("Error al leer el archivo Excel.", { id: toastId })
        setIsProcessing(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#121212] border border-yellow-500/20 p-2 rounded-md">
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold gap-2"
        disabled={isProcessing}
      >
        <Upload className="w-4 h-4" />
        {isProcessing ? "Procesando..." : "Subir Excel de Validación Abber"}
      </Button>
    </div>
  )
}
