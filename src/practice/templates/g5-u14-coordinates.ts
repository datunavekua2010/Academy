import type { QuestionTemplate } from './types';
import { bank, fourOptions } from './g5-helpers';

/**
 * Grade V — Unit 14: საკოორდინატო სიბრტყე (the coordinate plane).
 *
 * Converted from the academy's `U14` bank (5 subtopics × 6 questions). The
 * plane is drawn in text — a real 8 × 8 grid with labelled axes — so a picture
 * can never disagree with the answer it illustrates: `grid()` takes the same
 * coordinates the answer is computed from and puts a ★ at exactly that cell.
 * Every template here is finite in the sense the registry cares about (a small
 * board), so the pools list the boards explicitly rather than sweeping ranges.
 */

export const G5_U14_SUBTOPICS = ['u14-01', 'u14-02', 'u14-03', 'u14-04', 'u14-05'] as const;

export type G5U14SubtopicId = (typeof G5_U14_SUBTOPICS)[number];

const TOPIC = 'g5-coordinate-plane';

const SIZE = 6;

/** A point as the bank spells it: `(3;4)`. */
const point = (x: number, y: number): string => `(${x};${y})`;

/**
 * An 8 × 8 first-quadrant grid, drawn in text.
 *
 * Rows run top-down (y = SIZE … 1), the x labels sit under the bottom rule and
 * the y labels down the left edge, so `grid(3, 4)` puts a ★ in the cell whose
 * column is 3 and whose row is 4 — the same cell a reader counts to from the
 * origin. `marks` adds extra labelled points, which is how the "which point is
 * where" questions draw their lettered candidates.
 */
const grid = (marks: Array<{ label: string; x: number; y: number }>): string => {
  const labelAt = new Map<string, string>();
  for (const mark of marks) labelAt.set(`${mark.x},${mark.y}`, mark.label);
  const lines: string[] = [];
  lines.push(`y`);
  for (let y = SIZE; y >= 1; y -= 1) {
    const cells: string[] = [];
    for (let x = 1; x <= SIZE; x += 1) {
      const label = labelAt.get(`${x},${y}`);
      cells.push(label ? ` ${label} ` : ' · ');
    }
    lines.push(`${y} ${cells.join('│')}`);
    lines.push('  ' + Array.from({ length: SIZE }, () => '───').join('┼'));
  }
  lines.push(`   ${Array.from({ length: SIZE }, (_, i) => ` ${i + 1} `).join(' ')} x`);
  return lines.join('\n');
};

/**
 * Four distinct numeric options.
 *
 * A distractor list built from the drawn values can collide — "x + y" equals
 * "answer + 1" for a whole family of points — and a set short of three wrong
 * options makes the generator reject the draw. Filling any shortfall from
 * `right ± d` keeps every draw usable without inventing a wrong answer that
 * happens to be right.
 */
const numericOptions = (right: number, extras: number[]): string[] => {
  const out: string[] = [String(right)];
  const add = (n: number) => {
    if (out.length < 4 && n >= 0 && !out.includes(String(n))) out.push(String(n));
  };
  for (const extra of extras) add(extra);
  for (let d = 1; d <= 12 && out.length < 4; d += 1) {
    add(right + d);
    add(right - d);
  }
  return out;
};

/** Length of a segment that lies on one grid line, from its four coordinates. */
const span = (v: Record<string, unknown>): number =>
  Number(v.x1) === Number(v.x2) ? Number(v.y2) - Number(v.y1) : Number(v.x2) - Number(v.x1);

export const G5_U14_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U14.1 — საკოორდინატო ბადე ─────────────
  bank({
    id: 'g5-u14-q01',
    subtopicId: 'u14-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{p} წერტილი ბადეზე რამდენი უჯრითაა საწყისიდან მარჯვნივ და რამდენი უჯრით ზემოთ?',
    variables: {
      spec: { kind: 'choice', values: ['2|3', '3|1', '5|2', '1|6', '4|4', '6|2', '2|5', '5|4', '3|3', '6|5', '4|1', '1|2', '5|6', '3|5'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: '●', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => `${v.x}, ${v.y}`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.x}, ${v.y}`, [
      `${v.y}, ${v.x}`,
      `${Number(v.x) + 1}, ${v.y}`,
      `${v.x}, ${Number(v.y) + 1}`,
    ]),
    explain: ({ answer }) => `პირველი კოორდინატი მარჯვნივ ნაბიჯია, მეორე — ზემოთ: ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q02',
    subtopicId: 'u14-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p} წერტილიდან ორი უჯრით მარჯვნივ და ერთი უჯრით ზემოთ გადაადგილდი. რომელი კოორდინატი გამოვა?',
    variables: {
      spec: { kind: 'choice', values: ['1|1', '2|2', '3|1', '2|4', '1|3', '4|2', '3|5', '2|1', '3|2', '1|4', '4|4', '2|3'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([
      { label: '●', x: Number(v.x), y: Number(v.y) },
      { label: '★', x: Number(v.x) + 2, y: Number(v.y) + 1 },
    ]),
    answer: (v) => point(Number(v.x) + 2, Number(v.y) + 1),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) + 2, Number(v.y) + 1), [
      point(Number(v.x) + 1, Number(v.y) + 2),
      point(Number(v.x) + 2, Number(v.y)),
      point(Number(v.x) + 1, Number(v.y) + 1),
    ]),
    explain: ({ vars, answer }) =>
      `მარჯვნივ 2 უჯრა ზრდის პირველ კოორდინატს, ზემოთ 1 — მეორეს: (${Number(vars.x) + 2};${Number(vars.y) + 1}) = ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q03',
    subtopicId: 'u14-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p} წერტილიდან სამი უჯრით მარცხნივ და ორი უჯრით ქვემოთ გადაადგილდი. რომელი კოორდინატი გამოვა?',
    variables: {
      spec: { kind: 'choice', values: ['4|3', '5|4', '6|3', '4|5', '5|6', '6|6', '4|4', '6|4', '5|5', '4|6', '6|5', '5|3'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: '●', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => point(Number(v.x) - 3, Number(v.y) - 2),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) - 3, Number(v.y) - 2), [
      point(Number(v.x) - 2, Number(v.y) - 3),
      point(Number(v.x) - 3, Number(v.y) - 1),
      point(Number(v.x) - 1, Number(v.y) - 2),
    ]),
    explain: ({ vars, answer }) =>
      `მარცხნივ 3 უჯრა აკლებს პირველ კოორდინატს, ქვემოთ 2 — მეორეს: (${Number(vars.x) - 3};${Number(vars.y) - 2}) = ${answer}.`,
  }),

  // ───────────── U14.2 — ღერძები და კვადრატები ─────────────
  bank({
    id: 'g5-u14-q04',
    subtopicId: 'u14-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{p} წერტილი რომელ ღერძზეა?',
    variables: {
      spec: { kind: 'choice', values: ['6|0|Ox', '0|4|Oy', '3|0|Ox', '0|6|Oy', '1|0|Ox', '0|1|Oy', '5|0|Ox', '0|2|Oy', '4|0|Ox', '0|5|Oy', '2|0|Ox', '0|3|Oy'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      axis: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    answer: (v) => String(v.axis),
    format: { kind: 'text' },
    options: () => ['Ox', 'Oy', 'არც ერთი', 'საწყისი'],
    explain: ({ vars, answer }) =>
      Number(vars.y) === 0
        ? `მეორე კოორდინატი 0-ია, ამიტომ წერტილი ${answer} ღერძზე ზის.`
        : `პირველი კოორდინატი 0-ია, ამიტომ წერტილი ${answer} ღერძზე ზის.`,
  }),
  bank({
    id: 'g5-u14-q05',
    subtopicId: 'u14-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელ ღერძზე მდებარეობს წერტილი {p}?',
    variables: {
      spec: { kind: 'choice', values: ['0|5|Oy', '4|0|Ox', '0|2|Oy', '6|0|Ox', '0|1|Oy', '2|0|Ox', '0|6|Oy', '5|0|Ox', '0|3|Oy', '1|0|Ox', '0|4|Oy', '3|0|Ox'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      axis: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: '●', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => String(v.axis),
    format: { kind: 'text' },
    options: () => ['Oy', 'Ox', 'არც ერთი', 'ორივე'],
    explain: ({ vars, answer }) =>
      `${vars.p}: ${Number(vars.x) === 0 ? 'პირველი კოორდინატი 0-ია' : 'მეორე კოორდინატი 0-ია'}, ამიტომ წერტილი ${answer} ღერძზეა.`,
  }),
  bank({
    id: 'g5-u14-q06',
    subtopicId: 'u14-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p} წერტილში პირველი კოორდინატი მეორეზე რამდენით მეტია?',
    variables: {
      spec: { kind: 'choice', values: ['5|2', '4|1', '6|3', '5|4', '6|1', '3|1', '6|2', '4|3', '5|1', '6|4', '4|2', '3|2'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: '●', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => Number(v.x) - Number(v.y),
    format: { kind: 'integer', min: 1 },
    options: (v) =>
      numericOptions(Number(v.x) - Number(v.y), [Number(v.x) + Number(v.y), Number(v.x), Number(v.y)]),
    explain: ({ vars, answer }) => `${vars.x} − ${vars.y} = ${answer}.`,
  }),

  // ───────────── U14.3 — წერტილის კოორდინატები ─────────────
  bank({
    id: 'g5-u14-q07',
    subtopicId: 'u14-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'A წერტილის აბსცისაა {x}, ორდინატა — {y}. ჩაწერე მისი კოორდინატები.',
    variables: {
      spec: { kind: 'choice', values: ['3|2', '1|5', '6|4', '2|6', '4|1', '5|3', '3|6', '2|4', '1|3', '6|1', '4|6', '5|2'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    visual: (v) => grid([{ label: 'A', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => point(Number(v.x), Number(v.y)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x), Number(v.y)), [
      point(Number(v.y), Number(v.x)),
      point(Number(v.y), Number(v.y)),
      point(Number(v.x), Number(v.x)),
    ]),
    explain: ({ answer }) => `აბსცისა პირველია, ორდინატა მეორე: A = ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q08',
    subtopicId: 'u14-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'B წერტილის კოორდინატებია {p}. რას უდრის მისი ორდინატა?',
    variables: {
      spec: { kind: 'choice', values: ['4|6', '2|5', '6|2', '1|4', '5|1', '3|5', '2|3', '6|4', '4|2', '5|6', '1|2', '3|4'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: 'B', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => Number(v.y),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.y), [Number(v.x), Number(v.x) + Number(v.y), Number(v.x) - Number(v.y)]),
    explain: ({ vars, answer }) => `${vars.p}: ორდინატა მეორე კოორდინატია, ესე იგი ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q09',
    subtopicId: 'u14-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'C წერტილის კოორდინატებია {p}. რას უდრის მისი აბსცისა?',
    variables: {
      spec: { kind: 'choice', values: ['3|5', '5|2', '1|6', '6|3', '2|4', '4|2', '5|5', '3|1', '1|4', '6|6', '2|2', '4|5'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: 'C', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.x), [Number(v.y), Number(v.x) + Number(v.y), Number(v.y) - Number(v.x)]),
    explain: ({ vars, answer }) => `${vars.p}: აბსცისა პირველი კოორდინატია, ესე იგი ${answer}.`,
  }),

  // ───────────── U14.4 — სიბრტყე და სახაზავი ─────────────
  bank({
    id: 'g5-u14-q10',
    subtopicId: 'u14-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p1} და {p2} წერტილები ერთ ჰორიზონტალურ ხაზზეა. რამდენი ერთეულია მათ შორის?',
    variables: {
      spec: { kind: 'choice', values: ['1|1|5|1', '2|2|6|2', '1|3|4|3', '3|1|6|1', '2|4|5|4', '1|2|6|2', '3|3|6|3', '2|5|5|5',
          '1|4|6|4', '2|6|5|6', '4|2|6|2', '1|5|3|5', '2|1|4|1', '3|4|5|4'] },
      x1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      x2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      y2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      p1: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
      p2: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[2]), Number(String(v.spec).split('|')[3]))] },
    },
    visual: (v) => grid([
      { label: 'A', x: Number(v.x1), y: Number(v.y1) },
      { label: 'B', x: Number(v.x2), y: Number(v.y2) },
    ]),
    answer: (v) => Number(v.x2) - Number(v.x1),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.x2) - Number(v.x1), [Number(v.x2) + Number(v.x1), Number(v.x1), Number(v.x2)]),
    explain: ({ vars, answer }) => `ორივეს ორდინატა ერთია, ამიტომ მანძილი = ${vars.x2} − ${vars.x1} = ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q11',
    subtopicId: 'u14-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p1} და {p2} წერტილები ერთ ვერტიკალურ ხაზზეა. რამდენი ერთეულია მათ შორის?',
    variables: {
      spec: { kind: 'choice', values: ['2|1|2|5', '3|2|3|6', '1|2|1|5', '4|1|4|4', '5|2|5|6', '6|3|6|5', '2|2|2|6', '4|3|4|6',
          '1|1|1|6', '3|1|3|4', '5|1|5|4', '6|2|6|6', '2|3|2|5', '4|2|4|6'] },
      x1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      x2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      y2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      p1: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
      p2: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[2]), Number(String(v.spec).split('|')[3]))] },
    },
    visual: (v) => grid([
      { label: 'A', x: Number(v.x1), y: Number(v.y1) },
      { label: 'B', x: Number(v.x2), y: Number(v.y2) },
    ]),
    answer: (v) => Number(v.y2) - Number(v.y1),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.y2) - Number(v.y1), [Number(v.y2) + Number(v.y1), Number(v.y1), Number(v.y2)]),
    explain: ({ vars, answer }) => `ორივეს აბსცისა ერთია, ამიტომ მანძილი = ${vars.y2} − ${vars.y1} = ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q12',
    subtopicId: 'u14-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'KL მონაკვეთის ბოლოების კოორდინატებია {p1} და {p2}. იპოვე მისი სიგრძე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['1|2|6|2', '2|1|2|6', '3|3|6|3', '4|1|4|5', '1|4|5|4', '2|2|2|5',
          '3|5|6|5', '5|1|5|6', '1|1|4|1', '4|4|4|6', '2|3|5|3', '6|2|6|5',
          '1|6|6|6', '3|1|3|5', '2|4|2|6', '5|2|5|5', '4|1|6|1', '1|3|5|3'],
      },
      x1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      x2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      y2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      p1: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
      p2: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[2]), Number(String(v.spec).split('|')[3]))] },
    },
    visual: (v) => grid([
      { label: 'K', x: Number(v.x1), y: Number(v.y1) },
      { label: 'L', x: Number(v.x2), y: Number(v.y2) },
    ]),
    answer: (v) => span(v),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(span(v), [Number(v.x1) + Number(v.y1), Number(v.x2) + Number(v.y2)]),
    explain: ({ vars, answer }) =>
      `${vars.p1} და ${vars.p2} ${Number(vars.x1) === Number(vars.x2) ? 'ერთ ვერტიკალზეა — ორდინატების სხვაობა' : 'ერთ ჰორიზონტალზეა — აბსცისების სხვაობა'} = ${answer}.`,
  }),

  // ───────────── U14.5 — გადაადგილება სიბრტყეზე ─────────────
  bank({
    id: 'g5-u14-q13',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით მარჯვნივ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: { kind: 'choice', values: ['1|3|4', '2|2|3', '1|5|2', '3|1|2', '2|4|3', '1|2|4', '2|1|2', '4|2|1', '1|4|1', '3|3|2', '5|1|1', '1|1|5', '2|3|2', '3|2|3'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([
      { label: 'A', x: Number(v.x), y: Number(v.y) },
      { label: '★', x: Number(v.x) + Number(v.n), y: Number(v.y) },
    ]),
    answer: (v) => point(Number(v.x) + Number(v.n), Number(v.y)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) + Number(v.n), Number(v.y)), [
      point(Number(v.x), Number(v.y) + Number(v.n)),
      point(Number(v.x) + Number(v.n), Number(v.y) + Number(v.n)),
      point(Number(v.x) - Number(v.n), Number(v.y)),
    ]),
    explain: ({ answer }) => `მარჯვნივ გადაადგილება ზრდის მხოლოდ პირველ კოორდინატს: ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q14',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით ზემოთ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: { kind: 'choice', values: ['2|1|3', '3|2|4', '1|1|5', '4|2|3', '2|1|4', '5|1|3', '3|1|2', '1|2|3', '4|1|2', '2|2|2', '1|3|2', '3|3|3', '2|4|1', '1|4|2'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([
      { label: 'B', x: Number(v.x), y: Number(v.y) },
      { label: '★', x: Number(v.x), y: Number(v.y) + Number(v.n) },
    ]),
    answer: (v) => point(Number(v.x), Number(v.y) + Number(v.n)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x), Number(v.y) + Number(v.n)), [
      point(Number(v.x) + Number(v.n), Number(v.y)),
      point(Number(v.x), Number(v.y) - Number(v.n)),
      point(Number(v.x) + Number(v.n), Number(v.y) + Number(v.n)),
    ]),
    explain: ({ answer }) => `ზემოთ გადაადგილება ზრდის მხოლოდ მეორე კოორდინატს: ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q15',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით მარცხნივ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: { kind: 'choice', values: ['5|3|2', '6|2|3', '4|5|1', '5|1|4', '6|4|2', '4|3|3', '6|1|5', '5|5|2', '6|6|4', '4|2|2', '5|2|5', '6|5|2', '4|4|3', '6|3|6'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: 'C', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => point(Number(v.x) - Number(v.n), Number(v.y)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) - Number(v.n), Number(v.y)), [
      point(Number(v.x), Number(v.y) - Number(v.n)),
      point(Number(v.x) + Number(v.n), Number(v.y)),
      point(Number(v.x) - Number(v.n), Number(v.y) - Number(v.n)),
    ]),
    explain: ({ answer }) => `მარცხნივ გადაადგილება ამცირებს მხოლოდ პირველ კოორდინატს: ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q16',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით ქვემოთ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: { kind: 'choice', values: ['3|6|2', '2|5|3', '4|6|1', '1|5|4', '5|6|2', '6|4|3', '2|6|5', '3|5|2', '4|4|2', '1|6|3', '5|5|1', '6|6|5', '2|4|4', '4|5|3'] },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: 'D', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => point(Number(v.x), Number(v.y) - Number(v.n)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x), Number(v.y) - Number(v.n)), [
      point(Number(v.x) - Number(v.n), Number(v.y)),
      point(Number(v.x), Number(v.y) + Number(v.n)),
      point(Number(v.x) - Number(v.n), Number(v.y) - Number(v.n)),
    ]),
    explain: ({ answer }) => `ქვემოთ გადაადგილება ამცირებს მხოლოდ მეორე კოორდინატს: ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q17',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით მარჯვნივ და {k} ერთეულით ზემოთ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['1|1|2|3', '1|2|3|2', '2|1|2|4', '1|3|4|2', '2|2|3|3', '1|1|4|4',
          '3|1|2|3', '2|1|3|2', '1|2|2|2', '2|3|3|2', '1|1|3|1', '3|3|2|2', '2|2|1|3', '1|4|2|1',
          '3|2|1|4', '2|1|4|1', '1|3|3|2', '3|4|2|1'],
      },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([
      { label: 'E', x: Number(v.x), y: Number(v.y) },
      { label: '★', x: Number(v.x) + Number(v.n), y: Number(v.y) + Number(v.k) },
    ]),
    answer: (v) => point(Number(v.x) + Number(v.n), Number(v.y) + Number(v.k)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) + Number(v.n), Number(v.y) + Number(v.k)), [
      point(Number(v.x) + Number(v.k), Number(v.y) + Number(v.n)),
      point(Number(v.x) - Number(v.n), Number(v.y) + Number(v.k)),
      point(Number(v.x) + Number(v.n), Number(v.y) - Number(v.k)),
    ]),
    explain: ({ vars, answer }) =>
      `მარჯვნივ ${vars.n} (პირველი +${vars.n}), ზემოთ ${vars.k} (მეორე +${vars.k}): ${answer}.`,
  }),
  bank({
    id: 'g5-u14-q18',
    subtopicId: 'u14-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{p} წერტილი გადაადგილდა {n} ერთეულით მარცხნივ და {k} ერთეულით ქვემოთ. იპოვე მისი ახალი კოორდინატები.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['6|6|2|3', '5|6|3|2', '6|5|2|4', '6|6|4|2', '5|5|3|3', '6|4|4|3',
          '6|6|3|1', '5|6|4|2', '6|5|1|3', '4|6|2|2', '6|3|5|1', '5|4|2|3', '6|2|1|5', '5|3|2|1',
          '6|6|1|2', '4|5|3|1', '6|4|2|2', '5|5|1|4'],
      },
      x: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      y: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      p: { kind: 'choice', values: (v) => [point(Number(String(v.spec).split('|')[0]), Number(String(v.spec).split('|')[1]))] },
    },
    visual: (v) => grid([{ label: 'F', x: Number(v.x), y: Number(v.y) }]),
    answer: (v) => point(Number(v.x) - Number(v.n), Number(v.y) - Number(v.k)),
    format: { kind: 'text' },
    options: (v) => fourOptions(point(Number(v.x) - Number(v.n), Number(v.y) - Number(v.k)), [
      point(Number(v.x) - Number(v.k), Number(v.y) - Number(v.n)),
      point(Number(v.x) + Number(v.n), Number(v.y) - Number(v.k)),
      point(Number(v.x) - Number(v.n), Number(v.y) + Number(v.k)),
    ]),
    explain: ({ vars, answer }) =>
      `მარცხნივ ${vars.n} (პირველი −${vars.n}), ქვემოთ ${vars.k} (მეორე −${vars.k}): ${answer}.`,
  }),
];
