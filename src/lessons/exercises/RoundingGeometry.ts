/** Integer rounding for non-negative whole quantities, with ties going up. */
export function roundingInterval(number: number, place: 10 | 100) {
  if (!Number.isInteger(number) || number < 0) throw new RangeError('number must be a non-negative integer');
  const lower = Math.floor(number / place) * place;
  const upper = lower + place;
  const midpoint = lower + place / 2;
  return { lower, upper, midpoint, down: number - lower, up: upper - number, rounded: number < midpoint ? lower : upper };
}
export function estimateCalculation(a: number, b: number, op: '+' | '−', place: 10 | 100) {
  const roundedA = roundingInterval(a, place).rounded;
  const roundedB = roundingInterval(b, place).rounded;
  return { roundedA, roundedB, estimate: op === '+' ? roundedA + roundedB : roundedA - roundedB, exact: op === '+' ? a + b : a - b };
}
