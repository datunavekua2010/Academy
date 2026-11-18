import type { ChoiceOption, Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U03.1 "Understanding Parts and Wholes".
 * Demonstration content only: every number, question and picture below is an illustrative
 * stand-in until the academy supplies and approves the real lesson. Replacing a value here
 * never requires touching a component.
 */

const parts = (a: number, b: number): ChoiceOption['visual'] => ({ type: 'parts', a, b });

export const g1u03l1: Lesson = {
  id: 'g1-u03-l1',
  status: 'placeholder',
  objective: 'მთელი რაოდენობა ორ ნაწილად შეიძლება გავყოთ, ორი ნაწილი ერთად კი ისევ მთელს ქმნის.',
  prerequisites: ['რიცხვები 20-მდე (U02)'],
  minutes: 9,
  concepts: ['მთელი და ნაწილები', 'მთელის ორ ნაწილად დაყოფა', 'ნაწილების გაერთიანება', 'რიცხვთა კავშირი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'კარგი სამუშაო გააკეთე! იცი, როგორ ქმნიან ნაწილები მთელს.',
    retry: 'სცადე ისევ. გაიხსენე: ორივე ნაწილი ერთად მთელს ქმნის.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'შეგიძლია ყველა კუბიკი ორ ყუთში გადაიტანო?',
      mascot: { intro: 'შეგიძლია ჯგუფი ორ ნაწილად გაყო?' },
      response: { type: 'distribute', total: 8, glyph: 'counter', allowEmpty: false },
      hints: ['გადაიტანე კუბიკები დიდი ჭურჭლიდან ყუთებში. ჭურჭელში არცერთი არ უნდა დარჩეს.'],
      explanation: 'მთელი ორ ნაწილად გაყავი!',
      incompleteFeedback: 'კიდევ რამდენიმე კუბიკი უნდა მოათავსო.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'რა ხდება, როცა ნაწილებს ერთად ვდებთ?',
      prompt: 'აირჩიე მთელი. გადაიტანე კუბიკები ორ ნაწილს შორის, მერე გააერთიანე ისინი.',
      hints: ['გადაიტანე ერთი კუბიკი და დააკვირდი: ორივე ნაწილი ერთად რამდენია?', 'სცადე „ნაწილების გაერთიანება“: მთელი იგივე რჩება?'],
      tool: { tool: 'bond-split', wholes: [2, 10], start: { whole: 7, a: 3 } },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'მთელი და ნაწილები',
      prompt: 'მთელი არის სრული რაოდენობა. ნაწილები უფრო პატარა ჯგუფებია, რომლებიც მთელს ქმნიან.',
      blocks: [
        { type: 'bond-demo', mode: 'join', whole: 7, parts: [3, 4], caption: 'ერთ ჯგუფში 3 კუბიკია, მეორეში 4. ნაწილებს რომ ერთად დავდებთ, მთელს ვიღებთ.' },
        { type: 'callout', tone: 'tip', text: 'ნაწილების ერთად დადებით ისევ მთელს ვიღებთ.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'გაყავი 6 კუბიკი ორ ნაწილად.',
      response: { type: 'distribute', total: 6, glyph: 'counter', allowEmpty: false },
      hints: ['დათვალე ორივე ნაწილი. ერთად ისინი მთელს ქმნიან.'],
      explanation: 'ორი ნაწილი ერთად ისევ 6 კუბიკია.',
      incompleteFeedback: 'კიდევ რამდენიმე კუბიკი უნდა მოათავსო.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'სურათზე ორი ნაწილია. რამდენია მთელი?',
      visual: { type: 'parts', a: 2, b: 5 },
      response: {
        type: 'choice',
        options: [
          { id: '5', text: '5' },
          { id: '7', text: '7' },
          { id: '8', text: '8' },
        ],
        answer: '7',
      },
      hints: ['დათვალე ორივე ნაწილი. ერთად ისინი მთელს ქმნიან.'],
      explanation: '2 და 5 ერთად 7 არის. ეს მთელია.',
      misconceptions: [
        { id: 'one-part', answers: ['5'], feedback: 'ეს მხოლოდ ერთი ნაწილია. მთელისთვის ორივე ნაწილი ერთად დათვალე.' },
        { id: 'too-many', answers: ['8'], feedback: 'ერთხელ კიდევ დათვალე ორივე ჯგუფი: ერთი კუბიკი ზედმეტად დათვალე.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ორივე ნაწილი ერთად.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი სურათი ემთხვევა ამ რიცხვთა კავშირს?',
      visual: { type: 'bond', whole: 8, a: 3, b: 5 },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ვარიანტი ა', visual: parts(3, 4) },
          { id: 'b', text: 'ვარიანტი ბ', visual: parts(3, 5) },
          { id: 'c', text: 'ვარიანტი გ', visual: parts(4, 5) },
        ],
        answer: 'b',
      },
      hints: ['ჯერ ნახე, რა ორი ნაწილია კავშირში. მერე დათვალე სურათის ორივე ჯგუფი.'],
      explanation: 'კავშირში ნაწილები 3 და 5-ია, სურათზეც 3 და 5 კუბიკია.',
      misconceptions: [
        { id: 'second-part', answers: ['a'], feedback: 'პირველი ნაწილი 3-ია, მაგრამ მეორე ჯგუფი ჩვენს კავშირს არ ემთხვევა.' },
        { id: 'first-part', answers: ['c'], feedback: 'მეორე ნაწილი 5-ია, მაგრამ პირველი ჯგუფი ჩვენს კავშირს არ ემთხვევა.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორივე რიცხვი ორივე ჯგუფს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'სურათზე ორი ნაწილია. რამდენია მთელი?',
      visual: { type: 'parts', a: 4, b: 5 },
      response: { type: 'numeric', answer: 9 },
      hints: ['დათვალე ორივე ნაწილი. ერთად ისინი მთელს ქმნიან.'],
      explanation: '4 და 5 ერთად 9 არის.',
      misconceptions: [
        { id: 'first', answers: [4], feedback: 'ეს მხოლოდ ერთი ნაწილია. მთელისთვის ორივე ნაწილი ერთად დათვალე.' },
        { id: 'second', answers: [5], feedback: 'ეს მხოლოდ ერთი ნაწილია. მთელისთვის ორივე ნაწილი ერთად დათვალე.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ორივე ნაწილი ერთად.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი ორი ნაწილი ქმნის 10-ს?',
      response: {
        type: 'choice',
        options: [
          { id: '6-3', text: '6 და 3', visual: parts(6, 3) },
          { id: '7-3', text: '7 და 3', visual: parts(7, 3) },
          { id: '5-4', text: '5 და 4', visual: parts(5, 4) },
        ],
        answer: '7-3',
      },
      hints: ['ორივე ნაწილი ერთად მთელს, ანუ 10-ს უნდა ქმნიდეს.'],
      explanation: '7 და 3 ერთად 10 არის.',
      misconceptions: [
        { id: 'nine-a', answers: ['6-3', '5-4'], feedback: 'ეს ორი ნაწილი ერთად 9 არის. გვჭირდება 10.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ორივე ნაწილი ერთად.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი სურათი ემთხვევა ამ რიცხვთა კავშირს?',
      visual: { type: 'bond', whole: 4, a: 1, b: 3 },
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'ვარიანტი ა', visual: parts(2, 3) },
          { id: 'b', text: 'ვარიანტი ბ', visual: parts(1, 2) },
          { id: 'c', text: 'ვარიანტი გ', visual: parts(1, 3) },
        ],
        answer: 'c',
      },
      hints: ['შეადარე კავშირის რიცხვები სურათის ჯგუფებს.'],
      explanation: '1 და 3 ერთად 4 არის: ეს სურათი კავშირს ემთხვევა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. კავშირში მთელი 4-ია: ორივე ჯგუფი ერთად რამდენია?',
    },
  ],
};
