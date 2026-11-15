#!/usr/bin/env python3
"""Generator script for Grade 4 Unit 13: სიჩქარისა და მანძილის ამოცანები (Speed & Distance)"""
import json

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

export const G4_U13_SUBTOPICS = [
  'u13-distance',
  'u13-duration',
  'u13-speed',
  'u13-speed-time-distance',
] as const;

export type G4U13SubtopicId = (typeof G4_U13_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U13SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-sichkare-mandzili' as const,
  unitId: 'g4-sichkare-mandzili' as const,
  ...options,
});

export const G4_U13_TEMPLATES: QuestionTemplate[] = [
"""

footer = """];
"""

templates = []

def emit_template(tid, subtopic, diff, prompt, vals, vars_extra, ans_code, dist_or_opt_code, expl_code, is_options=False, option_count=None):
    vals_json = json.dumps(vals, ensure_ascii=False)
    opt_key = "options" if is_options else "distractors"
    opt_count_str = f"    optionCount: {option_count},\n" if option_count is not None else ""
    entry = f"""  // {tid} (Level {diff})
  defineTemplate({{
    ...addr({{ id: '{tid}', subtopicId: '{subtopic}', difficulty: {diff} }}),
{opt_count_str}    prompt: '{prompt}',
    variables: {{
      spec: {{
        kind: 'choice',
        values: {vals_json},
      }},
{vars_extra}
    }},
    answer: {ans_code},
    {opt_key}: {dist_or_opt_code},
    explanation: {expl_code},
  }}),
"""
    templates.append(entry)

# ----------------- U13.1: u13-distance -----------------
# Q01: Car distance (e.g. 60 km/h, 3 hrs -> 180 km)
q01_vals = [
  '60|3|180', '50|4|200', '70|2|140', '80|3|240', '40|5|200', '65|2|130',
  '75|3|225', '55|4|220', '90|2|180', '60|4|240', '70|3|210', '50|5|250',
  '80|4|320', '45|3|135', '65|3|195', '75|4|300', '85|2|170', '60|5|300'
]
emit_template('g4-u13-01', 'u13-distance', 1,
  'მანქანა საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში?',
  q01_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `მანძილი = სიჩქარე × დრო: ${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q02: Cyclist distance (e.g. 15 km/h, 4 hrs -> 60 km)
q02_vals = [
  '15|4|60', '12|3|36', '14|2|28', '18|3|54', '20|2|40', '16|3|48',
  '15|3|45', '12|4|48', '14|3|42', '16|4|64', '18|2|36', '20|3|60',
  '15|5|75', '12|5|60', '14|4|56', '16|2|32', '22|2|44', '18|4|72'
]
emit_template('g4-u13-02', 'u13-distance', 1,
  'ველოსიპედისტი საათში {v} კმ-ს გადის. რა მანძილს გაივლის {t} საათში?',
  q02_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `მანძილი = სიჩქარე × დრო: ${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q03: Train distance (e.g. 80 km/h, 5 hrs -> 400 km)
q03_vals = [
  '80|5|400', '70|4|280', '90|3|270', '60|5|300', '75|4|300', '85|3|255',
  '90|4|360', '80|4|320', '70|5|350', '65|4|260', '85|4|340', '95|3|285',
  '100|3|300', '100|4|400', '75|5|375', '80|3|240', '90|5|450', '65|5|325'
]
emit_template('g4-u13-03', 'u13-distance', 2,
  'მატარებელი საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში?',
  q03_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 20, 20)",
  "({ vars, answer }) => `მანძილი = სიჩქარე × დრო: ${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q04: Runner distance in meters (e.g. 200 m/min, 6 mins -> 1200 m)
q04_vals = [
  '200|6|1200', '150|5|750', '250|4|1000', '180|5|900', '220|4|880', '300|3|900',
  '160|6|960', '200|5|1000', '240|5|1200', '250|5|1250', '180|4|720', '210|4|840',
  '200|4|800', '300|4|1200', '150|6|900', '220|5|1100', '190|5|950', '250|6|1500'
]
emit_template('g4-u13-04', 'u13-distance', 2,
  'მორბენალი წუთში {v} მეტრს გადის. რამდენ მეტრს გაივლის {t} წუთში?',
  q04_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 50, 50)",
  "({ vars, answer }) => `მანძილი = ${vars.v} × ${vars.t} = ${answer} მეტრი.`"
)

# Q05: Ship distance (e.g. 25 km/h, 4 hrs -> 100 km)
q05_vals = [
  '25|4|100', '30|3|90', '20|5|100', '35|2|70', '28|3|84', '24|4|96',
  '25|3|75', '30|4|120', '22|4|88', '35|3|105', '26|3|78', '32|3|96',
  '25|5|125', '20|4|80', '30|5|150', '24|5|120', '28|4|112', '32|4|128'
]
emit_template('g4-u13-05', 'u13-distance', 3,
  'გემი საათში {v} კმ-ს გადის. რა მანძილს გაივლის {t} საათში?',
  q05_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `მანძილი = სიჩქარე × დრო: ${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q06: Two-step distance (e.g. in 2 hrs covers 140 km -> in 5 hrs covers 350 km)
q06_vals = [
  '2|140|5|350', '3|180|4|240', '2|120|6|360', '4|200|3|150', '3|210|5|350', '2|160|4|320',
  '2|100|5|250', '3|240|5|400', '4|240|6|360', '2|150|4|300', '3|270|4|360', '4|280|5|350',
  '2|180|3|270', '3|150|6|300', '4|320|5|400', '2|130|4|260', '3|120|5|200', '5|300|4|240'
]
emit_template('g4-u13-06', 'u13-distance', 3,
  'მანქანა {t1} საათში {d1} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t2} საათში, თუ სიჩქარე უცვლელია?',
  q06_vals,
  """      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 20, 20)",
  "({ vars, answer }) => `სიჩქარეა: ${vars.d1} ÷ ${vars.t1} = ${Number(vars.d1) / Number(vars.t1)} კმ/სთ. ${vars.t2} საათში გაივლის: ${Number(vars.d1) / Number(vars.t1)} × ${vars.t2} = ${answer} კმ.`"
)

# ----------------- U13.2: u13-duration -----------------
# Q07: Car duration (e.g. 180 km at 60 km/h -> 3 hrs)
q07_vals = [
  '180|60|3', '200|50|4', '140|70|2', '240|80|3', '200|40|5', '210|70|3',
  '180|90|2', '240|60|4', '250|50|5', '320|80|4', '300|60|5', '360|90|4',
  '280|70|4', '150|50|3', '160|80|2', '350|70|5', '400|80|5', '270|90|3'
]
emit_template('g4-u13-07', 'u13-duration', 1,
  'მანქანამ {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი იმოძრავა?',
  q07_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = მანძილი ÷ სიჩქარე: ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q08: Cyclist duration (e.g. 45 km at 15 km/h -> 3 hrs)
q08_vals = [
  '45|15|3', '60|15|4', '36|12|3', '48|12|4', '42|14|3', '56|14|4',
  '54|18|3', '72|18|4', '40|20|2', '60|20|3', '80|20|4', '48|16|3',
  '64|16|4', '75|15|5', '60|12|5', '32|16|2', '36|18|2', '70|14|5'
]
emit_template('g4-u13-08', 'u13-duration', 1,
  'ველოსიპედისტმა {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი დასჭირდა?',
  q08_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q09: Train duration (e.g. 320 km at 80 km/h -> 4 hrs)
q09_vals = [
  '320|80|4', '400|80|5', '280|70|4', '350|70|5', '270|90|3', '360|90|4',
  '300|60|5', '240|60|4', '450|90|5', '240|80|3', '210|70|3', '180|60|3',
  '400|100|4', '300|100|3', '500|100|5', '480|80|6', '420|70|6', '360|60|6'
]
emit_template('g4-u13-09', 'u13-duration', 2,
  'მატარებელმა {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი იმოძრავა?',
  q09_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q10: Runner duration in minutes (e.g. 1000 m at 200 m/min -> 5 mins)
q10_vals = [
  '1000|200|5', '1200|200|6', '800|200|4', '750|150|5', '900|150|6', '600|150|4',
  '1000|250|4', '1250|250|5', '750|250|3', '900|180|5', '720|180|4', '880|220|4',
  '1100|220|5', '900|300|3', '1200|300|4', '960|160|6', '840|210|4', '1500|250|6'
]
emit_template('g4-u13-10', 'u13-duration', 2,
  'მორბენალმა {d} მეტრი გაირბინა წუთში {v} მეტრის სიჩქარით. რამდენი წუთი დასჭირდა?',
  q10_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} წუთი.`"
)

# Q11: Car duration across longer distance
q11_vals = [
  '240|80|3', '320|80|4', '400|80|5', '210|70|3', '280|70|4', '350|70|5',
  '180|60|3', '240|60|4', '300|60|5', '270|90|3', '360|90|4', '450|90|5',
  '200|50|4', '250|50|5', '300|50|6', '420|70|6', '480|80|6', '360|60|6'
]
emit_template('g4-u13-11', 'u13-duration', 3,
  'მანქანამ {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი დასჭირდა?',
  q11_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q12: Ship duration
q12_vals = [
  '150|30|5', '120|30|4', '90|30|3', '100|25|4', '75|25|3', '125|25|5',
  '80|20|4', '100|20|5', '120|20|6', '140|35|4', '105|35|3', '70|35|2',
  '96|24|4', '120|24|5', '84|28|3', '112|28|4', '96|32|3', '128|32|4'
]
emit_template('g4-u13-12', 'u13-duration', 3,
  'გემმა {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი იმოძრავა?',
  q12_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# ----------------- U13.3: u13-speed -----------------
# Q13: Average speed of car (e.g. 180 km in 3 hrs -> 60 km/h)
q13_vals = [
  '180|3|60', '200|4|50', '140|2|70', '240|3|80', '200|5|40', '130|2|65',
  '210|3|70', '240|4|60', '250|5|50', '320|4|80', '300|5|60', '180|2|90',
  '280|4|70', '150|3|50', '160|2|80', '350|5|70', '400|5|80', '270|3|90'
]
emit_template('g4-u13-13', 'u13-speed', 1,
  'მანქანამ {d} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე (კმ/სთ)?',
  q13_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `სიჩქარე = მანძილი ÷ დრო: ${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`"
)

# Q14: Average speed of cyclist (e.g. 60 km in 4 hrs -> 15 km/h)
q14_vals = [
  '60|4|15', '45|3|15', '36|3|12', '48|4|12', '42|3|14', '56|4|14',
  '54|3|18', '72|4|18', '40|2|20', '60|3|20', '80|4|20', '48|3|16',
  '64|4|16', '75|5|15', '60|5|12', '32|2|16', '36|2|18', '70|5|14'
]
emit_template('g4-u13-14', 'u13-speed', 1,
  'ველოსიპედისტმა {d} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე (კმ/სთ)?',
  q14_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 2, 2)",
  "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`"
)

# Q15: Train speed (e.g. 400 km in 5 hrs -> 80 km/h)
q15_vals = [
  '400|5|80', '320|4|80', '280|4|70', '350|5|70', '270|3|90', '360|4|90',
  '300|5|60', '240|4|60', '450|5|90', '240|3|80', '210|3|70', '180|3|60',
  '400|4|100', '300|3|100', '500|5|100', '480|6|80', '420|6|70', '360|6|60'
]
emit_template('g4-u13-15', 'u13-speed', 2,
  'მატარებელმა {d} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე (კმ/სთ)?',
  q15_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`"
)

# Q16: Runner speed in m/min (e.g. 800 m in 4 mins -> 200 m/min)
q16_vals = [
  '800|4|200', '1000|5|200', '1200|6|200', '750|5|150', '900|6|150', '600|4|150',
  '1000|4|250', '1250|5|250', '750|3|250', '900|5|180', '720|4|180', '880|4|220',
  '1100|5|220', '900|3|300', '1200|4|300', '960|6|160', '840|4|210', '1500|6|250'
]
emit_template('g4-u13-16', 'u13-speed', 2,
  'მორბენალმა {d} მეტრი {t} წუთში გაირბინა. რა იყო მისი საშუალო სიჩქარე მეტრებში წუთში?',
  q16_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${answer} მ/წთ.`"
)

# Q17: Car speed calculation
q17_vals = [
  '210|3|70', '280|4|70', '350|5|70', '180|3|60', '240|4|60', '300|5|60',
  '240|3|80', '320|4|80', '400|5|80', '270|3|90', '360|4|90', '450|5|90',
  '200|4|50', '250|5|50', '300|6|50', '420|6|70', '480|6|80', '360|6|60'
]
emit_template('g4-u13-17', 'u13-speed', 3,
  'მანქანამ {d} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე (კმ/სთ)?',
  q17_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`"
)

# Q18: Ship speed (e.g. 120 km in 4 hrs -> 30 km/h)
q18_vals = [
  '120|4|30', '150|5|30', '90|3|30', '100|4|25', '75|3|25', '125|5|25',
  '80|4|20', '100|5|20', '120|6|20', '140|4|35', '105|3|35', '70|2|35',
  '96|4|24', '120|5|24', '84|3|28', '112|4|28', '96|3|32', '128|4|32'
]
emit_template('g4-u13-18', 'u13-speed', 3,
  'გემმა {d} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე (კმ/სთ)?',
  q18_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 2, 2)",
  "({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`"
)

# ----------------- U13.4: u13-speed-time-distance -----------------
# Q19: Distance from speed and time (70 km/h for 4 hrs -> 280 km)
q19_vals = [
  '70|4|280', '60|5|300', '80|3|240', '90|4|360', '50|6|300', '75|4|300',
  '65|4|260', '85|3|255', '70|3|210', '80|4|320', '90|3|270', '60|4|240',
  '55|4|220', '65|3|195', '75|3|225', '85|2|170', '95|2|190', '50|5|250'
]
emit_template('g4-u13-19', 'u13-speed-time-distance', 1,
  'მანქანა საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში?',
  q19_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `მანძილი = ${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q20: Train in 3 hrs 270 km -> in 5 hrs how much? (450 km)
q20_vals = [
  '3|270|5|450', '2|160|5|400', '4|280|6|420', '3|240|4|320', '2|180|4|360', '3|210|6|420',
  '4|320|5|400', '2|140|6|420', '3|180|5|300', '4|240|5|300', '2|150|5|375', '3|300|4|400',
  '2|120|5|300', '3|150|5|250', '4|360|5|450', '2|170|4|340', '3|240|6|480', '4|320|6|480'
]
emit_template('g4-u13-20', 'u13-speed-time-distance', 1,
  'მატარებელი {t1} საათში {d1} კმ-ს გადის. რა მანძილს გაივლის {t2} საათში, თუ სიჩქარე უცვლელია?',
  q20_vals,
  """      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 20, 20)",
  "({ vars, answer }) => `სიჩქარეა: ${vars.d1} ÷ ${vars.t1} = ${Number(vars.d1) / Number(vars.t1)} კმ/სთ. ${vars.t2} საათში: ${Number(vars.d1) / Number(vars.t1)} × ${vars.t2} = ${answer} კმ.`"
)

# Q21: Cyclist time to cover distance (48 km at 12 km/h -> 4 hrs)
q21_vals = [
  '12|48|4', '15|45|3', '15|60|4', '14|42|3', '14|56|4', '16|48|3',
  '16|64|4', '18|54|3', '18|72|4', '20|60|3', '20|80|4', '12|36|3',
  '12|60|5', '15|75|5', '14|70|5', '16|80|5', '20|100|5', '18|90|5'
]
emit_template('g4-u13-21', 'u13-speed-time-distance', 2,
  'ველოსიპედისტი საათში {v} კმ-ს გადის. რამდენი საათი დასჭირდება {d} კმ-ის გასავლელად?',
  q21_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q22: Car time to cover distance (360 km at 90 km/h -> 4 hrs)
q22_vals = [
  '90|360|4', '80|320|4', '70|280|4', '60|240|4', '90|270|3', '80|240|3',
  '70|210|3', '60|180|3', '90|450|5', '80|400|5', '70|350|5', '60|300|5',
  '100|400|4', '100|300|3', '100|500|5', '75|300|4', '65|260|4', '85|340|4'
]
emit_template('g4-u13-22', 'u13-speed-time-distance', 2,
  'მანქანა საათში {v} კმ-ს გადის. რამდენი საათი დასჭირდება {d} კმ-ის გასავლელად?',
  q22_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `დრო = ${vars.d} ÷ ${vars.v} = ${answer} საათი.`"
)

# Q23: Two cars comparing arrival times
# Car 1: v1, Car 2: v2 (v2 > v1). Distance D.
# t1 = D / v1, t2 = D / v2. Diff = t1 - t2.
# e.g. D = 240, v1 = 60, v2 = 80 => t1 = 4, t2 = 3 => მეორე მანქანა, 1 საათით ადრე
q23_vals = [
  '60|80|240|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე',
  '50|100|200|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '60|90|360|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '70|105|420|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '60|120|240|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '40|60|240|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '50|75|300|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '80|120|480|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '45|90|180|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '50|100|300|მეორე მანქანა, 3 საათით ადრე|პირველი მანქანა, 3 საათით ადრე|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე',
  '60|80|480|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '40|80|240|მეორე მანქანა, 3 საათით ადრე|პირველი მანქანა, 3 საათით ადრე|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე',
  '60|100|300|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '70|140|280|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე|მეორე მანქანა, 1 საათით ადრე|პირველი მანქანა, 1 საათით ადრე',
  '50|100|400|მეორე მანქანა, 4 საათით ადრე|პირველი მანქანა, 4 საათით ადრე|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე',
  '60|120|360|მეორე მანქანა, 3 საათით ადრე|პირველი მანქანა, 3 საათით ადრე|მეორე მანქანა, 2 საათით ადრე|პირველი მანქანა, 2 საათით ადრე'
]
emit_template('g4-u13-23', 'u13-speed-time-distance', 3,
  'ორი მანქანა ერთსა და იმავე {d} კმ მანძილს გადის. პირველი საათში {v1} კმ-ს გადის, მეორე კი საათში {v2} კმ-ს. რომელი მანქანა გაივლის ამ მანძილს უფრო სწრაფად და რამდენი საათით ადრე?',
  q23_vals,
  """      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[6]] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)]",
  "({ vars, answer }) => `პირველს დასჭირდება ${Number(vars.d) / Number(vars.v1)} სთ, მეორეს — ${Number(vars.d) / Number(vars.v2)} სთ. სწორია: ${answer}.`",
  is_options=True
)

# Q24: Bus distance scaling (e.g. in 4 hrs 240 km -> in 6 hrs how much? 360 km)
q24_vals = [
  '4|240|6|360', '3|180|5|300', '2|140|5|350', '3|210|5|350', '4|280|5|350', '2|160|6|480',
  '3|240|6|480', '4|320|6|480', '2|120|7|420', '3|270|5|450', '4|360|5|450', '2|150|6|450',
  '3|180|6|360', '4|240|5|300', '2|130|5|325', '3|150|7|350', '4|200|7|350', '2|170|5|425'
]
emit_template('g4-u13-24', 'u13-speed-time-distance', 3,
  'ავტობუსი {t1} საათში {d1} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t2} საათში, თუ სიჩქარე უცვლელია?',
  q24_vals,
  """      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 20, 20)",
  "({ vars, answer }) => `ავტობუსის სიჩქარეა ${vars.d1} ÷ ${vars.t1} = ${Number(vars.d1) / Number(vars.t1)} კმ/სთ. ${vars.t2} საათში გაივლის: ${Number(vars.d1) / Number(vars.t1)} × ${vars.t2} = ${answer} კმ.`"
)

output = header + "\n".join(templates) + footer
with open('src/practice/templates/g4-u13-speed-distance.ts', 'w') as f:
    f.write(output)
print(f'Successfully written src/practice/templates/g4-u13-speed-distance.ts with {len(templates)} QuestionTemplate definitions.')
