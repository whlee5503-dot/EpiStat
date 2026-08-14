// EpiStat Module 8.4: Sample Size for Comparing Two Means
// Formula follows OpenEpi's SSMeanDoc.pdf (Soe & Sullivan), citing
// Bernard Rosner, Fundamentals of Biostatistics (5th ed.), equation 8.27.

import { normalQuantile } from './statUtils';

export interface SampleSizeMeanInput {
  confidenceLevel: number;
  power: number;
  ratio: number;
  sd1: number;
  sd2: number;
  meanDifference: number;
}

export interface SampleSizeMeanResult {
  n1: number;
  n2: number;
}

/**
 * n1 = (sd1^2 + sd2^2 / kappa) * (z_alpha + z_beta)^2 / delta^2
 * n2 = kappa * n1
 * (Rosner, equation 8.27; reduces to the classic equal-variance two-sample
 * formula n = 2*sigma^2*(z_a+z_b)^2/delta^2 when kappa=1 and sd1=sd2.)
 */
export function calculateSampleSizeMean(
  input: SampleSizeMeanInput
): SampleSizeMeanResult {
  const { confidenceLevel, power, ratio: kappa, sd1, sd2, meanDifference: delta } = input;

  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 100%, exclusive');
  }
  if (power <= 0 || power >= 1) {
    throw new Error('Power must be between 0 and 100%, exclusive');
  }
  if (kappa <= 0) throw new Error('Ratio of Group 2 to Group 1 must be greater than 0');
  if (sd1 <= 0 || sd2 <= 0) throw new Error('Standard deviations must be greater than 0');
  if (delta <= 0) throw new Error('Mean difference must be greater than 0');

  const zAlpha = normalQuantile(1 - (1 - confidenceLevel) / 2);
  const zBeta = normalQuantile(power);

  const n1Raw = (sd1 * sd1 + (sd2 * sd2) / kappa) * (zAlpha + zBeta) ** 2 / (delta * delta);
  const n1 = Math.ceil(n1Raw);
  const n2 = Math.ceil(kappa * n1);

  return { n1, n2 };
}
