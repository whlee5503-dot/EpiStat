// Mantel-Haenszel stratified analysis for 2x2 tables
// Validated against OpenEpi TwobyTwo calculator (openepi.com)

export interface TwoByTwoTable {
  a: number; // exposed, disease+
  b: number; // exposed, disease-
  c: number; // unexposed, disease+
  d: number; // unexposed, disease-
}

function n(t: TwoByTwoTable): number {
  return t.a + t.b + t.c + t.d;
}

// --- Single table stats (used for crude and per-stratum rows) ---

export interface SingleTableResult {
  chiSquareUncorrected: number;
  chiSquareYates: number;
  oddsRatio: number;
  riskRatio: number;
  riskDifference: number;
}

export function analyzeSingleTable(t: TwoByTwoTable): SingleTableResult {
  const { a, b, c, d } = t;
  const total = n(t);
  const row1 = a + b;
  const row2 = c + d;
  const col1 = a + c;
  const col2 = b + d;

  const adMinusBc = a * d - b * c;

  const chiSquareUncorrected =
    (total * adMinusBc * adMinusBc) / (row1 * row2 * col1 * col2);

  const yatesNumerator = Math.abs(adMinusBc) - total / 2;
  const chiSquareYates =
    (total * yatesNumerator * yatesNumerator) / (row1 * row2 * col1 * col2);

  const oddsRatio = (a * d) / (b * c);
  const riskRatio = (a / row1) / (c / row2);
  const riskDifference = a / row1 - c / row2;

  return { chiSquareUncorrected, chiSquareYates, oddsRatio, riskRatio, riskDifference };
}

// --- Mantel-Haenszel stratified combination ---

export interface MantelHaenszelResult {
  orMH: number;
  rrMH: number;
  chiSquareMH: number;
  pValueMH: number; // two-tailed
}

// Standard normal CDF approximation (Abramowitz & Stegun 7.1.26)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) prob = 1 - prob;
  return prob;
}

// chi-square (1 df) p-value from statistic, via normal approximation on sqrt(chi2)
function chiSquarePValue1df(chiSq: number): number {
  const z = Math.sqrt(chiSq);
  return 2 * (1 - normalCDF(z));
}

export function mantelHaenszel(strata: TwoByTwoTable[]): MantelHaenszelResult {
  let sumR = 0; // for OR: a*d/n
  let sumS = 0; // for OR: b*c/n
  let rrNum = 0; // for RR: a*(c+d)/n
  let rrDenom = 0; // for RR: c*(a+b)/n
  let sumA = 0;
  let sumE = 0;
  let sumV = 0;

  for (const t of strata) {
    const { a, b, c, d } = t;
    const ni = n(t);
    const row1 = a + b;
    const row2 = c + d;
    const col1 = a + c;
    const col2 = b + d;

    sumR += (a * d) / ni;
    sumS += (b * c) / ni;

    rrNum += (a * row2) / ni;
    rrDenom += (c * row1) / ni;

    sumA += a;
    sumE += (row1 * col1) / ni;
    sumV += (row1 * row2 * col1 * col2) / (ni * ni * (ni - 1));
  }

  const orMH = sumR / sumS;
  const rrMH = rrNum / rrDenom;

  const diff = sumA - sumE;
  const chiSquareMH = (diff * diff) / sumV;
  const pValueMH = chiSquarePValue1df(chiSquareMH);

  return { orMH, rrMH, chiSquareMH, pValueMH };
}
