// src/lib/matchcc.ts
//
// Pair-Matched Case-Control Study analysis.
// Reference: OpenEpi "MatchCC" module (Sullivan KM, Soe MM,
// OpenEpi.com, MatchCCDoc.pdf, 2008).
//
// Table layout (only the discordant cells X, Y are used in calculations;
// the concordant cells W, Z are informational only):
//
//                    Control Exposed   Control Not Exposed
//   Case Exposed          W                    X
//   Case Not Exposed      Y                    Z
//
// mOR (Mantel-Haenszel matched odds ratio, which equals the conditional
// maximum likelihood estimate for pair-matched data) = X / Y.

import { chiSquarePValue } from "./statUtils";

// ---------------------------------------------------------------------
// Binomial distribution helpers (discordant pairs are Binomial(n, p))
// ---------------------------------------------------------------------

function logGamma(x: number): number {
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  let a = coefficients[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) {
    a += coefficients[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function logBinomCoefficient(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

/** Binomial probability mass function: P(X = k) for X ~ Binomial(n, p). */
function binomialPMF(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(logBinomCoefficient(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/** Binomial cumulative distribution function: P(X <= k) for X ~ Binomial(n, p). */
function binomialCDF(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return sum;
}

// ---------------------------------------------------------------------
// Normal distribution helpers (for the Taylor series CI)
// ---------------------------------------------------------------------

function normalQuantile(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p > 1 - pLow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  const q = p - 0.5;
  const r = q * q;
  return (
    (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
    q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

function zCritical(alpha: number): number {
  return normalQuantile(1 - alpha / 2);
}

// ---------------------------------------------------------------------
// McNemar tests
// ---------------------------------------------------------------------

export interface McNemarResult {
  chiSquare: number;
  pValue: number;
  correctedChiSquare: number;
  correctedPValue: number;
}

export function mcNemarTest(x: number, y: number): McNemarResult {
  const chiSquare = x + y > 0 ? ((x - y) * (x - y)) / (x + y) : 0;
  const pValue = chiSquarePValue(chiSquare, 1);

  const correctedChiSquare =
    x + y > 0 ? Math.pow(Math.abs(x - y) - 1, 2) / (x + y) : 0;
  const correctedPValue = chiSquarePValue(correctedChiSquare, 1);

  return { chiSquare, pValue, correctedChiSquare, correctedPValue };
}

// ---------------------------------------------------------------------
// Fisher exact / Mid-P exact tests (binomial, per Rosner 2006)
// ---------------------------------------------------------------------

export interface ExactTestResult {
  oneTailP: number;
  twoTailP: number;
}

export function fisherExactTest(x: number, y: number): ExactTestResult {
  const n = x + y;
  if (n === 0) return { oneTailP: 1, twoTailP: 1 };
  let oneTailP: number;
  if (x < n / 2) {
    oneTailP = binomialCDF(x, n, 0.5);
  } else {
    oneTailP = 1 - binomialCDF(x - 1, n, 0.5);
  }
  return { oneTailP, twoTailP: Math.min(1, 2 * oneTailP) };
}

export function midPExactTest(x: number, y: number): ExactTestResult {
  const n = x + y;
  if (n === 0) return { oneTailP: 1, twoTailP: 1 };
  const fisher = fisherExactTest(x, y);
  const oneTailP = fisher.oneTailP - 0.5 * binomialPMF(x, n, 0.5);
  return { oneTailP, twoTailP: Math.min(1, 2 * oneTailP) };
}

// ---------------------------------------------------------------------
// Odds ratio and confidence intervals
// ---------------------------------------------------------------------

/** Mantel-Haenszel matched OR, which equals the CMLE OR for pair-matched data. */
export function matchedOR(x: number, y: number): number {
  return x / y;
}

/** Taylor series (Woolf-type) confidence interval for the matched OR. */
export function taylorSeriesCI(
  x: number,
  y: number,
  alpha: number = 0.05
): { lower: number; upper: number } {
  const or = x / y;
  const se = Math.sqrt(1 / x + 1 / y);
  const z = zCritical(alpha);
  return {
    lower: Math.exp(Math.log(or) - z * se),
    upper: Math.exp(Math.log(or) + z * se),
  };
}

/**
 * Exact confidence interval bound for the matched OR, solved by bisection
 * on the tail probability of a Binomial(n=x+y, p=psi/(1+psi)) distribution
 * — the conditional distribution of the discordant-pair count given a
 * true odds ratio psi. Set `midP=true` for the Mid-P exact CI, `false`
 * for the (non-mid-p) Fisher exact CI.
 */
function exactORBound(
  x: number,
  y: number,
  alpha: number,
  findLower: boolean,
  midP: boolean
): number {
  const n = x + y;
  const target = alpha / 2;

  const tailAtPsi = (psi: number): number => {
    const p = psi / (1 + psi);
    if (findLower) {
      const pGE = 1 - binomialCDF(x - 1, n, p); // P(X' >= x)
      return midP ? pGE - 0.5 * binomialPMF(x, n, p) : pGE;
    } else {
      const pLE = binomialCDF(x, n, p); // P(X' <= x)
      return midP ? pLE - 0.5 * binomialPMF(x, n, p) : pLE;
    }
  };

  if (x === 0 && findLower) return 0;

  let lo = 1e-9;
  let hi = Math.max((x / Math.max(y, 1)) * 20, 50);
  while (tailAtPsi(hi) > target && hi < 1e9) hi *= 2;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const val = tailAtPsi(mid);
    if (findLower) {
      // increasing in psi
      if (val < target) lo = mid;
      else hi = mid;
    } else {
      // decreasing in psi
      if (val > target) lo = mid;
      else hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function midPExactCI(
  x: number,
  y: number,
  alpha: number = 0.05
): { lower: number; upper: number } {
  return {
    lower: exactORBound(x, y, alpha, true, true),
    upper: exactORBound(x, y, alpha, false, true),
  };
}

export function fisherExactCI(
  x: number,
  y: number,
  alpha: number = 0.05
): { lower: number; upper: number } {
  return {
    lower: exactORBound(x, y, alpha, true, false),
    upper: exactORBound(x, y, alpha, false, false),
  };
}

// ---------------------------------------------------------------------
// Full analysis
// ---------------------------------------------------------------------

export interface MatchCCTable {
  w: number; // case exposed, control exposed (concordant)
  x: number; // case exposed, control not exposed (discordant)
  y: number; // case not exposed, control exposed (discordant)
  z: number; // case not exposed, control not exposed (concordant)
}

export interface MatchCCResult {
  discordantPairs: number;
  mOR: number;
  mcNemar: McNemarResult;
  fisherExact: ExactTestResult;
  midPExact: ExactTestResult;
  taylorCI: { lower: number; upper: number };
  midPCI: { lower: number; upper: number };
  fisherCI: { lower: number; upper: number };
  /** true when discordant pairs < 20, per OpenEpi's own recommendation to prefer exact results */
  fewDiscordantPairs: boolean;
}

export function analyzeMatchCC(
  table: MatchCCTable,
  alpha: number = 0.05
): MatchCCResult {
  const { w, x, y, z } = table;
  if ([w, x, y, z].some((v) => v < 0 || !Number.isInteger(v))) {
    throw new Error("All cell counts must be non-negative integers");
  }
  if (x === 0 || y === 0) {
    throw new Error(
      "Both discordant cells (X and Y) must be greater than zero to compute an odds ratio"
    );
  }

  const discordantPairs = x + y;
  const mOR = matchedOR(x, y);
  const mcNemar = mcNemarTest(x, y);
  const fisherExact = fisherExactTest(x, y);
  const midPExact = midPExactTest(x, y);
  const taylorCI = taylorSeriesCI(x, y, alpha);
  const midPCI = midPExactCI(x, y, alpha);
  const fisherCI = fisherExactCI(x, y, alpha);

  return {
    discordantPairs,
    mOR,
    mcNemar,
    fisherExact,
    midPExact,
    taylorCI,
    midPCI,
    fisherCI,
    fewDiscordantPairs: discordantPairs < 20,
  };
}
