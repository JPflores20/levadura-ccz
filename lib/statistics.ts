export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

export function calculateStdDev(data: number[], mean?: number): number {
  if (data.length < 2) return 0;
  const meanValue = mean ?? calculateMean(data);
  const variance =
    data.reduce((sumOfSquares, val) => sumOfSquares + Math.pow(val - meanValue, 2), 0) /
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
  const meanValue = mean ?? calculateMean(data);
  const standardDeviation = std ?? calculateStdDev(data, meanValue);
  if (standardDeviation === 0) return 0;

  let sumOfCubedDeviations = 0;
  for (const val of data) {
    sumOfCubedDeviations += Math.pow((val - meanValue) / standardDeviation, 3);
  }
  const sampleSize = data.length;
  // Sample skewness formula (same as Excel)
  return (sampleSize / ((sampleSize - 1) * (sampleSize - 2))) * sumOfCubedDeviations;
}

export function calculateKurtosis(
  data: number[],
  mean?: number,
  std?: number,
): number {
  if (data.length < 4) return 0;
  const meanValue = mean ?? calculateMean(data);
  const standardDeviation = std ?? calculateStdDev(data, meanValue);
  if (standardDeviation === 0) return 0;

  let sumOfQuarticDeviations = 0;
  for (const val of data) {
    sumOfQuarticDeviations += Math.pow((val - meanValue) / standardDeviation, 4);
  }
  const sampleSize = data.length;

  const kurtosisCoefficient1 = (sampleSize * (sampleSize + 1)) / ((sampleSize - 1) * (sampleSize - 2) * (sampleSize - 3));
  const kurtosisCoefficient2 = (3 * Math.pow(sampleSize - 1, 2)) / ((sampleSize - 2) * (sampleSize - 3));
  return kurtosisCoefficient1 * sumOfQuarticDeviations - kurtosisCoefficient2;
}

export function calculatePercentile(data: number[], percentileRatio: number): number {
  if (data.length === 0) return 0;
  const sortedData = [...data].sort((a, b) => a - b);
  const indexPosition = (sortedData.length - 1) * percentileRatio;
  const baseIndex = Math.floor(indexPosition);
  const fractionalPart = indexPosition - baseIndex;
  if (sortedData[baseIndex + 1] !== undefined) {
    return sortedData[baseIndex] + fractionalPart * (sortedData[baseIndex + 1] - sortedData[baseIndex]);
  } else {
    return sortedData[baseIndex];
  }
}

export function calculateCpCpk(
  data: number[],
  lowerSpecificationLimit: number,
  upperSpecificationLimit: number,
  mean?: number,
  std?: number,
  rangeMean?: number,
  d2Constant?: number,
) {
  const meanValue = mean ?? calculateMean(data);
  const standardDeviation = std ?? calculateStdDev(data, meanValue);
  if (standardDeviation === 0) return { cp: 0, cpk: 0, pp: 0, ppk: 0 };

  // Calculate Pp and Ppk using overall standard deviation (long-term)
  const processPerformance = (upperSpecificationLimit - lowerSpecificationLimit) / (6 * standardDeviation);
  const processPerformanceLower = (meanValue - lowerSpecificationLimit) / (3 * standardDeviation);
  const processPerformanceUpper = (upperSpecificationLimit - meanValue) / (3 * standardDeviation);
  const processPerformanceIndex = Math.min(processPerformanceLower, processPerformanceUpper);

  // Calculate Cp and Cpk using short-term standard deviation (R-bar / d2)
  let shortTermSigma = standardDeviation;
  if (rangeMean !== undefined && d2Constant !== undefined && d2Constant > 0) {
    shortTermSigma = rangeMean / d2Constant;
  }

  let processCapability = 0;
  let processCapabilityIndex = 0;
  if (shortTermSigma > 0) {
    processCapability = (upperSpecificationLimit - lowerSpecificationLimit) / (6 * shortTermSigma);
    const processCapabilityLower = (meanValue - lowerSpecificationLimit) / (3 * shortTermSigma);
    const processCapabilityUpper = (upperSpecificationLimit - meanValue) / (3 * shortTermSigma);
    processCapabilityIndex = Math.min(processCapabilityLower, processCapabilityUpper);
  }

  return { 
    cp: processCapability, 
    cpk: processCapabilityIndex, 
    pp: processPerformance, 
    ppk: processPerformanceIndex 
  };
}

export function generateHistogram(
  data: number[],
  minValue: number,
  maxValue: number,
  numberOfBins = 10,
) {
  if (data.length === 0) return { bins: [], frequencies: [], curve: [] };

  const binWidth = (maxValue - minValue) / numberOfBins || 1;
  const bins: string[] = [];
  const frequencies: number[] = new Array(numberOfBins).fill(0);

  for (let i = 0; i < numberOfBins; i++) {
    bins.push((minValue + i * binWidth).toFixed(2));
  }

  data.forEach((val) => {
    let binIndex = Math.floor((val - minValue) / binWidth);
    if (binIndex >= numberOfBins) binIndex = numberOfBins - 1;
    if (binIndex < 0) binIndex = 0;
    frequencies[binIndex]++;
  });

  const meanValue = calculateMean(data);
  const standardDeviation = calculateStdDev(data, meanValue);
  const maximumFrequency = Math.max(...frequencies, 1);

  const curve = bins.map((binString) => {
    const binCenterValue = parseFloat(binString);
    if (standardDeviation === 0) return 0;
    const zScore = (binCenterValue - meanValue) / standardDeviation;
    const probabilityDensityFunction = Math.exp(-0.5 * zScore * zScore) / (standardDeviation * Math.sqrt(2 * Math.PI));
    return probabilityDensityFunction * data.length * binWidth; // Factor de escalado real para curva normal sobre histograma
  });

  return { bins, frequencies, curve };
}

export function filterNumbers(...args: any[]): number[] {
  return args
    .map((v) => (v !== undefined && v !== null && v !== "" ? Number(v) : NaN))
    .filter((v) => !isNaN(v));
}

export function calculateAxisRange(
  valueRange: { min: number; max: number },
  limitsArray: any[],
  paddingRatio = 0.2,
) {
  const allLimits = filterNumbers(valueRange.min, valueRange.max, ...limitsArray);
  const totalMin = Math.min(...allLimits),
    totalMax = Math.max(...allLimits);
  const paddingValue =
    (totalMax - totalMin) * paddingRatio ||
    (totalMax === 0 && totalMin === 0 ? 1 : Math.abs(totalMax) * 0.1);
  return {
    min: totalMin - paddingValue,
    max: totalMax + paddingValue,
  };
}

export function calculateRegression(data: { x: number; y: number }[]) {
  let correlationCoefficient = 0,
    rSquared = 0,
    slope = 0,
    yIntercept = 0;
  let formula = "N/A";
  let trendlineData: number[][] = [];

  if (data.length > 1) {
    const meanX = data.reduce((sum, point) => sum + point.x, 0) / data.length;
    const meanY = data.reduce((sum, point) => sum + point.y, 0) / data.length;
    let numerator = 0,
      denominatorX = 0,
      denominatorY = 0;

    data.forEach((point) => {
      const deltaX = point.x - meanX,
        deltaY = point.y - meanY;
      numerator += deltaX * deltaY;
      denominatorX += deltaX * deltaX;
      denominatorY += deltaY * deltaY;
    });

    if (denominatorX > 0 && denominatorY > 0) {
      correlationCoefficient = numerator / Math.sqrt(denominatorX * denominatorY);
      rSquared = correlationCoefficient * correlationCoefficient;
      slope = numerator / denominatorX;
      yIntercept = meanY - slope * meanX;

      const minX = Math.min(...data.map((point) => point.x));
      const maxX = Math.max(...data.map((point) => point.x));
      trendlineData = [
        [minX, slope * minX + yIntercept],
        [maxX, slope * maxX + yIntercept],
      ];

      const sign = yIntercept >= 0 ? "+" : "-";
      formula = `y = ${slope.toFixed(4)}x ${sign} ${Math.abs(yIntercept).toFixed(4)}`;
    }
  }
  return { 
    r: correlationCoefficient, 
    r2: rSquared, 
    m: slope, 
    b: yIntercept, 
    formula, 
    trendlineData 
  };
}
