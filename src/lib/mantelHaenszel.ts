// Mantel-Haenszel stratified analysis for 2x2 tables
// Validated against OpenEpi TwobyTwo calculator (openepi.com)

import { chiSquarePValue, Z_95 } from "./statUtils";

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
  const pValueMH = chiSquarePValue(chiSquareMH, 1);

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
    const { a, b, c } = t;
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
    const varA =
      1 / (1 / A + 1 / (n1 - A) + 1 / (m1 - A) + 1 / (n2 - m1 + A));

    stat += (a - A) * (a - A) / varA;
    sumADiff += a - A;
    sumVarA += varA;
  }

  // Tarone's correction
  const statTarone = stat - (sumADiff * sumADiff) / sumVarA;

  const df = strata.length - 1;
  const pValue = chiSquarePValue(statTarone, df);

  return { chiSquare: statTarone, pValue, df };
}
// ---------------------------------------------------------------------
// Breslow-Day test for Risk Ratio homogeneity (Sullivan, TwobyTwoDoc.pdf)
// Companion to the existing OR-based breslowDayTest above.
// ---------------------------------------------------------------------

export interface DirectlyAdjustedRRResult {
  rrDirect: number;
  ciLower: number;
  ciUpper: number;
  perStratum: { rr: number; lnRR: number; weight: number }[];
}

/**
 * Directly adjusted (inverse-variance weighted) risk ratio across strata,
 * per Sullivan TwobyTwoDoc.pdf. Var(ln RRi) = 1/ai - 1/n1i + 1/ci - 1/n0i,
 * where n1i = ai+bi (exposed total), n0i = ci+di (unexposed total).
 */
export function directlyAdjustedRR(strata: TwoByTwoTable[]): DirectlyAdjustedRRResult {
  const perStratum = strata.map((t) => {
    const { a, b, c, d } = t;
    const n1 = a + b;
    const n0 = c + d;
    const rr = (a / n1) / (c / n0);
    const lnRR = Math.log(rr);
    const varLnRR = 1 / a - 1 / n1 + 1 / c - 1 / n0;
    const weight = 1 / varLnRR;
    return { rr, lnRR, weight };
  });

  const sumW = perStratum.reduce((s, r) => s + r.weight, 0);
  const sumWLnRR = perStratum.reduce((s, r) => s + r.weight * r.lnRR, 0);
  const rrDirect = Math.exp(sumWLnRR / sumW);

  const se = 1 / Math.sqrt(sumW);
  const ciLower = rrDirect * Math.exp(-Z_95 * se);
  const ciUpper = rrDirect * Math.exp(Z_95 * se);

  return { rrDirect, ciLower, ciUpper, perStratum };
}

export interface BreslowDayRRResult {
  chiSquare: number;
  pValue: number;
  df: number;
}

/**
 * Breslow-Day test of homogeneity for the Risk Ratio across strata.
 * chi^2 = sum[ wi * (ln(RRi) - ln(RRDirect))^2 ], df = s-1.
 * Validated against Sullivan TwobyTwoDoc.pdf worked example
 * (mother's education / anemia data): expect chiSquare=1.48579, p=.223.
 */
export function breslowDayTestRR(strata: TwoByTwoTable[]): BreslowDayRRResult {
  const { rrDirect, perStratum } = directlyAdjustedRR(strata);
  const lnRRDirect = Math.log(rrDirect);

  const chiSquare = perStratum.reduce((s, r) => {
    const diff = r.lnRR - lnRRDirect;
    return s + r.weight * diff * diff;
  }, 0);

  const df = strata.length - 1;
  const pValue = chiSquarePValue(chiSquare, df);

  return { chiSquare, pValue, df };
}

// ---------------------------------------------------------------------
// Fisher's exact / Mid-P exact test for a single 2x2 table (hypergeometric)
// Distinct from SMR's Poisson-based and MatchCC's binomial-based exact
// tests: here the table margins are fixed and 'a' follows a hypergeometric
// distribution under the null of no association.
// ---------------------------------------------------------------------

function logGammaTwoByTwo(x: number): number {
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGammaTwoByTwo(1 - x);
  }
  x -= 1;
  let a = coefficients[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) {
    a += coefficients[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function logChoose(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logGammaTwoByTwo(n + 1) - logGammaTwoByTwo(k + 1) - logGammaTwoByTwo(n - k + 1);
}

/** P(X = k) for X ~ Hypergeometric(population N, K successes, n draws). */
function hypergeomPMF(k: number, K: number, N: number, n: number): number {
  const kMin = Math.max(0, n - (N - K));
  const kMax = Math.min(n, K);
  if (k < kMin || k > kMax) return 0;
  return Math.exp(logChoose(K, k) + logChoose(N - K, n - k) - logChoose(N, n));
}

export interface ExactTest2x2Result {
  pValue: number;
}

/** P(X <= k) for X ~ Hypergeometric(population N, K successes, n draws). */
function hypergeomCDF(k: number, K: number, N: number, n: number): number {
  if (k < 0) return 0;
  const kMax = Math.min(n, K);
  if (k >= kMax) return 1;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += hypergeomPMF(i, K, N, n);
  }
  return sum;
}

/**
 * Two-tailed Fisher's exact test for a 2x2 table with count data.
 * Conditional on fixed margins, 'a' ~ Hypergeometric(N=total, K=col1, n=row1).
 * Two-tailed p-value = 2 * one-tailed p-value, capped at 1 -- the
 * "doubled one-tail" convention, matching OpenEpi's live TwobyTwo
 * calculator and consistent with the same convention already used
 * elsewhere in this codebase (smr.ts's fisherExactPValue, matchcc.ts's
 * fisherExactTest), rather than the alternative "sum of small p's"
 * convention (e.g. R's fisher.test, scipy.stats.fisher_exact).
 */
export function fisherExact2x2(t: TwoByTwoTable): ExactTest2x2Result {
  const { a, b, c, d } = t;
  const row1 = a + b;
  const col1 = a + c;
  const total = a + b + c + d;
  const mean = (row1 * col1) / total;

  const oneTailP =
    a >= mean
      ? 1 - hypergeomCDF(a - 1, col1, total, row1)
      : hypergeomCDF(a, col1, total, row1);

  return { pValue: Math.min(1, 2 * oneTailP) };
}

/**
 * Mid-P exact test for a 2x2 table: the one-tailed p-value minus half the
 * point probability of the observed table, doubled -- the same
 * doubled-one-tail convention as fisherExact2x2 above, mirroring the
 * mid-p adjustment pattern used in the SMR and MatchCC modules.
 */
export function midPExact2x2(t: TwoByTwoTable): ExactTest2x2Result {
  const { a, b, c, d } = t;
  const row1 = a + b;
  const col1 = a + c;
  const total = a + b + c + d;
  const mean = (row1 * col1) / total;
  const pObs = hypergeomPMF(a, col1, total, row1);

  const oneTailP =
    a >= mean
      ? 1 - hypergeomCDF(a - 1, col1, total, row1)
      : hypergeomCDF(a, col1, total, row1);
  const midPOneTail = oneTailP - 0.5 * pObs;

  return { pValue: Math.max(0, Math.min(1, 2 * midPOneTail)) };
}
