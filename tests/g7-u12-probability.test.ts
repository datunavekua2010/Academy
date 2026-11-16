import { describe, expect, it } from 'vitest';
import { G7_U12_SUBTOPICS, G7_U12_TEMPLATES } from '../src/practice/templates/g7-u12-probability';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 12: probability and counting. Data are read back from the printed task; every key is recomputed. */

const id = (n: number) => `g7-u12-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U12',
  topic: 'g7-probability',
  subtopics: G7_U12_SUBTOPICS,
  templates: G7_U12_TEMPLATES,
  idPattern: /^g7-u12-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const red = (n: number, d: number): string => (d / gcd(n, d) === 1 ? String(n / gcd(n, d)) : `${n / gcd(n, d)}/${d / gcd(n, d)}`);
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const comb = (n: number, k: number): number => fact(n) / (fact(k) * fact(n - k));
const arr = (n: number, k: number): number => fact(n) / fact(n - k);
const isPrime = (n: number): boolean => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
const ans = (d: Draw): number => nums(d.answer)[0]!;
/** The value of a probability text `a/b` or `a`. */
const val = (text: string): number => (text.includes('/') ? Number(text.split('/')[0]) / Number(text.split('/')[1]) : Number(text));
const DIE = [1, 2, 3, 4, 5, 6];
/** The die event named in a prompt (by its Georgian phrase). */
const dieCount = (prompt: string): number => {
  const tests: Array<[RegExp, (x: number) => boolean]> = [
    [/ლუწი რიცხვის/, (x) => x % 2 === 0],
    [/კენტი რიცხვის/, (x) => x % 2 === 1],
    [/3-ის ჯერადი რიცხვის/, (x) => x % 3 === 0],
    [/4-ზე მეტი რიცხვის/, (x) => x > 4],
    [/3-ზე ნაკლები რიცხვის/, (x) => x < 3],
    [/მარტივი რიცხვის/, isPrime],
  ];
  const hit = tests.find(([re]) => re.test(prompt));
  if (hit) return DIE.filter(hit[1]).length;
  return 1; // a single face
};

describe('G7 U12 — frequency and probability', () => {
  it('u12-01', () => {
    each(1, (d) => { const [n, k] = nums(d.prompt); expect(d.answer, d.prompt).toBe(red(k!, n!)); });
    each(2, (d) => { const [n, , k] = nums(d.prompt); expect(ans(d), d.prompt).toBe((100 * k!) / n!); expect(d.answer.endsWith('%')).toBe(true); });
    each(3, (d) => { const [r, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(red(r!, r! + b!)); });
    each(4, (d) => {
      const [a, b, c] = nums(d.prompt);
      const tot = a! + b! + c!;
      const col = /იპოვე (\S+) ბარათის/.exec(d.prompt)![1]!;
      const k = { მწვანე: a!, ყვითელი: b!, წითელი: c! }[col as 'მწვანე']!;
      expect(d.answer, d.prompt).toBe(red(k, tot));
    });
    each(5, (d) => {
      const [N, a, b, c] = nums(d.prompt);
      expect(a! + b! + c!).toBe(N);
      const col = /იპოვე (\S+) სექტორზე/.exec(d.prompt)![1]!;
      const k = { ლურჯ: a!, წითელ: b!, მწვანე: c! }[col as 'ლურჯ']!;
      expect(d.answer, d.prompt).toBe(red(k, N!));
    });
    each(6, (d) => {
      const [p, q, N] = nums(d.prompt);
      expect(ans(d), d.prompt).toBe((N! * p!) / q!);
      expect(Number.isInteger(ans(d))).toBe(true);
    });
  });

  it('u12-02', () => {
    each(7, (d) => expect(d.answer, d.prompt).toBe(red(dieCount(d.prompt), 6)));
    each(8, (d) => { const [w, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(red(b!, w! + b!)); });
    each(9, (d) => { const [, N, k] = nums(d.prompt); expect(d.answer, d.prompt).toBe(red(N! - k!, N!)); });
    each(10, (d) => {
      const k = nums(d.prompt.split('იპოვე ')[1]!)[0]!;
      const more = d.prompt.includes('მეტი რიცხვის');
      expect(d.answer, d.prompt).toBe(red(more ? 6 - k : k - 1, 6));
    });
    each(11, (d) => {
      const [a, b, c] = nums(d.prompt);
      const left = d.prompt.match(/არც (\S+) იყოს და არც (\S+)\./)!;
      const names = ['წითელი', 'ლურჯი', 'მწვანე'];
      const keep = [a!, b!, c!][names.findIndex((x) => x !== left[1] && x !== left[2])]!;
      expect(d.answer, d.prompt).toBe(red(keep, a! + b! + c!));
    });
    each(12, (d) => { const [, N] = nums(d.prompt); expect(d.answer, d.prompt).toBe(red(Array.from({ length: N! }, (_, i) => i + 1).filter(isPrime).length, N!)); });
  });

  it('u12-03 — independent events', () => {
    each(13, (d) => expect(d.answer).toBe('1/4'));
    each(14, (d) => { const n = d.prompt.includes('სამჯერ') ? 3 : 2; expect(d.answer, d.prompt).toBe(`1/${6 ** n}`); });
    each(15, (d) => { const [r, b] = nums(d.prompt); expect(val(d.answer), d.prompt).toBeCloseTo((r! / (r! + b!)) ** 2, 10); });
    each(16, (d) => expect(val(d.answer), d.prompt).toBeCloseTo(dieCount(d.prompt.replace('გერბისა', '')) / 12, 10));
    each(17, (d) => expect(val(d.answer), d.prompt).toBeCloseTo((dieCount(d.prompt) / 6) ** 2, 10));
    each(18, (d) => { const [g, y] = nums(d.prompt); expect(val(d.answer), d.prompt).toBeCloseTo((g! * y!) / (g! + y!) ** 2, 10); });
  });

  it('u12-04 — sums', () => {
    each(19, (d) => {
      const faces = new Set(nums(d.prompt.split('იპოვე ')[1]!));
      expect(d.answer, d.prompt).toBe(red(faces.size, 6));
    });
    each(20, (d) => {
      const [, N, a, b] = nums(d.prompt);
      const fav = Array.from({ length: N! }, (_, i) => i + 1).filter((x) => x % a! === 0 || x % b! === 0).length;
      expect(d.answer, d.prompt).toBe(red(fav, N!));
    });
    each(21, (d) => {
      const [r, b, c] = nums(d.prompt);
      const names = ['წითელი', 'ლურჯი', 'მწვანე'];
      const asked = d.prompt.match(/იპოვე (\S+) ან (\S+) ბურთის/)!;
      const fav = [r!, b!, c!].filter((_, i) => names[i] === asked[1] || names[i] === asked[2]).reduce((x, y) => x + y, 0);
      expect(d.answer, d.prompt).toBe(red(fav, r! + b! + c!));
    });
    each(22, (d) => { const [a, b] = nums(d.prompt.split('იპოვე ')[1]!); expect(d.answer, d.prompt).toBe(red(DIE.filter((x) => x < a! || x > b!).length, 6)); });
    each(23, (d) => {
      const [, N, k] = nums(d.prompt);
      const even = d.prompt.includes('იპოვე ლუწი');
      const fav = Array.from({ length: N! }, (_, i) => i + 1).filter((x) => (even ? x % 2 === 0 : x % 2 === 1) || x === k).length;
      expect(d.answer, d.prompt).toBe(red(fav, N!));
    });
    each(24, (d) => {
      const [a, b, both, T] = nums(d.prompt);
      expect(d.answer, d.prompt).toBe(red(a! + b! - both!, T!));
    });
  });

  it('u12-05 — products', () => {
    each(25, (d) => expect(d.answer).toBe('1/4'));
    for (const n of [26, 28]) each(n, (d) => expect(d.answer, d.prompt).toBe('1/36'));
    each(27, (d) => {
      const [r, b] = nums(d.prompt);
      expect(val(d.answer), d.prompt).toBeCloseTo((b! / (r! + b!)) ** 2, 10);
    });
    each(29, (d) => {
      const words = ['', '', '', 'სამჯერ', 'ოთხჯერ', 'ხუთჯერ', 'ექვსჯერ'];
      const n = words.findIndex((w) => w && d.prompt.includes(w));
      expect(d.answer, d.prompt).toBe(`1/${2 ** n}`);
    });
    each(30, (d) => { const [w, b] = nums(d.prompt); expect(val(d.answer), d.prompt).toBeCloseTo((w! * b!) / (w! + b!) ** 2, 10); });
  });
});

describe('G7 U12 — counting', () => {
  const WORDS: Record<string, number> = { სამი: 3, ოთხი: 4, ხუთი: 5, ექვსი: 6, შვიდი: 7, რვა: 8 };
  it('permutations (u12-06)', () => {
    for (const n of [31, 32, 33]) each(n, (d) => expect(ans(d), d.prompt).toBe(fact(nums(d.prompt)[0]!)));
    each(34, (d) => {
      const letters = d.prompt.split('ასოები ')[1]!.replace('?', '').split(/, | და /);
      expect(ans(d), d.prompt).toBe(fact(letters.length));
    });
    for (const n of [35, 36]) {
      each(n, (d) => expect(ans(d), d.prompt).toBe(fact(WORDS[d.prompt.split(' ')[0]!]!)));
    }
  });
  it('combinations (u12-07)', () => {
    for (const n of [37, 38, 39, 41]) each(n, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(comb(N!, k!)); });
    each(40, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(comb(N!, k!)); });
    each(42, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(comb(N!, k!)); });
  });
  it('arrangements (u12-08)', () => {
    each(43, (d) => expect(ans(d), d.prompt).toBe(arr(nums(d.prompt)[0]!, 2)));
    each(44, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(arr(N!, k!)); });
    each(45, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(arr(N!, k!)); });
    each(46, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(arr(N!, k!)); });
    each(47, (d) => expect(ans(d), d.prompt).toBe(arr(nums(d.prompt)[0]!, 2)));
    each(48, (d) => { const [N, k] = nums(d.prompt); expect(ans(d), d.prompt).toBe(arr(N!, k!)); });
  });
});
