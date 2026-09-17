const fs = require('fs');

const tabFile = 'components/dashboard/validacion-aber-tab.tsx';
let tab = fs.readFileSync(tabFile, 'utf8');

tab = tab.replace(/VALIDACIÓN DE SENSORES ABER/g, 'AUDITORÍA DE ABBERS');
tab = tab.replace(/Comparativa Conteo Automatizado vs Siembra Microbiológica/g, 'Comparación Medicion en Abber ( Equipo) vs Medicion en Vicell (laboratorio)');
tab = tab.replace(/Sensor ABER/g, 'Abber');
tab = tab.replace(/Impacto del Porcentaje de Sólidos en el Sensor/g, 'Impacto del Porcentaje de Sólidos en el Sistema de Medición de Células');
tab = tab.replace(/en el sensor ABER/g, 'en el sistema de medición Abber');
tab = tab.replace(/ABER:/g, 'Abber:');
tab = tab.replace(/Correlación ABER vs Laboratorio/g, 'Correlación Abber vs Laboratorio');
tab = tab.replace(/Conteo ABER/g, 'Conteo Abber');
tab = tab.replace(/Reporte-Sensores-ABER/g, 'Reporte-Abbers');
tab = tab.replace(/Validación ABER/g, 'Validación Abber');

// also remove handleCapture from validacion-aber-tab.tsx, since it was moved to the top-nav globally
tab = tab.replace(/  const handleCapture = async \(\) => {[\s\S]*?  }\n/, '');
// and remove the capture button
tab = tab.replace(/<button\s*onClick=\{handleCapture\}[\s\S]*?<\/button>/, '');
// and remove Camera and htmlToImage imports
tab = tab.replace(/import \* as htmlToImage from 'html-to-image'\n/, '');
tab = tab.replace(/import \{ Camera \} from 'lucide-react'\n/, '');

fs.writeFileSync(tabFile, tab);

const pageFile = 'app/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');
page = page.replace(/Validación Aber/g, 'Auditoría Abber');
page = page.replace(/Validacion Aber/g, 'Auditoria Abber');
fs.writeFileSync(pageFile, page);

const excelFile = 'components/dashboard/cultivo/excel-processor-aber.tsx';
let excel = fs.readFileSync(excelFile, 'utf8');
excel = excel.replace(/Validación ABER/g, 'Validación Abber');
excel = excel.replace(/ABER/g, 'Abber'); // Be careful here, some might be OK
fs.writeFileSync(excelFile, excel);

console.log("Done");
