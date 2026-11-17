/**
 * Building blocks for the interactive templates (Grades I–II).
 *
 * An interactive template is an ordinary template whose answer is something the
 * student *does* to a picture — set a clock, fill a ten-frame, tap a number line —
 * rather than something they pick from a list. Its `answer` is the canonical
 * string of the interaction (see `interactions/types.ts`), so the engine marks it
 * like any other question.
 */
import type { GradeId } from '../types';
import type { InteractionSpec } from '../interactions/types';
import type { Picture } from '../pictures/types';
import { defineTemplate } from './types';
import type { QuestionTemplate, TemplateConstraint, VariableSpec, Vars } from './types';

/** Things a child can count: the drawn icon and its Georgian noun (after a numeral). */
export const OBJECTS: Array<{ icon: string; noun: string }> = [
  { icon: 'apple', noun: 'ვაშლი' },
  { icon: 'pear', noun: 'მსხალი' },
  { icon: 'banana', noun: 'ბანანი' },
  { icon: 'star', noun: 'ვარსკვლავი' },
  { icon: 'ball', noun: 'ბურთი' },
  { icon: 'flower-pink', noun: 'ყვავილი' },
  { icon: 'fish', noun: 'თევზი' },
  { icon: 'bird', noun: 'ჩიტი' },
  { icon: 'balloon', noun: 'ბუშტი' },
  { icon: 'heart', noun: 'გული' },
  { icon: 'cookie', noun: 'ნამცხვარი' },
  { icon: 'car', noun: 'მანქანა' },
];

export const nounOf = (icon: string | number | Array<string | number>): string =>
  OBJECTS.find((o) => o.icon === icon)?.noun ?? 'ობიექტი';

/** `obj` (icon key) and `noun` (derived, so they always agree). */
export const objectVars = (): Record<string, VariableSpec> => ({
  obj: { kind: 'choice', values: OBJECTS.map((o) => o.icon) },
  noun: { kind: 'choice', values: (v: Vars) => [nounOf(v.obj!)] },
});

export const num = (v: Vars, key: string): number => Number(v[key]);
export const str = (v: Vars, key: string): string => String(v[key]);

/** A row of `count` identical icons, as a picture. */
export const rowOf = (icon: string, count: number, label?: string): Picture => ({
  kind: 'rows',
  rows: [{ label, tokens: Array.from({ length: count }, () => ({ t: 'icon' as const, icon })) }],
});

/** Two groups side by side, separated by a gap. */
export const twoGroups = (icon: string, a: number, b: number, icon2: string = icon): Picture => ({
  kind: 'rows',
  rows: [
    {
      tokens: [
        { t: 'group', tokens: Array.from({ length: a }, () => ({ t: 'icon' as const, icon })) },
        { t: 'text', text: '+' },
        { t: 'group', tokens: Array.from({ length: b }, () => ({ t: 'icon' as const, icon: icon2 })) },
      ],
    },
  ],
});

export const ORDINALS = ['პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე', 'მეექვსე', 'მეშვიდე', 'მერვე', 'მეცხრე', 'მეათე'];

export interface TemplateBody {
  prompt: string;
  variables: Record<string, VariableSpec>;
  constraints?: QuestionTemplate['constraints'];
  answer: QuestionTemplate['answer'];
  explanation: QuestionTemplate['explanation'];
  interaction?: (vars: Vars) => InteractionSpec;
  pictures?: (vars: Vars) => Picture[];
  hint?: string;
  time?: boolean;
  /** For a choice question with a fixed option set (letters, signs, „კი/არა“). */
  options?: QuestionTemplate['options'];
  optionCount?: number;
  distractors?: QuestionTemplate['distractors'];
  /** Set to 'text' when the answer is a word or a sign, not a number. */
  text?: boolean;
}

/** A template factory bound to one grade/topic/unit. */
export function interactiveSet(grade: GradeId, topicId: string, prefix: string) {
  return (subtopicId: string, key: string, difficulty: 1 | 2 | 3, body: TemplateBody): QuestionTemplate =>
    defineTemplate({
      id: `${prefix}-${key}`,
      grade,
      topicId,
      unitId: topicId,
      subtopicId,
      difficulty,
      prompt: body.prompt,
      variables: body.variables,
      constraints: body.constraints,
      answer: body.answer,
      explanation: body.explanation,
      interaction: body.interaction,
      pictures: body.pictures,
      hint: body.hint,
      options: body.options,
      optionCount: body.optionCount,
      distractors: body.distractors,
      format: { kind: body.time || body.text ? 'text' : undefined, time: body.time || undefined },
    });
}

export const int = (min: number, max: number, extra: { step?: number; reverse?: boolean } = {}): VariableSpec => ({
  kind: 'int',
  min,
  max,
  ...extra,
});
export const pick = (...values: Array<number | string>): VariableSpec => ({ kind: 'choice', values });

/** A clock time `HH:MM`, 12-hour dial. */
export const hhmm = (hour: number, minute: number): string =>
  `${String(((hour + 11) % 12) + 1).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

export const WEEKDAY_NAMES = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
export const MONTH_NAMES = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

export const SHAPES: Array<{ icon: string; name: string; sides: number }> = [
  { icon: 'shape-circle', name: 'წრე', sides: 0 },
  { icon: 'shape-triangle', name: 'სამკუთხედი', sides: 3 },
  { icon: 'shape-square', name: 'კვადრატი', sides: 4 },
  { icon: 'shape-rectangle', name: 'მართკუთხედი', sides: 4 },
  { icon: 'shape-pentagon', name: 'ხუთკუთხედი', sides: 5 },
  { icon: 'shape-hexagon', name: 'ექვსკუთხედი', sides: 6 },
];

/* ---- small builders shared by the pictured templates ---- */

/** Base-ten blocks for `n` (≤ 99), captioned. */
export const blocksOf = (n: number, label?: string): Picture => ({ kind: 'blocks', tens: Math.floor(n / 10), ones: n % 10, label });
/** Blocks with an explicit tens/ones split (so ones may exceed 9). */
export const blocksTO = (tens: number, ones: number, label?: string): Picture => ({ kind: 'blocks', tens, ones, label });

type Token = Extract<Picture, { kind: 'rows' }>['rows'][number]['tokens'][number];
export const icons = (icon: string, count: number, state?: 'crossed' | 'faded'): Token[] =>
  Array.from({ length: count }, () => ({ t: 'icon' as const, icon, state }));
/** One captioned row of identical icons; `crossed` of them struck out. */
export const iconRow = (icon: string, count: number, label?: string, crossed = 0): Picture => ({
  kind: 'rows',
  rows: [{ label, tokens: [...icons(icon, count - crossed), ...icons(icon, crossed, 'crossed')] }],
});
/** Several captioned rows at once. */
export const manyRows = (rows: Array<{ label?: string; tokens: Token[] }>): Picture => ({ kind: 'rows', rows });

/** The numbers must all differ. */
export const distinct = (...keys: string[]): TemplateConstraint => ({
  test: (v: Vars) => new Set(keys.map((k) => Number(v[k]))).size === keys.length,
  note: 'რიცხვები განსხვავებულია',
});
/** A variable computed from the ones drawn before it (always one value). */
export const derived = (fn: (v: Vars) => number | string): VariableSpec => ({ kind: 'choice', values: (v: Vars) => [fn(v)] });
/** Options for a text answer: the key plus the others, in this fixed set. */
export const fixed = (...values: string[]) => (): string[] => values;
