// src/lib/smr.ts
//
// Standardized Mortality Ratio (SMR) and Mid-P exact test / confidence interval.
// Reference: OpenEpi "Std.Mort.Ratio" module (Soe MM, Sullivan KM,
// OpenEpi.com, SMRDoc.pdf, 2006).
//
// SMR = a / lambda, where:
//   a      = observed number of deaths (assumed Poisson, must be an integer)
//   lambda = expected number of deaths (assumed fixed / invariate)
//
// This first pass implements only the Mid-P exact method (both the
// significance test and its confidence interval), which OpenEpi's own
// documentation describes as "generally the preferred method." Other
// methods (Fisher exact, normal approximation, Byar, Rothman-Greenland,
// Vandenbroucke, Ury & Wiggins) are deferred to later passes — see
// VALIDATION.md for status.

/** Poisson probability mass function: P(X = k) for X ~ Poisson(lambda). */
function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  // log-space to avoid overflow/underflow for large k or lambda
  return Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
}

/** log(k!) via log-gamma (Lanczos approximation), for numerical stability. */
function logFactorial(k: number): number {
  return logGamma(k + 1);
}

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

/** Poisson cumulative distribution function: P(X <= k) for X ~ Poisson(lambda). */
function poissonCDF(k: number, lambda: number): number {
  if (k < 0) return 0;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
}

/** Upper-tail Poisson probability: P(X > k) = 1 - P(X <= k). */
function poissonUpperTail(k: number, lambda: number): number {
  return 1 - poissonCDF(k, lambda);
}

/**
 * Two-tailed Mid-P exact p-value for testing whether observed deaths `a`
 * differ from expected deaths `lambda`, per Rothman & Boice (see
 * OpenEpi SMRDoc.pdf, "Mid-P exact test").
 */
export function midPExactPValue(a: number, lambda: number): number {
  if (a === lambda) return 1;
  if (a > lambda) {
    // P(X > a) + 0.5 * P(X = a), doubled for two-tailed
    const pUpper = poissonUpperTail(a, lambda) + 0.5 * poissonPMF(a, lambda);
    return Math.min(1, 2 * pUpper);
  }
  // a < lambda: P(X <= a-1) + 0.5 * P(X = a), doubled for two-tailed
  const pLower =
    (a >= 1 ? poissonCDF(a - 1, lambda) : 0) + 0.5 * poissonPMF(a, lambda);
  return Math.min(1, 2 * pLower);
}

/**
 * Mid-P exact confidence interval for the observed count `a`, holding
 * `lambda` fixed, at confidence level `1 - alpha` (e.g. alpha = 0.05 for
 * 95% CI). Solved by bisection on the Mid-P tail probability, since the
 * bounds are defined implicitly (see SMRDoc.pdf).
 *
 * Returns the lower/upper bounds for `a` itself (call them aLower, aUpper);
 * the corresponding SMR confidence interval is aLower/lambda to aUpper/lambda.
 */
function midPExactBoundForA(
  a: number,
  lambda: number,
  alpha: number,
  findLower: boolean
): number {
  // Target: find aBound such that the one-sided Mid-P tail probability
  // equals alpha/2, i.e. the boundary of the exact CI for a Poisson count.
  const target = alpha / 2;

  // One-sided Mid-P tail probability that a Poisson(lambda) variable is
  // >= x (for the lower bound search) or <= x (for the upper bound search),
  // evaluated as a continuous function of the notional observed count x
  // by treating lambda as the free parameter to solve for at fixed a.
  //
  // Practically: we solve for the lambda value at which a is exactly at
  // the alpha/2 tail, then invert. Direct root-finding on the standard
  // "exact Poisson CI for a count" formulation is used instead (equivalent
  // and simpler to implement/verify): a Poisson exact CI for a count `a`
  // has lower bound at half the chi-square quantile relationship, but
  // since Mid-P has no closed form, use bisection on the tail-probability
  // function of `a` treated as continuous via the incomplete gamma
  // relationship: P(X >= x | mu) as a function of mu is monotonic.

  const tailAtMu = (mu: number): number => {
    // Mid-P one-sided tail: P(X >= a | mu) - 0.5*P(X = a | mu)  [lower bound search]
    // or P(X <= a | mu) - 0.5*P(X = a | mu)  [upper bound search]
    if (findLower) {
      // As mu decreases, P(X >= a | mu) decreases. Lower bound is the mu
      // where the upper-tail-inclusive Mid-P probability equals alpha/2.
      const pGE = poissonUpperTail(a - 1, mu); // P(X >= a) = P(X > a-1)
      return pGE - 0.5 * poissonPMF(a, mu);
    } else {
      const pLE = poissonCDF(a, mu);
      return pLE - 0.5 * poissonPMF(a, mu);
    }
  };

  if (a === 0 && findLower) return 0;

  let lo = 1e-9;
  let hi = Math.max(lambda * 10, a * 10, 50);
  // Expand hi until tailAtMu(hi) is on the correct side, for safety
  while (tailAtMu(hi) > target && hi < 1e7) hi *= 2;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const val = tailAtMu(mid);
    if (findLower) {
      // tailAtMu is INCREASING in mu (larger rate -> more likely to see
      // a count as large as a); solve for where it crosses target.
      if (val < target) lo = mid;
      else hi = mid;
    } else {
      // tailAtMu is DECREASING in mu (larger rate -> less likely to stay
      // at or below a); solve for where it crosses target.
      if (val > target) lo = mid;
      else hi = mid;
    }
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------
// Standard normal distribution helpers (for approximation methods below)
// ---------------------------------------------------------------------

/** Standard normal CDF, Phi(x), via the erf-based Abramowitz & Stegun approximation. */
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

/** Inverse standard normal CDF (quantile function), via Acklam's rational approximation. */
function normalQuantile(p: number): number {
  // Coefficients for Acklam's algorithm
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

/** Two-sided z critical value for a given alpha (e.g. alpha=0.05 -> ~1.96). */
function zCritical(alpha: number): number {
  return normalQuantile(1 - alpha / 2);
}

// ---------------------------------------------------------------------
// Fisher's exact test (Poisson-based), per Rosner / Rothman & Boice
// ---------------------------------------------------------------------


/** Two-tailed Fisher exact p-value (classical exact Poisson test, no mid-p correction). */
export function fisherExactPValue(a: number, lambda: number): number {
  if (a < lambda) {
    return Math.min(2 * poissonCDF(a, lambda), 1);
  }
  // a >= lambda
  return Math.min(2 * (1 - poissonCDF(a - 1, lambda)), 1);
}

/**
 * Fisher's exact confidence interval bound for the observed count `a`.
 * Garwood (1936) exact Poisson CI:
 *   Lower bound solves P(X <= a-1 | mu) = 1 - alpha/2  (df = 2a)
 *   Upper bound solves P(X <= a     | mu) = alpha/2      (df = 2(a+1))
 * The lower and upper bounds use DIFFERENT tail functions (offset by 1 in
 * the observed count), unlike Mid-P where both bounds use the same
 * 0.5*P(X=a)-adjusted tail. Using poissonCDF(a, mu) for both bounds (as
 * before) silently reused the upper-bound tail function for the lower
 * bound too, producing a lower CI limit equivalent to df=2(a+1) instead
 * of the correct df=2a.
 */
function fisherExactBoundForA(
  a: number,
  alpha: number,
  findLower: boolean
): number {
  const target = findLower ? 1 - alpha / 2 : alpha / 2;
  const tailAtMu = (mu: number): number =>
    findLower ? poissonCDF(a - 1, mu) : poissonCDF(a, mu); // decreasing in mu

  let lo = 1e-9;
  let hi = Math.max(a * 10, 50);
  while (tailAtMu(hi) > target && hi < 1e7) hi *= 2;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const val = tailAtMu(mid);
    if (val > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------
// Byar approximation, per Rothman & Boice / Regidor et al. (1993)
// ---------------------------------------------------------------------

export function byarPValue(a: number, lambda: number): number {
  if (a === lambda) return 1;
  const aStar = a < lambda ? a + 1 : a;
  const byarZ =
    Math.sqrt(9 * aStar) * (1 - 1 / (9 * aStar) - Math.pow(lambda / aStar, 1 / 3));
  return byarZ < 0 ? 2 * normalCDF(byarZ) : 2 * (1 - normalCDF(byarZ));
}

export function byarCI(
  a: number,
  lambda: number,
  alpha: number
): { lower: number; upper: number } {
  if (a === 0) {
    // Byar's formula is undefined at a=0 (division by 9*a); fall back to 0
    // for the lower bound, consistent with OpenEpi's "negative CI shown as
    // 0.0" convention, and use the a+1 branch for the upper bound only.
    const z = zCritical(alpha);
    const aUpp = 1 * (1 - 1 / 9 + (z / 3) * Math.sqrt(1)) ** 3;
    return { lower: 0, upper: aUpp / lambda };
  }
  const z = zCritical(alpha);
  const aLow = a * (1 - 1 / (9 * a) - (z / 3) * Math.sqrt(1 / a)) ** 3;
  const aUpp =
    (a + 1) * (1 - 1 / (9 * (a + 1)) + (z / 3) * Math.sqrt(1 / (a + 1))) ** 3;
  return { lower: Math.max(0, aLow) / lambda, upper: aUpp / lambda };
}

// ---------------------------------------------------------------------
// Rothman-Greenland method (log-transform CI, no associated p-value)
// ---------------------------------------------------------------------

export function rothmanGreenlandCI(
  a: number,
  smr: number,
  alpha: number
): { lower: number; upper: number } {
  const z = zCritical(alpha);
  const se = 1 / Math.sqrt(a);
  return {
    lower: Math.exp(Math.log(smr) - z * se),
    upper: Math.exp(Math.log(smr) + z * se),
  };
}

// ---------------------------------------------------------------------
// Ury & Wiggins method — valid only for 90%, 95%, or 99% CI
// ---------------------------------------------------------------------

const URY_WIGGINS_CONSTANTS: Record<string, [number, number]> = {
  "0.9": [0.65, 1.65],
  "0.95": [1, 2],
  "0.99": [2, 3],
};

export function uryWigginsCI(
  a: number,
  lambda: number,
  confLevel: number
): { lower: number; upper: number } | null {
  const key = String(confLevel);
  const cons = URY_WIGGINS_CONSTANTS[key];
  if (!cons) return null; // only 0.90 / 0.95 / 0.99 supported
  const alpha = 1 - confLevel;
  const z = zCritical(alpha);
  const aLow = a - z * Math.sqrt(a) + cons[0];
  const aUpp = a + z * Math.sqrt(a) + cons[1];
  return { lower: Math.max(0, aLow) / lambda, upper: aUpp / lambda };
}

// ---------------------------------------------------------------------
// Vandenbroucke (1982) method — valid only for 95% CI
// ---------------------------------------------------------------------

export function vandenbrouckeCI(
  a: number,
  lambda: number,
  confLevel: number
): { lower: number; upper: number } | null {
  if (Math.abs(confLevel - 0.95) > 1e-9) return null; // only 95% supported
  const z = zCritical(0.05);
  const low = (Math.sqrt(a) - z * 0.5) ** 2 / lambda;
  const upp = (Math.sqrt(a) + z * 0.5) ** 2 / lambda;
  return { lower: low, upper: upp };
}

// ---------------------------------------------------------------------
// Normal approximation (Wald-type), per Checkoway & Pearce chi-square test
// ---------------------------------------------------------------------

export function normalApproxPValue(a: number, lambda: number): number {
  const chiSqTs = ((a - lambda) * (a - lambda)) / lambda;
  return chiSquarePValueChi1(chiSqTs);
}

/** Upper-tail p-value for a 1-df chi-square statistic (used by the normal approximation test). */
function chiSquarePValueChi1(chiSq: number): number {
  const zVal = Math.sqrt(chiSq);
  return 2 * (1 - normalCDF(zVal));
}

export function normalApproxCI(
  a: number,
  lambda: number,
  alpha: number
): { lower: number; upper: number } {
  const z = zCritical(alpha);
  const low = a - z * Math.sqrt(a);
  const upp = a + z * Math.sqrt(a);
  return { lower: Math.max(0, low) / lambda, upper: upp / lambda };
}

export interface SMRResult {
  observed: number;
  expected: number;
  smr: number;
  midPPValue: number;
  midPCI_lower: number;
  midPCI_upper: number;
  fisherPValue: number;
  fisherCI_lower: number;
  fisherCI_upper: number;
  byarPValue: number;
  byarCI_lower: number;
  byarCI_upper: number;
  rothmanGreenlandCI_lower: number;
  rothmanGreenlandCI_upper: number;
  normalApproxPValue: number;
  normalApproxCI_lower: number;
  normalApproxCI_upper: number;
  /** null when confLevel is not 0.90/0.95/0.99 (Ury & Wiggins is only defined for those) */
  uryWigginsCI: { lower: number; upper: number } | null;
  /** null when confLevel is not 0.95 (Vandenbroucke is only defined for 95% CI) */
  vandenbrouckeCI: { lower: number; upper: number } | null;
}

/**
 * Standardized Mortality Ratio with Mid-P exact test and confidence interval.
 * Matches OpenEpi's "Std.Mort.Ratio" module (Mid-P exact method only, in
 * this first implementation pass).
 *
 * @param observed  Observed number of deaths (a), must be a non-negative integer.
 * @param expected  Expected number of deaths (lambda), must be positive.
 * @param alpha     Significance level for the CI (default 0.05 for 95% CI).
 */
export function analyzeSMR(
  observed: number,
  expected: number,
  alpha: number = 0.05
): SMRResult {
  if (!Number.isInteger(observed) || observed < 0) {
    throw new Error("Observed deaths must be a non-negative integer");
  }
  if (expected <= 0 || !Number.isFinite(expected)) {
    throw new Error("Expected deaths must be a positive number");
  }

  const smr = observed / expected;
  const midPPValue = midPExactPValue(observed, expected);

  // The exact/Mid-P CI is derived on the observed-count scale (treating
  // expected as fixed), then converted to the SMR scale by dividing by
  // expected, per SMRDoc.pdf.
  const aLower = midPExactBoundForA(observed, expected, alpha, true);
  const aUpper = midPExactBoundForA(observed, expected, alpha, false);

  const fisherP = fisherExactPValue(observed, expected);
  const fisherLower = fisherExactBoundForA(observed, alpha, true);
  const fisherUpper = fisherExactBoundForA(observed, alpha, false);

  const byarP = byarPValue(observed, expected);
  const byarBounds = byarCI(observed, expected, alpha);

  const rothmanGreenland = rothmanGreenlandCI(observed, smr, alpha);

  const normalP = normalApproxPValue(observed, expected);
  const normalBounds = normalApproxCI(observed, expected, alpha);

  const confLevel = 1 - alpha;
  const uryWiggins = uryWigginsCI(observed, expected, confLevel);
  const vandenbroucke = vandenbrouckeCI(observed, expected, confLevel);

  return {
    observed,
    expected,
    smr,
    midPPValue,
    midPCI_lower: aLower / expected,
    midPCI_upper: aUpper / expected,
    fisherPValue: fisherP,
    fisherCI_lower: fisherLower / expected,
    fisherCI_upper: fisherUpper / expected,
    byarPValue: byarP,
    byarCI_lower: byarBounds.lower,
    byarCI_upper: byarBounds.upper,
    rothmanGreenlandCI_lower: rothmanGreenland.lower,
    rothmanGreenlandCI_upper: rothmanGreenland.upper,
    normalApproxPValue: normalP,
    normalApproxCI_lower: normalBounds.lower,
    normalApproxCI_upper: normalBounds.upper,
    uryWigginsCI: uryWiggins,
    vandenbrouckeCI: vandenbroucke,
  };
}
