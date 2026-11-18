import type { Lesson } from '../types';

const objects = [
  { id: 'r1', colour: 'red', kind: 'circle', size: 'small', label: 'წითელი წრე' },
  { id: 'b1', colour: 'blue', kind: 'square', size: 'large', label: 'ლურჯი კვადრატი' },
  { id: 'r2', colour: 'red', kind: 'triangle', size: 'large', label: 'წითელი სამკუთხედი' },
  { id: 'y1', colour: 'yellow', kind: 'circle', size: 'large', label: 'ყვითელი წრე' },
  { id: 'b2', colour: 'blue', kind: 'circle', size: 'small', label: 'ლურჯი წრე' },
  { id: 'y2', colour: 'yellow', kind: 'square', size: 'small', label: 'ყვითელი კვადრატი' },
] as const;

/**
 * PLACEHOLDER lesson — Grade 1 · U10.1 "Sorting Objects by One Attribute".
 * Demonstration content only. One clearly stated rule sorts a collection, and an object belongs to a group because of
 * its own attribute — not because of where it was put.
 */
export const g1u10l1: Lesson = {
  id: 'g1-u10-l1',
  status: 'placeholder',
  objective: 'ვალაგებ საგნებს ერთი ნიშნის მიხედვით და ვამბობ, რა წესით დავალაგე.',
  prerequisites: ['ფერი, ფორმა და ზომა (U08)'],
  minutes: 10,
  concepts: ['ერთი ნიშანი', 'ჯგუფი', 'დაჯგუფების წესი', 'ეკუთვნის / არ ეკუთვნის'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ერთი ნიშანი საკმარისია დასალაგებლად — მთავარია, წესი ნათლად თქვა.',
    retry: 'სცადე ისევ. შეხედე საგანს: რა ფერია? რა ფორმაა? რა ზომისაა?',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ნიშნით არის ეს საგნები დაჯგუფებული?',
      visual: {
        type: 'sorted-groups',
        attr: 'colour',
        groups: [
          { value: 'red', objects: [objects[0], objects[2]] },
          { value: 'blue', objects: [objects[1], objects[4]] },
        ],
      },
      mascot: { intro: 'დაჯგუფებულ საგნებში ყოველთვის ერთი საერთო ნიშანია.' },
      response: {
        type: 'choice',
        options: [
          { id: 'colour', text: 'ფერის მიხედვით' },
          { id: 'kind', text: 'ფორმის მიხედვით' },
          { id: 'size', text: 'ზომის მიხედვით' },
        ],
        answer: 'colour',
      },
      hints: ['შეხედე, რა აქვთ საერთო ერთ ჯგუფში მყოფ საგნებს.'],
      explanation: 'პირველ ჯგუფში ყველა წითელია, მეორეში — ყველა ლურჯი. წესი ფერია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორი ჯგუფი ერთმანეთს.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'სხვადასხვა წესით დალაგება',
      prompt: 'გადართე წესი: ფერი, ფორმა ან ზომა. ნახე, როგორ იცვლება ჯგუფები — თვითონ საგნები კი იგივე რჩება.',
      hints: ['ჯერ ფერით დაალაგე, მერე ფორმით.', 'დააკვირდი: ერთი და იგივე საგანი სხვადასხვა ჯგუფში ხვდება, როცა წესი იცვლება.'],
      tool: { tool: 'sort-lab', objects: [...objects], attrs: ['colour', 'kind', 'size'] },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'რას ნიშნავს „დალაგება ერთი ნიშნით“',
      prompt: 'ვნახოთ, როგორ მუშაობს ერთი წესი.',
      blocks: [
        {
          type: 'sort-demo',
          mode: 'one',
          attr: 'kind',
          objects: [...objects],
          steps: [
            'ყველა საგანი ერთად გვაქვს.',
            'ვირჩევთ ერთ წესს: ფორმა.',
            'ყველა წრე ერთ ჯგუფში; ყველა კვადრატი — მეორეში; სამკუთხედი — მესამეში.',
            'თითოეული საგანი ზუსტად ერთ ჯგუფშია.',
          ],
          caption: 'დაჯგუფების წესი ერთი ნიშანია — აქ ფორმა.',
        },
        { type: 'callout', tone: 'tip', text: 'წესი ყოველთვის ხმამაღლა თქვი: „ვალაგებ ფერის მიხედვით“ ან „ვალაგებ ფორმის მიხედვით“.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაალაგე საგნები ფერის მიხედვით.',
      response: { type: 'sort-groups', attr: 'colour', objects: [...objects] },
      hints: ['შეეხე საგანს, მერე იმ ჯგუფს, რომლის ფერიცაა.'],
      explanation: 'წითლები ერთად, ლურჯები ერთად, ყვითლები ერთად.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე თითოეული საგნის ფერს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაალაგე საგნები ფორმის მიხედვით.',
      response: { type: 'sort-groups', attr: 'kind', objects: [...objects] },
      hints: ['წრე, კვადრატი, სამკუთხედი — სამი ჯგუფი.'],
      explanation: 'თითოეული საგანი თავისი ფორმის ჯგუფშია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე თითოეული საგნის ფორმას.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაალაგე საგნები ზომის მიხედვით.',
      response: { type: 'sort-groups', attr: 'size', objects: [...objects] },
      hints: ['პატარა და დიდი — ორი ჯგუფი.'],
      explanation: 'ყველა პატარა საგანი ერთ ჯგუფშია, ყველა დიდი — მეორეში.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე საგნების ზომები.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ნიშნით არის დაჯგუფებული?',
      visual: {
        type: 'sorted-groups',
        attr: 'size',
        groups: [
          { value: 'small', objects: [objects[0], objects[4], objects[5]] },
          { value: 'large', objects: [objects[1], objects[2], objects[3]] },
        ],
      },
      response: {
        type: 'choice',
        options: [
          { id: 'size', text: 'ზომის მიხედვით' },
          { id: 'colour', text: 'ფერის მიხედვით' },
          { id: 'kind', text: 'ფორმის მიხედვით' },
        ],
        answer: 'size',
      },
      hints: ['პირველ ჯგუფში სხვადასხვა ფერი და ფორმაა — რა აქვთ საერთო?'],
      explanation: 'პირველ ჯგუფში ყველა პატარაა, მეორეში — ყველა დიდი. წესი ზომაა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ზომებს.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რა ნიშნით შეიძლება საგნების დალაგება?',
      response: {
        type: 'choice',
        options: [
          { id: 'attr', text: 'ფერით, ფორმით ან ზომით' },
          { id: 'order', text: 'მხოლოდ იმით, თუ რომელი პირველია მაგიდაზე' },
        ],
        answer: 'attr',
      },
      hints: [],
      explanation: 'ჩვენ ვალაგებთ საგნის ნიშნებით: ფერი, ფორმა, ზომა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაიხსენი, რომელი წესები სცადე.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'დაალაგე საგნები ფორმის მიხედვით.',
      response: { type: 'sort-groups', attr: 'kind', objects: [objects[0], objects[1], objects[4]] },
      hints: [],
      explanation: 'ორი წრე ერთ ჯგუფში, კვადრატი — მეორეში.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ფორმებს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'ლურჯი წრე რომელ ჯგუფშია, თუ ვალაგებთ ფერის მიხედვით?',
      response: {
        type: 'choice',
        options: [
          { id: 'blue', text: 'ლურჯი საგნების ჯგუფში' },
          { id: 'circle', text: 'წრეების ჯგუფში' },
          { id: 'small', text: 'პატარა საგნების ჯგუფში' },
        ],
        answer: 'blue',
      },
      hints: [],
      explanation: 'როცა წესი ფერია, მთავარია ფერი: ლურჯი წრე ლურჯ საგნებთანაა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. რომელი წესი გამოვიყენეთ?',
    },
  ],
};
