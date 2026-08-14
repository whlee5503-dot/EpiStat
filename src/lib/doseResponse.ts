// src/lib/doseResponse.ts
//
// Dose-Response: Extended Mantel-Haenszel Chi-Square for Trend
// Reference: OpenEpi "Dose-Response" module (Sullivan KM, Dean AG,
// OpenEpi.com, DoseResponseDoc.pdf), based on Mantel N (1963),
// "Chi-square tests with one degree of freedom: extensions of the
// Mantel-Haenszel procedure," J Am Stat Assoc 58: 690-700.
//
// Input: an ordered set of exposure levels (with numeric scores, e.g.
// 0, 1, 2, ...), each level having case/control counts, optionally
// stratified (e.g. by age group) to control for confounding.
//
// Outputs:
//   - Extended Mantel-Haenszel chi-square for trend (df=1) and p-value,
//     testing whether a linear trend exists across exposure levels.
//   - For each non-baseline level, a Mantel-Haenszel summary odds ratio
//     (comparing that level to the baseline/level-0 group) plus the
//     unstratified ("crude") odds ratio for the same comparison, so the
//     user can check whether stratification meaningfully changed the
//     estimate (a sign of confounding by the stratifying variable).

import { chiSquarePValue } from "./statUtils";
import { mantelHaenszel } from "./mantelHaenszel";
import type { TwoByTwoTable, MantelHaenszelResult } from "./mantelHaenszel";

export interface LevelCounts {
  cases: number;
  controls: number;
}

export interface DoseResponseTable {
  /** Ordered numeric scores for each exposure level, e.g. [0, 1, 2]. Level 0 (first entry) is the baseline/unexposed group. */
  scores: number[];
  /** strata[s][i] = case/control counts for stratum s, exposure level i. All strata must have the same number of levels as `scores`. */
  strata: LevelCounts[][];
}

export interface TrendTestResult {
  chiSquare: number;
  pValue: number;
  df: 1;
}

export interface LevelComparison {
  score: number;
  mhResult: MantelHaenszelResult;
  crudeOR: number;
}

export interface DoseResponseResult {
  trendTest: TrendTestResult;
  levelComparisons: LevelComparison[];
}

/**
 * Extended Mantel-Haenszel chi-square for trend across ordered exposure
 * levels, optionally stratified. Matches OpenEpi's "Dose-Response" module.
 */
export function analyzeDoseResponse(table: DoseResponseTable): DoseResponseResult {
  const { scores, strata } = table;

  if (scores.length < 2) {
    throw new Error("At least 2 exposure levels are required (baseline plus one more)");
  }
  if (strata.length < 1) {
    throw new Error("At least 1 stratum is required");
  }
  for (const stratum of strata) {
    if (stratum.length !== scores.length) {
      throw new Error("Every stratum must have one entry per exposure level");
    }
  }

  // --- Extended Mantel-Haenszel chi-square for trend ---
  let sumTMinusE = 0;
  let sumV = 0;

  for (const stratum of strata) {
    const n_i = stratum.map((lvl) => lvl.cases + lvl.controls);
    const N = n_i.reduce((a, b) => a + b, 0);
    const A = stratum.reduce((sum, lvl) => sum + lvl.cases, 0);

    if (N === 0) continue;

    const T_s = stratum.reduce((sum, lvl, i) => sum + lvl.cases * scores[i], 0);
    const sumNiXi = n_i.reduce((sum, n, i) => sum + n * scores[i], 0);
    const sumNiXi2 = n_i.reduce((sum, n, i) => sum + n * scores[i] * scores[i], 0);
    const E_s = (A * sumNiXi) / N;

    const V_s =
      N > 1
        ? ((A * (N - A)) / (N * N * (N - 1))) * (N * sumNiXi2 - sumNiXi * sumNiXi)
        : 0;

    sumTMinusE += T_s - E_s;
    sumV += V_s;
  }

  const chiSquare = sumV > 0 ? (sumTMinusE * sumTMinusE) / sumV : 0;
  const pValue = chiSquarePValue(chiSquare, 1);

  // --- Per-level Mantel-Haenszel OR and crude OR vs baseline (level 0) ---
  const levelComparisons: LevelComparison[] = [];

  for (let i = 1; i < scores.length; i++) {
    const twoByTwoTables: TwoByTwoTable[] = strata.map((stratum) => ({
      a: stratum[i].cases,
      b: stratum[i].controls,
      c: stratum[0].cases,
      d: stratum[0].controls,
    }));

    const mhResult = mantelHaenszel(twoByTwoTables);

    const crudeA = twoByTwoTables.reduce((sum, t) => sum + t.a, 0);
    const crudeB = twoByTwoTables.reduce((sum, t) => sum + t.b, 0);
    const crudeC = twoByTwoTables.reduce((sum, t) => sum + t.c, 0);
    const crudeD = twoByTwoTables.reduce((sum, t) => sum + t.d, 0);
    const crudeOR = (crudeA * crudeD) / (crudeB * crudeC);

    levelComparisons.push({ score: scores[i], mhResult, crudeOR });
  }

  return {
    trendTest: { chiSquare, pValue, df: 1 },
    levelComparisons,
  };
}
