const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

const newPrepareChartData = `
  const prepareChartData = (volatilName: string) => {
    const chartData = []
    const normalizedVolatilName = volatilName.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase()

    let maxFerm = 0;
    let maxRep = 0;
    let hasZeroFerm = false;
    let hasZeroRep = false;

    statsData.forEach((d: any) => {
      const etapa = (d.etapa || "").toString().toUpperCase();
      if (d.vueltas) {
         Object.keys(d.vueltas).forEach(k => {
            const v = parseInt(k);
            if (!isNaN(v)) {
              if (etapa.includes("FERM")) {
                if (v > maxFerm) maxFerm = v;
                if (v === 0) hasZeroFerm = true;
              }
              if (etapa.includes("REP")) {
                if (v > maxRep) maxRep = v;
                if (v === 0) hasZeroRep = true;
              }
            }
         })
      }
    })

    const axisPoints = [];
    const startFerm = hasZeroFerm ? 0 : 1;
    for (let i = startFerm; i <= maxFerm; i++) {
       axisPoints.push({ label: \`F\${i}\`, day: i, isFerm: true });
    }
    const startRep = hasZeroRep ? 0 : 1;
    for (let i = startRep; i <= maxRep; i++) {
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

      chartData.push(point)
    })
    return chartData
  }
`;

code = code.replace(
  /const prepareChartData = \(volatilName: string\) => \{[\s\S]*?return chartData\n  \}/,
  newPrepareChartData.trim()
);

fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Done!');
