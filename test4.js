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
    const match = stats.filter(s => formatExcelDate(s.fecha) === '2025-05-27');
    console.log(`Found ${match.length} items`);
    if (match.length > 0) {
      console.log("Vueltas keys:", match.map(m => Object.keys(m.vueltas)));
    }
  })
