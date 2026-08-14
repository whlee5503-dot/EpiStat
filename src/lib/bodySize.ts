// EpiStat Module 6: BodySize (WHO Child Growth Standards, Weight-for-Age)
// First pass: WFA only, WHO 0-59 months reference population.
// LMS method (Cole TJ, 1990) as used by WHO Child Growth Standards.

import { WFA_BOYS, WFA_GIRLS } from './who/wfaData';
import type { LmsRow } from './who/wfaData';

export type Sex = 'M' | 'F';

export interface LmsParams {
  L: number;
  M: number;
  S: number;
}

export function getWfaLms(sex: Sex, ageMonths: number): LmsParams {
  if (ageMonths < 0 || ageMonths > 60) {
    throw new Error('Age out of range for WFA (0-60 months): ' + ageMonths);
  }
  const table: LmsRow[] = sex === 'M' ? WFA_BOYS : WFA_GIRLS;

  const lower = Math.floor(ageMonths);
  const upper = Math.ceil(ageMonths);

  if (lower === upper) {
    const row = table[lower];
    return { L: row.L, M: row.M, S: row.S };
  }

  const rowLower = table[lower];
  const rowUpper = table[upper];
  const frac = ageMonths - lower;

  return {
    L: rowLower.L + (rowUpper.L - rowLower.L) * frac,
    M: rowLower.M + (rowUpper.M - rowLower.M) * frac,
    S: rowLower.S + (rowUpper.S - rowLower.S) * frac,
  };
}

export function lmsZScore(x: number, lms: LmsParams): number {
  const { L, M, S } = lms;
  if (Math.abs(L) < 1e-10) {
    return Math.log(x / M) / S;
  }
  return (Math.pow(x / M, L) - 1) / (L * S);
}

export function lmsValueForZ(z: number, lms: LmsParams): number {
  const { L, M, S } = lms;
  if (Math.abs(L) < 1e-10) {
    return M * Math.exp(S * z);
  }
  return M * Math.pow(1 + L * S * z, 1 / L);
}

export type WfaClassification =
  | 'severely underweight'
  | 'underweight'
  | 'normal';

export function classifyWfa(z: number): WfaClassification {
  if (z < -3) return 'severely underweight';
  if (z < -2) return 'underweight';
  return 'normal';
}

export interface WfaResult {
  zScore: number;
  classification: WfaClassification;
  lms: LmsParams;
}

export function calculateWfa(
  sex: Sex,
  ageMonths: number,
  weightKg: number
): WfaResult {
  const lms = getWfaLms(sex, ageMonths);
  const zScore = lmsZScore(weightKg, lms);
  return {
    zScore,
    classification: classifyWfa(zScore),
    lms,
  };
}
