// src/lib/rxc.ts
//
// R x C Table Analysis — Pearson Chi-Square Test of Independence
// Reference: OpenEpi "R x C Table" module (Dean AG, Sullivan KM, Soe MM,
// OpenEpi.com, Version 3.01). This module reports the overall chi-square
// statistic, degrees of freedom, and p-value for an R x C contingency
// table. It intentionally does NOT include Fisher exact / OR / RR — those
// belong to the 2x2-specific TwobyTwo module (already covered elsewhere
// in EpiStat).

import { chiSquarePValue } from "./statUtils";

export interface RxCResult {
  rows: number;
  cols: number;
  observed: number[][];
  expected: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
  chiSquare: number;
  df: number;
  pValue: number;
  minExpected: number;
  /** true if any expected cell count is < 5 (chi-square approximation may be unreliable) */
  lowExpectedWarning: boolean;
}

/**
 * Pearson Chi-Square test of independence for an R x C contingency table.
 * Matches OpenEpi's "R x C Table" module (Counts > R x C).
 *
 * @param observed  R x C matrix of non-negative cell counts (rows = exposure
 *                  categories, columns = outcome categories, or vice versa —
 *                  the test is symmetric).
 */
export function analyzeRxC(observed: number[][]): RxCResult {
  const rows = observed.length;
  const cols = observed[0]?.length ?? 0;

  if (rows < 2 || cols < 2) {
    throw new Error("RxC table requires at least 2 rows and 2 columns");
  }
  for (const row of observed) {
    if (row.length !== cols) {
      throw new Error("All rows must have the same number of columns");
    }
    if (row.some((v) => v < 0 || !Number.isFinite(v))) {
      throw new Error("All cell counts must be non-negative finite numbers");
    }
  }

  const rowTotals = observed.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals: number[] = new Array(cols).fill(0);
  for (const row of observed) {
    row.forEach((v, j) => (colTotals[j] += v));
  }
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  if (grandTotal === 0) {
    throw new Error("Table total must be greater than zero");
  }

  const expected: number[][] = observed.map((_, i) =>
    colTotals.map((cj) => (rowTotals[i] * cj) / grandTotal)
  );

  let chiSquare = 0;
  let minExpected = Infinity;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const e = expected[i][j];
      minExpected = Math.min(minExpected, e);
      if (e > 0) {
        chiSquare += Math.pow(observed[i][j] - e, 2) / e;
      }
    }
  }

  const df = (rows - 1) * (cols - 1);
  const pValue = chiSquarePValue(chiSquare, df);

  return {
    rows,
    cols,
    observed,
    expected,
    rowTotals,
    colTotals,
    grandTotal,
    chiSquare,
    df,
    pValue,
    minExpected,
    lowExpectedWarning: minExpected < 5,
  };
}
