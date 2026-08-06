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

// --- Normal distribution helpers ---

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

function chiSquarePValue1df(chiSq: number): number {
  const z = Math.sqrt(chiSq);
  return 2 * (1 - normalCDF(z));
}

// Wilson-Hilferty approximation for chi-square p-value with df degrees of freedom
function chiSquarePValueGeneral(chiSq: number, df: number): number {
  const h = 2 / (9 * df);
  const z = (Math.pow(chiSq / df, 1 / 3) - (1 - h)) / Math.sqrt(h);
  return 1 - normalCDF(z);
}

const Z_95 = 1.959963985;

// --- Mantel-Haenszel stratified combination ---

export interface MantelHaenszelResult {
  orMH: number;
  orMH_CI_lower: number;
  orMH_CI_upper: number;
  rrMH: number;
  rrMH_CI_lower: number;
  rrMH_CI_upper: number;
  chiSquareMH: number;
  pValueMH: number; // two-tailed
  breslowDayOR: { chiSquare: number; pValue: number; df: number };
}

export function mantelHaenszel(strata: TwoByTwoTable[]): MantelHaenszelResult {
  let sumR = 0; // for OR: a*d/n
  let sumS = 0; // for OR: b*c/n
  let rrNum = 0; // for RR: a*n2/n
  let rrDenom = 0; // for RR: c*n1/n
  let sumA = 0;
  let sumE = 0;
  let sumV = 0;

  // For OR CI (Robins-Greenland-Breslow)
  let sumPR = 0;
  let sumPSplusQR = 0;
  let sumQS = 0;

  // For RR CI (Greenland-Robins)
  let rrVarNum = 0;

  for (const t of strata) {
    const { a, b, c, d } = t;
    const ni = n(t);
    const n1 = a + b; // exposed total
    const n2 = c + d; // unexposed total
    const col1 = a + c;
    const col2 = b + d;

    const R = (a * d) / ni;
    const S = (b * c) / ni;
    sumR += R;
    sumS += S;

    rrNum += (a * n2) / ni;
    rrDenom += (c * n1) / ni;

    sumA += a;
    sumE += (n1 * col1) / ni;
    sumV += (n1 * n2 * col1 * col2) / (ni * ni * (ni - 1));

    const P = (a + d) / ni;
    const Q = (b + c) / ni;
    sumPR += P * R;
    sumPSplusQR += P * S + Q * R;
    sumQS += Q * S;

    rrVarNum += (n1 * n2 * col1 - a * c * ni) / (ni * ni);
  }

  const orMH = sumR / sumS;
  const rrMH = rrNum / rrDenom;

  const varLnOR =
    sumPR / (2 * sumR * sumR) +
    sumPSplusQR / (2 * sumR * sumS) +
    sumQS / (2 * sumS * sumS);
  const seLnOR = Math.sqrt(varLnOR);
  const orMH_CI_lower = orMH * Math.exp(-Z_95 * seLnOR);
  const orMH_CI_upper = orMH * Math.exp(Z_95 * seLnOR);

  const varLnRR = rrVarNum / (rrNum * rrDenom);
  const seLnRR = Math.sqrt(varLnRR);
  const rrMH_CI_lower = rrMH * Math.exp(-Z_95 * seLnRR);
  const rrMH_CI_upper = rrMH * Math.exp(Z_95 * seLnRR);

  const diff = sumA - sumE;
  const chiSquareMH = (diff * diff) / sumV;
  const pValueMH = chiSquarePValue1df(chiSquareMH);

  const breslowDayOR = breslowDayTest(strata, orMH);

  return {
    orMH,
    orMH_CI_lower,
    orMH_CI_upper,
    rrMH,
    rrMH_CI_lower,
    rrMH_CI_upper,
    chiSquareMH,
    pValueMH,
    breslowDayOR,
  };
}

// --- Breslow-Day test (Tarone-corrected) for homogeneity of OR across strata ---

function breslowDayTest(
  strata: TwoByTwoTable[],
  commonOR: number
): { chiSquare: number; pValue: number; df: number } {
  let stat = 0;
  let sumADiff = 0;
  let sumVarA = 0;

  for (const t of strata) {
    const { a, b, c, d } = t;
    const ni = n(t);
    const n1 = a + b;
    const m1 = a + c;

    const psi = commonOR;
    let A: number;

    if (Math.abs(psi - 1) < 1e-9) {
      A = (n1 * m1) / ni;
    } else {
      const aCoef = 1 - psi;
      const bCoef = ni - (1 - psi) * (n1 + m1);
      const cCoef = -psi * n1 * m1;
      const discriminant = bCoef * bCoef - 4 * aCoef * cCoef;
      const root1 = (-bCoef + Math.sqrt(discriminant)) / (2 * aCoef);
      const root2 = (-bCoef - Math.sqrt(discriminant)) / (2 * aCoef);
      const lower = Math.max(0, n1 + m1 - ni);
      const upper = Math.min(n1, m1);
      A = root1 >= lower && root1 <= upper ? root1 : root2;
    }

    const n2 = ni - n1;
    const m2 = ni - m1;
    const varA =
      1 / (1 / A + 1 / (n1 - A) + 1 / (m1 - A) + 1 / (n2 - m1 + A));

    stat += (a - A) * (a - A) / varA;
    sumADiff += a - A;
    sumVarA += varA;
  }

  // Tarone's correction
  const statTarone = stat - (sumADiff * sumADiff) / sumVarA;

  const df = strata.length - 1;
  const pValue =
    df === 1 ? chiSquarePValue1df(statTarone) : chiSquarePValueGeneral(statTarone, df);

  return { chiSquare: statTarone, pValue, df };
}
