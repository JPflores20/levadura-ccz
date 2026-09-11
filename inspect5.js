const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dirPath = path.join(__dirname, 'public', 'contexto');
const excelFile = fs.readdirSync(dirPath).find(f => f.includes('.xlsx'));
const filePath = path.join(dirPath, excelFile);
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(name => {
  const sheet = workbook.Sheets[name];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Sheet Name: "' + name + '", Length: ' + name.length + ', Rows: ' + json.length);
});
