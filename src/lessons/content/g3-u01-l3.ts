import type { Lesson } from '../types';

export const g3u01l3: Lesson = {
  id: 'g3-u01-l3', status: 'placeholder', objective: 'ვპოულობ მეზობელ ასეულებს და სამნიშნა რიცხვებს უახლოეს ასეულამდე ვამრგვალებ.', prerequisites: ['მეზობელი ასეულები', 'ათეულამდე დამრგვალება'], minutes: 12, concepts: ['ასეულამდე დამრგვალება', 'ათეულების ციფრი', 'შუა წერტილი'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '362 რომელ ასეულთანაა უფრო ახლოს?', response: { type: 'choice', options: [{ id: 'a', text: '300' }, { id: 'b', text: '400' }], answer: 'b' }, hints: [], explanation: '362-დან 400-მდე 38-ია, 300-მდე — 62.', fallbackFeedback: 'შეადარე მანძილები.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'ასეულებზე ნახტომი', prompt: 'იპოვე რიცხვი და აირჩიე უახლოესი ასეული. შუა წერტილი დაგეხმარება.', hints: [], tool: { tool: 'rounding-lab', mode: 'hundreds', place: 100, examples: [{ number: 362 }, { number: 349 }, { number: 350 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ათეულების ციფრი', prompt: 'ნახე, რომელ მხარეს არის რიცხვი შუა წერტილთან შედარებით.', blocks: [
      { type: 'rounding-demo', number: 362, place: 100 },
      { type: 'text', text: '362 მდებარეობს 300-სა და 400-ს შორის. შუა წერტილია 350, ხოლო 362 მის მარჯვნივაა.' },
      { type: 'worked', title: 'ორი მაგალითი', steps: [{ text: '342: ათეულების ციფრია 4, ამიტომ 342 ≈ 300.' }, { text: '350: შუა წერტილია, ამიტომ 350 ≈ 400.' }] },
      { type: 'callout', tone: 'tip', text: 'ათეულების ციფრი 0–4 მიგვითითებს ქვედა ასეულზე, 5–9 — ზედაზე.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'რომელ ასეულებს შორისაა 724?', response: { type: 'choice', options: [{ id: 'a', text: '700 და 800' }, { id: 'b', text: '720 და 730' }, { id: 'c', text: '600 და 700' }], answer: 'a' }, hints: ['ასეულები ორი ნულით მთავრდება.'], explanation: '700 < 724 < 800.', fallbackFeedback: 'იპოვე უახლოესი ასეულები.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 724 ასეულამდე.', response: { type: 'numeric', answer: 700 }, hints: ['შეადარე 750-ს.'], explanation: '724 < 750, ამიტომ 700-მდე მრგვალდება.', fallbackFeedback: 'შუა წერტილი იპოვე.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 850 ასეულამდე.', response: { type: 'numeric', answer: 900 }, hints: ['850 ზუსტად შუაშია.'], explanation: 'შუა წერტილი ზემოთ მრგვალდება: 900.', fallbackFeedback: 'შუაში მდგომი რიცხვის წესი გაიხსენე.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 999 ასეულამდე.', response: { type: 'numeric', answer: 1000 }, hints: ['ზედა ასეული 1000-ია.'], explanation: '999 მხოლოდ ერთითაა დაშორებული 1000-ს.', fallbackFeedback: 'შეადარე 900-სა და 1000-ს.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 181 ასეულამდე.', response: { type: 'numeric', answer: 200 }, hints: [], explanation: '181 > 150, ამიტომ 200-მდე მრგვალდება.', fallbackFeedback: 'შეადარე შუა წერტილს.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 449 ასეულამდე.', response: { type: 'numeric', answer: 400 }, hints: [], explanation: '449 < 450, ამიტომ 400-მდე მრგვალდება.', fallbackFeedback: 'იპოვე მეზობელი ასეულების შუა წერტილი.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 600 ასეულამდე.', response: { type: 'numeric', answer: 600 }, hints: [], explanation: '600 უკვე ასეულის ჯერადია.', fallbackFeedback: 'შეამოწმე, არის თუ არა რიცხვი ასეული.' },
  ],
};
