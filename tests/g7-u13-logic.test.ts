import { describe, expect, it } from 'vitest';
import { G7_U13_SUBTOPICS, G7_U13_TEMPLATES } from '../src/practice/templates/g7-u13-logic';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 13: logic. Truth values and numeric analogies are recomputed from the printed task. */

const id = (n: number) => `g7-u13-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U13',
  topic: 'g7-logic',
  subtopics: G7_U13_SUBTOPICS,
  templates: G7_U13_TEMPLATES,
  idPattern: /^g7-u13-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);
const TRUE = 'ჭეშმარიტია';
const FALSE = 'მცდარია';
const tf = (b: boolean): string => (b ? TRUE : FALSE);
const isPrime = (n: number): boolean => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
/** Truth of a number property named in Georgian. */
const prop = (n: number, text: string): boolean => {
  if (text.includes('ლუწი')) return n % 2 === 0;
  if (text.includes('კენტი')) return n % 2 === 1;
  if (text.includes('მარტივი')) return isPrime(n);
  if (text.includes('შედგენილი')) return n > 1 && !isPrime(n);
  const m = /იყოფა (\d+)-ზე/.exec(text);
  if (m) return n % Number(m[1]) === 0;
  throw new Error(`unknown property: ${text}`);
};
/** `P: „…“ და Q: „…“` → the two statements' truth values. */
const statements = (prompt: string): [boolean, boolean] => {
  const [p, q] = [...prompt.matchAll(/„([^“]+)“/g)].map((m) => m[1]!);
  const n = Number(/^\d+/.exec(p!)![0]);
  return [prop(n, p!), prop(n, q!)];
};

describe('G7 U13 — true and false statements', () => {
  it('u13-01', () => {
    each(1, (d) => { const [k, dd] = nums(d.prompt); expect(d.answer, d.prompt).toBe(tf(k! % dd! === 0)); });
    each(4, (d) => { const [n] = nums(d.prompt); expect(d.answer, d.prompt).toBe(tf(prop(n!, d.prompt))); });
    each(5, (d) => { const [a, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(tf(a! % b! === 0)); });
    each(6, (d) => {
      const sides: Record<string, number> = { 'სამკუთხედის': 3, 'ოთხკუთხედის': 4, 'ხუთკუთხედის': 5, 'ექვსკუთხედის': 6 };
      const name = Object.keys(sides).find((k) => d.prompt.includes(k))!;
      const [s] = nums(d.prompt);
      expect(d.answer, d.prompt).toBe(tf(180 * (sides[name]! - 2) === s));
    });
  });
});

describe('G7 U13 — negation, converse', () => {
  it('u13-02: the negation of an "all" statement is an exception, of "exists" a "none"', () => {
    each(7, (d) => expect(d.answer, d.prompt).toMatch(/^არსებობს .*, რომელსაც არ უყვარს/));
    each(8, (d) => expect(d.answer, d.prompt).toMatch(/^არც ერთი .* რიცხვი არ არის /));
    each(10, (d) => expect(d.answer, d.prompt).toMatch(/^არსებობს .*, რომელიც .* არ არის$/));
    each(11, (d) => { const [k] = nums(d.prompt); expect(d.answer, d.prompt).toMatch(new RegExp(`^არც ერთი .* არ იყოფა ${k}-ზე უნაშთოდ$`)); });
    each(12, (d) => expect(d.answer, d.prompt).toMatch(/^არსებობს .*, რომელიც /));
    each(9, (d) => {
      const [a, b] = nums(d.prompt);
      const greater = d.prompt.includes('მეტია');
      expect(d.answer, d.prompt).toBe(`რიცხვი ${a} ${greater ? 'ნაკლებია ან ტოლია' : 'მეტია ან ტოლია'} ${b}-ზე`);
    });
  });

  it('u13-03: the converse swaps hypothesis and conclusion', () => {
    each(13, (d) => { const [a] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`თუ რიცხვი ლუწია, მაშინ ის ${a}-ზე იყოფა`); });
    each(16, (d) => { const [a, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`თუ რიცხვი ${b}-ის ჯერადია, მაშინ ის ${a}-ის ჯერადია`); expect(a! % b!).toBe(0); });
    each(18, (d) => { const [a, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`თუ რიცხვი ${b}-ზე იყოფა, მაშინ ის ${a}-ზე იყოფა`); expect(a! % b!).toBe(0); });
    for (const n of [14, 15, 17]) each(n, (d) => { expect(d.answer, d.prompt).toMatch(/^თუ .*, მაშინ ის /); expect(d.answer).not.toBe(d.prompt); });
    for (const n of [13, 14, 15, 16, 17, 18]) each(n, (d) => {
      const stated = /„თუ (.*), მაშინ (?:ის |მისი |მას )?(.*)“/.exec(d.prompt)!;
      expect(stated, d.prompt).not.toBeNull();
      expect(d.answer.length).toBeGreaterThan(10);
    });
  });
});

describe('G7 U13 — operations on statements', () => {
  it('u13-04', () => {
    each(19, (d) => { const [p, q] = statements(d.prompt); expect(d.answer, d.prompt).toBe(tf(p && q)); });
    each(20, (d) => { const [p, q] = statements(d.prompt); expect(d.answer, d.prompt).toBe(tf(p || q)); });
    each(21, (d) => {
      const [p] = [...d.prompt.matchAll(/„([^“]+)“/g)].map((m) => m[1]!);
      expect(d.answer, d.prompt).toBe(tf(!prop(Number(/^\d+/.exec(p!)![0]), p!)));
    });
    each(22, (d) => { const [n, a, , b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(tf(n! > a! && n! < b!)); });
    each(23, (d) => { const [p, q] = statements(d.prompt); expect(d.answer, d.prompt).toBe(tf(p || q)); });
    each(24, (d) => { const [p, q] = statements(d.prompt); expect(d.answer, d.prompt).toBe(tf(!p || q)); });
  });
});

describe('G7 U13 — deductions and analogies', () => {
  it('u13-05', () => {
    each(26, (d) => { const [a, b, n] = nums(d.prompt); expect(n! % a!).toBe(0); expect(d.answer, d.prompt).toBe(`რიცხვი ${n} იყოფა ${b}-ზე`); expect(a! % b!).toBe(0); });
    each(28, (d) => {
      const [a, b, n] = nums(d.prompt);
      const premiseIsDivisible = !d.prompt.includes(`${n} არ იყოფა`);
      const concludesB = new RegExp(`${n} იყოფა ${b}-ზე\\? უპასუხე`).test(d.prompt);
      const concludesA = new RegExp(`${n} იყოფა ${a}-ზე\\? უპასუხე`).test(d.prompt);
      const notB = new RegExp(`${n} არ იყოფა ${b}-ზე\\? უპასუხე`).test(d.prompt);
      // valid only for modus ponens: n divisible by a, conclusion: n divisible by b
      const valid = premiseIsDivisible && n! % a! === 0 && concludesB;
      expect(d.answer, d.prompt).toBe(valid ? 'კი' : 'არა');
      if (concludesA) expect(n! % a!, d.prompt).not.toBe(0);
      if (notB) expect(n! % b!, d.prompt).not.toBe(0);
    });
    each(30, (d) => expect(d.answer, d.prompt).toBe(/მისი [^.]* აუცილებლად გაუმჯობესდება\. /.test(d.prompt) ? 'კი' : 'არა'));
    for (const n of [25, 27, 29]) each(n, (d) => expect(d.answer.length).toBeGreaterThan(5));
  });

  it('u13-06', () => {
    each(32, (d) => {
      const [a, b, c] = nums(d.prompt);
      const times = d.prompt.includes('ჯერ მეტია');
      const f = nums(d.prompt.split('თუ')[1]!)[0]!;
      expect(times ? a! * f : a! + f, d.prompt).toBe(b);
      expect(Number(d.answer), d.prompt).toBe(times ? c! * f : c! + f);
    });
    each(33, (d) => {
      const sides: Record<string, number> = { 'სამკუთხედი': 3, 'ოთხკუთხედი': 4, 'ხუთკუთხედი': 5, 'ექვსკუთხედი': 6, 'რვაკუთხედი': 8, 'ათკუთხედი': 10 };
      const ords = Object.keys(sides).filter((k) => d.prompt.includes(k));
      const [first, second] = ords.sort((x, y) => d.prompt.indexOf(x) - d.prompt.indexOf(y));
      expect(nums(d.prompt)[0], d.prompt).toBe(sides[first!]);
      expect(Number(d.answer), d.prompt).toBe(sides[second!]);
    });
    each(35, (d) => {
      const [a, b, c] = nums(d.prompt);
      const cube = d.prompt.includes('კუბია');
      const p = cube ? 3 : 2;
      expect(a! ** p, d.prompt).toBe(b);
      expect(Number(d.answer), d.prompt).toBe(c! ** p);
    });
    for (const n of [31, 34, 36]) each(n, (d) => {
      const first = d.prompt.split(' : ')[0]!.split(': ')[1];
      expect(d.answer).not.toBe(first);
    });
  });
});
