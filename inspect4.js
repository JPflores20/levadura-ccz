const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dirPath = path.join(__dirname, 'public', 'contexto');
const excelFile = fs.readdirSync(dirPath).find(f => f.includes('.xlsx'));
const filePath = path.join(dirPath, excelFile);
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['Cineticas'];
console.log(Object.keys(sheet));
