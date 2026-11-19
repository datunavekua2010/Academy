import type { Lesson } from '../types';

export const g3u02l1: Lesson = {
  id: 'g3-u02-l1', status: 'placeholder', objective: 'სამნიშნა რიცხვებს ვკრებ თანრიგების მიხედვით გადაჯგუფების გარეშე.', prerequisites: ['ასეულები, ათეულები და ერთეულები'], minutes: 12, concepts: ['სამნიშნა რიცხვი', 'თანრიგები', 'შეკრება გადაჯგუფების გარეშე'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: 'რამდენია 123 + 245?', response: { type: 'choice', options: [{ id: 'a', text: '368' }, { id: 'b', text: '358' }, { id: 'c', text: '268' }], answer: 'a' }, hints: [], explanation: '100 + 200 = 300, 20 + 40 = 60, 3 + 5 = 8; სულ 368.', fallbackFeedback: 'შეაერთე ერთი და იგივე თანრიგები.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'თანრიგების შეკრების დაფა', prompt: 'დაამატე მეორე რიცხვის ბლოკები და დააკვირდი თითოეულ თანრიგს.', hints: [], tool: { tool: 'three-digit-lab', op: 'add', examples: [{ a: 123, b: 245 }, { a: 314, b: 252 }, { a: 427, b: 132 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ასეულები, ათეულები, ერთეულები', prompt: 'თანრიგები ერთმანეთის ქვეშ დავალაგოთ.', blocks: [
      { type: 'three-digit-demo', a: 123, b: 245, op: '+', steps: ['ერთეულები: 3 + 5 = 8.', 'ათეულები: 2 + 4 = 6 ათეული.', 'ასეულები: 1 + 2 = 3 ასეული.', 'ჯამია 368; არც ერთ თანრიგში ათი ბლოკი არ დაგროვდა.'] },
      { type: 'text', text: 'რიცხვებს სვეტებად ვწერთ: ერთეულები ერთეულების ქვეშ, ათეულები ათეულების ქვეშ, ასეულები ასეულების ქვეშ.' },
      { type: 'worked', title: '314 + 252', steps: [{ text: '4 + 2 = 6 ერთეული.' }, { text: '1 + 5 = 6 ათეული.' }, { text: '3 + 2 = 5 ასეული; ჯამი 566.' }] },
      { type: 'callout', tone: 'tip', text: 'გადაჯგუფება საჭირო არ არის, როცა ყოველი თანრიგის ჯამი ათზე ნაკლებია.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'იპოვე 314 + 252.', response: { type: 'numeric', answer: 566 }, hints: ['ჯერ 4 + 2, შემდეგ 1 + 5, ბოლოს 3 + 2.'], explanation: '314 + 252 = 566.', fallbackFeedback: 'შეამოწმე თითოეული სვეტი.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'რა არის 427 + 132-ის ასეულების ჯამი?', response: { type: 'numeric', answer: 500 }, hints: ['4 ასეულს 1 ასეული დაუმატე.'], explanation: '400 + 100 = 500.', fallbackFeedback: 'ასეულების მნიშვნელობა გაითვალისწინე.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'იპოვე 427 + 132.', response: { type: 'numeric', answer: 559 }, hints: ['ერთეულები: 7 + 2; ათეულები: 2 + 3; ასეულები: 4 + 1.'], explanation: '427 + 132 = 559.', fallbackFeedback: 'თანრიგები სათითაოდ შეკრიბე.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'რატომ არ სჭირდება 123 + 245-ს გადაჯგუფება?', response: { type: 'choice', options: [{ id: 'a', text: 'არც ერთ სვეტში ჯამი ათს არ აღწევს' }, { id: 'b', text: 'ორივე რიცხვი სამნიშნაა' }, { id: 'c', text: 'ყოველი ციფრი ერთნაირია' }], answer: 'a' }, hints: ['შეამოწმე 3 + 5, 2 + 4 და 1 + 2.'], explanation: 'თითოეული სვეტის ჯამი ათზე ნაკლებია.', fallbackFeedback: 'შეადარე თითოეული სვეტის ჯამი ათს.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'იპოვე 231 + 456.', response: { type: 'numeric', answer: 687 }, hints: [], explanation: 'ერთეულები 7, ათეულები 8, ასეულები 6; ჯამი 687.', fallbackFeedback: 'შეამოწმე თანრიგები.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'იპოვე 402 + 157.', response: { type: 'numeric', answer: 559 }, hints: [], explanation: '400 + 100 = 500; 0 + 50 = 50; 2 + 7 = 9.', fallbackFeedback: 'ნულიც შესაბამის თანრიგში დატოვე.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'ბიბლიოთეკაში იყო 125 წიგნი და მიიღეს 143. რამდენია სულ?', response: { type: 'numeric', answer: 268 }, hints: [], explanation: '125 + 143 = 268 წიგნი.', fallbackFeedback: 'დაუმატე მიღებული წიგნები საწყის რაოდენობას.' },
  ],
};
