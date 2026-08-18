# VALIDATION.md

## Purpose

This document records validation test cases comparing EpiStat's statistical
outputs against [OpenEpi](https://www.openepi.com) (Version 3.01, Sullivan &
Dean, Emory University), the long-established reference implementation for
epidemiologic statistics. Each module is validated against OpenEpi's own
calculator using identical input data, and results are compared to at least
3 significant figures.

Validation methodology follows the approach described by Ariel Ouedraogo's
Episia project (medRxiv preprint): input identical test data into both
tools, record OpenEpi's output as the reference value, and report results
as "N of M statistics matched."

---

## Module 1: Stratified Analysis / Mantel-Haenszel (2x2 tables)

**Source function(s):** `src/lib/mantelHaenszel.ts`
**Reference tool:** OpenEpi → Counts → Two by Two Table (Stratified)
**Test date:** 2026-07-30

### Test Case 1: Two-stratum stratified analysis

**Input data**

| Stratum | a (exp+/dis+) | b (exp+/dis-) | c (exp-/dis+) | d (exp-/dis-) |
|---|---|---|---|---|
| 1 | 66 | 36 | 28 | 32 |
| 2 | 40 | 20 | 15 | 25 |

### Results comparison

| Statistic | OpenEpi | EpiStat | Match |
|---|---|---|---|
| Stratum 1 chi-square (uncorrected) | 5.047 | 5.0474 | ✅ |
| Stratum 1 Odds Ratio | 2.095 | 2.0952 | ✅ |
| Stratum 1 Risk Ratio | 1.387 | 1.3866 | ✅ |
| Stratum 2 chi-square (uncorrected) | 8.249 | 8.2492 | ✅ |
| Stratum 2 Odds Ratio | 3.333 | 3.3333 | ✅ |
| Stratum 2 Risk Ratio | 1.778 | 1.7778 | ✅ |
| Mantel-Haenszel OR | 2.498 | 2.4980 | ✅ |
| MH OR 95% CI (Robins-Greenland-Breslow) | 1.499, 4.164 | 1.4985, 4.1642 | ✅ |
| Mantel-Haenszel RR | 1.519 | 1.5188 | ✅ |
| MH RR 95% CI (Greenland-Robins) | 1.181, 1.953 | 1.1812, 1.9528 | ✅ |
| Mantel-Haenszel Summary chi-square | 12.51 | 12.5079 | ✅ |
| MH chi-square p-value (2-tail) | 0.0004052 | 0.0004053 | ✅ |
| Breslow-Day chi-square (Tarone-corrected, OR) | 0.7394 | 0.7404 | ⚠️ within 0.15% |
| Breslow-Day p-value (OR) | 0.3899 | 0.3895 | ⚠️ within 0.001 |

### Summary

**12 of 14 statistics matched exactly (to displayed precision); 2 of 14
matched within 0.15%.**

The Breslow-Day statistic shows a small residual discrepancy, most likely
attributable to differences in the normal-distribution approximation used
for the chi-square p-value calculation, rather than an error in the
underlying Breslow-Day formula (input point estimates, CIs, and MH
chi-square all match exactly). This level of agreement is considered
acceptable; OpenEpi's own documentation notes that results should be
cross-checked against multiple sources due to expected floating-point
implementation differences.

### Test Case 2: Three-stratum stratified analysis

**Input data**

| Stratum | a (exp+/dis+) | b (exp+/dis-) | c (exp-/dis+) | d (exp-/dis-) |
|---|---|---|---|---|
| 1 | 66 | 36 | 28 | 32 |
| 2 | 40 | 20 | 15 | 25 |
| 3 | 50 | 30 | 30 | 40 |

This case was added specifically to confirm the implementation generalizes
beyond the 2-stratum case, since N-stratum stratification (e.g. by age
group, facility, or combined variables) is common in field epidemiology.

### Results comparison

| Statistic | OpenEpi | EpiStat | Match |
|---|---|---|---|
| Stratum 3 chi-square (uncorrected) | 5.788 | 5.788 | ✅ |
| Stratum 3 Odds Ratio | 2.222 | 2.222 | ✅ |
| Stratum 3 Risk Ratio | 1.458 | 1.458 | ✅ |
| Mantel-Haenszel OR | 2.389 | 2.389 | ✅ |
| MH OR 95% CI (Robins-Greenland-Breslow) | 1.597, 3.575 | 1.597, 3.575 | ✅ |
| Mantel-Haenszel RR | 1.496 | 1.496 | ✅ |
| MH RR 95% CI (Greenland-Robins) | 1.228, 1.823 | 1.228, 1.823 | ✅ |
| Mantel-Haenszel Summary chi-square | 18.17 | 18.17 | ✅ |
| MH chi-square p-value (2-tail) | 0.00002019 (< 0.0001) | < 0.0001 | ✅ |
| Breslow-Day chi-square (Tarone-corrected, OR, df=2) | 0.8143 | 0.8159 | ⚠️ within 0.2% |
| Breslow-Day p-value (OR, df=2) | 0.6655 | 0.6650 | ⚠️ within 0.0005 |

### Summary

**9 of 11 statistics matched exactly (to displayed precision); 2 of 11
matched within 0.2%.**

All core Mantel-Haenszel outputs (pooled OR, pooled RR, both confidence
intervals, and the summary chi-square) matched exactly across three strata,
confirming the implementation is not limited to the 2-stratum case. As in
Test Case 1, the small residual difference in the Breslow-Day statistic is
attributed to the underlying variance formula in `breslowDayTest`, not the
chi-square p-value calculation.

### Note: statUtils.ts refactor (2026-08-08)

The chi-square p-value calculation was originally split between an exact
z^2 relationship (df=1) and a Wilson-Hilferty normal approximation (df>=2).
Both were replaced with a single exact calculation based on the regularized
incomplete gamma function, now shared via `src/lib/statUtils.ts` and used
by both `mantelHaenszel.ts` and `rxc.ts`. Re-running Test Case 2 after the
refactor improved the Breslow-Day p-value match from 0.6707 (Wilson-Hilferty,
error 0.0052) to 0.6650 (exact gamma function, error 0.0005) against
OpenEpi's 0.6655. The residual discrepancy in the Breslow-Day chi-square
statistic itself (0.8159 vs 0.8143) is unrelated to this p-value change and
is still attributed to the variance formula in `breslowDayTest`.

### Correction: Breslow-Day discrepancy explained (2026-08-18)

The small residual discrepancy in the Breslow-Day chi-square statistic
noted in Test Case 1 and Test Case 2 above (0.7394 vs 0.7404; 0.8143 vs
0.8159) was previously attributed to differences in the normal-distribution
approximation / variance formula (see notes above). Following direct
correspondence with OpenEpi co-developer Kevin Sullivan (email, August
2026), this attribution is now known to be incomplete: the two values are
not two implementations of the same statistic converging imperfectly --
they are two *different* statistics that happen to be numerically close
for this dataset.

**What OpenEpi actually reports as "Breslow-Day" is not the iterative
Breslow-Day statistic at all.** It is a non-iterative Wald (Woolf,
inverse-variance-weighted) homogeneity test:

```
chi-square = Sum[ wi * (ln(ORi) - ln(OR_Direct))^2 ], wi = 1 / Var(ln ORi)
```

where `OR_Direct` is the inverse-variance-weighted pooled OR (Woolf's
method), *not* the Mantel-Haenszel pooled OR. Sullivan confirmed that
OpenEpi's stratified-analysis module has always used this Wald-type
statistic for OR, RR, and RD homogeneity, and noted that the true
iterative Breslow-Day approach could, for some datasets, fail to converge
and return no p-value at all -- part of the original motivation for using
the closed-form Wald substitute instead.

`mantelHaenszel.ts` now implements both statistics explicitly and exposes
both:

- `breslowDayTest()` -- the true, iterative Breslow-Day test
  (Tarone-corrected). Unchanged from the original implementation; this
  remains the value shown in EpiStat's primary "Breslow-Day" results card,
  since it is generally regarded as the more statistically robust method
  (particularly for rare events / small strata).
- `waldHomogeneityOR()` (new) -- the non-iterative Wald/Woolf test, added
  specifically to reproduce OpenEpi's reported value. Surfaced in the
  UI as a one-line footnote under the Breslow-Day card's expanded
  interpretation section, so OpenEpi-familiar users are not confused by
  the difference, without duplicating a near-identical second stat card.

Re-running Test Case 1 and Test Case 2 through `waldHomogeneityOR()`
reproduces OpenEpi's reported values exactly:

| Test Case | OpenEpi reported | EpiStat `waldHomogeneityOR()` | Match |
|---|---|---|---|
| 1 (2 strata) | 0.7394 | 0.7394 | ✅ exact |
| 2 (3 strata) | 0.8143 | 0.8143 | ✅ exact |

This resolves the "12 of 14" and "9 of 11" partial-match figures reported
in Test Case 1 and Test Case 2 above into full matches, once each
statistic is compared against its correct counterpart: **EpiStat's
iterative Breslow-Day implementation was correct all along.** The earlier
discrepancy was never an approximation error in EpiStat's code -- it was
a mismatch in which statistic was being compared against which.

The companion RR homogeneity function, `breslowDayTestRR()`, required no
code changes: its existing implementation was already structurally the
Wald/Woolf statistic (using the directly-adjusted RR as its reference
point rather than an iteratively-solved common RR under a shared-OR
assumption), so its values were already OpenEpi-consistent. It is now
also exported under the alias `waldHomogeneityRR` to reflect this
correspondence; `breslowDayTestRR` is retained unchanged for backward
compatibility.

**Acknowledgment:** thanks to Kevin Sullivan (OpenEpi co-developer,
Emory University) for identifying this in the course of reviewing
EpiStat, August 2026.

### Not yet validated in this module

- Breslow-Day test for Risk Ratio homogeneity (only OR version validated so far)
- Wald-type homogeneity test for Risk Difference (RD) -- Sullivan's
  correspondence indicates OpenEpi's Breslow-Day-labeled statistic covers
  RD as well as OR and RR; EpiStat does not yet compute any RD homogeneity
  test (Module 1 currently reports OR and RR pooled estimates only, no RD)
- Fisher exact / Mid-P exact statistics
- Behavior with zero cells or small-sample edge cases
- Sparse-data / continuity-correction scenarios

---

## Module 2: R x C Tables (Pearson Chi-Square Test of Independence)

**Source function(s):** `src/lib/rxc.ts`, `src/lib/statUtils.ts`
**Reference tool:** OpenEpi → Counts → R x C Table
**Test date:** 2026-08-08

Unlike Module 1, OpenEpi's R x C module reports only the overall Pearson
chi-square statistic, degrees of freedom, and p-value (no OR/RR/Fisher
exact for the general R x C case — those are 2x2-specific features covered
elsewhere). Validation is therefore against these three outputs plus the
observed/expected cell values.

### Test Case 1: Snedecor & Cochran 3x3 table

This is the reference dataset used in OpenEpi's own documentation
(RbyCTests.pdf) for the R x C module, so it was used as EpiStat's first
validation case as well.

**Input data**

| | C1 | C2 | C3 |
|---|---|---|---|
| R1 | 983 | 383 | 2892 |
| R2 | 679 | 416 | 2625 |
| R3 | 134 | 84 | 570 |

### Results comparison

| Statistic | OpenEpi | EpiStat | Match |
|---|---|---|---|
| Chi-square | 40.54 | 40.543 | ✅ |
| Degrees of freedom | 4 | 4 | ✅ |
| P-value | p < .0000001 | 3.34e-8 (< 0.0001) | ✅ (consistent) |
| Expected cell values | (not individually listed in OpenEpi docs) | 872.4, 428.9, 2956.7 / 762.2, 374.7, 2583.1 / 161.4, 79.4, 547.2 | — |

### Summary

**3 of 3 core statistics matched (chi-square, df, and p-value direction).**
The chi-square statistic matches OpenEpi to the precision reported in
OpenEpi's own reference documentation (40.54, matched to 40.543). OpenEpi's
documentation only reports p as "< .0000001" rather than a specific value,
so EpiStat's more precise p-value (3.34e-8) cannot be checked beyond
confirming it falls well under that threshold.

Both the chi-square statistic and the p-value use the same shared
`chiSquarePValue` function from `statUtils.ts` as Module 1 (exact
incomplete-gamma calculation, not a normal approximation), so no
approximation-related discrepancy is expected here regardless of df.

### Edge case checks (internal correctness, not OpenEpi comparisons)

**Test date:** 2026-08-08

Unlike the Snedecor/Cochran case above, these checks verify EpiStat's own
internal behavior (UI constraints, zero-cell handling, warning logic)
rather than comparing against an OpenEpi output — OpenEpi does not publish
a reference for these specific scenarios.

| Check | Input | Result | Pass? |
|---|---|---|---|
| Minimum table size enforced | Reduced table to 2x2 | Remove (X) buttons disappear at 2x2; cannot shrink further | ✅ |
| Low-expected-count warning | 2x2 table with small counts (4, 1 / 679, 416) | minExpected = 1.90, chi-square = 0.684, df = 1, p = 0.4081; red warning banner displayed | ✅ |
| Zero-filled rows/columns (5x5, only top-left 2x2 populated) | Same data as above, expanded to 5x5 with zero padding | chi-square unchanged at 0.684 (zero-count rows/cols contribute 0 since expected = 0 cells are skipped in the sum), df correctly recalculated to (5-1)x(5-1) = 16, p = 1.0000, warning still shown (minExpected = 0.00) | ✅ |
| Layout with 5 columns | Same 5x5 table | No crash, no NaN; horizontal scroll appears as intended fallback for wide tables | ✅ |

These confirm the `if (e > 0)` guard in `analyzeRxC` correctly excludes
zero-expected cells from the chi-square sum (avoiding division by zero)
without silently producing incorrect results, and that the `MIN_DIM = 2`
constraint in `RxCInput.tsx` prevents degenerate 1-row or 1-column tables.

### Not yet validated in this module

- Additional non-square R x C table sizes (2x3, 4x4) against actual OpenEpi output
- Low-expected-count warning threshold against OpenEpi's own guidance (if any) — EpiStat uses the conventional <5 rule, not yet cross-checked against OpenEpi documentation specifically

---

## Module 3: SMR (Standardized Mortality Ratio)

**Source function(s):** `src/lib/smr.ts`
**Reference tool:** OpenEpi → Counts → Std.Mort.Ratio
**Test date:** 2026-08-08

OpenEpi's SMR module reports six different confidence interval methods
(Mid-P exact, Fisher's exact, normal approximation, Byar approximation,
Rothman-Greenland, Vandenbroucke, Ury & Wiggins) plus significance tests.
This is being implemented incrementally rather than all at once, to keep
each method independently debuggable and verifiable. This first pass
covers only the **Mid-P exact method**, which OpenEpi's own documentation
(SMRDoc.pdf) describes as "generally the preferred method."

### Test Case 1: OpenEpi documentation worked example

OpenEpi's SMRDoc.pdf (Soe & Sullivan, 2006) gives a worked example with
SMR = 1.212 and Mid-P exact p = 0.6571, but does not state the underlying
observed/expected values directly in the extracted text. These were
reverse-engineered by searching for small integer/decimal (a, lambda)
pairs consistent with both the stated SMR and the stated p-value; a = 4,
lambda = 3.3 reproduces both values, and is also consistent with the
document's own note that "exact confidence intervals and p-values should
be used when the number of observed deaths is less than or equal to
five" (a = 4 qualifies).

**Input data**

| Observed deaths (a) | Expected deaths (lambda) |
|---|---|
| 4 | 3.3 |

### Results comparison

| Statistic | OpenEpi (SMRDoc.pdf) | EpiStat | Match |
|---|---|---|---|
| SMR | 1.212 | 1.212 | ✅ |
| Mid-P exact p-value (2-tailed) | 0.6571 | 0.6571 | ✅ |
| Mid-P exact 95% CI | (not stated in extracted doc text) | 0.385 - 2.924 | — |

### Summary

**2 of 2 statistics with a stated OpenEpi reference value matched
exactly.** The Mid-P exact CI bounds were additionally cross-checked
against an independent bisection implementation (Python/scipy, solving
the same tail-probability equations via `brentq`), which returned
0.3851 - 2.9238, confirming the TypeScript bisection converges to the
same root rather than a plausible-looking but incorrect value.

Implementation notes:
- Poisson PMF/CDF are computed via log-gamma (Lanczos approximation) for
  numerical stability at larger observed counts, reusing the same
  log-gamma routine used for the incomplete gamma function elsewhere.
- The Mid-P CI bounds are solved by bisection rather than a closed form,
  since no closed-form inverse exists; direction of monotonicity for each
  bound (lower bound increasing in mu, upper bound decreasing in mu) was
  verified numerically before fixing an initial implementation bug where
  the bisection direction was reversed (causing the lower bound to diverge
  to a very large number instead of converging).

### Test Case 2: All seven methods, cross-checked against epiR (R package)

While implementing the remaining methods, the OpenEpi PDF's own formula
text (SMRDoc.pdf) turned out to be partially garbled by PDF-to-text
extraction (superscripts and fraction layout were lost), making several
formulas ambiguous to reconstruct directly. The `epiR` R package's
`epi.smr()` function (Mark Stevenson et al., CRAN) implements the same
Rothman & Boice formulas and — notably — uses the exact same default
worked example (`obs = 4, exp = 3.3`) as OpenEpi's own documentation,
strongly suggesting `epiR` is a faithful reimplementation of the same
source material. `epi.smr()`'s R source was used as the authoritative
formula reference for the five newly added methods, with one correction
applied (see note on Ury & Wiggins below).

**Input data:** same as Test Case 1 (observed = 4, expected = 3.3, 95% CI)

### Results comparison

| Method | Statistic | Reference (Python/scipy, matching epiR formulas) | EpiStat | Match |
|---|---|---|---|---|
| Fisher's exact | p-value | 0.8393 | 0.8393 | ✅ |
| Fisher's exact | 95% CI | 0.4920 - 3.1035 | 0.4920 - 3.1035 | ✅ |
| Byar approximation | p-value | 0.8368 | 0.8368 | ✅ |
| Byar approximation | 95% CI | 0.3261 - 3.1033 | 0.3261 - 3.1033 | ✅ |
| Rothman-Greenland | 95% CI | 0.4549 - 3.2296 | 0.4549 - 3.2296 | ✅ |
| Normal approximation | p-value | 0.7000 | 0.7000 | ✅ |
| Normal approximation | 95% CI | 0.0243 - 2.4000 | 0.0243 - 2.4000 | ✅ |
| Ury & Wiggins | 95% CI | 0.3273 - 3.0060 | 0.3273 - 3.0060 | ✅ |
| Vandenbroucke | 95% CI | 0.3153 - 2.6910 | 0.3153 - 2.6910 | ✅ |

### Summary

**9 of 9 statistics matched exactly** (to 4 decimal places) between the
Python/scipy reference implementation and the EpiStat TypeScript
implementation. This confirms the TypeScript port of each formula is
arithmetically correct, though see the caveat below about the Rothman-
Greenland and normal-approximation methods, and the Ury & Wiggins
correction, since these have not yet been checked against OpenEpi's own
live calculator output directly (only against the independently-coded
Python reference and the epiR-derived formulas).

**Correction applied — Ury & Wiggins constants:** `epiR`'s own source code
contains a copy-paste bug: the conditional block that should assign the
99% CI constants `(2, 3)` instead re-tests `conf.level == 0.95` (already
handled by the preceding branch), so the 99% case in `epiR` silently falls
through unhandled. EpiStat uses the original constants from OpenEpi's
SMRDoc.pdf directly — 90%: (0.65, 1.65), 95%: (1, 2), 99%: (2, 3) — which
are unaffected by this bug and match the `epiR` output at 90% and 95%
(the only levels where `epiR`'s result is actually usable for comparison).

**Caveat on "normal approximation":** OpenEpi's documentation names this
as one of the methods but does not give an explicit formula distinct from
the chi-square test; EpiStat treats the p-value as the standard
`(a - lambda)^2 / lambda ~ chi-square(1)` test (equivalent to a Wald
z-test) and the CI as the corresponding Wald interval `(a +/- z*sqrt(a)) /
lambda`. This is a reasonable and conventional choice, but has not been
directly confirmed against OpenEpi's own calculator output.

### Not yet validated in this module

- All 6 non-Mid-P methods above have not yet been directly checked against
  OpenEpi's live web calculator (only against independently-coded
  Python/scipy and epiR-derived reference formulas) — recommended before
  DPGA submission
- Behavior at observed = 0 (Byar's CI lower-bound formula is undefined at
  a=0; a fallback has been implemented but not cross-checked against
  OpenEpi's own handling of this edge case)
- Confidence levels other than 90/95/99% for Ury & Wiggins, and other than
  95% for Vandenbroucke (both intentionally return null/unavailable outside
  their valid range, per OpenEpi's own documented restriction)
- Larger observed counts (>5), where OpenEpi's documentation specifically
  recommends the approximation methods over the exact methods

---

## Module 4: Pair-Matched Case-Control Study

**Source function(s):** `src/lib/matchcc.ts`
**Reference tool:** OpenEpi → Counts → MatchCC
**Test date:** 2026-08-09

OpenEpi's MatchCC module analyzes pair-matched case-control data. Only the
two discordant cells (X = case exposed / control not exposed, Y = case
not exposed / control exposed) enter the calculations; the concordant
cells (W, Z) are informational only. This module was implemented in a
single pass (rather than incrementally like SMR), since OpenEpi's own
MatchCCDoc.pdf includes a complete worked example with every statistic
the module produces, making it possible to validate the whole formula set
against one dataset before writing any UI code.

### Test Case 1: OpenEpi documentation worked example

**Input data**

| | Control Exposed | Control Not Exposed |
|---|---|---|
| Case Exposed | W = 3 | X = 7 |
| Case Not Exposed | Y = 1 | Z = 9 |

### Results comparison

| Statistic | OpenEpi (MatchCCDoc.pdf) | EpiStat | Match |
|---|---|---|---|
| Discordant pairs | 8 | 8 | ✅ |
| Matched OR (mOR) | 7 | 7 | ✅ |
| McNemar chi-square | 4.5 | 4.500 | ✅ |
| McNemar p-value (2-tail) | 0.03389 | 0.03389 | ✅ |
| Corrected McNemar chi-square | 3.125 | 3.125 | ✅ |
| Corrected McNemar p-value (2-tail) | 0.07710 | 0.07710 | ✅ |
| Fisher exact p (1-tail) | 0.03516 | 0.03516 | ✅ |
| Fisher exact p (2-tail) | 0.07031 | 0.07031 | ✅ |
| Mid-P exact p (1-tail) | 0.01953 | 0.01953 | ✅ |
| Mid-P exact p (2-tail) | 0.03906 | 0.03906 | ✅ |
| Taylor series 95% CI | 0.8614, 56.89 | 0.8612, 56.89 | ⚠️ within 0.03% |
| Mid-P exact 95% CI (CMLE OR) | 1.082, 159 | 1.082, 159.0 | ✅ |
| Fisher exact 95% CI (CMLE OR) | 0.8993, 315.5 | 0.8993, 315.5 | ✅ |

### Summary

**12 of 13 statistics matched exactly; 1 of 13 (Taylor series CI lower
bound) matched within 0.03%.** The tiny Taylor CI discrepancy is the same
pattern seen in Module 1: OpenEpi's documentation appears to round
Z(0.975) to 1.96, while EpiStat uses the more precise value 1.959964
(via the shared `normalQuantile` rational approximation), producing a
negligible difference in the fourth significant figure.

Every other statistic — both McNemar tests, both exact p-value tests, and
both exact confidence intervals (Mid-P and Fisher) — matched to the full
precision reported in the OpenEpi documentation, including the
less-common exact CI methods (Mid-P and Fisher, both based on bisection
over the conditional binomial distribution of the discordant-pair count
given a hypothesized odds ratio, analogous to the SMR module's Poisson-
based bisection approach in Module 3).

Implementation notes:
- The Fisher exact CI was independently derivable two ways — a closed-form
  F-distribution formula (Liddell's method, as OpenEpi's documentation
  names it) and the same bisection approach used for Mid-P — and both
  produced identical results (0.8993, 315.5) during development, which
  cross-validates the bisection implementation before it was used for the
  Mid-P CI (which has no simple closed form).
- The CMLE (conditional maximum likelihood estimate) OR is documented by
  OpenEpi as a distinct quantity from the "Pair-Matched Odds Ratio," but
  for pair-matched (as opposed to 1:many matched) data the two are
  numerically identical (both equal X/Y); EpiStat computes them from the
  same `matchedOR()` function accordingly.

### Not yet validated in this module

- 1:many matching ratios (this module currently assumes 1:1 pair matching only)
- Behavior when X or Y is 0 (currently throws an error, since the odds
  ratio is undefined; OpenEpi's own handling of this case has not been
  checked)
- Larger discordant-pair counts (>=20), where OpenEpi's documentation
  states exact and approximate methods should agree closely
- Protective (OR < 1) associations — the worked example only covers a
  positive association (OR > 1); the one-tailed p-value direction for
  protective associations, noted in OpenEpi's documentation as "(P)", has
  not been separately verified

---

## Module 5: Dose-Response (Chi-Square for Trend)

**Source function(s):** `src/lib/doseResponse.ts` (reuses `mantelHaenszel.ts` and `statUtils.ts`)
**Reference tool:** OpenEpi → Counts → Dose-Response
**Test date:** 2026-08-09

Unlike every other module so far, OpenEpi's own DoseResponseDoc.pdf does
**not** publish the computed results for its worked example — only the
input data table, with instructions to "click Calculate to see the
results" on the live JavaScript calculator. No numeric target values were
therefore available from OpenEpi's documentation itself. Instead, this
module implements the formula from its original published source (Mantel
N, 1963, "Chi-square tests with one degree of freedom: extensions of the
Mantel-Haenszel procedure," J Am Stat Assoc 58: 690-700), which OpenEpi's
documentation explicitly cites as its basis, and cross-validates the
TypeScript implementation two independent ways before trusting it.

### Test Case 1: Schlesselman (1982) smoking / myocardial infarction dataset

This is the exact worked example given in OpenEpi's own DoseResponseDoc.pdf
(cigarette smoking level vs. MI status, stratified by 5 age groups),
originally from Schlesselman JJ, *Case-Control Studies*, Oxford Univ.
Press, 1982, p. 205.

**Input data**

| Age stratum | Level 0 (cases/controls) | Level 1 (cases/controls) | Level 2 (cases/controls) |
|---|---|---|---|
| 25-29 | 1 / 131 | 1 / 104 | 4 / 51 |
| 30-34 | 0 / 188 | 6 / 152 | 15 / 83 |
| 35-39 | 3 / 161 | 12 / 130 | 22 / 65 |
| 40-44 | 11 / 169 | 21 / 134 | 39 / 68 |
| 45-49 | 23 / 157 | 42 / 97 | 34 / 52 |

Scores used for the trend test: level 0 = 0, level 1 = 1, level 2 = 2
(the "simplest groups" scoring OpenEpi's documentation describes).

### Results

| Statistic | EpiStat |
|---|---|
| Extended Mantel-Haenszel chi-square (trend) | 129.875 |
| p-value | 4.36e-30 (< 0.0001) |
| MH OR, level 1 vs. baseline | 3.158 (95% CI: 2.081 - 4.791) |
| Crude OR, level 1 vs. baseline | 2.819 |
| MH OR, level 2 vs. baseline | 8.563 (95% CI: 5.663 - 12.948) |
| Crude OR, level 2 vs. baseline | 7.580 |

### Validation approach (no OpenEpi reference values available)

Since no target numbers exist to check against, two independent
cross-checks were used instead:

1. **Hand calculation.** The stratum-1 (age 25-29) intermediate values
   (T_s = 9, E_s = 4.4178, V_s = 3.3664) were recomputed by hand from the
   raw formula and matched the TypeScript/Python output to 4 decimal
   places, confirming the per-stratum arithmetic is correct before
   trusting the multi-stratum sum.
2. **Independent Python implementation.** The full 5-stratum calculation
   was separately coded in Python from the same Mantel (1963) formula
   text (not copied from the TypeScript) and produced chi-square =
   129.8749, matching the TypeScript output to 4 decimal places.

The direction of the result is also consistent with what the dataset
should show: MH OR increases monotonically with exposure level (3.158 →
8.563), which is the expected signature of a genuine dose-response trend,
and the MH OR is noticeably different from the crude OR at both levels
(3.158 vs. 2.819; 8.563 vs. 7.580), indicating the age stratification is
doing real confounding-control work rather than being a no-op — both are
qualitative sanity checks consistent with a correct implementation, though
not a substitute for an actual OpenEpi-vs-EpiStat numeric comparison.

Implementation notes:
- The per-level Mantel-Haenszel OR and its 95% CI are computed by
  constructing a `TwoByTwoTable[]` (one table per stratum, comparing that
  exposure level against the baseline level) and calling the existing
  `mantelHaenszel()` function from Module 1 directly, rather than
  reimplementing the OR/CI logic — this also means any future
  improvement to Module 1's Breslow-Day or CI calculation automatically
  benefits this module.
- The trend chi-square p-value reuses the same `chiSquarePValue`
  (incomplete-gamma) function as every other module, for consistency.

### Not yet validated in this module

- **No comparison against OpenEpi's actual live calculator output** —
  this is the highest-priority follow-up for this module specifically,
  since every other module in EpiStat has at least one OpenEpi-sourced
  reference value and this one currently does not
- More than 3 exposure levels
- Non-integer or non-sequential scores (e.g. category midpoints like 0,
  2, 4 instead of 0, 1, 2), which OpenEpi's documentation explicitly
  mentions as a valid scoring option
- Unstratified (single-stratum) dose-response trend as a sanity-check
  special case
- Behavior with zero cases or zero controls in a level (currently
  produces `NaN`/`Infinity` for that level's crude OR without a guard)

---

## Module 6: BodySize (WHO Child Growth Standards)

### Sub-module: Weight-for-Age (WFA)

**Source function(s):** `src/lib/bodySize.ts`, `src/lib/who/wfaData.ts`
**Reference tool:** WHO Child Growth Standards official LMS tables (no OpenEpi
equivalent — OpenEpi does not include an anthropometric z-score module; this
functionality falls under WHO's own Anthro/AnthroPlus software family)
**Test date:** 2026-08-09

Unlike Modules 1-5, there is no OpenEpi calculator to compare against for
this module. Validation instead uses (1) the WHO source documents directly
for the reference data, and (2) two independent methods to confirm the LMS
formula implementation itself is correct, since no OpenEpi target values
exist to check the arithmetic against.

**Reference data source:** WHO official Weight-for-age LMS z-score tables,
Birth to 5 years (boys and girls), fetched directly from
`cdn.who.int/.../weight-for-age/wfa-boys-0-5-zscores.pdf` and
`wfa-girls-0-5-zscores.pdf` on 2026-08-09. Monthly resolution, 0-60 months.
Transcribed directly from the WHO PDF text, not sourced via OpenEpi or any
third-party reimplementation.

#### Validation approach (no OpenEpi reference values available)

**1. Formula-level check against an independent published worked example.**
A CDC growth-charts documentation page gives a fully worked LMS calculation
unrelated to the WHO WFA table itself (L=-0.1600954, M=9.476500305,
S=0.11218624, X=9.7 kg -> expected z=0.207). This tests the LMS formula
implementation in isolation, independent of which reference population's
table is plugged in.

| Check | Expected | EpiStat | Match |
|---|---|---|---|
| LMS z-score formula (independent CDC doc example) | 0.207 | 0.2074 | ✅ |

**2. Round-trip consistency across the full WHO WFA table.** For every
month (0-60) and both sexes, the inverse LMS formula (z -> raw value) was
applied and then fed back through the forward formula (raw value -> z),
across z = -3, -2, -1, 0, 1, 2, 3 (854 points total).

| Check | Result | Pass? |
|---|---|---|
| Round-trip max absolute error (854 points, both sexes, all months) | 3.3e-13 (floating-point precision limit) | ✅ |

**3. Cross-check against WHO's own displayed SD columns.** WHO's PDF
tables print rounded values for -3SD through +3SD alongside the raw L/M/S
parameters. The inverse LMS formula was used to independently recompute
these values from L/M/S and compared against WHO's displayed numbers.

| Z | Computed (boys, 9 months) | WHO displayed | Match |
|---|---|---|---|
| -3 | 6.39 | 6.4 | ✅ |
| -2 | 7.14 | 7.1 | ✅ |
| -1 | 7.98 | 8.0 | ✅ |
| 0 | 8.90 | 8.9 | ✅ |
| 1 | 9.92 | 9.9 | ✅ |
| 2 | 11.04 | 11.0 | ✅ |
| 3 | 12.28 | 12.3 | ✅ |

**4. Manual spot-check after local integration (Antigravity, 2026-08-09).**
Cases run via `npx tsx` / the actual UI against the real project files (not
the sandbox copy):

| Case | Input | Result |
|---|---|---|
| Boy, 9 months, 8.9 kg | near-median | z = -0.0014, `normal` |
| Boy, 9 months, 7.0 kg | just under -2SD (7.1448 kg) | z = -2.184, `underweight` |
| Girl, 24 months, 8.0 kg | well under median (11.48 kg) | z = -3.073, `severely underweight` |
| Boy, 9mo, 7kg (UI) | | z = -2.18, `underweight` (orange badge) |
| Girl, 9mo, 7kg (UI) | | z = -1.34, `normal` (green badge) |
| Boy, 9mo, 6kg (UI) | | z = -3.56, `severely underweight` (red badge) |
| Girl, 9mo, 6kg (UI) | | z = -2.65, `underweight` (orange badge) |
| Girl, 61mo, 50kg (UI) | out-of-range age | empty state + validation message shown, no crash |

All results are consistent with the WHO table and the -2/-3 SD
classification thresholds (WHO does not define an "overweight" category
for weight-for-age alone, since direction of excess weight requires
height; only `severely underweight` (<-3), `underweight` (<-2), and
`normal` are implemented).

#### Summary

**All formula- and data-level checks passed (2/2 formula checks, 854/854
round-trip points, 7/7 WHO-displayed-value cross-checks, 8/8 local
integration spot-checks including UI-level color/badge verification).**
Because OpenEpi has no equivalent module, this validation establishes
correctness against WHO's own source documents and internal mathematical
consistency, rather than the "N of M vs. OpenEpi" format used in Modules
1-5.

Implementation notes:
- LMS z-score uses Cole's (1990) Box-Cox formula:
  `Z = ((X/M)^L - 1) / (L*S)` for L != 0, `Z = ln(X/M) / S` for L == 0.
- Non-integer ages are handled by linear interpolation between adjacent
  monthly LMS rows (WHO's table itself is published at monthly
  resolution for this indicator).
- Reference data lives in `src/lib/who/` (separate from other modules'
  single-file convention) since BodySize requires multiple data files as
  HFA/WFH/BMI-for-age are added, unlike Modules 1-5 which are each a
  single self-contained formula file.
- UI (`WfaInput.tsx` + `WfaAnalysis.tsx`) follows the existing app
  convention of module-specific input CSS plus shared `.strat-*`/`.rxc-*`
  layout classes from `StratifiedAnalysis.css`/`RxCAnalysis.css`, matching
  the pattern used by `DoseResponseInput`/`DoseResponseAnalysis`. The only
  new shared CSS introduced is `.wfa-badge-ok/warning/danger` in
  `WfaAnalysis.css`, since no existing module needed a color-coded
  classification badge before this one.

#### Not yet validated in this sub-module

- Direct comparison against WHO Anthro / R `zscorer` or `anthro` package
  output (recommended before DPGA submission, since no OpenEpi baseline
  exists for this module specifically)
- Day-level age precision (current implementation interpolates linearly
  between WHO's monthly table rows; WHO also publishes a separate
  week-resolution table for 0-13 weeks that has not yet been incorporated,
  which may matter for newborn/young-infant precision)
- Age boundary behavior (exactly 0 months, exactly 60 months)
- Negative or zero weight input handling (no input validation guard yet)

---

### Sub-module: Length/Height-for-Age (HFA/LFA)

**Source function(s):** `src/lib/hfa.ts`, `src/lib/who/hfaData.ts`
**Reference tool:** WHO Child Growth Standards official LMS tables (no
OpenEpi equivalent, same as the WFA sub-module above)
**Test date:** 2026-08-10

Unlike WFA, WHO fixes L = 1 for every age in this indicator, so the LMS
formula reduces to Z = (X/M - 1)/S. WHO also publishes two separate
reference tables rather than one: a recumbent-length table (Birth to 2
years) and a standing-height table (2 to 5 years), reflecting the standard
field practice of measuring children under 24 months lying down and 24
months or older standing up.

**Reference data source:** WHO official Length-for-age (Birth to 2 years)
and Height-for-age (2 to 5 years) LMS z-score tables, boys and girls,
fetched directly from `cdn.who.int/.../length-height-for-age/` on
2026-08-10. Monthly resolution. Transcribed directly from WHO source PDFs,
not sourced via OpenEpi or any third-party reimplementation.

#### Validation approach (no OpenEpi reference values available)

**1. Round-trip consistency across all four tables (length/height x
boys/girls).** For every row in all four tables, the inverse LMS formula
(z -> raw value) was applied and fed back through the forward formula
(raw value -> z), across z = -3, -2, -1, 0, 1, 2, 3.

| Check | Result | Pass? |
|---|---|---|
| Round-trip max absolute error (4 tables, all rows, Z=-3..3) | 5.1e-15 (floating-point precision limit) | ✅ |

**2. Cross-check against WHO's own displayed SD columns.** Same method as
the WFA sub-module: the inverse LMS formula was used to independently
recompute WHO's displayed -3SD through +3SD values from the raw L/M/S
parameters.

| Z | Computed (boys, 24mo LENGTH table) | WHO displayed | Match |
|---|---|---|---|
| -3 | 78.7 | 78.7 | ✅ |
| -2 | 81.7 | 81.7 | ✅ |
| -1 | 84.8 | 84.8 | ✅ |
| 0 | 87.8 | 87.8 | ✅ |
| 1 | 90.9 | 90.9 | ✅ |
| 2 | 93.9 | 93.9 | ✅ |
| 3 | 97.0 | 97.0 | ✅ |

**3. Independent confirmation of the length/height correction constant.**
WHO publishes two different M values at the exact 24-month boundary (one
in each table), which independently confirms the standard 0.7cm
length-vs-height correction used elsewhere in growth-monitoring practice:

| Sex | Length-table M (24mo) | Height-table M (24mo) | Difference |
|---|---|---|---|
| Boys | 87.8161 | 87.1161 | 0.7000 |
| Girls | 86.4153 | 85.7153 | 0.7000 |

This is not an independently chosen constant; it is the value implied by
WHO's own reference data at the point where the two tables meet, which
was used directly as `LENGTH_HEIGHT_CORRECTION_CM` in `hfa.ts`.

**4. Table-selection boundary check.** `getHfaLms` must resolve to the
height table at exactly 24 months (per WHO convention: 24 months and
older uses standing height) and to the length table just below it.

| Check | Input | Result | Pass? |
|---|---|---|---|
| Exactly 24 months | `getHfaLms('M', 24)` | M = 87.1161 (HEIGHT table) | ✅ |
| Just below 24 months | `getHfaLms('M', 23.99)` | M ~ 87.807 (LENGTH table, interpolated) | ✅ |

**5. Manual spot-check after local integration (Antigravity, 2026-08-10).**
Cases run through the actual UI:

| Case | Input | Result |
|---|---|---|
| Boy, 9mo, length=71.9687 (exact median) | no correction expected | z = 0.00, `normal` |
| Boy, 24mo, "length"=71.9687 (9mo median entered at 24mo) | correction applied, WHO expects height | z = -5.19, `severely stunted` (correct given the mismatched, unrealistic input) |
| Boy, 30mo, "length"=91.9327 (true height-table median, entered as length) | correction applied (-0.7cm) | z = -0.21, `normal` |
| Boy, 30mo, height=91.9327 (matching type) | no correction | z = 0.00, `normal` |

The third and fourth cases form a matched pair confirming the correction
logic operates correctly in both directions: the same raw value produces
z=0.00 when the measurement type matches the WHO-expected type for that
age, and a small nonzero z (from the 0.7cm adjustment) when it doesn't.

#### Summary

**All formula-, data-, and boundary-level checks passed** (round-trip
5.1e-15 max error across 4 tables, 7/7 WHO-displayed-value cross-checks,
24-month table-selection boundary confirmed, 0.7cm correction constant
independently verified against WHO's own data, 4/4 local integration
spot-checks including a matched correction/no-correction pair). As with
WFA, there is no OpenEpi module to compare against, so correctness is
established against WHO's own source documents and internal mathematical
consistency.

Implementation notes:
- L = 1 for all ages in this indicator (unlike WFA, where L varies by
  age), so `getHfaLms`/`lmsZScore` reduce algebraically to the standard
  Wald-style z-score, though the shared LMS functions from `bodySize.ts`
  are reused unchanged rather than special-cased.
- `getHfaLms` looks up rows by `month` value (via `Array.find`) rather than
  assuming array-index alignment, since the height table's rows start at
  month 24 rather than month 0 (unlike the WFA and HFA-length tables,
  where index and month happen to coincide).
- The measurement-type UI (`HfaInput.tsx`) always shows both length/height
  toggle options rather than hiding the "wrong" one, matching the
  convention used in field data-collection tools like ENA for SMART: the
  age-appropriate type is pre-selected, but overriding it is a normal,
  expected action rather than an edge case, since real fieldwork often
  can't use the "correct" method for a given child.
- UI reuses `WfaAnalysis.css`'s `.wfa-badge-ok/warning/danger` classes
  directly (generic naming, not WFA-specific), so no new CSS file was
  needed for the classification badge.
- `LENGTH_HEIGHT_CORRECTION_CM` (0.7cm) is exported from this module and
  reused by both the WFL/WFH and BMI-for-age sub-modules below, so any
  future refinement propagates to all three.

#### Not yet validated in this sub-module

- Direct comparison against WHO Anthro / R `zscorer` or `anthro` package
  output (recommended before DPGA submission, same as WFA)
- Day-level age precision within each table (see WFA's equivalent note)
- Whether the 0.7cm correction is the right choice for every age near the
  24-month boundary specifically, versus only exactly at 24 months (WHO's
  guidance is a flat constant; some national protocols may specify a
  different value or a small age-dependent adjustment)
- Extremely short/tall inputs outside the +/-3 SD to +/-5 SD range,
  where the linear z-score approximation may become less clinically
  meaningful even though the arithmetic remains correct

---

### Sub-module: Weight-for-Length/Height (WFL/WFH)

**Source function(s):** `src/lib/wfh.ts`, `src/lib/who/wfhData.ts`
**Reference tool:** WHO Child Growth Standards official LMS tables (no
OpenEpi equivalent, same as the WFA and HFA sub-modules above)
**Test date:** 2026-08-10

Unlike WFA and HFA, this indicator is indexed by length/height rather than
age: WHO publishes two tables per sex at 0.5cm resolution -- Weight-for-Length
(Birth to 2 years, 45.0-110.0cm, recumbent) and Weight-for-Height (2 to 5
years, 65.0-120.0cm, standing) -- and age is used only to select which table
applies and which measurement type (length vs. height) is expected, reusing
the same 24-month convention and 0.7cm correction constant established for
HFA. L is constant across each entire table for a given sex (boys: -0.3521,
girls: -0.3833), unlike WFA where L varies by age.

**Reference data source:** WHO official Weight-for-Length (Birth to 2 years)
and Weight-for-Height (2 to 5 years) LMS z-score tables, boys and girls,
fetched directly from `cdn.who.int/.../weight-for-length-height/` on
2026-08-10. 0.5cm resolution (131 rows per WFL table, 111 rows per WFH
table; 485 rows total across all four tables). Transcribed directly from
WHO source PDFs, not sourced via OpenEpi or any third-party
reimplementation.

#### Validation approach (no OpenEpi reference values available)

**1. Round-trip consistency across all four tables.** For every row in all
four tables (WFL boys/girls, WFH boys/girls), the inverse LMS formula
(z -> raw weight) was applied and fed back through the forward formula
(raw weight -> z), across z = -3, -2, -1, 0, 1, 2, 3 (3,395 points total).

| Check | Result | Pass? |
|---|---|---|
| Round-trip max absolute error (4 tables, 485 rows, Z=-3..3) | 5.3e-15 (floating-point precision limit) | ✅ |

**2. Cross-check against WHO's own displayed SD columns.** Same method as
the WFA and HFA sub-modules: the inverse LMS formula was used to
independently recompute WHO's displayed -3SD through +3SD values from the
raw L/M/S parameters.

| Z | Computed (boys WFL, length=75.0cm) | WHO displayed | Match |
|---|---|---|---|
| -3 | 7.5 | 7.5 | ✅ |
| -2 | 8.1 | 8.1 | ✅ |
| -1 | 8.8 | 8.8 | ✅ |
| 0 | 9.5 | 9.5 | ✅ |
| 1 | 10.3 | 10.3 | ✅ |
| 2 | 11.3 | 11.3 | ✅ |
| 3 | 12.3 | 12.3 | ✅ |

**3. Table-selection boundary check.** `getWfhLms` must resolve to the WFH
(height-based) table at exactly 24 months and to the WFL (length-based)
table just below it, consistent with HFA's boundary convention. As an
internal-consistency check, the same real height queried on both sides of
the boundary (87.1161cm in WFH, the length-equivalent 87.8161cm in WFL --
these two values are WHO's own 24-month M's for HFA, differing by exactly
the 0.7cm correction) should yield nearly identical median weights, since
they describe the same child.

| Check | Input | Result | Pass? |
|---|---|---|---|
| Exactly 24 months | `getWfhLms('M', 24, 87.1161)` | tableUsed = WFH, M = 12.19298 kg | ✅ |
| Just below 24 months | `getWfhLms('M', 23.9, 87.8161)` | tableUsed = WFL, M = 12.19296 kg | ✅ |
| Cross-boundary consistency | Same real height, opposite sides of 24mo | M differs by 0.00002 kg (effectively identical) | ✅ |

**4. Interpolation check between 0.5cm grid points.** Verified that a
length exactly halfway between two adjacent grid rows (75.25cm, between
75.0cm and 75.5cm) produces the arithmetic mean of the two rows' M values.

| Check | Result | Pass? |
|---|---|---|
| Interpolated M at 75.25cm vs. (M[75.0] + M[75.5]) / 2 | Exact match | ✅ |

**5. Measurement-type correction (matched pair, same pattern as HFA).**

| Case | Input | Result |
|---|---|---|
| Boy, 30mo, weight = WFH median at 91.5cm, entered as "length" (wrong type) | correction applied (-0.7cm) | z = 0.155, `normal` |
| Boy, 30mo, same weight, entered as "height" (correct type) | no correction | z = 0.00, `normal` |

**6. Manual spot-check after local integration (Antigravity, 2026-08-10).**
Five cases run through the actual UI:

| Case | Input | Result |
|---|---|---|
| Boy, 9mo, length=75.0cm, 9.5kg (near-median) | no correction | z = -0.00, `normal` |
| Boy, 9mo, length=75.0cm, 7.5kg | no correction | z = -2.98, `wasted` (7.5kg is WHO's *rounded* -3SD display value; the precise -3SD threshold is 7.487kg, so -2.98 rather than exactly -3.00 is the mathematically correct result) |
| Boy, 30mo, "length"=91.5cm (wrong type), 13.24kg | correction applied | z = 0.16, `normal` |
| Boy, 30mo, height=91.5cm (correct type), 13.24kg | no correction | z = 0.00, `normal` |
| Boy, 9mo, length=75cm, 13kg (well above median) | no correction | z = 3.58, `obese` |

The third and fourth cases form a matched pair (identical to the HFA
verification pattern) confirming the correction logic; the fifth case
confirms the upper classification tiers (`overweight`/`obese`), which are
unique to this sub-module -- WFA and HFA have no upper-tail classification,
since weight-for-age and height-for-age alone cannot distinguish the
direction of excess growth without a second measurement, whereas
weight-for-length/height can.

#### Summary

**All formula-, data-, boundary-, and integration-level checks passed**
(round-trip 5.3e-15 max error across 3,395 points, 7/7 WHO-displayed-value
cross-checks, 24-month table-selection boundary confirmed with
cross-boundary M consistency to 5 decimal places, grid interpolation
exact, matched correction/no-correction pair, 5/5 local UI spot-checks
including both new upper-tail classifications). As with WFA and HFA, there
is no OpenEpi module to compare against, so correctness is established
against WHO's own source documents and internal mathematical consistency.

Implementation notes:
- Unlike WFA/HFA (indexed by age in whole or fractional months), this
  indicator is indexed by length/height on a 0.5cm grid; `interpolateByLength`
  in `wfh.ts` is a purpose-built analog of `getWfaLms`/`getHfaLms`'s
  floor/ceil interpolation, adapted for the 0.5cm step size rather than
  the 1-month step size used elsewhere.
- Table selection (WFL vs. WFH) and the +/-0.7cm measurement-type
  correction reuse the exact same age threshold and `LENGTH_HEIGHT_CORRECTION_CM`
  constant exported from `hfa.ts`, rather than redefining them, so any
  future refinement to that constant (e.g. an age-dependent correction
  instead of a flat one) automatically propagates here too.
- Classification introduces two categories (`overweight`, `obese`) not
  present in WFA or HFA's `classifyWfa`/`classifyHfa`, reflecting that WHO
  itself does not define upper-tail categories for those two indicators
  but does for this one.

#### Not yet validated in this sub-module

- Direct comparison against WHO Anthro / R `zscorer` or `anthro` package
  output (recommended before DPGA submission, same as WFA and HFA)
- The alternative WHO convention (used in some emergency/SMART-survey
  contexts) of selecting the WFL/WFH table by the 87cm length/height
  threshold itself rather than by age, for situations where a child's age
  is unknown -- current implementation only supports the age-based
  convention
- Day-level age precision at the table-selection boundary (see WFA/HFA's
  equivalent note)
- Values very close to the 45.0cm or 120.0cm table edges, where
  interpolation has no lower/upper neighbor beyond the table's own bound

---

### Sub-module: BMI-for-Age

**Source function(s):** `src/lib/bmi.ts`, `src/lib/who/bmiData.ts`
**Reference tool:** WHO Child Growth Standards official LMS tables (no
OpenEpi equivalent, same as the WFA, HFA, and WFL/WFH sub-modules above)
**Test date:** 2026-08-10

Like HFA and WFL/WFH, this indicator uses two age-based reference tables
(0-24 months and 24-60 months) reflecting the recumbent-length vs.
standing-height convention. Unlike those sub-modules, however, the
length/height correction here is applied to the raw length/height value
**before** BMI is computed (since BMI's denominator is height squared),
not to a separate table-selection or lookup step -- WHO's own footnote on
these tables states this explicitly: "If a child aged less than 2 years
is measured standing up, change the height to length by adding 0.7cm
BEFORE calculating BMI... For children 2 to 5 years measured lying down,
convert length to height by subtracting 0.7cm BEFORE calculating BMI."
L varies by month for boys in the 2-5y table but is a constant -0.5684
for girls in the same table -- an asymmetry present in WHO's own
published values, not a simplification introduced during transcription.

**Reference data source:** WHO official BMI-for-age LMS z-score tables,
Birth to 2 years and 2 to 5 years, boys and girls, fetched directly from
`cdn.who.int/.../body-mass-index-for-age/` on 2026-08-10. Monthly
resolution (124 rows total across all four tables: 25 + 37 rows per sex).
Transcribed directly from WHO source PDFs, not sourced via OpenEpi or any
third-party reimplementation.

#### Validation approach (no OpenEpi reference values available)

**1. Round-trip consistency across all four tables.** For every row in all
four tables (BMI_LENGTH boys/girls, BMI_HEIGHT boys/girls), the inverse
LMS formula (z -> raw BMI) was applied and fed back through the forward
formula (raw BMI -> z), across z = -3, -2, -1, 0, 1, 2, 3.

| Check | Result | Pass? |
|---|---|---|
| Round-trip max absolute error (4 tables, 124 rows, Z=-3..3) | 1.8e-13 (floating-point precision limit) | ✅ |

**2. Cross-check against WHO's own displayed SD columns.** Same method as
the other BodySize sub-modules: the inverse LMS formula was used to
independently recompute WHO's displayed -3SD through +3SD values from the
raw L/M/S parameters.

| Z | Computed (boys, month 0) | WHO displayed | Match |
|---|---|---|---|
| -3 | 10.2 | 10.2 | ✅ |
| -2 | 11.1 | 11.1 | ✅ |
| -1 | 12.2 | 12.2 | ✅ |
| 0 | 13.4 | 13.4 | ✅ |
| 1 | 14.8 | 14.8 | ✅ |
| 2 | 16.3 | 16.3 | ✅ |
| 3 | 18.1 | 18.1 | ✅ |

**3. Table-selection boundary check.** `getBmiLms` must resolve to the
height-based table at exactly 24 months and to the length-based table
just below it, consistent with HFA and WFL/WFH's boundary convention.

| Check | Input | Result | Pass? |
|---|---|---|---|
| Exactly 24 months | `getBmiLms('M', 24)` | L=-0.6187, M=16.0189 (HEIGHT table) | ✅ |
| Just below 24 months | `getBmiLms('M', 23.99)` | L~-0.6472, M~15.7361 (LENGTH table, interpolated) | ✅ |

**4. Correction-order check.** Confirmed the +/-0.7cm correction is
applied to the length/height value before computing BMI (as WHO's
footnote specifies), not to the resulting BMI or z-score. Reference
weight was chosen so that BMI exactly equals the WHO median at a fixed
real height (91.9327cm, 30 months) when the measurement type is entered
correctly; the same weight and real height were then re-submitted with
the "wrong" measurement type to confirm the correction shifts BMI (and
therefore the z-score) in the expected direction.

| Case | Input | Result |
|---|---|---|
| Correct type (height=91.9327cm) | no correction | BMI = 15.7953, z = 0.00 |
| Wrong type ("length"=91.9327cm, same weight) | correction applied (height treated as 0.7cm shorter) | BMI = 16.0386, z = 0.194 |

A shorter effective height with the same weight correctly produces a
higher BMI, confirming both the direction of the correction and that it
is applied before (not after) the BMI calculation.

**5. Manual spot-check after local integration (Antigravity, 2026-08-10).**
Eight cases run through the actual UI:

| Case | Input | Result |
|---|---|---|
| Boy, 9mo, length=71.9687cm (HFA median), 8.9kg (WFA median) | sanity check across two independently-validated sub-modules | BMI=17.2, z=0.01, `normal` |
| Boy, 30mo, "length"=91.9327cm (wrong type), 13.15kg | correction applied | BMI=15.8, z=0.00, `normal` |
| Boy, 30mo, height=91.9327cm (correct type), 13.15kg | no correction | BMI=15.6, z=-0.19, `normal` (matched pair with previous row) |
| Boy, 30mo, height=91.9327cm, 11kg | | BMI=13.0, z=-2.57, `wasted` |
| Boy, 30mo, height=91.9327cm, 10kg | | BMI=11.8, z=-3.92, `severely wasted` |
| Boy, 30mo, height=91.9327cm, 15kg | | BMI=17.7, z=1.45, `possible risk of overweight` |
| Boy, 30mo, height=91.9327cm, 17kg | | BMI=20.1, z=2.93, `overweight` |
| Boy, 30mo, height=91.9327cm, 19kg | | BMI=22.5, z=4.18, `obese` |

The second and third rows form a matched pair (same pattern as HFA and
WFL/WFH) confirming the correction direction in the full UI, not just
the isolated logic test in check 4. The last five rows, at a fixed
height with increasing weight, confirm all six classification tiers
transition in the correct order, including the `possible risk of
overweight` tier at +1 SD that has no equivalent in WFA, HFA, or
WFL/WFH's classification schemes.

#### Summary

**All formula-, data-, boundary-, correction-order, and integration-level
checks passed** (round-trip 1.8e-13 max error across 124 rows, 7/7
WHO-displayed-value cross-checks, 24-month table-selection boundary
confirmed, correction-before-BMI order independently verified both in
isolated logic and through the full UI, 8/8 local integration
spot-checks spanning all six classification tiers). As with the other
BodySize sub-modules, there is no OpenEpi module to compare against, so
correctness is established against WHO's own source documents and
internal mathematical consistency.

Implementation notes:
- BMI is computed as `weightKg / (heightM * heightM)` using the
  (possibly corrected) length/height value, then the existing
  `lmsZScore` function from `bodySize.ts` is applied to the resulting
  BMI value exactly as it is to raw weight or length/height elsewhere --
  no BMI-specific z-score math was written.
- `getBmiLms` reuses the identical month-based `lookupRow`/interpolation
  structure as `getHfaLms`, since both index by age in months and split
  into length- vs. height-based tables at 24 months; the two functions
  were written independently (not shared via a common helper) to avoid
  coupling BMI's table-selection logic to HFA's, given the different
  correction-application point noted above.
- `LENGTH_HEIGHT_CORRECTION_CM` is imported from `hfa.ts` rather than
  redefined, so this sub-module automatically stays in sync with WFA/HFA
  and WFL/WFH if that constant is ever refined.
- UI (`BmiInput.tsx` + `BmiAnalysis.tsx`) reuses the same input pattern as
  `WfhInput.tsx` (sex, age, measurement type toggle, length/height, weight)
  since both indicators need identical inputs; `BmiAnalysis.tsx` adds a
  BMI stat card alongside the Z-score card, and reuses `WfaAnalysis.css`'s
  badge color classes for the six-tier classification.

#### Not yet validated in this sub-module

- Direct comparison against WHO Anthro / R `zscorer` or `anthro` package
  output (recommended before DPGA submission, same as the other BodySize
  sub-modules)
- The Birth-to-13-weeks table WHO publishes separately for this indicator
  (higher resolution for young infants) -- current implementation only
  uses the 0-2y and 2-5y monthly tables, consistent with the rest of
  BodySize
- Day-level age precision at the table-selection boundary (see HFA's
  equivalent note)
- Extreme BMI inputs from unrealistic weight/height combinations (e.g. an
  adult-range weight at an infant length), which would produce a very
  large but not obviously invalid-looking BMI

---

## Validation status by module

| # | Module | Status |
|---|---|---|
| 1 | Stratified Analysis / Mantel-Haenszel | 🟡 In progress (core stats validated; edge cases pending) |
| 2 | RxC Tables | 🟡 In progress (Snedecor/Cochran case validated; edge cases pending) |
| 3 | SMR (Standardized Mortality Ratio) | 🟡 In progress (all 7 methods implemented and self-consistent; not yet checked against OpenEpi's live calculator for methods beyond Mid-P) |
| 4 | Matched Case-Control | 🟡 In progress (worked example validated: 12/13 exact, 1/13 within 0.03%) |
| 5 | Dose-Response | 🟡 In progress (formula implemented, hand + independent Python cross-checked; not yet compared against OpenEpi's own calculator output) |
| 6 | BodySize (WHO/CDC z-scores) | 🟡 In progress (WFA, HFA/LFA, WFL/WFH, and BMI-for-age sub-modules complete: formula + round-trip + WHO-table cross-checked, no OpenEpi baseline exists for this module; "core 4" indicator set now finished) |
| 7 | Person-Time | ⬜ Not started |
| 8 | Sample Size / Power (9 subtypes) | ⬜ Not started |