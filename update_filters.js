const fs = require('fs');

const file = 'components/dashboard/propagation-tab.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex flex-col xl:flex-row justify-between xl:items-center bg-\[#121212\] border border-yellow-500\/20 rounded-md p-3 gap-4 relative">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="grid grid-cols-1/m;

const match = content.match(regex);
if (!match) {
    console.log("No match found");
    process.exit(1);
}

const originalBlock = match[1];

// Extract the 5 filter blocks using simple string splits or regex
// Let's use comments to split them
const getBlock = (filterName) => {
    const startStr = `{/* ${filterName} */}`;
    const startIdx = originalBlock.indexOf(startStr);
    if (startIdx === -1) throw new Error(`Could not find ${filterName}`);
    
    // The block ends before the next {/* ... */} or at the end of the flex-wrap div
    let nextIdx = originalBlock.length;
    
    const filterComments = [
        '{/* NUEVO FILTRO: Código de Cultivo */}',
        '{/* FILTRO: Fecha */}',
        '{/* FILTRO: Tipo de Lev */}',
        '{/* FILTRO: Tanque */}',
        '{/* FILTRO: Dobleteo */}'
    ];
    
    for (const comment of filterComments) {
        if (comment !== startStr) {
            const idx = originalBlock.indexOf(comment, startIdx + startStr.length);
            if (idx !== -1 && idx < nextIdx) {
                nextIdx = idx;
            }
        }
    }
    
    return originalBlock.substring(startIdx, nextIdx).trim();
};

const tipoLev = getBlock('FILTRO: Tipo de Lev');
const codigoCult = getBlock('NUEVO FILTRO: Código de Cultivo');
const dobleteo = getBlock('FILTRO: Dobleteo');
const tanque = getBlock('FILTRO: Tanque');
const fecha = getBlock('FILTRO: Fecha');

const newHeader = `
        <button 
          onClick={handleCapture}
          className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] transition-colors uppercase font-bold shrink-0"
          title="Capturar pantalla del dashboard"
        >
          <Camera size={12} />
          Captura
        </button>
        
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-start xl:justify-end gap-4 w-full">
`;

const assembledBlock = newHeader + 
    '          ' + tipoLev + '\n\n' +
    '          ' + codigoCult + '\n\n' +
    '          ' + dobleteo + '\n\n' +
    '          ' + tanque + '\n\n' +
    '          ' + fecha + '\n' +
    '        </div>';

const replaceStr = '<div className="flex flex-col xl:flex-row justify-between xl:items-center bg-[#121212] border border-yellow-500/20 rounded-md p-3 gap-4 relative">\n' +
assembledBlock + '\n      </div>\n\n      <div className="grid grid-cols-1';

content = content.replace(regex, replaceStr);

fs.writeFileSync(file, content);
console.log("Updated successfully");
