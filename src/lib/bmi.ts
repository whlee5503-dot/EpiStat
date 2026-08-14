import {
  BMI_LENGTH_BOYS,
  BMI_LENGTH_GIRLS,
  BMI_HEIGHT_BOYS,
  BMI_HEIGHT_GIRLS,
} from './who/bmiData';
import type { LmsRow } from './who/wfaData';
import { lmsZScore } from './bodySize';
import type { Sex, LmsParams } from './bodySize';
import type { MeasurementType } from './hfa';
import { LENGTH_HEIGHT_CORRECTION_CM } from './hfa';

function lookupRow(table: LmsRow[], month: number): LmsRow {
  const row = table.find((r) => r.month === month);
  if (!row) {
    throw new Error('No LMS row found for month ' + month);
  }
  return row;
}

/**
 * Select and interpolate LMS parameters for BMI-for-age. Below 24 months,
 * uses the length-based reference table; from 24 months onward, uses the
 * height-based reference table (both tables define a row at exactly
 * month 24, with different values, per WHO convention -- age 24.0
 * resolves to the height table).
 */
export function getBmiLms(sex: Sex, ageMonths: number): LmsParams {
  if (ageMonths < 0 || ageMonths > 60) {
    throw new Error('Age out of range for BMI-for-age (0-60 months): ' + ageMonths);
  }
  const useHeightTable = ageMonths >= 24;
  const table: LmsRow[] = useHeightTable
    ? sex === 'M'
      ? BMI_HEIGHT_BOYS
      : BMI_HEIGHT_GIRLS
    : sex === 'M'
    ? BMI_LENGTH_BOYS
    : BMI_LENGTH_GIRLS;

  const lower = Math.floor(ageMonths);
  const upper = Math.ceil(ageMonths);

  if (lower === upper) {
    const row = lookupRow(table, lower);
    return { L: row.L, M: row.M, S: row.S };
  }

  const rowLower = lookupRow(table, lower);
  const rowUpper = lookupRow(table, upper);
  const frac = ageMonths - lower;

  return {
    L: rowLower.L + (rowUpper.L - rowLower.L) * frac,
    M: rowLower.M + (rowUpper.M - rowLower.M) * frac,
    S: rowLower.S + (rowUpper.S - rowLower.S) * frac,
  };
}

export type BmiClassification =
  | 'severely wasted'
  | 'wasted'
  | 'normal'
  | 'possible risk of overweight'
  | 'overweight'
  | 'obese';

/**
 * WHO BMI-for-age cut-offs (distinct from weight-for-length/height):
 * < -3 severely wasted, < -2 wasted, <= 1 normal, <= 2 possible risk of
 * overweight, <= 3 overweight, > 3 obese. The "possible risk of
 * overweight" tier at +1 SD has no equivalent in weight-for-length/height
 * or weight-for-age classification.
 */
export function classifyBmi(z: number): BmiClassification {
  if (z < -3) return 'severely wasted';
  if (z < -2) return 'wasted';
  if (z <= 1) return 'normal';
  if (z <= 2) return 'possible risk of overweight';
  if (z <= 3) return 'overweight';
  return 'obese';
}

export interface BmiResult {
  bmi: number;
  zScore: number;
  classification: BmiClassification;
  lms: LmsParams;
  measurementExpected: MeasurementType;
  correctionApplied: boolean;
}

/**
 * Computes BMI-for-age. Per WHO's own instructions, the +/-0.7cm
 * length/height correction is applied to the raw measurement BEFORE
 * computing BMI (not after), since it changes the BMI denominator itself.
 */
export function calculateBmi(
  sex: Sex,
  ageMonths: number,
  weightKg: number,
  lengthOrHeightCm: number,
  measurementType: MeasurementType
): BmiResult {
  const measurementExpected: MeasurementType =
    ageMonths < 24 ? 'length' : 'height';

  let adjustedCm = lengthOrHeightCm;
  let correctionApplied = false;

  if (measurementType !== measurementExpected) {
    correctionApplied = true;
    adjustedCm =
      measurementType === 'height' && measurementExpected === 'length'
        ? lengthOrHeightCm + LENGTH_HEIGHT_CORRECTION_CM
        : lengthOrHeightCm - LENGTH_HEIGHT_CORRECTION_CM;
  }

  const heightM = adjustedCm / 100;
  const bmi = weightKg / (heightM * heightM);

  const lms = getBmiLms(sex, ageMonths);
  const zScore = lmsZScore(bmi, lms);

  return {
    bmi,
    zScore,
    classification: classifyBmi(zScore),
    lms,
    measurementExpected,
    correctionApplied,
  };
}
