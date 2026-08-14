// EpiStat Module 7: Person-Time (Incidence Rate Ratio / Difference)
// Formulas follow OpenEpi's PersonTime2Doc.pdf (Sullivan, Chapter 15),
// mirroring the single-table + stratified structure of Module 1
// (Mantel-Haenszel): crude estimate, directly-adjusted estimate,
// Mantel-Haenszel-adjusted estimate, interaction (homogeneity) test,
// and a summary significance test.

import { chiSquarePValue, Z_95 } from './statUtils';

export interface PersonTimeStratum {
  casesExposed: number;
  personTimeExposed: number;
  casesUnexposed: number;
  personTimeUnexposed: number;
}

export interface SingleTableResult {
  irExposed: number;
  irUnexposed: number;
  irr: number;
  irrCI: [number, number];
  ird: number;
  irdCI: [number, number];
  zStat: number;
  pValue: number;
}

/**
 * Analyze a single 2x2 person-time table (crude, or one stratum in
 * isolation). Variance of ln(IRR) = 1/a + 1/b; variance of IRD =
 * a/n1^2 + b/n0^2 (Sullivan, PersonTime2Doc.pdf, Table 15-10).
 */
export function analyzeSingleTable(
  s: PersonTimeStratum,
  z = Z_95
): SingleTableResult {
  const { casesExposed: a, personTimeExposed: n1, casesUnexposed: b, personTimeUnexposed: n0 } = s;
  const n = n1 + n0;
  const m1 = a + b;

  const irExposed = a / n1;
  const irUnexposed = b / n0;
  const irr = irExposed / irUnexposed;
  const irrVarLn = 1 / a + 1 / b;
  const irrSE = Math.sqrt(irrVarLn);
  const irrCI: [number, number] = [
    irr * Math.exp(-z * irrSE),
    irr * Math.exp(z * irrSE),
  ];

  const ird = irExposed - irUnexposed;
  const irdVar = a / (n1 * n1) + b / (n0 * n0);
  const irdSE = Math.sqrt(irdVar);
  const irdCI: [number, number] = [ird - z * irdSE, ird + z * irdSE];

  const zStat = (a - (n1 * m1) / n) / Math.sqrt((m1 * n1 * n0) / (n * n));
  const pValue = chiSquarePValue(zStat * zStat, 1);

  return { irExposed, irUnexposed, irr, irrCI, ird, irdCI, zStat, pValue };
}

interface StratumCalc extends PersonTimeStratum {
  irri: number;
  lnIrri: number;
  wi: number; // inverse variance weight for direct IRR, = 1/(1/a + 1/b)
  irdi: number;
  wi2: number; // inverse variance weight for direct IRD, = 1/(a/n1^2 + b/n0^2)
  mhNumTerm: number; // a*n0/n
  mhDenTerm: number; // b*n1/n
  mhVarTerm: number; // m1*n1*n0/n^2
}

function computeStratumCalc(s: PersonTimeStratum): StratumCalc {
  const { casesExposed: a, personTimeExposed: n1, casesUnexposed: b, personTimeUnexposed: n0 } = s;
  const n = n1 + n0;
  const m1 = a + b;

  const irri = (a / n1) / (b / n0);
  const lnIrri = Math.log(irri);
  const wi = 1 / (1 / a + 1 / b);

  const irdi = a / n1 - b / n0;
  const wi2 = 1 / (a / (n1 * n1) + b / (n0 * n0));

  const mhNumTerm = (a * n0) / n;
  const mhDenTerm = (b * n1) / n;
  const mhVarTerm = (m1 * n1 * n0) / (n * n);

  return { ...s, irri, lnIrri, wi, irdi, wi2, mhNumTerm, mhDenTerm, mhVarTerm };
}

export interface StratifiedPersonTimeResult {
  crude: SingleTableResult;
  directIRR: number;
  directIRRCI: [number, number];
  mhIRR: number;
  mhIRRCI: [number, number];
  directIRD: number;
  directIRDCI: [number, number];
  interactionChiSqIRR: number;
  interactionPValueIRR: number;
  interactionChiSqIRD: number;
  interactionPValueIRD: number;
  summaryZ: number;
  summaryPValue: number;
  strata: StratumCalc[];
}

/**
 * Analyze stratified person-time data: crude (pooled) table, directly
 * adjusted and Mantel-Haenszel-adjusted incidence rate ratios, directly
 * adjusted incidence rate difference, homogeneity (interaction) tests for
 * both IRR and IRD, and a summary significance test assuming no
 * interaction (Sullivan, PersonTime2Doc.pdf, Tables 15-12 through 15-17).
 */
export function analyzeStratifiedPersonTime(
  strata: PersonTimeStratum[],
  z = Z_95
): StratifiedPersonTimeResult {
  if (strata.length < 1) {
    throw new Error('At least one stratum is required');
  }

  const crudeTable: PersonTimeStratum = strata.reduce(
    (acc, s) => ({
      casesExposed: acc.casesExposed + s.casesExposed,
      personTimeExposed: acc.personTimeExposed + s.personTimeExposed,
      casesUnexposed: acc.casesUnexposed + s.casesUnexposed,
      personTimeUnexposed: acc.personTimeUnexposed + s.personTimeUnexposed,
    }),
    { casesExposed: 0, personTimeExposed: 0, casesUnexposed: 0, personTimeUnexposed: 0 }
  );
  const crude = analyzeSingleTable(crudeTable, z);

  const calcs = strata.map(computeStratumCalc);

  // Directly adjusted IRR
  const wSum = calcs.reduce((sum, c) => sum + c.wi, 0);
  const wLnIrrSum = calcs.reduce((sum, c) => sum + c.wi * c.lnIrri, 0);
  const directIRR = Math.exp(wLnIrrSum / wSum);
  const directIRRCI: [number, number] = [
    directIRR * Math.exp(-z / Math.sqrt(wSum)),
    directIRR * Math.exp(z / Math.sqrt(wSum)),
  ];

  // Mantel-Haenszel adjusted IRR
  const mhNum = calcs.reduce((sum, c) => sum + c.mhNumTerm, 0);
  const mhDen = calcs.reduce((sum, c) => sum + c.mhDenTerm, 0);
  const mhIRR = mhNum / mhDen;
  const mhVarNum = calcs.reduce((sum, c) => sum + c.mhVarTerm, 0);
  const mhSElnIRR = Math.sqrt(mhVarNum / (mhNum * mhDen));
  const mhIRRCI: [number, number] = [
    mhIRR * Math.exp(-z * mhSElnIRR),
    mhIRR * Math.exp(z * mhSElnIRR),
  ];

  // Directly adjusted IRD
  const w2Sum = calcs.reduce((sum, c) => sum + c.wi2, 0);
  const w2IrdSum = calcs.reduce((sum, c) => sum + c.wi2 * c.irdi, 0);
  const directIRD = w2IrdSum / w2Sum;
  const directIRDCI: [number, number] = [
    directIRD - z / Math.sqrt(w2Sum),
    directIRD + z / Math.sqrt(w2Sum),
  ];

  // Interaction (homogeneity) test for IRR
  const interactionChiSqIRR = calcs.reduce((sum, c) => {
    const varLnIrri = 1 / c.wi;
    const diff = c.lnIrri - Math.log(directIRR);
    return sum + (diff * diff) / varLnIrri;
  }, 0);
  const dfInteraction = strata.length - 1;
  const interactionPValueIRR = chiSquarePValue(interactionChiSqIRR, dfInteraction);

  // Interaction (homogeneity) test for IRD
  const interactionChiSqIRD = calcs.reduce((sum, c) => {
    const varIrdi = 1 / c.wi2;
    const diff = c.irdi - directIRD;
    return sum + (diff * diff) / varIrdi;
  }, 0);
  const interactionPValueIRD = chiSquarePValue(interactionChiSqIRD, dfInteraction);

  // Summary significance test (assumes no interaction)
  const sumA = calcs.reduce((sum, c) => sum + c.casesExposed, 0);
  const sumE = calcs.reduce((sum, c) => {
    const n = c.personTimeExposed + c.personTimeUnexposed;
    const m1 = c.casesExposed + c.casesUnexposed;
    return sum + (c.personTimeExposed * m1) / n;
  }, 0);
  const sumV = calcs.reduce((sum, c) => sum + c.mhVarTerm, 0);
  const summaryZ = (sumA - sumE) / Math.sqrt(sumV);
  const summaryPValue = chiSquarePValue(summaryZ * summaryZ, 1);

  return {
    crude,
    directIRR,
    directIRRCI,
    mhIRR,
    mhIRRCI,
    directIRD,
    directIRDCI,
    interactionChiSqIRR,
    interactionPValueIRR,
    interactionChiSqIRD,
    interactionPValueIRD,
    summaryZ,
    summaryPValue,
    strata: calcs,
  };
}
