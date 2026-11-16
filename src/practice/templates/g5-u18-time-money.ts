import type { QuestionTemplate } from './types';
import { bank, fourOptions, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 18: დრო და ფული (time and money).
 *
 * Converted from the academy's `U18` bank (10 subtopics × 6 questions).
 *
 * ## One number behind each idea
 *
 * **A time is a count of minutes**, and **a sum of money is a count of თეთრი**.
 * Neither is ever added column-wise. Writing 3:50 + 0:40 as „3 საათი 90 წუთი“
 * is the mistake this unit exists to prevent, so every operation below converts
 * to the small unit first and converts back only to print the answer.
 *
 * ## Two spellings, one value
 *
 * `timeText` prints `HH:MM` because that is how the clock and the timetable read.
 * `spanText` prints „X სთ Y წთ“ because a *duration* is not a time of day: 25
 * hours is „1 დღე 1 სთ“, never „01:00“. Keeping the two apart means an answer
 * key can never confuse 3:15 with a quarter of an hour past three.
 *
 * ## Money never floats
 *
 * Every amount is a whole number of თეთრი, and `lari()` divides only at the end,
 * so 2,50 + 3,80 is exactly 6,30 and never 6,300000000000001.
 */

export const G5_U18_SUBTOPICS = [
  'u18-01',
  'u18-02',
  'u18-03',
  'u18-04',
  'u18-05',
  'u18-06',
  'u18-07',
  'u18-08',
  'u18-09',
  'u18-10',
] as const;

export type G5U18SubtopicId = (typeof G5_U18_SUBTOPICS)[number];

const TOPIC = 'g5-time-money';

const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

/** Minutes since midnight → `HH:MM`. A *time*, not a duration. */
const timeText = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const rest = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

/**
 * A duration → „X სთ Y წთ“ / „X წთ Y წმ“ / „X დღე Y სთ“.
 *
 * `unit` names the pair being shown. Durations carry their own unit words
 * because „1 სთ 15 წთ“ and „01:15“ mean different things on a timetable.
 */
const spanText = (minutes: number, unit: 'hm' | 'ms' | 'dh' = 'hm'): string => {
  if (unit === 'ms') {
    const m = Math.floor(minutes / 60);
    const s = minutes % 60;
    return s === 0 ? `${m} წთ` : `${m} წთ ${s} წმ`;
  }
  if (unit === 'dh') {
    const d = Math.floor(minutes / 24);
    const h = minutes % 24;
    return h === 0 ? `${d} დღე` : `${d} დღე ${h} სთ`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} სთ` : `${h} სთ ${m} წთ`;
};

/** თეთრი → „N ლარი M თეთრი“, with the zero parts dropped. */
const lari = (tetri: number): string => {
  const whole = Math.floor(tetri / 100);
  const rest = tetri % 100;
  if (rest === 0) return `${whole} ლარი`;
  if (whole === 0) return `${rest} თეთრი`;
  return `${whole} ლარი ${rest} თეთრი`;
};

/** თეთრი → `N,MM` — the decimal spelling money uses in writing. */
const lariDecimal = (tetri: number): string => {
  const whole = Math.floor(tetri / 100);
  const rest = tetri % 100;
  return `${whole},${String(rest).padStart(2, '0')}`;
};

export const G5_U18_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U18.1 — დროის ერთეულები ═════════
  bank({
    id: 'g5-u18-q01',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი წუთია {hours} საათში?',
    variables: {
      hours: { kind: 'choice', values: [2, 3, 4, 5, 6, 1, 7, 8, 9, 10, 12] },
    },
    answer: (v) => Number(v.hours) * 60,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.hours) * 60;
      return fourOptions(String(right), [String(Number(v.hours) * 100), String(right + 30), String(right - 30)]);
    },
    explain: ({ vars, answer }) => `1 საათი = 60 წუთი, ამიტომ ${vars.hours} × 60 = ${answer} წუთი.`,
  }),
  bank({
    id: 'g5-u18-q02',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი წამია {minutes} წუთში?',
    variables: {
      minutes: { kind: 'choice', values: [2, 3, 4, 5, 1, 6, 7, 8, 10, 12, 15] },
    },
    answer: (v) => Number(v.minutes) * 60,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.minutes) * 60;
      return fourOptions(String(right), [String(Number(v.minutes) * 100), String(right + 60), String(right - 20)]);
    },
    explain: ({ vars, answer }) => `1 წუთი = 60 წამი, ამიტომ ${vars.minutes} × 60 = ${answer} წამი.`,
  }),
  bank({
    id: 'g5-u18-q03',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი საათია {days} დღეში?',
    variables: {
      days: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 10, 12] },
    },
    answer: (v) => Number(v.days) * 24,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.days) * 24;
      return fourOptions(String(right), [String(Number(v.days) * 12), String(right + 24), String(right - 6)]);
    },
    explain: ({ vars, answer }) => `1 დღე = 24 საათი, ამიტომ ${vars.days} × 24 = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u18-q04',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი დღეა {weeks} კვირაში?',
    variables: {
      weeks: { kind: 'choice', values: [2, 3, 4, 5, 1, 6, 7, 8, 10] },
    },
    answer: (v) => Number(v.weeks) * 7,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.weeks) * 7;
      return fourOptions(String(right), [String(Number(v.weeks) * 5), String(right + 7), String(right - 2)]);
    },
    explain: ({ vars, answer }) => `1 კვირა = 7 დღე, ამიტომ ${vars.weeks} × 7 = ${answer} დღე.`,
  }),
  bank({
    id: 'g5-u18-q05',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი წუთია {hours} საათი და {minutes} წუთი?',
    variables: {
      spec: { kind: 'choice', values: ['2|25', '3|15', '1|40', '4|10', '2|50', '5|20', '3|45', '1|55', '6|30', '2|5', '4|35', '3|8'] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.hours) * 60 + Number(v.minutes),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [h, m] = [Number(v.hours), Number(v.minutes)];
      return fourOptions(String(h * 60 + m), [String(h * 100 + m), String(h * 60), String(h * 60 + m + 10)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.hours} × 60 = ${Number(vars.hours) * 60}, დამატებული ${vars.minutes} → ${answer} წუთი.`,
  }),
  bank({
    id: 'g5-u18-q06',
    subtopicId: 'u18-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{minutes} წუთი და {seconds} წამი სულ რამდენი წამია?',
    variables: {
      spec: { kind: 'choice', values: ['3|20', '2|45', '4|15', '1|50', '5|30', '2|15', '6|40', '3|5'] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      seconds: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.minutes) * 60 + Number(v.seconds),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [m, s] = [Number(v.minutes), Number(v.seconds)];
      return fourOptions(String(m * 60 + s), [String(m * 100 + s), String(m * 60), String(m * 60 + s + 5)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.minutes} × 60 = ${Number(vars.minutes) * 60}, დამატებული ${vars.seconds} → ${answer} წამი.`,
  }),

  // ═════════ U18.2 — მოქმედებები დროზე ═════════
  bank({
    id: 'g5-u18-q07',
    subtopicId: 'u18-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{h1} სთ {m1} წთ + {h2} სთ {m2} წთ = ?',
    hint: 'ჯერ წუთები შეკრიბე; თუ 60-ს გადააჭარბა, 60 წუთი = 1 საათი.',
    variables: {
      spec: { kind: 'choice', values: ['2|30|1|45', '3|15|1|20', '1|40|2|35', '2|50|1|25', '4|10|2|30', '3|45|1|30'] },
      h1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      m1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      h2: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      m2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      total: {
        kind: 'choice',
        values: (v) => [(at(v.spec, 0) + at(v.spec, 2)) * 60 + at(v.spec, 1) + at(v.spec, 3)],
      },
    },
    answer: (v) => spanText(Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(spanText(total), [
        spanText(total + 30),
        spanText(total - 10),
        spanText((Number(v.h1) + Number(v.h2)) * 60 + Math.abs(Number(v.m1) - Number(v.m2))),
      ]);
    },
    explain: ({ vars, answer }) =>
      `წუთები: ${vars.m1} + ${vars.m2} = ${Number(vars.m1) + Number(vars.m2)}; საათები: ${vars.h1} + ${vars.h2}. სულ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q08',
    subtopicId: 'u18-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{h1} სთ {m1} წთ − {h2} სთ {m2} წთ = ?',
    hint: 'თუ წუთები არ კმარა, 1 საათი ისესხე: 1 სთ = 60 წთ.',
    variables: {
      spec: { kind: 'choice', values: ['5|15|2|30', '4|10|1|45', '6|20|2|35', '5|50|2|55', '7|5|3|40', '4|25|1|50'] },
      h1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      m1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      h2: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      m2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      total: {
        kind: 'choice',
        values: (v) => [(at(v.spec, 0) - at(v.spec, 2)) * 60 + at(v.spec, 1) - at(v.spec, 3)],
      },
    },
    answer: (v) => spanText(Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(spanText(total), [
        spanText(total + 25),
        spanText(total - 15),
        spanText(Math.abs(Number(v.h1) - Number(v.h2)) * 60 + Math.abs(Number(v.m1) - Number(v.m2))),
      ]);
    },
    explain: ({ vars, answer }) =>
      `წუთებად: ${Number(vars.h1) * 60 + Number(vars.m1)} − ${Number(vars.h2) * 60 + Number(vars.m2)} = ${Number(vars.total)} წუთი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q09',
    subtopicId: 'u18-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{h} სთ-ს დაემატა {added} წუთი. რა დრო გამოვიდა?',
    variables: {
      spec: { kind: 'choice', values: ['2|45', '3|50', '1|75', '4|40', '5|35', '2|90', '6|25', '3|120'] },
      h: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      added: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1)] },
    },
    answer: (v) => spanText(Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(spanText(total), [
        spanText(Number(v.h) * 60 + Number(v.added) - 60),
        spanText(total + 20),
        spanText(Number(v.h) * 60 + Math.floor(Number(v.added) / 10)),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.h} სთ = ${Number(vars.h) * 60} წთ; + ${vars.added} = ${vars.total} წთ, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q10',
    subtopicId: 'u18-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{hours} სთ {minutes} წთ, დამატებული კიდევ {extra} წუთი. რა დრო გამოვიდა?',
    variables: {
      spec: { kind: 'choice', values: ['2|40|30', '3|25|50', '1|50|25', '4|15|45', '2|55|20', '5|40|35'] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      extra: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1) + at(v.spec, 2)],
      },
    },
    answer: (v) => spanText(Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(spanText(total), [
        spanText(total - 30),
        spanText(Number(v.hours) * 60 + Number(v.minutes) + 60),
        spanText(total + 45),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${Number(vars.hours) * 60 + Number(vars.minutes)} + ${vars.extra} = ${vars.total} წუთი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q11',
    subtopicId: 'u18-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{days} დღე {hours} სთ, დამატებული კიდევ {extra} სთ. რა დრო გამოვიდა?',
    variables: {
      spec: { kind: 'choice', values: ['1|18|8', '2|10|15', '1|5|20', '3|12|13', '2|20|5', '1|22|4'] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      extra: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) * 24 + at(v.spec, 1) + at(v.spec, 2)],
      },
    },
    answer: (v) => spanText(Number(v.total), 'dh'),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(spanText(total, 'dh'), [
        spanText(Number(v.days) * 24 + Number(v.hours) + 24, 'dh'),
        spanText(total - 12, 'dh'),
        spanText(Number(v.days) * 24 + Number(v.extra), 'dh'),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${Number(vars.days) * 24 + Number(vars.hours)} + ${vars.extra} = ${vars.total} საათი, ანუ ${answer}.`,
  }),

  // ═════════ U18.3 — გატარებული დრო ═════════
  bank({
    id: 'g5-u18-q12',
    subtopicId: 'u18-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გაკვეთილი დაიწყო {start}-ზე და დასრულდა {end}-ზე. რამდენი ხანი გაგრძელდა გაკვეთილი?',
    variables: {
      spec: { kind: 'choice', values: ['9|00|10|45', '10|10|10|55', '11|30|13|15', '8|45|9|30', '12|20|13|55', '14|05|15|40'] },
      start: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      end: { kind: 'choice', values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))] },
      span: {
        kind: 'choice',
        values: (v) => [(at(v.spec, 2) * 60 + at(v.spec, 3)) - (at(v.spec, 0) * 60 + at(v.spec, 1))],
      },
    },
    answer: (v) => spanText(Number(v.span)),
    format: { kind: 'text' },
    options: (v) => {
      const span = Number(v.span);
      return fourOptions(spanText(span), [spanText(span + 15), spanText(span - 10), spanText(span + 45)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.end} − ${vars.start} = ${vars.span} წუთი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q13',
    subtopicId: 'u18-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მატარებელი გავიდა {start}-ზე და ჩამოვიდა {end}-ზე. რამდენი ხანი იყო გზაში?',
    variables: {
      spec: { kind: 'choice', values: ['8|15|9|00', '10|40|11|25', '7|50|9|35', '12|05|13|50', '9|20|10|05', '15|30|17|15'] },
      start: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      end: { kind: 'choice', values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))] },
      span: {
        kind: 'choice',
        values: (v) => [(at(v.spec, 2) * 60 + at(v.spec, 3)) - (at(v.spec, 0) * 60 + at(v.spec, 1))],
      },
    },
    answer: (v) => spanText(Number(v.span)),
    format: { kind: 'text' },
    options: (v) => {
      const span = Number(v.span);
      return fourOptions(spanText(span), [spanText(span + 20), spanText(span - 25), spanText(span + 60)]);
    },
    explain: ({ vars, answer }) => `${vars.end} − ${vars.start} = ${vars.span} წუთი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q14',
    subtopicId: 'u18-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფილმი გრძელდება {hours} სთ {minutes} წთ. ის დაიწყო {start}-ზე. რომელ საათზე დასრულდება?',
    variables: {
      spec: { kind: 'choice', values: ['1|45|14|20', '2|10|16|05', '1|30|18|40', '2|25|19|15', '1|55|20|30', '2|40|13|50'] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      start: {
        kind: 'choice',
        values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))],
      },
      endMin: {
        kind: 'choice',
        values: (v) => [at(v.spec, 2) * 60 + at(v.spec, 3) + at(v.spec, 0) * 60 + at(v.spec, 1)],
      },
    },
    answer: (v) => timeText(Number(v.endMin)),
    format: { kind: 'text' },
    options: (v) => {
      const end = Number(v.endMin);
      return fourOptions(timeText(end), [timeText(end + 10), timeText(end - 15), timeText(end + 60)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.start} + ${vars.hours} სთ ${vars.minutes} წთ = ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q15',
    subtopicId: 'u18-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამუშაო დაიწყო {start}-ზე და დასრულდა {end}-ზე. იყო {pause} წუთი შესვენება. რამდენი ხანი იმუშავეს ფაქტობრივად?',
    hint: 'ჯერ იპოვე სულ გასული დრო, შემდეგ გამოაკელი შესვენება.',
    variables: {
      spec: { kind: 'choice', values: ['9|00|12|00|30', '10|15|13|45|45', '8|30|11|10|20', '14|00|17|30|40', '9|40|12|25|25'] },
      start: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      startMin: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1)] },
      end: { kind: 'choice', values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))] },
      endMin: { kind: 'choice', values: (v) => [at(v.spec, 2) * 60 + at(v.spec, 3)] },
      pause: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      worked: { kind: 'choice', values: (v) => [at(v.spec, 2) * 60 + at(v.spec, 3) - at(v.spec, 0) * 60 - at(v.spec, 1) - at(v.spec, 4)] },
    },
    answer: (v) => spanText(Number(v.worked)),
    format: { kind: 'text' },
    options: (v) => {
      const worked = Number(v.worked);
      return fourOptions(spanText(worked), [spanText(worked + Number(v.pause)), spanText(worked - 15), spanText(worked + 20)]);
    },
    explain: ({ vars, answer }) =>
      `სულ: ${vars.end} − ${vars.start} = ${Number(vars.endMin) - Number(vars.startMin)} წთ; გამოკლებული ${vars.pause} → ${vars.worked} წთ, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q16',
    subtopicId: 'u18-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ავტობუსი გაჩერებულიდან გავიდა {start}-ზე და {span} წუთის შემდეგ ჩამოვიდა. რომელ საათზე ჩამოვიდა?',
    variables: {
      spec: { kind: 'choice', values: ['11|25|50', '9|40|35', '13|10|65', '16|50|40', '7|55|70', '12|45|30'] },
      start: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      span: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      arrive: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1) + at(v.spec, 2)] },
    },
    answer: (v) => timeText(Number(v.arrive)),
    format: { kind: 'text' },
    options: (v) => {
      const arrive = Number(v.arrive);
      return fourOptions(timeText(arrive), [timeText(arrive - 10), timeText(arrive + 15), timeText(arrive + 60)]);
    },
    explain: ({ vars, answer }) => `${vars.start} + ${vars.span} წთ = ${answer}.`,
  }),

  // ═════════ U18.4 — დროის ღერძი ═════════
  bank({
    id: 'g5-u18-q17',
    subtopicId: 'u18-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'საათი აჩვენებს {from}-ს. {minutes} წუთის შემდეგ რა დრო იქნება?',
    variables: {
      spec: { kind: 'choice', values: ['9|30|15', '10|20|25', '14|45|10', '7|05|40', '18|50|20', '11|35|35', '16|15|45', '8|55|30'] },
      from: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      to: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1) + at(v.spec, 2)] },
    },
    answer: (v) => timeText(Number(v.to)),
    format: { kind: 'text' },
    options: (v) => {
      const to = Number(v.to);
      return fourOptions(timeText(to), [timeText(to + 10), timeText(to - 15), timeText(to + 60)]);
    },
    explain: ({ vars, answer }) => `${vars.from} + ${vars.minutes} წუთი = ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q18',
    subtopicId: 'u18-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'საათი აჩვენებს {from}-ს. {minutes} წუთით ადრე რა დრო იყო?',
    variables: {
      spec: { kind: 'choice', values: ['9|15|25', '11|40|50', '15|20|35', '8|05|15', '19|30|45', '13|50|20', '10|10|40', '17|25|55'] },
      from: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      minutes: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      to: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1) - at(v.spec, 2)] },
    },
    answer: (v) => timeText(Number(v.to)),
    format: { kind: 'text' },
    options: (v) => {
      const to = Number(v.to);
      return fourOptions(timeText(to), [timeText(to + 20), timeText(to - 10), timeText(to + 60)]);
    },
    explain: ({ vars, answer }) => `${vars.from} − ${vars.minutes} წუთი = ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q19',
    subtopicId: 'u18-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{from}-დან {to}-მდე რამდენი წუთია?',
    variables: {
      spec: { kind: 'choice', values: ['9|50|10|35', '11|20|12|15', '14|40|15|25', '8|15|8|55', '16|30|17|10', '12|45|13|30'] },
      from: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      to: { kind: 'choice', values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))] },
      span: { kind: 'choice', values: (v) => [at(v.spec, 2) * 60 + at(v.spec, 3) - at(v.spec, 0) * 60 - at(v.spec, 1)] },
    },
    answer: (v) => String(v.span),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const span = Number(v.span);
      return fourOptions(String(span), [String(span + 10), String(Math.abs(span - 15)), String(span + 25)]);
    },
    explain: ({ vars, answer }) => `${vars.to} − ${vars.from} = ${answer} წუთი.`,
  }),
  bank({
    id: 'g5-u18-q20',
    subtopicId: 'u18-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'საათი აჩვენებს {from}-ს. {hours} საათის შემდეგ რა დრო იქნება?',
    variables: {
      spec: { kind: 'choice', values: ['9|20|3', '14|40|5', '7|15|4', '18|30|2', '11|50|6', '16|05|3', '8|25|7', '13|35|4'] },
      from: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      to: { kind: 'choice', values: (v) => [at(v.spec, 0) * 60 + at(v.spec, 1) + at(v.spec, 2) * 60] },
    },
    answer: (v) => timeText(Number(v.to)),
    format: { kind: 'text' },
    options: (v) => {
      const to = Number(v.to);
      return fourOptions(timeText(to), [timeText(to + 30), timeText(to - 60), timeText(at(v.spec, 0) * 60 + at(v.spec, 1) + Number(v.hours))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.from} + ${vars.hours} სთ = ${answer} (${vars.hours} სთ = ${Number(vars.hours) * 60} წთ).`,
  }),
  bank({
    id: 'g5-u18-q21',
    subtopicId: 'u18-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ავტობუსი გაჩერდა {from}-ზე, შემდეგი კი — {to}-ზე. რამდენ ხანს გაგრძელდა შესვენება წუთებში?',
    variables: {
      spec: { kind: 'choice', values: ['8|45|9|10', '12|30|12|55', '15|05|15|35', '10|20|10|50', '17|40|18|05'] },
      from: { kind: 'choice', values: (v) => [timeText(at(v.spec, 0) * 60 + at(v.spec, 1))] },
      to: { kind: 'choice', values: (v) => [timeText(at(v.spec, 2) * 60 + at(v.spec, 3))] },
      span: { kind: 'choice', values: (v) => [at(v.spec, 2) * 60 + at(v.spec, 3) - at(v.spec, 0) * 60 - at(v.spec, 1)] },
    },
    answer: (v) => String(v.span),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const span = Number(v.span);
      return fourOptions(String(span), [String(span + 5), String(span - 5), String(span + 15)]);
    },
    explain: ({ vars, answer }) => `${vars.to} − ${vars.from} = ${answer} წუთი.`,
  }),

  // ═════════ U18.5 — ფულადი ერთეულები ═════════
  bank({
    id: 'g5-u18-q22',
    subtopicId: 'u18-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{lariCount} ლარი რამდენი თეთრია?',
    variables: {
      lariCount: { kind: 'choice', values: [2, 3, 4, 5, 7, 8, 10, 12, 6, 9, 15] },
    },
    answer: (v) => Number(v.lariCount) * 100,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.lariCount) * 100;
      return fourOptions(String(right), [String(Number(v.lariCount) * 10), String(right + 50), String(right - 100)]);
    },
    explain: ({ vars, answer }) => `1 ლარი = 100 თეთრი, ამიტომ ${vars.lariCount} × 100 = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q23',
    subtopicId: 'u18-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{lariCount} ლარი და {tetri} თეთრი სულ რამდენი თეთრია?',
    variables: {
      spec: { kind: 'choice', values: ['8|50', '5|25', '12|40', '3|75', '20|5', '7|90', '4|60', '15|15'] },
      lariCount: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tetri: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.lariCount) * 100 + Number(v.tetri),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.lariCount) * 100 + Number(v.tetri);
      return fourOptions(String(right), [String(Number(v.lariCount) * 10 + Number(v.tetri)), String(right + 50), String(right - 25)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.lariCount} × 100 = ${Number(vars.lariCount) * 100}, დამატებული ${vars.tetri} → ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q24',
    subtopicId: 'u18-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{tetri} თეთრი რამდენი ლარი და რამდენი თეთრია?',
    variables: {
      tetri: { kind: 'choice', values: [450, 320, 780, 1250, 660, 905, 2080, 1500, 230, 1740, 510, 360] },
    },
    answer: (v) => lari(Number(v.tetri)),
    format: { kind: 'text' },
    options: (v) => {
      const t = Number(v.tetri);
      return fourOptions(lari(t), [lari(t + 100), lari(Math.max(100, t - 100)), lari(t + 10)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.tetri} თეთრი = ${Math.floor(Number(vars.tetri) / 100)} ლარი და ${Number(vars.tetri) % 100} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q25',
    subtopicId: 'u18-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{tetri} თეთრი ლარში ათწილადად ჩაწერე (მაგალითად: 3,50).',
    variables: {
      tetri: { kind: 'choice', values: [508, 750, 1240, 305, 1990, 425, 860, 60, 2350, 1105, 640, 275] },
    },
    answer: (v) => lariDecimal(Number(v.tetri)),
    format: { kind: 'text' },
    options: (v) => {
      const t = Number(v.tetri);
      return fourOptions(lariDecimal(t), [lariDecimal(t + 100), lariDecimal(t + 10), lariDecimal(Math.max(5, t - 100))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.tetri} თეთრი = ${Math.floor(Number(vars.tetri) / 100)} ლარი და ${Number(vars.tetri) % 100} თეთრი, ანუ ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u18-q26',
    subtopicId: 'u18-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{lariCount} ლარი {tetri} თეთრი — ეს არის {totalTetri} თეთრი. რამდენი თეთრი აკლია {nextLari} ლარს?',
    variables: {
      spec: { kind: 'choice', values: ['3|40|4', '5|25|6', '2|75|3', '8|60|9', '7|15|8', '4|90|5', '6|30|7', '1|45|2'] },
      lariCount: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tetri: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      nextLari: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      totalTetri: { kind: 'choice', values: (v) => [at(v.spec, 0) * 100 + at(v.spec, 1)] },
      missing: {
        kind: 'choice',
        values: (v) => [at(v.spec, 2) * 100 - (at(v.spec, 0) * 100 + at(v.spec, 1))],
      },
    },
    answer: (v) => String(v.missing),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const missing = Number(v.missing);
      return fourOptions(String(missing), [String(missing + 10), String(missing + 100), String(Math.max(5, missing - 15))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.nextLari} ლარი = ${Number(vars.nextLari) * 100} თეთრი; ${Number(vars.nextLari) * 100} − ${vars.totalTetri} = ${answer} თეთრი.`,
  }),

  // ═════════ U18.6 — ხურდის დათვლა ═════════
  bank({
    id: 'g5-u18-q27',
    subtopicId: 'u18-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'საქონელი ღირს {price} თეთრი. მყიდველმა გადაიხადა {paid} თეთრი. რამდენი ხურდა უნდა დაუბრუნონ?',
    variables: {
      spec: { kind: 'choice', values: ['160|200', '230|300', '125|150', '480|500', '95|100', '270|300', '360|400', '185|200'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => String(Number(v.paid) - Number(v.price)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const change = Number(v.paid) - Number(v.price);
      return fourOptions(String(change), [String(change + 10), String(change + 100), String(Math.max(5, change - 5))]);
    },
    explain: ({ vars, answer }) => `${vars.paid} − ${vars.price} = ${answer} თეთრი ხურდა.`,
  }),
  bank({
    id: 'g5-u18-q28',
    subtopicId: 'u18-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წიგნი ღირს {a} თეთრი, რვეული — {b} თეთრი. მყიდველმა გადაიხადა {paid} თეთრი. რამდენი ხურდა უნდა დაუბრუნონ?',
    variables: {
      spec: { kind: 'choice', values: ['250|180|500', '340|120|500', '175|225|400', '430|270|700', '290|160|500', '320|240|600', '145|215|400'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      change: { kind: 'choice', values: (v) => [at(v.spec, 2) - at(v.spec, 0) - at(v.spec, 1)] },
    },
    answer: (v) => String(v.change),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const change = Number(v.change);
      return fourOptions(String(change), [String(change + 20), String(change + 100), String(Number(v.a) + Number(v.b))]);
    },
    explain: ({ vars, answer }) =>
      `ღირებულება ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; ხურდა ${vars.paid} − ${Number(vars.a) + Number(vars.b)} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q29',
    subtopicId: 'u18-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მაღაზიაში საქონელი ღირს {price} თეთრი. მყიდველმა გადაიხადა {paid} თეთრი. რამდენი ხურდა უნდა დაუბრუნონ, თუ გამყიდველმა დამატებით {extra} თეთრი ფასდაკლება გააკეთა?',
    hint: 'ჯერ გამოაკელი ფასდაკლება, შემდეგ გამოთვალე ხურდა.',
    variables: {
      spec: { kind: 'choice', values: ['420|500|45', '380|500|30', '275|400|25', '620|700|60', '150|200|15', '540|600|40'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      extra: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => String(Number(v.paid) - Number(v.price) + Number(v.extra)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const change = Number(v.paid) - Number(v.price) + Number(v.extra);
      return fourOptions(String(change), [
        String(Number(v.paid) - Number(v.price)),
        String(change + 10),
        String(change - 5 > 0 ? change - 5 : change + 25),
      ]);
    },
    explain: ({ vars, answer }) =>
      `ფასდაკლების შემდეგ ღირებულება ${Number(vars.price) - Number(vars.extra)}; ხურდა ${vars.paid} − ${Number(vars.price) - Number(vars.extra)} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q30',
    subtopicId: 'u18-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი საქონელი ღირს {a} თეთრი და {b} თეთრი. მყიდველს აქვს {paid} თეთრი. რამდენი თეთრი დარჩება მას?',
    variables: {
      spec: { kind: 'choice', values: ['680|1250|1500', '930|480|1500', '325|450|800', '1150|740|2000', '270|680|1000', '845|555|1500'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      left: { kind: 'choice', values: (v) => [at(v.spec, 2) - at(v.spec, 0) - at(v.spec, 1)] },
    },
    answer: (v) => String(v.left),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const left = Number(v.left);
      return fourOptions(String(left), [String(left + 50), String(left + 100), String(Number(v.a) + Number(v.b))]);
    },
    explain: ({ vars, answer }) =>
      `სულ დაიხარჯა ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; დარჩა ${vars.paid} − ${Number(vars.a) + Number(vars.b)} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q31',
    subtopicId: 'u18-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'საქონლის ფასი {price} თეთრია. მყიდველმა გადაიხადა {paid} თეთრი და ხურდაში მიიღო მონეტები. რომელი მონეტებით შეიძლება ხურდის ზუსტად გაცემა?',
    hint: 'ხურდა უნდა იყოს ზუსტად {paid} − {price} თეთრი.',
    variables: {
      spec: { kind: 'choice', values: ['340|400|60', '270|300|30', '480|500|20', '125|200|75', '660|700|40', '190|250|60'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      change: { kind: 'choice', values: (v) => [at(v.spec, 1) - at(v.spec, 0)] },
    },
    answer: (v) => String(v.change),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const change = Number(v.change);
      return fourOptions(String(change), [String(change + 10), String(change - 20 > 0 ? change - 20 : change + 30), String(change + 5)]);
    },
    explain: ({ vars, answer }) => `ხურდა = ${vars.paid} − ${vars.price} = ${answer} თეთრი.`,
  }),

  // ═════════ U18.7 — მოქმედებები თანხებზე ═════════
  bank({
    id: 'g5-u18-q32',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{a} თეთრი + {b} თეთრი = ?',
    variables: {
      spec: { kind: 'choice', values: ['350|425', '680|245', '1290|870', '410|590', '305|715', '1560|380', '225|640', '980|95'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.a) + Number(v.b)),
    format: { kind: 'text' },
    options: (v) => {
      const sum = Number(v.a) + Number(v.b);
      return fourOptions(lari(sum), [lari(sum + 100), lari(sum + 10), lari(sum - 50)]);
    },
    explain: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q33',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{a} თეთრი − {b} თეთრი = ?',
    variables: {
      spec: { kind: 'choice', values: ['1250|480', '900|275', '2040|660', '750|320', '1800|125', '640|95'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.a) - Number(v.b)),
    format: { kind: 'text' },
    options: (v) => {
      const diff = Number(v.a) - Number(v.b);
      return fourOptions(lari(diff), [lari(diff + 100), lari(diff + 50), lari(diff - 20)]);
    },
    explain: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q34',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{count} ცალი საქონელი თითო {price} თეთრად. რამდენი ღირს სულ?',
    variables: {
      spec: { kind: 'choice', values: ['3|250', '5|180', '4|325', '6|125', '7|240', '8|150', '2|475', '9|110'] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.count) * Number(v.price)),
    format: { kind: 'text' },
    options: (v) => {
      const [count, price] = [Number(v.count), Number(v.price)];
      return fourOptions(lari(count * price), [lari(count * price + 100), lari(count * price - 50), lari(price + count)]);
    },
    explain: ({ vars, answer }) => `${vars.count} × ${vars.price} = ${Number(vars.count) * Number(vars.price)} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q35',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{total} თეთრი თანაბრად გაიყო {people} ადამიანზე. რამდენი თეთრი მოიცა თითოეულმა?',
    variables: {
      spec: { kind: 'choice', values: ['1250|5', '960|4', '1800|6', '1470|7', '2040|8', '2250|9', '630|3'] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      people: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      each: { kind: 'choice', values: (v) => [at(v.spec, 0) / at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.each)),
    format: { kind: 'text' },
    options: (v) => {
      const each = Number(v.each);
      return fourOptions(lari(each), [lari(each + 100), lari(each + 50), lari(each - 25)]);
    },
    explain: ({ vars, answer }) => `${vars.total} ÷ ${vars.people} = ${vars.each} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q36',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მაღაზიამ დღის განმავლობაში გაყიდა {a} თეთრის და {b} თეთრის საქონელი. დარჩა {c} თეთრის საქონელი. რა იყო დილით საქონლის საერთო ღირებულება?',
    variables: {
      spec: { kind: 'choice', values: ['2450|1800|1200', '3600|2750|900', '1250|3400|1500', '4800|2150|600', '2750|1650|800'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0) + at(v.spec, 1) + at(v.spec, 2)] },
    },
    answer: (v) => lari(Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(lari(total), [lari(total + 100), lari(total - 150), lari(Number(v.a) + Number(v.b))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${vars.total} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q37',
    subtopicId: 'u18-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ერთი კილოგრამი ღირს {price} თეთრი. იყიდეს {grams} გრამი. რამდენი გადაიხადეს?',
    hint: '{grams} გრამი არის {grams} / 1000 კილოგრამი.',
    variables: {
      spec: { kind: 'choice', values: ['600|500', '450|200', '800|250', '320|500', '750|400', '560|250', '900|300'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      grams: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      cost: { kind: 'choice', values: (v) => [(at(v.spec, 0) * at(v.spec, 1)) / 1000] },
    },
    answer: (v) => lari(Number(v.cost)),
    format: { kind: 'text' },
    options: (v) => {
      const cost = Number(v.cost);
      return fourOptions(lari(cost), [lari(cost * 2), lari(cost + 100), lari(Number(v.price))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.grams} გრამი = ${Number(vars.grams) / 1000} კგ; ${vars.price} × ${Number(vars.grams) / 1000} = ${vars.cost} თეთრი, ანუ ${answer}.`,
  }),

  // ═════════ U18.8 — საკმარისი ფული ═════════
  bank({
    id: 'g5-u18-q38',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ლუკას აქვს {have} თეთრი. სათამაშო ღირს {price} თეთრი. რამდენი თეთრი დარჩება მას სათამაშოს ყიდვის შემდეგ?',
    variables: {
      spec: { kind: 'choice', values: ['500|320', '400|175', '750|480', '300|260', '1000|640', '650|225', '800|540'] },
      have: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => String(Number(v.have) - Number(v.price)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const left = Number(v.have) - Number(v.price);
      return fourOptions(String(left), [String(left + 10), String(left + 100), String(Math.max(5, left - 25))]);
    },
    explain: ({ vars, answer }) => `${vars.have} − ${vars.price} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q39',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ანას აქვს {have} თეთრი. მას სურს იყიდოს ორი ნივთი, რომლებიც ღირს {a} და {b} თეთრი. რამდენი თეთრი დარჩება მას?',
    variables: {
      spec: { kind: 'choice', values: ['900|320|275', '1500|640|580', '700|225|190', '1200|450|390', '2000|750|880', '850|315|260'] },
      have: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      left: { kind: 'choice', values: (v) => [at(v.spec, 0) - at(v.spec, 1) - at(v.spec, 2)] },
    },
    answer: (v) => String(v.left),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const left = Number(v.left);
      return fourOptions(String(left), [String(left + 25), String(left + 100), String(Number(v.a) + Number(v.b))]);
    },
    explain: ({ vars, answer }) =>
      `ღირებულება ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; დარჩა ${vars.have} − ${Number(vars.a) + Number(vars.b)} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q40',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნინოს აქვს {have} თეთრი. მას სურს იყიდოს ორი ნივთი, რომლებიც ღირს {a} და {b} თეთრი. ეყოფა თუ არა მას ფული?',
    hint: 'შეადარე ხელთ არსებული თანხა საერთო ღირებულებას.',
    variables: {
      spec: { kind: 'choice', values: ['500|320|250', '700|450|300', '900|500|450', '600|275|310', '400|215|180', '1000|640|400', '550|300|290'] },
      have: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      verdict: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) >= at(v.spec, 1) + at(v.spec, 2) ? 'კი, ეყოფა' : 'არა, არ ეყოფა'],
      },
      gap: {
        kind: 'choice',
        values: (v) => [Math.abs(at(v.spec, 0) - at(v.spec, 1) - at(v.spec, 2))],
      },
    },
    answer: (v) => String(v.verdict),
    format: { kind: 'text' },
    options: () => ['კი, ეყოფა', 'არა, არ ეყოფა'],
    optionCount: 2,
    explain: ({ vars, answer }) => {
      const need = Number(vars.a) + Number(vars.b);
      return answer.startsWith('კი')
        ? `საჭიროა ${need} თეთრი, ხელთ არის ${vars.have}; ${vars.have} ≥ ${need}, ამიტომ ${answer} (დარჩება ${Number(vars.have) - need} თეთრი).`
        : `საჭიროა ${need} თეთრი, ხელთ არის ${vars.have}; აკლია ${need - Number(vars.have)} თეთრი — ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u18-q41',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ბილეთი ღირს {price} თეთრი. გიორგის აქვს {have} თეთრი. რამდენი ბილეთის ყიდვა შეუძლია მას?',
    variables: {
      spec: { kind: 'choice', values: ['250|1000', '320|1500', '180|800', '450|2000', '275|900', '360|1200', '125|700'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      have: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      tickets: { kind: 'choice', values: (v) => [Math.floor(at(v.spec, 1) / at(v.spec, 0))] },
    },
    answer: (v) => String(v.tickets),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const tickets = Number(v.tickets);
      return fourOptions(String(tickets), [String(tickets + 1), String(tickets + 2), String(Math.max(1, tickets - 1))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.have} ÷ ${vars.price} = ${Math.floor(Number(vars.have) / Number(vars.price))} სრული ბილეთი, დარჩენილი ${Number(vars.have) % Number(vars.price)} თეთრი აღარ კმარა. პასუხი: ${answer} ბილეთი.`,
  }),
  bank({
    id: 'g5-u18-q42',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნამცხვარი ღირს {price} თეთრი. მარიამს აქვს {have} თეთრი. რამდენი ნამცხვრის ყიდვა შეუძლია და რამდენი თეთრი დარჩება?',
    variables: {
      spec: { kind: 'choice', values: ['180|1000', '250|900', '320|1500', '145|600', '275|1000', '360|800'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      have: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      cakes: { kind: 'choice', values: (v) => [Math.floor(at(v.spec, 1) / at(v.spec, 0))] },
      rest: { kind: 'choice', values: (v) => [at(v.spec, 1) % at(v.spec, 0)] },
    },
    answer: (v) => `${v.cakes} ნამცხვარი, ${v.rest} თეთრი`,
    format: { kind: 'text' },
    options: (v) => {
      const cakes = Number(v.cakes);
      const rest = Number(v.rest);
      return fourOptions(`${cakes} ნამცხვარი, ${rest} თეთრი`, [
        `${cakes} ნამცხვარი, ${rest + 100} თეთრი`,
        `${cakes + 1} ნამცხვარი, ${rest} თეთრი`,
        `${Math.max(1, cakes - 1)} ნამცხვარი, ${rest + 50} თეთრი`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.have} ÷ ${vars.price} = ${Math.floor(Number(vars.have) / Number(vars.price))} ნამცხვარი, ნაშთი ${Number(vars.have) % Number(vars.price)} თეთრი. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q43',
    subtopicId: 'u18-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სკოლის ბუფეტში ერთი ფუნთუშა ღირს {price} თეთრი. {count} ფუნთუშა რამდენი ღირს?',
    variables: {
      spec: { kind: 'choice', values: ['150|4', '125|6', '200|3', '175|5', '90|8', '250|2', '110|7'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.price) * Number(v.count)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.price) * Number(v.count);
      return fourOptions(lari(total), [lari(total + 100), lari(total - 50), lari(Number(v.price) + Number(v.count))]);
    },
    explain: ({ vars, answer }) => `${vars.price} × ${vars.count} = ${Number(vars.price) * Number(vars.count)} თეთრი, ანუ ${answer}.`,
  }),

  // ═════════ U18.9 — ჯარიმები და გადასახადები ═════════
  bank({
    id: 'g5-u18-q44',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ბიბლიოთეკაში წიგნის დაგვიანებით დაბრუნების ჯარიმა დღეში {perDay} თეთრია. წიგნი {days} დღით დაგვიანდა. რამდენი თეთრია ჯარიმა?',
    variables: {
      spec: { kind: 'choice', values: ['50|4', '75|2', '40|5', '60|3', '25|8', '100|2', '30|6'] },
      perDay: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => String(Number(v.perDay) * Number(v.days)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const total = Number(v.perDay) * Number(v.days);
      return fourOptions(String(total), [String(total + 50), String(Number(v.perDay) + Number(v.days)), String(total - 20)]);
    },
    explain: ({ vars, answer }) => `${vars.perDay} × ${vars.days} = ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q45',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ოჯახის ყოველთვიური გადასახადი {monthly} თეთრია. რამდენი თეთრია გადასახადი წელიწადში?',
    variables: {
      monthly: { kind: 'choice', values: [1500, 2500, 1800, 3200, 750, 2000, 1200, 4000] },
    },
    answer: (v) => String(Number(v.monthly) * 12),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const yearly = Number(v.monthly) * 12;
      return fourOptions(String(yearly), [String(Number(v.monthly) * 10), String(yearly + 1500), String(yearly - 500)]);
    },
    explain: ({ vars, answer }) =>
      `წელიწადში 12 თვეა, ამიტომ ${vars.monthly} × 12 = ${answer} თეთრი (${lari(Number(vars.monthly) * 12)}).`,
  }),
  bank({
    id: 'g5-u18-q46',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პარკინგის ჯარიმა {fine} თეთრია. მძღოლმა გადაიხადა {paid} თეთრი. რამდენი თეთრი დარჩა გადასახდელი?',
    variables: {
      spec: { kind: 'choice', values: ['250|100', '450|300', '180|50', '600|400', '325|200', '900|500'] },
      fine: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => String(Number(v.fine) - Number(v.paid)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const rest = Number(v.fine) - Number(v.paid);
      return fourOptions(String(rest), [String(rest + 50), String(rest + 100), String(Math.max(5, rest - 25))]);
    },
    explain: ({ vars, answer }) => `${vars.fine} − ${vars.paid} = ${answer} თეთრი დარჩა გადასახდელი.`,
  }),
  bank({
    id: 'g5-u18-q47',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ბიბლიოთეკის ჯარიმა დღეში {perDay} თეთრია. მანანამ წიგნი {days} დღით დააგვიანა. მან უკვე გადაიხადა {paid} თეთრი. რამდენი თეთრი დარჩა გადასახდელი?',
    variables: {
      spec: { kind: 'choice', values: ['40|5|50', '60|3|100', '25|6|40', '75|2|50', '50|4|75', '30|7|60'] },
      perDay: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      paid: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      rest: { kind: 'choice', values: (v) => [at(v.spec, 0) * at(v.spec, 1) - at(v.spec, 2)] },
    },
    answer: (v) => String(v.rest),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const rest = Number(v.rest);
      return fourOptions(String(rest), [String(rest + 10), String(rest + 50), String(Number(v.perDay) * Number(v.days))]);
    },
    explain: ({ vars, answer }) =>
      `სულ ჯარიმა ${vars.perDay} × ${vars.days} = ${Number(vars.perDay) * Number(vars.days)}; გადახდილია ${vars.paid}; დარჩა ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q48',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ელექტროენერგიის ტარიფი {rate} თეთრია ერთ კილოვატსაათზე. ოჯახმა მოიხმარა {kwh} კილოვატსაათი. რამდენი უნდა გადაიხადოს?',
    variables: {
      spec: { kind: 'choice', values: ['20|150', '25|120', '18|200', '30|90', '15|240', '22|180'] },
      rate: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      kwh: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => lari(Number(v.rate) * Number(v.kwh)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.rate) * Number(v.kwh);
      return fourOptions(lari(total), [lari(total + 100), lari(total - 100), lari(Number(v.rate) + Number(v.kwh))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.rate} × ${vars.kwh} = ${Number(vars.rate) * Number(vars.kwh)} თეთრი, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u18-q49',
    subtopicId: 'u18-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სახლის გადასახადი თვეში {monthly} თეთრია. ოჯახმა {months} თვე გადაიხადა. რამდენი დარჩა გადასახდელი წლის ბოლომდე?',
    variables: {
      spec: { kind: 'choice', values: ['1200|4', '1500|6', '800|5', '2000|9', '950|3', '1100|7'] },
      monthly: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      months: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      rest: { kind: 'choice', values: (v) => [at(v.spec, 0) * (12 - at(v.spec, 1))] },
    },
    answer: (v) => lari(Number(v.rest)),
    format: { kind: 'text' },
    options: (v) => {
      const rest = Number(v.rest);
      return fourOptions(lari(rest), [lari(rest + 1200), lari(rest - 600 > 0 ? rest - 600 : rest + 2400), lari(Number(v.monthly) * 12)]);
    },
    explain: ({ vars, answer }) =>
      `დარჩა ${12 - Number(vars.months)} თვე; ${vars.monthly} × ${12 - Number(vars.months)} = ${vars.rest} თეთრი, ანუ ${answer}.`,
  }),

  // ═════════ U18.10 — თანხების დამრგვალება ═════════
  bank({
    id: 'g5-u18-q50',
    subtopicId: 'u18-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფასი {price} თეთრია. დამრგვალე უახლოეს ლარამდე. რამდენი ლარია?',
    hint: '50 თეთრი ან მეტი — მრგვალდება ზემოთ; 50-ზე ნაკლები — ქვემოთ.',
    variables: {
      price: { kind: 'choice', values: [740, 1250, 260, 830, 1660, 380, 950, 1450, 210, 1770, 550, 620] },
    },
    answer: (v) => String(Math.round(Number(v.price) / 100)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Math.round(Number(v.price) / 100);
      return fourOptions(String(right), [String(right + 1), String(Math.floor(Number(v.price) / 100)), String(right + 2)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.price} თეთრი = ${lariDecimal(Number(vars.price))} ლარი; უახლოეს ლარამდე — ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u18-q51',
    subtopicId: 'u18-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფასი {price} თეთრია. დამრგვალე უახლოეს 10 თეთრამდე. რამდენი თეთრია?',
    hint: 'ბოლო ციფრი: 5 ან მეტი — ზემოთ; 5-ზე ნაკლები — ქვემოთ.',
    variables: {
      price: { kind: 'choice', values: [743, 1268, 262, 837, 1664, 388, 956, 1453, 217, 1771, 552, 629] },
    },
    answer: (v) => String(Math.round(Number(v.price) / 10) * 10),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Math.round(Number(v.price) / 10) * 10;
      return fourOptions(String(right), [String(right + 10), String(right - 10), String(Math.floor(Number(v.price) / 10) * 10 + 20)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.price}-ის ბოლო ციფრი განსაზღვრავს მიმართულებას: ${Number(vars.price) % 10} → ${answer} თეთრი.`,
  }),
  bank({
    id: 'g5-u18-q52',
    subtopicId: 'u18-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამი საქონლის ფასია {a}, {b} და {c} თეთრი. დამრგვალე თითოეული უახლოეს ლარამდე და იპოვე სულ რამდენი ლარია.',
    variables: {
      spec: { kind: 'choice', values: ['340|680|1250', '270|450|830', '560|710|340', '1280|640|290', '430|860|1520', '180|570|940'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      totalLari: {
        kind: 'choice',
        values: (v) => [
          Math.round(at(v.spec, 0) / 100) + Math.round(at(v.spec, 1) / 100) + Math.round(at(v.spec, 2) / 100),
        ],
      },
    },
    answer: (v) => String(v.totalLari),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const total = Number(v.totalLari);
      return fourOptions(String(total), [String(total + 1), String(total - 1), String(total + 2)]);
    },
    explain: ({ vars, answer }) =>
      `დამრგვალებული: ${Math.round(Number(vars.a) / 100)}, ${Math.round(Number(vars.b) / 100)}, ${Math.round(Number(vars.c) / 100)}; სულ ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u18-q53',
    subtopicId: 'u18-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'საქონლის ფასი {price} თეთრია. დამრგვალე უახლოეს 50 თეთრამდე. რამდენი თეთრია?',
    hint: 'მრგვალდება 0-ს, 50-ს ან 100-ს შორის — იმაზე, რომელიც უფრო ახლოსაა.',
    variables: {
      price: { kind: 'choice', values: [738, 1212, 268, 833, 1668, 383, 962, 1441, 922, 1778, 566, 634] },
    },
    answer: (v) => String(Math.round(Number(v.price) / 50) * 50),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Math.round(Number(v.price) / 50) * 50;
      return fourOptions(String(right), [String(right + 50), String(right - 50 > 0 ? right - 50 : right + 100), String(right + 10)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.price} თეთრი ${answer}-ს უფრო ახლოსაა, ვიდრე მეზობელ 50-იანს.`,
  }),
  bank({
    id: 'g5-u18-q54',
    subtopicId: 'u18-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნამცხვრის ფასი {price} თეთრია. მაღაზია ყველა ფასს მთელ ლარამდე ამრგვალებს. {count} ნამცხვრის საერთო ფასი დამრგვალებული რამდენი ლარი იქნება?',
    hint: 'ჯერ გამოთვალე სულ თეთრებში, შემდეგ დამრგვალე.',
    variables: {
      spec: { kind: 'choice', values: ['340|3', '275|4', '420|2', '185|5', '560|3', '330|4'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      roundedLari: { kind: 'choice', values: (v) => [Math.round((at(v.spec, 0) * at(v.spec, 1)) / 100)] },
      totalTetri: { kind: 'choice', values: (v) => [at(v.spec, 0) * at(v.spec, 1)] },
    },
    answer: (v) => String(v.roundedLari),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.roundedLari);
      return fourOptions(String(right), [String(right + 1), String(right - 1), String(right + 2)]);
    },
    explain: ({ vars, answer }) =>
      `სულ ${vars.price} × ${vars.count} = ${vars.totalTetri} თეთრი = ${lariDecimal(Number(vars.totalTetri))} ლარი, დამრგვალებული — ${answer} ლარი.`,
  }),
];
