import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U08.5 "Recognizing Shapes in Everyday Objects".
 * Demonstration content only. An everyday object's overall outline can resemble a 2D shape — a clock is round, a
 * book is a rectangle — and the shape is still decided by the outline, never by the object's name.
 */
export const g1u08l5: Lesson = {
  id: 'g1-u08-l5',
  status: 'placeholder',
  objective: 'ვცნობ ყოველდღიურ საგნებში ფიგურებს და ვუკავშირებ მათ სახელებს.',
  prerequisites: ['ფიგურების სახელები და თვისებები (U08.1–U08.4)'],
  minutes: 10,
  concepts: ['ფიგურა საგანში', 'წრე საათში', 'მართკუთხედი წიგნში', 'გარემომცველი ფორმები'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ბევრი ნივთის მთავარი მოხაზულობა ერთ-ერთი ფიგურაა.',
    retry: 'სცადე ისევ. შეხედე ნივთის მთავარ მოხაზულობას: მრგვალია თუ კუთხეები აქვს?',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'საათის ციფერბლატის მოხაზულობა რომელი ფიგურაა?',
      visual: { type: 'flat', shapes: [{ kind: 'circle', radius: 44 }] },
      mascot: { intro: 'ნივთის ფორმა მისი გარე მოხაზულობით გვეცნობა.' },
      response: {
        type: 'choice',
        options: [
          { id: 'circle', text: 'წრე' },
          { id: 'square', text: 'კვადრატი' },
          { id: 'triangle', text: 'სამკუთხედი' },
        ],
        answer: 'circle',
      },
      hints: ['საათის ციფერბლატი მრგვალია, კუთხეების გარეშე.'],
      explanation: 'საათის ციფერბლატი წრეა: მრგვალი მოხაზულობა, კუთხეების გარეშე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ციფერბლატის მოხაზულობას.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ოთახი',
      prompt: 'ოთახში ბევრი საგანია. იპოვე ყველა, რომლის ფორმაც წრეა — მერე სცადე სხვა ფიგურებიც.',
      hints: ['ჯერ მოძებნე მრგვალი საგნები: საათი, მონეტა.', 'მერე მართკუთხა: წიგნი, კარი.'],
      tool: {
        tool: 'room-lab',
        target: 'circle',
        items: [
          { id: 'clock', label: 'საათი', spec: { kind: 'circle', radius: 40 } },
          { id: 'book', label: 'წიგნი', spec: { kind: 'rectangle', size: 60 } },
          { id: 'coin', label: 'მონეტა', spec: { kind: 'circle', radius: 30 } },
          { id: 'window', label: 'ფანჯარა', spec: { kind: 'square', size: 70 } },
          { id: 'sign', label: 'საგზაო ნიშანი', spec: { kind: 'triangle', size: 70 } },
          { id: 'dial', label: 'საათის ციფერბლატი', spec: { kind: 'circle', radius: 36 } },
        ],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ფიგურები ნივთებში',
      prompt: 'ვნახოთ, რომელი ფიგურა იმალება ნაცნობ ნივთებში.',
      blocks: [
        {
          type: 'flat',
          shapes: [
            { kind: 'circle', radius: 40 },
            { kind: 'rectangle', size: 60 },
            { kind: 'square', size: 70 },
            { kind: 'triangle', size: 72 },
          ],
        },
        { type: 'text', text: 'საათი წრეა, წიგნი და კარი — მართკუთხედი, ფანჯარა — კვადრატი, საგზაო ნიშანი — სამკუთხედი.' },
        { type: 'callout', tone: 'tip', text: 'ნივთს ბევრი დეტალი აქვს, ამიტომ ვუყურებთ მის მთავარ მოხაზულობას.' },
        {
          type: 'shape2d-demo',
          mode: 'sides',
          spec: { kind: 'rectangle', size: 62 },
          steps: [
            'წიგნის მთავარი მოხაზულობა ოთხი სწორი გვერდისგან შედგება.',
            'მისი გვერდები ტოლი არ არის: ორი გრძელია, ორი მოკლე.',
            'ამიტომ წიგნის ფორმა მართკუთხედია.',
          ],
          caption: 'წიგნი — მართკუთხედი.',
        },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'წიგნის მოხაზულობა რომელი ფიგურაა?',
      response: {
        type: 'choice',
        options: [
          { id: 'rectangle', text: 'მართკუთხედი' },
          { id: 'circle', text: 'წრე' },
          { id: 'triangle', text: 'სამკუთხედი' },
        ],
        answer: 'rectangle',
      },
      hints: ['წიგნს ოთხი სწორი გვერდი აქვს, ორი გრძელი და ორი მოკლე.'],
      explanation: 'წიგნი მართკუთხედია: ოთხი გვერდი, ორი გრძელი და ორი მოკლე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'იპოვე ყველა საგანი, რომლის ფორმაც კვადრატია.',
      response: {
        type: 'find-shapes',
        kind: 'square',
        items: [
          { id: 'tile', label: 'კვადრატული ფილა', spec: { kind: 'square', size: 70 } },
          { id: 'book', label: 'წიგნი', spec: { kind: 'rectangle', size: 60 } },
          { id: 'window', label: 'ფანჯარა', spec: { kind: 'square', size: 65 } },
          { id: 'coin', label: 'მონეტა', spec: { kind: 'circle', radius: 32 } },
        ],
      },
      hints: ['კვადრატული საგანი ოთხი ტოლი გვერდითაა.'],
      explanation: 'კვადრატულია ფილა და ფანჯარა; წიგნი მართკუთხედია, მონეტა — წრე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე კვადრატული საგანი იპოვე.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'საგზაო ნიშნის მოხაზულობა რომელი ფიგურაა?',
      response: {
        type: 'choice',
        options: [
          { id: 'triangle', text: 'სამკუთხედი' },
          { id: 'square', text: 'კვადრატი' },
          { id: 'circle', text: 'წრე' },
        ],
        answer: 'triangle',
      },
      hints: ['სამკუთხა ნიშანს სამი გვერდი აქვს.'],
      explanation: 'საგზაო სამკუთხა ნიშანი სამკუთხედია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე გვერდები.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'იპოვე ყველა საგანი, რომლის ფორმაც წრეა.',
      response: {
        type: 'find-shapes',
        kind: 'circle',
        items: [
          { id: 'clock', label: 'საათი', spec: { kind: 'circle', radius: 38 } },
          { id: 'door', label: 'კარი', spec: { kind: 'rectangle', size: 70 } },
          { id: 'coin', label: 'მონეტა', spec: { kind: 'circle', radius: 30 } },
          { id: 'sign', label: 'საგზაო ნიშანი', spec: { kind: 'triangle', size: 68 } },
        ],
      },
      hints: ['მრგვალი საგნები: საათი, მონეტა.'],
      explanation: 'წრეა საათი და მონეტა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე მოხაზულობას.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი საგანია წრე?',
      response: {
        type: 'choice',
        options: [
          { id: 'clock', text: 'საათის ციფერბლატი' },
          { id: 'book', text: 'წიგნი' },
          { id: 'sign', text: 'საგზაო ნიშანი' },
        ],
        answer: 'clock',
      },
      hints: [],
      explanation: 'საათის ციფერბლატი წრეა; წიგნი მართკუთხედია, ნიშანი — სამკუთხედი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. წრეს კუთხე არ აქვს.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'იპოვე ყველა საგანი, რომლის ფორმაც მართკუთხედია.',
      response: {
        type: 'find-shapes',
        kind: 'rectangle',
        items: [
          { id: 'book', label: 'წიგნი', spec: { kind: 'rectangle', size: 60 } },
          { id: 'tile', label: 'კვადრატული ფილა', spec: { kind: 'square', size: 60 } },
          { id: 'door', label: 'კარი', spec: { kind: 'rectangle', size: 74 } },
          { id: 'clock', label: 'საათი', spec: { kind: 'circle', radius: 36 } },
        ],
      },
      hints: [],
      explanation: 'მართკუთხედია წიგნი და კარი. ფილა კვადრატია, საათი — წრე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მართკუთხედს ორი გრძელი და ორი მოკლე გვერდი აქვს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'ვაზის ფორმა მრგვალია, კუთხეების გარეშე. ეს რომელი ფიგურაა?',
      response: {
        type: 'choice',
        options: [
          { id: 'circle', text: 'წრე' },
          { id: 'square', text: 'კვადრატი' },
          { id: 'triangle', text: 'სამკუთხედი' },
        ],
        answer: 'circle',
      },
      hints: [],
      explanation: 'მრგვალი მოხაზულობა, კუთხეების გარეშე, წრეა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. კუთხეების არქონა წრის ნიშანია.',
    },
  ],
};
