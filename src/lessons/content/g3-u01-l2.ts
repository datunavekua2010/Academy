import type { Lesson } from '../types';

export const g3u01l2: Lesson = {
  id: 'g3-u01-l2', status: 'placeholder', objective: 'ვამრგვალებ ორ- და სამნიშნა რიცხვებს უახლოეს ათეულამდე ერთეულების ციფრისა და შუა წერტილის გამოყენებით.', prerequisites: ['მეზობელი ათეულები'], minutes: 12, concepts: ['ათეულამდე დამრგვალება', 'ერთეულების ციფრი', 'შუა წერტილი'], completion: { minCheckCorrect: 2 }, activities: [
    { id: 'challenge', kind: 'question', stage: 'challenge', prompt: '347 რომელ ათეულამდე დამრგვალდება?', response: { type: 'choice', options: [{ id: 'a', text: '340' }, { id: 'b', text: '350' }, { id: 'c', text: '400' }], answer: 'b' }, hints: [], explanation: '347-დან 350-მდე 3-ია; 340-მდე 7.', fallbackFeedback: 'აირჩიე ორი მეზობელი ათეულიდან უფრო ახლო.', revealOnExhaust: false },
    { id: 'explore', kind: 'explore', stage: 'explore', title: 'დაამრგვალე რიცხვი', prompt: 'მარკერი მოათავსე რიცხვზე და შეადარე მანძილები მეზობელ ათეულებამდე.', hints: [], tool: { tool: 'rounding-lab', mode: 'tens', place: 10, examples: [{ number: 347 }, { number: 342 }, { number: 345 }] } },
    { id: 'understand', kind: 'explain', stage: 'understand', title: 'ერთეულები გვეხმარება', prompt: 'შევადაროთ 347 მის მეზობელ ათეულებს.', blocks: [
      { type: 'rounding-demo', number: 347, place: 10 },
      { type: 'text', text: '347 მდებარეობს 340-სა და 350-ს შორის. 345 შუა წერტილია. 347 შუაზე მეტია, ამიტომ 350-მდე მრგვალდება.' },
      { type: 'worked', title: 'შუა წერტილის წესი', steps: [{ text: 'ერთეულების ციფრი 0–4: ქვედა ათეული.' }, { text: 'ერთეულების ციფრი 5–9: ზედა ათეული. შუაში მდგომი 345 მრგვალდება 350-მდე.' }] },
      { type: 'callout', tone: 'tip', text: 'თუ რიცხვი უკვე ათეულია, დამრგვალებისას უცვლელი რჩება.' },
    ] },
    { id: 'practice-1', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 72 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 70 }, hints: ['ერთეულების ციფრი 2-ია.'], explanation: '72 უფრო ახლოსაა 70-თან, ვიდრე 80-თან.', fallbackFeedback: 'შეადარე 70 და 80.' },
    { id: 'practice-2', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 385 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 390 }, hints: ['385 ზუსტად შუაშია.'], explanation: 'შუაში მდგომი რიცხვი ზემოთ მრგვალდება: 390.', fallbackFeedback: 'შუა წერტილზე აირჩიე ზედა ათეული.' },
    { id: 'practice-3', kind: 'question', stage: 'practice', prompt: 'რომელი ორი ათეულია 124-ის მეზობელი?', response: { type: 'choice', options: [{ id: 'a', text: '120 და 130' }, { id: 'b', text: '100 და 200' }, { id: 'c', text: '124 და 134' }], answer: 'a' }, hints: ['ორივე რიცხვი ათეულის ჯერადია.'], explanation: '120 < 124 < 130.', fallbackFeedback: 'აირჩიე უახლოესი ათეულები.' },
    { id: 'practice-4', kind: 'question', stage: 'practice', prompt: 'დაამრგვალე 230 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 230 }, hints: ['230 უკვე ათეულის ჯერადია.'], explanation: '230 უცვლელი რჩება.', fallbackFeedback: 'რიცხვი უკვე ათეულია.' },
    { id: 'check-1', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 64 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 60 }, hints: [], explanation: 'ერთეულების ციფრი 4-ია; 64 ≈ 60.', fallbackFeedback: 'იპოვე მეზობელი ათეულები.' },
    { id: 'check-2', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 596 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 600 }, hints: [], explanation: '596 უფრო ახლოსაა 600-თან, ვიდრე 590-თან.', fallbackFeedback: 'შეადარე 590-მდე და 600-მდე დაშორებები.' },
    { id: 'check-3', kind: 'question', stage: 'check', prompt: 'დაამრგვალე 245 უახლოეს ათეულამდე.', response: { type: 'numeric', answer: 250 }, hints: [], explanation: '245 შუაშია, ამიტომ მრგვალდება 250-მდე.', fallbackFeedback: 'გაიხსენე შუა წერტილის წესი.' },
  ],
};
