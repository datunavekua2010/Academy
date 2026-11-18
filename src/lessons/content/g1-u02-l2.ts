import type { Lesson } from '../types';
import { NUMBER_NAMES_0_20 } from './numberNames020';

/**
 * PLACEHOLDER lesson — Grade 1 · U02.2 "Reading, Writing, and Representing
 * Numbers to 20". Demonstration content only (see g1-u02-l1.ts).
 * The explore example (14) is not reused in the check.
 */
export const g1u02l2: Lesson = {
  id: 'g1-u02-l2',
  status: 'placeholder',
  objective: 'ერთსა და იმავე რიცხვს ციფრებით, სიტყვით და ჯგუფებით ვცნობ.',
  prerequisites: ['საგნების თვლა 20-მდე (U02.1)'],
  minutes: 8,
  concepts: ['რიცხვები 0-დან 20-მდე', 'რიცხვი ციფრით და სიტყვით', 'რიცხვი და რაოდენობა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'რიცხვებს სხვადასხვანაირად აჩვენებ!',
    retry: 'სცადე ისევ. შეხედე რიცხვს და იპოვე ჯგუფი, რომელიც იმავე რაოდენობას აჩვენებს.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ჯგუფი აჩვენებს რიცხვს 16?',
      mascot: { intro: 'შეგიძლია იპოვო რიცხვი, რომელიც ემთხვევა?' },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ჯგუფი ა', visual: { type: 'quantity', tens: 1, ones: 3 } },
          { id: 'b', text: 'ჯგუფი ბ', visual: { type: 'quantity', tens: 1, ones: 6 } },
          { id: 'c', text: 'ჯგუფი გ', visual: { type: 'quantity', tens: 0, ones: 6 } },
        ],
        answer: 'b',
      },
      maxAttempts: 2,
      revealOnExhaust: false,
      hints: ['16 არის ერთი სრული ათიანი და კიდევ რამდენიმე ცალი.'],
      explanation: 'ბრავო! 16 არის ერთი ათიანი და 6 ცალი.',
      misconceptions: [{ id: 'ones-only', answers: ['c'], feedback: 'აქ მხოლოდ 6 ცალია. 16-ში ერთი სრული ათიანიც არის.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ათიანი ჯგუფი და ცალები.',
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ერთი რიცხვი — სამი სახე',
      prompt: 'დაამატე ან ამოიღე საგნები. ნახე, როგორ იცვლება ციფრი, სახელი და ჯგუფები.',
      hints: ['დაამატე საგნები ერთ-ერთით და დააკვირდი, რა ხდება, როცა ათს მიაღწევ.'],
      tool: { tool: 'number-builder', max: 20, start: 14, names: NUMBER_NAMES_0_20, glyph: 'star' },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'სამივე ერთსა და იმავეს ამბობს',
      prompt: 'რიცხვი შეიძლება ვაჩვენოთ ციფრებით, სიტყვით და ჯგუფებით.',
      blocks: [
        { type: 'quantities', numbers: [6, 13, 17] },
        { type: 'text', text: 'ათ საგანს ერთ ჯგუფად ვაწყობთ. რაც ათზე მეტია, ცალ-ცალკე დარჩება: მაგალითად, 17 არის ერთი ათიანი და 7 ცალი.' },
        { type: 'callout', tone: 'tip', text: 'ჯერ შეხედე რიცხვს, მერე იპოვე ჯგუფი, რომელიც იმავე რაოდენობას აჩვენებს.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ჯგუფი აჩვენებს რიცხვს 12?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ჯგუფი ა', visual: { type: 'ten-frame', count: 10 } },
          { id: 'b', text: 'ჯგუფი ბ', visual: { type: 'ten-frame', count: 12 } },
          { id: 'c', text: 'ჯგუფი გ', visual: { type: 'ten-frame', count: 15 } },
        ],
        answer: 'b',
      },
      hints: ['შეხედე რიცხვს, მერე იპოვე ჯგუფი, რომელიც იმავე რაოდენობას აჩვენებს.'],
      explanation: '12 არის ერთი სრული ჩარჩო (10) და კიდევ 2.',
      misconceptions: [{ id: 'ten-only', answers: ['a'], feedback: 'ეს სრულად ათია. 12-ისთვის კიდევ ორი გვჭირდება.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ჩარჩოში არსებული წრეები.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი რიცხვია ნაჩვენები?',
      visual: { type: 'quantity', tens: 1, ones: 8 },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '8' },
          { id: 'b', text: '18' },
          { id: 'c', text: '19' },
        ],
        answer: 'b',
      },
      hints: ['ჯერ ათიანი დათვალე, მერე ცალები.'],
      explanation: 'ერთი ათიანი და 8 ცალი არის 18.',
      misconceptions: [{ id: 'forgot-ten', answers: ['a'], feedback: 'ცალები სწორად დათვალე, მაგრამ ათიანი ჯგუფიც გვაქვს.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ათიანი ჯგუფი და ცალები ცალ-ცალკე.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელია რიცხვი „ცხრამეტი“?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '9' },
          { id: 'b', text: '19' },
          { id: 'c', text: '12' },
        ],
        answer: 'b',
      },
      hints: ['„ცხრამეტი“ ათზე მეტია.'],
      explanation: 'ცხრამეტი იწერება 19.',
      misconceptions: [{ id: 'nine', answers: ['a'], feedback: '9 არის „ცხრა“. „ცხრამეტი“ უფრო დიდია.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ისევ წაიკითხე სახელი ნელა.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელია რიცხვი 20?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '2' },
          { id: 'b', text: '20' },
          { id: 'c', text: '10' },
        ],
        answer: 'b',
      },
      hints: ['20 ორი ათიანია.'],
      explanation: 'რიცხვი 20 იწერება ორი ციფრით: 2 და 0.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ისევ შეხედე ციფრებს.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი რიცხვია ნაჩვენები?',
      visual: { type: 'quantity', tens: 1, ones: 5 },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '5' },
          { id: 'b', text: '15' },
          { id: 'c', text: '16' },
        ],
        answer: 'b',
      },
      hints: ['ჯერ ათიანი დათვალე.'],
      explanation: 'ერთი ათიანი და 5 ცალი არის 15.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ათიანი ჯგუფი და ცალები ცალ-ცალკე დათვალე.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი რიცხვია „თერთმეტი“?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: '10' },
          { id: 'b', text: '11' },
          { id: 'c', text: '12' },
        ],
        answer: 'b',
      },
      hints: ['„თერთმეტი“ არის ათი და კიდევ ერთი.'],
      explanation: 'თერთმეტი იწერება 11.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. „თერთმეტი“ ათზე ერთით მეტია.',
    },
  ],
};
