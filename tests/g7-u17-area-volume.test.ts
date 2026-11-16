import { describe, expect, it } from 'vitest';
import { G7_U17_SUBTOPICS, G7_U17_TEMPLATES } from '../src/practice/templates/g7-u17-area-volume';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 17: perimeter, area and volume. Every key is recomputed from the numbers printed in the task. */

const id = (n: number) => `g7-u17-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U17',
  topic: 'g7-area-volume',
  subtopics: G7_U17_SUBTOPICS,
  templates: G7_U17_TEMPLATES,
  idPattern: /^g7-u17-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const first = (d: Draw): number => nums(d.answer)[0]!;
/** The multiple of π in a "N π სმ" answer (a bare π is 1). */
const piCoef = (d: Draw): number => { const m = /^([\d ]*)π/.exec(d.answer)!; return m[1]!.trim() === '' ? 1 : Number(m[1]!.replace(/ /g, '')); };
const NGON = ['', '', '', 'სამკუთხა', 'ოთხკუთხა', 'ხუთკუთხა', 'ექვსკუთხა', 'შვიდკუთხა', 'რვაკუთხა'];
const nOf = (text: string): number => NGON.findIndex((w) => w !== '' && text.includes(w));
const solidOf = (text: string): 'cube' | 'box' | 'prism' | 'pyramid' => (text.includes('პრიზმ') ? 'prism' : text.includes('პირამიდ') ? 'pyramid' : text.includes('პარალელეპიპედ') ? 'box' : 'cube');
const COUNTS = {
  cube: { faces: () => 6, edges: () => 12, vertices: () => 8 },
  box: { faces: () => 6, edges: () => 12, vertices: () => 8 },
  prism: { faces: (n: number) => n + 2, edges: (n: number) => 3 * n, vertices: (n: number) => 2 * n },
  pyramid: { faces: (n: number) => n + 1, edges: (n: number) => 2 * n, vertices: (n: number) => n + 1 },
};

describe('G7 U17 — perimeter and area', () => {
  it('u17-01', () => {
    each(1, (d) => { const [l, w] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (l! + w!)); });
    each(2, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    each(3, (d) => { const [S, l] = nums(d.prompt); expect(first(d), d.prompt).toBe(S! / l!); expect(S! % l!).toBe(0); });
    each(4, (d) => { const P = nums(d.prompt)[0]!; expect(P % 4).toBe(0); expect(first(d), d.prompt).toBe((P / 4) ** 2); });
    each(5, (d) => { const [l, w] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`S = ${l! * w!} სმ², P = ${2 * (l! + w!)} სმ`); });
    each(6, (d) => { const [P, w] = nums(d.prompt); expect(first(d), d.prompt).toBe(P! / 2 - w!); expect(first(d)).toBeGreaterThan(w!); });
  });

  it('u17-02', () => {
    each(7, (d) => { const [b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe((b! * h!) / 2); expect((b! * h!) % 2).toBe(0); });
    each(8, (d) => { const [b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(b! * h!); });
    each(9, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(((a! + b!) * h!) / 2); });
    each(10, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! * b!) / 2); });
    each(11, (d) => expect(piCoef(d), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    each(12, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! * b!) / 2); });
  });

  it('u17-03', () => {
    each(13, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! ** 2 - b! ** 2); expect(a).toBeGreaterThan(b!); });
    each(14, (d) => { const [l, w, s] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! - s! ** 2); });
    each(15, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! ** 2 - b! ** 2); });
    each(16, (d) => { const [l, w, p, q] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! - p! * q!); expect(p).toBeLessThan(l!); expect(q).toBeLessThan(w!); });
    each(17, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! ** 2 - b! ** 2); expect(a).toBeGreaterThan(b!); });
    each(18, (d) => { const [l, w, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! - (b! * h!) / 2); expect((b! * h!) % 2).toBe(0); });
  });

  it('u17-04', () => {
    each(19, (d) => { const [a, b, c] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! + b! + c!); });
    each(20, (d) => { const [a, b, c, e] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! * b! + c! * e!); });
    each(21, (d) => { const [l, w, , h] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! + (l! * h!) / 2); });
    each(22, (d) => { const [l, w, p, q] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! - p! * q!); });
    each(23, (d) => { const [a, b, c] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! + b! + c!); });
    each(24, (d) => { const [s, l, w] = nums(d.prompt); expect(first(d), d.prompt).toBe(s! ** 2 + l! * w!); });
  });

  it('u17-05', () => {
    each(25, (d) => { const [s, w] = nums(d.prompt); expect(first(d) * w!, d.prompt).toBe(s! ** 2); });
    each(26, (d) => { const [a, b] = nums(d.prompt); expect(first(d) ** 2, d.prompt).toBe(a! * b!); });
    each(27, (d) => { const [b, h, c] = nums(d.prompt); expect(first(d) * c!, d.prompt).toBe((b! * h!) / 2); });
    each(28, (d) => { const [S, l] = nums(d.prompt); expect(first(d) * l!, d.prompt).toBe(S!); expect(Math.sqrt(S!) % 1).toBe(0); });
    each(29, (d) => { const [b, h, c] = nums(d.prompt); expect((first(d) * c!) / 2, d.prompt).toBe(b! * h!); });
    each(30, (d) => { const [a, b, h, w] = nums(d.prompt); expect(first(d) * w!, d.prompt).toBe(((a! + b!) * h!) / 2); });
  });
});

describe('G7 U17 — solids and volume', () => {
  it('u17-06', () => {
    for (const [n, key] of [[31, 'faces'], [32, 'edges'], [33, 'vertices']] as const) {
      each(n, (d) => {
        const kind = solidOf(d.prompt);
        expect(first(d), d.prompt).toBe(COUNTS[kind][key](nOf(d.prompt)));
      });
    }
    each(34, (d) => { const kind = solidOf(d.prompt); expect(first(d), d.prompt).toBe(COUNTS[kind].faces(nOf(d.prompt))); });
    each(35, (d) => expect(first(d), d.prompt).toBe(nOf(d.prompt)));
    each(36, (d) => { const n = nums(d.prompt)[0]!; expect(NGON[n]).toBeDefined(); expect(first(d), d.prompt).toBe(n + 1); expect(nOf(d.prompt), d.prompt).toBe(n); });
  });

  it('u17-07', () => {
    each(37, (d) => { const [l, w, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! * h!); });
    each(38, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! ** 3));
    each(39, (d) => { const [l, w, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (l! * w! + w! * h! + l! * h!)); });
    each(40, (d) => expect(first(d), d.prompt).toBe(6 * nums(d.prompt)[0]! ** 2));
    each(41, (d) => { const [V, l, w] = nums(d.prompt); expect(first(d) * l! * w!, d.prompt).toBe(V!); });
    each(42, (d) => { const [l, w, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (l! * w! + w! * h! + l! * h!)); });
  });

  it('u17-08', () => {
    for (const n of [43, 44]) each(n, (d) => { const [B, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(B! * h!); });
    each(45, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! * b! * h!); });
    each(46, (d) => { const [V, B] = nums(d.prompt); expect(first(d) * B!, d.prompt).toBe(V!); });
    each(47, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (a! * b! + a! * h! + b! * h!)); });
    each(48, (d) => { const [b, k, h] = nums(d.prompt); expect((first(d) * 2), d.prompt).toBe(b! * k! * h!); });
  });

  it('u17-09', () => {
    for (const n of [49, 50]) each(n, (d) => { const [r, h] = nums(d.prompt); expect(piCoef(d), d.prompt).toBe(r! ** 2 * h!); });
    for (const n of [51, 52]) each(n, (d) => { const [r, h] = nums(d.prompt); expect(piCoef(d) * 3, d.prompt).toBe(r! ** 2 * h!); });
    for (const n of [53, 54]) each(n, (d) => { const [B, h] = nums(d.prompt); expect(first(d) * 3, d.prompt).toBe(B! * h!); });
  });

  it('u17-10', () => {
    each(55, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! ** 3));
    each(56, (d) => { const [l, w, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(l! * w! * h!); });
    each(57, (d) => { const [r, h] = nums(d.prompt); expect(piCoef(d), d.prompt).toBe(r! ** 2 * h!); });
    each(58, (d) => { const [B, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(B! * h!); });
    each(59, (d) => { const [B, h] = nums(d.prompt); expect(first(d) * 3, d.prompt).toBe(B! * h!); });
    each(60, (d) => { const [N, r] = nums(d.prompt); expect(first(d) * r! ** 2, d.prompt).toBe(N!); });
  });

  it('has the expected number of templates', () => {
    expect(G7_U17_TEMPLATES.length).toBe(60);
  });
});
