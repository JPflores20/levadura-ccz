const XLSX = require("xlsx");
const fs = require("fs");

// Función para convertir fecha serial de Excel (ej: 45180) a string "DD-MMM-YY"
function formatExcelDate(excelDate) {
  if (!excelDate) return "N/A";
  if (typeof excelDate === "string") return excelDate;
  
  const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  if (isNaN(date.getTime())) return "N/A";
  
  const formatter = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: 'short', year: '2-digit'
  });
  return formatter.format(date).replace('.', '');
}

async function uploadPropagacion() {
  console.log("Leyendo archivo de Propagación de Levadura...");
  const filePath = "./public/contexto/Propagacion_Levadura.xlsx";
  
  if (!fs.existsSync(filePath)) {
    console.error("El archivo no existe en:", filePath);
    return;
  }

  const workbook = XLSX.readFile(filePath);
  
  // Buscar la hoja "Propagacion_Levadura" o usar la hoja 3 (index 2)
  const sheetName = workbook.SheetNames.includes("Propagacion_Levadura") 
    ? "Propagacion_Levadura" 
    : workbook.SheetNames[2] || workbook.SheetNames[0];
    
  console.log("Usando la hoja:", sheetName);
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  let headerRowIndex = -1;
  for (let i = 0; i < 10; i++) {
    if (rows[i] && rows[i].some(cell => cell && cell.toString().toLowerCase().includes("viabilidad"))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error("No se encontró la columna Viabilidad en el encabezado.");
    return;
  }

  const headers = rows[headerRowIndex];
  const dataRows = rows.slice(headerRowIndex + 1);

  const findColumnIndex = (matchFn) => {
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      if (!rows[r]) continue;
      for (let c = 0; c < rows[r].length; c++) {
        const val = rows[r][c];
        if (val && matchFn(val.toString().trim())) {
          return c;
        }
      }
    }
    return -1;
  };

  const idxPlato = headers.findIndex(h => h && h.toString().trim() === "°P");
  const idxPh = headers.findIndex(h => h && h.toString().trim() === "pH.");
  const idxConteo = findColumnIndex(h => h.toLowerCase().includes("conteo de celulas"));
  const idxViab = findColumnIndex(h => h.toLowerCase().includes("viabilidad"));
  
  const idxFecha = findColumnIndex(h => h.toLowerCase().includes("fecha"));
  const idxHora = findColumnIndex(h => h.toLowerCase().includes("hora inicio") || h.toLowerCase() === "hora");
  const idxTipoLev = findColumnIndex(h => h.toLowerCase().includes("tipo de lev"));
  const idxTanque = findColumnIndex(h => h.toLowerCase().trim() === "tanque");
  
  let idxDobleteo = findColumnIndex(h => h.toLowerCase().includes("doblete"));
  if (idxDobleteo === -1) idxDobleteo = 19; 
  
  const idxSolidos = findColumnIndex(h => h.toLowerCase().includes("% de solidos") || h.toLowerCase().includes("% de sólidos"));
  const idxTemp = findColumnIndex(h => h.toLowerCase().includes("temp del mosto") || h.toLowerCase().includes("temp. en tanque") || h.toLowerCase().includes("temperatura"));

  const idxVigor = findColumnIndex(h => (h.toLowerCase().includes("vigor") || h.toLowerCase().includes("vigososas")) && !h.toLowerCase().includes("muy"));
  const idxMuyVigor = findColumnIndex(h => h.toLowerCase().includes("muy vig"));
  const idxDebiles = findColumnIndex(h => h.toLowerCase().includes("debiles") || h.toLowerCase().includes("débiles"));
  const idxMuertas = findColumnIndex(h => h.toLowerCase().includes("muertas"));

  const payload = [];

  dataRows.forEach(row => {
    const viab = Number(row[idxViab]);
    if (!isNaN(viab) && viab > 0) {
      const valVigor = idxVigor >= 0 ? (Number(row[idxVigor]) || 0) : 0;
      const valMuyVigor = idxMuyVigor >= 0 ? (Number(row[idxMuyVigor]) || 0) : 0;
      const totalVigor = valVigor + valMuyVigor;
      
      let fechaVal = idxFecha >= 0 ? formatExcelDate(row[idxFecha]) : "N/A";
      let horaVal = idxHora >= 0 ? (row[idxHora] ? row[idxHora].toString() : "N/A") : "N/A";
      
      if (horaVal !== "N/A" && !isNaN(Number(horaVal))) {
        const totalMinutes = Math.round(Number(horaVal) * 24 * 60);
        const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const mm = (totalMinutes % 60).toString().padStart(2, '0');
        horaVal = `${hh}:${mm}`;
      }

      let tipoLevVal = idxTipoLev >= 0 ? row[idxTipoLev] : "General";
      let tanqueVal = idxTanque >= 0 ? row[idxTanque] : "N/A";
      tanqueVal = tanqueVal ? tanqueVal.toString() : "N/A";
      
      let dobleteoVal = idxDobleteo >= 0 ? row[idxDobleteo] : "N/A";
      dobleteoVal = dobleteoVal ? dobleteoVal.toString() : "N/A";

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
      });
    }
  });

  if (payload.length === 0) {
    console.log("No se encontraron filas válidas para procesar.");
    return;
  }

  console.log(`Se procesaron ${payload.length} filas válidas. Enviando a la API...`);

  try {
    const response = await fetch("http://localhost:3000/api/sync-propagation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const apiResponse = await response.json();
      console.log("¡Datos subidos exitosamente!");
      console.log("Respuesta:", apiResponse.message);
    } else {
      console.error("Error al subir los datos:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error al conectar con la API (Asegúrate de que Next.js esté corriendo en el puerto 3000):", error.message);
  }
}

uploadPropagacion();
