import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U02.3 "Comparing Numbers to 20".
 * Demonstration content only (see g1-u02-l1.ts). In the check the pairing view
 * and explanatory arrows are gone; only basic number pictures remain.
 * Symbols are chosen directly (no drag-and-drop in this prototype).
 */
const SYMBOLS = [
  { id: 'lt', text: '<' },
  { id: 'gt', text: '>' },
  { id: 'eq', text: '=' },
];

export const g1u02l3: Lesson = {
  id: 'g1-u02-l3',
  status: 'placeholder',
  objective: 'ვადარებ რიცხვებს 20-მდე: ვიცი, რომელია მეტი, ნაკლები, ან ტოლია.',
  prerequisites: ['რიცხვები 0-დან 20-მდე (U02.2)'],
  minutes: 9,
  concepts: ['რომელია მეტი', 'რომელია ნაკლები', 'ტოლი რაოდენობა', 'ნიშნები <, > და ='],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავი შედარება! შენ იცი, რომელი რიცხვია დიდი, პატარა ან ტოლი.',
    retry: 'სცადე ისევ. შეგიძლია საგნები დათვალო ან რიცხვები ღერძზე ნახო.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელ ჯგუფში მეტი საგანია?',
      visual: { type: 'compare', a: 12, b: 8, view: 'objects', glyph: 'fish' },
      mascot: { intro: 'რომელ ჯგუფში მეტია? შეხედე ორივეს.' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ჯგუფი ა' },
          { id: 'b', text: 'ჯგუფი ბ' },
          { id: 'c', text: 'ორივეში ერთნაირია' },
        ],
        answer: 'a',
      },
      maxAttempts: 2,
      revealOnExhaust: false,
      hints: ['დათვალე თითოეული ჯგუფი ცალ-ცალკე.'],
      explanation: 'ბრავო! ჯგუფ ა-ში მეტი საგანია.',
      fallbackFeedback: 'ისევ შეხედე ორივე ჯგუფს. შეგიძლია საგნები დათვალო.',
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'როგორ შევადაროთ ორი რიცხვი?',
      prompt: 'დაამატე ან ამოიღე საგნები ორივე ჯგუფში. სცადე „წყვილები“: ვის რჩება ზედმეტი?',
      hints: ['ყოველ საგანს სხვა ჯგუფიდან წყვილი უნდა შეუხამო. ვის დარჩა წყვილის გარეშე?'],
      tool: { tool: 'compare', max: 20, start: [7, 4], glyph: 'apple' },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'მეტი, ნაკლები, ტოლი',
      prompt: 'ორი რიცხვი შეიძლება იყოს ტოლი, ან ერთი მეორეზე მეტი.',
      blocks: [
        { type: 'text', text: 'მეტი — უფრო დიდი რაოდენობა. ნაკლები — უფრო პატარა რაოდენობა. ტოლი — ერთნაირი რაოდენობა.' },
        { type: 'compare', a: 9, b: 14, view: 'objects', glyph: 'star', caption: '14 უფრო მეტია, ვიდრე 9.' },
        { type: 'compare', a: 16, b: 11, view: 'line', caption: 'რიცხვით ღერძზე უფრო დიდი რიცხვი უფრო მარჯვნივ დგას.' },
        { type: 'compare', a: 12, b: 12, view: 'pairs', glyph: 'ball', caption: 'ყველა საგანს წყვილი ჰყავს, ამიტომ რაოდენობა ტოლია.' },
        { type: 'compare', a: 8, b: 13, view: 'numbers', symbol: true, caption: 'ეს ნიშანი ჩაწერილი სახით ამბობს, რომ 8 უფრო პატარაა, ვიდრე 13.' },
        { type: 'callout', tone: 'tip', text: 'ნიშანი ისე არ დაიმახსოვრო. ჯერ გაარკვიე, რომელი რიცხვია დიდი, მერე ჩაწერე ნიშანი.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ ჯგუფში მეტი საგანია?',
      visual: { type: 'compare', a: 6, b: 11, view: 'objects', glyph: 'star' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ჯგუფი ა' },
          { id: 'b', text: 'ჯგუფი ბ' },
          { id: 'c', text: 'ორივეში ერთნაირია' },
        ],
        answer: 'b',
      },
      hints: ['დათვალე თითოეული ჯგუფი ცალ-ცალკე.', 'შეგიძლია საგნები წყვილებად შეაწყვილო: რომელ ჯგუფში რჩება ზედმეტი?'],
      explanation: 'ჯგუფ ბ-ში 11 საგანია, ჯგუფ ა-ში — 6. ამიტომ ბ-ში მეტია.',
      misconceptions: [{ id: 'first', answers: ['a'], feedback: 'ჯგუფი ა პატარაა. ისევ დათვალე ორივე ჯგუფი.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ისევ დათვალე ორივე ჯგუფი.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი რიცხვია უფრო პატარა: 14 თუ 9?',
      visual: { type: 'compare', a: 14, b: 9, view: 'line' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '14' },
          { id: 'b', text: '9' },
        ],
        answer: 'b',
      },
      hints: ['შეგიძლია საგნები დათვალო ან რიცხვითი ღერძის რიცხვებს შეხედო.', 'ღერძზე უფრო პატარა რიცხვი მარცხნივ დგას.'],
      explanation: '9 უფრო პატარაა, ვიდრე 14: ღერძზე ის მარცხნივ დგას.',
      misconceptions: [{ id: 'bigger', answers: ['a'], feedback: '14 უფრო დიდია. ჩვენ ვეძებთ პატარა რიცხვს.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რომელი რიცხვი დგას ღერძზე უფრო მარცხნივ?',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'შეავსე შედარება: 15 ? 11',
      response: { type: 'choice', options: SYMBOLS, answer: 'gt' },
      hints: ['ჯერ გაარკვიე, რომელი რიცხვია უფრო დიდი.', 'ახლა ჩაწერე ისეთი ნიშანი, რომელიც ამას გამოხატავს.'],
      explanation: '15 უფრო დიდია, ვიდრე 11. ამიტომ ვწერთ 15 > 11.',
      misconceptions: [
        { id: 'less', answers: ['lt'], feedback: 'ეს ნიშანი ამბობს, რომ პირველი რიცხვი პატარაა. 15 კი 11-ზე დიდია.' },
        { id: 'equal', answers: ['eq'], feedback: 'ეს ნიშანი ტოლობას აჩვენებს, მაგრამ 15 და 11 ტოლი არ არის.' },
      ],
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი რიცხვია უფრო დიდი: 17 თუ 12?',
      visual: { type: 'compare', a: 17, b: 12, view: 'line' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '17' },
          { id: 'b', text: '12' },
        ],
        answer: 'a',
      },
      hints: ['რომელი რიცხვი დგას ღერძზე უფრო მარჯვნივ?'],
      explanation: '17 უფრო დიდია, ვიდრე 12.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რომელი რიცხვია უფრო მარჯვნივ?',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელ ჯგუფში არის ნაკლები საგანი?',
      visual: { type: 'compare', a: 13, b: 18, view: 'objects', glyph: 'ball' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ჯგუფი ა' },
          { id: 'b', text: 'ჯგუფი ბ' },
          { id: 'c', text: 'ორივეში ერთნაირია' },
        ],
        answer: 'a',
      },
      hints: ['დათვალე ორივე ჯგუფი და შეადარე რიცხვები.'],
      explanation: 'ჯგუფ ა-ში 13 საგანია, ბ-ში — 18. ამიტომ ა-ში ნაკლებია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ჩვენ ვეძებთ ჯგუფს, სადაც ნაკლებია.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'შეავსე შედარება: 14 ? 14',
      response: { type: 'choice', options: SYMBOLS, answer: 'eq' },
      hints: ['შეადარე ორივე რიცხვი: ერთნაირია?'],
      explanation: '14 და 14 ერთნაირია, ამიტომ ვწერთ 14 = 14.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორივე რიცხვი ერთმანეთს.',
    },
  ],
};
