import type { Lesson } from '../types';

/**
 * GRADE 2 · U01.2 "Representing Numbers with Place-Value Blocks".
 *
 * Blocks are a way of writing a number with objects. The value of a set of blocks is the sum of what its blocks are
 * worth, so two different sets can name the same number — and a set with ten in one place is the same value as the
 * regrouped set. The check reads the value, never the arrangement.
 */
export const g2u01l2: Lesson = {
  id: 'g2-u01-l2',
  status: 'placeholder',
  objective: 'ვწარმოვადგენ სამნიშნა რიცხვს ადგილობრივი ღირებულების ბლოკებით და ვკითხულობ ბლოკებით მოცემულ რიცხვს.',
  prerequisites: ['ასეულები, ათეულები და ერთეულები (U01.1)'],
  minutes: 10,
  concepts: ['ბლოკებით წარმოდგენა', 'ბლოკების მნიშვნელობა', 'სხვადასხვა კომბინაცია, იგივე რიცხვი', 'დაჯგუფება'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'კარგია! ბლოკები რიცხვის სურათია — და სურათს ყოველთვის ვკითხულობთ ბლოკების მნიშვნელობით.',
    retry: 'სცადე ისევ. დათვალე ბრტყელი ფილები, ჩხირები და კუბიკები და შეკრიბე.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელ რიცხვს გამოხატავს ეს ბლოკები?',
      visual: { type: 'place-blocks', hundreds: 1, tens: 4, ones: 2 },
      mascot: { intro: 'ბლოკებით რიცხვის წაკითხვა დღევანდელი ამოცანაა.' },
      response: {
        type: 'choice',
        options: [
          { id: 'right', text: '142' },
          { id: 'bad', text: '124' },
          { id: 'sum', text: '7' },
        ],
        answer: 'right',
      },
      hints: ['ბრტყელი ფილა 100-ია, ჩხირი 10, კუბიკი 1.'],
      explanation: '1 ასეული + 4 ათეული + 2 ერთეული = 100 + 40 + 2 = 142.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ბლოკების რაოდენობა კი არ იკრიბება, მათი მნიშვნელობა.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ერთი რიცხვი, სხვადასხვა ბლოკები',
      prompt: 'ააწყვე რიცხვი და შემდეგ შეცვალე ბლოკები ისე, რომ მნიშვნელობა იგივე დარჩეს. ნახე: 10 ერთეული 1 ათეულად იქცევა.',
      hints: ['20 ერთეული იგივეა, რაც 2 ათეული.', 'შეცვლის შემდეგ დაფა ისევ იმავე რიცხვს გაჩვენებს.'],
      tool: { tool: 'place-lab', start: { hundreds: 0, tens: 3, ones: 4 }, max: 12 },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'რას ნიშნავს ბლოკებით ჩაწერა',
      prompt: 'ვნახოთ, როგორ იკითხება ბლოკები და რატომ შეიძლება ერთი რიცხვის ორი სხვადასხვა სურათი.',
      blocks: [
        { type: 'place-blocks', hundreds: 2, tens: 0, ones: 6, caption: 'ორი ასეული და ექვსი ერთეული: 200 + 6 = 206. ათეულების ადგილი ცარიელია.' },
        {
          type: 'place-demo',
          mode: 'build',
          value: 206,
          steps: ['სამიზნეა 206.', 'ვდებთ ორ ბრტყელ ფილას: 200.', 'ათეულები არ არის — ვდებთ ექვს კუბიკს: 6.', 'სულ 206. ცარიელი ადგილიც ადგილია.'],
          caption: 'ბლოკები იკითხება ადგილების მიხედვით: ასეულები, ათეულები, ერთეულები.',
        },
        { type: 'text', text: 'ერთი და იგივე რიცხვი შეიძლება სხვადასხვა ბლოკებით დაიწეროს, თუ ჯგუფებს გადავაჯგუფებთ: 2 ათეული = 20 ერთეული. მნიშვნელობა არ იცვლება.' },
        { type: 'callout', tone: 'tip', text: 'ბლოკების მნიშვნელობა ყოველთვის ჯამია: რაოდენობა × ადგილის ღირებულება.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ რიცხვს გამოხატავს ეს ბლოკები?',
      visual: { type: 'place-blocks', hundreds: 3, tens: 0, ones: 7 },
      response: { type: 'numeric', answer: 307 },
      hints: ['სამი ასეული, ნული ათეული, შვიდი ერთეული.'],
      explanation: '3 × 100 + 0 × 10 + 7 × 1 = 307.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ათეულების ადგილი ცარიელია — ის ნულით იწერება.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'ააწყვე რიცხვი 472 ბლოკებით.',
      response: { type: 'place-build', target: 472 },
      hints: ['4 ბრტყელი ფილა, 7 ჩხირი, 2 კუბიკი.'],
      explanation: '472 = 4 ასეული + 7 ათეული + 2 ერთეული.',
      fallbackFeedback: 'ჯერ არ არის 472. შეამოწმე თითოეული ადგილი.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'ბლოკებზე 1 ასეული და 12 ერთეულია. ეს იგივე რიცხვია, რაც 1 ასეული, 1 ათეული და 2 ერთეული?',
      visual: { type: 'place-blocks', hundreds: 1, tens: 0, ones: 12 },
      response: {
        type: 'choice',
        options: [
          { id: 'yes', text: 'დიახ: 100 + 12 = 112, და 1 ასეული + 1 ათეული + 2 ერთეული = 112' },
          { id: 'no', text: 'არა: 12 ერთეული მეტია, ვიდრე 1 ათეული და 2 ერთეული' },
        ],
        answer: 'yes',
      },
      hints: ['შეკრიბე ბლოკების მნიშვნელობა და შეადარე.'],
      explanation: '12 ერთეული = 1 ათეული და 2 ერთეული, ამიტომ ორივე გროვა 112-ია. დაჯგუფება იცვლება, მნიშვნელობა — არა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 12 ერთეული იგივეა, რაც 1 ათეული და 2 ერთეული.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ბლოკების გროვაა 240-ის ტოლი?',
      response: {
        type: 'choice',
        options: [
          { id: 'right', text: '2 ბრტყელი ფილა და 4 ჩხირი', visual: { type: 'place-blocks', hundreds: 2, tens: 4, ones: 0 } },
          { id: 'ones', text: '2 ბრტყელი ფილა და 4 კუბიკი', visual: { type: 'place-blocks', hundreds: 2, tens: 0, ones: 4 } },
          { id: 'flats', text: '24 ბრტყელი ფილა', visual: { type: 'place-blocks', hundreds: 24, tens: 0, ones: 0 } },
        ],
        answer: 'right',
      },
      hints: ['240 = 200 + 40. რომელი ბლოკები იძლევა 200-ს და 40-ს?'],
      explanation: '2 ასეული და 4 ათეული = 200 + 40 = 240.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 40-ს ოთხი ჩხირი იძლევა, არა ოთხი კუბიკი.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელ რიცხვს გამოხატავს ეს ბლოკები?',
      visual: { type: 'place-blocks', hundreds: 5, tens: 6, ones: 0 },
      response: { type: 'numeric', answer: 560 },
      hints: [],
      explanation: '5 × 100 + 6 × 10 + 0 = 560.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ხუთი ასეული და ექვსი ათეული.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'ააწყვე რიცხვი 908 ბლოკებით.',
      response: { type: 'place-build', target: 908 },
      hints: [],
      explanation: '908 = 9 ასეული + 0 ათეული + 8 ერთეული.',
      fallbackFeedback: 'ჯერ არ არის 908. ათეულების ადგილი ცარიელი უნდა იყოს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: '20 ერთეული რომელია?',
      response: {
        type: 'choice',
        options: [
          { id: 'tens', text: '2 ათეული' },
          { id: 'hundreds', text: '2 ასეული' },
          { id: 'stay', text: '20 ერთეული სხვა რამედ ვერ იქცევა' },
        ],
        answer: 'tens',
      },
      hints: [],
      explanation: '20 ერთეული = 2 ათეული = 20. ამიტომ ერთი რიცხვის ბლოკები სხვადასხვანაირად შეიძლება დაიწყოს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ათი ერთეული ერთ ათეულს უდრის.',
    },
  ],
};
