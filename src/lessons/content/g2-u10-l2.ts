import type { Lesson, Cell } from '../types';

/**
 * GRADE 2 · U10.2 "Finding Lines of Symmetry".
 *
 * The lines a picture really has are `linesOfSymmetry(cells)` — every vertical and horizontal line through the picture's
 * own bounding box is tried, and only the ones that reflect the picture onto itself are reported. A picture can have
 * none, one, or both.
 */
const HEART: Cell[] = [
  { x: 1, y: 0 },
  { x: 3, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
];

/** A solid 3×3 square: a vertical line and a horizontal line, both through the middle. */
const BLOCK: Cell[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
];

/** A cross: both lines too, but the shape is not a square. */
const CROSS: Cell[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 2 },
];

/** A staircase — one vertical line only, down column 1: the two sides step up towards each other. */
const STAIR: Cell[] = [
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
];

export const g2u10l2: Lesson = {
  id: 'g2-u10-l2',
  status: 'placeholder',
  objective: 'ვპოულობ ფიგურის სარკის ხაზებს, ვარჩევ ვერტიკალურ და ჰორიზონტალურს და ვითვლი, რამდენი აქვს.',
  prerequisites: ['სიმეტრიული და არასიმეტრიული ფიგურა (U10.1)'],
  minutes: 13,
  concepts: ['სარკის ხაზი', 'ვერტიკალური ხაზი', 'ჰორიზონტალური ხაზი', 'რამდენი სარკის ხაზი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! სარკის ხაზებს ახლა თვითონ პოულობ.',
    retry: 'სცადე ისევ. სცადე ორივე მიმართულება: ვერტიკალური და ჰორიზონტალური.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რამდენი სარკის ხაზი აქვს ჯვარს?',
      mascot: { intro: 'დღეს სარკის ხაზებს ვეძებთ.' },
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: CROSS } },
      response: { type: 'symmetry-line', picture: { width: 3, height: 3, cells: CROSS }, candidates: [{ axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 }], ask: 'count' },
      hints: ['სცადე ვერტიკალური ხაზი შუაზე.', 'სცადე ჰორიზონტალური ხაზი შუაზე.'],
      explanation: 'ჯვარს ორი სარკის ხაზი აქვს: ვერტიკალური და ჰორიზონტალური, ორივე შუაზე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. სცადე ორივე მიმართულება.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ეძებე სარკის ხაზი',
      prompt: 'სრიალა ხაზი გადააადგილე ფიგურაზე და ნახე, რომელი ხაზია ნამდვილი სარკის ხაზი.',
      hints: ['ზოგი ფიგურა მხოლოდ ერთ მიმართულებას ემთხვევა.', 'ნამდვილი ხაზი ფიგურას თავის თავზე ადებს.'],
      tool: { tool: 'mirror-lab', pictures: [{ width: 5, height: 4, cells: HEART }, { width: 3, height: 3, cells: CROSS }, { width: 3, height: 3, cells: STAIR }] },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ერთი ფიგურა — რამდენიმე სარკის ხაზი',
      prompt: 'ვნახოთ, რამდენი სარკის ხაზი შეიძლება ჰქონდეს ერთ ფიგურას.',
      blocks: [
        { type: 'symmetry-demo', mode: 'fold', picture: { width: 3, height: 3, cells: CROSS }, line: { axis: 'vertical', at: 2 }, steps: ['ჯვარი — ვერტიკალურ ხაზზე სიმეტრიულია.', 'ჰორიზონტალურ ხაზზეც სიმეტრიულია.', 'ასე ჯვარს ორი სარკის ხაზი აქვს.', 'გული კი მხოლოდ ერთს — ვერტიკალურს.'] },
        { type: 'text', text: 'სარკის ხაზი ვერტიკალური ან ჰორიზონტალური შეიძლება იყოს. ზოგ ფიგურას ერთი აქვს, ზოგს — ორი, ზოგს კი არც ერთი.' },
        { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART }, line: { axis: 'horizontal', at: 2 }, caption: 'გულს ჰორიზონტალური ხაზი არ აქვს: ზედა და ქვედა ნახევრები სხვადასხვაა.' },
        { type: 'grid-picture', picture: { width: 3, height: 3, cells: STAIR }, line: { axis: 'vertical', at: 2 }, caption: 'კიბეს მხოლოდ ვერტიკალური სარკის ხაზი აქვს.' },
        { type: 'callout', tone: 'tip', text: 'სარკის ხაზი ყოველთვის შუაზე არ გადის — მთავარია, ფიგურა მასზე ზუსტად აირეკლოს.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე გულის ნამდვილი სარკის ხაზი.',
      response: {
        type: 'symmetry-line',
        picture: { width: 5, height: 4, cells: HEART },
        candidates: [ { axis: 'vertical', at: 4 }, { axis: 'horizontal', at: 3 } ],
        ask: 'pick',
      },
      hints: ['სცადე ორივე ხაზი.', 'ჰორიზონტალურ ხაზზე ზედა და ქვედა ნახევრები ერთნაირია?'],
      explanation: 'გულს ვერტიკალური სარკის ხაზი აქვს შუაზე — მარცხენა და მარჯვენა ნახევრები ემთხვევა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მხოლოდ ის ხაზია სწორი, რომელზეც ფიგურა აირეკლება.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რამდენი სარკის ხაზი აქვს ჯვარს?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: CROSS } },
      response: { type: 'numeric', answer: 2, unit: 'ხაზი' },
      hints: ['სცადე ვერტიკალური ხაზი.', 'სცადე ჰორიზონტალური ხაზიც.'],
      explanation: 'ჯვარს ორი სარკის ხაზი აქვს: ვერტიკალური და ჰორიზონტალური.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე ორივე მიმართულება.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ ფიგურას აქვს მხოლოდ ვერტიკალური სარკის ხაზი?',
      response: {
        type: 'choice',
        options: [
          { id: 'cross', text: 'ჯვარი', visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: CROSS } } },
          { id: 'stair', text: 'კიბე', visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: STAIR } } },
        ],
        answer: 'stair',
      },
      hints: ['ვერტიკალური ხაზი მარცხენა და მარჯვენა ნახევრებს ადარებს.', 'ჯვარი ორივე ხაზზე სიმეტრიულია; კიბე — მხოლოდ ერთზე.'],
      explanation: 'კიბეს მხოლოდ ვერტიკალური სარკის ხაზი აქვს. ჯვარს ორივე აქვს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ჰორიზონტალურ ხაზზე ზედა და ქვედა ნახევრები უნდა ემთხვეოდეს.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე ჯვრის სარკის ხაზი.',
      response: {
        type: 'symmetry-line',
        picture: { width: 3, height: 3, cells: CROSS },
        candidates: [ { axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 } ],
        ask: 'pick',
      },
      hints: ['სცადე ორივე ხაზი.', 'ჯვარი ორივე ხაზზე აირეკლება.'],
      explanation: 'ჯვარი ვერტიკალურ და ჰორიზონტალურ ხაზზე ერთნაირად სიმეტრიულია — ორივე ხაზი სწორია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. სცადე ორივე ხაზი და შეადარე.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რამდენი სარკის ხაზი აქვს 3 × 3 კვადრატს?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: BLOCK } },
      response: { type: 'symmetry-line', picture: { width: 3, height: 3, cells: BLOCK }, candidates: [ { axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 } ], ask: 'count' },
      hints: [],
      explanation: 'კვადრატს ორი სარკის ხაზი აქვს: ვერტიკალური და ჰორიზონტალური.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე ორივე მიმართულება.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რამდენი სარკის ხაზი აქვს გულს?',
      visual: { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART } },
      response: { type: 'numeric', answer: 1, unit: 'ხაზი' },
      hints: [],
      explanation: 'გულს ერთი სარკის ხაზი აქვს — ვერტიკალური შუაზე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გულის ზედა და ქვედა ნახევრები სხვადასხვაა.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'აირჩიე ჯვრის სარკის ხაზები.',
      response: {
        type: 'symmetry-line',
        picture: { width: 3, height: 3, cells: CROSS },
        candidates: [ { axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 } ],
        ask: 'pick',
      },
      hints: [],
      explanation: 'ჯვარი ორივე მიმართულებაზე სიმეტრიულია — მისი სარკის ხაზები ორივეა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ჯვარი ორივე ხაზზე აირეკლება.',
    },
  ],
};
