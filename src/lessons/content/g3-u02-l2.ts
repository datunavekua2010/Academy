import type { Lesson } from '../types';

export const g3u02l2: Lesson = {
  id: 'g3-u02-l2', status: 'placeholder', objective: 'სამნიშნა რიცხვებს ვკრებ და ათ ერთეულს ათეულად, ათ ათეულს კი ასეულად ვაჯგუფებ.', prerequisites: ['შეკრება გადაჯგუფების გარეშე'], minutes: 14, concepts: ['ათეულის გადატანა', 'ასეულის გადატანა', 'თანრიგების გაცვლა'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '268 + 157 = ?', response: { type: 'choice', options: [{ id: 'a', text: '425' }, { id: 'b', text: '315' }, { id: 'c', text: '415' }], answer: 'a' }, hints: [], explanation: '8 + 7 = 15; ათ ერთეულს ათეულად ვცვლით. 6 + 5 + 1 = 12 ათეული; ათ ათეულს ასეულად ვცვლით. ჯამია 425.', fallbackFeedback: 'სათითაოდ შეკრიბე სვეტები და დააჯგუფე ათეული.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'გადაჯგუფების სახელოსნო', prompt: 'შეაერთე რიცხვების ბლოკები, შემდეგ გაცვალე ათეული და ასეული.', hints: [], tool: { tool: 'three-digit-lab', op: 'add', examples: [{ a: 268, b: 157 }, { a: 146, b: 235 }, { a: 384, b: 246 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ათი ერთეული — ერთი ათეული', prompt: 'გაცვლისას რაოდენობა არ იცვლება, მხოლოდ ჩანაწერი იცვლება.', blocks: [
      { type: 'three-digit-demo', a: 268, b: 157, op: '+', steps: ['8 + 7 = 15 ერთეული: 5 რჩება, 1 ათეული გადადის.', '6 + 5 + 1 = 12 ათეული: 2 რჩება, 1 ასეული გადადის.', '2 + 1 + 1 = 4 ასეული.', '268 + 157 = 425.'] },
      { type: 'text', text: 'ათი ერთეული უდრის ერთ ათეულს; ათი ათეული უდრის ერთ ასეულს. გადატანილი ერთეული შემდეგ სვეტში უნდა დავუმატოთ.' },
      { type: 'worked', title: '146 + 235', steps: [{ text: '6 + 5 = 11: ვწერთ 1 ერთეულს და გადავიტანთ 1 ათეულს.' }, { text: '4 + 3 + 1 = 8 ათეული; 1 + 2 = 3 ასეული.' }, { text: 'ჯამია 381.' }] },
      { type: 'callout', tone: 'tip', text: 'გადატანილი ათეული არ დაგავიწყდეს.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: '146 + 235 = ?', response: { type: 'numeric', answer: 381 }, hints: ['6 + 5 = 11: ერთი ათეული გადაიტანე.'], explanation: '146 + 235 = 381.', fallbackFeedback: 'შეამოწმე გადატანილი ათეული.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'რამდენ ათეულს ვიღებთ 13 ერთეულის გადაჯგუფებისას?', response: { type: 'numeric', answer: 1 }, hints: ['13 ერთეული = 10 ერთეული + 3 ერთეული.'], explanation: '10 ერთეული 1 ათეულია; 3 ერთეული რჩება.', fallbackFeedback: 'ათ ერთეულში რამდენი ათეულია?' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: '384 + 246 = ?', response: { type: 'numeric', answer: 630 }, hints: ['4 + 6 = 10; 8 + 4 + 1 = 13 ათეული.'], explanation: '384 + 246 = 630.', fallbackFeedback: 'ორივე გადატანა შეამოწმე.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: '10 ათეული რისი ტოლია?', response: { type: 'choice', options: [{ id: 'a', text: '1 ასეულის' }, { id: 'b', text: '1 ერთეულის' }, { id: 'c', text: '10 ასეულის' }], answer: 'a' }, hints: ['10 × 10 = 100.'], explanation: '10 ათეული = 100 = 1 ასეული.', fallbackFeedback: 'ათეულის მნიშვნელობა ათზე გაამრავლე.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: '257 + 164 = ?', response: { type: 'numeric', answer: 421 }, hints: [], explanation: '7 + 4 = 11; 5 + 6 + 1 = 12; ჯამია 421.', fallbackFeedback: 'შეამოწმე გადაჯგუფებები.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: '329 + 145 = ?', response: { type: 'numeric', answer: 474 }, hints: [], explanation: '329 + 145 = 474.', fallbackFeedback: 'დაიწყე ერთეულებიდან.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'საწყობში 275 ყუთი იყო, შემდეგ 138 მიიტანეს. რამდენია ახლა?', response: { type: 'numeric', answer: 413 }, hints: [], explanation: '275 + 138 = 413 ყუთი.', fallbackFeedback: 'მიღებული ყუთები საწყის რაოდენობას დაუმატე.' },
  ],
};
