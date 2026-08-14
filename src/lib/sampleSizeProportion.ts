// EpiStat Module 8.1: Sample Size for a Proportion
// Formula follows OpenEpi's SSProporDoc.pdf (Sullivan), based on
// Schaeffer, Mendenhall & Ott, "Elementary Survey Sampling," 4th ed.
// (Duxbury Press, 1990): finite-population-corrected sample size for
// estimating a single proportion to a specified absolute precision.

/**
 * Standard normal critical values (two-tailed) for the fixed set of
 * confidence levels OpenEpi's own calculator displays (80% - 99.99%).
 * Precise values are used rather than the conventional rounded 1.96 for
 * 95%, consistent with the rest of EpiStat (see statUtils.ts's Z_95).
 */
export const CONFIDENCE_LEVELS: { label: string; level: number; z: number }[] = [
  { label: '80%', level: 0.80, z: 1.281552 },
  { label: '90%', level: 0.90, z: 1.644854 },
  { label: '95%', level: 0.95, z: 1.959964 },
  { label: '97%', level: 0.97, z: 2.170090 },
  { label: '99%', level: 0.99, z: 2.575829 },
  { label: '99.9%', level: 0.999, z: 3.290527 },
  { label: '99.99%', level: 0.9999, z: 3.890592 },
];

export interface SampleSizeProportionInput {
  /** Population size (N). Large values behave like an infinite population. */
  populationSize: number;
  /** Anticipated frequency of the outcome, as a proportion (0-1). */
  anticipatedFrequency: number;
  /** Desired absolute precision (half-width of the CI), as a proportion (0-1). */
  absolutePrecision: number;
  /** Design effect for complex/cluster sampling; 1.0 for simple random sampling. */
  designEffect: number;
}

export interface ConfidenceLevelResult {
  label: string;
  level: number;
  z: number;
  sampleSizeRaw: number;
  sampleSize: number;
}

/**
 * n = [deff * N * p * q] / [(d^2 / z^2) * (N - 1) + p * q]
 * where q = 1 - p. This is the finite-population-corrected form; as N
 * grows large the (N-1) term dominates and the result converges to the
 * infinite-population formula deff * z^2 * p * q / d^2.
 */
export function calculateSampleSizeProportion(
  input: SampleSizeProportionInput
): ConfidenceLevelResult[] {
  const { populationSize: N, anticipatedFrequency: p, absolutePrecision: d, designEffect: deff } = input;

  if (N <= 1) throw new Error('Population size must be greater than 1');
  if (p <= 0 || p >= 1) throw new Error('Anticipated frequency must be between 0 and 100%, exclusive');
  if (d <= 0 || d >= 0.5) throw new Error('Absolute precision must be greater than 0 and less than 50%');
  if (deff <= 0) throw new Error('Design effect must be greater than 0');

  const q = 1 - p;

  return CONFIDENCE_LEVELS.map(({ label, level, z }) => {
    const numerator = deff * N * p * q;
    const denominator = (d * d) / (z * z) * (N - 1) + p * q;
    const sampleSizeRaw = numerator / denominator;
    return {
      label,
      level,
      z,
      sampleSizeRaw,
      sampleSize: Math.ceil(sampleSizeRaw),
    };
  });
}
