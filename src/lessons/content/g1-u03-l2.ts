import type { ChoiceOption, Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U03.2 "Finding Number Pairs That Make 5".
 * Demonstration content only. Several pairs are right; the explore tool never marks one as
 * "the" answer, and the challenge accepts every split that uses all five counters.
 */

const bond = (a: number, b: number): ChoiceOption['visual'] => ({ type: 'bond', whole: a + b, a, b });

export const g1u03l2: Lesson = {
  id: 'g1-u03-l2',
  status: 'placeholder',
  objective: 'ვპოულობ და ვცნობ რიცხვთა წყვილებს, რომლებიც ერთად 5-ს ქმნიან.',
  prerequisites: ['მთელი და ნაწილები (U03.1)'],
  minutes: 9,
  concepts: ['წყვილები, რომლებიც 5-ს ქმნიან', 'ხუთეულის ჩარჩო', 'ერთი მთელი, სხვადასხვა ნაწილი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! შეგიძლია იპოვო წყვილები, რომლებიც 5-ს ქმნიან.',
    retry: 'სცადე ისევ. გაიხსენე: რამდენი კუბიკი გაქვს და რამდენი გჭირდება კიდევ ხუთისთვის?',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'ხუთი კუბიკი გაანაწილე ორ ყუთში.',
      mascot: { intro: 'შეგიძლია 5 ორი ჯგუფით შეადგინო?' },
      response: { type: 'distribute', total: 5, glyph: 'counter', allowEmpty: true },
      hints: ['გადაიტანე ყველა კუბიკი ყუთებში. ნებისმიერი გაყოფა გამოგადგება.'],
      explanation: 'ორი ჯგუფი ერთად 5 არის. სხვანაირადაც შეიძლება!',
      incompleteFeedback: 'კიდევ რამდენიმე კუბიკი უნდა მოათავსო.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'რამდენი განსხვავებული წყვილი ქმნის 5-ს?',
      prompt: 'შეეხე კუბიკს, რომ მეორე ჯგუფში გადავიდეს. ნახე, რა წყვილს იღებ.',
      hints: ['შეეხე ერთ კუბიკს და ნახე, როგორ შეიცვალა ორივე ჯგუფი.', 'სცადე ისეთი წყვილი, რომელიც ჯერ არ გინახავს.'],
      tool: { tool: 'frame-pairs', size: 5, start: 2, reveal: true, revealAfter: 2 },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ერთი მთელი, სხვადასხვა ნაწილები',
      prompt: 'ორი ნაწილი შეიძლება სხვადასხვა რაოდენობის იყოს, მაგრამ მაინც ერთსა და იმავე მთელს ქმნიდეს.',
      blocks: [
        { type: 'bond-demo', mode: 'join', whole: 5, parts: [2, 3], frame: 5, caption: '2 და 3 ერთად 5 არის.' },
        { type: 'bond-demo', mode: 'join', whole: 5, parts: [4, 1], frame: 5, caption: '4 და 1 ერთად ისევ 5 არის.' },
        { type: 'callout', tone: 'tip', text: 'ხუთეულის ჩარჩო ყოველთვის ივსება, როცა ორი ნაწილი ერთად 5-ია.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'ჩარჩოში 2 კუბიკია. დაამატე კუბიკები, რომ 5 გახდეს.',
      response: { type: 'fill', size: 5, given: 2 },
      hints: ['შეხედე, რამდენი კუბიკი გაქვს უკვე. კიდევ რამდენი გჭირდება ხუთისთვის?'],
      explanation: '2 და 3 ერთად 5 არის.',
      incompleteFeedback: 'შეეხე ცარიელ ადგილებს და დაამატე კუბიკები.',
      fallbackFeedback: 'ჩარჩოში ჯერ კიდევ არის ცარიელი ადგილი. ხუთი ადგილი სრულად უნდა შეივსოს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რიცხვთა კავშირში მთელი 5-ია. რამდენია მეორე ნაწილი?',
      visual: { type: 'bond', whole: 5, a: 1, b: null, counters: 'split' },
      response: {
        type: 'choice',
        options: [
          { id: '3', text: '3' },
          { id: '4', text: '4' },
          { id: '5', text: '5' },
        ],
        answer: '4',
      },
      hints: ['შეხედე, რამდენი კუბიკი გაქვს უკვე. კიდევ რამდენი გჭირდება ხუთისთვის?'],
      explanation: '1 და 4 ერთად 5 არის.',
      misconceptions: [{ id: 'whole', answers: ['5'], feedback: '5 მთელია. მეორე ნაწილი მასზე პატარაა.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე რგოლებიანი კუბიკები.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი წყვილი ქმნის 5-ს?',
      response: {
        type: 'choice',
        options: [
          { id: '2-4', text: '2 და 4' },
          { id: '3-2', text: '3 და 2' },
          { id: '3-3', text: '3 და 3' },
        ],
        answer: '3-2',
      },
      hints: ['შეხედე, რამდენი გაქვს უკვე. კიდევ რამდენი გჭირდება ხუთისთვის?'],
      explanation: '3 და 2 ერთად 5 არის.',
      misconceptions: [{ id: 'six', answers: ['2-4', '3-3'], feedback: 'ეს ორი ნაწილი ერთად 6 არის. გვჭირდება 5.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორივე ნაწილი ერთად 5 უნდა იყოს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი რიცხვთა კავშირი ემთხვევა ჩარჩოს?',
      visual: { type: 'ten-frame', size: 5, count: 4, second: 1 },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ვარიანტი ა', visual: bond(4, 2) },
          { id: 'b', text: 'ვარიანტი ბ', visual: bond(4, 1) },
          { id: 'c', text: 'ვარიანტი გ', visual: bond(3, 1) },
        ],
        answer: 'b',
      },
      hints: ['ჯერ დათვალე სავსე წრეები, მერე რგოლებიანები.'],
      explanation: '4 და 1 ერთად 5 არის: კავშირი ჩარჩოს ემთხვევა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ორივე ჯგუფი და შეადარე კავშირს.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'მთელი 5-ია. ერთი ნაწილი 3-ია. რამდენია მეორე ნაწილი?',
      visual: { type: 'bond', whole: 5, a: 3, b: null },
      response: { type: 'numeric', answer: 2 },
      hints: ['რამდენი გაქვს უკვე? კიდევ რამდენი გჭირდება ხუთისთვის?'],
      explanation: '3 და 2 ერთად 5 არის.',
      misconceptions: [{ id: 'whole', answers: [5], feedback: '5 მთელია. მეორე ნაწილი მასზე პატარაა.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 3-ს რამდენი უნდა დაემატოს, რომ 5 გახდეს?',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი წყვილი ქმნის 5-ს?',
      response: {
        type: 'choice',
        options: [
          { id: '3-3', text: '3 და 3' },
          { id: '1-3', text: '1 და 3' },
          { id: '4-1', text: '4 და 1' },
        ],
        answer: '4-1',
      },
      hints: ['ორივე ნაწილი ერთად 5 უნდა იყოს.'],
      explanation: '4 და 1 ერთად 5 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე, ორივე რიცხვი ერთად 5-ია თუ არა.',
    },
  ],
};
