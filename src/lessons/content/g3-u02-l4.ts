import type { Lesson } from '../types';

export const g3u02l4: Lesson = {
  id: 'g3-u02-l4', status: 'placeholder', objective: 'სამნიშნა რიცხვებს ვაკლებ ასეულებისა და ათეულების გადაჯგუფებით.', prerequisites: ['თანრიგების გამოკლება', 'ასი ათეულებად და ათი ერთეულებად'], minutes: 14, concepts: ['ასეულის დაშლა', 'ათეულის დაშლა', 'გამოკლება გადაჯგუფებით'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '432 − 178 = ?', response: { type: 'choice', options: [{ id: 'a', text: '254' }, { id: 'b', text: '346' }, { id: 'c', text: '264' }], answer: 'a' }, hints: [], explanation: '432-დან ათეულს ვცვლით ერთეულებად და ასეულს — ათეულებად; სხვაობაა 254.', fallbackFeedback: 'თუ ზედა თანრიგში საკმარისი არ არის, გაცვალე უფრო დიდი ბლოკი.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'გადააჯგუფე და გამოაკელი', prompt: 'ჯერ გაცვალე ბლოკები, რომ წასაღები რაოდენობა თითოეულ თანრიგში გეყოს.', hints: [], tool: { tool: 'three-digit-lab', op: 'subtract', examples: [{ a: 432, b: 178 }, { a: 503, b: 267 }, { a: 625, b: 147 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ერთი ბლოკის გაცვლა', prompt: 'გაცვლა რაოდენობას უცვლელად ინახავს.', blocks: [
      { type: 'three-digit-demo', a: 432, b: 178, op: '−', steps: ['2 ერთეული 8-ის გამოსაკლებად არ გვყოფნის: 1 ათეულს 10 ერთეულად ვცვლით.', '12 − 8 = 4 ერთეული; დარჩა 2 ათეული.', '2 ათეული 7-ის გამოსაკლებად არ გვყოფნის: 1 ასეულს 10 ათეულად ვცვლით.', '12 − 7 = 5 ათეული; 3 − 1 = 2 ასეული. პასუხია 254.'] },
      { type: 'text', text: '1 ასეული = 10 ათეული და 1 ათეული = 10 ერთეული. გაცვლის შემდეგ სვეტებში ჩაწერილი რაოდენობები იცვლება, მაგრამ მთლიანი მნიშვნელობა — არა.' },
      { type: 'worked', title: '503 − 267', steps: [{ text: 'რადგან ათეულები ნულია, ასეული ჯერ ათეულებად დაშალე.' }, { text: 'ერთი ათეული ერთეულებად დაშალე: 13 − 7 = 6.' }, { text: '9 − 6 = 3 ათეული; 4 − 2 = 2 ასეული. პასუხია 236.' }] },
      { type: 'callout', tone: 'tip', text: 'შეამოწმე შეკრებით: 254 + 178 = 432.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: '625 − 147 = ?', response: { type: 'numeric', answer: 478 }, hints: ['ერთეულებს ათეული სჭირდება, შემდეგ ათეულებს — ასეული.'], explanation: '625 − 147 = 478.', fallbackFeedback: 'შეამოწმე ორივე გაცვლა.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: '1 ასეული რამდენი ათეულია?', response: { type: 'numeric', answer: 10 }, hints: ['100 = 10 × 10.'], explanation: '1 ასეული = 10 ათეული.', fallbackFeedback: 'რამდენჯერ ეტევა 10 რიცხვში 100?' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: '503 − 267 = ?', response: { type: 'numeric', answer: 236 }, hints: ['ათეულების ნულის გამო ჯერ ასეული დაშალე.'], explanation: '503 − 267 = 236.', fallbackFeedback: 'შეამოწმე, საიდან მიიღე ათეულები.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'რატომ შეიძლება 1 ათეულის 10 ერთეულით შეცვლა?', response: { type: 'choice', options: [{ id: 'a', text: 'ორივეს ერთნაირი მნიშვნელობა აქვს' }, { id: 'b', text: 'რაოდენობა ათით იზრდება' }, { id: 'c', text: 'რაოდენობა ნულდება' }], answer: 'a' }, hints: ['1 ათეული = 10 ერთეული.'], explanation: 'გაცვლა მნიშვნელობას არ ცვლის.', fallbackFeedback: 'შეადარე ორივე ჯგუფის მნიშვნელობა.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: '741 − 358 = ?', response: { type: 'numeric', answer: 383 }, hints: [], explanation: '741 − 358 = 383.', fallbackFeedback: 'სვეტებში საჭირო გაცვლები შეამოწმე.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: '602 − 185 = ?', response: { type: 'numeric', answer: 417 }, hints: [], explanation: '602 − 185 = 417.', fallbackFeedback: 'ნულიან ათეულებში გადაჯგუფებაზე დაფიქრდი.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'საწყობში 432 ნივთი იყო; 178 გაიტანეს. რამდენი დარჩა?', response: { type: 'numeric', answer: 254 }, hints: [], explanation: '432 − 178 = 254 ნივთი.', fallbackFeedback: 'გამოაკელი გატანილი რაოდენობა.' },
  ],
};
