const formatExcelDate = (val) => {
  if (!val) return '';
  const num = Number(val);
  if (!isNaN(num)) {
    const d = new Date((num - 25569) * 86400 * 1000);
    const yr = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  return val.toString();
};

fetch('http://localhost:3000/api/get-kinetics')
  .then(res => res.json())
  .then(json => {
    const stats = json.stats || [];
    const match = stats.filter(s => formatExcelDate(s.fecha) === '2026-07-14');
    console.log(`Found ${match.length} items`);
    if (match.length > 0) {
      console.log(JSON.stringify(match[0], null, 2));
      console.log("Vueltas keys:", Object.keys(match[0].vueltas));
    }
  })
