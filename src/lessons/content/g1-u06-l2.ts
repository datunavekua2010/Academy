import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U06.2 "Understanding Longer, Shorter, and the Same Length".
 * Demonstration content only. All three words are used together, on differently shaped and differently turned
 * objects, so that "the same length" is seen even when the pictures look very different — and never decided by
 * colour or arrangement.
 */
export const g1u06l2: Lesson = {
  id: 'g1-u06-l2',
  status: 'placeholder',
  objective: 'ვიყენებ სამ სიტყვას — უფრო გრძელი, უფრო მოკლე, იგივე სიგრძე — და ვიგებ, რომ ერთი სიგრძე სხვადასხვანაირად შეიძლება გამოიყურებოდეს.',
  prerequisites: ['საერთო დასაწყისი (U06.1)'],
  minutes: 10,
  concepts: ['უფრო გრძელი', 'უფრო მოკლე', 'იგივე სიგრძე', 'სამი ჯგუფი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'მშვენიერია! სამივე სიტყვას ერთად ვიყენებთ: უფრო გრძელი, უფრო მოკლე, იგივე სიგრძე.',
    retry: 'სცადე ისევ. ყოველ საგანს შესადარებელ სიგრძეს ადარებ: მეტია, ნაკლებია თუ ტოლი?',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'სამი საგანი ერთ ხაზზეა. რომელია იგივე სიგრძის, რაც შავი ჩხირი (10 სმ)?',
      visual: {
        type: 'length',
        align: true,
        objects: [
          { kind: 'stick', cm: 10 },
          { kind: 'pencil', cm: 10 },
          { kind: 'crayon', cm: 7 },
        ],
      },
      mascot: { intro: '«იგივე სიგრძე» ნიშნავს, რომ ბოლოები ერთ ხაზზე ხვდება.' },
      response: {
        type: 'choice',
        options: [
          { id: 'pencil', text: 'ფანქარი (მეორე)' },
          { id: 'crayon', text: 'ფერადი ფანქარი (მესამე)' },
          { id: 'none', text: 'არც ერთი' },
        ],
        answer: 'pencil',
      },
      hints: ['იგივე სიგრძის საგანი იმავე ადგილას მთავრდება.'],
      explanation: 'ჩხირი 10 სმ-ია და ფანქარიც 10 სმ-ია: ისინი იგივე სიგრძისაა. ფერადი ფანქარი 7 სმ-ია, ამიტომ უფრო მოკლეა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მოძებნე საგანი, რომლის ბოლოც ჩხირის ბოლოსთან ემთხვევა.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'სამი ჯგუფი',
      prompt: 'შეადარე თითოეული საგანი ლენტს (12 სმ) და ჩადე სამ ჯგუფში: უფრო გრძელი, უფრო მოკლე, იგივე სიგრძე.',
      hints: ['ჯგუფების შეცვლა ყოველთვის შეიძლება: შეეხე საგანს და მერე სხვა ჯგუფს.', 'ჯერ შეადარე რიცხვები, მერე გადაწყვიტე.'],
      tool: {
        tool: 'length-sort-lab',
        reference: { kind: 'ribbon', cm: 12 },
        items: [
          { kind: 'pencil', cm: 15 },
          { kind: 'crayon', cm: 8 },
          { kind: 'stick', cm: 12 },
          { kind: 'book', cm: 18 },
          { kind: 'eraser', cm: 5 },
        ],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'სიგრძე და ფორმა',
      prompt: 'ნახე: ერთი და იმავე სიგრძის საგნები სხვადასხვანაირად გამოიყურება.',
      blocks: [
        {
          type: 'text',
          text: 'სიგრძე არის მანძილი საგნის ერთი ბოლოდან მეორემდე. საგნის ფორმა და ფერი სიგრძეს არ ცვლის.',
        },
        {
          type: 'length',
          align: true,
          objects: [
            { kind: 'stick', cm: 12 },
            { kind: 'ribbon', cm: 12 },
            { kind: 'book', cm: 12 },
          ],
        },
        { type: 'callout', tone: 'tip', text: 'ჩხირი, ლენტი და წიგნი სამნაირად გამოიყურება, მაგრამ სამივე 12 სმ-ია — სამივე იგივე სიგრძისაა.' },
        {
          type: 'length',
          objects: [{ kind: 'pencil', cm: 9 }, { kind: 'pencil', cm: 14, turn: 'up' }],
        },
        { type: 'text', text: 'ვერტიკალურად მდგომი ფანქარი 14 სმ-ია, ჰორიზონტალური — 9 სმ. ბრუნვა სიგრძეს არ ცვლის.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'შეადარე საგნები 10 სმ-იან შესადარებელ სიგრძეს და ჩადე სამ ჯგუფში.',
      response: {
        type: 'length-sort',
        reference: { kind: 'ribbon', cm: 10 },
        items: [
          { kind: 'pencil', cm: 12 },
          { kind: 'eraser', cm: 6 },
          { kind: 'stick', cm: 10 },
          { kind: 'book', cm: 15 },
        ],
      },
      hints: ['უფრო გრძელი: მეტია 10-ზე. უფრო მოკლე: ნაკლებია 10-ზე. იგივე სიგრძე: ზუსტად 10.'],
      explanation: '12 > 10 (უფრო გრძელი), 6 < 10 (უფრო მოკლე), 10 = 10 (იგივე), 15 > 10 (უფრო გრძელი).',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე თითოეული სიგრძე 10 სმ-ს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'კვლავ დალაგე საგნები სამ ჯგუფად. ამჯერად ერთი საგანი ვერტიკალურად დგას — ეს სიგრძეს არ ცვლის.',
      response: {
        type: 'length-sort',
        reference: { kind: 'stick', cm: 8 },
        items: [
          { kind: 'pencil', cm: 8, turn: 'up' },
          { kind: 'crayon', cm: 5 },
          { kind: 'ribbon', cm: 11 },
        ],
      },
      hints: ['ბრუნვა სიგრძეს არ ცვლის: 8 სმ ფანქარი ვერტიკალურადაც 8 სმ-ია.'],
      explanation: 'ვერტიკალური ფანქარი 8 სმ-ია — იგივე სიგრძეა, რაც ჩხირი. ფერადი ფანქარი 5 სმ — უფრო მოკლე. ლენტი 11 სმ — უფრო გრძელი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გახსოვდეს: ბრუნვა სიგრძეს არ ცვლის.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'აირჩიე სწორი წინადადება.',
      visual: { type: 'length', align: true, objects: [{ kind: 'pencil', cm: 11 }, { kind: 'ribbon', cm: 11 }] },
      response: {
        type: 'choice',
        options: [
          { id: 'longer', text: 'ფანქარი უფრო გრძელია' },
          { id: 'shorter', text: 'ფანქარი უფრო მოკლეა' },
          { id: 'same', text: 'ისინი იგივე სიგრძისაა' },
        ],
        answer: 'same',
      },
      hints: ['ორივეს ბოლო ერთ ხაზზეა — ესე იგი სიგრძეები ტოლია.'],
      explanation: 'ორივე 11 სმ-ია, ამიტომ ისინი იგივე სიგრძისაა, თუმცა ფორმა განსხვავებულია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორივეს ბოლოები.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'ვერტიკალურად მდგომი ფანქარი 13 სმ-ია. ჰორიზონტალური ლენტი 9 სმ-ია. რომელია უფრო მოკლე?',
      response: {
        type: 'choice',
        options: [
          { id: 'pencil', text: 'ფანქარი' },
          { id: 'ribbon', text: 'ლენტი' },
          { id: 'same', text: 'ისინი იგივე სიგრძისაა' },
        ],
        answer: 'ribbon',
      },
      hints: ['13 სმ და 9 სმ: რომელი რიცხვი უფრო პატარაა?'],
      explanation: 'ფანქარი 13 სმ-ია, ლენტი — 9 სმ. 9 < 13, ამიტომ ლენტი უფრო მოკლეა — მდგომარეობა სიგრძეს არ ცვლის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე 13 და 9.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'დაალაგე საგნები სამ ჯგუფად 12 სმ-იანი შესადარებელი სიგრძის მიხედვით.',
      response: {
        type: 'length-sort',
        reference: { kind: 'ribbon', cm: 12 },
        items: [
          { kind: 'book', cm: 12, turn: 'up' },
          { kind: 'eraser', cm: 4 },
          { kind: 'ladder', cm: 20 },
        ],
      },
      hints: [],
      explanation: 'წიგნი ვერტიკალურადაც 12 სმ-ია — იგივე სიგრძე. საშლელი 4 სმ — უფრო მოკლე. კიბე 20 სმ — უფრო გრძელი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე თითოეული სიგრძე 12 სმ-ს.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი წინადადებაა სწორი?',
      visual: { type: 'length', align: true, objects: [{ kind: 'crayon', cm: 7 }, { kind: 'stick', cm: 12 }] },
      response: {
        type: 'choice',
        options: [
          { id: 'crayon-longer', text: 'ფერადი ფანქარი უფრო გრძელია' },
          { id: 'stick-longer', text: 'ჩხირი უფრო გრძელია' },
          { id: 'same', text: 'ისინი იგივე სიგრძისაა' },
        ],
        answer: 'stick-longer',
      },
      hints: [],
      explanation: 'ფერადი ფანქარი 7 სმ-ია, ჩხირი — 12 სმ. 12 > 7, ამიტომ ჩხირი უფრო გრძელია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე, რომელი უფრო შორს აღწევს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'დაალაგე საგნები სამ ჯგუფად 9 სმ-იანი შესადარებელი სიგრძის მიხედვით.',
      response: {
        type: 'length-sort',
        reference: { kind: 'stick', cm: 9 },
        items: [
          { kind: 'pencil', cm: 9 },
          { kind: 'ribbon', cm: 14 },
          { kind: 'eraser', cm: 3 },
          { kind: 'crayon', cm: 9, turn: 'up' },
        ],
      },
      hints: [],
      explanation: 'ფანქარი 9 და ფერადი ფანქარი 9 — იგივე სიგრძე. ლენტი 14 — უფრო გრძელი. საშლელი 3 — უფრო მოკლე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. თითოეული სიგრძე შეადარე 9 სმ-ს.',
    },
  ],
};
