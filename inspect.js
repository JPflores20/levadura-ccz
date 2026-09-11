const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dirPath = path.join(__dirname, 'public', 'contexto');
const files = fs.readdirSync(dirPath);
const excelFile = files.find(f => f.includes('.xlsx'));

if (!excelFile) {
  console.log('No Excel file found in public/contexto');
  process.exit(1);
}

const filePath = path.join(dirPath, excelFile);
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:');
console.log(workbook.SheetNames);

const cineticasSheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('cinetica') || s.toLowerCase().includes('cinética'));
if (cineticasSheetName) {
  console.log('Found sheet:', cineticasSheetName);
  const sheet = workbook.Sheets[cineticasSheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 0; i < Math.min(20, json.length); i++) {
    console.log('Row ' + i + ':', json[i]);
  }
} else {
  console.log('No sheet found containing cinetica');
}
