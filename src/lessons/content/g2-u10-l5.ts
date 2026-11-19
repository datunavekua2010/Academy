import type { Lesson, Cell } from '../types';

/**
 * GRADE 2 · U10.5 "Solving Spatial and Shape-Pattern Puzzles".
 *
 * A repeating pattern is a block and a position: the item at place `n` is `block[n mod block.length]`, so the next
 * shape is computed rather than guessed. The puzzle cells are checked with the same reflection arithmetic the earlier
 * lessons use.
 */
/** A zigzag of three cells, used for the pattern and the puzzle. */
const ZIG: Cell[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 0 },
];

export const g2u10l5: Lesson = {
  id: 'g2-u10-l5',
  status: 'placeholder',
  objective: 'ვხსნი სივრცულ და ფიგურულ თავსატეხებს: ვაგრძელებ გამეორებად რიგს და ვასრულებ ფიგურას სარკულად.',
  prerequisites: ['არეკვლა (U10.4)'],
  minutes: 14,
  concepts: ['გამეორებადი ბლოკი', 'შემდეგი ელემენტი', 'სივრცითი თავსატეხი', 'სარკული დასრულება'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! თავსატეხებს ახლა თვითონ ხსნი.',
    retry: 'სცადე ისევ. იპოვე გამეორებადი ბლოკი და დათვალე ადგილები.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რა მოდის შემდეგ? წრე, კვადრატი, სამკუთხედი, წრე, კვადრატი, …',
      mascot: { intro: 'დღეს თავსატეხებს ვხსნით.' },
      visual: { type: 'shape-pattern', block: ['circle', 'square', 'triangle'], length: 8 },
      response: {
        type: 'choice',
        options: [
          { id: 'tri', text: 'სამკუთხედი ▲' },
          { id: 'circle', text: 'წრე ●' },
          { id: 'square', text: 'კვადრატი ■' },
        ],
        answer: 'tri',
      },
      hints: ['იპოვე ბლოკი: წრე, კვადრატი, სამკუთხედი.', 'ბლოკი სამ ელემენტს იმეორებს.'],
      explanation: 'ბლოკი სამი ფიგურისაა, ამიტომ მეშვიდე ადგილზე ისევ პირველი იწყება: წრე, კვადრატი, სამკუთხედი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე გამეორებადი ბლოკი.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'გააგრძელე რიგი',
      prompt: 'დაამატე ერთი ელემენტი და ნახე, როგორ იმეორებს ბლოკი თავის თავს.',
      hints: ['დათვალე ბლოკის სიგრძე.', 'ყოველ ბლოკის ბოლოს რიგი ისევ იწყება.'],
      tool: { tool: 'pattern-shapes-lab', block: ['circle', 'square', 'triangle'], length: 5 },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ბლოკი და ადგილი',
      prompt: 'ვნახოთ, როგორ ითვლება გამეორებადი რიგი.',
      blocks: [
        { type: 'symmetry-demo', mode: 'pattern', picture: { width: 3, height: 1, cells: ZIG }, block: ['circle', 'square', 'triangle'], length: 7, steps: ['აი რიგი: წრე, კვადრატი, სამკუთხედი.', 'ბლოკი სამი ფიგურისაა.', 'ყოველ მესამე ადგილზე ბლოკი ისევ იწყება.', 'მეშვიდე ადგილზე ისევ წრე იქნება.'] },
        { type: 'shape-pattern', block: ['circle', 'square', 'triangle'], length: 9, shown: 6, caption: 'რიგი ბლოკის მიხედვით გრძელდება.' },
        { type: 'text', text: 'გამეორებად რიგში ყოველთვის ერთი და იმავე ბლოკი მეორდება. ადგილის ნომერი ბლოკის სიგრძეზე რომ გავყოთ, ნაშთი გვეუბნება, რომელი ფიგურა დგას იმ ადგილას.' },
        { type: 'callout', tone: 'tip', text: 'ჯერ იპოვე ბლოკი, მერე დათვალე ადგილები — ასე „შემდეგი“ აღარ არის გამოცნობა.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რა მოდის შემდეგ? ■ ● ■ ● ■ …',
      visual: { type: 'shape-pattern', block: ['square', 'circle'], length: 7 },
      response: {
        type: 'choice',
        options: [
          { id: 'circle', text: 'წრე ●' },
          { id: 'square', text: 'კვადრატი ■' },
        ],
        answer: 'circle',
      },
      hints: ['ბლოკი ორი ელემენტისაა: კვადრატი, წრე.', 'ხუთის შემდეგ ისევ წრე მოდის.'],
      explanation: 'ბლოკი „კვადრატი, წრე“ ორი ელემენტისაა, ამიტომ კვადრატის შემდეგ ყოველთვის წრე მოდის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე ბლოკის სიგრძე.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რამდენი ელემენტია ბლოკში: ▲ ■ ★ ▲ ■ ★ ▲?',
      visual: { type: 'shape-pattern', block: ['triangle', 'square', 'star'], length: 7 },
      response: { type: 'numeric', answer: 3, unit: 'ელემენტი' },
      hints: ['სად იწყება გამეორება?', 'სამკუთხედი ისევ მეოთხე ადგილზე მოდის.'],
      explanation: 'ბლოკი სამი ელემენტისაა: სამკუთხედი, კვადრატი, ვარსკვლავი — და მერე ისევ იმეორება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე, სად იწყება იგივე რიგი.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაასრულე ფიგურა სარკულად.',
      // the zigzag is mirrored across column 2, so the grid must reach column 4 for its reflection to land inside
      response: { type: 'symmetry-fill', picture: { width: 5, height: 3, cells: ZIG }, line: { axis: 'vertical', at: 4 } },
      hints: ['ზიგზაგის სამი უჯრა მეორე მხარეს აირეკლე.', 'დათვალე ხაზიდან მანძილი.'],
      explanation: 'ზიგზაგის სამი უჯრა მეორე მხარეს იმავე მანძილზე აირეკლა — ფიგურა სარკული გახდა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ყოველი უჯრა იმავე მანძილზე აირეკლე.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ფიგურაა ზიგზაგის ნამდვილი ანარეკლი ვერტიკალურ სარკეში?',
      visual: { type: 'grid-picture', picture: { width: 5, height: 3, cells: ZIG } },
      response: {
        type: 'flip-pick',
        source: ZIG,
        line: { axis: 'vertical', at: 4 },
        width: 5,
        height: 3,
        options: [
          { id: 'a', cells: [{ x: 4, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 0 }] },
          { id: 'b', cells: ZIG },
        ],
      },
      hints: ['სარკეში ზიგზაგის ქანობა იცვლება.', 'შუა უჯრა ხაზზე ახლოს რჩება.'],
      explanation: 'ვერტიკალურ სარკეში ზიგზაგი შებრუნებულად იხრება — სწორია ვარიანტი ა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. არეკვლა ქანობას ცვლის.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რა მოდის შემდეგ? ● ● ■ ● ● ■ ● …',
      visual: { type: 'shape-pattern', block: ['circle', 'circle', 'square'], length: 7 },
      response: {
        type: 'choice',
        options: [
          { id: 'circle', text: 'წრე ●' },
          { id: 'square', text: 'კვადრატი ■' },
        ],
        answer: 'circle',
      },
      hints: [],
      explanation: 'ბლოკი „ორი წრე და კვადრატი“-ა; კვადრატის შემდეგ ისევ წრე მოდის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე ბლოკი და დათვალე.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'დაასრულე ფიგურა სარკულად.',
      response: { type: 'symmetry-fill', picture: { width: 5, height: 3, cells: [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }] }, line: { axis: 'vertical', at: 4 } },
      hints: [],
      explanation: 'სამი უჯრა მეორე მხარეს აირეკლა და ფიგურა სარკული გახდა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეავსე ყველა უჯრა სარკულად.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'მეოთხე ელემენტია ▲ ■ ★ ▲. რომელი ფიგურაა მეოთხეზე?',
      visual: { type: 'shape-pattern', block: ['triangle', 'square', 'star'], length: 4 },
      response: {
        type: 'choice',
        options: [
          { id: 'tri', text: 'სამკუთხედი ▲' },
          { id: 'square', text: 'კვადრატი ■' },
          { id: 'star', text: 'ვარსკვლავი ★' },
        ],
        answer: 'tri',
      },
      hints: [],
      explanation: 'ბლოკი სამი ელემენტისაა, ამიტომ მეოთხე ადგილზე ბლოკი ისევ იწყება — სამკუთხედი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მეოთხე ადგილი ბლოკის დასაწყისია.',
    },
  ],
};
