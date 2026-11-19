import type { Lesson, Cell } from '../types';

/**
 * GRADE 2 · U10.3 "Completing Symmetrical Pictures and Shapes".
 *
 * The cells that complete a picture are `missingForSymmetry(picture, line)` — exactly the reflections of the cells that
 * have no partner. Nothing is "filled in roughly": an answer is right when the finished picture reflects onto itself.
 */
/** Three cells of a heart's left half, waiting to be mirrored. */
const HALF_HEART: Cell[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 1, y: 3 },
];

/** One side of a butterfly: a body column and two wings. */
const HALF_BUTTERFLY: Cell[] = [
  { x: 2, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 2, y: 3 },
];

export const g2u10l3: Lesson = {
  id: 'g2-u10-l3',
  status: 'placeholder',
  objective: 'ვავსებ ფიგურას სარკის ხაზის მეორე მხარეს ისე, რომ ორი ნახევარი ზუსტად ემთხვეოდეს.',
  prerequisites: ['სარკის ხაზები (U10.2)'],
  minutes: 14,
  concepts: ['სიმეტრიის შევსება', 'სარკული წყვილი', 'ბადე', 'ზუსტი არეკვლა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ნახევარ ფიგურას ახლა მთლიანად ავსებ.',
    retry: 'სცადე ისევ. ყოველი უჯრა სარკის ხაზიდან იმავე მანძილზე უნდა იყოს მეორე მხარეს.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'დაასრულე ფიგურა ისე, რომ ის სარკის ხაზზე სიმეტრიული გახდეს.',
      mascot: { intro: 'დღეს ნახევარ ფიგურას ვასრულებთ.' },
      response: { type: 'symmetry-fill', picture: { width: 4, height: 4, cells: HALF_HEART }, line: { axis: 'vertical', at: 3 } },
      hints: ['ყოველ უჯრას მეორე მხარეს იმავე მანძილზე მეწყვილე უნდა ჰქონდეს.', 'სარკის ხაზიდან დათვალე უჯრები.'],
      explanation: 'ყოველი უჯრა სარკის ხაზიდან იმავე მანძილზე აირეკლება — ასე ფიგურა სრულდება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. უჯრა სარკის ხაზიდან იმავე მანძილზე უნდა აირეკლოს.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'შეავსე სარკულად',
      prompt: 'შეავსე უჯრები ისე, რომ ფიგურა სარკის ხაზის ორივე მხარეს ერთნაირი იყოს.',
      hints: ['დათვალე სარკის ხაზიდან უჯრების რაოდენობა.', 'თუ უჯრა ხაზიდან ორი უჯრითაა, მეორე მხარესაც ორით უნდა იყოს.'],
      tool: { tool: 'symmetry-lab', pictures: [{ width: 4, height: 4, cells: HALF_HEART }, { width: 5, height: 4, cells: HALF_BUTTERFLY }], line: { axis: 'vertical', at: 3 } },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'სარკული წყვილი',
      prompt: 'ვნახოთ, როგორ პოულობს ყოველი უჯრა თავის წყვილს.',
      blocks: [
        { type: 'symmetry-demo', mode: 'fold', picture: { width: 4, height: 4, cells: HALF_HEART }, line: { axis: 'vertical', at: 3 }, steps: ['აი ნახევარი ფიგურა.', 'სარკის ხაზი შუაზე გადის.', 'ყოველი უჯრა მეორე მხარეს იმავე მანძილზე გადადის.', 'ნახევრები ემთხვევა — ფიგურა დასრულდა.'] },
        { type: 'text', text: 'ფიგურის დასასრულებლად ყოველ უჯრას ვეძებთ წყვილს სარკის ხაზის მეორე მხარეს: იმავე მანძილზე, იმავე სიმაღლეზე. როცა ყველა უჯრას წყვილი ჰყავს, ფიგურა სიმეტრიულია.' },
        { type: 'grid-picture', picture: { width: 4, height: 4, cells: HALF_HEART }, line: { axis: 'vertical', at: 3 }, ghost: true, caption: 'მონახაზი გვიჩვენებს, სად მოხვდება ყოველი უჯრა.' },
        { type: 'callout', tone: 'tip', text: 'უჯრა, რომელიც ზუსტად სარკის ხაზზე დგას, თავისი თავის წყვილია და ადგილს არ იცვლის.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაასრულე გული.',
      response: { type: 'symmetry-fill', picture: { width: 4, height: 4, cells: HALF_HEART }, line: { axis: 'vertical', at: 3 } },
      hints: ['ჯერ აიღე ყველაზე ზედა უჯრა.', 'თითოეული უჯრა ხაზიდან იმავე მანძილზე აირეკლე.'],
      explanation: 'გულის მარცხენა ნახევრის ყოველი უჯრა მარჯვნივ იმავე მანძილზე აირეკლა — ფიგურა დასრულდა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე ხაზიდან მანძილი.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაასრულე პეპელა.',
      response: { type: 'symmetry-fill', picture: { width: 5, height: 4, cells: HALF_BUTTERFLY }, line: { axis: 'vertical', at: 3 } },
      hints: ['პეპელას სხეულიც სარკის ხაზზეა.', 'უჯრა, რომელიც ხაზზეა, თავისი წყვილია.'],
      explanation: 'პეპელას სხეული ხაზზე დგას და ადგილს არ იცვლის; ფრთები კი მეორე მხარეს აირეკლა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ხაზზე მდგომი უჯრა არ იძვრება.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რა ხდება უჯრასთან, რომელიც ზუსტად სარკის ხაზზე დგას?',
      response: {
        type: 'choice',
        options: [
          { id: 'stays', text: 'ის თავის ადგილზე რჩება — თავისი თავის წყვილია' },
          { id: 'moves', text: 'ის მეორე მხარეს გადადის' },
          { id: 'vanishes', text: 'ის ქრება' },
        ],
        answer: 'stays',
      },
      hints: ['ხაზზე მდგარი უჯრის მანძილი ხაზიდან 0-ია.', '0 მანძილი ორივე მხარეს ერთი და იმავე ადგილია.'],
      explanation: 'უჯრა, რომელიც სარკის ხაზზე დგას, თავის თავში აირეკლება და ადგილს არ იცვლის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. სარკის ხაზზე მდგარი უჯრა საკუთარი წყვილია.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'დაასრულე ფიგურა ჰორიზონტალურ სარკის ხაზზე.',
      response: { type: 'symmetry-fill', picture: { width: 4, height: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }] }, line: { axis: 'horizontal', at: 3 } },
      hints: ['ახლა ხაზი ჰორიზონტალურია — უჯრები ზემოდან ქვემოთ აირეკლება.', 'იმავე სვეტში, იმავე მანძილზე.'],
      explanation: 'ჰორიზონტალურ ხაზზე უჯრები ვერტიკალურად აირეკლება: იმავე სვეტში, ხაზიდან იმავე მანძილზე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ამ ხაზზე უჯრები ზემოდან ქვემოთ მოძრაობენ.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'დაასრულე ფიგურა.',
      response: { type: 'symmetry-fill', picture: { width: 4, height: 4, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 2 }] }, line: { axis: 'vertical', at: 3 } },
      hints: [],
      explanation: 'სამი უჯრა მარჯვნივ იმავე მანძილზე აირეკლა — ფიგურა სარკულია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ყოველ უჯრას წყვილი სჭირდება.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'დაასრულე პეპელა.',
      response: { type: 'symmetry-fill', picture: { width: 5, height: 4, cells: HALF_BUTTERFLY }, line: { axis: 'vertical', at: 3 } },
      hints: [],
      explanation: 'პეპელას ფრთები სარკულად დაემატა, სხეული კი ხაზზე დარჩა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეავსე ყველა უჯრა სარკულად.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რამდენი უჯრა აკლია ამ ფიგურას?',
      visual: { type: 'grid-picture', picture: { width: 4, height: 4, cells: HALF_HEART }, line: { axis: 'vertical', at: 3 }, ghost: true },
      response: { type: 'numeric', answer: 6, unit: 'უჯრა' },
      hints: [],
      explanation: 'ექვსივე დახატული უჯრა მეორე მხარეს უნდა გადავიდეს — აკლია 6 უჯრა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე მოცემული უჯრები.',
    },
  ],
};
