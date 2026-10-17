const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Función para convertir fecha serial de Excel (ej: 45180) a string "YYYY-MM-DD"
function formatExcelDate(excelDate) {
  if (!excelDate) return "N/A";
  if (typeof excelDate === "string") return excelDate;
  
  const numVal = Number(excelDate);
  if (!isNaN(numVal) && numVal > 20000 && numVal < 100000) {
    const date = new Date(Math.round((numVal - 25569) * 86400 * 1000));
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + tzOffset);
    return localDate.toISOString().split("T")[0];
  }
  return excelDate.toString().trim();
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
    const hIdx = headers.findIndex(h => h && matchFn(h.toString().trim()));
    if (hIdx !== -1) return hIdx;
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
  const idxGen = findColumnIndex(h => h.toLowerCase().includes("gen.") || h.toLowerCase() === "gen" || h.toLowerCase().includes("generaci"));
  const idxVuelta = findColumnIndex(h => h.toLowerCase().includes("vuelta") || h.toLowerCase() === "vta" || h.toLowerCase() === "vta.");
  const idxCodigo = findColumnIndex(h => h.toLowerCase().includes("codigo de cultivo") || h.toLowerCase().includes("codigo"));
  
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
      let tanqueVal = idxTanque >= 0 ? (row[idxTanque] ? row[idxTanque].toString().trim() : "N/A") : "N/A";
      let dobleteoVal = idxDobleteo >= 0 ? (row[idxDobleteo] ? row[idxDobleteo].toString().trim() : "N/A") : "N/A";
      let genVal = idxGen >= 0 && row[idxGen] !== undefined && row[idxGen] !== null && row[idxGen] !== "" ? row[idxGen].toString().trim() : "N/A";
      let vueltaVal = idxVuelta >= 0 && row[idxVuelta] !== undefined && row[idxVuelta] !== null && row[idxVuelta] !== "" ? row[idxVuelta].toString().trim() : "1";
      let codigoVal = idxCodigo >= 0 && row[idxCodigo] !== undefined && row[idxCodigo] !== null ? row[idxCodigo].toString().trim() : "N/A";

      payload.push({
        fecha: fechaVal,
        hora: horaVal,
        tipoLev: tipoLevVal,
        tanque: tanqueVal,
        dobleteo: dobleteoVal,
        generacion: genVal,
        vuelta: vueltaVal,
        codigoCultivo: codigoVal,
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

  console.log(`Se procesaron ${payload.length} filas válidas. Guardando en database.json...`);
  
  const DB_FILE = path.join(__dirname, "database.json");
  let currentDb = {};
  try {
    if (fs.existsSync(DB_FILE)) {
      currentDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch(e) {}
  
  currentDb.rawData = payload;
  currentDb.ultimaActualizacion = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), "utf-8");
  console.log("database.json actualizado con éxito con", payload.length, "registros!");
}

uploadPropagacion();
