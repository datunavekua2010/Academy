import type { Lesson } from '../types';

const objects = [
  { id: 'r1', colour: 'red', kind: 'circle', size: 'small', label: 'წითელი წრე' },
  { id: 'r2', colour: 'red', kind: 'triangle', size: 'large', label: 'წითელი სამკუთხედი' },
  { id: 'r3', colour: 'red', kind: 'square', size: 'small', label: 'წითელი კვადრატი' },
  { id: 'b1', colour: 'blue', kind: 'circle', size: 'large', label: 'ლურჯი წრე' },
  { id: 'b2', colour: 'blue', kind: 'square', size: 'small', label: 'ლურჯი კვადრატი' },
  { id: 'y1', colour: 'yellow', kind: 'triangle', size: 'large', label: 'ყვითელი სამკუთხედი' },
] as const;

/**
 * PLACEHOLDER lesson — Grade 1 · U10.5 "Solving Sorting and Classification Puzzles".
 * Demonstration content only. Each clue narrows the collection; an object belongs only if it satisfies every clue,
 * and a clue can say what something is *not* as well as what it is.
 */
export const g1u10l5: Lesson = {
  id: 'g1-u10-l5',
  status: 'placeholder',
  objective: 'ვხსნი კლასიფიკაციის თავსატეხებს რამდენიმე მინიშნების მიხედვით.',
  prerequisites: ['დალაგება ერთი და ორი ნიშნით (U10.1–U10.2)', 'გადამკვეთი ჯგუფები (U10.3)'],
  minutes: 10,
  concepts: ['მინიშნება', 'ყველა პირობა', 'უარყოფითი პირობა', 'გამორიცხვა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ყოველი მინიშნება ვიწროებს არჩევანს — საგანი უნდა აკმაყოფილებდეს ყველა პირობას.',
    retry: 'სცადე ისევ. წაიკითხე ყველა მინიშნება და გამორიცხე ის, რაც ერთს მაინც არ აკმაყოფილებს.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'მინიშნება: „წითელი და არ არის წრე“. რომელი საგანი ერგება?',
      visual: { type: 'sorted-groups', attr: 'colour', groups: [{ value: 'red', objects: [objects[0], objects[1], objects[2]] }] },
      mascot: { intro: 'მინიშნება შეიძლება ითხოვდეს იმასაც, რაც საგანი არ არის.' },
      response: {
        type: 'choice',
        options: [
          { id: 'r2', text: 'წითელი სამკუთხედი' },
          { id: 'r1', text: 'წითელი წრე' },
          { id: 'b1', text: 'ლურჯი წრე' },
        ],
        answer: 'r2',
      },
      hints: ['უნდა იყოს წითელი, მაგრამ არა წრე.'],
      explanation: 'წითელი სამკუთხედი წითელია და არ არის წრე. ლურჯი წრე არც წითელია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე ნაწილი შეამოწმე: ფერი და „არ არის წრე“.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'მინიშნებების გამოყენება',
      prompt: 'შეადგინე მინიშნებები და ნახე, როგორ ვიწროვდება არჩევანი. სცადე ერთი და ორი მინიშნება.',
      hints: ['ერთი მინიშნება ჯერ კიდევ ბევრ საგანს ტოვებს.', 'ორი მინიშნება ერთად უფრო ზუსტია.'],
      tool: { tool: 'sort-lab', objects: [...objects], attrs: ['colour', 'kind', 'size'] },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'როგორ ვხსნით კლასიფიკაციის თავსატეხს',
      prompt: 'ვნახოთ, როგორ ვიწროვდება არჩევანი მინიშნება-მინიშნება.',
      blocks: [
        { type: 'text', text: 'მინიშნება 1: „წითელი“. რჩება სამი საგანი.' },
        { type: 'text', text: 'მინიშნება 2: „დიდი“. რჩება მხოლოდ წითელი სამკუთხედი.' },
        {
          type: 'sort-demo',
          mode: 'one',
          attr: 'colour',
          objects: [objects[0], objects[1], objects[2]],
          steps: [
            'ჯერ ყველა საგანი გვაქვს.',
            'პირველი მინიშნება: მხოლოდ წითლები.',
            'მეორე მინიშნება: მხოლოდ დიდი.',
            'დარჩა ერთი საგანი — პასუხი.',
          ],
          caption: 'ყოველი მინიშნება ამცირებს არჩევანს; ბოლოს ერთი რჩება.',
        },
        { type: 'callout', tone: 'tip', text: 'უარყოფითი მინიშნება („არ არის წრე“) ნიშნავს, რომ წრეები გამორიცხე.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე ყველა საგანი, რომელიც წითელია და არ არის წრე.',
      response: {
        type: 'clue-pick',
        clues: [
          { attr: 'colour', value: 'red' },
          { attr: 'kind', value: 'circle', negate: true },
        ],
        objects: [...objects],
      },
      hints: ['წითელი წრე გამორიცხე.'],
      explanation: 'წითელი სამკუთხედი და წითელი კვადრატი — ორივე წითელია და არც ერთი წრე არ არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე ორივე პირობა.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე ყველა დიდი საგანი, რომელიც არ არის სამკუთხედი.',
      response: {
        type: 'clue-pick',
        clues: [
          { attr: 'size', value: 'large' },
          { attr: 'kind', value: 'triangle', negate: true },
        ],
        objects: [...objects],
      },
      hints: ['დიდია ლურჯი წრე, წითელი სამკუთხედი და ყვითელი სამკუთხედი.'],
      explanation: 'დიდი და არა სამკუთხედი — მხოლოდ ლურჯი წრე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. სამკუთხედები გამორიცხე.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე ყველა წრე და კვადრატი, რომელიც პატარაა.',
      response: {
        type: 'clue-pick',
        clues: [
          { attr: 'size', value: 'small' },
          { attr: 'kind', value: 'circle' },
        ],
        objects: [...objects],
      },
      hints: ['პატარა საგნები: წითელი წრე, წითელი კვადრატი, ლურჯი კვადრატი.'],
      explanation: 'პატარა და წრე — ეს არის წითელი წრე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე პირობა ერთდროულად უნდა სრულდებოდეს.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი საგანი არ აკმაყოფილებს ამ მინიშნებებს: „წითელი“ და „დიდი“?',
      response: {
        type: 'choice',
        options: [
          { id: 'r1', text: 'წითელი წრე — ის პატარაა' },
          { id: 'r2', text: 'წითელი სამკუთხედი — ის დიდია' },
          { id: 'r3', text: 'არც ერთი' },
        ],
        answer: 'r1',
      },
      hints: ['შეამოწმე, რომელი წითელი საგანი პატარაა.'],
      explanation: 'წითელი წრე პატარაა, ამიტომ „დიდი“ პირობას არ აკმაყოფილებს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე ზომა.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'აირჩიე ყველა ლურჯი საგანი, რომელიც არ არის სამკუთხედი.',
      response: {
        type: 'clue-pick',
        clues: [
          { attr: 'colour', value: 'blue' },
          { attr: 'kind', value: 'triangle', negate: true },
        ],
        objects: [...objects],
      },
      hints: [],
      explanation: 'ლურჯი საგნებია წრე და კვადრატი — ორივე არ არის სამკუთხედი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე პირობა ერთდროულად?',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'აირჩიე ყველა პატარა საგანი.',
      response: { type: 'clue-pick', clues: [{ attr: 'size', value: 'small' }], objects: [...objects] },
      hints: [],
      explanation: 'პატარაა წითელი წრე, წითელი კვადრატი და ლურჯი კვადრატი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ზომებს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რა ეხმარება თავსატეხის ამოხსნაში?',
      response: {
        type: 'choice',
        options: [
          { id: 'all', text: 'ყველა მინიშნების ერთდროულად გამოყენება' },
          { id: 'one', text: 'მხოლოდ პირველი მინიშნების გამოყენება' },
          { id: 'colour', text: 'მხოლოდ ფერის შეხედვა' },
        ],
        answer: 'all',
      },
      hints: [],
      explanation: 'საგანი უნდა აკმაყოფილებდეს ყველა მინიშნებას — არა მხოლოდ პირველს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაიხსენი, როგორ ვიწროვდებოდა არჩევანი.',
    },
  ],
};
