import { WFL_BOYS, WFL_GIRLS, WFH_BOYS, WFH_GIRLS } from './who/wfhData';
import type { LmsRowByLength } from './who/wfhData';
import { lmsZScore } from './bodySize';
import type { Sex, LmsParams } from './bodySize';
import type { MeasurementType } from './hfa';
import { LENGTH_HEIGHT_CORRECTION_CM } from './hfa';

function interpolateByLength(
  table: LmsRowByLength[],
  cm: number
): LmsParams {
  const step = 0.5;
  const first = table[0].lengthCm;
  const last = table[table.length - 1].lengthCm;
  if (cm < first || cm > last) {
    throw new Error(
      `Length/height ${cm}cm out of range for this table (${first}-${last}cm)`
    );
  }

  const idxFloat = (cm - first) / step;
  const idxLower = Math.floor(idxFloat);
  const idxUpper = Math.ceil(idxFloat);

  if (idxLower === idxUpper) {
    const row = table[idxLower];
    return { L: row.L, M: row.M, S: row.S };
  }

  const rowLower = table[idxLower];
  const rowUpper = table[idxUpper];
  const frac = idxFloat - idxLower;

  return {
    L: rowLower.L + (rowUpper.L - rowLower.L) * frac,
    M: rowLower.M + (rowUpper.M - rowLower.M) * frac,
    S: rowLower.S + (rowUpper.S - rowLower.S) * frac,
  };
}

export type WfhTable = 'WFL' | 'WFH';

export function getWfhLms(
  sex: Sex,
  ageMonths: number,
  lengthOrHeightCm: number
): { lms: LmsParams; tableUsed: WfhTable } {
  if (ageMonths < 0 || ageMonths > 60) {
    throw new Error('Age out of range for WFH (0-60 months): ' + ageMonths);
  }
  const useHeightTable = ageMonths >= 24;
  const table: LmsRowByLength[] = useHeightTable
    ? sex === 'M'
      ? WFH_BOYS
      : WFH_GIRLS
    : sex === 'M'
    ? WFL_BOYS
    : WFL_GIRLS;

  return {
    lms: interpolateByLength(table, lengthOrHeightCm),
    tableUsed: useHeightTable ? 'WFH' : 'WFL',
  };
}

export type WfhClassification =
  | 'severely wasted'
  | 'wasted'
  | 'normal'
  | 'overweight'
  | 'obese';

export function classifyWfh(z: number): WfhClassification {
  if (z < -3) return 'severely wasted';
  if (z < -2) return 'wasted';
  if (z <= 2) return 'normal';
  if (z <= 3) return 'overweight';
  return 'obese';
}

export interface WfhResult {
  zScore: number;
  classification: WfhClassification;
  lms: LmsParams;
  tableUsed: WfhTable;
  measurementExpected: MeasurementType;
  correctionApplied: boolean;
}

export function calculateWfh(
  sex: Sex,
  ageMonths: number,
  weightKg: number,
  lengthOrHeightCm: number,
  measurementType: MeasurementType
): WfhResult {
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

  const { lms, tableUsed } = getWfhLms(sex, ageMonths, adjustedCm);
  const zScore = lmsZScore(weightKg, lms);

  return {
    zScore,
    classification: classifyWfh(zScore),
    lms,
    tableUsed,
    measurementExpected,
    correctionApplied,
  };
}
