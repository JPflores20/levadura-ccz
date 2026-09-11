const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dirPath = path.join(__dirname, 'public', 'contexto');
const excelFile = fs.readdirSync(dirPath).find(f => f.includes('.xlsx'));
const filePath = path.join(dirPath, excelFile);
console.log('File size:', fs.statSync(filePath).size);
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['Cineticas'];
const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('Total rows in Cineticas:', json.length);
