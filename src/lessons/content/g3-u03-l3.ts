import type { Lesson } from '../types';

export const g3u03l3: Lesson = {
  id: 'g3-u03-l3', status: 'placeholder', objective: 'ცნობილ მთელსა და ნაწილს ზოლით წარმოვადგენ და დარჩენილ ნაწილს გამოკლებით ვპოულობ.', prerequisites: ['ნაწილი და მთელი', 'სამნიშნა გამოკლება'], minutes: 12, concepts: ['მთელიდან ნაწილის გამოკლება', 'უცნობი სეგმენტი', 'დარჩენილი რაოდენობა'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: 'სულ 350 ნივთიდან 120 ცნობილ ნაწილშია. რამდენია მეორე ნაწილში?', response: { type: 'choice', options: [{ id: 'a', text: '230' }, { id: 'b', text: '470' }, { id: 'c', text: '130' }], answer: 'a' }, hints: [], explanation: 'მთელს ცნობილი ნაწილი გამოვაკლოთ: 350 − 120 = 230.', fallbackFeedback: 'მთელ ზოლს ერთი ნაწილი გამოაცალე.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'იპოვე გამოტოვებული სეგმენტი', prompt: 'მთელისა და ცნობილი ნაწილის იარლიყები ზოლზე მოათავსე, შემდეგ იპოვე დარჩენილი ნაწილი.', hints: [], tool: { tool: 'bar-model-lab', examples: [{ story: 'სულ 350 ნივთია. პირველ ნაწილში 120-ია. რამდენია მეორეში?', a: 120, b: 230, missing: 'b' }, { story: 'სულ 500 ფურცელია; პირველ ნაწილში 175-ია. რამდენია მეორეში?', a: 175, b: 325, missing: 'b' }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ცნობილ ნაწილს მთელს ვაკლებთ', prompt: 'ზოლი დაგვეხმარება დავინახოთ, რა დარჩა.', blocks: [
      { type: 'bar-model-demo', a: 120, b: 230 },
      { type: 'text', text: 'მთელი ზოლი 350-ს აღნიშნავს. თუ ერთი ნაწილი 120-ია, მეორე ნაწილი მთელიდან 120-ის მოცილების შემდეგ დარჩება.' },
      { type: 'worked', title: '350 ნივთი', steps: [{ text: 'მთელი = 350; ცნობილი ნაწილი = 120.' }, { text: 'უცნობი ნაწილი = 350 − 120 = 230.' }, { text: 'შემოწმება: 120 + 230 = 350.' }] },
      { type: 'callout', tone: 'tip', text: 'მთელი ყოველთვის ორივე ნაწილს მოიცავს.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'მთელი 500-ია, ერთი ნაწილი 175. იპოვე მეორე.', response: { type: 'numeric', answer: 325 }, hints: ['500 − 175.'], explanation: '500 − 175 = 325.', fallbackFeedback: 'მთელს ცნობილი ნაწილი გამოაკელი.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'რომელი გამოსახულება პოულობს 420-ის მეორე ნაწილს, თუ პირველი 150-ია?', response: { type: 'choice', options: [{ id: 'a', text: '420 − 150' }, { id: 'b', text: '420 + 150' }, { id: 'c', text: '150 − 420' }], answer: 'a' }, hints: ['მთელს ნაწილი მოაცილე.'], explanation: '420 − 150 = 270.', fallbackFeedback: 'მთელი და ნაწილი სწორად განალაგე.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: '420 ფანქრიდან 150 გაიცა. რამდენი დარჩა?', response: { type: 'numeric', answer: 270 }, hints: ['გამოაკელი გაცემული.'], explanation: '420 − 150 = 270.', fallbackFeedback: 'დარჩენილი უცნობი ნაწილია.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'როგორ შეამოწმებ 350 − 120 = 230-ს?', response: { type: 'choice', options: [{ id: 'a', text: '120 + 230 = 350' }, { id: 'b', text: '120 − 230 = 350' }, { id: 'c', text: '350 + 230 = 120' }], answer: 'a' }, hints: ['ნაწილები ისევ შეაერთე.'], explanation: '120 + 230 = 350.', fallbackFeedback: 'ორივე ნაწილი უნდა შეადგინოს მთელი.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'მთელი 670-ია, ერთი ნაწილი 240. რამდენია მეორე?', response: { type: 'numeric', answer: 430 }, hints: [], explanation: '670 − 240 = 430.', fallbackFeedback: 'მთელს ცნობილი ნაწილი გამოაკელი.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'იყო 315 წიგნი; 125 გასცეს. რამდენი დარჩა?', response: { type: 'numeric', answer: 190 }, hints: [], explanation: '315 − 125 = 190.', fallbackFeedback: 'დარჩენილი ნაწილი იპოვე.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'მთელი 260-ია, მეორე ნაწილი 80. პირველი რამდენია?', response: { type: 'numeric', answer: 180 }, hints: [], explanation: '260 − 80 = 180.', fallbackFeedback: 'გამოიყენე მთელი და ცნობილი ნაწილი.' },
  ],
};
