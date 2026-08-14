import {
  HFA_LENGTH_BOYS,
  HFA_LENGTH_GIRLS,
  HFA_HEIGHT_BOYS,
  HFA_HEIGHT_GIRLS,
} from './who/hfaData';
import type { LmsRow } from './who/wfaData';
import { lmsZScore } from './bodySize';
import type { Sex, LmsParams } from './bodySize';

export type MeasurementType = 'length' | 'height';

function lookupRow(table: LmsRow[], month: number): LmsRow {
  const row = table.find((r) => r.month === month);
  if (!row) {
    throw new Error('No LMS row found for month ' + month);
  }
  return row;
}

/**
 * Select and interpolate LMS parameters for Height/Length-for-age.
 * Below 24 months, uses the recumbent-length reference table; from 24
 * months onward, uses the standing-height reference table. Both tables
 * define a row at exactly month 24 (with different M values reflecting
 * the ~0.7cm length/height measurement difference); age 24.0 resolves to
 * the height table, per WHO convention (24 months and older = standing
 * height as the primary measurement).
 */
export function getHfaLms(sex: Sex, ageMonths: number): LmsParams {
  if (ageMonths < 0 || ageMonths > 60) {
    throw new Error('Age out of range for HFA (0-60 months): ' + ageMonths);
  }
  const useHeightTable = ageMonths >= 24;
  const table: LmsRow[] = useHeightTable
    ? sex === 'M'
      ? HFA_HEIGHT_BOYS
      : HFA_HEIGHT_GIRLS
    : sex === 'M'
    ? HFA_LENGTH_BOYS
    : HFA_LENGTH_GIRLS;

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

export type HfaClassification = 'severely stunted' | 'stunted' | 'normal';

export function classifyHfa(z: number): HfaClassification {
  if (z < -3) return 'severely stunted';
  if (z < -2) return 'stunted';
  return 'normal';
}

/**
 * WHO's standard correction when the "wrong" measurement type was taken
 * for the child's age (e.g. a 30-month-old measured lying down instead of
 * standing). This constant is independently confirmed by WHO's own
 * reference tables: at the exact 24-month boundary, the length-table M
 * and height-table M differ by exactly 0.7cm for both sexes.
 */
export const LENGTH_HEIGHT_CORRECTION_CM = 0.7;

export interface HfaResult {
  zScore: number;
  classification: HfaClassification;
  lms: LmsParams;
  measurementExpected: MeasurementType;
  correctionApplied: boolean;
}

export function calculateHfa(
  sex: Sex,
  ageMonths: number,
  measuredValue: number,
  measurementType: MeasurementType
): HfaResult {
  const measurementExpected: MeasurementType =
    ageMonths < 24 ? 'length' : 'height';

  let adjustedValue = measuredValue;
  let correctionApplied = false;

  if (measurementType !== measurementExpected) {
    correctionApplied = true;
    if (measurementType === 'height' && measurementExpected === 'length') {
      // Child under 24 months measured standing; add correction to
      // approximate recumbent length.
      adjustedValue = measuredValue + LENGTH_HEIGHT_CORRECTION_CM;
    } else {
      // Child 24 months or older measured lying down; subtract
      // correction to approximate standing height.
      adjustedValue = measuredValue - LENGTH_HEIGHT_CORRECTION_CM;
    }
  }

  const lms = getHfaLms(sex, ageMonths);
  const zScore = lmsZScore(adjustedValue, lms);

  return {
    zScore,
    classification: classifyHfa(zScore),
    lms,
    measurementExpected,
    correctionApplied,
  };
}
