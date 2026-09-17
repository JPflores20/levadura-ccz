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
    const corona = stats.filter(s => formatExcelDate(s.fecha) === '2026-07-14' && s.cepa === 'CORONA' && s.volatil === 'ACETALDEHIDO');
    console.log(JSON.stringify(corona, null, 2));
  })
