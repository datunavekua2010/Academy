import type { ChoiceOption, Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U03.5 "Using Number Bonds to Solve Problems".
 * Demonstration content only. The stories are short on purpose (little reading, familiar
 * objects). In the check no completed number bond is shown: the student works from the story.
 */

const bond = (whole: number, a: number, b: number): ChoiceOption['visual'] => ({ type: 'bond', whole, a, b });

export const g1u03l5: Lesson = {
  id: 'g1-u03-l5',
  status: 'placeholder',
  objective: 'რიცხვთა კავშირს ვიყენებ მარტივ ამოცანებში: ვპოულობ მთელს ან დაკარგულ ნაწილს.',
  prerequisites: ['დაკარგული ნაწილის პოვნა (U03.4)'],
  minutes: 10,
  concepts: ['მთელის პოვნა ამოცანაში', 'დაკარგული ჯგუფის პოვნა', 'ამოცანის დაკავშირება რიცხვთა კავშირთან'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'მშვენიერია! შეგიძლია რიცხვთა კავშირით ამოცანების ამოხსნა.',
    retry: 'სცადე ისევ. ამოცანაში იპოვე მთელი და ორი ნაწილი.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'ერთ ჯგუფში ექვსი ვაშლია, მეორეში — ოთხი. სულ რამდენი ვაშლია?',
      mascot: { intro: 'დამეხმარები პატარა ამოცანის ამოხსნაში?' },
      visual: { type: 'parts', a: 6, b: 4, glyph: 'apple' },
      response: { type: 'numeric', answer: 10 },
      hints: ['ორი ჯგუფია. ორივე ერთად დათვალე.'],
      explanation: '6 და 4 ერთად 10 არის.',
      misconceptions: [{ id: 'one-group', answers: [6, 4], feedback: 'ეს მხოლოდ ერთი ჯგუფია. სულ ორივე ჯგუფი ერთად გვჭირდება.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე ჯგუფი ერთად დათვალე.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'როგორ გვეხმარება რიცხვთა კავშირი ამოცანაში?',
      prompt: 'გადაიტანე საგნები ორ ჯგუფში და ნახე, როგორ იცვლება რიცხვთა კავშირი.',
      hints: ['წაიკითხე ისტორია: რამდენი საგანია თითოეულ ჯგუფში?', 'იპოვე მთელი და ორი ნაწილი.'],
      tool: {
        tool: 'story-bond',
        glyph: 'apple',
        stories: [
          { kind: 'whole', label: 'მთელის პოვნა', text: 'კალათაში 5 ვაშლია, მაგიდაზე — 3. სულ რამდენი ვაშლია?', a: 5, b: 3 },
          { kind: 'part', label: 'დაკარგული ჯგუფი', text: 'სულ 9 ვაშლია. 4 კალათაშია. რამდენია მაგიდაზე?', a: 4, b: 5 },
        ],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'რიცხვთა კავშირი ინფორმაციას აწესრიგებს',
      prompt: 'ამოცანაში ჯერ იპოვე მთელი და ნაწილები. რიცხვთა კავშირი გვეხმარება, რომ ისინი ერთმანეთისგან გავარჩიოთ.',
      blocks: [
        {
          type: 'bond-demo',
          mode: 'join',
          whole: 7,
          parts: [3, 4],
          palette: 'redblue',
          story: 'ამოცანა ა: 3 წითელი და 4 ლურჯი კუბიკია. სულ რამდენია?',
          caption: 'ორი ნაწილი ვიცით. მთელი ვიპოვეთ.',
        },
        {
          type: 'bond-demo',
          mode: 'missing',
          whole: 8,
          parts: [3, 5],
          palette: 'redblue',
          story: 'ამოცანა ბ: სულ 8 კუბიკია. 3 წითელია, დანარჩენი — ლურჯი.',
          caption: 'მთელი და ერთი ნაწილი ვიცით. მეორე ნაწილი ვიპოვეთ.',
        },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'აკვარიუმში 3 თევზია, ტბაში კიდევ 5 თევზია. სულ რამდენი თევზია?',
      visual: { type: 'parts', a: 3, b: 5, glyph: 'fish' },
      response: { type: 'numeric', answer: 8 },
      hints: ['იპოვე ისტორიაში მთელი და ორი ნაწილი.'],
      explanation: '3 და 5 ერთად 8 არის.',
      misconceptions: [{ id: 'one-group', answers: [3, 5], feedback: 'ეს მხოლოდ ერთი ჯგუფია. სულ ორივე ჯგუფი ერთად გვჭირდება.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე ჯგუფი ერთად დათვალე.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'სულ 9 ბურთია. მონიშნული 5 ბურთი ყუთშია. რამდენი ბურთია ყუთს გარეთ?',
      visual: { type: 'objects', count: 9, glyph: 'ball', layout: 'rows', known: 5 },
      response: { type: 'numeric', answer: 4 },
      hints: ['იპოვე ისტორიაში მთელი და ცნობილი ნაწილი.'],
      explanation: '5 და 4 ერთად 9 არის.',
      misconceptions: [{ id: 'in-box', answers: [5], feedback: '5 ბურთი ყუთშია. გვაინტერესებს ბურთები ყუთს გარეთ.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე უნიშნო ბურთები.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი რიცხვთა კავშირი ემთხვევა სურათს?',
      visual: { type: 'parts', a: 4, b: 2, glyph: 'apple' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ვარიანტი ა', visual: bond(6, 3, 3) },
          { id: 'b', text: 'ვარიანტი ბ', visual: bond(6, 4, 2) },
          { id: 'c', text: 'ვარიანტი გ', visual: bond(5, 3, 2) },
        ],
        answer: 'b',
      },
      hints: ['იპოვე სურათზე ორი ნაწილი. მერე ორივე ერთად დათვალე.'],
      explanation: 'ნაწილები 4 და 2-ია, ერთად 6 არის: ეს კავშირი სურათს ემთხვევა.',
      misconceptions: [
        { id: 'equal-parts', answers: ['a'], feedback: 'ამ კავშირში ორივე ნაწილი 3-ია. სურათზე ერთი ჯგუფი უფრო დიდია, ვიდრე მეორე.' },
        { id: 'wrong-whole', answers: ['c'], feedback: 'ამ კავშირის ნაწილები ერთად 5-ია. სურათზე ორივე ჯგუფი ერთად დათვალე.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე კავშირის ორი ნაწილი სურათის ჯგუფებს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'თაროზე 6 სათამაშო მანქანაა, იატაკზე — 3. სულ რამდენი მანქანაა?',
      response: { type: 'numeric', answer: 9 },
      hints: ['იპოვე ისტორიაში მთელი და ორი ნაწილი.'],
      explanation: '6 და 3 ერთად 9 არის.',
      misconceptions: [{ id: 'one-group', answers: [6, 3], feedback: 'ეს მხოლოდ ერთი ჯგუფია. სულ ორივე ჯგუფი ერთად გვჭირდება.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რა ორი ნაწილია ისტორიაში?',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'კალათაში 10 მსხალია. 4 მწიფეა. რამდენი არ არის მწიფე?',
      response: { type: 'numeric', answer: 6 },
      hints: ['იპოვე ისტორიაში მთელი და ცნობილი ნაწილი.'],
      explanation: '4 და 6 ერთად 10 არის.',
      misconceptions: [{ id: 'whole', answers: [10], feedback: '10 მთელია. გვჭირდება ის ნაწილი, რომელიც არ არის მწიფე.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 4-ს რამდენი უნდა დაემატოს, რომ 10 გახდეს?',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'ჩანთაში 7 ფანქარია. 2 წითელია, დანარჩენი — ლურჯი. რომელი რიცხვთა კავშირი ემთხვევა ამ ისტორიას?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ვარიანტი ა', visual: bond(9, 2, 7) },
          { id: 'b', text: 'ვარიანტი ბ', visual: bond(7, 3, 4) },
          { id: 'c', text: 'ვარიანტი გ', visual: bond(7, 2, 5) },
        ],
        answer: 'c',
      },
      hints: ['იპოვე ისტორიაში მთელი და ცნობილი ნაწილი. მერე შეამოწმე, ორი ნაწილი ერთად მთელს ქმნის თუ არა.'],
      explanation: 'მთელი 7-ია, წითელი ფანქრები 2-ია, ლურჯი — 5. 2 და 5 ერთად 7 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მთელი 7-ია. შეამოწმე, ნაწილები ერთად 7-ს ქმნიან თუ არა.',
    },
  ],
};
