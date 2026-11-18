/**
 * Georgian number names for 1–100.
 *
 * Georgian counts in twenties: 20 ოცი, 40 ორმოცი, 60 სამოცი, 80 ოთხმოცი, and
 * every number above a twenty is "that twenty + და + the rest (1–19)":
 * 37 = ოცდაჩვიდმეტი (20 + 17), 99 = ოთხმოცდაცხრამეტი (80 + 19).
 */

const BELOW_TWENTY = [
  '',
  'ერთი',
  'ორი',
  'სამი',
  'ოთხი',
  'ხუთი',
  'ექვსი',
  'შვიდი',
  'რვა',
  'ცხრა',
  'ათი',
  'თერთმეტი',
  'თორმეტი',
  'ცამეტი',
  'თოთხმეტი',
  'თხუთმეტი',
  'თექვსმეტი',
  'ჩვიდმეტი',
  'თვრამეტი',
  'ცხრამეტი',
];

/** Stems of 20, 40, 60, 80 (without the final „ი“). */
const TWENTIES = ['', 'ოც', 'ორმოც', 'სამოც', 'ოთხმოც'];

export function numberName(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new RangeError(`numberName supports 1–100, got ${n}`);
  if (n === 100) return 'ასი';
  if (n < 20) return BELOW_TWENTY[n];
  const stem = TWENTIES[Math.floor(n / 20)];
  const rest = n % 20;
  return rest === 0 ? `${stem}ი` : `${stem}და${BELOW_TWENTY[rest]}`;
}
