import type { Lesson } from '../types';

export const g3u01l4: Lesson = {
  id: 'g3-u01-l4', status: 'placeholder', objective: 'შეკრებასა და გამოკლებამდე ვამრგვალებ რიცხვებს და მიახლოებით შედეგს ზუსტს ვადარებ.', prerequisites: ['ათეულამდე და ასეულამდე დამრგვალება'], minutes: 13, concepts: ['მიახლოებითი ჯამი', 'მიახლოებითი სხვაობა', 'ზუსტი შედეგი', 'გონივრულობა'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '287 + 416 დაახლოებით რამდენია, თუ ორივე რიცხვს ასეულამდე დავამრგვალებთ?', response: { type: 'choice', options: [{ id: 'a', text: '700' }, { id: 'b', text: '400' }, { id: 'c', text: '1000' }], answer: 'a' }, hints: [], explanation: '287 ≈ 300 და 416 ≈ 400; 300 + 400 = 700.', fallbackFeedback: 'ჯერ თითოეული რიცხვი დაამრგვალე.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'ჯერ მიახლოებით', prompt: 'მარკერით იპოვე პირველი რიცხვის უახლოესი ასეული; შემდეგ შეადარე მიახლოებითი და ზუსტი შედეგები.', hints: [], tool: { tool: 'rounding-lab', mode: 'estimate', place: 100, examples: [{ number: 287, other: 416, op: '+' }, { number: 693, other: 278, op: '−' }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ჯერ დამრგვალება, მერე მოქმედება', prompt: 'მიახლოებითი შედეგი გვეხმარება ზუსტი პასუხის შემოწმებაში.', blocks: [
      { type: 'rounding-demo', number: 287, place: 100 },
      { type: 'worked', title: '287 + 416', steps: [{ text: '287 ≈ 300; 416 ≈ 400.' }, { text: '300 + 400 = 700 — მიახლოებითი ჯამია.' }, { text: 'ზუსტი ჯამია 703; ის ახლოსაა 700-თან.' }] },
      { type: 'text', text: 'გამოკლებისასაც ჯერ ორივე რიცხვს ვამრგვალებთ: 693 − 278 ≈ 700 − 300 = 400. ზუსტი პასუხია 415.' },
      { type: 'callout', tone: 'tip', text: 'შეფასება ზუსტი პასუხი არ არის. დამრგვალების თანრიგის შეცვლამ შეიძლება შეფასება შეცვალოს.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'ასეულებამდე დამრგვალებით შეაფასე 218 + 371.', response: { type: 'numeric', answer: 600 }, hints: ['218 ≈ 200; 371 ≈ 400.'], explanation: '200 + 400 = 600; ზუსტი ჯამი 589-ია.', fallbackFeedback: 'ჯერ ორივე შესაკრები დაამრგვალე.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'ასეულებამდე დამრგვალებით შეაფასე 693 − 278.', response: { type: 'numeric', answer: 400 }, hints: ['693 ≈ 700 და 278 ≈ 300.'], explanation: '700 − 300 = 400; ზუსტად 415.', fallbackFeedback: 'დაამრგვალე ორივე რიცხვი და შემდეგ გამოაკელი.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'ათეულებამდე დამრგვალებით შეაფასე 43 + 26.', response: { type: 'numeric', answer: 70 }, hints: ['43 ≈ 40 და 26 ≈ 30.'], explanation: '40 + 30 = 70; ზუსტად 69.', fallbackFeedback: 'ორივე ათეულამდე დაამრგვალე.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: '287 + 416-ის პასუხად 703 თუ 1703 არის გონივრული?', response: { type: 'choice', options: [{ id: 'a', text: '703' }, { id: 'b', text: '1703' }], answer: 'a' }, hints: ['ასეულებით შეფასება დაახლოებით 700-ია.'], explanation: '703 ახლოსაა 700-თან, 1703 კი არა.', fallbackFeedback: 'შეადარე 700-ის შეფასებას.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'ასეულებამდე დამრგვალებით შეაფასე 152 + 247.', response: { type: 'numeric', answer: 400 }, hints: [], explanation: '152 ≈ 200 და 247 ≈ 200; ჯამი ≈ 400.', fallbackFeedback: 'ჯერ თითოეული რიცხვი ცალ-ცალკე დაამრგვალე.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'ათეულებამდე დამრგვალებით შეაფასე 84 − 28.', response: { type: 'numeric', answer: 50 }, hints: [], explanation: '80 − 30 = 50; ზუსტი სხვაობა 56-ია.', fallbackFeedback: 'ჯერ ათეულებამდე დაამრგვალე.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'ზუსტი პასუხია 589, შეფასებაა 600. რამდენით განსხვავდება ისინი?', response: { type: 'numeric', answer: 11 }, hints: [], explanation: '600 − 589 = 11.', fallbackFeedback: 'დიდ რიცხვს პატარა გამოაკელი.' },
  ],
};
