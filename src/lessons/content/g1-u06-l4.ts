import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U06.4 "Measuring Length in Centimeters".
 * Demonstration content only. The centimetre is a standard unit, so a measurement can be shared; a ruler's zero
 * mark must meet the object's start, and the answer is the tick at the far end — always written with its unit.
 */
export const g1u06l4: Lesson = {
  id: 'g1-u06-l4',
  status: 'placeholder',
  objective: 'ვზომავ სიგრძეს სანტიმეტრებით: ვაყენებ სახაზავის ნულს საგნის დასაწყისში და ვკითხულობ რიცხვს, რომელსაც სმ ვუწერ.',
  prerequisites: ['გაზომვა ერთეულებით (U06.3)'],
  minutes: 12,
  concepts: ['სანტიმეტრი', 'სახაზავი', 'ნული', 'გაზომვის ჩაწერა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! სანტიმეტრი ყველასთვის ერთი და იმავე ზომისაა — ამიტომ გაზომვაც შედარებადია.',
    retry: 'სცადე ისევ. სახაზავის ნული საგნის დასაწყისში უნდა იდგას.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'ფანქარი სახაზავზეა. რა არის მისი სიგრძე?',
      mascot: { intro: 'სახაზავის ნული საგნის დასაწყისში უნდა იყოს — მერე ვკითხულობთ ბოლო ნიშანს.' },
      response: {
        type: 'choice',
        options: [
          { id: '8', text: '8 სმ' },
          { id: '7', text: '7 სმ' },
          { id: '9', text: '9 სმ' },
        ],
        answer: '8',
      },
      hints: ['ნული საგნის დასაწყისშია. უყურე მხოლოდ ბოლო ნიშანს.'],
      explanation: 'საგნის დასაწყისი ნულზეა, ბოლო კი 8-ზე — ამიტომ სიგრძე 8 სმ-ია. სანტიმეტრი უნდა ჩავწეროთ, რომ გაზომვა გასაგები იყოს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე ნიშანი საგნის ბოლოსთან.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'სახაზავი',
      prompt: 'აირჩიე საგანი და გადააადგილე სახაზავი. ნახე: როცა ნული დასაწყისშია, კითხვა საგნის სიგრძეა; როცა არა — არა.',
      hints: ['გადაათრიე სახაზავი, ან გამოიყენე ღილაკები «←, →».', '«ნული დასაწყისთან» ღილაკი სახაზავს ისევ სწორ ადგილას აყენებს.'],
      tool: {
        tool: 'ruler-lab',
        objects: [
          { label: 'ფანქარი', object: { kind: 'pencil', cm: 8 } },
          { label: 'სამაგრი', object: { kind: 'clip', cm: 4 } },
          { label: 'წიგნი', object: { kind: 'book', cm: 12 } },
        ],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ნული და კითხვა',
      prompt: 'ნახე, რა ხდება, როცა სახაზავის ნული საგნის დასაწყისში არ დგას.',
      blocks: [
        {
          type: 'measure-demo',
          mode: 'ruler',
          a: { kind: 'pencil', cm: 8 },
          b: { kind: 'pencil', cm: 8 },
          steps: [
            'სახაზავი საგნის ქვეშ დევს, მაგრამ ნული დასაწყისში არ არის — კითხვა არასწორი იქნება.',
            'ნული გადავიტანეთ საგნის დასაწყისში. ახლა ბოლო ნიშნის კითხვა სწორია: 8 სმ.',
          ],
          caption: 'ჯერ ნული დასაწყისთან, მერე კითხვა.',
        },
        { type: 'callout', tone: 'warning', text: 'რბილი სახაზავის ან სახაზავის ბოლოდან დათვლა ცდომილებას იძლევა. ნული — არა სახაზავის კიდე.' },
        { type: 'worked', title: 'გაზომვის ჩაწერა', steps: [
          { text: 'ჩვენ ვწერთ რიცხვსაც და ერთეულსაც: 8 სმ. მხოლო რიცხვი «8» გაუგებარია — 8 რა?' },
          { text: 'სანტიმეტრი ყველგან ერთი და იმავე ზომისაა, ამიტომ «8 სმ» ყველასთვის ერთსა და იმავეს ნიშნავს.' },
        ] },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'ნული დასაწყისში მოათავსე და აირჩიე ფანქრის სიგრძე.',
      response: { type: 'ruler-read', object: { kind: 'pencil', cm: 6 }, rulerStart: 1, options: [5, 6, 7], answerCm: 6 },
      hints: ['«ნული დასაწყისთან» ღილაკი სახაზავს სწორ ადგილას დააყენებს.', 'საგნის ბოლო ნულიდან 6 ნიშანის დაშორებითაა.'],
      explanation: 'ნული დასაწყისშია, ბოლო — 6-ზე. სიგრძე 6 სმ.',
      misconceptions: [
        { id: 'zero', answers: ['zero'], feedback: 'ნული საგნის დასაწყისში უნდა იდგეს. წინააღმდეგ შემთხვევაში კითხვა სიგრძეს არ აჩვენებს.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ჯერ ნული დასაწყისთან დააყენე, მერე აირჩიე კითხვა.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'მოათავსე ნული დასაწყისში და აირჩიე წიგნის სიგრძე.',
      response: { type: 'ruler-read', object: { kind: 'book', cm: 11 }, rulerStart: 2, options: [9, 10, 11], answerCm: 11 },
      hints: ['კითხვა საგნის ბოლოში მდგარი ნიშანია, როცა ნული დასაწყისშია.'],
      explanation: 'ნული დასაწყისში → ბოლო ნიშანი 11-ზეა → სიგრძე 11 სმ.',
      misconceptions: [
        { id: 'zero', answers: ['zero'], feedback: 'სახაზავის ნული საგნის დასაწყისში უნდა იყოს.' },
        { id: 'nine', answers: [9], feedback: '9 სმ გამოდის მხოლოდ მაშინ, თუ სახაზავი ორი სანტიმეტრით გვერდზე გვაქვს გაწეული.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დააყენე ნული დასაწყისთან და წაიკითხე ბოლო ნიშანი.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'სამაგრის სიგრძე სახაზავით გაზომე.',
      response: { type: 'ruler-read', object: { kind: 'clip', cm: 4 }, rulerStart: 3, options: [3, 4, 7], answerCm: 4 },
      hints: ['სამაგრი პატარაა: მისი ბოლო ნულიდან 4 ნიშანზეა.'],
      explanation: '4 სმ. სანტიმეტრებით ვწერთ: «4 სმ».',
      misconceptions: [
        { id: 'zero', answers: ['zero'], feedback: 'ნული დასაწყისთან არ დგას — კითხვა სიგრძეს არ აჩვენებს.' },
        { id: 'seven', answers: [7], feedback: '7 სმ არის კითხვა მაშინ, როცა სახაზავი სამი სანტიმეტრით არის გაწეული.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ნული დასაწყისთან დააყენე.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაასრულე წინადადება რიცხვით: წიგნი 12 სმ-ია, ფანქარი 8 სმ-ია. ფანქარი წიგნზე რამდენი სანტიმეტრით მოკლეა?',
      response: { type: 'numeric', answer: 4, unit: 'სმ' },
      hints: ['12 − 8 = 4.'],
      explanation: '12 სმ − 8 სმ = 4 სმ. ფანქარი 4 სმ-ით მოკლეა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გამოაკელი 8 12-ს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'ნული დასაწყისში დააყენე და აირჩიე ლენტის სიგრძე.',
      response: { type: 'ruler-read', object: { kind: 'ribbon', cm: 9 }, rulerStart: 1, options: [8, 9, 10], answerCm: 9 },
      hints: [],
      explanation: 'ნული დასაწყისში → ბოლო ნიშანი 9 → 9 სმ.',
      misconceptions: [{ id: 'zero', answers: ['zero'], feedback: 'ნული უნდა იდგეს საგნის დასაწყისში.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დააყენე ნული და წაიკითხე.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'გაზომე ფერადი ფანქარი სახაზავით.',
      response: { type: 'ruler-read', object: { kind: 'crayon', cm: 7 }, rulerStart: 4, options: [3, 7, 11], answerCm: 7 },
      hints: [],
      explanation: 'ნული დასაწყისში → 7 სმ.',
      misconceptions: [
        { id: 'zero', answers: ['zero'], feedback: 'სახაზავის ნული საგნის დასაწყისში უნდა იყოს.' },
        { id: 'eleven', answers: [11], feedback: '11 სმ სახაზავის პოზიციის შედეგია, არა საგნის სიგრძე.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დააყენე ნული დასაწყისთან.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'წიგნი 14 სმ-ია, სამაგრი 4 სმ-ია. რამდენი სანტიმეტრით გრძელია წიგნი?',
      response: { type: 'numeric', answer: 10, unit: 'სმ' },
      hints: [],
      explanation: '14 − 4 = 10. წიგნი 10 სმ-ით გრძელია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 14-ს გამოაკელი 4.',
    },
  ],
};
