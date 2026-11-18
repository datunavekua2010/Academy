import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U02.5 "Building and Breaking Apart Numbers to 20".
 * Demonstration content only (see g1-u02-l1.ts). The challenge is a free
 * exploration (no single right split); the guided steps add less help each time.
 * The wording stays with "parts" and "together": no equations, no subtraction rules.
 */
export const g1u02l5: Lesson = {
  id: 'g1-u02-l5',
  status: 'placeholder',
  objective: 'რიცხვს ორ ნაწილად ვყოფ და ორი ნაწილისგან ვაწყობ: ნაწილები ერთად იგივე რიცხვს იძლევა.',
  prerequisites: ['რიცხვების დალაგება (U02.4)'],
  minutes: 9,
  concepts: ['რიცხვის ორ ნაწილად დაყოფა', 'ორი ნაწილისგან რიცხვის აგება', 'გამოტოვებული ნაწილის პოვნა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'საოცარია! რიცხვებს სხვადასხვანაირად აგებ.',
    retry: 'სცადე ისევ. მთელი გაიხსენე: ორივე ნაწილი ერთად მთელს უნდა გვაძლევდეს.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'explore',
      stage: 'challenge',
      title: 'შეგიძლია 10 სხვანაირად შეადგინო?',
      prompt: 'ათი კუბიკი გაანაწილე ორ ყუთში. სცადე სხვადასხვა გზა: სწორი გზა ბევრია.',
      mascot: { intro: 'შეგიძლია 10 სხვანაირად შეადგინო?' },
      tool: { tool: 'split', targets: [10] },
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'რამდენნაირად შეიძლება ერთი და იგივე რიცხვის აგება?',
      prompt: 'გადაიტანე კუბიკები ყუთებს შორის. ნახე, რა ნაწილებს იღებ და რა რჩება ერთად.',
      hints: ['გადაიტანე ერთი კუბიკი და შეხედე: ორივე ყუთში ერთად რამდენია?'],
      tool: { tool: 'split', targets: [8, 16], frame: true },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ნაწილები და მთელი',
      prompt: 'რიცხვი ორ ნაწილად შეგვიძლია გავყოთ. როცა ნაწილებს ერთად ვდებთ, ისევ მთელი გვაქვს.',
      blocks: [
        { type: 'compose', whole: 10, parts: [6, 4] },
        { type: 'compose', whole: 7, parts: [3, 4], caption: 'ამ რიცხვსაც რამდენიმე გზა აქვს: 1 და 6, 2 და 5, 3 და 4.' },
        { type: 'callout', tone: 'tip', text: 'ორ ნაწილად დავყავით, მერე ისევ ერთად დავდეთ: რაოდენობა არ შეცვლილა.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'მთელი 9-ია. ერთი ნაწილი 5-ია. რამდენია მეორე ნაწილი?',
      visual: { type: 'part-whole', whole: 9, part: 5, counters: 'split' },
      response: { type: 'numeric', answer: 4 },
      hints: ['დათვალე მთელი ჯგუფი და ნახე, რამდენი კუბიკი უკვე პირველ ნაწილშია.'],
      explanation: '5 და 4 ერთად 9 არის.',
      misconceptions: [{ id: 'whole', answers: [9], feedback: '9 მთელია. მეორე ნაწილი მასზე პატარაა.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რამდენი კუბიკი რჩება მთელში იმის შემდეგ, რაც 5 პირველ ნაწილშია?',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'ააგე 11: პირველ ყუთში ჩადე 4 კუბიკი, დანარჩენი მეორე ყუთში იყოს.',
      response: { type: 'split', total: 11, answer: 4, frame: true },
      hints: ['ჯერ პირველ ყუთში 4 კუბიკი დატოვე, დანარჩენი გადაიტანე მეორეში.'],
      explanation: '4 და 7 ერთად 11 არის.',
      misconceptions: [{ id: 'swapped', answers: [7], feedback: 'პირველ ყუთში 7 დატოვე. პირველში 4 უნდა იყოს, მეორეში — დანარჩენი.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე, რამდენია პირველ ყუთში.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ორი რიცხვი გვაძლევს ერთად 12-ს?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '5 და 6' },
          { id: 'b', text: '7 და 5' },
          { id: 'c', text: '8 და 5' },
        ],
        answer: 'b',
      },
      hints: ['დაიწყე ერთი ნაწილით და ნახე, რამდენი გჭირდება 12-მდე.'],
      explanation: '7 და 5 ერთად 12 არის.',
      misconceptions: [
        { id: 'one-less', answers: ['a'], feedback: '5 და 6 ერთად 11 არის. ერთი კიდევ გვჭირდება.' },
        { id: 'one-more', answers: ['c'], feedback: '8 და 5 ერთად 13 არის. ეს ერთით მეტია.' },
      ],
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'მთელი 14-ია. ერთი ნაწილი 8-ია. რამდენია მეორე ნაწილი?',
      visual: { type: 'part-whole', whole: 14, part: 8, counters: 'plain' },
      response: { type: 'numeric', answer: 6 },
      hints: ['დათვალე მთელი ჯგუფი. 8 უკვე პირველ ნაწილშია.'],
      explanation: '8 და 6 ერთად 14 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რამდენი კუბიკი რჩება 14-ში იმის შემდეგ, რაც 8 პირველ ნაწილშია?',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'ააგე 13: პირველ ყუთში ჩადე 5 კუბიკი, დანარჩენი მეორე ყუთში იყოს.',
      response: { type: 'split', total: 13, answer: 5 },
      hints: ['პირველ ყუთში 5 დატოვე, დანარჩენი გადაიტანე მეორეში.'],
      explanation: '5 და 8 ერთად 13 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე, რამდენია პირველ ყუთში.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი ორი რიცხვი გვაძლევს ერთად 15-ს?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '8 და 6' },
          { id: 'b', text: '9 და 6' },
          { id: 'c', text: '7 და 9' },
        ],
        answer: 'b',
      },
      hints: ['დაიწყე ერთი ნაწილით და ნახე, რამდენი გჭირდება 15-მდე.'],
      explanation: '9 და 6 ერთად 15 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე ნაწილი ერთად ზუსტად 15 უნდა იყოს.',
    },
  ],
};
