import { normalQuantile } from './statUtils';

// If statUtils.ts does not already export a standard normal CDF, add this
// there instead (Abramowitz & Stegun 26.2.17 approximation, |error| < 7.5e-8):
function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export interface PowerMeanInput {
  confidenceLevel: number; // 0-1, e.g. 0.95 (matches PowerCCInput convention)
  meanDifference: number;  // Group1 - Group2, sign ignored (|Delta| used)
  n1: number;
  s1: number; // sd of group 1
  n2: number;
  s2: number; // sd of group 2
}

export interface PowerMeanResult {
  power: number;    // 0-1
  se: number;
  zAlpha: number;
  zEffect: number;  // |Delta|/SE
}

export function calculatePowerMean(input: PowerMeanInput): PowerMeanResult {
  const { confidenceLevel, meanDifference, n1, s1, n2, s2 } = input;

  if (n1 <= 0 || n2 <= 0 || s1 < 0 || s2 < 0) {
    throw new Error('n1, n2 must be positive and s1, s2 must be non-negative.');
  }
  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('confidenceLevel must be between 0 and 1.');
  }

  const alpha = 1 - confidenceLevel;
  const zAlpha = normalQuantile(1 - alpha / 2);

  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
  const zEffect = Math.abs(meanDifference) / se;

  const power = normalCDF(zEffect - zAlpha);

  return { power, se, zAlpha, zEffect };
}
