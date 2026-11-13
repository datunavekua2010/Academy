/**
 * U15 — ტოლი ნაწილები (equal parts and sharing).
 *
 * Thirty templates over the curriculum's two subtopics, directly mapping the
 * twenty specification questions and providing full Level 1, 2, and 3 coverage:
 *
 *   U15.1 `diagramiT-gayofa`   Q1–Q10 + 4 extension templates   14 templates
 *   U15.2 `toli-nawilebi-2`    Q1–Q10 + 6 extension templates   16 templates
 *
 * Every question draws its picture from `parts.ts`. The prompt, the diagram,
 * and the answer are generated from the same data, guaranteeing that:
 *  - the number of items or parts shown on screen matches the numbers in the prompt;
 *  - sharing diagrams show exactly `total ÷ recipients` per group;
 *  - divided shape diagrams are equal if and only if each part has the same token size.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';
import {
  CONTAINER_LIST,
  SHARE_ITEM_LIST,
  containerByKey,
  dividedChocolate,
  dividedCircle,
  dividedPizza,
  dividedRectangle,
  dividedSquare,
  dividedStrip,
  drawDividedParts,
  itemByKey,
  letteredFigures,
  sharingBoxesDiagram,
  sharingLabeledDiagram,
  sharingWithRemainderDiagram,
} from './parts';

const grade = 1 as const;
const topicId = 'toli-nawilebi';
const unitId = 'toli-nawilebi';

export const U15_SUBTOPICS = ['diagramiT-gayofa', 'toli-nawilebi-2'] as const;

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: (typeof U15_SUBTOPICS)[number]; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

const ITEM_KEYS = SHARE_ITEM_LIST.map((item) => item.key);
const CONTAINER_KEYS = CONTAINER_LIST.map((c) => c.key);

const numericDistractors = (answer: number): string[] => {
  const candidates = [answer - 1, answer + 1, answer + 2, answer - 2, answer + 3]
    .filter((n) => n > 0 && n !== answer);
  return candidates.slice(0, 3).map(String);
};

/* ================================================================== *\
 * U15.1: გაყოფა დიაგრამით (diagramiT-gayofa)
 * ================================================================== */

const U15_1_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — Sharing items equally among children (Spec Q1, Q2, Q3, Q4, Q5, Q7, Q8, Q10).
   * E.g. 6 apples shared among 2 children -> 3 each.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-share-children', subtopicId: 'diagramiT-gayofa', difficulty: 1 }),
    prompt: '{total} {itemName} თანაბრად გაუნაწილეს {children} ბავშვს. რამდენი {itemName} შეხვდა თითოეულს?',
    variables: {
      children: { kind: 'choice', values: [2, 3, 4, 5] },
      perChild: { kind: 'int', min: 2, max: 5 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.perChild)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.total) <= 20, note: 'within 20' },
    ],
    answer: (v: Vars) => Number(v.perChild),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.children} = ${answer}, ამიტომ თითოეულ ბავშვს ${answer} შეხვდა.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingLabeledDiagram(Number(v.children), Number(v.perChild), item.emoji, 'ბავშვი');
    },
  }),

  /**
   * L1 — Sharing items into containers/vases (Spec Q9).
   * E.g. 12 flowers put equally into 3 vases -> 4 flowers in each.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-share-containers', subtopicId: 'diagramiT-gayofa', difficulty: 1 }),
    prompt: '{total} {itemName} თანაბრად ჩააწყვეს {containers} {containerIn}. რამდენი {itemName} მოხვდა თითოეულში?',
    variables: {
      containerKey: { kind: 'choice', values: CONTAINER_KEYS },
      containers: { kind: 'choice', values: [2, 3, 4] },
      perContainer: { kind: 'int', min: 2, max: 5 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.containers) * Number(v.perContainer)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
      containerIn: { kind: 'choice', values: (v: Vars) => [containerByKey(String(v.containerKey)).inName] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.total) <= 20, note: 'within 20' },
    ],
    answer: (v: Vars) => Number(v.perContainer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.containers} = ${answer}, ამიტომ თითოეულში ${answer} მოხვდა.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const container = containerByKey(String(v.containerKey));
      return sharingLabeledDiagram(Number(v.containers), Number(v.perContainer), item.emoji, container.name);
    },
  }),

  /**
   * L1 — Count how many items in each group from diagram.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-count-per-group-diagram', subtopicId: 'diagramiT-gayofa', difficulty: 1 }),
    prompt: 'დიაგრამაზე {total} {itemName} გაყოფილია {groups} ტოლ ჯგუფად. რამდენი {itemName} არის თითოეულ ჯგუფში?',
    variables: {
      groups: { kind: 'choice', values: [2, 3, 4] },
      perGroup: { kind: 'int', min: 2, max: 5 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.groups) * Number(v.perGroup)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => Number(v.perGroup),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} გაყოფილია ${vars.groups} ტოლ ჯგუფად. თითოეულ ჯგუფში არის ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingBoxesDiagram(Number(v.groups), Number(v.perGroup), item.emoji);
    },
  }),

  /**
   * L1 — Halving objects (sharing into 2 equal parts).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-halving-objects', subtopicId: 'diagramiT-gayofa', difficulty: 1 }),
    prompt: '{total} {itemName} გაყვეს ორ ტოლ ნაწილად (გაანახევრეს). რამდენი {itemName} არის თითოეულ ნახევარში?',
    variables: {
      half: { kind: 'int', min: 2, max: 8 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} = ${answer} + ${answer}, ამიტომ ნახევარი არის ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingLabeledDiagram(2, Number(v.half), item.emoji, 'ჯგუფი');
    },
  }),

  /**
   * L1 — Finding the number of recipients / groups given per-group count.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-how-many-groups', subtopicId: 'diagramiT-gayofa', difficulty: 1 }),
    prompt: '{total} {itemName} დაარიგეს ისე, რომ თითოეულ ბავშვს შეხვდა {perGroup}. რამდენ ბავშვს შეხვდა {itemName}? დააკვირდი დიაგრამას.',
    variables: {
      groups: { kind: 'choice', values: [2, 3, 4, 5] },
      perGroup: { kind: 'int', min: 2, max: 4 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.groups) * Number(v.perGroup)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => Number(v.groups),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.perGroup} = ${answer}, ამიტომ ${vars.itemName} შეხვდა ${answer} ბავშვს.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingLabeledDiagram(Number(v.groups), Number(v.perGroup), item.emoji, 'ბავშვი');
    },
  }),

  /**
   * L2 — Sharing with larger totals (totals 12–24, divisors 3, 4, 5, 6).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-share-larger', subtopicId: 'diagramiT-gayofa', difficulty: 2 }),
    prompt: '{total} {itemName} თანაბრად გაუნაწილეს {children} ბავშვს. რამდენი {itemName} შეხვდა თითოეულს?',
    variables: {
      children: { kind: 'choice', values: [3, 4, 5, 6] },
      perChild: { kind: 'int', min: 3, max: 5 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.perChild)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.total) >= 12 && Number(v.total) <= 24, note: 'larger range' },
    ],
    answer: (v: Vars) => Number(v.perChild),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.children} = ${answer}, ამიტომ თითოეულს შეხვდა ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingLabeledDiagram(Number(v.children), Number(v.perChild), item.emoji, 'ბავშვი');
    },
  }),

  /**
   * L2 — Identify the matching division equation.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-which-share-equation', subtopicId: 'diagramiT-gayofa', difficulty: 2 }),
    prompt: '{total} {itemName} თანაბრად გაუნაწილეს {children} ბავშვს და თითოეულს შეხვდა {perChild}. რომელი გამოსახულება შეესაბამება ამ გაყოფას?',
    variables: {
      children: { kind: 'choice', values: [2, 3, 4, 5] },
      perChild: { kind: 'int', min: 2, max: 5 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.perChild)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => `${v.total} ÷ ${v.children} = ${v.perChild}`,
    options: (v: Vars) => {
      const t = Number(v.total);
      const c = Number(v.children);
      const p = Number(v.perChild);
      return [
        `${t} ÷ ${c} = ${p}`,
        `${t} - ${c} = ${t - c}`,
        `${t} + ${c} = ${t + c}`,
        `${c} × ${c} = ${c * c}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `სულ იყო ${vars.total} საგანი, რომელიც გაიყო ${vars.children} ბავშვზე: ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingBoxesDiagram(Number(v.children), Number(v.perChild), item.emoji);
    },
  }),

  /**
   * L2 — Verifying equal vs unequal sharing from diagram.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-fair-or-unfair-sharing', subtopicId: 'diagramiT-gayofa', difficulty: 2 }),
    prompt: 'დააკვირდი ნახატს. განაწილებულია თუ არა {itemName} თანაბრად ორ ბავშვს შორის?',
    variables: {
      equal: { kind: 'choice', values: [1, 0] },
      p1: { kind: 'int', min: 2, max: 5 },
      p2: {
        kind: 'choice',
        values: (v: Vars) => (Number(v.equal) === 1 ? [Number(v.p1)] : [Number(v.p1) + 1]),
      },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => (Number(v.equal) === 1 ? 'თანაბრად' : 'არათანაბრად'),
    optionCount: 2,
    options: () => ['თანაბრად', 'არათანაბრად'],
    explanation: ({ vars }) =>
      Number(vars.equal) === 1
        ? `ორივე ბავშვს აქვს ${vars.p1} ${vars.itemName}, ამიტომ განაწილებულია თანაბრად.`
        : `ერთ ბავშვს აქვს ${vars.p1}, მეორეს — ${vars.p2}, ამიტომ განაწილებულია არათანაბრად.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const line1 = `1-ლი ბავშვი: ${Array.from({ length: Number(v.p1) }, () => item.emoji).join(' ')}`;
      const line2 = `მე-2 ბავშვი: ${Array.from({ length: Number(v.p2) }, () => item.emoji).join(' ')}`;
      return `${line1}\n${line2}`;
    },
  }),

  /**
   * L2 — Missing total (reverse sharing / multiplication model).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-missing-total', subtopicId: 'diagramiT-gayofa', difficulty: 2 }),
    prompt: '{children} ბავშვს თანაბრად დაურიგეს {itemName}. თითოეულს შეხვდა {perChild}. სულ რამდენი {itemName} დაარიგეს?',
    variables: {
      children: { kind: 'choice', values: [2, 3, 4, 5] },
      perChild: { kind: 'int', min: 2, max: 4 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.perChild)] },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => Number(v.total),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.children} × ${vars.perChild} = ${answer}, სულ დაარიგეს ${answer} ${vars.itemName}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingLabeledDiagram(Number(v.children), Number(v.perChild), item.emoji, 'ბავშვი');
    },
  }),

  /**
   * L2 — Can this total be shared equally without remainder?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-equal-share-yes-no', subtopicId: 'diagramiT-gayofa', difficulty: 2 }),
    prompt: 'შესაძლებელია თუ არა {total} {itemName}-ის თანაბრად გაყოფა {children} ბავშვზე ნაშთის გარეშე?',
    variables: {
      children: { kind: 'choice', values: [2, 3] },
      total: { kind: 'int', min: 5, max: 12 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => (Number(v.total) % Number(v.children) === 0 ? 'დიახ' : 'არა'),
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.total) % Number(vars.children);
      return rem === 0
        ? `${vars.total} იყოფა ${vars.children}-ზე უნაშთოდ: ${answer}.`
        : `${vars.total} არ იყოფა ${vars.children}-ზე უნაშთოდ (ნაშთია ${rem}): ${answer}.`;
    },
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const count = Number(v.total);
      return Array.from({ length: count }, () => item.emoji).join(' ');
    },
  }),

  /**
   * L3 — Sharing with remainder: how many left over?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-share-with-remainder', subtopicId: 'diagramiT-gayofa', difficulty: 3 }),
    prompt: '{total} {itemName} თანაბრად გაუნაწილეს {children} ბავშვს. თითოეულმა მიიღო მაქსიმალურად თანაბარი რაოდენობა. რამდენი {itemName} დარჩა გაუნაწილებელი?',
    variables: {
      children: { kind: 'choice', values: [3, 4] },
      perChild: { kind: 'int', min: 2, max: 4 },
      remainder: { kind: 'choice', values: [1, 2] },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.perChild) + Number(v.remainder)] },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.remainder) < Number(v.children), note: 'remainder less than divisor' },
    ],
    answer: (v: Vars) => Number(v.remainder),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} = (${vars.children} × ${vars.perChild}) + ${answer}, ამიტომ დარჩა ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      return sharingWithRemainderDiagram(
        Number(v.children),
        Number(v.perChild),
        Number(v.remainder),
        item.emoji,
        'ბავშვი',
      );
    },
  }),

  /**
   * L3 — How many more needed for target share?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-how-many-more-needed', subtopicId: 'diagramiT-gayofa', difficulty: 3 }),
    prompt: '{children} ბავშვს სურს {itemName}-ის თანაბრად გაყოფა ისე, რომ თითოეულს {target} შეხვდეს. მათ აქვთ {current} {itemName}. კიდევ რამდენი {itemName} სჭირდებათ?',
    variables: {
      children: { kind: 'choice', values: [2, 3, 4] },
      target: { kind: 'int', min: 3, max: 5 },
      short: { kind: 'choice', values: [1, 2] },
      current: { kind: 'choice', values: (v: Vars) => [Number(v.children) * Number(v.target) - Number(v.short)] },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    answer: (v: Vars) => Number(v.short),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) => {
      const needed = Number(vars.children) * Number(vars.target);
      return `სულ საჭიროა ${vars.children} × ${vars.target} = ${needed}. აკლიათ ${needed} - ${vars.current} = ${answer}.`;
    },
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const count = Number(v.current);
      return Array.from({ length: count }, () => item.emoji).join(' ');
    },
  }),

  /**
   * L3 — Two-step sharing problem: total after adding, then shared equally.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-two-step-sharing', subtopicId: 'diagramiT-gayofa', difficulty: 3 }),
    prompt: 'ნიკას ჰქონდა {start} {itemName}. მან კიდევ {added} იყიდა. შემდეგ ყველა {itemName} თანაბრად გაუყო თავის მეგობარს. რამდენი {itemName} შეხვდა თითოეულს?',
    variables: {
      start: { kind: 'int', min: 2, max: 6 },
      added: { kind: 'int', min: 2, max: 6 },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
    },
    constraints: [
      { test: (v: Vars) => (Number(v.start) + Number(v.added)) % 2 === 0, note: 'even sum' },
    ],
    answer: (v: Vars) => (Number(v.start) + Number(v.added)) / 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.start) + Number(vars.added);
      return `სულ გახდა ${vars.start} + ${vars.added} = ${sum}. ორზე გაყოფით: ${sum} ÷ 2 = ${answer}.`;
    },
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const share = (Number(v.start) + Number(v.added)) / 2;
      return sharingLabeledDiagram(2, share, item.emoji, 'ბავშვი');
    },
  }),

  /**
   * L3 — Compare shares between two groups.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-compare-shares', subtopicId: 'diagramiT-gayofa', difficulty: 3 }),
    prompt: 'პირველ ჯგუფში {aTotal} {itemName} გაუნაწილეს {aKids} ბავშვს. მეორე ჯგუფში {bTotal} {itemName} გაუნაწილეს {bKids} ბავშვს. რომელ ჯგუფში შეხვდა თითოეულ ბავშვს მეტი?',
    variables: {
      aKids: { kind: 'choice', values: [2, 3] },
      aPer: { kind: 'choice', values: [2, 4] },
      bKids: { kind: 'choice', values: [2, 4] },
      bPer: { kind: 'choice', values: [3, 5] },
      itemKey: { kind: 'choice', values: ITEM_KEYS },
      itemName: { kind: 'choice', values: (v: Vars) => [itemByKey(String(v.itemKey)).name] },
      aTotal: { kind: 'choice', values: (v: Vars) => [Number(v.aKids) * Number(v.aPer)] },
      bTotal: { kind: 'choice', values: (v: Vars) => [Number(v.bKids) * Number(v.bPer)] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.aPer) !== Number(v.bPer), note: 'different shares' },
    ],
    answer: (v: Vars) => (Number(v.aPer) > Number(v.bPer) ? 'პირველ ჯგუფში' : 'მეორე ჯგუფში'),
    optionCount: 2,
    options: () => ['პირველ ჯგუფში', 'მეორე ჯგუფში'],
    explanation: ({ vars, answer }) =>
      `პირველში: ${vars.aTotal} ÷ ${vars.aKids} = ${vars.aPer}. მეორეში: ${vars.bTotal} ÷ ${vars.bKids} = ${vars.bPer}. მეტი შეხვდა ${answer}.`,
    visual: (v: Vars) => {
      const item = itemByKey(String(v.itemKey));
      const g1 = `A ჯგუფი:\n${sharingLabeledDiagram(Number(v.aKids), Number(v.aPer), item.emoji, 'ბავშვი')}`;
      const g2 = `B ჯგუფი:\n${sharingLabeledDiagram(Number(v.bKids), Number(v.bPer), item.emoji, 'ბავშვი')}`;
      return `${g1}\n\n${g2}`;
    },
  }),
];

/* ================================================================== *\
 * U15.2: ტოლი ნაწილები (toli-nawilebi-2)
 * ================================================================== */

const U15_2_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — Equal vs unequal parts recognition (Spec Q1, Q2, Q3, Q4, Q5).
   * E.g. rectangle divided into 2 equal parts -> თანაბარი.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-equal-vs-unequal', subtopicId: 'toli-nawilebi-2', difficulty: 1 }),
    prompt: '{shapeName} გაყოფილია {description}. ეს ნაწილები არის თანაბარი თუ არათანაბარი?',
    variables: {
      shape: { kind: 'choice', values: ['rectangle', 'square', 'circle', 'pizza'] },
      equal: { kind: 'choice', values: [1, 0] },
      parts: { kind: 'choice', values: [2, 4] },
      shapeName: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = String(v.shape);
          if (s === 'rectangle') return ['მართკუთხედი'];
          if (s === 'square') return ['კვადრატი'];
          if (s === 'circle') return ['წრე'];
          return ['პიცა'];
        },
      },
      description: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = String(v.shape);
          const eq = Number(v.equal) === 1;
          const p = Number(v.parts);
          if (s === 'rectangle') return [dividedRectangle(p, eq).description];
          if (s === 'square') return [dividedSquare(p, eq).description];
          if (s === 'circle') return [dividedCircle(p, eq).description];
          return [dividedPizza(p, eq).description];
        },
      },
    },
    answer: (v: Vars) => (Number(v.equal) === 1 ? 'თანაბარი' : 'არათანაბარი'),
    optionCount: 2,
    options: () => ['თანაბარი', 'არათანაბარი'],
    explanation: ({ vars, answer }) =>
      Number(vars.equal) === 1
        ? `ყველა ნაწილი ერთნაირი ზომისაა, ამიტომ ნაწილები არის ${answer}.`
        : `ნაწილები განსხვავებული ზომისაა, ამიტომ ნაწილები არის ${answer}.`,
    visual: (v: Vars) => {
      const s = String(v.shape);
      const eq = Number(v.equal) === 1;
      const p = Number(v.parts);
      if (s === 'rectangle') return dividedRectangle(p, eq).visual;
      if (s === 'square') return dividedSquare(p, eq).visual;
      if (s === 'circle') return dividedCircle(p, eq).visual;
      return dividedPizza(p, eq).visual;
    },
  }),

  /**
   * L1 — Counting equal parts (Spec Q7, Q8, Q10).
   * E.g. square divided into 4 equal parts -> 4.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-count-equal-parts', subtopicId: 'toli-nawilebi-2', difficulty: 1 }),
    prompt: '{shapeName} გაყოფილია {parts} თანაბარ ნაწილად. რამდენი თანაბარი ნაწილია?',
    variables: {
      shape: { kind: 'choice', values: ['square', 'circle', 'rectangle', 'strip'] },
      parts: { kind: 'choice', values: [2, 3, 4] },
      shapeName: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = String(v.shape);
          if (s === 'square') return ['კვადრატი'];
          if (s === 'circle') return ['წრე'];
          if (s === 'rectangle') return ['მართკუთხედი'];
          return ['ზოლი'];
        },
      },
    },
    answer: (v: Vars) => Number(v.parts),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.shapeName} გაყოფილია ${answer} თანაბარ ნაწილად.`,
    visual: (v: Vars) => {
      const s = String(v.shape);
      const p = Number(v.parts);
      if (s === 'square') return dividedSquare(p, true).visual;
      if (s === 'circle') return dividedCircle(p, true).visual;
      if (s === 'rectangle') return dividedRectangle(p, true).visual;
      return dividedStrip(p, true).visual;
    },
  }),

  /**
   * L1 — Are parts equal: ტოლია თუ არ არის ტოლი?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-are-parts-equal', subtopicId: 'toli-nawilebi-2', difficulty: 1 }),
    prompt: 'დააკვირდი ნახატს. ნაწილები ერთმანეთის ტოლია თუ არა?',
    variables: {
      shape: { kind: 'choice', values: ['rectangle', 'circle', 'chocolate', 'square'] },
      parts: { kind: 'choice', values: [2, 3] },
      equal: { kind: 'choice', values: [1, 0] },
    },
    answer: (v: Vars) => (Number(v.equal) === 1 ? 'ტოლია' : 'არ არის ტოლი'),
    optionCount: 2,
    options: () => ['ტოლია', 'არ არის ტოლი'],
    explanation: ({ vars, answer }) =>
      Number(vars.equal) === 1
        ? `ნაწილები ერთი და იმავე ზომისაა, ამიტომ ისინი ${answer}.`
        : `ნაწილები განსხვავდება ზომით, ამიტომ ${answer}.`,
    visual: (v: Vars) => {
      const s = String(v.shape);
      const p = Number(v.parts);
      const eq = Number(v.equal) === 1;
      if (s === 'rectangle') return dividedRectangle(p, eq).visual;
      if (s === 'circle') return dividedCircle(p, eq).visual;
      if (s === 'chocolate') return dividedChocolate(p, eq).visual;
      return dividedSquare(p, eq).visual;
    },
  }),

  /**
   * L1 — Naming halves (2 equal parts -> ნახევარი).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-halves-name', subtopicId: 'toli-nawilebi-2', difficulty: 1 }),
    prompt: 'როდესაც {shapeName} გაყოფილია 2 ტოლ ნაწილად, თითოეულ ნაწილს ეწოდება:',
    variables: {
      shape: { kind: 'choice', values: ['rectangle', 'circle', 'square'] },
      shapeName: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = String(v.shape);
          if (s === 'rectangle') return ['მართკუთხედი'];
          if (s === 'circle') return ['წრე'];
          return ['კვადრატი'];
        },
      },
    },
    answer: () => 'ნახევარი',
    optionCount: 3,
    options: () => ['ნახევარი', 'მეოთხედი', 'მესამედი'],
    explanation: ({ vars }) =>
      `${vars.shapeName}-ის 2 ტოლ ნაწილად გაყოფისას თითოეულ ნაწილს ნახევარი ეწოდება.`,
    visual: () => drawDividedParts([2, 2]),
  }),

  /**
   * L1 — Naming quarters (4 equal parts -> მეოთხედი).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-1-quarters-name', subtopicId: 'toli-nawilebi-2', difficulty: 1 }),
    prompt: 'როდესაც {shapeName} გაყოფილია 4 ტოლ ნაწილად, თითოეულ ნაწილს ეწოდება:',
    variables: {
      shape: { kind: 'choice', values: ['square', 'circle', 'rectangle'] },
      shapeName: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = String(v.shape);
          if (s === 'square') return ['კვადრატი'];
          if (s === 'circle') return ['წრე'];
          return ['მართკუთხედი'];
        },
      },
    },
    answer: () => 'მეოთხედი',
    optionCount: 3,
    options: () => ['მეოთხედი', 'ნახევარი', 'მესამედი'],
    explanation: ({ vars }) =>
      `${vars.shapeName}-ის 4 ტოლ ნაწილად გაყოფისას თითოეულ ნაწილს მეოთხედი ეწოდება.`,
    visual: () => drawDividedParts([2, 2, 2, 2]),
  }),

  /**
   * L2 — Which picture shows N equal parts: A vs B (Spec Q6, Q9).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-which-shows-equal', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'რომელი ნახატი გვიჩვენებს {parts} თანაბარ ნაწილს?',
    variables: {
      shape: { kind: 'choice', values: ['rectangle', 'circle', 'square', 'strip'] },
      parts: { kind: 'choice', values: [2, 3, 4] },
      equalLetter: { kind: 'choice', values: ['A', 'B'] },
    },
    answer: (v: Vars) => String(v.equalLetter),
    optionCount: 2,
    options: () => ['A', 'B'],
    explanation: ({ vars, answer }) =>
      `ნახატ ${answer}-ზე ყველა ნაწილი ერთი და იმავე ზომისაა, ამიტომ ის გვიჩვენებს ${vars.parts} თანაბარ ნაწილს.`,
    visual: (v: Vars) => {
      const s = String(v.shape);
      const p = Number(v.parts);
      const getter =
        s === 'square'
          ? dividedSquare
          : s === 'circle'
            ? dividedCircle
            : s === 'rectangle'
              ? dividedRectangle
              : dividedStrip;
      const equalFig = getter(p, true);
      const unequalFig = getter(p, false);
      return String(v.equalLetter) === 'A'
        ? letteredFigures(equalFig, unequalFig)
        : letteredFigures(unequalFig, equalFig);
    },
  }),

  /**
   * L2 — Which picture shows UNequal parts: A vs B.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-which-shows-unequal', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'რომელი ნახატი გვიჩვენებს არათანაბარ ნაწილებს?',
    variables: {
      shape: { kind: 'choice', values: ['rectangle', 'circle', 'square', 'strip'] },
      parts: { kind: 'choice', values: [2, 3] },
      unequalLetter: { kind: 'choice', values: ['A', 'B'] },
    },
    answer: (v: Vars) => String(v.unequalLetter),
    optionCount: 2,
    options: () => ['A', 'B'],
    explanation: ({ answer }) =>
      `ნახატ ${answer}-ზე ნაწილები სხვადასხვა ზომისაა, ამიტომ ისინი არათანაბარია.`,
    visual: (v: Vars) => {
      const s = String(v.shape);
      const p = Number(v.parts);
      const getter =
        s === 'square'
          ? dividedSquare
          : s === 'circle'
            ? dividedCircle
            : s === 'rectangle'
              ? dividedRectangle
              : dividedStrip;
      const equalFig = getter(p, true);
      const unequalFig = getter(p, false);
      return String(v.unequalLetter) === 'A'
        ? letteredFigures(unequalFig, equalFig)
        : letteredFigures(equalFig, unequalFig);
    },
  }),

  /**
   * L2 — How many halves make a whole?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-halves-in-whole', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'რამდენი ნახევარი ნაწილი ქმნის მთელ {shapeName}-ს?',
    variables: {
      shapeName: { kind: 'choice', values: ['წრე', 'მართკუთხედი', 'კვადრატი', 'პიცა'] },
    },
    answer: () => 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: () => ['1', '3', '4'],
    explanation: ({ vars }) => `მთელი ${vars.shapeName} შედგება 2 ნახევრისგან.`,
    visual: () => drawDividedParts([2, 2]),
  }),

  /**
   * L2 — How many quarters make a whole?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-quarters-in-whole', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'რამდენი მეოთხედი ნაწილი ქმნის მთელ {shapeName}-ს?',
    variables: {
      shapeName: { kind: 'choice', values: ['კვადრატი', 'წრე', 'მართკუთხედი', 'პიცა'] },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: () => ['2', '3', '5'],
    explanation: ({ vars }) => `მთელი ${vars.shapeName} შედგება 4 მეოთხედისგან.`,
    visual: () => drawDividedParts([2, 2, 2, 2]),
  }),

  /**
   * L2 — Shaded vs unshaded equal parts.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-shaded-equal-parts', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'ფიგურა გაყოფილია {totalParts} ტოლ ნაწილად. {shaded} ნაწილი გაფერადებულია (■). რამდენი ნაწილია გაუფერადებელი (□)?',
    variables: {
      totalParts: { kind: 'choice', values: [3, 4] },
      shaded: { kind: 'choice', values: [1, 2] },
    },
    answer: (v: Vars) => Number(v.totalParts) - Number(v.shaded),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.totalParts} - ${vars.shaded} = ${answer} გაუფერადებელი ნაწილი.`,
    visual: (v: Vars) => {
      const total = Number(v.totalParts);
      const sh = Number(v.shaded);
      const partsArr: string[] = [];
      for (let i = 0; i < total; i += 1) {
        partsArr.push(i < sh ? '[ ■ ]' : '[ □ ]');
      }
      return partsArr.join('   ');
    },
  }),

  /**
   * L2 — Chocolate bar split: is it fair/equal?
   */
  defineTemplate({
    ...address({ id: 'g1-u15-2-chocolate-fair-split', subtopicId: 'toli-nawilebi-2', difficulty: 2 }),
    prompt: 'შოკოლადის ფილა გაყვეს ორ ნაწილად: პირველში არის {p1} ნატეხი, მეორეში — {p2} ნატეხი. არის ეს გაყოფა თანაბარი?',
    variables: {
      equal: { kind: 'choice', values: [1, 0] },
      p1: { kind: 'choice', values: [2, 3] },
      p2: {
        kind: 'choice',
        values: (v: Vars) => (Number(v.equal) === 1 ? [Number(v.p1)] : [Number(v.p1) === 2 ? 3 : 1]),
      },
    },
    answer: (v: Vars) => (Number(v.equal) === 1 ? 'თანაბარი' : 'არათანაბარი'),
    optionCount: 2,
    options: () => ['თანაბარი', 'არათანაბარი'],
    explanation: ({ vars }) =>
      Number(vars.equal) === 1
        ? `ორივე ნაწილში ${vars.p1} ნატეხია, ამიტომ გაყოფა არის თანაბარი.`
        : `ერთში ${vars.p1} ნატეხია, მეორეში — ${vars.p2}, ამიტომ გაყოფა არის არათანაბარი.`,
    visual: (v: Vars) => {
      const b1 = Array.from({ length: Number(v.p1) }, () => '🍫').join(' ');
      const b2 = Array.from({ length: Number(v.p2) }, () => '🍫').join(' ');
      return `[ ${b1} ]   │   [ ${b2} ]`;
    },
  }),

  /**
   * L3 — Number of cuts needed to divide a strip into N equal parts.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-cuts-for-equal-parts', subtopicId: 'toli-nawilebi-2', difficulty: 3 }),
    prompt: 'სწორი ზოლის {parts} ტოლ ნაწილად გასაყოფად, რამდენი გაჭრაა საჭირო?',
    variables: {
      parts: { kind: 'choice', values: [2, 3, 4, 5] },
    },
    answer: (v: Vars) => Number(v.parts) - 1,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.parts} ნაწილის მისაღებად ზოლი უნდა გაიჭრას ${vars.parts} - 1 = ${answer}-ჯერ.`,
    visual: (v: Vars) => {
      const p = Number(v.parts);
      const segments = Array.from({ length: p }, (_, i) => `[ ${i + 1} ]`);
      return segments.join(' ✂️ ');
    },
  }),

  /**
   * L3 — Balancing unequal parts (how many to move).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-balance-parts', subtopicId: 'toli-nawilebi-2', difficulty: 3 }),
    prompt: 'მართკუთხედი გაყოფილია ორ ნაწილად: პირველში არის {p1} უჯრა, მეორეში — {p2} უჯრა. რამდენი უჯრა უნდა გადავიტანოთ მეორედან პირველში, რომ ნაწილები გათანაბრდეს?',
    variables: {
      p1: { kind: 'choice', values: [1, 2, 3] },
      diff: { kind: 'choice', values: [2, 4] },
      p2: { kind: 'choice', values: (v: Vars) => [Number(v.p1) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff) / 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) => {
      const total = Number(vars.p1) + Number(vars.p2);
      const half = total / 2;
      return `სულ არის ${total} უჯრა. თითოეულში უნდა იყოს ${half}. გადასატანია ${half} - ${vars.p1} = ${answer}.`;
    },
    visual: (v: Vars) => {
      const b1 = Array.from({ length: Number(v.p1) }, () => '■').join(' ');
      const b2 = Array.from({ length: Number(v.p2) }, () => '■').join(' ');
      return `[ ${b1} ]   │   [ ${b2} ]`;
    },
  }),

  /**
   * L3 — Folding along symmetry line produces equal parts.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-fold-symmetry-equal', subtopicId: 'toli-nawilebi-2', difficulty: 3 }),
    prompt: 'თუ {shapeName} შუაზე გადავკეცავთ სიმეტრიის ხაზზე, მიღებული ორი ნაწილი იქნება:',
    variables: {
      shapeName: { kind: 'choice', values: ['კვადრატს', 'მართკუთხედს', 'წრეს'] },
    },
    answer: () => 'თანაბარი',
    optionCount: 2,
    options: () => ['თანაბარი', 'არათანაბარი'],
    explanation: () =>
      `სიმეტრიის ხაზი ფიგურას ორ თანაბარ (ტოლ) ნაწილად ყოფს.`,
    visual: () => `[ ■ ■ ]   [ ■ ■ ]`,
  }),

  /**
   * L3 — Combining two halves makes one whole.
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-combine-halves', subtopicId: 'toli-nawilebi-2', difficulty: 3 }),
    prompt: 'თუ {shapeGen} ორ თანაბარ ნახევარს შევაერთებთ, რას მივიღებთ?',
    variables: {
      shapeGen: { kind: 'choice', values: ['წრის', 'მართკუთხედის', 'კვადრატის', 'ვაშლის'] },
    },
    answer: () => 'ერთ მთელს',
    optionCount: 3,
    options: () => ['ერთ მთელს', 'ორ მთელს', 'ნახევარს'],
    explanation: () => `ორი ნახევარი ერთად ქმნის ერთ მთელს (½ + ½ = 1).`,
    visual: () => `½ + ½ = 1`,
  }),

  /**
   * L3 — Naming thirds (3 equal parts -> მესამედი).
   */
  defineTemplate({
    ...address({ id: 'g1-u15-3-three-equal-parts-third', subtopicId: 'toli-nawilebi-2', difficulty: 3 }),
    prompt: 'როდესაც {shapeName} გაყოფილია 3 ტოლ ნაწილად, თითოეულ ნაწილს ეწოდება:',
    variables: {
      shapeName: { kind: 'choice', values: ['მართკუთხედი', 'ზოლი', 'წრე'] },
    },
    answer: () => 'მესამედი',
    optionCount: 3,
    options: () => ['მესამედი', 'ნახევარი', 'მეოთხედი'],
    explanation: ({ vars }) =>
      `${vars.shapeName}-ის 3 ტოლ ნაწილად გაყოფისას თითოეულ ნაწილს მესამედი ეწოდება.`,
    visual: () => drawDividedParts([2, 2, 2]),
  }),
];

export const U15_TEMPLATES: QuestionTemplate[] = [...U15_1_TEMPLATES, ...U15_2_TEMPLATES];
