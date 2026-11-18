import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U08.1 "Recognizing Circles, Triangles, Squares, and Rectangles".
 * Demonstration content only. A shape is its outline, not its colour, size or the way it happens to be turned;
 * a turned or resized square is still a square.
 */
export const g1u08l1: Lesson = {
  id: 'g1-u08-l1',
  status: 'placeholder',
  objective: 'ვიცნობ წრეს, სამკუთხედს, კვადრატსა და მართკუთხედს — ზომის, ფერისა და მობრუნების მიუხედავად.',
  prerequisites: ['ფიგურების ყოველდღიური სახელები'],
  minutes: 10,
  concepts: ['წრე', 'სამკუთხედი', 'კვადრატი', 'მართკუთხედი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ფიგურა მისი ფორმითაა ცნობადი, არა ფერით ან ზომით.',
    retry: 'სცადე ისევ. შეხედე ფორმას: რამდენი გვერდი აქვს და როგორ არის ისინი ერთმანეთთან.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ფიგურაა კვადრატი?',
      visual: {
        type: 'flat',
        shapes: [
          { kind: 'rectangle', size: 80 },
          { kind: 'square', size: 80, rotate: 20 },
          { kind: 'triangle', size: 80 },
        ],
      },
      mascot: { intro: 'კვადრატს ოთხი ტოლი გვერდი აქვს. მობრუნება მას არ ცვლის.' },
      response: {
        type: 'choice',
        options: [
          { id: 'first', text: 'პირველი (გრძელი მართკუთხედი)' },
          { id: 'second', text: 'მეორე (მობრუნებული კვადრატი)' },
          { id: 'third', text: 'მესამე (სამკუთხედი)' },
        ],
        answer: 'second',
      },
      hints: ['კვადრატს ოთხი გვერდი აქვს და ოთხივე ტოლია. მობრუნებული კვადრატიც კვადრატია.'],
      explanation: 'მეორე ფიგურა კვადრატია — ოთხი ტოლი გვერდით. ის მობრუნებულია, მაგრამ ეს ფორმას არ ცვლის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები და შეადარე მათი სიგრძე.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ფიგურების კრებული',
      prompt: 'შეეხე ფიგურებს. დააკვირდი: სახეობა, გვერდები, კუთხეები. სცადე ასევე დაგალაგება სახეობით.',
      hints: ['მობრუნებული ან პატარა ფიგურაც იგივე სახეობაა.', 'წრე ერთადერთია, რომელსაც სწორი გვერდი არ აქვს.'],
      tool: {
        tool: 'flat-lab',
        shapes: [
          { kind: 'circle', radius: 40 },
          { kind: 'triangle', size: 90 },
          { kind: 'square', size: 80 },
          { kind: 'rectangle', size: 70 },
          { kind: 'square', size: 60, rotate: 30 },
        ],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ფორმა, არა გარეგნობა',
      prompt: 'ვნახოთ, რომ ზომა და მობრუნება ფიგურას არ ცვლის.',
      blocks: [
        { type: 'flat', shapes: [{ kind: 'circle', radius: 44 }, { kind: 'triangle', size: 84 }, { kind: 'square', size: 74 }, { kind: 'rectangle', size: 62 }] },
        { type: 'text', text: 'ოთხი ძირითადი ფიგურა: წრე (მრუდე ხაზი), სამკუთხედი (3 გვერდი), კვადრატი (4 ტოლი გვერდი), მართკუთხედი (4 გვერდი, ორი გრძელი და ორი მოკლე).' },
        {
          type: 'shape2d-demo',
          mode: 'turn',
          spec: { kind: 'square', size: 90 },
          contrast: { kind: 'rectangle', size: 70 },
          steps: ['ეს კვადრატია: ოთხი ტოლი გვერდი.', 'მოვაბრუნოთ იგი — ის მაინც კვადრატია, იგივე გვერდებით.', 'მართკუთხედი კი მოგრძოა: მისი გვერდები ტოლი არ არის.'],
          caption: 'მობრუნება ფორმას არ ცვლის; გვერდების სიგრძე კი გვეუბნება, კვადრატია თუ მართკუთხედი.',
        },
        { type: 'callout', tone: 'tip', text: 'ფიგურის დასახელებისას ნუ შეხედავ ფერს ან ზომას — შეხედე გვერდებს.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ფიგურაა სამკუთხედი?',
      visual: {
        type: 'flat',
        shapes: [
          { kind: 'square', size: 76 },
          { kind: 'rectangle', size: 62 },
          { kind: 'triangle', size: 82, rotate: 15 },
        ],
      },
      response: {
        type: 'choice',
        options: [
          { id: 'first', text: 'პირველი' },
          { id: 'second', text: 'მეორე' },
          { id: 'third', text: 'მესამე' },
        ],
        answer: 'third',
      },
      hints: ['სამკუთხედს სამი გვერდი აქვს.'],
      explanation: 'მესამე ფიგურა სამკუთხედია — სამი გვერდით. მობრუნება მას არ ცვლის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'შეეხე ყველა კვადრატს.',
      response: {
        type: 'shape-sort',
        groupBy: 'kind',
        shapes: [
          { kind: 'square', size: 80 },
          { kind: 'rectangle', size: 70 },
          { kind: 'square', size: 55, rotate: 25 },
          { kind: 'triangle', size: 80 },
        ],
      },
      hints: ['კვადრატს ოთხი ტოლი გვერდი აქვს — მობრუნებულიც კვადრატია.'],
      explanation: 'ორი კვადრატია: პირველი და მესამე (მობრუნებული). მეორე მართკუთხედია, მეოთხე — სამკუთხედი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები და შეადარე სიგრძეები.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რამდენი გვერდი აქვს კვადრატს?',
      response: { type: 'numeric', answer: 4, unit: 'გვერდი' },
      hints: ['დაითვალე: ზედა, მარჯვენა, ქვედა, მარცხენა.'],
      explanation: 'კვადრატს ოთხი გვერდი აქვს და ოთხივე ტოლია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ფიგურაა წრე?',
      visual: {
        type: 'flat',
        shapes: [
          { kind: 'circle', radius: 42 },
          { kind: 'square', size: 76 },
        ],
      },
      response: {
        type: 'choice',
        options: [
          { id: 'circle', text: 'პირველი' },
          { id: 'square', text: 'მეორე' },
        ],
        answer: 'circle',
      },
      hints: ['წრეს სწორი გვერდი არ აქვს — ის მრუდე ხაზია.'],
      explanation: 'პირველი ფიგურა წრეა: მრუდე ხაზი, სწორი გვერდებისა და კუთხეების გარეშე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. წრეს კუთხეები არ აქვს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი ფიგურაა მართკუთხედი?',
      visual: {
        type: 'flat',
        shapes: [
          { kind: 'circle', radius: 38 },
          { kind: 'rectangle', size: 60, rotate: 10 },
          { kind: 'square', size: 74 },
        ],
      },
      response: {
        type: 'choice',
        options: [
          { id: 'first', text: 'პირველი' },
          { id: 'second', text: 'მეორე' },
          { id: 'third', text: 'მესამე' },
        ],
        answer: 'second',
      },
      hints: [],
      explanation: 'მეორე ფიგურა მართკუთხედია: ოთხი გვერდი, რომელთაგან ორი გრძელი და ორი მოკლე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე გვერდების სიგრძეები.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რამდენი კუთხე აქვს წრეს?',
      response: { type: 'numeric', answer: 0, unit: 'კუთხე' },
      hints: [],
      explanation: 'წრეს კუთხე არ აქვს (0): მისი ხაზი არსად იკეცება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. წრე მრუდე ხაზია, კუთხეების გარეშე.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'მობრუნებული კვადრატი რა ფიგურაა?',
      response: {
        type: 'choice',
        options: [
          { id: 'square', text: 'კვადრატი — მობრუნება ფორმას არ ცვლის' },
          { id: 'triangle', text: 'სამკუთხედი' },
          { id: 'rectangle', text: 'მართკუთხედი, რადგან მობრუნებულია' },
        ],
        answer: 'square',
      },
      hints: [],
      explanation: 'მობრუნება ფიგურას არ ცვლის: კვადრატი მობრუნებულიც კვადრატია, ოთხი ტოლი გვერდით.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მობრუნება ზომას და ფორმას არ ცვლის.',
    },
  ],
};
