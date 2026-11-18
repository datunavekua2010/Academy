import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U06.5 "Understanding Meters and Choosing Suitable Units".
 * Demonstration content only. A metre is 100 centimetres, so one metre is a hundred of those same ticks; the
 * suitable unit depends on the size of what is measured — centimetres for short things, metres for things at
 * least a metre long.
 */
export const g1u06l5: Lesson = {
  id: 'g1-u06-l5',
  status: 'placeholder',
  objective: 'ვიცი, რომ 1 მეტრი 100 სანტიმეტრია, და ვირჩევ შესაფერის ერთეულს: სანტიმეტრს პატარა საგნებისთვის, მეტრს — დიდებისთვის.',
  prerequisites: ['გაზომვა სანტიმეტრებით (U06.4)'],
  minutes: 12,
  concepts: ['მეტრი', '100 სანტიმეტრი', 'შესაფერისი ერთეული', 'შეფასება'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! 1 მ = 100 სმ, და ერთეულს საგნის ზომის მიხედვით ვირჩევთ.',
    retry: 'სცადე ისევ. იფიქრე, საგანი მეტრზე გრძელია თუ არა: თუ კი — მეტრი, თუ არა — სანტიმეტრი.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'კარი 2 მეტრია. რამდენი სანტიმეტრია?',
      mascot: { intro: '1 მეტრი ზუსტად 100 სანტიმეტრია.' },
      response: {
        type: 'choice',
        options: [
          { id: '20', text: '20 სმ' },
          { id: '200', text: '200 სმ' },
          { id: '100', text: '100 სმ' },
        ],
        answer: '200',
      },
      hints: ['2 მეტრი ორი ასეული სანტიმეტრია: 2 × 100.', '1 მ = 100 სმ, ამიტომ 2 მ = 100 + 100 = 200 სმ.'],
      explanation: '1 მ = 100 სმ, ამიტომ 2 მ = 2 × 100 სმ = 200 სმ.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ერთ მეტრში 100 სანტიმეტრია.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'მეტრი და სანტიმეტრი',
      prompt: 'ნახე მეტრის ზოლი, აირჩიე სიგრძე და ნახე: მეტრად უფრო მოხერხებულია თუ სანტიმეტრად. მერე აირჩიე ერთეული თითოეული საგნისთვის.',
      hints: ['100 სმ და მეტი — მეტრი. 100 სმ-ზე ნაკლები — სანტიმეტრი.', 'ფანქარი, დაფა, საშლელი — პატარები არიან. კარი, ავტობუსი, ოთახი — დიდები.'],
      tool: {
        tool: 'metre-lab',
        items: [
          { label: 'ფანქარი', cm: 15, kind: 'pencil' },
          { label: 'დაფა', cm: 120 },
          { label: 'კარი', cm: 200, kind: 'door' },
          { label: 'საშლელი', cm: 5, kind: 'eraser' },
          { label: 'ოთახის სიგრძე', cm: 400 },
        ],
        demoCm: [15, 90, 100, 200, 400],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'მეტრი',
      prompt: 'ნახე, როგორ არის აწყობილი მეტრი სანტიმეტრებისგან.',
      blocks: [
        {
          type: 'measure-demo',
          mode: 'metre',
          a: { kind: 'door', cm: 200 },
          b: { kind: 'pencil', cm: 15 },
          steps: [
            'მეტრის ზოლი ასი სანტიმეტრისგან შედგება: 1 მ = 100 სმ.',
            'კარის სიგრძე 200 სმ-ია — ეს 2 მეტრია. ამიტომ კარს მეტრებით ვზომავთ.',
            'ფანქარი 15 სმ-ია, ბევრად ნაკლები ერთ მეტრზე — მას სანტიმეტრებით ვზომავთ.',
          ],
          caption: '1 მ = 100 სმ. ერთეულს საგნის ზომა გვკარნახობს.',
        },
        { type: 'equation', lines: ['1\\text{ მ} = 100\\text{ სმ}', '3\\text{ მ} = 300\\text{ სმ}'], caption: 'მეტრი → სანტიმეტრი: გაამრავლე 100-ზე.' },
        { type: 'callout', tone: 'tip', text: 'ობიექტის გაზომვამდე შეაფასე: მეტრზე გრძელია? თუ კი, მეტრი იქნება მოხერხებული.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე შესაფერისი ერთეული თითოეული საგნისთვის.',
      response: {
        type: 'unit-pick',
        items: [
          { label: 'ფანქარი', cm: 15, kind: 'pencil' },
          { label: 'კარი', cm: 200, kind: 'door' },
          { label: 'საშლელი', cm: 5, kind: 'eraser' },
        ],
      },
      hints: ['15 სმ-ზე „სანტიმეტრი“, 200 სმ-ზე — „მეტრი“.', '100 სმ = 1 მ; 200 სმ = 2 მ.'],
      explanation: 'ფანქარი 15 სმ — სანტიმეტრი; კარი 200 სმ — მეტრი (2 მ); საშლელი 5 სმ — სანტიმეტრი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე თითოეული სიგრძე 100 სმ-ს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაფა 3 მეტრია. რამდენი სანტიმეტრია?',
      response: { type: 'numeric', answer: 300, unit: 'სმ' },
      hints: ['1 მ = 100 სმ, ამიტომ 3 მ = 3 × 100 სმ.'],
      explanation: '3 × 100 = 300. დაფა 300 სმ-ია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაამრავლე 3 100-ზე.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე ერთეული: დაფა 120 სმ, საშლელი 5 სმ, ოთახის სიგრძე 400 სმ.',
      response: {
        type: 'unit-pick',
        items: [
          { label: 'დაფა', cm: 120 },
          { label: 'საშლელი', cm: 5, kind: 'eraser' },
          { label: 'ოთახის სიგრძე', cm: 400 },
        ],
      },
      hints: ['120 სმ მეტრზე მეტია — მეტრი. 5 სმ — სანტიმეტრი. 400 სმ — 4 მ.'],
      explanation: 'დაფა 120 სმ = 1 მ 20 სმ → მეტრი. საშლელი 5 სმ → სანტიმეტრი. ოთახი 400 სმ = 4 მ → მეტრი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 100 სმ და მეტი — მეტრი.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: '400 სმ რამდენი მეტრია?',
      response: { type: 'numeric', answer: 4, unit: 'მ' },
      hints: ['400 ÷ 100 = 4.'],
      explanation: '400 სმ ÷ 100 = 4 მ.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაყავი 400 100-ზე.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'აირჩიე შესაფერისი ერთეული: კარი 200 სმ, ფანქარი 12 სმ, ავტობუსი 900 სმ.',
      response: {
        type: 'unit-pick',
        items: [
          { label: 'კარი', cm: 200, kind: 'door' },
          { label: 'ფანქარი', cm: 12, kind: 'pencil' },
          { label: 'ავტობუსი', cm: 900 },
        ],
      },
      hints: [],
      explanation: 'კარი 2 მ → მეტრი. ფანქარი 12 სმ → სანტიმეტრი. ავტობუსი 9 მ → მეტრი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 100 სმ-ზე ნაკლები — სანტიმეტრი.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: '5 მეტრი რამდენი სანტიმეტრია?',
      response: { type: 'numeric', answer: 500, unit: 'სმ' },
      hints: [],
      explanation: '5 × 100 = 500 սმ.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაამრავლე 5 100-ზე.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'აირჩიე შესაფერისი ერთეული: საშლელი 5 სმ, დაფა 300 სმ, წიგნი 25 სმ.',
      response: {
        type: 'unit-pick',
        items: [
          { label: 'საშლელი', cm: 5, kind: 'eraser' },
          { label: 'დაფა', cm: 300 },
          { label: 'წიგნი', cm: 25, kind: 'book' },
        ],
      },
      hints: [],
      explanation: 'საშლელი 5 სმ → სანტიმეტრი. დაფა 300 სმ = 3 მ → მეტრი. წიგნი 25 სმ → სანტიმეტრი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე თითოეული 100 სმ-ს.',
    },
  ],
};
