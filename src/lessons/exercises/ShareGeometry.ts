/**
 * G2 U06 fair sharing and division — pure and exact.
 *
 * Division is asked two ways and both are the same arithmetic: sharing `total` into `groups` gives each group
 * `total ÷ groups`, and grouping `total` by `size` gives `total ÷ size` complete groups. Everything here is computed
 * from those integers, so "fair" is a statement about the numbers and never about how a row of counters looks.
 */

// ─────────────────────────── fair sharing ───────────────────────────

/** What each of `people` receives when `total` is shared fairly, and what cannot be shared. */
export function fairShare(total: number, people: number): { share: number; leftover: number } {
  if (people < 1) return { share: 0, leftover: total };
  return { share: Math.floor(total / people), leftover: total % people };
}

/** Whether `total` can be shared fairly among `people` with nothing left over. */
export const sharesExactly = (total: number, people: number): boolean => people > 0 && total % people === 0;

/** The counts each recipient ends up with when `total` is dealt out one at a time. */
export function dealOut(total: number, people: number): number[] {
  if (people < 1) return [];
  const out = Array.from({ length: people }, () => 0);
  for (let i = 0; i < total; i += 1) out[i % people] += 1;
  return out;
}

/** Whether every recipient has the same number — the definition of a fair share. */
export const allSame = (counts: number[]): boolean => counts.length > 0 && counts.every((n) => n === counts[0]);

/** The recipients who do not have the same as the first — for pointing at the problem, not just calling it wrong. */
export const oddOnesOut = (counts: number[]): number[] => {
  if (counts.length === 0) return [];
  const first = counts[0];
  return counts.flatMap((n, i) => (n === first ? [] : [i]));
};

/** The total held in a set of counts. */
export const totalOfCounts = (counts: number[]): number => counts.reduce((n, c) => n + c, 0);

/** A fair share is only fair when nothing is left over and every share is the same size. */
export const isFairShare = (counts: number[], total: number): boolean => allSame(counts) && totalOfCounts(counts) === total;

/** `12 ბავშვი — 3-3 თითოეულს`. */
export const shareText = (total: number, people: number): string => {
  const { share, leftover } = fairShare(total, people);
  return leftover === 0
    ? `${total} საგანი ${people} ჯგუფზე: თითოეულში ${share} — ნაშთი არ არის.`
    : `${total} საგანი ${people} ჯგუფზე: თითოეულში ${share}, ნაშთი ${leftover}.`;
};

// ─────────────────────────── grouping ───────────────────────────

/** How many complete groups of `size` can be made from `total`, and how many are left. */
export function groupInto(total: number, size: number): { groups: number; leftover: number } {
  if (size < 1) return { groups: 0, leftover: total };
  return { groups: Math.floor(total / size), leftover: total % size };
}

/** Whether `total` makes complete groups of `size`. */
export const groupsExactly = (total: number, size: number): boolean => size > 0 && total % size === 0;

/** The groups formed, one list of objects each, for a board to draw. */
export const groupsMade = (total: number, size: number): number[][] => {
  const { groups } = groupInto(total, size);
  return Array.from({ length: groups }, () => Array.from({ length: size }, () => 1));
};

/** `12 საგანი 4-ად: 3 სრული ჯგუფი, ნაშთი 0.` */
export const groupText = (total: number, size: number): string => {
  const { groups, leftover } = groupInto(total, size);
  return `${total} საგანი ${size}-ად: ${groups} სრული ჯგუფი${leftover ? `, ნაშთი ${leftover}` : ', ნაშთი არ არის'}.`;
};

// ─────────────────────────── division ───────────────────────────

/** The quotient of a division, or `null` when it is not a whole number. */
export const quotientOf = (total: number, by: number): number | null => (by === 0 || total % by !== 0 ? null : total / by);

/** `12 ÷ 3 = 4`. */
export const divisionText = (total: number, by: number): string => `${total} ÷ ${by} = ${quotientOf(total, by) ?? '?'}`;

/** `3 × 4 = 12` — the multiplication that answers the same division. */
export const inverseText = (total: number, by: number): string => `${by} × ${quotientOf(total, by) ?? '?'} = ${total}`;

/** Whether a division sentence is true, read from the numbers. */
export const divisionHolds = (total: number, by: number, share: number): boolean => by !== 0 && by * share === total;

/**
 * Which reading of a division a story is: `share` puts the total into a known number of groups; `group` makes groups of
 * a known size. The quotient means a different thing in each, but the arithmetic is identical.
 */
export const divisionKind = (kind: 'share' | 'group'): string =>
  kind === 'share' ? 'ვყოფთ ტოლ წილებად: ვიცით ჯგუფების რაოდენობა.' : 'ვაჯგუფებთ მოცემული ზომით: ვიცით თითო ჯგუფში რამდენია.';

// ─────────────────────────── fact families ───────────────────────────

/** The four facts that one pair of factors gives. */
export function factFamily(a: number, b: number): { multiply: string; commuted: string; divideA: string; divideB: string; product: number } {
  const product = a * b;
  return {
    multiply: `${a} × ${b} = ${product}`,
    commuted: `${b} × ${a} = ${product}`,
    divideA: `${product} ÷ ${a} = ${b}`,
    divideB: `${product} ÷ ${b} = ${a}`,
    product,
  };
}

/** The answer to whichever of the family's facts is being asked. */
export const familyAnswer = (a: number, b: number, missing: 'a' | 'b' | 'product'): number =>
  missing === 'a' ? a : missing === 'b' ? b : a * b;

/** Whether a multiplication fact and a division fact are the same family. */
export const sameFamily = (a: number, b: number, total: number, by: number): boolean => a * b === total && (by === a || by === b);

/** Every multiplication fact that answers `total ÷ by`, written out. */
export const relatedMultiplication = (total: number, by: number): string[] => {
  const q = quotientOf(total, by);
  return q === null ? [] : [`${by} × ${q} = ${total}`, `${q} × ${by} = ${total}`];
};
