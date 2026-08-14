// src/lib/statUtils.ts
//
// Shared statistical distribution utilities used across EpiStat modules
// (Mantel-Haenszel, RxC, and future modules that need chi-square or
// normal-distribution p-values). Centralizing this avoids the different
// modules drifting apart in precision, which previously caused a small
// but real discrepancy against OpenEpi in the Breslow-Day test (see
// VALIDATION.md, Module 1).

// ---------------------------------------------------------------------
// Gamma function (Lanczos approximation)
// ---------------------------------------------------------------------

/** Natural log of the Gamma function (Lanczos approximation, g=7, n=9). */
function logGamma(x: number): number {
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    // Reflection formula
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

// ---------------------------------------------------------------------
// Regularized incomplete gamma function
// ---------------------------------------------------------------------

/** Lower regularized incomplete gamma function P(a, x), series expansion. */
function gammaPSeries(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-14;
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let iter = 1; iter <= ITMAX; iter++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Upper regularized incomplete gamma function Q(a, x), continued fraction. */
function gammaQContinuedFraction(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-14;
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/**
 * Regularized upper incomplete gamma function Q(a, x) = 1 - P(a, x).
 * Chooses series or continued-fraction form depending on x vs a, per
 * Numerical Recipes guidance, for numerical stability across the full range.
 */
function gammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) throw new Error("Invalid arguments to gammaQ");
  if (x === 0) return 1;
  if (x < a + 1) {
    return 1 - gammaPSeries(a, x);
  }
  return gammaQContinuedFraction(a, x);
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * Upper-tail p-value for a chi-square statistic with df degrees of
 * freedom: P(X >= chiSq) = Q(df/2, chiSq/2).
 *
 * This is exact (not a normal-approximation formula like Wilson-Hilferty),
 * so it should be used for ALL degrees of freedom, including df=1, where
 * it agrees with the classical z^2 relationship but computes it directly
 * via the incomplete gamma function instead of a polynomial normal-CDF
 * approximation.
 */
export function chiSquarePValue(chiSq: number, df: number): number {
  if (chiSq <= 0) return 1;
  return gammaQ(df / 2, chiSq / 2);
}

/**
 * Standard normal cumulative distribution function, Φ(x).
 * Polynomial approximation (Abramowitz & Stegun 26.2.17), ~7 decimal
 * digits of accuracy. Kept here for modules that need z-values directly
 * (e.g. confidence intervals, sample size / power calculations) — NOT
 * used internally for chi-square p-values anymore (see chiSquarePValue).
 */
export function normalCDF(x: number): number {
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

/** Two-tailed 95% confidence interval z-value (1.959963985...). */
export const Z_95 = 1.959963985;

/**
 * Inverse standard normal CDF (quantile function), Acklam's algorithm.
 * Accurate to ~1.15e-9 relative error across the full (0,1) domain.
 * Needed for Sample Size / Power modules, which (unlike earlier modules)
 * accept arbitrary user-specified confidence and power levels rather
 * than a fixed set of values.
 */
export function normalQuantile(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('normalQuantile: p must be strictly between 0 and 1');
  }
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
    -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00,
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
    3.754408661907416e+00,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (
      ((((( a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}
