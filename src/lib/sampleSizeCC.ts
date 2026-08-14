// EpiStat Module 8.2: Sample Size for an Unmatched Case-Control Study
// Formulas follow OpenEpi's SSCCDoc.pdf (Sullivan & Soe), citing:
//   Kelsey JL, Whittemore AS, Evans AS, Thompson WD. Methods in
//   Observational Epidemiology. Oxford University Press, 1996 (Table 12-15).
//   Fleiss JL. Statistical Methods for Rates and Proportions. John Wiley
//   & Sons, 1981 (formulas 3.18 and 3.19).

import { normalQuantile } from './statUtils';

export interface SampleSizeCCInput {
  confidenceLevel: number;
  power: number;
  controlsToCasesRatio: number;
  controlExposure: number;
  oddsRatio?: number;
  caseExposure?: number;
}

export interface SampleSizeCCResult {
  p1: number;
  p2: number;
  oddsRatio: number;
  casesKelsey: number;
  controlsKelsey: number;
  casesFleiss: number;
  controlsFleiss: number;
  casesFleissCC: number;
  controlsFleissCC: number;
}

function orToP1(oddsRatio: number, p2: number): number {
  return (oddsRatio * p2) / (1 - p2 + oddsRatio * p2);
}

function p1p2ToOR(p1: number, p2: number): number {
  return (p1 * (1 - p2)) / (p2 * (1 - p1));
}

export function calculateSampleSizeCC(input: SampleSizeCCInput): SampleSizeCCResult {
  const { confidenceLevel, power, controlsToCasesRatio: r, controlExposure: p2 } = input;

  if (confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Confidence level must be between 0 and 100%, exclusive');
  }
  if (power <= 0 || power >= 1) {
    throw new Error('Power must be between 0 and 100%, exclusive');
  }
  if (r <= 0) throw new Error('Ratio of controls to cases must be greater than 0');
  if (p2 <= 0 || p2 >= 1) {
    throw new Error('Control exposure must be between 0 and 100%, exclusive');
  }

  let p1: number;
  let oddsRatio: number;
  if (input.oddsRatio !== undefined) {
    oddsRatio = input.oddsRatio;
    p1 = orToP1(oddsRatio, p2);
  } else if (input.caseExposure !== undefined) {
    p1 = input.caseExposure;
    oddsRatio = p1p2ToOR(p1, p2);
  } else {
    throw new Error('Provide either an odds ratio or a case exposure proportion');
  }
  if (p1 <= 0 || p1 >= 1) {
    throw new Error('Derived/entered case exposure must be between 0 and 100%, exclusive');
  }

  const zAlpha = normalQuantile(1 - (1 - confidenceLevel) / 2);
  const zBeta = normalQuantile(power);

  const q1 = 1 - p1;
  const q2 = 1 - p2;
  const pBar = (p1 + r * p2) / (r + 1);
  const qBar = 1 - pBar;
  const diff2 = (p1 - p2) * (p1 - p2);

  const nKelseyRaw =
    ((r + 1) * pBar * qBar * (zAlpha + zBeta) ** 2) / (r * diff2);

  const nFleissRaw =
    (zAlpha * Math.sqrt((r + 1) * pBar * qBar) + zBeta * Math.sqrt(r * p1 * q1 + p2 * q2)) ** 2 /
    (r * diff2);

  const nFleissCCRaw =
    (nFleissRaw / 4) *
    (1 + Math.sqrt(1 + (2 * (r + 1)) / (r * nFleissRaw * Math.abs(p1 - p2)))) ** 2;

  const casesKelsey = Math.ceil(nKelseyRaw);
  const casesFleiss = Math.ceil(nFleissRaw);
  const casesFleissCC = Math.ceil(nFleissCCRaw);

  return {
    p1,
    p2,
    oddsRatio,
    casesKelsey,
    controlsKelsey: Math.ceil(casesKelsey * r),
    casesFleiss,
    controlsFleiss: Math.ceil(casesFleiss * r),
    casesFleissCC,
    controlsFleissCC: Math.ceil(casesFleissCC * r),
  };
}
