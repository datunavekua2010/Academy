import type { Lesson } from '../types';

export const g3u01l1: Lesson = {
  id: 'g3-u01-l1', status: 'placeholder', objective: 'ვპოულობ რიცხვის მეზობელ ათეულებსა და ასეულებს და რიცხვით წრფეზე უახლოესს ვარჩევ.',
  prerequisites: ['სამნიშნა რიცხვები და თანრიგები'], minutes: 12, concepts: ['რიცხვითი წრფე', 'მეზობელი ჯერადები', 'შუა წერტილი', 'უახლოესი ჯერადი'], completion: { minCheckCorrect: 2 },
  activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '47 რომელ ათეულთან არის უფრო ახლოს?', response: { type: 'choice', options: [{ id: '40', text: '40' }, { id: '50', text: '50' }], answer: '50' }, hints: [], explanation: '47-დან 50-მდე 3 ერთეულია, 40-მდე კი 7.', fallbackFeedback: 'შეადარე მანძილები ორივე ათეულამდე.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'რიცხვითი წრფის ნავიგატორი', prompt: 'მონიშნე რიცხვი და აირჩიე უახლოესი ათეული. გამოიყენე მარკერი ან ისრები.', hints: [], tool: { tool: 'rounding-lab', mode: 'navigate', place: 10, examples: [{ number: 47 }, { number: 32 }, { number: 65 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'სად მდებარეობს რიცხვი?', prompt: 'წრფეზე მანძილი გვიჩვენებს, რომელ ჯერადთან არის რიცხვი ახლოს.', blocks: [
      { type: 'rounding-demo', number: 47, place: 10 },
      { type: 'text', text: '47 მდებარეობს 40-სა და 50-ს შორის. ეს მეზობელი ათეულებია; მათ შორის შუა წერტილია 45.' },
      { type: 'worked', title: 'ასეულებს შორის', steps: [{ text: '362 მდებარეობს 300-სა და 400-ს შორის.' }, { text: 'შუაშია 350. 362 მის მარჯვნივაა, ამიტომ 400 უფრო ახლოსაა.' }] },
      { type: 'callout', tone: 'tip', text: 'თუ რიცხვი ზუსტად შუაშია, შეთანხმებით უფრო დიდ ჯერადამდე ვამრგვალებთ.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'რომელ ორ ათეულს შორისაა 63?', response: { type: 'choice', options: [{ id: 'a', text: '60 და 70' }, { id: 'b', text: '50 და 60' }, { id: 'c', text: '63 და 73' }], answer: 'a' }, hints: ['იპოვე 63-ზე მცირე უახლოესი ათეული.'], explanation: '60 < 63 < 70.', fallbackFeedback: 'ათეულის ჯერადი ნულით მთავრდება.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'რომელია 238-ის ქვედა ასეული?', response: { type: 'numeric', answer: 200 }, hints: ['ასეულები ასე მიდის: 100, 200, 300…'], explanation: '200 < 238 < 300.', fallbackFeedback: 'მოძებნე 238-ზე მცირე უახლოესი ასეული.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: '68-დან რამდენი ერთეულია 70-მდე?', response: { type: 'numeric', answer: 2 }, hints: ['გამოაკელი 70-ს 68.'], explanation: '70 − 68 = 2.', fallbackFeedback: 'დაითვალე ნაბიჯები 68-დან 70-მდე.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'რომელია 200-სა და 300-ს შორის შუა წერტილი?', response: { type: 'numeric', answer: 250 }, hints: ['100-ის ნახევარი 50-ია.'], explanation: '200 + 50 = 250.', fallbackFeedback: 'მთელი შუალედის ნახევარი დაამატე ქვედა ასეულს.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: '81 რომელ ორ ათეულს შორისაა?', response: { type: 'choice', options: [{ id: 'a', text: '70 და 80' }, { id: 'b', text: '80 და 90' }, { id: 'c', text: '81 და 91' }], answer: 'b' }, hints: [], explanation: '80 < 81 < 90.', fallbackFeedback: 'შეამოწმე თითოეული საზღვარი.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'რომელი ასეულია 478-თან უფრო ახლოს?', response: { type: 'choice', options: [{ id: 'a', text: '400' }, { id: 'b', text: '500' }], answer: 'b' }, hints: [], explanation: '478-დან 500-მდე 22-ია; 400-მდე 78.', fallbackFeedback: 'შეადარე ორივე მანძილი.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'რამდენია 120-სა და 130-ს შორის შუა წერტილი?', response: { type: 'numeric', answer: 125 }, hints: [], explanation: 'შუა წერტილი ორივე ბოლოდან ხუთითაა დაშორებული.', fallbackFeedback: 'იფიქრე ათის ნახევარზე.' },
  ],
};
