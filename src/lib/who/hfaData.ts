// WHO Child Growth Standards - Length/Height-for-age (HFA/LFA)
// Source: WHO official LMS z-score tables
// https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
// Two separate tables per sex, reflecting WHO's recumbent-length vs
// standing-height measurement convention:
//   - HFA_LENGTH_*: Birth to 2 years (0-24 months), recumbent length (cm)
//   - HFA_HEIGHT_*: 2 to 5 years (24-60 months), standing height (cm)
// Both tables define a row at month 24 with different M values -- the
// ~0.7cm systematic difference between recumbent length and standing
// height is intentionally built into WHO's own reference data at this
// boundary (verified: boys 87.8161 vs 87.1161, girls 86.4153 vs 85.7153,
// both exactly 0.7cm). L = 1 for all rows in this indicator (WHO uses an
// unmodified normal distribution here, unlike weight-based indicators).
// Transcribed directly from WHO source PDFs on 2026-08-10; not sourced via
// OpenEpi or any third-party reimplementation.

import type { LmsRow } from './wfaData';

export const HFA_LENGTH_BOYS: LmsRow[] = [
  { month: 0, L: 1, M: 49.8842, S: 0.03795 },
  { month: 1, L: 1, M: 54.7244, S: 0.03557 },
  { month: 2, L: 1, M: 58.4249, S: 0.03424 },
  { month: 3, L: 1, M: 61.4292, S: 0.03328 },
  { month: 4, L: 1, M: 63.8860, S: 0.03257 },
  { month: 5, L: 1, M: 65.9026, S: 0.03204 },
  { month: 6, L: 1, M: 67.6236, S: 0.03165 },
  { month: 7, L: 1, M: 69.1645, S: 0.03139 },
  { month: 8, L: 1, M: 70.5994, S: 0.03124 },
  { month: 9, L: 1, M: 71.9687, S: 0.03117 },
  { month: 10, L: 1, M: 73.2812, S: 0.03118 },
  { month: 11, L: 1, M: 74.5388, S: 0.03125 },
  { month: 12, L: 1, M: 75.7488, S: 0.03137 },
  { month: 13, L: 1, M: 76.9186, S: 0.03154 },
  { month: 14, L: 1, M: 78.0497, S: 0.03174 },
  { month: 15, L: 1, M: 79.1458, S: 0.03197 },
  { month: 16, L: 1, M: 80.2113, S: 0.03222 },
  { month: 17, L: 1, M: 81.2487, S: 0.03250 },
  { month: 18, L: 1, M: 82.2587, S: 0.03279 },
  { month: 19, L: 1, M: 83.2418, S: 0.03310 },
  { month: 20, L: 1, M: 84.1996, S: 0.03342 },
  { month: 21, L: 1, M: 85.1348, S: 0.03376 },
  { month: 22, L: 1, M: 86.0477, S: 0.03410 },
  { month: 23, L: 1, M: 86.9410, S: 0.03445 },
  { month: 24, L: 1, M: 87.8161, S: 0.03479 }
];

export const HFA_LENGTH_GIRLS: LmsRow[] = [
  { month: 0, L: 1, M: 49.1477, S: 0.03790 },
  { month: 1, L: 1, M: 53.6872, S: 0.03640 },
  { month: 2, L: 1, M: 57.0673, S: 0.03568 },
  { month: 3, L: 1, M: 59.8029, S: 0.03520 },
  { month: 4, L: 1, M: 62.0899, S: 0.03486 },
  { month: 5, L: 1, M: 64.0301, S: 0.03463 },
  { month: 6, L: 1, M: 65.7311, S: 0.03448 },
  { month: 7, L: 1, M: 67.2873, S: 0.03441 },
  { month: 8, L: 1, M: 68.7498, S: 0.03440 },
  { month: 9, L: 1, M: 70.1435, S: 0.03444 },
  { month: 10, L: 1, M: 71.4818, S: 0.03452 },
  { month: 11, L: 1, M: 72.7710, S: 0.03464 },
  { month: 12, L: 1, M: 74.0150, S: 0.03479 },
  { month: 13, L: 1, M: 75.2176, S: 0.03496 },
  { month: 14, L: 1, M: 76.3817, S: 0.03514 },
  { month: 15, L: 1, M: 77.5099, S: 0.03534 },
  { month: 16, L: 1, M: 78.6055, S: 0.03555 },
  { month: 17, L: 1, M: 79.6710, S: 0.03576 },
  { month: 18, L: 1, M: 80.7079, S: 0.03598 },
  { month: 19, L: 1, M: 81.7182, S: 0.03620 },
  { month: 20, L: 1, M: 82.7036, S: 0.03643 },
  { month: 21, L: 1, M: 83.6654, S: 0.03666 },
  { month: 22, L: 1, M: 84.6040, S: 0.03688 },
  { month: 23, L: 1, M: 85.5202, S: 0.03711 },
  { month: 24, L: 1, M: 86.4153, S: 0.03734 }
];

export const HFA_HEIGHT_BOYS: LmsRow[] = [
  { month: 24, L: 1, M: 87.1161, S: 0.03507 },
  { month: 25, L: 1, M: 87.9720, S: 0.03542 },
  { month: 26, L: 1, M: 88.8065, S: 0.03576 },
  { month: 27, L: 1, M: 89.6197, S: 0.03610 },
  { month: 28, L: 1, M: 90.4120, S: 0.03642 },
  { month: 29, L: 1, M: 91.1828, S: 0.03674 },
  { month: 30, L: 1, M: 91.9327, S: 0.03704 },
  { month: 31, L: 1, M: 92.6631, S: 0.03733 },
  { month: 32, L: 1, M: 93.3753, S: 0.03761 },
  { month: 33, L: 1, M: 94.0711, S: 0.03787 },
  { month: 34, L: 1, M: 94.7532, S: 0.03812 },
  { month: 35, L: 1, M: 95.4236, S: 0.03836 },
  { month: 36, L: 1, M: 96.0835, S: 0.03858 },
  { month: 37, L: 1, M: 96.7337, S: 0.03879 },
  { month: 38, L: 1, M: 97.3749, S: 0.03900 },
  { month: 39, L: 1, M: 98.0073, S: 0.03919 },
  { month: 40, L: 1, M: 98.6310, S: 0.03937 },
  { month: 41, L: 1, M: 99.2459, S: 0.03954 },
  { month: 42, L: 1, M: 99.8515, S: 0.03971 },
  { month: 43, L: 1, M: 100.4485, S: 0.03986 },
  { month: 44, L: 1, M: 101.0374, S: 0.04002 },
  { month: 45, L: 1, M: 101.6186, S: 0.04016 },
  { month: 46, L: 1, M: 102.1933, S: 0.04031 },
  { month: 47, L: 1, M: 102.7625, S: 0.04045 },
  { month: 48, L: 1, M: 103.3273, S: 0.04059 },
  { month: 49, L: 1, M: 103.8886, S: 0.04073 },
  { month: 50, L: 1, M: 104.4473, S: 0.04086 },
  { month: 51, L: 1, M: 105.0041, S: 0.04100 },
  { month: 52, L: 1, M: 105.5596, S: 0.04113 },
  { month: 53, L: 1, M: 106.1138, S: 0.04126 },
  { month: 54, L: 1, M: 106.6668, S: 0.04139 },
  { month: 55, L: 1, M: 107.2188, S: 0.04152 },
  { month: 56, L: 1, M: 107.7697, S: 0.04165 },
  { month: 57, L: 1, M: 108.3198, S: 0.04177 },
  { month: 58, L: 1, M: 108.8689, S: 0.04190 },
  { month: 59, L: 1, M: 109.4170, S: 0.04202 },
  { month: 60, L: 1, M: 109.9638, S: 0.04214 }
];

export const HFA_HEIGHT_GIRLS: LmsRow[] = [
  { month: 24, L: 1, M: 85.7153, S: 0.03764 },
  { month: 25, L: 1, M: 86.5904, S: 0.03786 },
  { month: 26, L: 1, M: 87.4462, S: 0.03808 },
  { month: 27, L: 1, M: 88.2830, S: 0.03830 },
  { month: 28, L: 1, M: 89.1004, S: 0.03851 },
  { month: 29, L: 1, M: 89.8991, S: 0.03872 },
  { month: 30, L: 1, M: 90.6797, S: 0.03893 },
  { month: 31, L: 1, M: 91.4430, S: 0.03913 },
  { month: 32, L: 1, M: 92.1906, S: 0.03933 },
  { month: 33, L: 1, M: 92.9239, S: 0.03952 },
  { month: 34, L: 1, M: 93.6444, S: 0.03971 },
  { month: 35, L: 1, M: 94.3533, S: 0.03989 },
  { month: 36, L: 1, M: 95.0515, S: 0.04006 },
  { month: 37, L: 1, M: 95.7399, S: 0.04024 },
  { month: 38, L: 1, M: 96.4187, S: 0.04041 },
  { month: 39, L: 1, M: 97.0885, S: 0.04057 },
  { month: 40, L: 1, M: 97.7493, S: 0.04073 },
  { month: 41, L: 1, M: 98.4015, S: 0.04089 },
  { month: 42, L: 1, M: 99.0448, S: 0.04105 },
  { month: 43, L: 1, M: 99.6795, S: 0.04120 },
  { month: 44, L: 1, M: 100.3058, S: 0.04135 },
  { month: 45, L: 1, M: 100.9238, S: 0.04150 },
  { month: 46, L: 1, M: 101.5337, S: 0.04164 },
  { month: 47, L: 1, M: 102.1360, S: 0.04179 },
  { month: 48, L: 1, M: 102.7312, S: 0.04193 },
  { month: 49, L: 1, M: 103.3197, S: 0.04206 },
  { month: 50, L: 1, M: 103.9021, S: 0.04220 },
  { month: 51, L: 1, M: 104.4786, S: 0.04233 },
  { month: 52, L: 1, M: 105.0494, S: 0.04246 },
  { month: 53, L: 1, M: 105.6148, S: 0.04259 },
  { month: 54, L: 1, M: 106.1748, S: 0.04272 },
  { month: 55, L: 1, M: 106.7295, S: 0.04285 },
  { month: 56, L: 1, M: 107.2788, S: 0.04298 },
  { month: 57, L: 1, M: 107.8227, S: 0.04310 },
  { month: 58, L: 1, M: 108.3613, S: 0.04322 },
  { month: 59, L: 1, M: 108.8948, S: 0.04334 },
  { month: 60, L: 1, M: 109.4233, S: 0.04347 }
];
