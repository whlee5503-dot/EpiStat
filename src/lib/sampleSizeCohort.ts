// EpiStat Module 8.3: Sample Size for a Cohort / Cross-Sectional /
// Clinical Trial Study
// Formulas follow OpenEpi's SSCohortDoc.pdf (Sullivan & Soe), same
// Kelsey/Fleiss/Fleiss+CC structure as the Unmatched Case-Control module
// (sampleSizeCC.ts), but roles are relabeled: "exposed" (n1) vs.
// "unexposed" (n2 = r * n1), and the outcome proportions p1 (exposed)
// and p2 (unexposed) can be derived from an odds ratio, risk ratio, risk
// difference, or entered directly.

import { normalQuantile } from './statUtils';

export type EffectMeasure = 'oddsRatio' | 'riskRatio' | 'riskDifference' | 'exposedOutcome';

export interface SampleSizeCohortInput {
  confidenceLevel: number;
  power: number;
  unexposedToExposedRatio: number;
  unexposedOutcome: number;
  oddsRatio?: number;
  riskRatio?: number;
  riskDifference?: number;
  exposedOutcome?: number;
}

export interface SampleSizeCohortResult {
  p1: number;
  p2: number;
  oddsRatio: number;
  riskRatio: number;
  riskDifference: number;
  exposedKelsey: number;
  unexposedKelsey: number;
  exposedFleiss: number;
  unexposedFleiss: number;
  exposedFleissCC: number;
  unexposedFleissCC: number;
}

function orToP1(oddsRatio: number, p2: number): number {
  return (oddsRatio * p2) / (1 - p2 + oddsRatio * p2);
}
function p1ToOR(p1: number, p2: number): number {
  return (p1 * (1 - p2)) / (p2 * (1 - p1));
}

export function calculateSampleSizeCohort(
  input: SampleSizeCohortInput
): SampleSizeCohortResult {
  const { confidenceLevel, power, unexposedToExposedRatio: r, unexposedOutcome: p2 } = input;

  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 100%, exclusive');
  }
  if (power <= 0 || power >= 1) {
    throw new Error('Power must be between 0 and 100%, exclusive');
  }
  if (r <= 0) throw new Error('Ratio of unexposed to exposed must be greater than 0');
  if (p2 <= 0 || p2 >= 1) {
    throw new Error('Unexposed outcome must be between 0 and 100%, exclusive');
  }

  let p1: number;
  if (input.oddsRatio !== undefined) {
    p1 = orToP1(input.oddsRatio, p2);
  } else if (input.riskRatio !== undefined) {
    p1 = input.riskRatio * p2;
  } else if (input.riskDifference !== undefined) {
    p1 = input.riskDifference + p2;
  } else if (input.exposedOutcome !== undefined) {
    p1 = input.exposedOutcome;
  } else {
    throw new Error('Provide an odds ratio, risk ratio, risk difference, or exposed outcome proportion');
  }
  if (p1 <= 0 || p1 >= 1) {
    throw new Error('Derived/entered exposed outcome must be between 0 and 100%, exclusive');
  }

  const zAlpha = normalQuantile(1 - (1 - confidenceLevel) / 2);
  const zBeta = normalQuantile(power);

  const q1 = 1 - p1;
  const q2 = 1 - p2;
  const pBar = (p1 + r * p2) / (r + 1);
  const qBar = 1 - pBar;
  const diff2 = (p1 - p2) * (p1 - p2);

  const nKelseyRaw = ((r + 1) * pBar * qBar * (zAlpha + zBeta) ** 2) / (r * diff2);

  const nFleissRaw =
    (zAlpha * Math.sqrt((r + 1) * pBar * qBar) + zBeta * Math.sqrt(r * p1 * q1 + p2 * q2)) ** 2 /
    (r * diff2);

  const nFleissCCRaw =
    (nFleissRaw / 4) *
    (1 + Math.sqrt(1 + (2 * (r + 1)) / (r * nFleissRaw * Math.abs(p1 - p2)))) ** 2;

  const exposedKelsey = Math.ceil(nKelseyRaw);
  const exposedFleiss = Math.ceil(nFleissRaw);
  const exposedFleissCC = Math.ceil(nFleissCCRaw);

  return {
    p1,
    p2,
    oddsRatio: p1ToOR(p1, p2),
    riskRatio: p1 / p2,
    riskDifference: p1 - p2,
    exposedKelsey,
    unexposedKelsey: Math.ceil(exposedKelsey * r),
    exposedFleiss,
    unexposedFleiss: Math.ceil(exposedFleiss * r),
    exposedFleissCC,
    unexposedFleissCC: Math.ceil(exposedFleissCC * r),
  };
}
