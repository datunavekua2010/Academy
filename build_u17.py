#!/usr/bin/env python3
"""Generator script for Grade 4 Unit 17: ლოგიკური მსჯელობა (Logical reasoning)."""
import json
import re

header = """import { defineTemplate, type QuestionTemplate } from './types';

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 5, -5, 10, -10];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = 1;
  while (result.size < count) {
    const val = answer + fallback * step;
    if (val >= min && val !== answer) {
      result.add(val);
    }
    fallback++;
  }
  return Array.from(result).slice(0, count);
}

export const G4_U17_SUBTOPICS = [
  'u17-thought-numbers',
  'u17-minimum-quantity',
  'u17-two-numbers-sum-difference',
  'u17-two-numbers-product-quotient',
  'u17-shape-puzzles',
  'u17-age-problems',
  'u17-time-quantity-problems',
  'u17-finding-differences',
  'u17-segment-problems',
  'u17-scale',
  'u17-graphs',
  'u17-number-ordering',
  'u17-condition-matching',
  'u17-elimination',
  'u17-digit-finding',
] as const;

export type G4U17SubtopicId = (typeof G4_U17_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U17SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-logika' as const,
  unitId: 'g4-logika' as const,
  ...options,
});

export const G4_U17_TEMPLATES: QuestionTemplate[] = [
"""

footer = """];\n"""

templates = []


def check_vars(tid, prompt, vars_ts):
    declared = set(re.findall(r"^\s{6}(\w+):", vars_ts, re.MULTILINE))
    used = set(re.findall(r"\{(\w+)\}", prompt))
    missing = used - declared
    if missing:
        raise SystemExit(f'{tid}: prompt uses {sorted(missing)} but declares {sorted(declared)}')


def emit(tid, sub, diff, prompt, specs, vars_ts, ans_ts, opt_key, opt_ts, expl_ts, oc=None):
    check_vars(tid, prompt, vars_ts)
    distinct = len(set(specs))
    if distinct < 12:
        print(f'THIN {tid}: {distinct} distinct rows of {len(specs)}')
    specs_json = json.dumps(specs, ensure_ascii=False)
    oc_str = f"    optionCount: {oc},\n" if oc is not None else ''
    templates.append(f"""  // {tid} (Level {diff})
  defineTemplate({{
    ...addr({{ id: '{tid}', subtopicId: '{sub}', difficulty: {diff} }}),
{oc_str}    prompt: '{prompt}',
    variables: {{
      spec: {{
        kind: 'choice',
        values: {specs_json},
      }},
{vars_ts}
    }},
    answer: {ans_ts},
    {opt_key}: {opt_ts},
    explanation: {expl_ts},
  }}),
""")


def vs(name, idx):
    return f"      {name}: {{ kind: 'choice', values: (v) => [String(v.spec).split('|')[{idx}]] }},"


def vn(name, idx):
    return f"      {name}: {{ kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[{idx}])] }},"


def num(tid, sub, diff, prompt, rows, vars_ts, ans_idx, expl, step=1, minimum=1):
    specs = ['|'.join(str(x) for x in row) for row in rows]
    emit(tid, sub, diff, prompt, specs, vars_ts,
         f"(v) => Number(String(v.spec).split('|')[{ans_idx}])",
         'distractors', f"(ctx) => nearMisses(Number(ctx.answer), 3, {minimum}, {step})",
         expl)


def qa(tid, sub, diff, rows, expl_ts, oc=None):
    widths = {len(row) for row in rows}
    if len(widths) != 1:
        raise SystemExit(f'{tid}: rows have inconsistent lengths {sorted(widths)}')
    width = widths.pop()
    if width < 3:
        raise SystemExit(f'{tid}: a question needs at least one wrong answer')
    for row in rows:
        if len(set(row)) != width:
            raise SystemExit(f'{tid}: a row repeats an option: {row}')
    specs = ['|'.join(row) for row in rows]
    names = ['q', 'ans'] + [f'w{i}' for i in range(1, width - 1)]
    vars_ts = '\n'.join(vs(name, i) for i, name in enumerate(names))
    opt_list = '[' + ', '.join(f'String(v.{name})' for name in names[1:]) + ']'
    emit(tid, sub, diff, '{q}', specs, vars_ts, '(v) => String(v.ans)', 'options',
         f'(v) => {opt_list}', expl_ts, oc=oc if oc is not None else width - 1)


def stmt(tid, sub, diff, rows, why_list):
    specs = []
    for i, (a, b, c, d, k) in enumerate(rows):
        specs.append(f'{a}|{b}|{c}|{d}|{k}|{why_list[i % len(why_list)]}')
    vars_ts = '\n'.join([vs('s1', 0), vs('s2', 1), vs('s3', 2), vs('s4', 3), vs('why', 5)])
    emit(tid, sub, diff, 'რომელი მტკიცებაა ჭეშმარიტი {why}?', specs, vars_ts,
         "(v) => { const p = String(v.spec).split('|'); return p[Number(p[4])]; }",
         'options', "(v) => String(v.spec).split('|').slice(0, 4)",
         "({ answer }) => `${answer} — ეს მტკიცებაა სწორი.`")

def qa_calc(tid, sub, diff, entries, expl_ts, step=1):
    """A choice question whose answer is computed — one row per scenario."""
    rows = []
    for question, answer in entries:
        want = str(answer)
        wrong = []
        delta = step
        while len(wrong) < 3:
            for candidate in (answer + delta, answer - delta):
                text = str(candidate)
                if candidate >= 1 and text != want and text not in wrong:
                    wrong.append(text)
                if len(wrong) == 3:
                    break
            delta += step
        rows.append([question, want] + wrong[:3])
    qa(tid, sub, diff, rows, expl_ts)


def elim_bank(tid, sub, diff, noun, domains, ask_index, expl_ts):
    """Three children, three different items, two clues — one answer survives.

    `ask_index` is 2 for the third child (the one no clue is given about) and 3
    for the first child (excluded by the first clue, so the second clue's child
    takes its item).
    """
    rows = []
    for a, b, c, i1, i2, i3 in domains:
        answer = [i1, i2, i3][ask_index - 1]
        rows.append([
            f'{a}, {b} და {c} აირჩიეს სხვადასხვა {noun}: {i1}, {i2}, {i3}. '
            f'{a} არ ირჩევს „{i1}“-ს, {b} კი ირჩევს „{i2}“-ს. რას ირჩევს {a}?',
            answer, i1, i2, 'ვერ დავადგენთ',
        ])
    qa(tid, sub, diff, rows, "({ answer }) => `" + expl_ts + "`")



def ordering(tid, sub, diff, pool, length, direction, instructions, why):
    """A drag-into-order question.

    The students see the numbers scrambled and tap them smallest-first (or
    largest-first); the answer is the sequence of *display positions*. Two
    phrasings are offered so the wording is not always identical, but both ask
    the same thing — a variation changes the numbers, never the task.
    """
    pool_json = json.dumps(pool)
    dir_ts = "'asc'" if direction == 'asc' else "'desc'"
    cmp_ts = 'a - b' if direction == 'asc' else 'b - a'
    sep = ' < ' if direction == 'asc' else ' > '
    instructions_json = json.dumps(list(instructions), ensure_ascii=False)
    templates.append(f"""  // {tid} (Level {diff})
  defineTemplate({{
    ...addr({{ id: '{tid}', subtopicId: '{sub}', difficulty: {diff} }}),
    prompt: '{{instruction}}',
    variables: {{
      instruction: {{
        kind: 'choice',
        values: {instructions_json},
      }},
      items: {{
        kind: 'list',
        pick: {{ values: {pool_json}, length: {length}, unique: true }},
      }},
    }},
    shuffle: {{ source: 'items', direction: {dir_ts} }},
    format: {{ kind: 'text' }},
    answer: (_v, ctx) => {{
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => {cmp_ts});
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    }},
    explanation: ({{ vars }}) => {{
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => {cmp_ts});
      return `{why}: ${{sorted.join('{sep}')}}.`;
    }},
  }}),
""")



# ================= U17.1: u17-thought-numbers =================
# One step: n + a = t  ->  answer t - a
add_rows = [(a, t, t - a) for a, t in
            [(8, 23), (12, 27), (15, 40), (9, 36), (17, 50), (6, 19), (23, 45),
             (14, 38), (11, 42), (7, 25), (19, 55), (13, 44), (16, 60), (5, 31),
             (21, 63), (25, 70), (18, 47), (10, 52)]]
num('g4-u17-01', 'u17-thought-numbers', 1,
    'ჩაფიქრებულ რიცხვს დაუმატეს {a} და მიიღეს {t}. რა რიცხვი ჩაიფიქრეს?',
    add_rows, '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`")

sub_rows = [(a, t, t + a) for a, t in
            [(15, 27), (9, 34), (12, 45), (20, 38), (7, 53), (18, 26), (25, 40),
             (11, 49), (14, 31), (8, 62), (16, 44), (23, 37), (10, 58), (13, 29),
             (21, 55), (6, 47), (24, 36), (17, 68)]]
num('g4-u17-02', 'u17-thought-numbers', 1,
    'რიცხვს გამოაკლეს {a} და მიიღეს {t}. იპოვე საწყისი რიცხვი.',
    sub_rows, '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} + ${vars.a} = ${answer}.`")

mul_rows = [(k, t, t // k) for k, t in
            [(4, 36), (3, 27), (5, 45), (6, 42), (7, 56), (8, 64), (9, 63),
             (2, 38), (4, 48), (5, 60), (6, 72), (3, 39), (7, 84), (8, 96),
             (9, 81), (2, 46), (4, 52), (5, 65)]]
num('g4-u17-03', 'u17-thought-numbers', 2,
    'ჩაფიქრებული რიცხვი გაამრავლეს {k}-ზე და მიიღეს {t}. რა რიცხვი იყო ჩაფიქრებული?',
    mul_rows, '\n'.join([vn('k', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} ÷ ${vars.k} = ${answer}.`")

div_rows = [(k, q, q * k) for k, q in
            [(5, 9), (4, 12), (6, 8), (3, 14), (7, 9), (8, 6), (9, 7), (2, 25),
             (5, 15), (4, 18), (6, 11), (3, 21), (7, 12), (8, 9), (9, 8), (2, 32),
             (5, 20), (4, 24)]]
num('g4-u17-04', 'u17-thought-numbers', 2,
    'რიცხვი {k}-ზე გაყვეს და მიიღეს {q}. იპოვე საწყისი რიცხვი.',
    div_rows, '\n'.join([vn('k', 0), vn('q', 1)]), 2,
    "({ vars, answer }) => `${vars.q} × ${vars.k} = ${answer}.`")

# Two steps: (n + a) * 2 = t  ->  n = t/2 - a
two_add_mul = [(a, 2, t, t // 2 - a) for a, t in
               [(12, 40), (5, 30), (8, 36), (15, 60), (7, 26), (9, 42), (11, 54),
                (4, 28), (13, 46), (6, 32), (14, 58), (3, 24), (17, 66), (10, 44),
                (18, 70), (8, 50), (12, 62), (5, 36)]]
num('g4-u17-05', 'u17-thought-numbers', 3,
    'ჩაფიქრებულ რიცხვს დაუმატეს {a}, შემდეგ გაამრავლეს 2-ზე და მიიღეს {t}. რა რიცხვი ჩაიფიქრეს?',
    two_add_mul, '\n'.join([vn('a', 0), vn('t', 2)]), 3,
    "({ vars, answer }) => `${vars.t} ÷ 2 = ${Number(vars.t) / 2}; ${Number(vars.t) / 2} − ${vars.a} = ${answer}.`")

two_sub_mul = [(a, t, t // 3 + a) for a, t in
               [(7, 30), (5, 27), (9, 36), (4, 24), (8, 42), (6, 33), (12, 45),
                (3, 21), (10, 51), (11, 39), (5, 48), (7, 54), (9, 60), (4, 15),
                (13, 57), (8, 63), (6, 45), (15, 66)]]
num('g4-u17-06', 'u17-thought-numbers', 3,
    'რიცხვს გამოაკლეს {a}, შემდეგ მიღებული შედეგი გაამრავლეს 3-ზე და მიიღეს {t}. იპოვე საწყისი რიცხვი.',
    two_sub_mul, '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} ÷ 3 = ${Number(vars.t) / 3}; ${Number(vars.t) / 3} + ${vars.a} = ${answer}.`")

# ================= U17.2: u17-minimum-quantity =================
# Two colours, worst case draws both -> need 3 for a pair
qa_calc('g4-u17-07', 'u17-minimum-quantity', 1, [
    (f'ყუთში {n} ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?', n + 1)
    for n in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
], "({ answer }) => `უარეს შემთხვევაში პირველი წინდები სხვადასხვა ფერისაა; შემდეგი აუცილებლად გაიმეორებს ფერს — პასუხია ${answer}.`")

num('g4-u17-08', 'u17-minimum-quantity', 1,
    'ჩანთაში {r} წითელი და {b} ლურჯი ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად ამოიღო წითელი ბურთი?',
    [(r, b, b + 1) for r, b in
     [(4, 5), (3, 7), (6, 2), (5, 4), (8, 3), (2, 9), (7, 6), (9, 1),
      (10, 4), (12, 3), (6, 8), (4, 11), (5, 9), (3, 12), (7, 2), (8, 6),
      (9, 5), (11, 2)]],
    '\n'.join([vn('r', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `უარეს შემთხვევაში ყველა ${vars.b} ლურჯს ამოვიღებთ და შემდეგი აუცილებლად წითელია: ${vars.b} + 1 = ${answer}.`")

num('g4-u17-09', 'u17-minimum-quantity', 2,
    'ყუთში {g} მწვანე, {y} ყვითელი და {r} წითელი ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი ყვითელი ბურთი?',
    [(g, y, r, g + r + 1) for g, y, r in
     [(3, 4, 2), (2, 5, 3), (4, 3, 1), (5, 2, 4), (1, 6, 3), (6, 2, 2),
      (3, 3, 5), (4, 5, 6), (2, 7, 1), (5, 4, 3), (7, 2, 5), (3, 6, 4),
      (8, 3, 2), (2, 4, 9), (6, 5, 3), (4, 8, 2), (1, 9, 4), (5, 7, 6)]],
    '\n'.join([vn('g', 0), vn('y', 1), vn('r', 2)]), 3,
    "({ vars, answer }) => `უარეს შემთხვევაში ყვითელის გარდა ყველას ამოვიღებთ: ${vars.g} + ${vars.r} = ${Number(vars.g) + Number(vars.r)}, შემდეგი კი აუცილებლად ყვითელია. პასუხია ${answer}.`")

num('g4-u17-10', 'u17-minimum-quantity', 2,
    'უჯრაში {a} შავი და {b} თეთრი წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი შავი და ერთი თეთრი წინდა?',
    [(a, b, max(a, b) + 1) for a, b in
     [(5, 5), (4, 6), (7, 3), (8, 2), (6, 4), (9, 1), (5, 7), (3, 9),
      (10, 2), (4, 8), (7, 6), (11, 3), (5, 12), (6, 9), (8, 7), (12, 4),
      (9, 6), (10, 5)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `უარეს შემთხვევაში ჯერ მხოლოდ ერთი ფერის ყველა წინდას ამოვიღებთ (${Math.max(Number(vars.a), Number(vars.b))}) და შემდეგი მეორე ფერისაა: + 1 = ${answer}.`")

num('g4-u17-11', 'u17-minimum-quantity', 3,
    'ჩანთაში {r} წითელი, {b} ლურჯი და {g} მწვანე ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ორი ერთი ფერის ბურთი?',
    [(r, b, g, 4) for r, b, g in
     [(6, 3, 4), (4, 5, 2), (7, 2, 3), (5, 6, 1), (3, 4, 8), (8, 2, 5),
      (2, 7, 4), (6, 6, 6), (9, 1, 3), (4, 9, 2), (5, 3, 7), (7, 5, 4),
      (10, 2, 3), (3, 8, 5), (6, 4, 9), (2, 5, 11), (8, 7, 2), (4, 3, 12)]],
    '\n'.join([vn('r', 0), vn('b', 1), vn('g', 2)]), 3,
    "() => `სამი ფერია, ამიტომ უარეს შემთხვევაში პირველი სამი სხვადასხვა ფერისაა; მეოთხე აუცილებლად ერთ-ერთს გაიმეორებს — პასუხია 4.`",
    step=1, minimum=2)

num('g4-u17-12', 'u17-minimum-quantity', 3,
    'ყუთში {f} ფერის ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს სამი ერთი ფერის ბურთი?',
    [(f, 2 * f + 1) for f in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
    '\n'.join([vn('f', 0)]), 1,
    "({ vars, answer }) => `${vars.f} ფერია; უარეს შემთხვევაში თითოეული ფერიდან ორ-ორს ამოვიღებთ (${Number(vars.f) * 2}), შემდეგი კი მესამეს გვაძლევს: ${Number(vars.f) * 2} + 1 = ${answer}.`")

num('g4-u17-13', 'u17-two-numbers-sum-difference', 1,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. იპოვე დიდი რიცხვი.',
    [(s, d, (s + d) // 2, (s - d) // 2) for s, d in
     [(20, 4), (30, 10), (42, 8), (50, 20), (64, 12), (100, 40), (26, 6),
      (36, 14), (48, 16), (70, 30), (80, 20), (54, 18), (90, 10), (44, 22),
      (56, 4), (72, 24), (38, 12), (60, 26)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `დიდი რიცხვი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer}.`", step=2)

num('g4-u17-14', 'u17-two-numbers-sum-difference', 1,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. იპოვე პატარა რიცხვი.',
    [(s, d, (s + d) // 2, (s - d) // 2) for s, d in
     [(20, 4), (30, 10), (42, 8), (50, 20), (64, 12), (100, 40), (26, 6),
      (36, 14), (48, 16), (70, 30), (80, 20), (54, 18), (90, 10), (44, 22),
      (56, 4), (72, 24), (38, 12), (60, 26)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 3,
    "({ vars, answer }) => `პატარა რიცხვი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`", step=2)

num('g4-u17-15', 'u17-two-numbers-sum-difference', 2,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია ამ ორი რიცხვის ნამრავლი?',
    [(s, d, ((s + d) // 2) * ((s - d) // 2)) for s, d in
     [(20, 4), (30, 10), (42, 8), (50, 20), (26, 6), (36, 14), (48, 16),
      (16, 4), (24, 8), (34, 6), (40, 12), (28, 4), (22, 2), (18, 6),
      (46, 10), (32, 8), (52, 14), (38, 12)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `რიცხვებია ${(Number(vars.s) + Number(vars.d)) / 2} და ${(Number(vars.s) - Number(vars.d)) / 2}; ნამრავლი = ${answer}.`")

num('g4-u17-16', 'u17-two-numbers-sum-difference', 2,
    'ორი რიცხვის ჯამია {s}. დიდი რიცხვია {a}. იპოვე პატარა რიცხვი.',
    [(s, a, s - a) for s, a in
     [(50, 32), (40, 27), (60, 41), (72, 45), (100, 63), (36, 21), (48, 30),
      (56, 34), (64, 52), (80, 47), (90, 61), (28, 19), (44, 26), (70, 43),
      (96, 58), (54, 31), (38, 24), (86, 55)]],
    '\n'.join([vn('s', 0), vn('a', 1)]), 2,
    "({ vars, answer }) => `${vars.s} − ${vars.a} = ${answer}.`")

num('g4-u17-17', 'u17-two-numbers-sum-difference', 3,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენჯერ მეტია დიდი რიცხვი პატარაზე?',
    [(s, d, ((s + d) // 2) // ((s - d) // 2)) for s, d in
     [(24, 8), (30, 18), (36, 12), (48, 24), (45, 15), (54, 18), (42, 6),
      (56, 16), (44, 4), (66, 22), (60, 12), (27, 9), (40, 16), (50, 20),
      (72, 24), (33, 11), (28, 12), (80, 32)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `რიცხვებია ${(Number(vars.s) + Number(vars.d)) / 2} და ${(Number(vars.s) - Number(vars.d)) / 2}; ${(Number(vars.s) + Number(vars.d)) / 2} ÷ ${(Number(vars.s) - Number(vars.d)) / 2} = ${answer}-ჯერ.`",
    step=1, minimum=2)

num('g4-u17-18', 'u17-two-numbers-sum-difference', 3,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია ამ რიცხვების ჯამისა და სხვაობის ჯამი?',
    [(s, d, s + d) for s, d in
     [(20, 4), (30, 10), (42, 8), (50, 20), (64, 12), (26, 6), (36, 14),
      (48, 16), (70, 30), (16, 4), (24, 8), (34, 6), (40, 12), (28, 4),
      (22, 2), (18, 6), (46, 10), (32, 8)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.s} + ${vars.d} = ${answer}.`", step=2)

# ================= U17.4: u17-two-numbers-product-quotient =================
pq_rows = [(k, a, a * k) for k, a in
           [(3, 2), (4, 3), (5, 2), (2, 5), (8, 3), (6, 4), (3, 4), (5, 4),
            (7, 2), (9, 2), (4, 5), (6, 2), (2, 9), (10, 3), (5, 6), (3, 7),
            (8, 2), (4, 7)]]
num('g4-u17-19', 'u17-two-numbers-product-quotient', 1,
    'ორი რიცხვის ნამრავლია {p}, ერთი მათგანი კი {k}-ჯერ მეტია მეორეზე. იპოვე პატარა რიცხვი.',
    [(k * a * a, k, a) for k, a in
     [(3, 2), (4, 3), (5, 2), (2, 5), (8, 3), (6, 4), (3, 4), (5, 4),
      (7, 2), (9, 2), (4, 5), (6, 2), (2, 9), (10, 3), (5, 6), (3, 7),
      (8, 2), (4, 7)]],
    '\n'.join([vn('p', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `ნამრავლი = პატარა × (პატარა × ${vars.k}), ანუ პატარა რიცხვის კვადრატი გამრავლებული ${vars.k}-ზე. ${answer} × ${answer} × ${vars.k} = ${vars.p}, ამიტომ პატარა რიცხვია ${answer}.`",
    step=1, minimum=2)

num('g4-u17-20', 'u17-two-numbers-product-quotient', 2,
    'ორი დადებითი მთელი რიცხვის ნამრავლია {p}, ხოლო დიდი რიცხვის პატარაზე გაყოფით მიიღება {k}. იპოვე დიდი რიცხვი.',
    [(k * a * a, k, k * a) for k, a in
     [(3, 2), (4, 3), (5, 2), (2, 5), (8, 3), (6, 4), (3, 4), (5, 4),
      (7, 2), (9, 2), (4, 5), (6, 2), (2, 9), (10, 3), (5, 6), (3, 7),
      (8, 2), (4, 7)]],
    '\n'.join([vn('p', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `ნამრავლი ÷ განაყოფი = ${Number(vars.p) / Number(vars.k)}. ეს პატარა რიცხვის კვადრატია: ${Math.sqrt(Number(vars.p) / Number(vars.k))} × ${Math.sqrt(Number(vars.p) / Number(vars.k))}. დიდი რიცხვი = ${Math.sqrt(Number(vars.p) / Number(vars.k))} × ${vars.k} = ${answer}.`")

num('g4-u17-21', 'u17-two-numbers-product-quotient', 2,
    'ორი რიცხვის ნამრავლია {p}. ერთი მათგანია {a}. იპოვე მეორე.',
    [(a * b, a, b) for a, b in
     [(3, 6), (4, 5), (7, 3), (8, 4), (6, 9), (5, 7), (9, 2), (12, 3),
      (11, 4), (10, 6), (8, 7), (9, 5), (6, 8), (7, 9), (4, 12), (5, 11),
      (3, 14), (2, 17)]],
    '\n'.join([vn('p', 0), vn('a', 1)]), 2,
    "({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`")

num('g4-u17-22', 'u17-two-numbers-product-quotient', 3,
    'ორი დადებითი მთელი რიცხვის ნამრავლია {p}, ხოლო დიდი რიცხვის პატარაზე გაყოფით მიიღება {k}. რამდენია ამ ორი რიცხვის ჯამი?',
    [(k * a * a, k, a + k * a) for k, a in
     [(3, 2), (4, 3), (5, 2), (2, 5), (8, 3), (6, 4), (3, 4), (5, 4),
      (7, 2), (9, 2), (4, 5), (6, 2), (2, 9), (10, 3), (5, 6), (3, 7),
      (8, 2), (4, 7)]],
    '\n'.join([vn('p', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `ნამრავლი ÷ განაყოფი = ${Number(vars.p) / Number(vars.k)} — ეს პატარა რიცხვის კვადრატია, ამიტომ პატარა რიცხვია ${Math.sqrt(Number(vars.p) / Number(vars.k))}, დიდი კი ${Math.sqrt(Number(vars.p) / Number(vars.k)) * Number(vars.k)}. ჯამი = ${answer}.`", step=2)

num('g4-u17-23', 'u17-two-numbers-product-quotient', 3,
    'ორი რიცხვის ნამრავლია {p}, ხოლო მათი ჯამია {s}. იპოვე დიდი რიცხვი.',
    [(a * b, a + b, max(a, b)) for a, b in
     [(3, 6), (4, 5), (7, 3), (8, 4), (6, 9), (5, 7), (9, 2), (12, 3),
      (11, 4), (10, 6), (8, 7), (9, 5), (6, 8), (7, 9), (4, 12), (5, 11),
      (3, 14), (2, 17)]],
    '\n'.join([vn('p', 0), vn('s', 1)]), 2,
    "({ vars, answer }) => `ნამრავლი ${vars.p} და ჯამი ${vars.s} გვაძლევს ${answer}-სა და ${Number(vars.s) - Number(vars.answer)}-ს.`")

num('g4-u17-24', 'u17-two-numbers-product-quotient', 1,
    'ორი რიცხვის ნამრავლია {p}, განაყოფი კი {k}. რამდენჯერ მეტია დიდი რიცხვი პატარაზე?',
    [(k * a * a, k, k) for k, a in
     [(3, 2), (4, 3), (5, 2), (2, 5), (8, 3), (6, 4), (3, 4), (5, 4),
      (7, 2), (9, 2), (4, 5), (6, 2), (2, 9), (10, 3), (5, 6), (3, 7),
      (8, 2), (4, 7)]],
    '\n'.join([vn('p', 0), vn('k', 1)]), 2,
    "({ answer }) => `განაყოფი სწორედ იმას გვიჩვენებს, რამდენჯერ მეტია დიდი რიცხვი — ${answer}-ჯერ.`",
    step=1, minimum=2)

num('g4-u17-25', 'u17-shape-puzzles', 1,
    'თუ ★ + ★ = {t}, რამდენია ★?',
    [(t, t // 2) for t in [8, 10, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 42, 44, 50]],
    '\n'.join([vn('t', 0)]), 1,
    "({ vars, answer }) => `${vars.t} ÷ 2 = ${answer}.`")

num('g4-u17-26', 'u17-shape-puzzles', 1,
    'თუ ● + {a} = {t}, რამდენია ●?',
    [(a, t, t - a) for a, t in
     [(5, 12), (7, 15), (8, 20), (6, 17), (9, 23), (4, 14), (11, 26), (3, 19),
      (10, 31), (12, 27), (13, 35), (2, 21), (14, 40), (15, 33), (16, 45),
      (17, 38), (18, 50), (19, 42)]],
    '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`")

num('g4-u17-27', 'u17-shape-puzzles', 2,
    'თუ ▲ + ▲ + {a} = {t}, რამდენია ▲?',
    [(a, t, (t - a) // 2) for a, t in
     [(6, 20), (4, 18), (8, 26), (10, 30), (2, 16), (12, 34), (5, 25), (7, 31),
      (9, 39), (3, 21), (14, 40), (11, 35), (13, 43), (16, 48), (1, 19),
      (15, 45), (17, 53), (18, 56)]],
    '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} − ${vars.a} = ${Number(vars.t) - Number(vars.a)}; ${Number(vars.t) - Number(vars.a)} ÷ 2 = ${answer}.`",
    step=2)

num('g4-u17-28', 'u17-shape-puzzles', 2,
    'თუ ■ × {k} = {t}, რამდენია ■?',
    [(k, t, t // k) for k, t in
     [(3, 27), (4, 32), (5, 45), (6, 54), (7, 56), (8, 72), (9, 81), (2, 38),
      (4, 48), (6, 66), (5, 60), (3, 39), (7, 77), (8, 88), (9, 99), (2, 46),
      (4, 56), (5, 65)]],
    '\n'.join([vn('k', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} ÷ ${vars.k} = ${answer}.`")

num('g4-u17-29', 'u17-shape-puzzles', 2,
    'თუ ★ + ● = {t} და ★ = {a}, რამდენია ●?',
    [(a, t, t - a) for a, t in
     [(9, 15), (7, 18), (12, 20), (6, 22), (11, 25), (8, 30), (14, 26), (5, 27),
      (13, 32), (10, 34), (15, 40), (4, 29), (16, 38), (17, 45), (3, 31),
      (18, 44), (19, 50), (20, 52)]],
    '\n'.join([vn('a', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`")

num('g4-u17-30', 'u17-shape-puzzles', 3,
    'თუ ▲ × {k} + {a} = {t}, რამდენია ▲?',
    [(k, a, t, (t - a) // k) for k, a, t in
     [(2, 4, 18), (3, 6, 24), (2, 8, 26), (4, 2, 26), (3, 3, 27), (2, 10, 30),
      (5, 5, 35), (3, 9, 36), (4, 4, 28), (2, 6, 22), (6, 6, 42), (3, 12, 45),
      (5, 10, 50), (2, 14, 40), (4, 8, 44), (3, 5, 32), (7, 7, 49), (2, 12, 36)]],
    '\n'.join([vn('k', 0), vn('a', 1), vn('t', 2)]), 3,
    "({ vars, answer }) => `${vars.t} − ${vars.a} = ${Number(vars.t) - Number(vars.a)}; ${Number(vars.t) - Number(vars.a)} ÷ ${vars.k} = ${answer}.`")

# ================= U17.6: u17-age-problems =================
num('g4-u17-31', 'u17-age-problems', 1,
    '{name} {a} წლისაა, მისი და კი {b} წლის. რამდენი წლით უფროსია და?',
    [(n, a, b, b - a) for n, a, b in [
        ('ნიკა', 8, 12), ('ანა', 9, 14), ('ლუკა', 7, 11), ('მარიამი', 10, 15),
        ('გიორგი', 6, 13), ('ნინო', 11, 16), ('სანდრო', 8, 17), ('თამარი', 9, 12),
        ('დათო', 7, 14), ('ლიზი', 10, 13), ('ვანო', 5, 11), ('სალომე', 12, 18),
        ('ბექა', 6, 10), ('ელენე', 8, 15), ('ლევანი', 9, 17), ('ნატა', 7, 12),
        ('ზურა', 10, 16), ('ქეთი', 11, 19)]],
    '\n'.join([vs('name', 0), vn('a', 1), vn('b', 2)]), 3,
    "({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer} წლით.`")

num('g4-u17-32', 'u17-age-problems', 1,
    'ანა {a} წლისაა. მისი ძმა მასზე {d} წლით უფროსია. რამდენი წლისაა ძმა?',
    [(a, d, a + d) for a, d in
     [(9, 4), (8, 3), (10, 5), (7, 6), (11, 2), (12, 4), (6, 8), (13, 3),
      (9, 7), (14, 2), (5, 9), (10, 6), (15, 4), (8, 5), (11, 7), (12, 6),
      (16, 3), (7, 8)]],
    '\n'.join([vn('a', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.a} + ${vars.d} = ${answer} წლის.`")

num('g4-u17-33', 'u17-age-problems', 2,
    'ანა {a} წლისაა. მისი ძმა მასზე {d} წლით უფროსია. რამდენი წლის იქნება ძმა {k} წლის შემდეგ?',
    [(a, d, k, a + d + k) for a, d, k in
     [(9, 4, 3), (8, 3, 5), (10, 5, 2), (7, 6, 4), (11, 2, 6), (12, 4, 3),
      (6, 8, 2), (13, 3, 5), (9, 7, 4), (14, 2, 3), (5, 9, 6), (10, 6, 5),
      (15, 4, 2), (8, 5, 7), (11, 7, 3), (12, 6, 4), (16, 3, 2), (7, 8, 5)]],
    '\n'.join([vn('a', 0), vn('d', 1), vn('k', 2)]), 3,
    "({ vars, answer }) => `ძმა ახლა ${Number(vars.a) + Number(vars.d)} წლისაა; ${Number(vars.a) + Number(vars.d)} + ${vars.k} = ${answer} წლის იქნება.`",
    step=2)

num('g4-u17-34', 'u17-age-problems', 2,
    'ორი ბავშვის ასაკების ჯამია {s} წელი. ერთი ბავშვი {d} წლით უფროსია მეორეზე. რამდენი წლისაა უფროსი?',
    [(s, d, (s + d) // 2) for s, d in
     [(20, 4), (24, 6), (18, 2), (30, 10), (26, 4), (22, 8), (28, 2), (34, 6),
      [(16, 4)][0], (36, 12), (20, 8), (32, 4), (40, 10), (25, 5), (21, 3),
      (27, 9), (23, 7), (29, 11)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `უფროსი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer} წლის.`", step=2)

num('g4-u17-35', 'u17-age-problems', 3,
    'დედა {m} წლისაა, შვილი კი {c} წლის. რამდენი წლის შემდეგ იქნება დედის ასაკი შვილის ასაკზე ორჯერ მეტი?',
    [(m, c, m - 2 * c) for m, c in
     [(36, 12), (40, 14), (30, 10), (45, 15), (50, 18), (42, 16), (38, 13),
      (48, 17), (52, 20), (44, 15), (34, 11), (56, 22), (39, 14), (46, 18),
      (60, 25), (37, 12), (41, 15), (54, 21)]],
    '\n'.join([vn('m', 0), vn('c', 1)]), 2,
    "({ vars, answer }) => `სხვაობა ${Number(vars.m) - Number(vars.c)} წელია და ის უცვლელი რჩება; დედის ასაკი ორჯერ მეტი რომ იყოს, შვილი სწორედ ამ სხვაობის ტოლი უნდა იყოს: ${answer} წლის შემდეგ.`",
    step=2)

num('g4-u17-36', 'u17-age-problems', 3,
    'ბაბუა {g} წლისაა, შვილიშვილი კი {c} წლის. რამდენი წლის შემდეგ იქნება ბაბუა შვილიშვილზე ოთხჯერ უფროსი?',
    [(g, c, (g - 4 * c) // 3) for g, c in
     [(72, 12), (64, 10), (75, 15), (68, 11), (56, 8), (70, 13), (66, 9),
      (78, 12), (80, 14), (84, 18), (58, 10), (76, 16), (90, 18), (74, 14),
      (86, 20), (62, 14), (92, 20), (94, 22)]],
    '\n'.join([vn('g', 0), vn('c', 1)]), 2,
    "({ vars, answer }) => `${answer} წლის შემდეგ ბაბუა ${Number(vars.g) + Number(vars.answer)} წლის იქნება, შვილიშვილი კი ${Number(vars.c) + Number(vars.answer)} — სწორედ 4-ჯერ.`")

num('g4-u17-37', 'u17-age-problems', 2,
    'მამა {f} წლისაა, შვილი კი {s} წლის. ისინი ერთად რამდენი წლისანი არიან?',
    [(f, s, f + s) for f, s in
     [(40, 10), (36, 9), (45, 12), (42, 14), (50, 15), (38, 11), (44, 13),
      (48, 16), (35, 8), (52, 17), (46, 12), (54, 18), (39, 10), (41, 13),
      [(50, 12)][0], (43, 11), (47, 14), (49, 15)]],
    '\n'.join([vn('f', 0), vn('s', 1)]), 2,
    "({ vars, answer }) => `${vars.f} + ${vars.s} = ${answer} წლის.`", step=2)

num('g4-u17-38', 'u17-age-problems', 3,
    'დედა {m} წლისაა, შვილი კი {c} წლის. რამდენი წლის წინ იყო დედა შვილზე სამჯერ უფროსი?',
    [(m, c, (3 * c - m) // 2) for m, c in
     [(36, 14), (40, 16), (30, 12), (45, 17), (50, 20), (42, 16), (38, 14),
      (48, 18), (52, 20), (44, 16), (34, 12), (56, 20), (39, 15), (46, 18),
      (60, 24), (37, 15), (41, 17), (54, 22)]],
    '\n'.join([vn('m', 0), vn('c', 1)]), 2,
    "({ vars, answer }) => `${answer} წლის წინ დედა ${Number(vars.m) - Number(vars.answer)} წლის იყო, შვილი ${Number(vars.c) - Number(vars.answer)} — სამჯერ უფროსი.`")

num('g4-u17-39', 'u17-time-quantity-problems', 1,
    'მანქანა საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში?',
    [(v, t, v * t) for v, t in
     [(60, 4), (50, 3), (70, 2), (80, 5), (45, 6), (90, 3), (65, 4), (55, 7),
      (75, 2), (85, 3), (40, 8), (95, 2), (100, 4), (120, 3), (30, 9),
      (110, 2), (125, 4), (150, 2)]],
    '\n'.join([vn('v', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} კმ.`")

num('g4-u17-40', 'u17-time-quantity-problems', 1,
    'ონკანიდან წუთში {v} ლიტრი წყალი ჩაედინება ავზში. რამდენი ლიტრი ჩაედინება {t} წუთში?',
    [(v, t, v * t) for v, t in
     [(5, 8), (4, 9), (6, 7), (3, 12), (7, 6), (8, 5), (9, 4), (2, 15),
      (10, 6), (12, 4), (15, 3), (11, 5), (13, 4), (14, 3), (16, 2), (18, 5),
      (20, 4), (25, 3)]],
    '\n'.join([vn('v', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} ლიტრი.`")

num('g4-u17-41', 'u17-time-quantity-problems', 2,
    'მუშა საათში {v} ნივთს ამზადებს. რამდენ ნივთს დაამზადებს {t} საათში?',
    [(v, t, v * t) for v, t in
     [(12, 5), (15, 4), (10, 7), (14, 3), (9, 8), (11, 6), (13, 5), (16, 4),
      (18, 3), (20, 5), (8, 9), (7, 11), (17, 4), (19, 3), (21, 2), (22, 4),
      (24, 3), (25, 4)]],
    '\n'.join([vn('v', 0), vn('t', 1)]), 2,
    "({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} ნივთი.`")

num('g4-u17-42', 'u17-time-quantity-problems', 2,
    'ავტობუსი {t} საათში {d} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t2} საათში, თუ სიჩქარე უცვლელია?',
    [(t, d, t2, (d // t) * t2) for t, d, t2 in
     [(3, 180, 5), (2, 120, 4), (4, 200, 6), (5, 300, 3), (2, 90, 7), (3, 150, 4),
      (4, 240, 5), (6, 360, 2), (2, 140, 5), (5, 250, 4), (3, 210, 6), (4, 160, 7),
      (2, 100, 8), (5, 400, 3), (6, 420, 4), (3, 270, 5), (4, 320, 3), (2, 160, 9)]],
    '\n'.join([vn('t', 0), vn('d', 1), vn('t2', 2)]), 3,
    "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${Number(vars.d) / Number(vars.t)} კმ/სთ; ${Number(vars.d) / Number(vars.t)} × ${vars.t2} = ${answer} კმ.`")

num('g4-u17-43', 'u17-time-quantity-problems', 3,
    'პრინტერი წუთში {v} გვერდს ბეჭდავს. რამდენ წუთში დაბეჭდავს {p} გვერდს?',
    [(v, p, p // v) for v, p in
     [(15, 90), (12, 60), (10, 80), (20, 100), (8, 72), (9, 63), (11, 88),
      (14, 70), (16, 96), (18, 90), (25, 100), (6, 54), (7, 84), (13, 78),
      (17, 85), (19, 76), (21, 84), (24, 96)]],
    '\n'.join([vn('v', 0), vn('p', 1)]), 2,
    "({ vars, answer }) => `${vars.p} ÷ ${vars.v} = ${answer} წუთი.`")

num('g4-u17-44', 'u17-time-quantity-problems', 3,
    'ბაღში {w} მუშა საათში {v} ხეს რწყავს. რამდენ ხეს მორწყავენ ისინი ერთად {t} საათში?',
    [(w, v, t, w * v * t) for w, v, t in
     [(4, 6, 3), (3, 5, 4), (5, 4, 2), (2, 7, 5), (6, 3, 4), (4, 8, 2),
      (3, 9, 3), (5, 6, 2), (7, 2, 3), (2, 10, 4), (4, 5, 5), (6, 4, 3),
      (8, 3, 2), (3, 7, 4), (5, 8, 2), (9, 2, 5), (4, 9, 3), (2, 12, 4)]],
    '\n'.join([vn('w', 0), vn('v', 1), vn('t', 2)]), 3,
    "({ vars, answer }) => `${vars.w} × ${vars.v} × ${vars.t} = ${answer} ხე.`", step=2)

# ================= U17.8: u17-finding-differences =================
num('g4-u17-45', 'u17-finding-differences', 1,
    'იპოვე სხვაობა: {a} − {b}.',
    [(a, b, a - b) for a, b in
     [(85, 39), (72, 28), (91, 47), (64, 27), (100, 67), (83, 55), (96, 38),
      (74, 49), (58, 33), (120, 84), (93, 68), (77, 26), (105, 59), (88, 41),
      (66, 19), (112, 75), (94, 57), (81, 36)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`", step=2)

num('g4-u17-46', 'u17-finding-differences', 1,
    'იპოვე სხვაობა {a}-სა და {b}-ს შორის.',
    [(a, b, a - b) for a, b in
     [(100, 67), (200, 158), (150, 96), (1000, 475), (300, 184), (250, 137),
      (100, 42), (500, 365), (120, 58), (180, 93), (1000, 620), (400, 289),
      (160, 77), (220, 145), (350, 268), (500, 419), (100, 23), (1000, 856)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`", step=2)

num('g4-u17-47', 'u17-finding-differences', 1,
    'ორი რიცხვის სხვაობაა {d}. დიდი რიცხვია {a}. იპოვე პატარა რიცხვი.',
    [(a, d, a - d) for a, d in
     [(52, 17), (48, 21), (73, 28), (65, 19), (90, 24), (84, 37), (57, 13),
      (96, 48), (71, 26), (63, 35), (100, 42), (77, 39), (88, 51), (59, 17),
      (94, 46), (68, 23), (81, 34), (75, 27)]],
    '\n'.join([vn('a', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.d} = ${answer}.`")

num('g4-u17-48', 'u17-finding-differences', 2,
    'ორი რიცხვის სხვაობაა {d}. პატარა რიცხვია {b}. იპოვე დიდი რიცხვი.',
    [(b, d, b + d) for b, d in
     [(16, 28), (21, 19), (34, 27), (45, 18), (13, 36), (29, 24), (52, 17),
      (38, 32), (47, 25), (61, 19), (28, 34), (55, 27), (72, 18),
      (39, 26), (44, 31), (58, 22), (69, 17), (83, 19)]],
    '\n'.join([vn('b', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.b} + ${vars.d} = ${answer}.`")

num('g4-u17-49', 'u17-finding-differences', 2,
    'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია პატარა რიცხვი?',
    [(s, d, (s - d) // 2) for s, d in
     [(40, 6), (52, 8), (46, 12), (64, 10), (38, 4), (56, 16), (70, 20),
      (48, 14), (58, 22), (36, 6), (74, 18), (62, 24), (44, 10), (66, 26),
      [(50, 8)][0], (42, 12), (54, 18), (68, 14)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `პატარა რიცხვი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`", step=2)

num('g4-u17-50', 'u17-finding-differences', 3,
    'იპოვე სხვაობა {a}-სა და {b}-ს შორის, შემდეგ კი შედეგს {k} დაუმატე.',
    [(a, b, k, a - b + k) for a, b, k in
     [(85, 39, 10), (72, 28, 15), (91, 47, 6), (64, 27, 20), (100, 67, 7),
      (83, 55, 12), (96, 38, 9), (74, 49, 18), (58, 33, 25), (120, 84, 5),
      (93, 68, 11), (77, 26, 14), (105, 59, 8), (88, 41, 17), (66, 19, 21),
      (112, 75, 6), (94, 57, 13), (81, 36, 16)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('k', 2)]), 3,
    "({ vars, answer }) => `(${vars.a} − ${vars.b}) + ${vars.k} = ${Number(vars.a) - Number(vars.b)} + ${vars.k} = ${answer}.`",
    step=2)

num('g4-u17-51', 'u17-finding-differences', 3,
    '{a}-სა და {b}-ს შორის სხვაობა {k}-ჯერ გავზარდეთ. რა მივიღეთ?',
    [(a, b, k, (a - b) * k) for a, b, k in
     [(85, 39, 2), (72, 28, 3), (91, 47, 2), (64, 27, 4), (100, 67, 3),
      (83, 55, 2), (96, 38, 5), (74, 49, 2), (58, 33, 3), (120, 84, 4),
      (93, 68, 2), (77, 26, 3), (105, 59, 2), (88, 41, 2), (66, 19, 4),
      (112, 75, 2), (94, 57, 3), (81, 36, 2)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('k', 2)]), 3,
    "({ vars, answer }) => `(${vars.a} − ${vars.b}) × ${vars.k} = ${Number(vars.a) - Number(vars.b)} × ${vars.k} = ${answer}.`",
    step=2)

# ================= U17.9: u17-segment-problems =================
num('g4-u17-52', 'u17-segment-problems', 1,
    'გზის სიგრძეა {a} კმ. პირველი მონაკვეთი {b} კმ-ია. რამდენი კილომეტრია დარჩენილი მონაკვეთი?',
    [(a, b, a - b) for a, b in
     [(20, 8), (30, 12), (45, 18), (50, 23), (25, 9), (60, 27),
      (38, 15), (72, 34), (64, 28), (90, 45), (55, 21), (48, 19), (100, 63),
      (76, 39), (82, 47), (68, 26), (58, 33), (96, 51)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`")

num('g4-u17-53', 'u17-segment-problems', 1,
    'ლენტი {a} მ სიგრძისაა. მისგან {b} მ მოჭრეს. რამდენი მეტრი დარჩა?',
    [(a, b, a - b) for a, b in
     [(15, 6), (20, 7), (18, 5), (25, 9), (30, 12), (12, 4), (22, 8),
      (35, 17), (28, 11), (16, 7), (40, 24), (32, 13), (24, 6), (45, 19),
      (26, 10), (38, 21), (14, 5), (50, 27)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} მ.`")

num('g4-u17-54', 'u17-segment-problems', 2,
    'მონაკვეთის სიგრძეა {a} სმ. ის ორ ნაწილადაა დაყოფილი; ერთი ნაწილია {b} სმ. რამდენია მეორე ნაწილი?',
    [(a, b, a - b) for a, b in
     [(24, 9), (30, 13), (18, 7), (36, 15), (27, 11), (42, 19), (20, 8),
      (33, 14), (45, 22), (39, 17), (48, 26), (21, 6), (54, 23), (60, 31),
      (35, 12), (28, 9), (51, 24), (44, 18)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} სმ.`")

num('g4-u17-55', 'u17-segment-problems', 2,
    'გზის ერთი მონაკვეთი {a} კმ-ია, მეორე კი {b} კმ. რამდენი კილომეტრით გრძელია პირველი?',
    [(a, b, a - b) for a, b in
     [(18, 12), (25, 14), (30, 17), (22, 9), (35, 21), (40, 26), (28, 13),
      (32, 18), (45, 29), (24, 16), (50, 33), (38, 24), (42, 27),
      (55, 36), (60, 41), (34, 19), (48, 31), (26, 17)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`")

num('g4-u17-56', 'u17-segment-problems', 3,
    '{a} სმ სიგრძის მონაკვეთი სამ ნაწილადაა დაყოფილი. პირველი {b} სმ-ია, მეორე {c} სმ. რამდენია მესამე ნაწილი?',
    [(a, b, c, a - b - c) for a, b, c in
     [(30, 8, 10), (36, 12, 9), (24, 7, 6), (20, 5, 6), (45, 14, 12),
      (50, 18, 15), (28, 9, 8), (40, 13, 11), (33, 10, 9), (42, 16, 12),
      (60, 21, 18), (54, 17, 14), (26, 8, 7), (48, 15, 13), (38, 11, 9),
      (56, 19, 16), (64, 23, 17), (44, 12, 10)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2)]), 3,
    "({ vars, answer }) => `${vars.a} − ${vars.b} − ${vars.c} = ${answer} სმ.`")

num('g4-u17-57', 'u17-segment-problems', 3,
    'ორ ქალაქს შორის მანძილი {a} კმ-ია. მანქანამ გაიარა {b} კმ. რამდენი კილომეტრი დარჩა გასავლელი?',
    [(a, b, a - b) for a, b in
     [(150, 85), (200, 120), (180, 95), (240, 138), (120, 67), (300, 174),
      (160, 89), (220, 131), (280, 165), (100, 42), (250, 148), (190, 103),
      (320, 187), (140, 76), (270, 159), (210, 124), (360, 215), (170, 93)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`")

num('g4-u17-58', 'u17-segment-problems', 3,
    'მონაკვეთი {k} ტოლ ნაწილადაა დაყოფილი. მთელი სიგრძე {a} სმ-ია. რამდენია ერთი ნაწილის სიგრძე?',
    [(a, k, a // k) for a, k in
     [(24, 3), (30, 5), (36, 4), (45, 9), (28, 7), (40, 8), (54, 6), (63, 9),
      (48, 6), (56, 7), (72, 8), (64, 8), (81, 9), (35, 5), (42, 6), (60, 10),
      (27, 3), (90, 9)]],
    '\n'.join([vn('a', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.a} ÷ ${vars.k} = ${answer} სმ.`")

# ================= U17.10: u17-scale =================
num('g4-u17-59', 'u17-scale', 1,
    'რუკაზე 1 სმ რეალურ მანძილზე {k} კმ-ს შეესაბამება. რას უდრის რეალური მანძილი, თუ რუკაზე მანძილი {d} სმ-ია?',
    [(k, d, k * d) for k, d in
     [(5, 4), (10, 7), (4, 8), (6, 5), (8, 3), (2, 9), (3, 7), (12, 4),
      (15, 2), (20, 3), (7, 6), (9, 5), (11, 3), (25, 4), (14, 5), (16, 2),
      (18, 3), (30, 2)]],
    '\n'.join([vn('k', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`")

num('g4-u17-60', 'u17-scale', 2,
    'რუკის მასშტაბია 1 სმ = {k} კმ. რუკაზე ორ ქალაქს შორის მანძილია {d} სმ. რა მანძილია სინამდვილეში?',
    [(k, d, k * d) for k, d in
     [(10, 7), (5, 6), (4, 9), (8, 4), (6, 7), (12, 3), (15, 5), (3, 11),
      (20, 2), (7, 8), (9, 6), (25, 3), (14, 4), (11, 7), (13, 5), (16, 4),
      (18, 2), (24, 3)]],
    '\n'.join([vn('k', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`")

num('g4-u17-61', 'u17-scale', 2,
    'რეალური მანძილია {r} კმ. თუ მასშტაბია 1 სმ = {k} კმ, რამდენი სანტიმეტრი იქნება ეს რუკაზე?',
    [(r, k, r // k) for r, k in
     [(30, 5), (45, 9), (24, 4), (36, 6), (60, 10), (42, 7), (48, 8), (54, 6),
      (80, 8), (35, 5), (50, 10), (66, 6), (72, 9), (28, 4), (96, 8),
      (64, 8), (81, 9), (90, 10)]],
    '\n'.join([vn('r', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.r} ÷ ${vars.k} = ${answer} სმ.`")

num('g4-u17-62', 'u17-scale', 2,
    'რუკაზე მანძილი {d} სმ-ია, მასშტაბი კი 1 სმ = {k} კმ. იპოვე რეალური მანძილი.',
    [(d, k, d * k) for d, k in
     [(8, 4), (5, 7), (6, 9), (9, 3), (11, 5), (4, 12), (7, 6), (3, 14),
      (12, 2), (10, 8), (5, 15), (6, 11), (9, 7), (13, 3), (2, 20), (8, 9),
      (4, 16), (7, 12)]],
    '\n'.join([vn('d', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`")

num('g4-u17-63', 'u17-scale', 3,
    'რეალური მანძილი {r} კმ-ია. მასშტაბია 1 სმ = {k} კმ. რამდენი სანტიმეტრი იქნება რუკაზე?',
    [(r, k, r // k) for r, k in
     [(45, 9), (56, 7), (72, 8), (63, 9), (50, 5), (84, 12), (96, 8), (36, 4),
      [(60, 6)][0], (42, 7), (90, 10), (108, 12), (77, 11), (65, 5), (135, 9),
      (112, 8), (144, 12), (78, 6)]],
    '\n'.join([vn('r', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.r} ÷ ${vars.k} = ${answer} სმ.`")

num('g4-u17-64', 'u17-scale', 3,
    'რუკაზე ორი სოფლის შორის მანძილი {d} სმ-ია. მასშტაბია 1 სმ = {k} კმ. რა მანძილია სოფლებამდე?',
    [(d, k, d * k) for d, k in
     [(6, 12), (7, 15), (5, 18), (8, 11), (4, 25), (9, 13), (3, 30),
      (11, 6), (12, 7), (2, 40), (10, 9), (13, 4), (8, 14), (6, 21), (5, 26),
      (7, 18), (9, 16), (4, 32)]],
    '\n'.join([vn('d', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`")

# ================= U17.11: u17-graphs =================
# Fruit chart: apple 12, pear 8, banana 15, orange 10
GRAPHS_ROWS = [
    ('ვაშლი', 12), ('მსხალი', 8), ('ბანანი', 15), ('ფორთოხალი', 10),
]

def graph_bars(a, b, c, d):
    return [f'{GRAPHS_ROWS[0][0]} {a}', f'{GRAPHS_ROWS[1][0]} {b}',
            f'{GRAPHS_ROWS[2][0]} {c}', f'{GRAPHS_ROWS[3][0]} {d}']


def graph_row(a, b, c, d, ans):
    return '|'.join(graph_bars(a, b, c, d) + [str(ans)])


means = ['მოსწავლეების გამოკითხვის შედეგები: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'დიაგრამაზე ნაჩვენებია: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'კლასში ნაყოფები ასე განაწილდა: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'სუფრაზე ნაყოფები დაითვალეს: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'სია ასეთია: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'მაღაზიის მარაგი: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'ბაღის მოსავალი: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.',
         'დათვლის შედეგი: ვაშლი — 12, მსხალი — 8, ბანანი — 15, ფორთოხალი — 10.']

num('g4-u17-65', 'u17-graphs', 1,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რომელი ნაყოფია ყველაზე მეტად და რამდენია მისი რაოდენობა?',
    [(a, b, c, d, max(a, b, c, d)) for a, b, c, d in
     [(12, 8, 15, 10), (14, 9, 18, 11), (10, 6, 13, 8), (16, 11, 20, 13),
      (11, 7, 17, 9), (13, 5, 19, 12), (15, 10, 21, 14), (9, 4, 12, 7),
      (18, 13, 24, 16), (12, 7, 16, 9), (17, 12, 22, 15), (10, 5, 15, 8),
      (14, 8, 19, 11), (13, 9, 18, 10), (16, 7, 23, 12), (11, 6, 14, 9),
      (19, 14, 25, 17), (15, 9, 20, 13)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3)]), 4,
    "({ answer }) => `ოთხი რიცხვიდან უდიდესია ${answer}.`", step=2)

num('g4-u17-66', 'u17-graphs', 1,
    'დიაგრამაზე მსხალი — {b}, ვაშლი კი მსხალზე {k}-ით მეტია. რამდენი ვაშლია?',
    [(b, k, b + k) for b, k in
     [(8, 4), (9, 5), (6, 7), (11, 3), (7, 8), (5, 9), (10, 6), (4, 8),
      (13, 5), (12, 7), (9, 9), (6, 11), (14, 4), (8, 12), (7, 10), (5, 13),
      (15, 6), (10, 9)]],
    '\n'.join([vn('b', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.b} + ${vars.k} = ${answer}.`")

num('g4-u17-67', 'u17-graphs', 2,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენით მეტია ბანანი მსხალზე?',
    [(a, b, c, d, c - b) for a, b, c, d in
     [(12, 8, 15, 10), (14, 9, 18, 11), (10, 6, 13, 8), (16, 11, 20, 13),
      (11, 7, 17, 9), (13, 5, 19, 12), (15, 10, 21, 14), (9, 4, 12, 7),
      (18, 13, 24, 16), (12, 7, 16, 9), (17, 12, 22, 15), (10, 5, 15, 8),
      (14, 8, 19, 11), (13, 9, 18, 10), (16, 7, 23, 12), (11, 6, 14, 9),
      (19, 14, 25, 17), (15, 9, 20, 13)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3)]), 4,
    "({ vars, answer }) => `${vars.c} − ${vars.b} = ${answer}.`")

num('g4-u17-68', 'u17-graphs', 2,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენია ოთხივე ნაყოფის ჯამი?',
    [(a, b, c, d, a + b + c + d) for a, b, c, d in
     [(12, 8, 15, 10), (14, 9, 18, 11), (10, 6, 13, 8), (16, 11, 20, 13),
      (11, 7, 17, 9), (13, 5, 19, 12), (15, 10, 21, 14), (9, 4, 12, 7),
      (18, 13, 24, 16), (12, 7, 16, 9), (17, 12, 22, 15), (10, 5, 15, 8),
      (14, 8, 19, 11), (13, 9, 18, 10), (16, 7, 23, 12), (11, 6, 14, 9),
      (19, 14, 25, 17), (15, 9, 20, 13)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3)]), 4,
    "({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`", step=2)

num('g4-u17-69', 'u17-graphs', 2,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. სამი ყველაზე მრავალრიცხოვანი ნაყოფის ჯამი რამდენია?',
    [(a, b, c, d, a + b + c + d - min(a, b, c, d)) for a, b, c, d in
     [(12, 8, 15, 10), (14, 9, 18, 11), (10, 6, 13, 8), (16, 11, 20, 13),
      (11, 7, 17, 9), (13, 5, 19, 12), (15, 10, 21, 14), (9, 4, 12, 7),
      (18, 13, 24, 16), (12, 7, 16, 9), (17, 12, 22, 15), (10, 5, 15, 8),
      (14, 8, 19, 11), (13, 9, 18, 10), (16, 7, 23, 12), (11, 6, 14, 9),
      (19, 14, 25, 17), (15, 9, 20, 13)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3)]), 4,
    "({ vars, answer }) => `სულ ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} ნაყოფია; უმცირესს (${Math.min(Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d))}) რომ გამოვაკლოთ, დარჩენილი სამის ჯამია ${answer}.`",
    step=2)

num('g4-u17-70', 'u17-graphs', 3,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენით ნაკლებია მსხალი ვაშლზე?',
    [(a, b, c, d, a - b) for a, b, c, d in
     [(12, 8, 15, 10), (14, 9, 18, 11), (10, 6, 13, 8), (16, 11, 20, 13),
      (11, 7, 17, 9), (13, 5, 19, 12), (15, 10, 21, 14), (9, 4, 12, 7),
      (18, 13, 24, 16), (12, 7, 16, 9), (17, 12, 22, 15), (10, 5, 15, 8),
      (14, 8, 19, 11), (13, 9, 18, 10), (16, 7, 23, 12), (11, 6, 14, 9),
      (19, 14, 25, 17), (15, 9, 20, 13)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3)]), 4,
    "({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`")

num('g4-u17-71', 'u17-graphs', 3,
    'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენი ნაყოფი უნდა დავამატოთ, რომ სულ {t} გახდეს?',
    [(a, b, c, d, t, t - (a + b + c + d)) for a, b, c, d, t in
     [(12, 8, 15, 10, 60), (14, 9, 18, 11, 60), (10, 6, 13, 8, 50), (16, 11, 20, 13, 70),
      (11, 7, 17, 9, 60), (13, 5, 19, 12, 60), (15, 10, 21, 14, 70), (9, 4, 12, 7, 40),
      (18, 13, 24, 16, 80), (12, 7, 16, 9, 50), (17, 12, 22, 15, 80), (10, 5, 15, 8, 50),
      (14, 8, 19, 11, 60), (13, 9, 18, 10, 60), (16, 7, 23, 12, 70), (11, 6, 14, 9, 50),
      (19, 14, 25, 17, 90), (15, 9, 20, 13, 70)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2), vn('d', 3), vn('t', 4)]), 5,
    "({ vars, answer }) => `ახლა სულ ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} ნაყოფია; ${vars.t} − ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} = ${answer}.`",
    step=2)

ordering('g4-u17-72', 'u17-number-ordering', 1,
         [26, 36, 62, 63, 15, 51, 24, 42, 37, 73, 48, 84, 59, 95],
         4, 'asc',
         ['დაალაგე რიცხვები ზრდადობით (უმცირესიდან უდიდესისკენ):',
          'ჩამოაწყე რიცხვები ზრდადობით — ჯერ უმცირესი:'],
         'ზრდადობით')
ordering('g4-u17-73', 'u17-number-ordering', 1,
         [26, 36, 62, 63, 15, 51, 24, 42, 37, 73, 48, 84, 59, 95],
         4, 'desc',
         ['დაალაგე რიცხვები კლებადობით (უდიდესიდან უმცირესისკენ):',
          'ჩამოაწყე რიცხვები კლებადობით — ჯერ უდიდესი:'],
         'კლებადობით')
ordering('g4-u17-74', 'u17-number-ordering', 1,
         [8, 5, 12, 3, 9, 1, 10, 7],
         3, 'asc',
         ['დაალაგე რიცხვები ზრდადობით:', 'ჩამოაწყე რიცხვები ზრდადობით:'],
         'ზრდადობით')
ordering('g4-u17-75', 'u17-number-ordering', 2,
         [45, 54, 34, 43, 99, 19, 29, 92, 68, 86, 77, 57],
         4, 'asc',
         ['დაალაგე ორნიშნა რიცხვები ზრდადობით:', 'ჩამოაწყე ორნიშნა რიცხვები ზრდადობით:'],
         'ზრდადობით')
ordering('g4-u17-76', 'u17-number-ordering', 2,
         [105, 150, 501, 510, 95, 159, 190, 15, 51, 119],
         4, 'asc',
         ['დაალაგე რიცხვები ზრდადობით:', 'ჩამოაწყე რიცხვები ზრდადობით:'],
         'ზრდადობით')
ordering('g4-u17-77', 'u17-number-ordering', 2,
         [300, 30, 303, 33, 330, 333, 310, 103],
         4, 'desc',
         ['დაალაგე რიცხვები კლებადობით:', 'ჩამოაწყე რიცხვები კლებადობით:'],
         'კლებადობით')
ordering('g4-u17-78', 'u17-number-ordering', 3,
         [1000, 100, 10000, 10, 999, 1010, 1100, 111],
         4, 'asc',
         ['დაალაგე რიცხვები ზრდადობით:', 'ჩამოაწყე რიცხვები ზრდადობით:'],
         'ზრდადობით')
ordering('g4-u17-79', 'u17-number-ordering', 3,
         [250, 205, 520, 502, 25, 52, 2500, 2050],
         4, 'desc',
         ['დაალაგე რიცხვები კლებადობით:', 'ჩამოაწყე რიცხვები კლებადობით:'],
         'კლებადობით')
ordering('g4-u17-80', 'u17-number-ordering', 3,
         [7, 17, 70, 71, 107, 170, 700, 701, 117],
         4, 'asc',
         ['დაალაგე რიცხვები ზრდადობით:', 'ჩამოაწყე რიცხვები ზრდადობით:'],
         'ზრდადობით')

# ================= U17.13: u17-condition-matching =================
num('g4-u17-81', 'u17-condition-matching', 1,
    'რიცხვი {n}-ზე მეტია {d}-ით. რა რიცხვია?',
    [(n, d, n + d) for n, d in
     [(10, 5), (14, 6), (20, 7), (8, 9), (25, 4), (30, 12), (18, 3), (40, 15),
      (12, 8), (22, 11), (16, 7), (35, 9), (24, 6), (17, 13), (28, 5), (45, 8),
      (33, 7), (19, 14)]],
    '\n'.join([vn('n', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.n} + ${vars.d} = ${answer}.`")

num('g4-u17-82', 'u17-condition-matching', 1,
    'რიცხვი {n}-ზე ნაკლებია {d}-ით. რა რიცხვია?',
    [(n, d, n - d) for n, d in
     [(30, 7), (45, 9), (25, 6), (50, 13), (18, 5), (60, 24), (36, 8), (42, 15),
      (55, 6), (28, 11), (70, 35), (48, 19), (64, 7), (39, 14), (52, 8),
      (75, 26), (33, 12), (58, 21)]],
    '\n'.join([vn('n', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `${vars.n} − ${vars.d} = ${answer}.`")

num('g4-u17-83', 'u17-condition-matching', 2,
    'რიცხვი ლუწია და {a}-ზე მეტია, მაგრამ {b}-ზე ნაკლები. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    [(a, b, (a + 1) if (a + 1) % 2 == 0 else (a + 2)) for a, b in
     [(10, 20), (14, 25), (8, 16), (21, 30), (33, 40), (17, 24), (45, 50),
      (12, 19), (27, 36), (7, 14), (55, 62), (19, 28), (31, 38), (23, 32),
      (63, 70), (9, 18), (41, 48), (15, 22)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a}-ზე მეტი ყველაზე პატარა ლუწი რიცხვია ${answer}.`",
    step=2)

num('g4-u17-84', 'u17-condition-matching', 2,
    'რიცხვი კენტია და {a}-ზე მეტია, მაგრამ {b}-ზე ნაკლები. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    [(a, b, (a + 1) if (a + 1) % 2 == 1 else (a + 2)) for a, b in
     [(10, 20), (14, 25), (8, 16), (21, 30), (33, 40), (17, 24), (45, 50),
      (12, 19), (27, 36), (7, 14), (55, 62), (19, 28), (31, 38), (23, 32),
      (63, 70), (9, 18), (41, 48), (15, 22)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a}-ზე მეტი ყველაზე პატარა კენტი რიცხვია ${answer}.`",
    step=2)

num('g4-u17-85', 'u17-condition-matching', 3,
    'რიცხვი იყოფა {k}-ზე და {a}-ზე მეტია. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    [(a, k, a + (k - a % k) % k) for a, k in
     [(10, 3), (14, 5), (20, 6), (9, 4), (25, 7), (17, 8), (31, 9), (40, 12),
      (13, 5), (22, 4), (35, 6), (48, 7), (11, 2), (19, 3), (27, 8), (54, 9),
      (16, 5), (23, 10)]],
    '\n'.join([vn('a', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.a}-ზე მეტი და ${vars.k}-ის ჯერადი ყველაზე პატარა რიცხვია ${answer}.`")

num('g4-u17-86', 'u17-condition-matching', 3,
    'რიცხვი ორნიშნაა, იყოფა {k}-ზე და {a}-ზე მეტია. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    [(a, k, max(10, a + (k - a % k) % k)) for a, k in
     [(5, 7), (8, 9), (3, 6), (11, 8), (6, 5), (9, 4), (2, 12), (7, 6),
      (4, 9), (1, 15), (10, 3), (12, 7), (13, 4), (14, 8), (15, 6), (9, 5),
      (11, 12), (8, 11)]],
    '\n'.join([vn('a', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.k}-ის ჯერადი ორნიშნა რიცხვებიდან ${vars.a}-ზე მეტი ყველაზე პატარაა ${answer}.`")

num('g4-u17-87', 'u17-condition-matching', 3,
    '{a}-ზე მეტი და {b}-ზე ნაკლები მხოლოდ ერთი ლუწი რიცხვია — {c}. რამდენია {a} და {b} შორის სხვაობა?',
    [(a, b, c, b - a) for a, b, c in
     [(10, 14, 12), (20, 26, 24), (15, 21, 18), (30, 38, 34), (40, 46, 42),
      (50, 56, 54), (60, 70, 64), (45, 53, 48), (25, 33, 28), (70, 82, 76),
      (80, 92, 86), (90, 98, 94), (35, 39, 36), (55, 63, 58), (65, 75, 70),
      (100, 112, 106), (110, 122, 116), (120, 130, 126)]],
    '\n'.join([vn('a', 0), vn('b', 1), vn('c', 2)]), 3,
    "({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer}.`", step=2)

num('g4-u17-88', 'u17-condition-matching', 2,
    'სამნიშნა რიცხვი იწყება {d}-ით, მთავრდება {u}-ით, ხოლო ათეულებში 0 დგას. რა რიცხვია?',
    [(d, u, d * 100 + u) for d, u in
     [(1, 4), (2, 7), (3, 5), (4, 9), (5, 2), (6, 8), (7, 3), (8, 6), (9, 1),
      (1, 8), (2, 3), (3, 9), (4, 6), (5, 1), (6, 4), (7, 8), (8, 2), (9, 5)]],
    '\n'.join([vn('d', 0), vn('u', 1)]), 2,
    "({ vars, answer }) => `${vars.d} ასეული, 0 ათეული, ${vars.u} ერთეული = ${answer}.`",
    step=10)

num('g4-u17-89', 'u17-condition-matching', 3,
    'ორნიშნა რიცხვი იწყება {d}-ით და მთავრდება {u}-ით. რამდენი უნდა დავუმატოთ, რომ ზუსტად 100 მივიღოთ?',
    [(d, u, 100 - (d * 10 + u)) for d, u in
     [(1, 4), (2, 7), (3, 5), (4, 9), (5, 2), (6, 8), (7, 3), (8, 6), (9, 1),
      (1, 8), (2, 3), (3, 9), (4, 6), (5, 1), (6, 4), (7, 8), (8, 2), (9, 5)]],
    '\n'.join([vn('d', 0), vn('u', 1)]), 2,
    "({ vars, answer }) => `რიცხვია ${Number(vars.d) * 10 + Number(vars.u)}; 100 − ${Number(vars.d) * 10 + Number(vars.u)} = ${answer}.`")

num('g4-u17-90', 'u17-condition-matching', 3,
    'ორი ზედიზედ მოსული ლუწი რიცხვის ჯამია {s}. იპოვე პატარა მათგანი.',
    [(s, s // 2 - 1) for s in [10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54,
                               58, 62, 66, 70, 74, 78]],
    '\n'.join([vn('s', 0)]), 1,
    "({ vars, answer }) => `${vars.s} ÷ 2 = ${Number(vars.s) / 2}; პატარა რიცხვია ${Number(vars.s) / 2} − 1 = ${answer}.`",
    step=2)

# ================= U17.14: u17-elimination =================
elim_rows = [
    ('მარიამი, ნიკა და თამარი სხვადასხვა ფერის კალამს ხატავენ: წითელი, ლურჯი, მწვანე. მარიამი წითლით არ ხატავს, ნიკა ლურჯით ხატავს. რომელი კალამია მარიამის?', 'მწვანე', 'წითელი', 'ლურჯი', 'ვერ დავადგენთ'),
    ('ანა, ბექა და გიორგი სხვადასხვა ცხოველს ჰყავთ: კატა, ძაღლი, თუთიყუში. ანას კატა არ ჰყავს, ბექას ძაღლი ჰყავს. რა ცხოველი ჰყავს ანას?', 'თუთიყუში', 'კატა', 'ძაღლი', 'ვერ დავადგენთ'),
    ('სამი ბავშვი სხვადასხვა სიმაღლისაა: დაბალი, საშუალო, მაღალი. ლუკა დაბალი არ არის, სანდრო მაღალია. ვინ არის დაბალი?', 'ნინო', 'ლუკა', 'სანდრო', 'ვერ დავადგენთ'),
    ('სამი მოსწავლე სხვადასხვა საგანს უყვარს: მათემატიკა, ხატვა, მუსიკა. დათოს ხატვა არ უყვარს, ლიზის მუსიკა უყვარს. რა უყვარს დათოს?', 'მათემატიკა', 'ხატვა', 'მუსიკა', 'ვერ დავადგენთ'),
    ('სამი ბურთი სხვადასხვა ფერისაა: წითელი, ყვითელი, მწვანე. წითელი ბურთი არ არის უკიდურეს მარცხნივ, ყვითელი შუაშია. რა ფერისაა მარცხენა ბურთი?', 'მწვანე', 'წითელი', 'ყვითელი', 'ვერ დავადგენთ'),
    ('ოთხი მეგობარი სხვადასხვა სახლში ცხოვრობს: 1, 2, 3, 4. ნიკა 1-ში არ ცხოვრობს, ანა მე-4-ში ცხოვრობს, ლუკა მე-2-ში. სად ცხოვრობს ნიკა?', 'მე-3-ში', '1-ში', 'მე-2-ში', 'მე-4-ში'),
]
elim_bank('g4-u17-91', 'u17-elimination', 1, 'ფერი', [
    ('მარიამი', 'ნიკა', 'თამარი', 'წითელი', 'ლურჯი', 'მწვანე'),
    ('ანა', 'ბექა', 'გიორგი', 'თეთრი', 'შავი', 'ნარინჯისფერი'),
    ('ლუკა', 'ნინო', 'დათო', 'ვარდისფერი', 'იისფერი', 'ყავისფერი'),
    ('სანდრო', 'ლიზი', 'ვანო', 'ცისფერი', 'ყვითელი', 'მოწითალო'),
    ('სალომე', 'გიგა', 'ნატა', 'მწვანე', 'ვერცხლისფერი', 'ოქროსფერი'),
    ('ზურა', 'ქეთი', 'ლევანი', 'ლურჯი', 'წითელი', 'შავი'),
    ('ეკა', 'თორნიკე', 'მაკა', 'იისფერი', 'მწვანე', 'ყვითელი'),
    ('ბექა', 'სოფო', 'გოგა', 'თეთრი', 'ნარინჯისფერი', 'ვარდისფერი'),
    ('ანი', 'დიმა', 'ნიკა', 'შავი', 'ცისფერი', 'წითელი'),
    ('ლაშა', 'მაია', 'ზურა', 'ყავისფერი', 'ოქროსფერი', 'მოწითალო'),
    ('გოგა', 'ნატა', 'ვანო', 'ცისფერი', 'ვერცხლისფერი', 'ლურჯი'),
    ('ნიკა', 'სალომე', 'დათო', 'ვარდისფერი', 'წითელი', 'თეთრი'),
    ('მაია', 'ლევანი', 'ანა', 'ყვითელი', 'მწვანე', 'იისფერი'),
    ('თამარი', 'ეკა', 'ბექა', 'ოქროსფერი', 'ნარინჯისფერი', 'შავი'),
    ('ვანო', 'ანი', 'სანდრო', 'მოწითალო', 'ყავისფერი', 'ცისფერი'),
    ('სოფო', 'ლაშა', 'მარიამი', 'წითელი', 'ვერცხლისფერი', 'ლურჯი'),
    ('დიმა', 'გიგა', 'მაკა', 'შავი', 'მწვანე', 'თეთრი'),
    ('ნატა', 'ზურა', 'ნინო', 'იისფერი', 'ვარდისფერი', 'ყვითელი'),
], 3, "პირველი ბავშვი თავის ფერს არ ირჩევს, მეორე კი საკუთარს ირჩევს — გამორიცხვით რჩება ${answer}.")

elim_bank('g4-u17-92', 'u17-elimination', 1, 'ხილი', [
    ('გიორგი', 'თამარი', 'ნიკა', 'ვაშლი', 'მსხალი', 'ბანანი'),
    ('ანა', 'ბექა', 'ლუკა', 'ატამი', 'ალუბალი', 'ყურძენი'),
    ('ნინო', 'დათო', 'სანდრო', 'მარწყვი', 'ლიმონი', 'საზამთრო'),
    ('ლიზი', 'ვანო', 'სალომე', 'ფორთოხალი', 'მანდარინი', 'კივი'),
    ('ქეთი', 'ზურა', 'ლევანი', 'ბანანი', 'ვაშლი', 'მსხალი'),
    ('ეკა', 'გოგა', 'მაკა', 'ყურძენი', 'ატამი', 'ალუბალი'),
    ('ბექა', 'სოფო', 'გიგა', 'საზამთრო', 'მარწყვი', 'ლიმონი'),
    ('ანი', 'დიმა', 'ლაშა', 'კივი', 'ფორთოხალი', 'მანდარინი'),
    ('მაია', 'თორნიკე', 'ნატა', 'ალუბალი', 'ყურძენი', 'ატამი'),
    ('გიგა', 'ეკა', 'ვანო', 'მსხალი', 'ბანანი', 'ვაშლი'),
    ('თამარი', 'ნიკა', 'სოფო', 'ლიმონი', 'კივი', 'მარწყვი'),
    ('დათო', 'ანა', 'ზურა', 'ატამი', 'საზამთრო', 'ალუბალი'),
    ('სანდრო', 'მაია', 'ეკა', 'ვაშლი', 'ფორთოხალი', 'მსხალი'),
    ('ნატა', 'ბექა', 'ლიზი', 'მანდარინი', 'ბანანი', 'კივი'),
    ('ლაშა', 'ქეთი', 'გიგა', 'ყურძენი', 'მარწყვი', 'ატამი'),
    ('ვანო', 'ანი', 'ნინო', 'საზამთრო', 'ალუბალი', 'ლიმონი'),
    ('მაკა', 'გიორგი', 'დიმა', 'მსხალი', 'ვაშლი', 'ბანანი'),
    ('ნიკა', 'სალომე', 'თამარი', 'ფორთოხალი', 'კივი', 'მანდარინი'),
], 3, "ორი ვარიანტი გამოირიცხა, ამიტომ პასუხია ${answer}.")

num('g4-u17-93', 'u17-elimination', 2,
    'სამ ადგილას რიცხვები {x}, {y} და {z} დგას. პირველ ადგილას {x} არ არის, მეორეზე {y} არ არის. რა რიცხვია პირველ ადგილას?',
    [(x, y, z, z if z != x else y) for x, y, z in
     [(1, 2, 3), (2, 3, 4), (3, 4, 5), (4, 5, 6), (5, 6, 7), (6, 7, 8),
      (7, 8, 9), (9, 1, 2), (8, 2, 3), (2, 5, 7), (4, 1, 9), (6, 3, 1),
      (5, 2, 8), (7, 4, 2), (3, 8, 6), (1, 9, 4), (9, 6, 3), (2, 8, 1)]],
    '\n'.join([vn('x', 0), vn('y', 1), vn('z', 2)]), 3,
    "({ vars, answer }) => `პირველ ადგილას ${vars.x} არ არის, მეორეზე ${vars.y} არ არის — გამორიცხვით პირველზე რჩება ${answer}.`")

num('g4-u17-94', 'u17-elimination', 2,
    'ორი ნატურალური რიცხვის ჯამია {s}. რამდენი წყვილია შესაძლებელი, თუ პირველი რიცხვი {a}-ზე მეტია?',
    [(s, a, s - a - 1) for s, a in
     [(10, 2), (12, 3), (15, 4), (20, 5), (18, 6), (25, 7), (30, 8), (14, 5),
      (16, 3), (22, 9), (28, 11), (24, 4), (32, 12), (26, 6), (35, 10),
      (40, 15), (19, 7), (21, 8)]],
    '\n'.join([vn('s', 0), vn('a', 1)]), 2,
    "({ vars, answer }) => `პირველი რიცხვი შეიძლება იყოს ${Number(vars.a) + 1}-დან ${Number(vars.s) - 1}-მდე; ასეთი ${answer} რიცხვია.`")

elim_bank('g4-u17-95', 'u17-elimination', 2, 'სპორტი', [
    ('ანა', 'ბექა', 'გიორგი', 'ფეხბურთი', 'კალათბურთი', 'ჩოგბურთი'),
    ('ლუკა', 'ნინო', 'დათო', 'ცურვა', 'ჭიდაობა', 'ველოსიპედი'),
    ('სანდრო', 'ლიზი', 'ვანო', 'ფრენბურთი', 'ჩოგბურთი', 'ფეხბურთი'),
    ('სალომე', 'გიგა', 'ნატა', 'ცურვა', 'კალათბურთი', 'ჭიდაობა'),
    ('ზურა', 'ქეთი', 'ლევანი', 'ფეხბურთი', 'ფრენბურთი', 'ცურვა'),
    ('ეკა', 'თორნიკე', 'მაკა', 'ველოსიპედი', 'ჩოგბურთი', 'ჭიდაობა'),
    ('ბექა', 'სოფო', 'გოგა', 'კალათბურთი', 'ცურვა', 'ფეხბურთი'),
    ('ანი', 'დიმა', 'ნიკა', 'ჭიდაობა', 'ველოსიპედი', 'ფრენბურთი'),
    ('ლაშა', 'მაია', 'ზურა', 'ჩოგბურთი', 'ფეხბურთი', 'კალათბურთი'),
    ('მაკა', 'გიორგი', 'სოფო', 'ცურვა', 'ფრენბურთი', 'ველოსიპედი'),
    ('ნიკა', 'ეკა', 'დათო', 'ჭიდაობა', 'ცურვა', 'ჩოგბურთი'),
    ('თამარი', 'სანდრო', 'ანა', 'კალათბურთი', 'ფეხბურთი', 'ფრენბურთი'),
    ('გიგა', 'ლიზი', 'ნინო', 'ველოსიპედი', 'ჭიდაობა', 'ცურვა'),
    ('დიმა', 'ვანო', 'სალომე', 'ჩოგბურთი', 'კალათბურთი', 'ფეხბურთი'),
    ('სოფო', 'ლაშა', 'ზურა', 'ფრენბურთი', 'ველოსიპედი', 'ცურვა'),
    ('ნატა', 'გოგა', 'თორნიკე', 'ფეხბურთი', 'ჭიდაობა', 'ჩოგბურთი'),
    ('ქეთი', 'ანი', 'ლევანი', 'ცურვა', 'კალათბურთი', 'ველოსიპედი'),
    ('ლიზი', 'მაკა', 'ბექა', 'ჭიდაობა', 'ფრენბურთი', 'ფეხბურთი'),
], 3, "სამიდან ორი გამოირიცხა, ამიტომ რჩება ${answer}.")

num('g4-u17-96', 'u17-elimination', 3,
    'სამ უჯრაში რიცხვები {x}, {y} და {z} დგას. პირველში {x} არ არის, მესამეში {z} არ არის. რა რიცხვია მეორე უჯრაში?',
    [(x, y, z, y) for x, y, z in
     [(2, 4, 6), (3, 6, 9), (4, 8, 12), (5, 10, 15), (1, 2, 3), (6, 12, 18),
      (7, 14, 21), (8, 16, 24), (9, 18, 27), (2, 6, 10), (3, 9, 15),
      (4, 12, 20), (5, 15, 25), (10, 20, 30), (11, 22, 33), (12, 24, 36),
      (6, 18, 30), (8, 24, 40)]],
    '\n'.join([vn('x', 0), vn('y', 1), vn('z', 2)]), 3,
    "({ vars, answer }) => `პირველში ${vars.x} არ არის, მესამეში ${vars.z} არ არის — მეორე უჯრაში რჩება ${answer}.`")

num('g4-u17-97', 'u17-elimination', 3,
    '{n} ბავშვიდან {k} ტორტს არ ჭამს. რამდენი ბავშვი ჭამს ტორტს?',
    [(n, k, n - k) for n, k in
     [(5, 1), (6, 2), (7, 3), (8, 4), (9, 5), (10, 6), (12, 4), (15, 5),
      (20, 8), (11, 3), (13, 6), (14, 7), (16, 9), (18, 12), (24, 10),
      (25, 13), (30, 17), (35, 19)]],
    '\n'.join([vn('n', 0), vn('k', 1)]), 2,
    "({ vars, answer }) => `${vars.n} − ${vars.k} = ${answer} ბავშვი ჭამს ტორტს.`")

num('g4-u17-98', 'u17-digit-finding', 1,
    'ორნიშნა რიცხვის ათეულების ციფრია {t}, ერთეულებისა კი {u}. რა რიცხვია?',
    [(t, u, t * 10 + u) for t, u in
     [(3, 4), (5, 2), (7, 1), (2, 6), (8, 3), (4, 9), (6, 5), (9, 7), (1, 8),
      (5, 6), (3, 2), (7, 4), (2, 9), (8, 1), (4, 3), (6, 8), (9, 2), (1, 5)]],
    '\n'.join([vn('t', 0), vn('u', 1)]), 2,
    "({ vars, answer }) => `${vars.t} ათეული და ${vars.u} ერთეული = ${answer}.`", step=2)

num('g4-u17-99', 'u17-digit-finding', 1,
    'რიცხვის ციფრთა ჯამია {s}, ხოლო ათეულების ციფრია {t}. იპოვე ერთეულების ციფრი.',
    [(t, s, s - t) for t, s in
     [(3, 7), (5, 9), (7, 8), (2, 6), (8, 12), (4, 11), (6, 10), (9, 14),
      (1, 4), (5, 13), (3, 10), (7, 15), (2, 8), (8, 15), (4, 7), (6, 13),
      (9, 12), (1, 9)]],
    '\n'.join([vn('t', 0), vn('s', 1)]), 2,
    "({ vars, answer }) => `${vars.s} − ${vars.t} = ${answer}.`")

num('g4-u17-100', 'u17-digit-finding', 2,
    'ორნიშნა რიცხვი იწერება ციფრებით {a} და {b}. რამდენია ამ რიცხვის ციფრთა ჯამი?',
    [(a, b, a + b) for a, b in
     [(3, 4), (5, 2), (7, 1), (2, 6), (8, 3), (4, 9), (6, 5), (9, 7), (1, 8),
      (5, 6), (3, 2), (7, 4), (2, 9), (8, 1), (4, 3), (6, 8), (9, 2), (1, 5)]],
    '\n'.join([vn('a', 0), vn('b', 1)]), 2,
    "({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`")

num('g4-u17-101', 'u17-digit-finding', 2,
    'ორნიშნა რიცხვის ციფრთა ჯამია {s}, ციფრთა სხვაობა კი {d}. იპოვე ათეულების ციფრი.',
    [(s, d, (s + d) // 2) for s, d in
     [(3, 1),
     (4, 2),
     (5, 3),
     (6, 4),
     (7, 5),
     (8, 6),
     (9, 7),
     (10, 8),
     (5, 1),
     (6, 2),
     (7, 3),
     (8, 4),
     (9, 5),
     (10, 6),
     (11, 7),
     (7, 1),
     (8, 2),
     (9, 3)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `ათეულების ციფრი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer}.`")

num('g4-u17-102', 'u17-digit-finding', 2,
    'ორნიშნა რიცხვის ციფრთა ჯამია {s}, ციფრთა სხვაობა კი {d}. იპოვე ერთეულების ციფრი.',
    [(s, d, (s - d) // 2) for s, d in
     [(3,1),(4,2),(5,3),(6,4),(7,5),(8,6),(9,7),(10,8),(5,1),(6,2),(7,3),(8,4),(9,5),(10,6),(11,7),(7,1),(8,2),(9,3)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `ერთეულების ციფრი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`")

num('g4-u17-103', 'u17-digit-finding', 3,
    'ორნიშნა რიცხვი იწყება {t}-ით და მისი ციფრთა ჯამია {s}. რა არის ეს რიცხვი?',
    [(t, s, t * 10 + (s - t)) for t, s in
     [(3, 7), (5, 9), (7, 8), (2, 6), (8, 12), (4, 11), (6, 10), (9, 14),
      (1, 4), (5, 13), (3, 10), (7, 15), (2, 8), (8, 15), (4, 7), (6, 13),
      (9, 12), (1, 9)]],
    '\n'.join([vn('t', 0), vn('s', 1)]), 2,
    "({ vars, answer }) => `ათეულების ციფრი ${vars.t}, ერთეულებისა ${Number(vars.s) - Number(vars.t)}; რიცხვია ${answer}.`",
    step=2)

num('g4-u17-104', 'u17-digit-finding', 3,
    'სამნიშნა რიცხვის ასეულებია {h}, ათეულები — {t}, ერთეულები — {u}. რა რიცხვია?',
    [(h, t, u, h * 100 + t * 10 + u) for h, t, u in
     [(1, 2, 3), (2, 3, 4), (3, 4, 5), (4, 5, 6), (5, 6, 7), (6, 7, 8),
      (7, 8, 9), (9, 1, 2), (8, 2, 3), (2, 5, 7), (4, 1, 9), (6, 3, 1),
      (5, 2, 8), (7, 4, 2), (3, 8, 6), (1, 9, 4), (9, 6, 3), (2, 8, 1)]],
    '\n'.join([vn('h', 0), vn('t', 1), vn('u', 2)]), 3,
    "({ vars, answer }) => `${vars.h} ასეული, ${vars.t} ათეული, ${vars.u} ერთეული = ${answer}.`",
    step=10)

num('g4-u17-105', 'u17-digit-finding', 3,
    'ორნიშნა რიცხვის ციფრთა ჯამია {s}. ციფრების ადგილების შეცვლით მიღებული რიცხვი პირველზე {d}-ით მეტია. იპოვე საწყისი რიცხვის ციფრთა სხვაობა.',
    [(s, d, d // 9) for s, d in
     [(3, 9),
     (4, 18),
     (5, 27),
     (6, 36),
     (7, 45),
     (8, 54),
     (9, 63),
     (10, 72),
     (5, 9),
     (6, 18),
     (7, 27),
     (8, 36),
     (9, 45),
     (10, 54),
     (11, 63),
     (7, 9),
     (8, 18),
     (9, 27),
     (10, 36),
     (11, 45)]],
    '\n'.join([vn('s', 0), vn('d', 1)]), 2,
    "({ vars, answer }) => `ციფრების გაცვლა რიცხვს ზრდის 9 × (ციფრთა სხვაობა)-ით, ამიტომ სხვაობაა ${vars.d} ÷ 9 = ${answer}.`")

print(f'Collected {len(templates)} templates')
ts = header + ''.join(templates) + footer
with open('src/practice/templates/g4-u17-logic.ts', 'w', encoding='utf-8') as f:
    f.write(ts)
print(f'Successfully written src/practice/templates/g4-u17-logic.ts with {len(templates)} QuestionTemplate definitions.')
