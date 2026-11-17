/**
 * Pictures that a question's own numbers already determine.
 *
 * A great many questions are *about* a picture without drawing one: „43 + ___ = 69“
 * is a part–whole model, „ათეული და ერთეული“ is a block model, „დაამრგვალე 74
 * უახლოეს 10-მდე“ is a point between two marks on a number line. The numbers in the
 * sentence are the whole data of that picture, so it can be drawn from the
 * sentence itself and can never disagree with it.
 *
 * The rule that keeps this safe: a picture is lifted only from an *exact* phrase
 * and only when every number in the prompt is used by it. A prompt with any
 * number the pattern does not account for is left alone. Nothing is ever drawn
 * that reveals the answer — the unknown stays „?“.
 */
import type { Picture } from './types';
import { CHAR_ICONS, stripVs } from './iconMap';

const MINUS = '[−\\-–]';
const BLANK = '(?:_{2,}|❓|□|\\?)';

const clean = (prompt: string): string => stripVs(prompt).replace(/\\n/g, ' ').replace(/\s+/g, ' ');
const ints = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);
const same = (found: number[], expected: number[]): boolean =>
  found.length === expected.length && [...found].sort((a, b) => a - b).join() === [...expected].sort((a, b) => a - b).join();

const blocks = (n: number, label: string): Picture => ({ kind: 'blocks', tens: Math.floor(n / 10), ones: n % 10, label });

function operands(text: string): Picture[] {
  const found = [...text.matchAll(new RegExp(`(?<![\\d.])(\\d{1,2})\\s*([+]|${MINUS})\\s*(\\d{1,2})(?![\\d:])`, 'g'))];
  if (found.length !== 1) return [];
  const [, a, sign, b] = found[0]!;
  const A = Number(a);
  const B = Number(b);
  const all = ints(text);
  const ok = same(all, [A, B]) || (all.length === 3 && new RegExp(`${a}\\s*[+−\\-–]\\s*${b}\\s*=\\s*\\d+`).test(text));
  if (!ok || A < 1 || B < 1 || Math.max(A, B) < 10) return [];
  return [blocks(A, String(A)), blocks(B, `${sign === '+' ? '+' : '−'} ${B}`)];
}

function comparison(text: string): Picture[] {
  const found = text.match(new RegExp(`(?<![\\d])(\\d{1,2})\\s*${BLANK}\\s*(\\d{1,2})(?![\\d])`));
  if (!found) return [];
  const A = Number(found[1]);
  const B = Number(found[2]);
  if (!same(ints(text), [A, B]) || Math.max(A, B) < 10) return [];
  return [blocks(A, String(A)), blocks(B, String(B))];
}

function missingPart(text: string): Picture[] {
  const rules: Array<[RegExp, (a: number, c: number) => Picture]> = [
    [new RegExp(`(\\d+)\\s*\\+\\s*${BLANK}\\s*=\\s*(\\d+)`), (a, c) => ({ kind: 'model', whole: String(c), parts: [String(a), '?'] })],
    [new RegExp(`${BLANK}\\s*\\+\\s*(\\d+)\\s*=\\s*(\\d+)`), (a, c) => ({ kind: 'model', whole: String(c), parts: ['?', String(a)] })],
    [new RegExp(`(\\d+)\\s*${MINUS}\\s*${BLANK}\\s*=\\s*(\\d+)`), (a, c) => ({ kind: 'model', whole: String(a), parts: [String(c), '?'] })],
    [new RegExp(`${BLANK}\\s*${MINUS}\\s*(\\d+)\\s*=\\s*(\\d+)`), (a, c) => ({ kind: 'model', whole: '?', parts: [String(a), String(c)] })],
  ];
  for (const [pattern, make] of rules) {
    const m = text.match(pattern);
    if (!m) continue;
    const a = Number(m[1]);
    const c = Number(m[2]);
    if (!same(ints(text), [a, c])) return [];
    return [make(a, c)];
  }
  return [];
}

function lineBetween(n: number, lo: number, hi: number): Picture {
  const gap = hi - lo;
  const step = gap <= 10 ? 1 : gap <= 20 ? 2 : 5;
  return { kind: 'line', from: lo, to: hi, step, marks: [{ value: n, label: String(n) }] };
}

function rounding(text: string): Picture[] {
  let m = text.match(/დაამრგვალე\s+(\d{1,3})\s+უახლოეს\s+(5|10|20)(?![\d])/);
  if (m) {
    const n = Number(m[1]);
    const base = Number(m[2]);
    const lo = Math.floor(n / base) * base;
    if (n % base !== 0 && same(ints(text), [n, base])) return [lineBetween(n, lo, lo + base)];
    return [];
  }
  m = text.match(/რომელ\s+რიცხვთან\w*\s+(\d{1,3})\s+უფრო\s+ახლოს:\s*(\d{1,3})-თან\s+თუ\s+(\d{1,3})-თან/);
  if (m) {
    const [n, a, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (same(ints(text), [n, a, b]) && n > lo && n < hi && hi - lo <= 40) return [lineBetween(n, lo, hi)];
    return [];
  }
  m = text.match(/უახლოეს\s+ორ\s+ათეულს\s+შორის\w*\s+მოთავსებული\s+რიცხვი\s+(\d{1,3})/);
  if (m) {
    const n = Number(m[1]);
    const lo = Math.floor(n / 10) * 10;
    if (n % 10 !== 0 && same(ints(text), [n])) return [lineBetween(n, lo, lo + 10)];
  }
  return [];
}

const placeholderToken = /^(?:_{2,}[.,?]?|❓[.,?]?)$/;

function sequence(text: string): Picture[] {
  // „🔵 🟢 🔵 🟢 🔵 __“
  const words = text.split(' ');
  let best: string[] = [];
  let run: string[] = [];
  let end = -1;
  words.forEach((word, i) => {
    const icon = CHAR_ICONS[word.replace(/[.,:;]$/, '')];
    if (icon) {
      run.push(icon.key);
      if (run.length > best.length) {
        best = [...run];
        end = i;
      }
    } else run = [];
  });
  if (best.length >= 3 && placeholderToken.test(words[end + 1] ?? '')) {
    return [
      {
        kind: 'rows',
        rows: [{ tokens: [...best.map((icon) => ({ t: 'icon' as const, icon })), { t: 'unknown' as const }] }],
      },
    ];
  }
  // „20, 30, 40, 50, __“
  const m = text.match(/((?:\d+\s*,\s*){3,}\d+)\s*,\s*(?:_{2,}|❓)/);
  if (m) {
    const items = m[1]!.split(/\s*,\s*/).map((t) => ({ text: t }));
    return [{ kind: 'chips', items: [...items, { text: '?' }], arrows: true }];
  }
  return [];
}

function dataBars(text: string): Picture[] {
  const found = [...text.matchAll(/(?<![A-Za-zა-ჰ\d])([A-ZА-Я])\s*—\s*(\d+)(?!\d)/g)];
  if (found.length < 3) return [];
  const labels = new Set(found.map((m) => m[1]));
  if (labels.size !== found.length) return [];
  return [{ kind: 'bars', items: found.map((m) => ({ label: m[1]!, size: Number(m[2]), caption: m[2]! })) }];
}

function twoQuantities(text: string): Picture[] {
  const m = text.match(/(\d+)\s*[ა-ჰ]+[^.\d]*,\s*მეორე[ა-ჰ]*\s*—\s*(\d+)/);
  if (!m) return [];
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (!same(ints(text), [a, b])) return [];
  return [
    {
      kind: 'bars',
      items: [
        { label: 'პირველი', size: a, caption: String(a) },
        { label: 'მეორე', size: b, caption: String(b) },
      ],
    },
  ];
}

function rectangle(text: string): Picture[] {
  if (!/პერიმეტრ|ფართობ/.test(text)) return [];
  const m = text.match(/სიგრძე[ა-ჰ]*\s*(?:არის\s*)?(\d+)\s*სმ[^.\d]*სიგანე[ა-ჰ]*\s*(?:—|-|არის)?\s*(\d+)\s*სმ/);
  if (m) {
    const [w, h] = [Number(m[1]), Number(m[2])];
    if (same(ints(text), [w, h])) return [{ kind: 'rect', width: `${w} სმ`, height: `${h} სმ`, wv: w, hv: h }];
    return [];
  }
  const sq = text.match(/კვადრატის\s+გვერდ[ა-ჰ]*\s*(?:არის\s*)?(\d+)\s*სმ/);
  if (sq && same(ints(text), [Number(sq[1])])) {
    const s = Number(sq[1]);
    return [{ kind: 'rect', width: `${s} სმ`, height: `${s} სმ`, wv: s, hv: s }];
  }
  return [];
}

const SHAPE_WORDS: Array<[RegExp, string]> = [
  [/(?<![ა-ჰ])სამკუთხედ/, 'shape-triangle'],
  [/(?<![ა-ჰ])კვადრატ/, 'shape-square'],
  [/(?<![ა-ჰ])მართკუთხედ/, 'shape-rectangle'],
  [/(?<![ა-ჰ])ხუთკუთხედ/, 'shape-pentagon'],
  [/(?<![ა-ჰ])ექვსკუთხედ/, 'shape-hexagon'],
];

function shapeAsked(text: string): Picture[] {
  if (!/გვერდ|წვერო|კუთხე(?!დ)/.test(text)) return [];
  const polygonWords = text.match(/[ა-ჰ]*კუთხედ/g) ?? [];
  const named = SHAPE_WORDS.filter(([pattern]) => pattern.test(text));
  if (named.length !== 1 || new Set(polygonWords.map((w) => w.slice(0, 5))).size > 1) return [];
  return [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: named[0]![1] }] }] }];
}

function clocks(text: string): Picture[] {
  const found = [...text.matchAll(/(?<![\d:])(\d{1,2}):(\d{2})(?![\d:])/g)];
  if (found.length < 1 || found.length > 2) return [];
  const pictures: Picture[] = [];
  for (const m of found) {
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 1 || h > 12 || min > 59) return [];
    pictures.push({ kind: 'clock', minutes: (h % 12) * 60 + min });
  }
  return pictures;
}

/** Every picture that the numbers of `prompt` already determine (at most a few). */
export function liftPictures(prompt: string): Picture[] {
  const text = clean(prompt);
  const attempts = [rounding, missingPart, operands, comparison, sequence, dataBars, twoQuantities, rectangle, shapeAsked, clocks];
  for (const attempt of attempts) {
    const found = attempt(text);
    if (found.length) return found;
  }
  return [];
}
