// EpiStat Module 8.5: Power for an Unmatched Case-Control Study
// Formula follows OpenEpi's PowerCCDoc.pdf (Soe & Sullivan), citing
// Schlesselman JJ. Case-control studies: Design, Conduct, Analysis
// (1982), formula 6.9, and Sahai & Khurshid (1996), formula 23 for the
// continuity-corrected version. This is the algebraic inverse of the
// Fleiss sample-size formula in sampleSizeCC.ts, solved for power given
// a fixed sample size (rather than for sample size given a target power).

import { normalQuantile, normalCDF } from './statUtils';

export interface PowerCCInput {
  confidenceLevel: number;
  cases: number;
  controls: number;
  caseExposure: number;
  controlExposure: number;
}

export interface PowerCCResult {
  oddsRatio: number;
  powerUncorrected: number;
  powerContinuityCorrected: number;
}

export function calculatePowerCC(input: PowerCCInput): PowerCCResult {
  const { confidenceLevel, cases: n1, controls: n2, caseExposure: p1, controlExposure: p2 } = input;

  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 100%, exclusive');
  }
  if (n1 <= 0 || n2 <= 0) throw new Error('Number of cases and controls must be greater than 0');
  if (p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1) {
    throw new Error('Exposure proportions must be between 0 and 100%, exclusive');
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

  const oddsRatio = (p1 * q2) / (p2 * q1);

  return { oddsRatio, powerUncorrected, powerContinuityCorrected };
}
