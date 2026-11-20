import type { Lesson } from '../types';

export const g3u03l1: Lesson = {
  id: 'g3-u03-l1', status: 'placeholder', objective: 'ზოლიან მოდელში ვარჩევ ნაწილებსა და მთელს და ვაკავშირებ მათ რიცხვებთან.', prerequisites: ['შეკრება', 'ნაწილი და მთელი'], minutes: 12, concepts: ['მთელი', 'ნაწილები', 'ზოლიანი მოდელი'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: 'ზოლი ორ ნაწილად გაიყო: 120 და 80. რამდენია მთელი?', response: { type: 'choice', options: [{ id: 'a', text: '200' }, { id: 'b', text: '40' }, { id: 'c', text: '120' }], answer: 'a' }, hints: [], explanation: 'მთელი ნაწილების ჯამია: 120 + 80 = 200.', fallbackFeedback: 'შეაერთე ორივე ნაწილი.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'ააგე ზოლი', prompt: 'მოათავსე მთელი და ნაწილების იარლიყები; შემდეგ იპოვე უცნობი.', hints: [], tool: { tool: 'bar-model-lab', examples: [{ story: 'პირველ ნაწილში 120 წიგნია, მეორეში 80. რამდენია სულ?', a: 120, b: 80, missing: 'whole' }, { story: 'მთელი 350-ია; პირველი ნაწილია 120. რამდენია მეორე?', a: 120, b: 230, missing: 'b' }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ორი ნაწილი ქმნის მთელს', prompt: 'ზოლის ნაწილები ერთ მთლიან რაოდენობას წარმოადგენს.', blocks: [
      { type: 'bar-model-demo', a: 120, b: 80 },
      { type: 'text', text: 'მთელი ზოლი ორივე ნაწილს მოიცავს. თითოეული სეგმენტის იარლიყი ამ ნაწილის რაოდენობას გვიჩვენებს.' },
      { type: 'worked', title: 'წიგნები თაროზე', steps: [{ text: '120 მოთხრობის წიგნი და 80 ლექსის წიგნი.' }, { text: 'ნაწილები: 120 და 80. მთელი: 120 + 80 = 200.' }] },
      { type: 'callout', tone: 'tip', text: 'მთელი მხოლოდ ერთი სეგმენტი არ არის: იგი ყველა ნაწილს აერთიანებს.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'ნაწილებია 140 და 30. რამდენია მთელი?', response: { type: 'numeric', answer: 170 }, hints: ['შეკრიბე ნაწილები.'], explanation: '140 + 30 = 170.', fallbackFeedback: 'მთელი ორივე ნაწილისგან შედგება.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'ზოლს აქვს 100, 40 და 5 ნაწილები. რამდენია მთელი?', response: { type: 'numeric', answer: 145 }, hints: ['შეკრიბე სამივე სეგმენტი.'], explanation: '100 + 40 + 5 = 145.', fallbackFeedback: 'არც ერთი ნაწილი არ გამოგრჩეს.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'მთელი 250-ია, ერთი ნაწილი 100. რამდენია მეორე ნაწილი?', response: { type: 'numeric', answer: 150 }, hints: ['მთელს ცნობილი ნაწილი გამოაკელი.'], explanation: '250 − 100 = 150.', fallbackFeedback: 'წარმოიდგინე მთლიანი ზოლიდან ცნობილი ნაწილი.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'რას აღნიშნავს მთელი ზოლი?', response: { type: 'choice', options: [{ id: 'a', text: 'ყველა ნაწილის საერთო რაოდენობას' }, { id: 'b', text: 'მხოლოდ პირველ ნაწილს' }, { id: 'c', text: 'მხოლოდ მეორე ნაწილს' }], answer: 'a' }, hints: ['მთელი ორივე სეგმენტს ფარავს.'], explanation: 'მთელი ყველა ნაწილის ჯამია.', fallbackFeedback: 'შეხედე მთელ ზოლს და არა ერთ სეგმენტს.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'ნაწილებია 125 და 143. რამდენია მთელი?', response: { type: 'numeric', answer: 268 }, hints: [], explanation: '125 + 143 = 268.', fallbackFeedback: 'შეაერთე ნაწილები.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'მთელი 300-ია, ერთი ნაწილი 110. რამდენია მეორე?', response: { type: 'numeric', answer: 190 }, hints: [], explanation: '300 − 110 = 190.', fallbackFeedback: 'მთელს ცნობილი ნაწილი გამოაკელი.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'ზოლში სამი ნაწილია: 50, 30 და 20. რამდენია მთელი?', response: { type: 'numeric', answer: 100 }, hints: [], explanation: '50 + 30 + 20 = 100.', fallbackFeedback: 'ყველა ნაწილი ერთად განიხილე.' },
  ],
};
