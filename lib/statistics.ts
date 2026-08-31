export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

export function calculateStdDev(data: number[], mean?: number): number {
  if (data.length < 2) return 0;
  const m = mean ?? calculateMean(data);
  const variance =
    data.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) /
    (data.length - 1);
  return Math.sqrt(variance);
}

export function calculateMedian(data: number[]): number {
  if (data.length === 0) return 0;
  return calculatePercentile(data, 0.5);
}

export function calculateSkewness(
  data: number[],
  mean?: number,
  std?: number,
): number {
  if (data.length < 3) return 0;
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return 0;

  let sum3 = 0;
  for (const val of data) {
    sum3 += Math.pow((val - m) / s, 3);
  }
  const n = data.length;
  // Sample skewness formula (same as Excel)
  return (n / ((n - 1) * (n - 2))) * sum3;
}

export function calculateKurtosis(
  data: number[],
  mean?: number,
  std?: number,
): number {
  if (data.length < 4) return 0;
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return 0;

  let sum4 = 0;
  for (const val of data) {
    sum4 += Math.pow((val - m) / s, 4);
  }
  const n = data.length;

  const coeff1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const coeff2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return coeff1 * sum4 - coeff2;
}

export function calculatePercentile(data: number[], p: number): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function calculateCpCpk(
  data: number[],
  lsl: number,
  usl: number,
  mean?: number,
  std?: number,
  rMean?: number,
  d2?: number,
) {
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return { cp: 0, cpk: 0, pp: 0, ppk: 0 };

  // Calculate Pp and Ppk using overall standard deviation (long-term)
  const pp = (usl - lsl) / (6 * s);
  const ppl = (m - lsl) / (3 * s);
  const ppu = (usl - m) / (3 * s);
  const ppk = Math.min(ppl, ppu);

  // Calculate Cp and Cpk using short-term standard deviation (R-bar / d2)
  let sigmaShort = s;
  if (rMean !== undefined && d2 !== undefined && d2 > 0) {
    sigmaShort = rMean / d2;
  }

  let cp = 0;
  let cpk = 0;
  if (sigmaShort > 0) {
    cp = (usl - lsl) / (6 * sigmaShort);
    const cpl = (m - lsl) / (3 * sigmaShort);
    const cpu = (usl - m) / (3 * sigmaShort);
    cpk = Math.min(cpl, cpu);
  }

  return { cp, cpk, pp, ppk };
}

export function generateHistogram(
  data: number[],
  min: number,
  max: number,
  binsCount = 10,
) {
  if (data.length === 0) return { bins: [], frequencies: [], curve: [] };

  const step = (max - min) / binsCount || 1;
  const bins: string[] = [];
  const frequencies: number[] = new Array(binsCount).fill(0);

  for (let i = 0; i < binsCount; i++) {
    bins.push((min + i * step).toFixed(2));
  }

  data.forEach((val) => {
    let binIndex = Math.floor((val - min) / step);
    if (binIndex >= binsCount) binIndex = binsCount - 1;
    if (binIndex < 0) binIndex = 0;
    frequencies[binIndex]++;
  });

  const mean = calculateMean(data);
  const std = calculateStdDev(data, mean);
  const maxFreq = Math.max(...frequencies, 1);

  const curve = bins.map((b) => {
    const x = parseFloat(b);
    if (std === 0) return 0;
    const z = (x - mean) / std;
    const pdf = Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    return pdf * data.length * step; // Factor de escalado real para curva normal sobre histograma
  });

  return { bins, frequencies, curve };
}

export function filterNumbers(...args: any[]): number[] {
  return args
    .map((v) => (v !== undefined && v !== null && v !== "" ? Number(v) : NaN))
    .filter((v) => !isNaN(v));
}

export function calculateAxisRange(
  val: { min: number; max: number },
  limitsArray: any[],
  padRatio = 0.2,
) {
  const a = filterNumbers(val.min, val.max, ...limitsArray);
  const tMin = Math.min(...a),
    tMax = Math.max(...a);
  const pad =
    (tMax - tMin) * padRatio ||
    (tMax === 0 && tMin === 0 ? 1 : Math.abs(tMax) * 0.1);
  return {
    min: tMin - pad,
    max: tMax + pad,
  };
}

export function calculateRegression(data: { x: number; y: number }[]) {
  let r = 0,
    r2 = 0,
    m = 0,
    b = 0;
  let formula = "N/A";
  let trendlineData: number[][] = [];

  if (data.length > 1) {
    const meanX = data.reduce((sum, p) => sum + p.x, 0) / data.length;
    const meanY = data.reduce((sum, p) => sum + p.y, 0) / data.length;
    let num = 0,
      denX = 0,
      denY = 0;

    data.forEach((p) => {
      const dx = p.x - meanX,
        dy = p.y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });

    if (denX > 0 && denY > 0) {
      r = num / Math.sqrt(denX * denY);
      r2 = r * r;
      m = num / denX;
      b = meanY - m * meanX;

      const minX = Math.min(...data.map((p) => p.x));
      const maxX = Math.max(...data.map((p) => p.x));
      trendlineData = [
        [minX, m * minX + b],
        [maxX, m * maxX + b],
      ];

      const sign = b >= 0 ? "+" : "-";
      formula = `y = ${m.toFixed(4)}x ${sign} ${Math.abs(b).toFixed(4)}`;
    }
  }
  return { r, r2, m, b, formula, trendlineData };
}
