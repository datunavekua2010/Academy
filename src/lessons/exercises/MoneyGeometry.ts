/**
 * G2 U09 — Georgian money: coins, banknotes, totals and change.
 *
 * A collection of money is a list of denominations, and everything else is derived from that list: the total is the
 * sum of the list, the fewest pieces are found from the list, change is one total taken from another. There is no
 * second copy of an amount anywhere, so a picture can never show 45 თეთრი above a question whose answer is 40.
 *
 * **Real money only.** Georgia mints 1, 2, 5, 10, 20 and 50 თეთრი and prints 1, 2, 5, 10, 20, 50 and 100 ლარი. One
 * ლარი is 100 თეთრი and the specification forbids decimals, so every amount here is a whole number of თეთრი and the
 * denominations are the ones that exist. `COIN_VALUES` and `NOTE_VALUES` are the only sources of them.
 */

// ─────────────────────────── denominations ───────────────────────────

/** The თეთრი coins, smallest first. */
export const COIN_VALUES: readonly number[] = [1, 2, 5, 10, 20, 50];

/** The ლარი banknotes, smallest first. A note is written in ლარი and worth a hundred times that in თეთრი. */
export const NOTE_VALUES: readonly number[] = [1, 2, 5, 10, 20, 50];

/** One ლარი is one hundred თეთრი. The only conversion in the unit. */
export const TETRI_PER_LARI = 100;

/** The largest amount this unit deals with: fifty ლარი. */
export const MAX_TETRI = 5000;

export type MoneyKind = 'coin' | 'note';

/** One piece of money: what it is worth (in თეთრი) and whether it is a coin or a banknote. */
export interface MoneyPiece {
  kind: MoneyKind;
  /** Worth in თეთრი. */
  value: number;
}

export const coin = (tetri: number): MoneyPiece => ({ kind: 'coin', value: tetri });
export const note = (lari: number): MoneyPiece => ({ kind: 'note', value: lari * TETRI_PER_LARI });

/** A piece written the way the wall says it: „50 თეთრი“ or „5 ლარი“. Never a decimal. */
export function pieceText(value: number): string {
  if (value % TETRI_PER_LARI === 0) return `${value / TETRI_PER_LARI} ლარი`;
  return `${value} თეთრი`;
}

/** The short form printed inside a coin or on a note: „50თ“ or „5ლ“ (the sign matters on a small token). */
export function pieceShort(value: number): string {
  return value % TETRI_PER_LARI === 0 ? `${value / TETRI_PER_LARI}ლ` : `${value}თ`;
}

/** „5 ლარი“ / „45 თეთრი“ — an amount, not a piece. */
export function moneyText(tetri: number): string {
  const whole = Math.round(tetri);
  if (whole % TETRI_PER_LARI === 0) {
    const lari = whole / TETRI_PER_LARI;
    return lari === 1 ? '1 ლარი' : `${lari} ლარი`;
  }
  if (whole < TETRI_PER_LARI) return `${whole} თეთრი`;
  const lari = Math.floor(whole / TETRI_PER_LARI);
  const rest = whole % TETRI_PER_LARI;
  return `${lari === 1 ? '1 ლარი' : `${lari} ლარი`} და ${rest} თეთრი`;
}

/** Checks an amount the way the wall would: whole, non-negative, and inside this unit's range. */
export function checkAmount(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0 || amount > MAX_TETRI) {
    throw new RangeError(`money amounts must be whole თეთრი between 0 and ${MAX_TETRI}, got ${amount}`);
  }
  return amount;
}

// ─────────────────────────── totals ───────────────────────────

/** The value of a collection: the sum of its pieces. The only way to know what a purse holds. */
export const totalOf = (pieces: readonly number[]): number => pieces.reduce((sum, n) => sum + Math.round(n), 0);

/** The total as a sentence: „20 + 10 + 5 = 35 თეთრი“. */
export function totalText(pieces: readonly number[]): string {
  if (pieces.length === 0) return '0 თეთრი';
  return `${pieces.join(' + ')} = ${moneyText(totalOf(pieces))}`;
}

/** A total written as ლარი and თეთრი: 135 → one ლარი and 35 თეთრი. */
export const splitAmount = (tetri: number): { lari: number; tetri: number } => ({
  lari: Math.floor(Math.round(tetri) / TETRI_PER_LARI),
  tetri: Math.round(tetri) % TETRI_PER_LARI,
});

/** Whether a collection is worth exactly `amount`. */
export const worths = (pieces: readonly number[], amount: number): boolean => totalOf(pieces) === Math.round(amount);

/** The pieces of one value in a collection, kept in order — what skip-counting walks along. */
export const sameValue = (pieces: readonly number[], value: number): number[] => pieces.filter((p) => p === value);

/** How many pieces a collection holds. */
export const pieceCount = (pieces: readonly number[]): number => pieces.length;

/** The running total after each piece — the numbers a student says out loud while counting. */
export function runningTotal(pieces: readonly number[]): number[] {
  let sum = 0;
  return pieces.map((p) => {
    sum += Math.round(p);
    return sum;
  });
}

/** The largest piece in a collection (0 for an empty one). */
export const largestPiece = (pieces: readonly number[]): number => (pieces.length === 0 ? 0 : Math.max(...pieces));

/** Collections grouped by value, biggest first — how a mixed purse is organised before it is counted. */
export function organise(pieces: readonly number[]): Array<{ value: number; count: number }> {
  const values = [...new Set(pieces)].sort((a, b) => b - a);
  return values.map((value) => ({ value, count: pieces.filter((p) => p === value).length }));
}

/** „10 + 10 + 5 + 2 = 27“ — a collection's pieces in counting order, added one at a time. */
export function organisedText(pieces: readonly number[]): string {
  if (pieces.length === 0) return '0';
  return `${[...pieces].sort((a, b) => b - a).join(' + ')} = ${totalOf(pieces)}`;
}

// ─────────────────────────── ways to make an amount ───────────────────────────

/** Notes and coins together, largest first — the order money is counted in. */
export const ALL_VALUES: readonly number[] = [...NOTE_VALUES].reverse().map((n) => n * TETRI_PER_LARI).concat([...COIN_VALUES].reverse());

/** The coin denominations as the unit teaches them, largest first. */
export const COINS_DESC: readonly number[] = [...COIN_VALUES].reverse();

/**
 * The fewest pieces that make `amount`, largest first. Georgian denominations are canonical — every value is at least
 * twice the one below it, except 2 against 1 — so taking the largest piece that fits can never use more pieces than
 * any other way. A test re-derives this by exhaustive search over the coin range.
 */
export function fewestPieces(amount: number, values: readonly number[] = COINS_DESC): number[] {
  let left = checkAmount(amount);
  const out: number[] = [];
  for (const value of values) {
    while (left >= value) {
      out.push(value);
      left -= value;
    }
  }
  return out;
}

/** How many pieces `amount` needs at fewest. */
export const minPieces = (amount: number, values: readonly number[] = COINS_DESC): number => fewestPieces(amount, values).length;

/** Whether a collection is the *fewest* pieces that make its own total. */
export const isFewest = (pieces: readonly number[]): boolean => pieces.length === minPieces(totalOf(pieces));

/**
 * Every way to make `amount` from `values`, counting `10 + 5` and `5 + 10` once. Each way is sorted largest first, and
 * the list is sorted by number of pieces, so the fewest are first.
 */
export function waysToMake(amount: number, values: readonly number[] = COINS_DESC): number[][] {
  const target = Math.round(amount);
  const coins = [...values].sort((a, b) => b - a);
  const found: number[][] = [];
  const walk = (left: number, from: number, picked: number[]) => {
    if (left === 0) {
      found.push([...picked]);
      return;
    }
    for (let i = from; i < coins.length; i += 1) {
      const value = coins[i];
      if (value > left) continue;
      picked.push(value);
      walk(left - value, i, picked);
      picked.pop();
    }
  };
  walk(target, 0, []);
  return found.sort((a, b) => a.length - b.length || b.join(',').localeCompare(a.join(',')));
}

/** How many ways there are to make an amount — „45 თეთრი 4 გზით შეიძლება“. */
export const wayCount = (amount: number, values: readonly number[] = COINS_DESC): number => waysToMake(amount, values).length;

/** Whether a collection is one of the ways to make `amount` (order and arrangement never matter). */
export const isAWay = (pieces: readonly number[], amount: number, values: readonly number[] = COINS_DESC): boolean =>
  totalOf(pieces) === Math.round(amount) && pieces.every((p) => values.includes(p));

/** The way in a list that uses the fewest pieces, and the way that uses the most. */
export function fewestAndMost(amount: number, values: readonly number[] = COINS_DESC): { fewest: number[]; most: number[] } | null {
  const ways = waysToMake(amount, values);
  if (ways.length === 0) return null;
  const fewest = ways.reduce((best, way) => (way.length < best.length ? way : best), ways[0]);
  const most = ways.reduce((best, way) => (way.length > best.length ? way : best), ways[0]);
  return { fewest, most };
}

// ─────────────────────────── shopping and change ───────────────────────────

/** Change is what was handed over minus what the thing costs — never the other way round. */
export const changeFrom = (paid: number, cost: number): number => Math.round(paid) - Math.round(cost);

/** Whether there is enough money to pay the cost. */
export const canAfford = (money: number, cost: number): boolean => Math.round(money) >= Math.round(cost);

/** How much is short when there is not enough (0 when there is). */
export const shortBy = (money: number, cost: number): number => Math.max(0, Math.round(cost) - Math.round(money));

/** „500 − 320 = 180“ — the change as a subtraction, so it can be checked by adding. */
export const changeText = (paid: number, cost: number): string => `${paid} − ${cost} = ${changeFrom(paid, cost)}`;

/** Change in pieces: the fewest coins and notes that give the amount back. */
export const changePieces = (paid: number, cost: number): number[] => fewestPieces(changeFrom(paid, cost));
