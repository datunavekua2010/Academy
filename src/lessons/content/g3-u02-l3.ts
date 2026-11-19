import type { Lesson } from '../types';

export const g3u02l3: Lesson = {
  id: 'g3-u02-l3', status: 'placeholder', objective: 'სამნიშნა რიცხვებს ვაკლებ შესაბამისი თანრიგების მიხედვით გადაჯგუფების გარეშე.', prerequisites: ['თანრიგები', 'გამოკლება'], minutes: 12, concepts: ['სამნიშნა გამოკლება', 'თანრიგების გასწორება', 'დარჩენილი რაოდენობა'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '568 − 243 = ?', response: { type: 'choice', options: [{ id: 'a', text: '325' }, { id: 'b', text: '335' }, { id: 'c', text: '425' }], answer: 'a' }, hints: [], explanation: '5 − 2 = 3 ასეული, 6 − 4 = 2 ათეული, 8 − 3 = 5 ერთეული.', fallbackFeedback: 'გამოაკელი შესაბამისი თანრიგები.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'წასაღები ბლოკები', prompt: 'წაიღე მეორე რიცხვის ასეულები, ათეულები და ერთეულები; წაიკითხე რაც დარჩა.', hints: [], tool: { tool: 'three-digit-lab', op: 'subtract', examples: [{ a: 568, b: 243 }, { a: 795, b: 362 }, { a: 864, b: 321 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'გამოკლება სვეტებად', prompt: 'გაასწორე თანრიგები და ამოაკელი თითოეული ჯგუფი.', blocks: [
      { type: 'three-digit-demo', a: 568, b: 243, op: '−', steps: ['ერთეულები: 8 − 3 = 5.', 'ათეულები: 6 − 4 = 2.', 'ასეულები: 5 − 2 = 3.', 'დარჩა 325.'] },
      { type: 'text', text: 'როცა ყოველ თანრიგში ზედა ციფრი საკმარისია, ბლოკების გაცვლა არ გვჭირდება.' },
      { type: 'worked', title: '795 − 362', steps: [{ text: '5 − 2 = 3 ერთეული.' }, { text: '9 − 6 = 3 ათეული.' }, { text: '7 − 3 = 4 ასეული; სხვაობა 433.' }] },
      { type: 'callout', tone: 'tip', text: 'გამოკლება შეკრებით შეამოწმე: სხვაობას გამოკლებული დაუმატე.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: '795 − 362 = ?', response: { type: 'numeric', answer: 433 }, hints: ['5 − 2, 9 − 6, 7 − 3.'], explanation: '795 − 362 = 433.', fallbackFeedback: 'შეამოწმე თითოეული სვეტი.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: '864 − 321-ის ათეულების სხვაობა რამდენია?', response: { type: 'numeric', answer: 40 }, hints: ['6 ათეულს 2 ათეული გამოაკელი.'], explanation: '60 − 20 = 40.', fallbackFeedback: 'ათეულების მნიშვნელობა გაითვალისწინე.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: '864 − 321 = ?', response: { type: 'numeric', answer: 543 }, hints: ['ერთეულები 4 − 1; ათეულები 6 − 2; ასეულები 8 − 3.'], explanation: '864 − 321 = 543.', fallbackFeedback: 'გამოაკელი თანრიგები.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'როგორ შევამოწმოთ 568 − 243 = 325?', response: { type: 'choice', options: [{ id: 'a', text: '325 + 243 = 568' }, { id: 'b', text: '325 − 243 = 568' }, { id: 'c', text: '568 + 243 = 325' }], answer: 'a' }, hints: ['დარჩენილს წაღებული რაოდენობა დაუბრუნე.'], explanation: '325 + 243 = 568.', fallbackFeedback: 'გამოიყენე საპირისპირო მოქმედება.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: '987 − 654 = ?', response: { type: 'numeric', answer: 333 }, hints: [], explanation: '987 − 654 = 333.', fallbackFeedback: 'გამოაკელი შესაბამისი სვეტები.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: '746 − 325 = ?', response: { type: 'numeric', answer: 421 }, hints: [], explanation: '746 − 325 = 421.', fallbackFeedback: 'დაიწყე ერთეულებიდან.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'იყო 678 რვეული. 234 გასცეს. რამდენი დარჩა?', response: { type: 'numeric', answer: 444 }, hints: [], explanation: '678 − 234 = 444 რვეული.', fallbackFeedback: 'წაღებული რაოდენობა გამოაკელი საწყისს.' },
  ],
};
