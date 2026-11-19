/**
 * G2 U01 place value — pure and exact.
 *
 * A three-digit number is three digits, each worth its digit times its place. Everything in this unit is computed from
 * that one fact: what a digit is worth (`valueOf`), what a set of blocks is worth (`valueOfBlocks`), how a number
 * splits into its places (`placesOf`) and how ten of one place become one of the next (`exchange`). A picture is drawn
 * from these numbers, so a picture can never claim a value its blocks do not have.
 */

// ─────────────────────────── places ───────────────────────────

export type Place = 'hundreds' | 'tens' | 'ones';

/** Highest place first: the order a number is read and written in. */
export const PLACES: Place[] = ['hundreds', 'tens', 'ones'];

export const PLACE_MULT: Record<Place, number> = { hundreds: 100, tens: 10, ones: 1 };

/** „ასეული“, „ათეული“, „ერთეული“ — the place itself. */
export const PLACE_NAME: Record<Place, string> = { hundreds: 'ასეული', tens: 'ათეული', ones: 'ერთეული' };

/** „ასეულები“, „ათეულები“, „ერთეულები“ — for counting blocks. */
export const PLACE_PLURAL: Record<Place, string> = { hundreds: 'ასეულები', tens: 'ათეულები', ones: 'ერთეულები' };

/** The block that stands for one of this place. */
export const PLACE_BLOCK: Record<Place, string> = { hundreds: 'ბრტყელი', tens: 'ჩხირი', ones: 'კუბიკი' };

/** „100“, „10“, „1“ — what one block of this place is worth. */
export const PLACE_WORTH: Record<Place, number> = { hundreds: 100, tens: 10, ones: 1 };

/** The next place up, or `null` above hundreds. */
export const placeUp = (place: Place): Place | null => (place === 'ones' ? 'tens' : place === 'tens' ? 'hundreds' : null);

export const placeDown = (place: Place): Place | null => (place === 'ones' ? null : place === 'tens' ? 'ones' : 'tens');

/** A digit in a place is worth the digit times the place: 7 in the tens place is 70, never 7. */
export const valueOf = (digit: number, place: Place): number => digit * PLACE_MULT[place];

// ─────────────────────────── digits and blocks ───────────────────────────

/** The three digits of a number, in place order. `0`..`999` only: this unit is about three-digit numbers. */
export interface DigitCounts {
  hundreds: number;
  tens: number;
  ones: number;
}

const isWhole = (n: number): boolean => Number.isInteger(n) && Number.isFinite(n);

export function digitsOf(n: number): DigitCounts {
  if (!isWhole(n) || n < 0 || n > 999) throw new RangeError(`digitsOf supports 0–999, got ${n}`);
  return { hundreds: Math.floor(n / 100), tens: Math.floor((n % 100) / 10), ones: n % 10 };
}

/** The value of a set of blocks, whether or not it has been regrouped: 12 ones really are 12. */
export function valueOfBlocks(counts: DigitCounts): number {
  return counts.hundreds * 100 + counts.tens * 10 + counts.ones;
}

/** A set of blocks is in standard form when no place holds ten or more. */
export const isStandard = (counts: DigitCounts): boolean =>
  [counts.hundreds, counts.tens, counts.ones].every((c) => isWhole(c) && c >= 0 && c <= 9);

/** The standard set of blocks for a number. */
export const blocksOf = (n: number): DigitCounts => digitsOf(n);

/** The same blocks with every ten exchanged for one of the next place — the value never changes. */
export function regroup(counts: DigitCounts): DigitCounts {
  const total = valueOfBlocks(counts);
  if (!isWhole(total) || total < 0 || total > 999) throw new RangeError(`regroup needs a value between 0 and 999, got ${total}`);
  return digitsOf(total);
}

/** A set of blocks that must be regrouped before it reads as one number. */
export const needsRegroup = (counts: DigitCounts): boolean => !isStandard(counts) && valueOfBlocks(counts) <= 999;

/**
 * Exchange ten blocks of `place` for one of the next place up. Returns `null` when there are not ten to exchange, or
 * when `place` is already the highest place. The value is unchanged — that is the point of the exchange.
 */
export function exchange(counts: DigitCounts, place: Place): DigitCounts | null {
  const up = placeUp(place);
  if (!up) return null;
  if (counts[place] < 10) return null;
  const next: DigitCounts = { ...counts, [place]: counts[place] - 10 };
  next[up] = counts[up] + 1;
  return next;
}

/** How many exchanges are still possible, which is how many tens are sitting in a place. */
export function exchangeable(counts: DigitCounts): Array<{ place: Place; count: number }> {
  return (['ones', 'tens'] as Place[])
    .map((place) => ({ place, count: Math.floor(counts[place] / 10) }))
    .filter((x) => x.count > 0 && placeUp(x.place) !== null);
}

/** One block of `place` broken into ten of the place below — the exchange in the other direction. */
export function breakDown(counts: DigitCounts, place: Place): DigitCounts | null {
  const down = placeDown(place);
  if (!down) return null;
  if (counts[place] < 1) return null;
  const next: DigitCounts = { ...counts, [place]: counts[place] - 1 };
  next[down] = counts[down] + 10;
  return next;
}

// ─────────────────────────── reading and writing ───────────────────────────

const GEORGIAN_DIGITS = ['ნული', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა'];

/** A single digit in words, for “the digit is 7, its value is 70”. */
export const digitWord = (digit: number): string => GEORGIAN_DIGITS[digit] ?? String(digit);

/** „3 ასეული, 4 ათეული და 5 ერთეული“ — the blocks said in words, zeros left out but never hidden. */
export function blocksText(counts: DigitCounts): string {
  const parts = PLACES.filter((p) => counts[p] > 0).map((p) => `${counts[p]} ${PLACE_PLURAL[p]}`);
  if (parts.length === 0) return 'არც ერთი ბლოკი';
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} და ${parts[parts.length - 1]}`;
}

/** What each digit is worth, read aloud: „5 ერთეული = 5, 4 ათეული = 40, 3 ასეული = 300“. */
export function digitValuesText(n: number): string {
  const d = digitsOf(n);
  return PLACES.map((p) => `${PLACE_NAME[p]} ${d[p]} = ${valueOf(d[p], p)}`).join(', ');
}

// ─────────────────────────── expanded form ───────────────────────────

export interface ExpandedPart {
  place: Place;
  digit: number;
  value: number;
}

/** The three parts of a number, highest place first, zeros included (405 is 400 + 0 + 5). */
export function partsOf(n: number): ExpandedPart[] {
  const d = digitsOf(n);
  return PLACES.map((place) => ({ place, digit: d[place], value: valueOf(d[place], place) }));
}

/** „400 + 40 + 5“ — the expanded form with the zero places written, so a gap is never invisible. */
export const expandedText = (n: number): string => partsOf(n).map((p) => p.value).join(' + ');

/** „400 + 5“ — a shorter form, shown beside the long one so the student sees the zero is doing work. */
export const expandedShortText = (n: number): string =>
  partsOf(n)
    .filter((p) => p.value > 0)
    .map((p) => p.value)
    .join(' + ') || '0';

/** The number an expanded form adds up to. */
export const sumOfParts = (values: number[]): number => values.reduce((sum, v) => sum + v, 0);

/**
 * The places a list of expanded-form cards fills correctly. A card belongs to a place when it is exactly that place's
 * value: 300 is a hundreds card, 30 is a tens card, 3 is a ones card, and 0 fills a place that holds nothing.
 */
export function partsHold(n: number, cards: number[]): boolean {
  const parts = partsOf(n);
  if (cards.length !== parts.length) return false;
  return cards.every((card, i) => card === parts[i].value);
}

/** Parse a typed expanded form such as „300 + 40 + 5“ into the number it names. */
export function parseExpanded(text: string): number | null {
  const trimmed = text.trim().replace(/−/g, '-');
  if (!trimmed) return null;
  const pieces = trimmed.split('+').map((p) => p.trim());
  if (pieces.length === 0) return null;
  let total = 0;
  for (const piece of pieces) {
    if (!/^\d+$/.test(piece)) return null;
    total += Number(piece);
  }
  return total;
}

// ─────────────────────────── the value of one digit ───────────────────────────

/** Where a place sits when the digits are written out: hundreds, tens, ones. */
export const placeAt = (index: number): Place | null => PLACES[index] ?? null;

/** The digit in a place. */
export const digitAt = (n: number, place: Place): number => digitsOf(n)[place];

/** What the digit in a place is worth: the digit and its place, and never its face value alone. */
export const valueAt = (n: number, place: Place): number => valueOf(digitAt(n, place), place);

/**
 * The same digit in two places is worth different amounts: 7 in the tens place is ten times 7 in the ones place.
 * Returns the two values and how many times bigger the higher one is.
 */
export function sameDigitAcross(digit: number, a: Place, b: Place): { a: number; b: number; times: number } {
  const high = valueOf(digit, a);
  const low = valueOf(digit, b);
  return { a: high, b: low, times: low === 0 ? 0 : high / low };
}

/** A digit is not its place value: 4 in 345 is the digit 4, worth 40. */
export function digitOrValue(digit: number, place: Place): { digit: number; value: number } {
  return { digit, value: valueOf(digit, place) };
}

// ─────────────────────────── building and decomposing ───────────────────────────

/** The blocks that build a number. */
export const build = (hundreds: number, tens: number, ones: number): DigitCounts => ({ hundreds, tens, ones });

/**
 * The value a question hides, so a puzzle can mark one part unknown: `missing` is the place left blank and the answer
 * is that place's value.
 */
export function missingPlaceValue(n: number, missing: Place): number {
  return valueAt(n, missing);
}

/** The sum of the two places that are shown, which is what the missing part has to complete. */
export function shownPlacesSum(n: number, missing: Place): number {
  return PLACES.filter((p) => p !== missing).reduce((sum, p) => sum + valueAt(n, p), 0);
}

/**
 * A missing-part puzzle is well-formed when the two shown parts plus the hidden one really make the number, and when
 * the hidden part is not zero — a blank worth nothing would be a trap rather than a question.
 */
export const placePuzzleHolds = (n: number, missing: Place): boolean =>
  shownPlacesSum(n, missing) + missingPlaceValue(n, missing) === n && missingPlaceValue(n, missing) > 0;

/** Ten of a place, as one of the next: 10 ones = 1 ten, 10 tens = 1 hundred. */
export function exchangeRule(place: Place): { ten: string; one: string; ok: boolean } {
  if (place === 'ones') return { ten: '10 ერთეული', one: '1 ათეული', ok: true };
  if (place === 'tens') return { ten: '10 ათეული', one: '1 ასეული', ok: true };
  return { ten: '', one: '', ok: false };
}

/** The blocks a number would have if nothing were regrouped: e.g. 30 ones for 30. Used to show that regrouping is a
 *  change of grouping, not of value. */
export const ungrouped = (n: number): DigitCounts => ({ hundreds: 0, tens: 0, ones: n });

/** Every way of writing the same number with more than nine in a place, for “these two sets are worth the same”. */
export function sameValue(a: DigitCounts, b: DigitCounts): boolean {
  return valueOfBlocks(a) === valueOfBlocks(b);
}
