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
        
        const payload: any[] = []

        // Intentar detectar formato de Datos Crudos (Columnas: FECHA, PROPAGACION, VUELTA, CEPA, DIACETILO...)
        let rawHeaderIndex = -1;
        for (let i = 0; i < Math.min(50, data.length); i++) {
          const row = data[i]
          if (row && row.some(cell => String(cell).toUpperCase().includes("VUELTA")) && 
              row.some(cell => String(cell).toUpperCase().includes("CEPA")) &&
              row.some(cell => String(cell).toUpperCase().includes("FECHA"))) {
            rawHeaderIndex = i;
            break;
          }
        }

        // Intentar detectar formato de Tabla Dinamica / Resumen (Col 0: VUELTA, Cols siguientes: 0, 1, 2...)
        let pivotHeaderIndex = -1;
        for (let i = 0; i < Math.min(100, data.length); i++) {
          const row = data[i];
          if (row && row.length > 1 && String(row[0]).toUpperCase().trim() === "VUELTA" && 
             (String(row[1]).trim() === "0" || String(row[2]).trim() === "0" || String(row[1]).trim() === "1")) {
            pivotHeaderIndex = i;
            break;
          }
        }

        if (rawHeaderIndex !== -1) {
          // PROCESAR FORMATO DATOS CRUDOS
          const headers = data[rawHeaderIndex] || [];
          const idxFecha = headers.findIndex((h: string) => h && h.toString().toUpperCase().includes("FECHA"));
          const idxPropag = headers.findIndex((h: string) => h && h.toString().toUpperCase().includes("PROPAGACI"));
          const idxVuelta = headers.findIndex((h: string) => h && h.toString().toUpperCase().trim() === "VUELTA");
          const idxCepa = headers.findIndex((h: string) => h && h.toString().toUpperCase().includes("CEPA"));
          
          // Buscar columnas de compuestos (ej. DIACETILO FERMENTACION, ACETALDEHIDO MADURACION, etc.)
          const compoundCols = headers.map((h: string, idx: number) => {
            if (!h) return null;
            const upperH = h.toString().toUpperCase();
            if (upperH.includes("DIACETILO") || upperH.includes("ACETALDEHIDO") || upperH.includes("VOLATIL")) {
              return { idx, name: h.toString().trim() };
            }
            return null;
          }).filter(Boolean);

          const groupedData: Record<string, any> = {};

          for (let i = rawHeaderIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            const fecha = idxFecha >= 0 ? formatExcelDate(row[idxFecha]) : "N/A";
            const propagacion = idxPropag >= 0 ? (row[idxPropag]?.toString() || "N/A") : "N/A";
            const vuelta = idxVuelta >= 0 ? row[idxVuelta]?.toString() : null;
            const cepa = idxCepa >= 0 ? (row[idxCepa]?.toString() || "N/A") : "N/A";

            if (vuelta === null || vuelta === "") continue;

            compoundCols.forEach((col: any) => {
              const val = parseFloat(row[col.idx]);
              if (isNaN(val)) return;

              // Parsear el nombre de la columna para extraer VOLATIL y ETAPA
              // Ej: "DIACETILO FERMENTACION" -> Volatil: DIACETILO, Etapa: FERMENTACION
              let volatil = "DESCONOCIDO";
              let etapa = "N/A";
              const upperColName = col.name.toUpperCase();
              
              if (upperColName.includes("DIACETILO")) volatil = "DIACETILO";
              else if (upperColName.includes("ACETALDEHIDO")) volatil = "ACETALDEHIDO";
              else volatil = col.name;

              if (upperColName.includes("FERMENTACION") || upperColName.includes("FERM")) etapa = "FERMENTACION";
              else if (upperColName.includes("MADURACION") || upperColName.includes("MAD")) etapa = "MADURACION";

              const key = `${fecha}_${propagacion}_${cepa}_${volatil}_${etapa}`;
              if (!groupedData[key]) {
                groupedData[key] = { fecha, propagacion, cepa, volatil, etapa, vueltas: {} };
              }
              groupedData[key].vueltas[vuelta.toString()] = val;
            });
          }

          payload.push(...Object.values(groupedData));

        } else if (pivotHeaderIndex !== -1) {
          // PROCESAR FORMATO TABLA DINAMICA / RESUMEN
          const headers = data[pivotHeaderIndex] || [];
          
          for (let i = pivotHeaderIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || !row[0]) continue;
            
            const labelStr = row[0].toString().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            if (!labelStr || labelStr.toUpperCase().includes("VUELTA")) continue;

            // Esperamos que labelStr sea algo como "DIACETILO FERMENTACION BLY25XVIII"
            const parts = labelStr.split(" ");
            let volatil = "N/A", etapa = "N/A", cepa = "N/A";

            if (parts.length >= 1) volatil = parts[0];
            if (parts.length >= 2) etapa = parts[1];
            if (parts.length >= 3) cepa = parts.slice(2).join(" ");

            const vueltas: Record<string, number> = {};
            for (let v = 1; v < headers.length; v++) {
              const vueltaNum = headers[v]?.toString().trim();
              if (vueltaNum !== undefined && vueltaNum !== "" && !isNaN(Number(vueltaNum))) {
                const val = parseFloat(row[v]);
                vueltas[vueltaNum] = isNaN(val) ? 0 : val;
              }
            }

            payload.push({
              fecha: "N/A",
              propagacion: "N/A",
              cepa: cepa,
              volatil: volatil,
              etapa: etapa,
              vueltas: vueltas
            });
          }
        } else {
          toast.error("No se reconoció el formato del Excel (faltan columnas esperadas).", { id: toastId })
          setIsProcessing(false)
          return
        }

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
