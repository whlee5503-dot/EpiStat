// WHO Child Growth Standards - BMI-for-age
// Source: WHO official LMS z-score tables
// https://www.who.int/toolkits/child-growth-standards/standards/body-mass-index-for-age-bmi-for-age
// Two tables per sex, matching the same recumbent-length vs standing-height
// convention as Length/Height-for-Age and Weight-for-Length/Height:
//   - BMI_LENGTH_*: Birth to 2 years (0-24 months), BMI computed from length
//   - BMI_HEIGHT_*: 2 to 5 years (24-60 months), BMI computed from height
// Per WHO's own footnote on these tables: "If a child aged less than 2
// years is measured standing up, change the height to length by adding
// 0.7cm BEFORE calculating BMI... For children 2 to 5 years measured
// lying down, convert length to height by subtracting 0.7cm BEFORE
// calculating BMI." The correction therefore applies to the raw
// length/height value used to compute BMI (denominator), not to a
// separate table-selection step. L varies by month for boys but is a
// constant -0.5684 for girls in the 2-5y table -- an asymmetry present
// in WHO's own published values, not a transcription simplification.
// Transcribed directly from WHO source PDFs on 2026-08-10; not sourced via
// OpenEpi or any third-party reimplementation.

import type { LmsRow } from './wfaData';

export const BMI_LENGTH_BOYS: LmsRow[] = [
  { month: 0, L: -0.3053, M: 13.4069, S: 0.09560 },
  { month: 1, L: 0.2708, M: 14.9441, S: 0.09027 },
  { month: 2, L: 0.1118, M: 16.3195, S: 0.08677 },
  { month: 3, L: 0.0068, M: 16.8987, S: 0.08495 },
  { month: 4, L: -0.0727, M: 17.1579, S: 0.08378 },
  { month: 5, L: -0.1370, M: 17.2919, S: 0.08296 },
  { month: 6, L: -0.1913, M: 17.3422, S: 0.08234 },
  { month: 7, L: -0.2385, M: 17.3288, S: 0.08183 },
  { month: 8, L: -0.2802, M: 17.2647, S: 0.08140 },
  { month: 9, L: -0.3176, M: 17.1662, S: 0.08102 },
  { month: 10, L: -0.3516, M: 17.0488, S: 0.08068 },
  { month: 11, L: -0.3828, M: 16.9239, S: 0.08037 },
  { month: 12, L: -0.4115, M: 16.7981, S: 0.08009 },
  { month: 13, L: -0.4382, M: 16.6743, S: 0.07982 },
  { month: 14, L: -0.4630, M: 16.5548, S: 0.07958 },
  { month: 15, L: -0.4863, M: 16.4409, S: 0.07935 },
  { month: 16, L: -0.5082, M: 16.3335, S: 0.07913 },
  { month: 17, L: -0.5289, M: 16.2329, S: 0.07892 },
  { month: 18, L: -0.5484, M: 16.1392, S: 0.07873 },
  { month: 19, L: -0.5669, M: 16.0528, S: 0.07854 },
  { month: 20, L: -0.5846, M: 15.9743, S: 0.07836 },
  { month: 21, L: -0.6014, M: 15.9039, S: 0.07818 },
  { month: 22, L: -0.6174, M: 15.8412, S: 0.07802 },
  { month: 23, L: -0.6328, M: 15.7852, S: 0.07786 },
  { month: 24, L: -0.6473, M: 15.7356, S: 0.07771 }
];

export const BMI_HEIGHT_BOYS: LmsRow[] = [
  { month: 24, L: -0.6187, M: 16.0189, S: 0.07785 },
  { month: 25, L: -0.5840, M: 15.9800, S: 0.07792 },
  { month: 26, L: -0.5497, M: 15.9414, S: 0.07800 },
  { month: 27, L: -0.5166, M: 15.9036, S: 0.07808 },
  { month: 28, L: -0.4850, M: 15.8667, S: 0.07818 },
  { month: 29, L: -0.4552, M: 15.8306, S: 0.07829 },
  { month: 30, L: -0.4274, M: 15.7953, S: 0.07841 },
  { month: 31, L: -0.4016, M: 15.7606, S: 0.07854 },
  { month: 32, L: -0.3782, M: 15.7267, S: 0.07867 },
  { month: 33, L: -0.3572, M: 15.6934, S: 0.07882 },
  { month: 34, L: -0.3388, M: 15.6610, S: 0.07897 },
  { month: 35, L: -0.3231, M: 15.6294, S: 0.07914 },
  { month: 36, L: -0.3101, M: 15.5988, S: 0.07931 },
  { month: 37, L: -0.3000, M: 15.5693, S: 0.07950 },
  { month: 38, L: -0.2927, M: 15.5410, S: 0.07969 },
  { month: 39, L: -0.2884, M: 15.5140, S: 0.07990 },
  { month: 40, L: -0.2869, M: 15.4885, S: 0.08012 },
  { month: 41, L: -0.2881, M: 15.4645, S: 0.08036 },
  { month: 42, L: -0.2919, M: 15.4420, S: 0.08061 },
  { month: 43, L: -0.2981, M: 15.4210, S: 0.08087 },
  { month: 44, L: -0.3067, M: 15.4013, S: 0.08115 },
  { month: 45, L: -0.3174, M: 15.3827, S: 0.08144 },
  { month: 46, L: -0.3303, M: 15.3652, S: 0.08174 },
  { month: 47, L: -0.3452, M: 15.3485, S: 0.08205 },
  { month: 48, L: -0.3622, M: 15.3326, S: 0.08238 },
  { month: 49, L: -0.3811, M: 15.3174, S: 0.08272 },
  { month: 50, L: -0.4019, M: 15.3029, S: 0.08307 },
  { month: 51, L: -0.4245, M: 15.2891, S: 0.08343 },
  { month: 52, L: -0.4488, M: 15.2759, S: 0.08380 },
  { month: 53, L: -0.4747, M: 15.2633, S: 0.08418 },
  { month: 54, L: -0.5019, M: 15.2514, S: 0.08457 },
  { month: 55, L: -0.5303, M: 15.2400, S: 0.08496 },
  { month: 56, L: -0.5599, M: 15.2291, S: 0.08536 },
  { month: 57, L: -0.5905, M: 15.2188, S: 0.08577 },
  { month: 58, L: -0.6223, M: 15.2091, S: 0.08617 },
  { month: 59, L: -0.6552, M: 15.2000, S: 0.08659 },
  { month: 60, L: -0.6892, M: 15.1916, S: 0.08700 }
];

export const BMI_LENGTH_GIRLS: LmsRow[] = [
  { month: 0, L: -0.0631, M: 13.3363, S: 0.09272 },
  { month: 1, L: 0.3448, M: 14.5679, S: 0.09556 },
  { month: 2, L: 0.1749, M: 15.7679, S: 0.09371 },
  { month: 3, L: 0.0643, M: 16.3574, S: 0.09254 },
  { month: 4, L: -0.0191, M: 16.6703, S: 0.09166 },
  { month: 5, L: -0.0864, M: 16.8386, S: 0.09096 },
  { month: 6, L: -0.1429, M: 16.9083, S: 0.09036 },
  { month: 7, L: -0.1916, M: 16.9020, S: 0.08984 },
  { month: 8, L: -0.2344, M: 16.8404, S: 0.08939 },
  { month: 9, L: -0.2725, M: 16.7406, S: 0.08898 },
  { month: 10, L: -0.3068, M: 16.6184, S: 0.08861 },
  { month: 11, L: -0.3381, M: 16.4875, S: 0.08828 },
  { month: 12, L: -0.3667, M: 16.3568, S: 0.08797 },
  { month: 13, L: -0.3932, M: 16.2311, S: 0.08768 },
  { month: 14, L: -0.4177, M: 16.1128, S: 0.08741 },
  { month: 15, L: -0.4407, M: 16.0028, S: 0.08716 },
  { month: 16, L: -0.4623, M: 15.9017, S: 0.08693 },
  { month: 17, L: -0.4825, M: 15.8096, S: 0.08671 },
  { month: 18, L: -0.5017, M: 15.7263, S: 0.08650 },
  { month: 19, L: -0.5199, M: 15.6517, S: 0.08630 },
  { month: 20, L: -0.5372, M: 15.5855, S: 0.08612 },
  { month: 21, L: -0.5537, M: 15.5278, S: 0.08594 },
  { month: 22, L: -0.5695, M: 15.4787, S: 0.08577 },
  { month: 23, L: -0.5846, M: 15.4380, S: 0.08560 },
  { month: 24, L: -0.5989, M: 15.4052, S: 0.08545 }
];

export const BMI_HEIGHT_GIRLS: LmsRow[] = [
  { month: 24, L: -0.5684, M: 15.6881, S: 0.08454 },
  { month: 25, L: -0.5684, M: 15.6590, S: 0.08452 },
  { month: 26, L: -0.5684, M: 15.6308, S: 0.08449 },
  { month: 27, L: -0.5684, M: 15.6037, S: 0.08446 },
  { month: 28, L: -0.5684, M: 15.5777, S: 0.08444 },
  { month: 29, L: -0.5684, M: 15.5523, S: 0.08443 },
  { month: 30, L: -0.5684, M: 15.5276, S: 0.08444 },
  { month: 31, L: -0.5684, M: 15.5034, S: 0.08448 },
  { month: 32, L: -0.5684, M: 15.4798, S: 0.08455 },
  { month: 33, L: -0.5684, M: 15.4572, S: 0.08467 },
  { month: 34, L: -0.5684, M: 15.4356, S: 0.08484 },
  { month: 35, L: -0.5684, M: 15.4155, S: 0.08506 },
  { month: 36, L: -0.5684, M: 15.3968, S: 0.08535 },
  { month: 37, L: -0.5684, M: 15.3796, S: 0.08569 },
  { month: 38, L: -0.5684, M: 15.3638, S: 0.08609 },
  { month: 39, L: -0.5684, M: 15.3493, S: 0.08654 },
  { month: 40, L: -0.5684, M: 15.3358, S: 0.08704 },
  { month: 41, L: -0.5684, M: 15.3233, S: 0.08757 },
  { month: 42, L: -0.5684, M: 15.3116, S: 0.08813 },
  { month: 43, L: -0.5684, M: 15.3007, S: 0.08872 },
  { month: 44, L: -0.5684, M: 15.2905, S: 0.08931 },
  { month: 45, L: -0.5684, M: 15.2814, S: 0.08991 },
  { month: 46, L: -0.5684, M: 15.2732, S: 0.09051 },
  { month: 47, L: -0.5684, M: 15.2661, S: 0.09110 },
  { month: 48, L: -0.5684, M: 15.2602, S: 0.09168 },
  { month: 49, L: -0.5684, M: 15.2556, S: 0.09227 },
  { month: 50, L: -0.5684, M: 15.2523, S: 0.09286 },
  { month: 51, L: -0.5684, M: 15.2503, S: 0.09345 },
  { month: 52, L: -0.5684, M: 15.2496, S: 0.09403 },
  { month: 53, L: -0.5684, M: 15.2502, S: 0.09460 },
  { month: 54, L: -0.5684, M: 15.2519, S: 0.09515 },
  { month: 55, L: -0.5684, M: 15.2544, S: 0.09568 },
  { month: 56, L: -0.5684, M: 15.2575, S: 0.09618 },
  { month: 57, L: -0.5684, M: 15.2612, S: 0.09665 },
  { month: 58, L: -0.5684, M: 15.2653, S: 0.09709 },
  { month: 59, L: -0.5684, M: 15.2698, S: 0.09750 },
  { month: 60, L: -0.5684, M: 15.2747, S: 0.09789 }
];
