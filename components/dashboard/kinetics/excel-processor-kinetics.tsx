"use client"
import React, { useRef, useState } from "react"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatExcelDate } from "@/lib/utils"

export function ExcelProcessorKinetics() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessing(true)
    
    const toastId = toast.loading("Procesando Excel...")

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: "binary" })
        
        const sheetName = workbook.SheetNames.includes("Resumen") 
          ? "Resumen" 
          : workbook.SheetNames[0]
          
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][]
        
        // Encontrar la fila de cabeceras de forma genérica (buscando TCC, MARCA, FECHA o DIAS)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(20, data.length); i++) {
          const row = data[i];
          if (row && row.some(cell => {
            if (!cell) return false;
            const str = String(cell).toUpperCase();
            return str.includes("TCC") || str.includes("TANQUE") || str.includes("MARCA") || str.includes("FECHA") || str.includes("GLUCOSA");
          })) {
            headerRowIndex = i;
            break;
          }
        }

        // Extraer los datos crudos
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet, { header: headerRowIndex + 1, defval: "" });
        
        const payload = rawJsonData.filter((row: any) => {
          // Filtrar filas completamente vacías o basura
          const keys = Object.keys(row);
          return keys.length > 2; // Asumir que una fila real tiene más de 2 columnas llenas
        });

        if (payload.length === 0) {
          toast.error("No se encontraron datos válidos.", { id: toastId })
          setIsProcessing(false)
          return
        }

        fetch('/api/sync-kinetics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          console.log("Datos subidos:", data)
          toast.success(`¡Datos de cinética (${payload.length} registros) subidos con éxito!`, { id: toastId })
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
        {isProcessing ? "Procesando..." : "Subir Excel de Cinética"}
      </Button>
    </div>
  )
}
