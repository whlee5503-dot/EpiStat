import { analyzeSingleTable, mantelHaenszel, TwoByTwoTable } from './mantelHaenszel';

const stratum1: TwoByTwoTable = { a: 66, b: 36, c: 28, d: 32 };
const stratum2: TwoByTwoTable = { a: 40, b: 20, c: 15, d: 25 };

console.log('--- Stratum 1 (expect chiSq=5.047, OR=2.095, RR=1.387) ---');
console.log(analyzeSingleTable(stratum1));

console.log('--- Stratum 2 ---');
console.log(analyzeSingleTable(stratum2));

console.log('--- Mantel-Haenszel (expect orMH=2.498, rrMH=1.519, chiSquareMH=12.51) ---');
console.log(mantelHaenszel([stratum1, stratum2]));
