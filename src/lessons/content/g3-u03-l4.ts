import type { Lesson } from '../types';

export const g3u03l4: Lesson = {
  id: 'g3-u03-l4', status: 'placeholder', objective: 'უცნობი იარლიყის მდებარეობით ვარჩევ შეკრებას ან გამოკლებას და ვპოულობ მის მნიშვნელობას.', prerequisites: ['მთელი და ნაწილები', 'შეკრება და გამოკლება'], minutes: 13, concepts: ['უცნობი ნაწილი', 'უცნობი მთელი', 'მოქმედების არჩევა'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: 'მთელია 470, პირველი ნაწილი 220, მეორე უცნობია. რომელი მოქმედებაა საჭირო?', response: { type: 'choice', options: [{ id: 'a', text: '470 − 220' }, { id: 'b', text: '470 + 220' }, { id: 'c', text: '220 − 470' }], answer: 'a' }, hints: [], explanation: 'უცნობი ნაწილია მთელი მინუს ცნობილი ნაწილი: 470 − 220 = 250.', fallbackFeedback: 'ჯერ გაარკვიე, ნაწილია უცნობი თუ მთელი.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'საიდუმლო ზოლი', prompt: 'იარლიყებით ააგე ზოლი; უცნობის ადგილიდან გადაწყვიტე, რა მოქმედებაა საჭირო.', hints: [], tool: { tool: 'bar-model-lab', examples: [{ story: 'მთელი 470-ია; პირველ ნაწილში 220-ია. იპოვე მეორე.', a: 220, b: 250, missing: 'b' }, { story: 'პირველ ნაწილში 125-ია, მეორეში 175. იპოვე მთელი.', a: 125, b: 175, missing: 'whole' }, { story: 'მთელი 400-ია; მეორე ნაწილი 130-ია. იპოვე პირველი.', a: 270, b: 130, missing: 'a' }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'სად არის უცნობი?', prompt: 'ერთი მოდელი სხვადასხვა კითხვას პასუხობს.', blocks: [
      { type: 'bar-model-demo', a: 220, b: 250 },
      { type: 'text', text: 'თუ მთელი უცნობია, ორ ცნობილ ნაწილს ვკრებთ. თუ ერთი ნაწილია უცნობი, მთელს ცნობილ ნაწილს ვაკლებთ.' },
      { type: 'worked', title: 'ერთი ზოლი, ორი კითხვა', steps: [{ text: '220 + 250 = 470 — ვიპოვეთ მთელი.' }, { text: '470 − 220 = 250 — ვიპოვეთ მეორე ნაწილი.' }] },
      { type: 'callout', tone: 'tip', text: 'მოქმედებამდე მიუთითე მთელსა და ცნობილ ნაწილზე.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'ნაწილებია 125 და 175; მთელი უცნობია. იპოვე მთელი.', response: { type: 'numeric', answer: 300 }, hints: ['ნაწილები შეკრიბე.'], explanation: '125 + 175 = 300.', fallbackFeedback: 'მთელი ორივე ნაწილია ერთად.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'მთელი 400-ია, მეორე ნაწილი 130. იპოვე პირველი.', response: { type: 'numeric', answer: 270 }, hints: ['400 − 130.'], explanation: '400 − 130 = 270.', fallbackFeedback: 'ცნობილი ნაწილი მთელს გამოაკელი.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'როცა უცნობია მთელი და ორივე ნაწილი ცნობილია, რომელი მოქმედებაა საჭირო?', response: { type: 'choice', options: [{ id: 'a', text: 'შეკრება' }, { id: 'b', text: 'გამოკლება' }], answer: 'a' }, hints: ['ნაწილები შეაერთე.'], explanation: 'ნაწილების შეკრება მთელს გვაძლევს.', fallbackFeedback: 'ორ ნაწილს რა მოქმედება აერთიანებს?' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'მთელია 520; პირველი ნაწილი 210. იპოვე მეორე.', response: { type: 'numeric', answer: 310 }, hints: ['მთელი მინუს ცნობილი ნაწილი.'], explanation: '520 − 210 = 310.', fallbackFeedback: 'რომელი ნაწილია უცნობი?' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'ნაწილებია 156 და 233. იპოვე მთელი.', response: { type: 'numeric', answer: 389 }, hints: [], explanation: '156 + 233 = 389.', fallbackFeedback: 'გაითვალისწინე უცნობის მდებარეობა.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'მთელი 600-ია, ერთი ნაწილი 245. იპოვე მეორე.', response: { type: 'numeric', answer: 355 }, hints: [], explanation: '600 − 245 = 355.', fallbackFeedback: 'მთელს ცნობილი ნაწილი გამოაკელი.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'მთელი 350-ია, ერთი ნაწილი უცნობია, მეორე 120. რა მოქმედებით ვიპოვით უცნობს?', response: { type: 'choice', options: [{ id: 'a', text: '350 − 120' }, { id: 'b', text: '350 + 120' }], answer: 'a' }, hints: [], explanation: '350 − 120 = 230.', fallbackFeedback: 'უცნობია ნაწილი, არა მთელი.' },
  ],
};
