import { analyzeSingleTable, mantelHaenszel, TwoByTwoTable } from './mantelHaenszel';

const stratum1: TwoByTwoTable = { a: 66, b: 36, c: 28, d: 32 };
const stratum2: TwoByTwoTable = { a: 40, b: 20, c: 15, d: 25 };

console.log('--- Mantel-Haenszel (expect orMH=2.498 CI[1.499,4.164], rrMH=1.519 CI[1.181,1.953], chiSquareMH=12.51) ---');
console.log('--- Breslow-Day OR (expect chiSquare=0.7394, p=0.3899) ---');
console.log(mantelHaenszel([stratum1, stratum2]));
