// EpiStat Modules 8.6-8.8: Power for Cohort, Clinical Trial, and
// Cross-Sectional studies. All three share the identical underlying
// formula in OpenEpi's documentation (PowerCrossDoc.pdf verified to be
// structurally identical to PowerCCDoc.pdf, with "exposed/unexposed" and
// "prevalence" in place of "case/control" and "exposure" -- the same
// relationship as Sample Size Cohort/RCT/Cross-Sectional sharing one
// combined module, SSCohortDoc.pdf). This is the algebraic inverse of
// the Fleiss sample-size formula in sampleSizeCohort.ts.

import { normalQuantile, normalCDF } from './statUtils';

export interface PowerCohortInput {
  confidenceLevel: number;
  exposed: number;
  unexposed: number;
  exposedOutcome: number;
  unexposedOutcome: number;
}

export interface PowerCohortResult {
  riskRatio: number;
  powerUncorrected: number;
  powerContinuityCorrected: number;
}

export function calculatePowerCohort(input: PowerCohortInput): PowerCohortResult {
  const { confidenceLevel, exposed: n1, unexposed: n2, exposedOutcome: p1, unexposedOutcome: p2 } = input;

  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 100%, exclusive');
  }
  if (n1 <= 0 || n2 <= 0) throw new Error('Sample sizes must be greater than 0');
  if (p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1) {
    throw new Error('Outcome proportions must be between 0 and 100%, exclusive');
  }

  const kappa = n2 / n1;
  const q1 = 1 - p1;
  const q2 = 1 - p2;
  const delta = Math.abs(p1 - p2);
  const pBar = (p1 * n1 + p2 * n2) / (n1 + n2);
  const qBar = 1 - pBar;

  const zAlpha = normalQuantile(1 - (1 - confidenceLevel) / 2);
  const denom = Math.sqrt(p1 * q1 + (p2 * q2) / kappa);

  const zPowerUncorrected =
    (delta * Math.sqrt(n1) - zAlpha * Math.sqrt((1 + 1 / kappa) * pBar * qBar)) / denom;
  const powerUncorrected = normalCDF(zPowerUncorrected);

  const nPrime = n1 - (kappa + 1) / (kappa * delta);
  const zPowerCC =
    (delta * Math.sqrt(Math.max(nPrime, 0)) - zAlpha * Math.sqrt((1 + 1 / kappa) * pBar * qBar)) /
    denom;
  const powerContinuityCorrected = normalCDF(zPowerCC);

  return { riskRatio: p1 / p2, powerUncorrected, powerContinuityCorrected };
}
