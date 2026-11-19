import type { Lesson } from '../types';

export const g3u03l2: Lesson = {
  id: 'g3-u03-l2', status: 'placeholder', objective: 'შეკრების ამბის რაოდენობებს ზოლის ნაწილებად ვსვამ და მთელს ვპოულობ.', prerequisites: ['ნაწილები და მთელი'], minutes: 12, concepts: ['შეკრების მოდელი', 'ნაწილების შეკრება', 'მთელი'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: 'კლასს 125 წიგნი ჰქონდა და კიდევ 143 მიიღო. რამდენია სულ?', response: { type: 'choice', options: [{ id: 'a', text: '268' }, { id: 'b', text: '18' }, { id: 'c', text: '258' }], answer: 'a' }, hints: [], explanation: 'ორივე ნაწილი ერთად: 125 + 143 = 268.', fallbackFeedback: 'საწყის რაოდენობას მიღებული დაუმატე.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'შეკრების ზოლის აგება', prompt: 'მოათავსე ნაწილები, უცნობი მთელის იარლიყი და გამოთვალე ჯამი.', hints: [], tool: { tool: 'bar-model-lab', examples: [{ story: 'კლასს 125 წიგნი ჰქონდა, 143 კიდევ მიიღო. რამდენია სულ?', a: 125, b: 143, missing: 'whole' }, { story: 'კალათაში 215 წითელი და 134 მწვანე ფანქარია. რამდენია სულ?', a: 215, b: 134, missing: 'whole' }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ორი ნაწილი — ერთი ჯამი', prompt: 'ზოლზე ამბის თითოეული რაოდენობა ცალკე სეგმენტია.', blocks: [
      { type: 'bar-model-demo', a: 125, b: 143 },
      { type: 'text', text: '125 საწყისი წიგნის ნაწილია; 143 მიღებული წიგნის ნაწილია. კითხვის ნიშანი მთელ ზოლს ეკუთვნის.' },
      { type: 'worked', title: 'ნაწილებიდან მთელამდე', steps: [{ text: 'ვწერთ: 125 + 143 = ?' }, { text: 'ვკრებთ თანრიგებს: 125 + 143 = 268.' }] },
      { type: 'callout', tone: 'tip', text: 'ჯერ დაადგინე, რა რაოდენობას წარმოადგენს თითოეული სეგმენტი.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'ზოლის ნაწილებია 215 და 134. რამდენია მთელი?', response: { type: 'numeric', answer: 349 }, hints: ['უცნობი მთელი ნაწილების ჯამია.'], explanation: '215 + 134 = 349.', fallbackFeedback: 'შეაერთე სეგმენტები.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: '142 მოსწავლეს 76 შეუერთდა. რა მოქმედება პოულობს მთელს?', response: { type: 'choice', options: [{ id: 'a', text: '142 + 76' }, { id: 'b', text: '142 − 76' }, { id: 'c', text: '76 − 142' }], answer: 'a' }, hints: ['შეერთება მთელს ზრდის.'], explanation: 'ვაერთიანებთ ორ ნაწილს: 142 + 76.', fallbackFeedback: 'იფიქრე, მატებაა თუ კლება.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'რამდენია 142 და 76 ერთად?', response: { type: 'numeric', answer: 218 }, hints: ['142 + 70 = 212; დაამატე 6.'], explanation: '142 + 76 = 218.', fallbackFeedback: 'დაითვალე ორივე ნაწილის ჯამი.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'ზოლზე 90 და 40 აღნიშნავს ნაწილებს. სად უნდა იყოს კითხვის ნიშანი, თუ მთლიანს ვეძებთ?', response: { type: 'choice', options: [{ id: 'a', text: 'მთელი ზოლის იარლიყზე' }, { id: 'b', text: '90-ის ადგილზე' }, { id: 'c', text: '40-ის ადგილზე' }], answer: 'a' }, hints: ['უცნობი მთელი ორივე ნაწილს მოიცავს.'], explanation: 'კითხვის ნიშანი მთელ ზოლს ეკუთვნის.', fallbackFeedback: 'რომელი რაოდენობაა უცნობი?' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'თაროზე 231 წიგნია, დაამატეს 156. რამდენია სულ?', response: { type: 'numeric', answer: 387 }, hints: [], explanation: '231 + 156 = 387.', fallbackFeedback: 'საწყის ნაწილს ახალი ნაწილი დაამატე.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'ორი ნაწილია 164 და 225. რამდენია მთელი?', response: { type: 'numeric', answer: 389 }, hints: [], explanation: '164 + 225 = 389.', fallbackFeedback: 'ორივე სეგმენტი შეკრიბე.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'იყო 310 ფურცელი, მიიღეს 40. რამდენია სულ?', response: { type: 'numeric', answer: 350 }, hints: [], explanation: '310 + 40 = 350.', fallbackFeedback: 'მიღებული საწყისს დაუმატე.' },
  ],
};
