/**
 * G2 U11 — missing-number sentences, inverses, symbol puzzles and multi-step puzzles.
 *
 * A sentence here is *one* data structure, and every question about it is answered from that structure: the missing
 * position is where the blank sits, and everything else (the answer, the check, the feedback sentence) is computed by
 * solving it. That means a lesson can never ask "8 + □ = 15" and accept 23, because nothing stores the answer 7 by hand.
 *
 * **Sentences are solved, not looked up.** `solve` walks the unknowns in the order they can be found, so a symbol puzzle
 * with three unknowns is solved step by step rather than by searching. A puzzle that cannot be solved from what it gives
 * throws instead of guessing — that is how a mistake in content is caught.
 *
 * Grade 2 scope: sums and differences up to 100, at most one unknown per simple sentence, and multi-step puzzles with at
 * most three steps.
 */

// ─────────────────────────── what a sentence is ───────────────────────────

/** One term of a sentence: either a number or an unknown written as a symbol such as `□`. */
export type Term = number | { sym: string };

/** `a op b = c`. `op` is always addition or subtraction; nothing else appears in Grade 2. */
export interface Sentence {
  a: Term;
  op: '+' | '−';
  b: Term;
  c: Term;
}

/** Every symbol in a sentence, in the order it first appears. */
export function symbolsOf(sentence: Sentence): string[] {
  const out: string[] = [];
  for (const term of [sentence.a, sentence.b, sentence.c]) {
    if (typeof term !== 'number' && !out.includes(term.sym)) out.push(term.sym);
  }
  return out;
}

/** How many symbols a sentence has (each one is a quantity the student must find). */
export const unknownCount = (sentence: Sentence): number => symbolsOf(sentence).length;

/** Whether the sentence has anything to find. */
export const hasUnknown = (sentence: Sentence): boolean => unknownCount(sentence) > 0;

const isNum = (t: Term): t is number => typeof t === 'number';
const symOf = (t: Term): string | null => (isNum(t) ? null : t.sym);

/** The symbol standing in one of the three places, or `null` when that place holds a number. */
export const symAt = (sentence: Sentence, place: 'a' | 'b' | 'c'): string | null => symOf(sentence[place]);

/** Replace every `sym` with its value. Throws when a symbol has no value, so an incomplete substitution is never silent. */
export function fill(sentence: Sentence, values: Record<string, number>): { a: number; op: '+' | '−'; b: number; c: number } {
  const one = (t: Term): number => {
    if (isNum(t)) return t;
    const v = values[t.sym];
    if (v === undefined) throw new RangeError(`no value for ${t.sym}`);
    return v;
  };
  return { a: one(sentence.a), op: sentence.op, b: one(sentence.b), c: one(sentence.c) };
}

/** Whether `a op b = c` really holds for these three numbers. */
export const holds = (a: number, op: '+' | '−', b: number, c: number): boolean => (op === '+' ? a + b === c : a - b === c);

/** Whether a filled sentence is true — the only test a "check your answer" step needs. */
export const isTrue = (sentence: Sentence, values: Record<string, number>): boolean => {
  try {
    const s = fill(sentence, values);
    return holds(s.a, s.op, s.b, s.c);
  } catch {
    return false;
  }
};

// ─────────────────────────── solving ───────────────────────────

/** The third number of a sentence, given the other two — the inverse the whole unit rests on. */
export function third(op: '+' | '−', known: 'a' | 'b' | 'c', first: number, second: number): number {
  if (op === '+') {
    if (known === 'c') return first + second;
    if (known === 'a') return second - first; // a = c − b
    return first - second; // b = c − a
  }
  // a − b = c
  if (known === 'a') return first + second; // a = c + b
  if (known === 'c') return first - second; // c = a − b
  return first - second; // b = a − c
}

/**
 * The value of one unknown in a sentence whose other two places are already numbers.
 * `place` names which position the student is looking at.
 */
export function valueAt(sentence: Sentence, place: 'a' | 'b' | 'c'): number {
  const a = sentence.a;
  const b = sentence.b;
  const c = sentence.c;
  if (place === 'a') {
    if (isNum(b) && isNum(c)) return third(sentence.op, 'a', b as number, c as number);
    throw new RangeError('cannot find a: b and c must both be known');
  }
  if (place === 'b') {
    if (isNum(a) && isNum(c)) return third(sentence.op, 'b', a as number, c as number);
    throw new RangeError('cannot find b: a and c must both be known');
  }
  if (isNum(a) && isNum(b)) return third(sentence.op, 'c', a as number, b as number);
  throw new RangeError('cannot find c: a and b must both be known');
}

/**
 * Solve every symbol in a sentence, one at a time, each from a place whose two neighbours are already known. Returns the
 * values in the order they were found, so a lesson can show the working. Throws when no symbol can be found — a puzzle
 * that gives too little is a content bug, not a puzzle.
 */
export function solve(sentence: Sentence): { values: Record<string, number>; order: string[] } {
  const values: Record<string, number> = {};
  const order: string[] = [];
  const places: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];
  // a symbol may appear in more than one place (the same symbol is the same number), so repeat until nothing moves
  let progress = true;
  while (progress) {
    progress = false;
    for (const place of places) {
      const sym = symOf(sentence[place]);
      if (!sym || values[sym] !== undefined) continue;
      const others = places.filter((p) => p !== place);
      if (!others.every((p) => isNum(sentence[p]))) continue;
      const [first, second] = others.map((p) => sentence[p] as number);
      values[sym] = third(sentence.op, place, first, second);
      order.push(sym);
      progress = true;
    }
  }
  const left = symbolsOf(sentence).filter((s) => values[s] === undefined);
  if (left.length > 0) throw new RangeError(`cannot solve ${left.join(', ')} from ${sentenceText(sentence)}`);
  return { values, order };
}

/** The value of the sentence's only unknown. Throws when there is not exactly one. */
export function answerOf(sentence: Sentence): number {
  const syms = symbolsOf(sentence);
  if (syms.length !== 1) throw new RangeError(`a single-unknown sentence is needed, this one has ${syms.length}`);
  return solve(sentence).values[syms[0]];
}

// ─────────────────────────── writing a sentence ───────────────────────────

/** A term the way it is written: a number, or the symbol itself. */
export const termText = (t: Term): string => (isNum(t) ? String(t) : t.sym);

/** The sentence as it is read: `8 + □ = 15`. */
export const sentenceText = (s: Sentence): string => `${termText(s.a)} ${s.op} ${termText(s.b)} = ${termText(s.c)}`;

/** The sentence with every symbol replaced by its value: `8 + 7 = 15`. */
export function filledText(sentence: Sentence, values: Record<string, number>): string {
  const s = fill(sentence, values);
  return `${s.a} ${s.op} ${s.b} = ${s.c}`;
}

/** A true sentence with one place replaced by a symbol — the shape every question in this unit takes. */
export function withBlank(a: number, op: '+' | '−', b: number, c: number, place: 'a' | 'b' | 'c', sym = '□'): Sentence {
  if (!holds(a, op, b, c)) throw new RangeError(`the sentence ${a} ${op} ${b} = ${c} is not true`);
  return {
    a: place === 'a' ? { sym } : a,
    op,
    b: place === 'b' ? { sym } : b,
    c: place === 'c' ? { sym } : c,
  };
}

/**
 * A sentence with one *known* place hidden — used by "which number is missing at the end?" questions that give a story
 * rather than a blank. The same numbers, and the unknown in the place asked for.
 */
export const blankAt = (a: number, op: '+' | '−', b: number, c: number, place: 'a' | 'b' | 'c', sym = '□'): Sentence => withBlank(a, op, b, c, place, sym);

// ─────────────────────────── inverses and fact families ───────────────────────────

/** The two numbers that go with `a` and `b` in a family: `a + b = c` and the two subtractions from it. */
export interface FactFamily {
  whole: number;
  parts: [number, number];
}

export const familyOf = (a: number, b: number): FactFamily => ({ whole: a + b, parts: [a, b] });

/** Every sentence in the family: two additions and two subtractions, over the same three numbers. */
export function familySentences({ whole, parts }: FactFamily): string[] {
  const [a, b] = parts;
  return [`${a} + ${b} = ${whole}`, `${b} + ${a} = ${whole}`, `${whole} − ${a} = ${b}`, `${whole} − ${b} = ${a}`];
}

/**
 * The inverse sentence for one member of a family — the one that checks it. An addition is checked by a subtraction and
 * a subtraction by an addition; that is the whole "inverse relationship" of U11.3.
 */
export function inverseOf(a: number, op: '+' | '−', b: number, c: number): string {
  if (!holds(a, op, b, c)) throw new RangeError(`the sentence ${a} ${op} ${b} = ${c} is not true`);
  return op === '+' ? `${c} − ${a} = ${b}` : `${c} + ${b} = ${a}`;
}

/** The member of the family that uses the other operation — for "which sentence checks this one?". */
export const oppositeOp = (op: '+' | '−'): '+' | '−' => (op === '+' ? '−' : '+');

// ─────────────────────────── multi-step puzzles ───────────────────────────

/** One step of a puzzle: apply `op` with `n` to what the student has so far. */
export interface Step {
  op: '+' | '−' | '×';
  n: number;
}

/**
 * Run a list of steps from `start`, returning the value after each step. Step 1 acts on `start`, so the result has one
 * entry per step. Every intermediate value is kept: a puzzle can ask about any of them, not only the last.
 */
export function runSteps(start: number, steps: readonly Step[]): number[] {
  const out: number[] = [];
  let value = start;
  for (const s of steps) {
    if (s.op === '+') value += s.n;
    else if (s.op === '−') value -= s.n;
    else value *= s.n;
    out.push(value);
  }
  return out;
}

/** The value after all the steps. */
export const resultOf = (start: number, steps: readonly Step[]): number => {
  const all = runSteps(start, steps);
  return all.length === 0 ? start : all[all.length - 1];
};

/** A step the way it is written: `+ 4`, `− 7`, `× 2`. */
export const stepText = (step: Step): string => `${step.op} ${step.n}`;

/** The whole chain as it is read: `5 → + 4 → × 2`, with the results when they are known. */
export function chainText(start: number, steps: readonly Step[], showResults = true): string {
  const results = runSteps(start, steps);
  return `${start} ${steps.map((s, i) => (showResults ? `→ ${stepText(s)} → ${results[i]}` : `→ ${stepText(s)}`)).join(' ')}`;
}

/**
 * The number that has to go *into* a chain to come out at `end`. Steps are undone from the end, each with its inverse,
 * which is why order matters: `+ 4` then `× 2` is not `× 2` then `+ 4`.
 */
export function startFor(end: number, steps: readonly Step[]): number {
  let value = end;
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const s = steps[i];
    if (s.op === '+') value -= s.n;
    else if (s.op === '−') value += s.n;
    else {
      if (s.n === 0 || value % s.n !== 0) throw new RangeError(`${value} is not a multiple of ${s.n}`);
      value /= s.n;
    }
  }
  return value;
}

/** The value part-way through a chain, after `upTo` steps (0 for the start). */
export function midway(start: number, steps: readonly Step[], upTo: number): number {
  if (upTo <= 0) return start;
  const all = runSteps(start, steps);
  return all[Math.min(upTo, all.length) - 1];
}

/** A chain of equal steps: `start`, then `start + step`, and so on. `null` marks the missing places. */
export function stepChain(start: number, step: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + step * i);
}

/**
 * The missing places in a chain of equal steps, worked out from a known pair. Every gap between two known values must
 * divide evenly by the number of places it spans, otherwise the chain is not a chain of equal steps and this throws.
 */
export function missingInChain(values: readonly (number | null)[]): number[] {
  const known = values.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v !== null);
  if (known.length < 2) throw new RangeError('a chain needs at least two known values');
  const [first, second] = [known[0], known[1]];
  const step = (second.v - first.v) / (second.i - first.i);
  if (!Number.isInteger(step)) throw new RangeError(`the known values do not make a whole step: ${first.v} → ${second.v}`);
  if (known.some(({ v, i }) => v !== first.v + step * (i - first.i))) throw new RangeError('known values do not follow one step');
  return values.map((v, i) => (v === null ? first.v + step * (i - first.i) : v));
}

/** Which places a chain leaves empty, given the indices to hide. */
export const hideAt = (values: readonly number[], holes: readonly number[]): Array<number | null> => values.map((v, i) => (holes.includes(i) ? null : v));

// ─────────────────────────── checking student work ───────────────────────────

/**
 * Whether a set of values makes every sentence true. A symbol that appears in two sentences must hold the same value —
 * that is what makes a symbol puzzle harder than a blank, and this is where it is enforced.
 */
export const allTrue = (sentences: readonly Sentence[], values: Record<string, number>): boolean => sentences.every((s) => isTrue(s, values));

/** The symbols used across a set of sentences — a symbol puzzle's unknowns. */
export function symbolsAcross(sentences: readonly Sentence[]): string[] {
  const out: string[] = [];
  for (const s of sentences) for (const sym of symbolsOf(s)) if (!out.includes(sym)) out.push(sym);
  return out;
}

/**
 * Solve a set of sentences that share symbols: each round finds every sentence that is down to one unknown, and repeats.
 * Throws when the system is under-determined, because a puzzle with two possible answers is not a puzzle for Grade 2.
 */
export function solvePuzzle(sentences: readonly Sentence[]): { values: Record<string, number>; order: string[] } {
  const values: Record<string, number> = {};
  const order: string[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const sentence of sentences) {
      const resolved: Sentence = {
        a: isNum(sentence.a) || values[sentence.a.sym] === undefined ? sentence.a : values[sentence.a.sym],
        op: sentence.op,
        b: isNum(sentence.b) || values[sentence.b.sym] === undefined ? sentence.b : values[sentence.b.sym],
        c: isNum(sentence.c) || values[sentence.c.sym] === undefined ? sentence.c : values[sentence.c.sym],
      };
      const left = symbolsOf(resolved);
      if (left.length !== 1 || values[left[0]] !== undefined) continue;
      const v = valueAt(resolved, (['a', 'b', 'c'] as const).find((p) => symOf(resolved[p]) === left[0])!);
      values[left[0]] = v;
      order.push(left[0]);
      progress = true;
    }
  }
  const missing = symbolsAcross(sentences).filter((s) => values[s] === undefined);
  if (missing.length > 0) throw new RangeError(`cannot pin down ${missing.join(', ')}`);
  if (!allTrue(sentences, values)) throw new RangeError('contradictory puzzle sentences');
  return { values, order };
}

/** A symbol puzzle written out with its values filled in, one sentence per line. */
export const puzzleText = (sentences: readonly Sentence[], values: Record<string, number>): string[] =>
  sentences.map((s) => filledText(s, values));

// ─────────────────────────── grade-2 bounds ───────────────────────────

/** The largest number this unit uses. Grade 2 works within a hundred. */
export const MAX = 100;

/** Whether both numbers in a sentence are inside the unit's range, and so are the results. */
export function inRange(a: number, b: number, op: '+' | '−'): boolean {
  const c = op === '+' ? a + b : a - b;
  return [a, b, c].every((n) => Number.isInteger(n) && n >= 0 && n <= MAX);
}
