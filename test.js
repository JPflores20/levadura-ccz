const compuestos = ['Acetaldehido', 'Diacetilo', 'Acetato de etilo', 'Propanol', 'Isobutaol', 'Isobutanol', 'Acetato de isoamilo', 'Isoamil alcohol', 'Alcohol isoamilico', 'Alcoholes Superiores', 'Esteres', 'Ésteres'];
const rows = [{ 'FECHA': '12-Sep', 'MARCA': 'TestCepa', 'ETAPA': 'TEST', 'VUELTA': '1', 'DIACETILO TOTAL': '100' }];
const groupedData = {};

rows.forEach(row => {
    const getVal = (keys) => {
        for (let k of Object.keys(row)) {
            if (keys.some(key => k.toLowerCase().includes(key.toLowerCase()))) return row[k];
        }
        return undefined;
    }
    const fecha = getVal(['Fecha']) || 'N/A'; 
    const cepa = getVal(['Marca', 'cepa']) || 'N/A'; 
    const etapa = getVal(['Etapa']) || 'FERMENTACION';
    const vuelta = getVal(['Vuelta']); 
    const propagacion = 'N/A'
    
    if (!vuelta) return;
    
    compuestos.forEach(volatil => {
        const rowVal = getVal([volatil]);
        const val = parseFloat(rowVal)
        if (!isNaN(val)) {
            let volatilLimpio = volatil.toUpperCase().includes('DIACETILO') ? 'DIACETILO' : volatil.toUpperCase()
            const key = \\_\_\_\_\\
            if (!groupedData[key]) groupedData[key] = { fecha, propagacion, cepa, volatil: volatilLimpio, etapa, vueltas: {} }
            groupedData[key].vueltas[vuelta.toString()] = val
        }
    })
})
console.log(JSON.stringify(Object.values(groupedData), null, 2));
