const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

// 1. Replace the prepareChartData function
const newPrepareChartData = `
  const prepareChartData = (volatilName: string) => {
    const chartData = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase()

    let maxFerm = 0;
    let maxRep = 0;
    statsData.forEach((d: any) => {
      const etapa = (d.etapa || "").toString().toUpperCase();
      if (d.vueltas) {
         Object.keys(d.vueltas).forEach(k => {
            const v = parseInt(k);
            if (!isNaN(v)) {
              if (etapa.includes("FERM") && v > maxFerm) maxFerm = v;
              if (etapa.includes("REP") && v > maxRep) maxRep = v;
            }
         })
      }
    })

    const axisPoints = [];
    for (let i = 0; i <= maxFerm; i++) {
       axisPoints.push({ label: \`F\${i}\`, day: i, isFerm: true });
    }
    for (let i = 0; i <= maxRep; i++) {
       axisPoints.push({ label: \`R\${i}\`, day: i, isFerm: false });
    }

    axisPoints.forEach(pt => {
      const point: any = { vuelta: pt.label }
      
      const filterRows = (dataArr: any[]) => dataArr.filter((d: any) => {
        const v = (d.volatil || "").toString().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase()
        const e = (d.etapa || "").toString().toUpperCase()
        const isMatchEtapa = pt.isFerm ? e.includes("FERM") : e.includes("REP")
        return v.includes(normalizedVolatilName) && isMatchEtapa && d.vueltas && d.vueltas[pt.day] !== undefined && d.vueltas[pt.day] !== null
      })

      // Tanque A
      const rowsA = filterRows(dataA)
      point.valorA = rowsA.length > 0 ? (rowsA.reduce((acc: number, r: any) => acc + Number(r.vueltas[pt.day]), 0) / rowsA.length) : null

      // Tanque B (multiple)
      dataBMap.forEach((bInfo, idx) => {
        const rowsB = filterRows(bInfo.data)
        point[\`valorB_\${idx}\`] = rowsB.length > 0 ? (rowsB.reduce((acc: number, r: any) => acc + Number(r.vueltas[pt.day]), 0) / rowsB.length) : null
      })

      // Skip pushing if the point has no data for A and no data for B
      // Wait, let's just push it so the x-axis is uniform.
      chartData.push(point)
    })
    return chartData
  }
`;

code = code.replace(
  /const prepareChartData = \(volatilName: string\) => \{[\s\S]*?return chartData\n  \}/,
  newPrepareChartData.trim()
);

// 2. Change XAxis labels
code = code.replace(
  /label=\{\{ value: 'Días de Fermentación'/g,
  `label={{ value: 'Días (F=Fermentación, R=Reposo)'`
);

fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Done!');
