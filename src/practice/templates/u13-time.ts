/**
 * U13 — დრო (time).
 *
 * Fifty templates over the curriculum's five subtopics, following the
 * specification's question ranges:
 *
 *   U13.1 `saatis-wakitxva`      Q1–Q9, Q47            10
 *   U13.2 `kviris-dgeebi`        Q10–Q18, Q46           10
 *   U13.3 `Tveebi-seasonebi`     Q19–Q27, Q48           10
 *   U13.4 `drois-amocanebi`      Q28–Q37                10
 *   U13.5 `sxva-dro`             Q38–Q45, Q49           10
 *
 * The mixed review at the end of the specification (Q46–Q50) has no subtopic of
 * its own in the curriculum, so each of those questions is filed under the
 * subtopic that teaches it. That is why each subtopic has ten and not the raw
 * count of its own range.
 *
 * ## The one idea this unit must not break
 *
 * **A time is one number.** Everything — a clock face, a duration, a difference
 * — is computed from minutes since midnight, converted back to `HH:MM` only to
 * be shown. There is no arithmetic on hours and minutes separately, which is the
 * mistake that turns 3:30 + 90 minutes into 4:20.
 *
 * Two consequences:
 *
 *  - **The picture is computed from the time, not beside it.** `clockFace(t)`
 *    takes the same number the answer does; the hour hand at 4:30 sits between
 *    the 4 and the 5 because that is where 4.5 hours puts it, not because
 *    someone drew it there. See `clock.ts`.
 *  - **A cycle is one list.** Weekdays, months and seasons live in `calendar.ts`
 *    and every "what comes next", "what came before" and "how many days later"
 *    answer is a modulo against the same array the picture labels come from.
 *
 * ## Answer types
 *
 * The specification asks for four: single choice, typed number, matching (drag &
 * drop) and typed time. The runner marks one option and has one text field, so:
 *
 *  - **matching →** "which row pairs them all correctly", as in U11 and U12.
 *  - **typed time →** a real typed answer, `HH:MM`, compared by clock value:
 *    `7:00` and `07:00` are the same time and neither is marked wrong. See
 *    `format.time` in `types.ts`.
 *  - **a worded answer** („ექვსი საათი და ოცდაათი წუთი“, „სამშაბათი“) is always
 *    a choice. Asking a six-year-old to spell „ოცდაათი“ would test typing.
 *
 * Every time that appears with a number in a prompt says whether it is morning
 * or evening when that changes the answer — the specification's rule 7 — and the
 * clock faces are all drawn on the 12-hour dial, so `8:30` is the same picture
 * in the morning and in the evening and the words carry the difference.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';
import { clockFace, clockText, clockWords } from './clock';
import {
  MONTHS,
  SEASONS,
  WEEKDAYS,
  durationWords,
  fromName,
  genitive,
  untilName,
  dialHour,
  monthAfter,
  monthBefore,
  seasonOfMonth,
  timeText,
  weekdayAfter,
  weekdayBefore,
  weekdayNumber,
} from './calendar';
import type { Weekday } from './calendar';

const grade = 1 as const;
const topicId = 'dro';
const unitId = 'dro';

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/* ================================================================== *\
 * Shared helpers
 * ================================================================== */

/**
 * Minutes since midnight for a drawn time.
 *
 * Templates draw `minutes` directly rather than an hour and a minute, because a
 * template that drew both could draw an impossible pair and the clock face would
 * happily draw it.
 */
const at = (v: Vars, key = 'minutes'): number => Number(v[key]);

/** Distractors around a time: the same slip a child makes when counting on. */
const nearTimes = (minutes: number, offsets: number[]): string[] =>
  offsets
    .map((offset) => minutes + offset)
    .filter((candidate, index, all) => candidate >= 0 && candidate < 24 * 60 && candidate !== minutes && all.indexOf(candidate) === index)
    .map((candidate) => timeText(candidate));

/** The Georgian sentence for a duration in minutes. */

/**
 * The options for "which of these times is it?" — the answer plus three near it.
 *
 * The near misses are the mistakes the questions are about: an hour out (the
 * hour hand read as the minute hand), half an hour out (the hour hand read as if
 * it stood still), and a quarter out.
 */
const timeOptions = (minutes: number): string[] => {
  const wrongs = nearTimes(minutes, [60, -60, 30, -30, 15, -15]);
  return [timeText(minutes), ...wrongs].slice(0, 4);
};

/* ================================================================== *\
 * U13.1 — საათის წაკითხვა (Q1–Q9, Q47), 10 templates
 * ================================================================== */

/** Whole hours, 1–12, drawn as minutes. */
const wholeHours = Array.from({ length: 12 }, (_, index) => index * 60);

const u131: QuestionTemplate[] = [
  /**
   * Q1 — read a whole hour off the face, as a choice.
   *
   * The options are the clock times themselves, so answering means matching the
   * hand positions to one of four times rather than finding a word.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-1-read-oclock', subtopicId: 'saatis-wakitxva', difficulty: 1 }),
    prompt: 'რამდენი საათია გამოსახული საათზე? აირჩიე დრო.',
    variables: {
      minutes: { kind: 'choice', values: wholeHours.filter((value) => value > 0) },
    },
    answer: (v: Vars) => timeText(at(v)),
    options: (v: Vars) => {
      // Whole hours one step either side: the hands are one numeral apart, which
      // is exactly the mistake a child makes when they read the long hand.
      const value = at(v);
      const wrongs = [60, -60, 120, -120].map((offset) => ((value + offset - 60 + 12 * 60) % (12 * 60)) + 60);
      const options = [timeText(value), ...new Set(wrongs.map(timeText))].slice(0, 4);
      return options;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(at(v)),
    explanation: (context) => `მოკლე ისარი ${dialHour(at(context.vars))}-ზეა, გრძელი — 12-ზე, ამიტომ დროა ${context.answer}.`,
  }),

  /**
   * Q2, Q47 — write the time down. A typed answer.
   *
   * The key is `HH:MM` and `7:00` is accepted for `07:00`, because reading a
   * clock is the thing being tested, not typing two digits.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-1-write-oclock', subtopicId: 'saatis-wakitxva', difficulty: 1 }),
    prompt: 'საათზე მოკლე ისარი {dial}-ზეა, გრძელი კი 12-ზე. ჩაწერე დრო.',
    variables: {
      minutes: { kind: 'choice', values: wholeHours.filter((value) => value > 0) },
      dial: { kind: 'choice', values: (v: Vars) => [String(dialHour(at(v)))] },
    },
    answer: (v: Vars) => timeText(at(v)),
    format: { kind: 'text', time: true },
    visual: (v: Vars) => clockFace(at(v)),
    explanation: (context) => `მოკლე ისარი ${context.vars.dial}-ზეა, ამიტომ დროა ${context.answer}.`,
  }),

  /** Q3 — match each clock to its time, recast from drag & drop. */
  defineTemplate({
    ...address({ id: 'g1-u13-1-match-clocks', subtopicId: 'saatis-wakitxva', difficulty: 1 }),
    prompt: 'რომელი რიგი შეაერთებს ყველა საათს თავის დროსთან სწორად?',
    variables: {
      order: {
        kind: 'list',
        pick: { values: [60, 120, 180, 240, 300, 360], length: 4, unique: true },
      },
    },
    answer: (v: Vars) => (v.order as number[]).map((minutes, index) => `#${index + 1} → ${timeText(minutes)}`).join(' · '),
    options: (v: Vars) => {
      const order = v.order as number[];
      const row = (slip: number) => order.map((_, index) => `#${index + 1} → ${timeText(order[(index + slip) % order.length]!)}`).join(' · ');
      // A rotation of the times is a whole matching with every pair moved, and
      // only the unrotated row gives each clock its own time.
      const out = [row(0)];
      for (const slip of [1, 2, 3]) if (!out.includes(row(slip))) out.push(row(slip));
      return out.slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as number[]).map((minutes, index) => `#${index + 1}\n${clockFace(minutes)}`).join('\n\n'),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q4 — which clock shows the named time? */
  defineTemplate({
    ...address({ id: 'g1-u13-1-which-clock', subtopicId: 'saatis-wakitxva', difficulty: 1 }),
    prompt: 'რომელი საათი აჩვენებს {target}-ს?',
    variables: {
      minutes: { kind: 'choice', values: [60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660] },
      target: { kind: 'choice', values: (v: Vars) => [timeText(at(v))] },
      spots: { kind: 'list', pick: { values: [0, 1, 2, 3], length: 4, unique: true } },
    },
    answer: (v: Vars) => `#${(v.spots as number[]).indexOf(0) + 1}`,
    options: () => ['#1', '#2', '#3', '#4'],
    format: { kind: 'text' },
    visual: (v: Vars) => {
      // The right clock and the three that are an hour, two hours or half an
      // hour out; each is drawn, so the answer is found by reading four faces.
      const value = at(v);
      const spots = v.spots as number[];
      const faces = spots.map((spot) => {
        if (spot === 0) return value;
        const offset = [60, -60, 120][spot - 1] ?? 60;
        return ((value - 60 + offset + 12 * 60) % (12 * 60)) + 60;
      });
      return faces.map((minutes, index) => `#${index + 1}\n${clockFace(minutes)}`).join('\n\n');
    },
    explanation: (context) => `${context.answer} აჩვენებს ${context.vars.target}-ს: მოკლე ისარი ${dialHour(at(context.vars))}-ზეა, გრძელი — 12-ზე.`,
  }),

  /**
   * Q5, Q47 — where is the minute hand? A quarter past puts it on the `3`, half
   * past on the `6`, a quarter to on the `9` and a whole hour on the `12`, so
   * the four options are the four quarter positions and the picture decides.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-1-minute-hand-hotspot', subtopicId: 'saatis-wakitxva', difficulty: 2 }),
    prompt: 'საათი აჩვენებს {timeText}-ს. რომელ ციფრზეა წუთის ისარი?',
    variables: {
      hour: { kind: 'int', min: 1, max: 11 },
      rest: { kind: 'choice', values: [0, 15, 30, 45] },
      timeText: { kind: 'choice', values: (v: Vars) => [clockText(Number(v.hour) * 60 + Number(v.rest))] },
      dialMinute: { kind: 'choice', values: (v: Vars) => [String(Number(v.rest) === 0 ? 12 : Number(v.rest) / 5)] },
    },
    answer: (v: Vars) => String(v.dialMinute),
    options: () => ['12', '3', '6', '9'],
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => {
      const rest = Number(context.vars.rest);
      const why =
        rest === 0
          ? 'სრულ საათზე ის 12-ზე დგას'
          : rest === 15
            ? '15 წუთზე ის 3-ზეა'
            : rest === 30
              ? 'ნახევარ საათზე ის 6-ზეა'
              : '45 წუთზე ის 9-ზეა';
      return `წუთის ისარი ${context.answer}-ზეა: ${why}.`;
    },
  }),

  /**
   * Q6, Q8 — read a half or a quarter hour, where the hour hand is *between* two
   * numerals. This is the question the specification's rule 2 exists for.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-1-half-past', subtopicId: 'saatis-wakitxva', difficulty: 2 }),
    prompt: 'წუთის ისარი {dialMinute}-ზეა, საათის ისარი კი {lower}-სა და {upper}-ს შორის. რა დროა?',
    variables: {
      hour: { kind: 'int', min: 1, max: 11 },
      rest: { kind: 'choice', values: [30, 45, 15] },
      lower: { kind: 'choice', values: (v: Vars) => [String(Number(v.hour))] },
      upper: { kind: 'choice', values: (v: Vars) => [String(Number(v.hour) + 1)] },
      dialMinute: { kind: 'choice', values: (v: Vars) => [String(Number(v.rest) / 5)] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest)),
    options: (v: Vars) => {
      const right = Number(v.hour) * 60 + Number(v.rest);
      // The two mistakes this question exists to catch: reading the hour hand as
      // having reached the *next* numeral, and reading it as still on the last.
      const out = [timeText(right)];
      for (const candidate of [right + 60, right - 60, right + 30]) {
        const text = timeText(candidate);
        if (!out.includes(text) && out.length < 4) out.push(text);
      }
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => {
      const hour = Number(context.vars.hour);
      const rest = Number(context.vars.rest);
      return `საათის ისარი ${hour}-სა და ${hour + 1}-ს შორისაა, ამიტომ საათი ${hour} არის, წუთები კი ${rest}. დროა ${context.answer}.`;
    },
  }),

  /**
   * Two steps on one picture: read the dial, then work out what time it will be
   * after a wait. The second step is what makes it level 3, and the dial is the
   * only place the start time is given.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-1-wait-until', subtopicId: 'saatis-wakitxva', difficulty: 3 }),
    prompt: 'საათი აჩვენებს {timeText}-ს. რა დრო იქნება {wait} წუთის შემდეგ?',
    variables: {
      hour: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [0, 15, 30, 45] },
      wait: { kind: 'choice', values: [15, 30, 45, 60] },
      timeText: { kind: 'choice', values: (v: Vars) => [clockText(Number(v.hour) * 60 + Number(v.rest))] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.wait)),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + Number(v.rest) + Number(v.wait)),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.timeText} + ${context.vars.wait} წუთი = ${context.answer}.`,
  }),

  /** Q7 — how many minutes past the hour is it? */
  defineTemplate({
    ...address({ id: 'g1-u13-1-minutes-past', subtopicId: 'saatis-wakitxva', difficulty: 2 }),
    prompt: '{frame} წუთის ისარი {dialMinute}-ზეა. რამდენი წუთია გასული სრული საათიდან?',
    // Two frames for the same question: one names the numeral, the other asks
    // the child to find it, so eight dial positions make sixteen questions.
    variables: {
      ask: { kind: 'choice', values: ['named', 'shown'] },
      frame: {
        kind: 'choice',
        values: (v: Vars) => [v.ask === 'named' ? 'საათზე' : 'ნახატზე ნახე, სად არის წუთის ისარი.'],
      },
      rest: { kind: 'choice', values: [5, 10, 15, 20, 30, 40, 45, 50] },
      dialMinute: { kind: 'choice', values: (v: Vars) => [String(Number(v.rest) / 5)] },
    },
    answer: (v: Vars) => Number(v.rest),
    format: { kind: 'integer', min: 0, max: 60, entry: true },
    distractors: (context) => {
      const rest = Number(context.vars.rest);
      return [rest + 15, rest - 15, rest + 30].filter((value) => value > 0 && value < 60 && value !== rest).map(String);
    },
    visual: (v: Vars) => clockFace(Number(v.rest)),
    explanation: (context) => `ციფრიდან ციფრამდე 5 წუთია. ${context.vars.dialMinute}-ზე არის ${context.answer} წუთი.`,
  }),

  /** Q9 — the time in words, as the specification words it. */
  defineTemplate({
    ...address({ id: 'g1-u13-1-time-in-words', subtopicId: 'saatis-wakitxva', difficulty: 3 }),
    prompt: 'საათი აჩვენებს {timeText}-ს. რომელი აღწერაა სწორი?',
    variables: {
      minutes: { kind: 'choice', values: [0, 15, 30, 45].flatMap((rest) => Array.from({ length: 11 }, (_, index) => (index + 1) * 60 + rest)) },
      timeText: { kind: 'choice', values: (v: Vars) => [clockText(at(v))] },
    },
    answer: (v: Vars) => clockWords(at(v)),
    options: (v: Vars) => {
      const value = at(v);
      const right = clockWords(value);
      const wrongs = [clockWords(value + 60), clockWords(value - 60), clockWords(value + 30)].filter((text) => text !== right);
      return [right, ...new Set(wrongs)].slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(at(v)),
    explanation: (context) => `${context.answer} — ეს არის ${context.vars.timeText}.`,
  }),


  /** Which analogue time is later — a reading question with a comparison in it. */
  defineTemplate({
    ...address({ id: 'g1-u13-1-which-is-later', subtopicId: 'saatis-wakitxva', difficulty: 2 }),
    prompt: 'ორი საათიდან რომელი აჩვენებს უფრო გვიან დროს?',
    optionCount: 2,
    variables: {
      hour: { kind: 'int', min: 1, max: 8 },
      rest: { kind: 'choice', values: [0, 30] },
      gap: { kind: 'choice', values: [30, 60, 90, 120] },
      earlier: { kind: 'choice', values: (v: Vars) => [Number(v.hour) * 60 + Number(v.rest)] },
    },
    answer: (v: Vars) => timeText(Number(v.earlier) + Number(v.gap)),
    options: (v: Vars) => [timeText(Number(v.earlier)), timeText(Number(v.earlier) + Number(v.gap))],
    format: { kind: 'text' },
    visual: (v: Vars) => `#1\n${clockFace(Number(v.earlier))}\n\n#2\n${clockFace(Number(v.earlier) + Number(v.gap))}`,
    explanation: (context) => `#2 აჩვენებს ${context.answer}-ს, #1 კი — ${timeText(Number(context.vars.earlier))}-ს.`,
  }),
];

/* ================================================================== *\
 * U13.2 — კვირის დღეები (Q10–Q18, Q46), 10 templates
 * ================================================================== */

/** The window of days a "which day follows" question may draw. */
const DAYS = [...WEEKDAYS];

const u132: QuestionTemplate[] = [
  /** Q10, Q13, Q46 — which day comes after the named one? */
  defineTemplate({
    ...address({ id: 'g1-u13-2-next-day', subtopicId: 'kviris-dgeebi', difficulty: 1 }),
    prompt: '{frame} რომელი დღე მოდის {dayGen} შემდეგ?',
    variables: {
      day: { kind: 'choice', values: DAYS },
      dayGen: { kind: 'choice', values: (v: Vars) => [genitive(String(v.day))] },
      ask: { kind: 'choice', values: ['plain', 'around'] },
      frame: {
        kind: 'choice',
        values: (v: Vars) =>
          [v.ask === 'plain' ? 'კვირის დღეები რიგ-რიგობით მიდიან.' : 'დღეები ისე იცვლება, რომ ერთი მეორეს მიჰყვება.'],
      },
    },
    answer: (v: Vars) => weekdayAfter(String(v.day), 1),
    options: (v: Vars) => {
      const day = String(v.day);
      const right = weekdayAfter(day, 1);
      // The options are the neighbouring days: before it, after it, and two on.
      const wrongs = [weekdayBefore(day, 1), weekdayAfter(day, 2), weekdayAfter(day, 3)].filter((name) => name !== right);
      return [right, ...wrongs].slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${context.vars.dayGen} შემდეგ მოდის ${context.answer}.`,
  }),

  /** Q11 — which day follows Sunday? The week wraps. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-week-wraps', subtopicId: 'kviris-dgeebi', difficulty: 1 }),
    prompt: '{dayGen} რომელი დღე მოდის?',
    // The other half of „what comes after X“: what comes *before* it. The ask is
    // the mirror of the level-1 template beside it, so between them a subtopic
    // covers the week in both directions, and Sunday → Monday is one of the
    // seven rather than a special case with its own wording.
    variables: {
      day: { kind: 'choice', values: DAYS },
      dayGen: { kind: 'choice', values: (v: Vars) => [`${genitive(String(v.day))} წინ`] },
    },
    answer: (v: Vars) => weekdayBefore(String(v.day), 1),
    options: (v: Vars) => {
      const day = String(v.day);
      const right = weekdayBefore(day, 1);
      return [right, weekdayAfter(day, 1), weekdayBefore(day, 2), day].filter(
        (name, index, all) => all.indexOf(name) === index,
      );
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) =>
      `${context.vars.day} დღემდე მოდის ${context.answer}${
        context.vars.day === 'ორშაბათი' ? ': კვირის დასაწყისს წინა კვირის ბოლო დღე უძღვის' : ''
      }.`,
  }),

  /** Q12 — match the days to their order, recast from drag & drop. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-match-days', subtopicId: 'kviris-dgeebi', difficulty: 1 }),
    prompt: 'რომელი რიგი აყენებს კვირის დღეებს სწორ თანმიმდევრობაში, {dayGen} დაწყებული?',
    // „which row puts four days in week order“ — matching, recast as a choice,
    // drawn from every day of the week so the row is not always the same four.
    variables: {
      start: { kind: 'choice', values: DAYS },
      dayGen: { kind: 'choice', values: (v: Vars) => [genitive(String(v.start))] },
      length: { kind: 'choice', values: [3, 4, 5] },
    },
    answer: (v: Vars) => pickDays(String(v.start), Number(v.length)).join(' → '),
    options: (v: Vars) => {
      const right = pickDays(String(v.start), Number(v.length));
      const wrongs = [1, 2, 3].map((slip) => pickDays(String(v.start), Number(v.length), slip).join(' → '));
      return [right.join(' → '), ...wrongs];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => {
      const row = pickDays(String(v.start), Number(v.length));
      const shuffled = [...row].sort((a, b) => weekdayNumber(b) - weekdayNumber(a));
      return row.map((_, at) => `#${at + 1}`).join(' ') + '  —  ' + shuffled.join('  ·  ');
    },
    explanation: (context) => `სწორი რიგია: ${context.answer}.`,
  }),

  /** Q14 — tomorrow. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-tomorrow', subtopicId: 'kviris-dgeebi', difficulty: 2 }),
    prompt: 'დღეს {day}ა. რომელი დღე იქნება {when}?',
    variables: {
      day: { kind: 'choice', values: ['ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი'] },
      ahead: { kind: 'choice', values: [1, 2] },
      when: { kind: 'choice', values: (v: Vars) => [Number(v.ahead) === 1 ? 'ხვალ' : 'ზეგ'] },
    },
    answer: (v: Vars) => weekdayAfter(String(v.day), Number(v.ahead)),
    options: (v: Vars) => {
      const day = String(v.day);
      const steps = Number(v.ahead);
      const right = weekdayAfter(day, steps);
      return [right, weekdayAfter(day, steps - 1), weekdayAfter(day, steps + 1), weekdayBefore(day, 1)].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${context.vars.when} ${context.answer} იქნება — ${context.vars.day} დღიდან ${context.vars.ahead === 1 ? 'ერთი' : 'ორი'} დღე.`,
  }),

  /** Q15 — yesterday. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-yesterday', subtopicId: 'kviris-dgeebi', difficulty: 2 }),
    prompt: '{frame} რომელი დღე იყო {when}?',
    variables: {
      day: { kind: 'choice', values: DAYS },
      frame: {
        kind: 'choice',
        values: (v: Vars) => [`დღეს ${v.day}ა.`, `თუ დღეს ${v.day}ა,`],
      },
      back: { kind: 'choice', values: [1, 1] },
      when: { kind: 'choice', values: ['გუშინ', 'გუშინ'] },
    },
    answer: (v: Vars) => weekdayBefore(String(v.day), Number(v.back)),
    options: (v: Vars) => {
      const day = String(v.day);
      const steps = Number(v.back);
      const right = weekdayBefore(day, steps);
      return [right, weekdayBefore(day, steps - 1), weekdayBefore(day, steps + 1), weekdayAfter(day, 1)].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${context.vars.when} ${context.answer} იყო — ${context.vars.day} დღიდან ${context.vars.back === 1 ? 'ერთი' : 'ორი'} დღით ადრე.`,
  }),

  /** Q16 — a few days ahead, inside one week. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-days-ahead', subtopicId: 'kviris-dgeebi', difficulty: 2 }),
    prompt: 'დღეს {day}ა. {steps} დღის შემდეგ რა დღე იქნება?',
    variables: {
      day: { kind: 'choice', values: DAYS },
      steps: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => weekdayAfter(String(v.day), Number(v.steps)),
    options: (v: Vars) => {
      const day = String(v.day);
      const steps = Number(v.steps);
      const right = weekdayAfter(day, steps);
      // Near misses on both sides plus the day the week lands on if you count one
      // short — the three ways this question is got wrong.
      const wrongs = [weekdayAfter(day, steps - 1), weekdayAfter(day, steps + 1), weekdayAfter(day, steps + 2), weekdayBefore(day, 1)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${fromName(String(context.vars.day))} ${context.vars.steps} დღე წინ — ეს არის ${context.answer}.`,
  }),

  /**
   * Q17, Q50 — more than a week ahead. The answer is `(day + steps) mod 7`, and
   * the whole point is that the intermediate weeks do not matter.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-2-many-days-ahead', subtopicId: 'kviris-dgeebi', difficulty: 3 }),
    prompt: 'დღეს {day}ა. რა დღე იქნება {steps} დღის შემდეგ?',
    variables: {
      day: { kind: 'choice', values: DAYS },
      steps: { kind: 'int', min: 8, max: 20 },
    },
    answer: (v: Vars) => weekdayAfter(String(v.day), Number(v.steps)),
    options: (v: Vars) => {
      const day = String(v.day);
      const steps = Number(v.steps);
      const right = weekdayAfter(day, steps);
      const remainder = steps % 7;
      // The mistakes this question is about: dropping a whole week, counting the
      // remainder in the wrong direction, and miscounting the remainder by one —
      // then, so there are always four options, the two remaining days of the
      // week in week order.
      const candidates = [
        weekdayAfter(day, remainder),
        weekdayBefore(day, remainder),
        weekdayAfter(day, remainder + 1),
        weekdayAfter(day, 1),
        ...WEEKDAYS.map((name) => name),
      ];
      return [right, ...candidates].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${context.vars.steps} = ${Math.floor(Number(context.vars.steps) / 7)} კვირა და ${Number(context.vars.steps) % 7} დღე. სრული კვირები დღეს არ ცვლის, ამიტომ ${Number(context.vars.steps) % 7} დღე საკმარისია: ${context.answer}.`,
  }),

  /** Q18 — the day before yesterday. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-day-before-yesterday', subtopicId: 'kviris-dgeebi', difficulty: 3 }),
    prompt: 'დღეს {day}ა. რომელი დღე იყო გუშინწინ?',
    variables: {
      day: { kind: 'choice', values: DAYS },
      back: { kind: 'choice', values: [2, 2] },
      when: { kind: 'choice', values: ['გუშინწინ', 'ორი დღით ადრე'] },
    },
    answer: (v: Vars) => weekdayBefore(String(v.day), Number(v.back)),
    options: (v: Vars) => {
      const day = String(v.day);
      const right = weekdayBefore(day, 2);
      const wrongs = [weekdayBefore(day, 1), weekdayBefore(day, 3), weekdayAfter(day, 2)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `გუშინწინ ორი დღით ადრე იყო: ${context.vars.day} → ${context.answer}.`,
  }),

  /**
   * Two weeks on: the day the week lands back where it started.
   *
   * The point is that whole weeks do not matter, which is the same fact Q17 and
   * Q50 rely on — asked here with an interval that is a whole number of weeks so
   * the answer is the starting day itself.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-2-same-day-two-weeks', subtopicId: 'kviris-dgeebi', difficulty: 3 }),
    prompt: 'დღეს {day}ა. რა დღე იქნება ზუსტად ორი კვირის შემდეგ?',
    variables: {
      day: { kind: 'choice', values: DAYS },
    },
    answer: (v: Vars) => weekdayAfter(String(v.day), 14),
    options: (v: Vars) => {
      const day = String(v.day);
      const right = weekdayAfter(day, 14);
      // Two weeks is the same day again — the point of the question. The wrong
      // options are the days one step either side, so „same day“ has to be
      // chosen deliberately rather than by elimination.
      const wrongs = [weekdayAfter(day, 1), weekdayBefore(day, 1), weekdayAfter(day, 2)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `ორი კვირა 14 დღეა, 14 კი 7-ზე უნაშთოდ იყოფა, ამიტომ დღე იგივე რჩება: ${context.answer}.`,
  }),

  /** The order number of a day, which is the other half of knowing the week. */
  defineTemplate({
    ...address({ id: 'g1-u13-2-day-number', subtopicId: 'kviris-dgeebi', difficulty: 2 }),
    prompt: 'კვირის რომელი დღეა {day} რიგით? დაწერე რიცხვი, თუ ორშაბათი 1-ლია.',
    variables: {
      day: { kind: 'choice', values: DAYS },
    },
    answer: (v: Vars) => weekdayNumber(String(v.day)),
    format: { kind: 'integer', min: 1, max: 7, entry: true },
    distractors: ({ answer }) => [((Number(answer) % 7) + 1), ((Number(answer) + 6 - 1) % 7) + 1, 8 - Number(answer)]
      .filter((value, index, all) => value >= 1 && value <= 7 && value !== Number(answer) && all.indexOf(value) === index)
      .map(String)
      .slice(0, 3),
    visual: (v: Vars) => weekStrip(String(v.day)),
    explanation: (context) => `${context.vars.day} — კვირის ${context.answer}-ე დღეა.`,
  }),
];

/** A row of the seven days with the named one boxed — the picture for a day question. */
function weekStrip(day: string): string {
  return WEEKDAYS.map((name) => (name === day ? `[${name}]` : name)).join(' · ');
}

/**
 * Four days from a starting day, in week order.
 *
 * `slip` skips one day on the way, producing the same four days with one
 * neighbour swapped — the wrong rows of the matching question. Only `slip = 0`
 * gives four days in order.
 */
function pickDays(start: string, count: number, slip = 0): Weekday[] {
  return Array.from({ length: count }, (_, index) => weekdayAfter(start, index + (slip > 0 && index >= slip ? 1 : 0)));
}

/* ================================================================== *\
 * U13.3 — თვეები და სეზონები (Q19–Q27, Q48), 10 templates
 * ================================================================== */

const MONTH_KEYS = [...MONTHS];

const u133: QuestionTemplate[] = [
  /** Q19, Q23 — which month comes next? */
  defineTemplate({
    ...address({ id: 'g1-u13-3-next-month', subtopicId: 'Tveebi-seasonebi', difficulty: 1 }),
    prompt: 'რომელი თვე მოდის {monthGen} შემდეგ?',
    variables: {
      month: { kind: 'choice', values: MONTH_KEYS },
      monthGen: { kind: 'choice', values: (v: Vars) => [genitive(String(v.month))] },
    },
    answer: (v: Vars) => monthAfter(String(v.month), 1),
    options: (v: Vars) => {
      const month = String(v.month);
      const right = monthAfter(month, 1);
      const wrongs = [monthBefore(month, 1), monthAfter(month, 2), monthBefore(month, 2)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => monthStrip(String(v.month)),
    explanation: (context) => `${context.vars.monthGen} შემდეგ მოდის ${context.answer}.`,
  }),

  /** Q20 — the first month of the year. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-first-month', subtopicId: 'Tveebi-seasonebi', difficulty: 1 }),
    prompt: 'რომელი თვეა წლის {edge} თვე?',
    variables: {
      edge: { kind: 'choice', values: ['პირველი', 'მეორე', 'მესამე', 'ბოლო', 'ბოლოს წინა', 'ბოლოს წინა თვე'] },
    },
    answer: (v: Vars) => {
      const index =
        v.edge === 'პირველი' ? 0 : v.edge === 'მეორე' ? 1 : v.edge === 'მესამე' ? 2 : v.edge === 'ბოლო' ? MONTHS.length - 1 : MONTHS.length - 2;
      return MONTHS[index]!;
    },
    options: (v: Vars) => {
      const index =
        v.edge === 'პირველი' ? 0 : v.edge === 'მეორე' ? 1 : v.edge === 'მესამე' ? 2 : v.edge === 'ბოლო' ? MONTHS.length - 1 : MONTHS.length - 2;
      const right = MONTHS[index]!;
      const wrongs = MONTHS.filter((_, at) => at !== index).filter((_, at) => at < 3 || at >= MONTHS.length - 3);
      return [right, ...wrongs.slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => {
      const edge = String(v.edge);
      const index =
        edge === 'პირველი' ? 0 : edge === 'მეორე' ? 1 : edge === 'მესამე' ? 2 : edge === 'ბოლო' ? MONTHS.length - 1 : MONTHS.length - 2;
      return MONTHS.map((month, at) => (at === index ? `[${month}]` : month)).join(' · ');
    },
    explanation: (context) => `წელი იანვრიდან იწყება და დეკემბრით მთავრდება: ${context.answer}.`,
  }),

  /** Q21 — match seasons to their months, recast from drag & drop. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-match-seasons', subtopicId: 'Tveebi-seasonebi', difficulty: 1 }),
    prompt: 'რომელი რიგი შეაერთებს სეზონებს მათ თვეებთან საქართველოს ოთხსეზონიანი დაყოფით?',
    variables: {
      rotation: { kind: 'choice', values: [0, 1, 2, 3] },
      frame: { kind: 'choice', values: ['row', 'list'] },
    },
    // The picture lists the seasons in a rotated order, so the four answer rows
    // differ between draws while the pairing that is true does not.
    format: { kind: 'text' },
    answer: () => SEASONS.map((item) => `${item.name} → ${item.months.join(', ')}`).join(' · '),
    options: (v: Vars) => {
      const rotation = Number(v.rotation);
      const right = SEASONS.map((item) => `${item.name} → ${item.months.join(', ')}`).join(' · ');
      const shifted = SEASONS.map((item, index) => {
        const months = SEASONS[(index + 1) % 4]!.months;
        return `${item.name} → ${months.join(', ')}`;
      }).join(' · ');
      const backwards = SEASONS.map((item, index) => {
        const months = SEASONS[(index + 3) % 4]!.months;
        return `${item.name} → ${months.join(', ')}`;
      }).join(' · ');
      const order = SEASONS.map((item, index) => {
        const months = SEASONS[(index + 2) % 4]!.months;
        return `${item.name} → ${months.join(', ')}`;
      }).join(' · ');
      const out = [right];
      for (const candidate of [shifted, backwards, order]) if (!out.includes(candidate)) out.push(candidate);
      // Rotate the options so the right row is not always first — the answer is
      // checked by content, and the drawn picture decides which row is true.
      return [out[rotation % out.length]!, ...out.filter((_, index) => index !== rotation % out.length)];
    },
    visual: (v: Vars) => {
      const start = SEASONS[Number(v.rotation)]!;
      const ordered = [start, ...SEASONS.filter((item) => item.key !== start.key)];
      const body = ordered.map((item, index) => `${index + 1}. ${item.name}: ${item.months.join(', ')}`).join('\n');
      return String(v.frame) === 'row' ? body : `სეზონები ასე ბრუნავს:\n${body}`;
    },
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q22 — which season follows this one? */
  defineTemplate({
    ...address({ id: 'g1-u13-3-next-season', subtopicId: 'Tveebi-seasonebi', difficulty: 1 }),
    prompt: '{frame} რომელი სეზონი მოდის მონიშნული სეზონის შემდეგ?',
    // The ring is labelled two ways, so the four seasons make eight questions.
    variables: {
      which: { kind: 'choice', values: ['spring', 'summer', 'autumn', 'winter'] },
      season: { kind: 'choice', values: (v: Vars) => [SEASONS.find((item) => item.key === String(v.which))!.name] },
      seasonGen: { kind: 'choice', values: (v: Vars) => [genitive(String(v.season))] },
      ask: { kind: 'choice', values: ['after', 'next-word'] },
      frame: {
        kind: 'choice',
        values: (v: Vars) =>
          [v.ask === 'after' ? 'წელიწადის დროები რიგ-რიგობით იცვლება.' : 'ბუნება თანმიმდევრულად იცვლის სეზონებს:'],
      },
    },
    answer: (v: Vars) => {
      const index = SEASONS.findIndex((item) => item.key === String(v.which));
      return SEASONS[(index + 1) % SEASONS.length]!.name;
    },
    options: (v: Vars) => {
      const index = SEASONS.findIndex((item) => item.key === String(v.which));
      const right = SEASONS[(index + 1) % SEASONS.length]!.name;
      const wrongs = [SEASONS[(index + 2) % 4]!.name, SEASONS[(index + 3) % 4]!.name, SEASONS[index]!.name];
      return [right, ...wrongs];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => SEASONS.map((item) => (item.key === String(v.which) ? `[${item.name}]` : item.name)).join(' → ') + ' → ' + SEASONS[0]!.name,
    explanation: (context) => `${context.vars.seasonGen} შემდეგ მოდის ${context.answer}.`,
  }),

  /** Q24, Q27 — which month is a few months before this one? */
  defineTemplate({
    ...address({ id: 'g1-u13-3-months-before', subtopicId: 'Tveebi-seasonebi', difficulty: 2 }),
    prompt: 'რომელი თვეა {monthUntil} {steps} თვით ადრე?',
    variables: {
      month: { kind: 'choice', values: MONTH_KEYS },
      monthUntil: { kind: 'choice', values: (v: Vars) => [untilName(String(v.month))] },
      steps: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v: Vars) => monthBefore(String(v.month), Number(v.steps)),
    options: (v: Vars) => {
      const month = String(v.month);
      const steps = Number(v.steps);
      const right = monthBefore(month, steps);
      const wrongs = [monthBefore(month, steps + 1), monthBefore(month, steps - 1), monthAfter(month, steps)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => monthStrip(String(v.month)),
    explanation: (context) => `${context.vars.monthUntil} ${context.vars.steps} თვით ადრე არის ${context.answer}.`,
  }),

  /** Q25 — how many months are in a year? A typed number. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-months-in-year', subtopicId: 'Tveebi-seasonebi', difficulty: 1 }),
    prompt: '{asked}',
    // The year's own counts — twelve months, four seasons — asked in four
    // phrasings so the answer is not simply memorised from one sentence.
    variables: {
      form: { kind: 'choice', values: ['months', 'seasons', 'months-word', 'seasons-word'] },
      asked: {
        kind: 'choice',
        values: (v: Vars) => [
          v.form === 'months'
            ? 'რამდენი თვეა წელიწადში?'
            : v.form === 'seasons'
              ? 'რამდენი სეზონია წელიწადში?'
              : v.form === 'months-word'
                ? 'რომელი რიცხვია წელიწადის თვეების რაოდენობა?'
                : 'რამდენ ნაწილად იყოფა წელიწადი საქართველოში?',
        ],
      },
      counted: { kind: 'choice', values: (v: Vars) => [String(v.form).startsWith('months') ? 'months' : 'seasons'] },
    },
    answer: (v: Vars) => (v.counted === 'months' ? MONTHS.length : SEASONS.length),
    format: { kind: 'integer', min: 1, max: 20, entry: true },
    distractors: ({ vars }) => (vars.counted === 'months' ? ['10', '11', '13'] : ['2', '5', '6']),
    visual: (v: Vars) =>
      v.counted === 'months'
        ? MONTHS.map((month, at) => `${at + 1}. ${month}`).join(' · ')
        : SEASONS.map((item) => `${item.name} (${item.months.join(', ')})`).join('\n'),
    explanation: (context) =>
      context.vars.counted === 'months'
        ? `წელიწადში ${MONTHS.length} თვეა: იანვრიდან დეკემბრამდე.`
        : `საქართველოში წელიწადი ${SEASONS.length} სეზონად იყოფა: ${SEASONS.map((item) => item.name).join(', ')}.`,
  }),

  /**
   * Q27's mirror image: counting back across the new year. „Four months after
   * March“ is Q27; this is the same operation in the other direction, which is
   * the one a child gets wrong by stopping at January.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-3-months-wrap-back', subtopicId: 'Tveebi-seasonebi', difficulty: 3 }),
    prompt: 'ახლა {month}ა. რომელი თვე იყო {steps} თვით ადრე?',
    variables: {
      month: { kind: 'choice', values: ['იანვარი', 'თებერვალი', 'მარტი'] },
      steps: { kind: 'int', min: 1, max: 5 },
    },
    constraints: [{ note: 'the answer is in the previous year, so the wrap is the question', test: () => true }],
    answer: (v: Vars) => monthBefore(String(v.month), Number(v.steps)),
    options: (v: Vars) => {
      const month = String(v.month);
      const steps = Number(v.steps);
      const right = monthBefore(month, steps);
      const wrongs = [monthBefore(month, steps - 1), monthAfter(month, 12 - steps), monthBefore(month, steps + 1), monthAfter(month, steps)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => monthStrip(String(v.month)),
    explanation: (context) => {
      const month = String(context.vars.month);
      const steps = Number(context.vars.steps);
      return `${month} წლის დასაწყისშია, ამიტომ ${steps} თვით უკან წასვლისას წინა წელში გადავდივართ: ${context.answer}.`;
    },
  }),

  /** Q26, Q48 — a few months ahead. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-months-ahead', subtopicId: 'Tveebi-seasonebi', difficulty: 3 }),
    prompt: 'ახლა {month}ა. რომელი თვე იქნება {steps} თვის შემდეგ?',
    variables: {
      month: { kind: 'choice', values: MONTH_KEYS },
      steps: { kind: 'int', min: 2, max: 11 },
    },
    answer: (v: Vars) => monthAfter(String(v.month), Number(v.steps)),
    options: (v: Vars) => {
      const month = String(v.month);
      const steps = Number(v.steps);
      const right = monthAfter(month, steps);
      // The mistakes: stopping a month early or late, counting back instead of
      // on, and forgetting that December wraps round to January.
      const wrongs = [monthAfter(month, steps - 1), monthAfter(month, steps + 1), monthBefore(month, steps), monthAfter(month, steps + 2)];
      return [right, ...wrongs].filter((name, index, all) => all.indexOf(name) === index).slice(0, 4);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => monthStrip(String(v.month)),
    explanation: (context) => {
      const month = String(context.vars.month);
      const steps = Number(context.vars.steps);
      return `${month} თვიდან ${steps} თვე წინ — ეს არის ${context.answer}.`;
    },
  }),

  /** Which season is this month in? The season is computed, never a second table. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-season-of-month', subtopicId: 'Tveebi-seasonebi', difficulty: 2 }),
    prompt: 'რომელ სეზონს ეკუთვნის {month}?',
    variables: {
      month: { kind: 'choice', values: MONTH_KEYS },
    },
    answer: (v: Vars) => seasonOfMonth(String(v.month)).name,
    options: (v: Vars) => {
      const right = seasonOfMonth(String(v.month)).name;
      return [right, ...SEASONS.map((item) => item.name).filter((name) => name !== right)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => monthStrip(String(v.month)),
    explanation: (context) => `${context.vars.month} — ${genitive(String(context.answer))} თვეა: ${seasonOfMonth(String(context.vars.month)).note}.`,
  }),

  /** The month that belongs to a season, asked the other way round. */
  defineTemplate({
    ...address({ id: 'g1-u13-3-month-of-season', subtopicId: 'Tveebi-seasonebi', difficulty: 3 }),
    prompt: '{ask} რომელი თვე ეკუთვნის მონიშნულ სეზონს?',
    variables: {
      which: { kind: 'choice', values: ['spring', 'summer', 'autumn', 'winter'] },
      season: { kind: 'choice', values: (v: Vars) => [SEASONS.find((item) => item.key === String(v.which))!.name] },
      seasonGen: { kind: 'choice', values: (v: Vars) => [genitive(String(v.season))] },
      slot: { kind: 'choice', values: [0, 1, 2] },
      asked: { kind: 'choice', values: ['first', 'any'] },
      ask: {
        kind: 'choice',
        values: (v: Vars) => [
          v.asked === 'first' ? `წელიწადის რომელი პერიოდია ${v.seasonGen}?` : `${v.seasonGen} რომელი თვეა?`,
        ],
      },
    },
    answer: (v: Vars) => {
      const found = SEASONS.find((item) => item.key === String(v.which))!;
      return found.months[Number(v.slot)]!;
    },
    options: (v: Vars) => {
      const found = SEASONS.find((item) => item.key === String(v.which))!;
      const right = found.months[Number(v.slot)]!;
      const others = SEASONS.filter((item) => item.key !== String(v.which)).map((item) => item.months[Number(v.slot)]!);
      return [right, ...others];
    },
    format: { kind: 'text' },
    visual: (v: Vars) =>
      SEASONS.map((item) => `${item.key === String(v.which) ? '▶' : '  '} ${item.name}: ${item.months.join(', ')}`).join('\n'),
    explanation: (context) => `${context.vars.seasonGen} თვეებია: ${SEASONS.find((item) => item.key === String(context.vars.which))!.months.join(', ')}.`,
  }),


];

/** The twelve months, with the named one boxed. */
function monthStrip(month: string): string {
  return MONTHS.map((name) => (name === month ? `[${name}]` : name)).join(' · ');
}

/* ================================================================== *\
 * U13.4 — დროის ამოცანები (Q28–Q37), 10 templates
 * ================================================================== */

const u134: QuestionTemplate[] = [
  /** Q28, Q30 — a start time plus a whole number of hours. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-end-after-hours', subtopicId: 'drois-amocanebi', difficulty: 1 }),
    prompt: '{activity} იწყება {start}-ზე და გრძელდება {hours} საათი. რომელ საათზე დასრულდება?',
    variables: {
      which: { kind: 'choice', values: ['lesson', 'game', 'film', 'walk'] },
      activity: { kind: 'choice', values: (v: Vars) => [ACTIVITY[String(v.which)]!.name] },
      minutes: { kind: 'int', min: 1, max: 8, step: 1 },
      hours: { kind: 'int', min: 1, max: 3 },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60)] },
    },
    constraints: [{ note: 'the finish is still on the same morning, so nothing has to wrap', test: (v: Vars) => Number(v.minutes) + Number(v.hours) <= 11 }],
    answer: (v: Vars) => timeText((Number(v.minutes) + Number(v.hours)) * 60),
    options: (v: Vars) => timeOptions((Number(v.minutes) + Number(v.hours)) * 60),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.minutes) * 60),
    explanation: (context) => `${context.vars.start} + ${context.vars.hours} საათი = ${context.answer}.`,
  }),

  /** Q29 — a start and an end, both whole hours: how long? */
  defineTemplate({
    ...address({ id: 'g1-u13-4-hours-between', subtopicId: 'drois-amocanebi', difficulty: 1 }),
    prompt: 'მულტფილმი იწყება {start}-ზე და მთავრდება {end}-ზე. რამდენ ხანს გაგრძელდა?',
    variables: {
      minutes: { kind: 'int', min: 1, max: 8 },
      hours: { kind: 'int', min: 1, max: 3 },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60)] },
      end: { kind: 'choice', values: (v: Vars) => [timeText((Number(v.minutes) + Number(v.hours)) * 60)] },
    },
    answer: (v: Vars) => Number(v.hours),
    format: { kind: 'integer', min: 0, max: 12, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 2].filter((value) => value > 0 && value !== Number(answer)).map(String),
    visual: (v: Vars) => `${clockFace(Number(v.minutes) * 60)}\n\n${clockFace((Number(v.minutes) + Number(v.hours)) * 60)}`,
    explanation: (context) => `${context.vars.end} − ${context.vars.start} = ${context.answer} საათი.`,
  }),

  /** Q31 — a start and an end at half hours. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-hours-and-minutes-between', subtopicId: 'drois-amocanebi', difficulty: 2 }),
    prompt: 'გაკვეთილი იწყება {start}-ზე და სრულდება {end}-ზე. რამდენ ხანს გრძელდება?',
    variables: {
      minutes: { kind: 'int', min: 8, max: 11 },
      extra: { kind: 'int', min: 1, max: 2 },
      rest: { kind: 'choice', values: [30, 0] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60)] },
      end: {
        kind: 'choice',
        values: (v: Vars) => [timeText(Number(v.minutes) * 60 + Number(v.extra) * 60 + Number(v.rest))],
      },
    },
    answer: (v: Vars) => {
      const total = Number(v.extra) * 60 + Number(v.rest);
      return total;
    },
    format: { kind: 'integer', min: 0, max: 240, entry: true },
    distractors: ({ answer }) => [Number(answer) + 30, Number(answer) - 30, Number(answer) + 60].filter((value) => value > 0).map(String),
    visual: (v: Vars) => `${clockFace(Number(v.minutes) * 60)}\n\n${clockFace(Number(v.minutes) * 60 + Number(v.extra) * 60 + Number(v.rest))}`,
    explanation: (context) => `${context.vars.start}-იდან ${context.vars.end}-მდე გადის ${durationWords(Number(context.answer))}.`,
  }),

  /** Q32, Q34 — a start and a duration: when does it end? */
  defineTemplate({
    ...address({ id: 'g1-u13-4-end-after-minutes', subtopicId: 'drois-amocanebi', difficulty: 2 }),
    prompt: '{activity} იწყება {start}-ზე და გრძელდება {duration} წუთი. რომელ საათზე დასრულდება?',
    variables: {
      which: { kind: 'choice', values: ['bus', 'training', 'lesson', 'film'] },
      activity: { kind: 'choice', values: (v: Vars) => [ACTIVITY[String(v.which)]!.name] },
      minutes: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [0, 30] },
      duration: { kind: 'choice', values: [30, 45, 60, 90, 120, 180] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60 + Number(v.rest))] },
    },
    constraints: [{ note: 'the finish stays inside the same morning', test: (v: Vars) => Number(v.minutes) * 60 + Number(v.rest) + Number(v.duration) <= 12 * 60 }],
    answer: (v: Vars) => timeText(Number(v.minutes) * 60 + Number(v.rest) + Number(v.duration)),
    options: (v: Vars) => timeOptions(Number(v.minutes) * 60 + Number(v.rest) + Number(v.duration)),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.minutes) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} + ${context.vars.duration} წუთი = ${context.answer}.`,
  }),

  /** Q33 — how many minutes did it take? A typed number. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-minutes-taken', subtopicId: 'drois-amocanebi', difficulty: 2 }),
    prompt: 'ბავშვმა კითხვა დაიწყო {start}-ზე და დაასრულა {end}-ზე. რამდენი წუთი კითხულობდა?',
    variables: {
      minutes: { kind: 'int', min: 1, max: 8 },
      rest: { kind: 'choice', values: [0, 15, 30, 45] },
      duration: { kind: 'choice', values: [15, 30, 45, 60, 90] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60 + Number(v.rest))] },
      end: {
        kind: 'choice',
        values: (v: Vars) => [timeText(Number(v.minutes) * 60 + Number(v.rest) + Number(v.duration))],
      },
    },
    answer: (v: Vars) => Number(v.duration),
    format: { kind: 'integer', min: 0, max: 240, entry: true },
    distractors: ({ answer }) => [Number(answer) + 15, Number(answer) - 15, Number(answer) + 30].filter((value) => value > 0 && value !== Number(answer)).map(String),
    visual: (v: Vars) => `${clockFace(Number(v.minutes) * 60 + Number(v.rest))}\n\n${clockFace(Number(v.minutes) * 60 + Number(v.rest) + Number(v.duration))}`,
    explanation: (context) => `${context.vars.start}-იდან ${context.vars.end}-მდე გადის ${context.answer} წუთი.`,
  }),

  /**
   * Q36 — a duration that crosses noon, where subtracting the hour numbers
   * alone gives the wrong answer (8:30 to 13:00 is four and a half hours, not
   * five and a half).
   *
   * The hour is written the way Q36 writes it — „1:00“ for one in the afternoon
   * — and the afternoon is said out loud, because on a 12-hour dial „1:00“ is
   * also an hour after midnight.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-4-across-noon', subtopicId: 'drois-amocanebi', difficulty: 3 }),
    prompt: 'ნინო სკოლაში დილის {start}-ზე მივიდა და შუადღის {endText}-ზე წამოვიდა. რამდენ ხანს იყო სკოლაში?',
    variables: {
      minutes: { kind: 'choice', values: [8, 9, 10] },
      rest: { kind: 'choice', values: [0, 30] },
      end: { kind: 'choice', values: [13, 14, 15] },
      endRest: { kind: 'choice', values: [0, 30] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.minutes) * 60 + Number(v.rest))] },
      endText: {
        kind: 'choice',
        values: (v: Vars) => [timeText(Number(v.end) * 60 + Number(v.endRest)).replace(/^1[2-9]/, String(Number(v.end) - 12))],
      },
    },
    constraints: [
      {
        note: 'she left in the afternoon, after a real morning at school',
        test: (v: Vars) => Number(v.end) * 60 + Number(v.endRest) - (Number(v.minutes) * 60 + Number(v.rest)) >= 60,
      },
    ],
    answer: (v: Vars) => Number(v.end) * 60 + Number(v.endRest) - (Number(v.minutes) * 60 + Number(v.rest)),
    format: { kind: 'integer', min: 0, max: 480, entry: true },
    distractors: ({ answer }) => [Number(answer) + 60, Number(answer) - 60, Number(answer) + 30].filter((value) => value > 0 && value !== Number(answer)).map(String),
    visual: (v: Vars) => `${clockFace(Number(v.minutes) * 60 + Number(v.rest))}\n\n${clockFace(Number(v.end) * 60 + Number(v.endRest))}`,
    explanation: (context) => `სკოლაში იყო ${durationWords(Number(context.answer))}: ${context.vars.start}-იდან ${context.vars.endText}-მდე (შუადღისას).`,
  }),

  /** Q37 — two pieces of a game, added. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-total-minutes', subtopicId: 'drois-amocanebi', difficulty: 3 }),
    prompt: 'თამაშის პირველი ნაწილი {first} წუთი გაგრძელდა, მეორე — {second} წუთი. რამდენი წუთი გაგრძელდა თამაში სულ?',
    variables: {
      first: { kind: 'int', min: 5, max: 55, step: 5 },
      second: { kind: 'int', min: 5, max: 55, step: 5 },
    },
    answer: (v: Vars) => Number(v.first) + Number(v.second),
    format: { kind: 'integer', min: 0, max: 120, entry: true },
    distractors: ({ vars, answer }) => {
      const first = Number(vars.first);
      const second = Number(vars.second);
      return [Number(answer) + 5, Number(answer) - 5, Math.abs(first - second)].filter((value) => value > 0 && value !== Number(answer)).map(String);
    },
    explanation: (context) => `${context.vars.first} + ${context.vars.second} = ${context.answer} წუთი.`,
  }),

  /** A duration added to a half-hour start, where the hour changes on the way. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-half-past-plus', subtopicId: 'drois-amocanebi', difficulty: 3 }),
    prompt: '{activity} იწყება {start}-ზე და მთავრდება {end}-ზე. რამდენი წუთი გრძელდება?',
    variables: {
      which: { kind: 'choice', values: ['lesson', 'film', 'walk'] },
      activity: { kind: 'choice', values: (v: Vars) => [ACTIVITY[String(v.which)]!.name] },
      hour: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [45, 30, 15] },
      duration: { kind: 'choice', values: [30, 45, 60, 75, 90] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
      end: {
        kind: 'choice',
        values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration))],
      },
    },
    answer: (v: Vars) => Number(v.duration),
    format: { kind: 'integer', min: 1, max: 240, entry: true },
    distractors: ({ vars }) => {
      const right = Number(vars.duration);
      return [right + 15, right - 15, right + 30].filter((value) => value > 0 && value !== right).map(String);
    },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} + ${context.vars.duration} წუთი = ${context.answer}.`,
  }),

  /**
   * A break taken out of a longer stretch — the subtraction case among the
   * duration questions, which otherwise all add.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-4-break-in-the-middle', subtopicId: 'drois-amocanebi', difficulty: 3 }),
    prompt: 'რეპეტიცია გრძელდებოდა {total} წუთი, აქედან {rest} წუთი შესვენება იყო. რამდენი წუთი იმუშავეს?',
    variables: {
      total: { kind: 'choice', values: [60, 75, 90, 120] },
      rest: { kind: 'choice', values: [10, 15, 20, 30] },
    },
    answer: (v: Vars) => Number(v.total) - Number(v.rest),
    format: { kind: 'integer', min: 0, max: 180, entry: true },
    distractors: ({ vars, answer }) => {
      const total = Number(vars.total);
      const rest = Number(vars.rest);
      return [total + rest, Number(answer) + 10, Number(answer) - 10, Number(answer) + 15]
        .filter((value, index, all) => value > 0 && value !== Number(answer) && all.indexOf(value) === index)
        .map(String)
        .slice(0, 3);
    },
    explanation: (context) => `${context.vars.total} − ${context.vars.rest} = ${context.answer} წუთი.`,
  }),

  /** Two durations and a clock, where the answer must be added to the start. */
  defineTemplate({
    ...address({ id: 'g1-u13-4-two-parts-on-clock', subtopicId: 'drois-amocanebi', difficulty: 3 }),
    prompt: 'ვარჯიში დაიწყო {start}-ზე. გახურებას დასჭირდა {first} წუთი, ძირითად ნაწილს — {second} წუთი. რომელ საათზე დასრულდა?',
    variables: {
      hour: { kind: 'int', min: 1, max: 8 },
      first: { kind: 'choice', values: [10, 15, 20] },
      second: { kind: 'choice', values: [25, 30, 40] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60)] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.first) + Number(v.second)),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + Number(v.first) + Number(v.second)),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60),
    explanation: (context) => `${context.vars.first} + ${context.vars.second} = ${Number(context.vars.first) + Number(context.vars.second)} წუთი. ${context.vars.start} + ${Number(context.vars.first) + Number(context.vars.second)} წუთი = ${context.answer}.`,
  }),
];

/** The activities the duration questions are about, with their Georgian names. */
const ACTIVITY: Record<string, { name: string; hours?: boolean }> = {
  lesson: { name: 'გაკვეთილი' },
  game: { name: 'თამაში' },
  film: { name: 'ფილმი' },
  walk: { name: 'გასეირნება' },
  bus: { name: 'ავტობუსი' },
  training: { name: 'ვარჯიში' },
};

/* ================================================================== *\
 * U13.5 — სხვა დროის პოვნა (Q38–Q45, Q49), 10 templates
 * ================================================================== */

const u135: QuestionTemplate[] = [
  /** Q38, Q39 — one hour on, one hour back, typed. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-hour-step', subtopicId: 'sxva-dro', difficulty: 1 }),
    prompt: 'საათი აჩვენებს {start}-ს. რა დრო იქნება {direction}?',
    variables: {
      hour: { kind: 'int', min: 2, max: 11 },
      forward: { kind: 'choice', values: ['forward', 'back'] },
      direction: { kind: 'choice', values: (v: Vars) => [v.forward === 'forward' ? 'ერთი საათის შემდეგ' : 'ერთი საათით ადრე'] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60)] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + (v.forward === 'forward' ? 60 : -60)),
    format: { kind: 'text', time: true },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60),
    explanation: (context) => `${context.vars.start} ${context.vars.direction} = ${context.answer}.`,
  }),

  /** Q40 — half an hour on, which lands exactly on the next hour. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-half-hour-on', subtopicId: 'sxva-dro', difficulty: 1 }),
    prompt: 'ახლა {start}-ია. რა დრო იქნება 30 წუთის შემდეგ?',
    variables: {
      hour: { kind: 'int', min: 1, max: 11 },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + 30)] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + 30 + 30),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + 60),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + 30),
    explanation: (context) => `ნახევარი საათი — 30 წუთი. ${context.vars.start} + 30 წუთი = ${context.answer}.`,
  }),

  /** Q41 — a quarter of an hour on. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-quarters-on', subtopicId: 'sxva-dro', difficulty: 2 }),
    prompt: 'ახლა {start}-ია. რა დრო იქნება 15 წუთის შემდეგ?',
    variables: {
      hour: { kind: 'int', min: 1, max: 10 },
      rest: { kind: 'choice', values: [0, 15, 30] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest) + 15),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + Number(v.rest) + 15),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} + 15 წუთი = ${context.answer}.`,
  }),

  /** Q42 — half an hour back. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-half-hour-back', subtopicId: 'sxva-dro', difficulty: 2 }),
    prompt: 'ახლა {start}-ია. რა დრო იყო 30 წუთის წინ?',
    variables: {
      hour: { kind: 'int', min: 2, max: 11 },
      rest: { kind: 'choice', values: [0, 15, 45] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest) - 30),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + Number(v.rest) - 30),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} − 30 წუთი = ${context.answer}.`,
  }),

  /** Q43 — several hours on, typed. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-hours-ahead', subtopicId: 'sxva-dro', difficulty: 2 }),
    prompt: 'საათი აჩვენებს {start}-ს. რა დრო იქნება {steps} საათის შემდეგ?',
    variables: {
      hour: { kind: 'int', min: 1, max: 9 },
      steps: { kind: 'int', min: 1, max: 3 },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60)] },
    },
    answer: (v: Vars) => timeText((Number(v.hour) + Number(v.steps)) * 60),
    format: { kind: 'text', time: true },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60),
    explanation: (context) => `${context.vars.start} + ${context.vars.steps} საათი = ${context.answer}.`,
  }),

  /** Q44 — ninety minutes on, where adding the hours and minutes separately fails. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-minutes-ahead', subtopicId: 'sxva-dro', difficulty: 3 }),
    prompt: 'ახლა {start}-ია. რა დრო იქნება {duration} წუთის შემდეგ?',
    variables: {
      hour: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [0, 15, 30, 45] },
      duration: { kind: 'choice', values: [45, 60, 75, 90, 105, 120] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
    },
    constraints: [{ note: 'the answer stays on the same morning', test: (v: Vars) => Number(v.hour) * 60 + Number(v.rest) + Number(v.duration) <= 12 * 60 }],
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration)),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration)),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} + ${context.vars.duration} წუთი = ${context.answer}.`,
  }),

  /** Q45 — the gap between two quarter-hour times. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-gap-between', subtopicId: 'sxva-dro', difficulty: 3 }),
    prompt: 'შეხვედრა იწყება {start}-ზე და მთავრდება {end}-ზე. რამდენი დრო გავიდა?',
    variables: {
      hour: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [0, 15, 30, 45] },
      duration: { kind: 'choice', values: [30, 45, 60, 75, 90] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
      end: {
        kind: 'choice',
        values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration))],
      },
    },
    answer: (v: Vars) => Number(v.duration),
    format: { kind: 'integer', min: 0, max: 180, entry: true },
    distractors: ({ answer }) => [Number(answer) + 15, Number(answer) - 15, Number(answer) + 30].filter((value) => value > 0 && value !== Number(answer)).map(String),
    visual: (v: Vars) => `${clockFace(Number(v.hour) * 60 + Number(v.rest))}\n\n${clockFace(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration))}`,
    explanation: (context) => `${context.vars.start}-იდან ${context.vars.end}-მდე გადის ${context.answer} წუთი.`,
  }),

  /** Q49 — a lesson that ends at a quarter past, typed. */
  defineTemplate({
    ...address({ id: 'g1-u13-5-end-typed', subtopicId: 'sxva-dro', difficulty: 2 }),
    prompt: 'გაკვეთილი იწყება {start}-ზე და გრძელდება {duration} წუთი. ჩაწერე, რომელ საათზე დასრულდება.',
    variables: {
      hour: { kind: 'int', min: 1, max: 9 },
      rest: { kind: 'choice', values: [0, 30] },
      duration: { kind: 'choice', values: [15, 45, 60] },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.duration)),
    format: { kind: 'text', time: true },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60 + Number(v.rest)),
    explanation: (context) => `${context.vars.start} + ${context.vars.duration} წუთი = ${context.answer}.`,
  }),

  /**
   * The time an hour before, shown on a face where the hands have moved on:
   * reading backwards from a picture, not from a sentence.
   */
  defineTemplate({
    ...address({ id: 'g1-u13-5-hour-back-from-face', subtopicId: 'sxva-dro', difficulty: 3 }),
    prompt: 'ნახატზე {start} საათია. რა დრო იყო ორი საათით ადრე?',
    variables: {
      hour: { kind: 'int', min: 3, max: 11 },
      start: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60)] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 - 120),
    options: (v: Vars) => timeOptions(Number(v.hour) * 60 - 120),
    format: { kind: 'text' },
    visual: (v: Vars) => clockFace(Number(v.hour) * 60),
    explanation: (context) => `${context.vars.start} − 2 საათი = ${context.answer}.`,
  }),

  /** Before/after as a comparison: which of the two times is earlier? */
  defineTemplate({
    ...address({ id: 'g1-u13-5-earlier-or-later', subtopicId: 'sxva-dro', difficulty: 2 }),
    prompt: 'რომელი დროა უფრო ადრე: {first} თუ {second}?',
    optionCount: 2,
    variables: {
      hour: { kind: 'int', min: 1, max: 8 },
      rest: { kind: 'choice', values: [0, 30] },
      gap: { kind: 'choice', values: [30, 60, 90] },
      first: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest))] },
      second: { kind: 'choice', values: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.gap))] },
    },
    answer: (v: Vars) => timeText(Number(v.hour) * 60 + Number(v.rest)),
    options: (v: Vars) => [timeText(Number(v.hour) * 60 + Number(v.rest)), timeText(Number(v.hour) * 60 + Number(v.rest) + Number(v.gap))],
    format: { kind: 'text' },
    visual: (v: Vars) => `#1\n${clockFace(Number(v.hour) * 60 + Number(v.rest))}\n\n#2\n${clockFace(Number(v.hour) * 60 + Number(v.rest) + Number(v.gap))}`,
    explanation: (context) => `${timeText(Number(context.vars.hour) * 60 + Number(context.vars.rest))} უფრო ადრეა, ვიდრე ${timeText(Number(context.vars.hour) * 60 + Number(context.vars.rest) + Number(context.vars.gap))}.`,
  }),
];

/* ================================================================== *\
 * Exports
 * ================================================================== */

/** Every U13 template, in curriculum order. */
export const U13_TEMPLATES: QuestionTemplate[] = [...u131, ...u132, ...u133, ...u134, ...u135];

/** Subtopic ids this library is responsible for. */
export const U13_SUBTOPICS = ['saatis-wakitxva', 'kviris-dgeebi', 'Tveebi-seasonebi', 'drois-amocanebi', 'sxva-dro'];
