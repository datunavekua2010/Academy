import type { Lesson, Cell } from '../types';

/**
 * GRADE 2 · U10.1 "Recognizing Symmetrical Shapes".
 *
 * A picture is symmetric about a line when reflecting its cells across that line gives back the same cells. Nothing
 * here is decided by looking — `isSymmetricAbout` compares the two sets, so a picture that is "almost" symmetric fails.
 */
/** A hollow square: four sides, nothing in the middle. Its mirror is itself on both middle lines. */
const SQUARE: Cell[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
];

const LSHAPE: Cell[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
];

const HEART: Cell[] = [
  { x: 1, y: 0 },
  { x: 3, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
];

export const g2u10l1: Lesson = {
  id: 'g2-u10-l1',
  status: 'placeholder',
  objective: 'ვარჩევ სიმეტრიულ და არასიმეტრიულ ფიგურებს და ვამოწმებ სარკის ხაზით, ორი ნახევარი ემთხვევა თუ არა.',
  prerequisites: ['ფიგურები და გვერდები (G2 U08)'],
  minutes: 12,
  concepts: ['სიმეტრია', 'სარკის ხაზი', 'ორი ტოლი ნახევარი', 'არასიმეტრიული ფიგურა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ახლა სიმეტრიას თვალით კი არა, სარკით ამოწმებ.',
    retry: 'სცადე ისევ. გადაკეცე ფიგურა და შეხედე, ემთხვევა თუ არა ნახევრები.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ფიგურაა სიმეტრიული?',
      mascot: { intro: 'დღეს სიმეტრიას ვისწავლით.' },
      response: {
        type: 'choice',
        options: [
          { id: 'heart', text: 'გული', visual: { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART } } },
          { id: 'l', text: 'ასო L', visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: LSHAPE } } },
        ],
        answer: 'heart',
      },
      hints: ['სიმეტრიულ ფიგურას შუაზე გაკეცვისას ნახევრები ემთხვევა.', 'შეხედე, არის თუ არა გულის ორი მხარე ერთნაირი.'],
      explanation: 'გული სიმეტრიულია: მისი მარცხენა და მარჯვენა ნახევრები ერთნაირია. ასო L — არა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გონებით გადაკეცე ფიგურა შუაზე.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'სრიალა სარკის ხაზი',
      prompt: 'გადააადგილე სარკის ხაზი ფიგურაზე და ნახე, როდის ემთხვევა იგი თავის არეკვლას.',
      hints: ['ზოგი ფიგურა მხოლოდ ერთ ხაზზეა სიმეტრიული.', 'თუ უჯრას წყვილი არ აქვს, ეს ხაზი სარკის ხაზი არ არის.'],
      tool: { tool: 'mirror-lab', pictures: [{ width: 5, height: 4, cells: HEART }, { width: 4, height: 3, cells: LSHAPE }] },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'სიმეტრია — სარკეში იგივე',
      prompt: 'ვნახოთ, რას ნიშნავს „სიმეტრიული“.',
      blocks: [
        { type: 'symmetry-demo', mode: 'fold', picture: { width: 5, height: 4, cells: HEART }, line: { axis: 'vertical', at: 4 }, steps: ['აი ფიგურა.', 'სარკის ხაზი შუაზე გადის.', 'მარცხენა ნახევარი მარჯვნივ აირეკლება.', 'ნახევრები ემთხვევა — ფიგურა სიმეტრიულია.'] },
        { type: 'text', text: 'ფიგურა სიმეტრიულია, თუ მისი ნახევრები სარკის ხაზის ორივე მხარეს ერთნაირია. ეს ნიშნავს, რომ ყოველ უჯრას მეორე მხარეს ზუსტი წყვილი აქვს.' },
        { type: 'grid-picture', picture: { width: 3, height: 3, cells: SQUARE }, line: { axis: 'vertical', at: 2 }, caption: 'კვადრატი სარკის ხაზის ორივე მხარეს ერთნაირია.' },
        { type: 'grid-picture', picture: { width: 4, height: 3, cells: LSHAPE }, line: { axis: 'vertical', at: 2 }, caption: 'ასო L: მარცხენა უჯრებს მარჯვნივ წყვილი არ აქვს.' },
        { type: 'callout', tone: 'tip', text: 'სიმეტრია სიტყვებით არ იწყება — ყოველთვის სარკის ხაზს უნდა ასახო და შეადარო.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'ეს ფიგურა სიმეტრიულია?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: SQUARE }, line: { axis: 'vertical', at: 2 } },
      response: {
        type: 'choice',
        options: [
          { id: 'yes', text: 'დიახ, სიმეტრიულია' },
          { id: 'no', text: 'არა, არ არის სიმეტრიული' },
        ],
        answer: 'yes',
      },
      hints: ['გადაკეცე შუაზე გონებით.', 'მარცხენა სვეტი მარჯვენას ზუსტად ემთხვევა.'],
      explanation: 'კვადრატის ჩარჩო სიმეტრიულია: მარცხენა და მარჯვენა უჯრები სარკის ხაზის ორივე მხარეს ემთხვევა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორი ნახევარი.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'ეს ფიგურა სიმეტრიულია?',
      visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: LSHAPE }, line: { axis: 'horizontal', at: 2 } },
      response: {
        type: 'choice',
        options: [
          { id: 'no', text: 'არა, არ არის სიმეტრიული' },
          { id: 'yes', text: 'დიახ, სიმეტრიულია' },
        ],
        answer: 'no',
      },
      hints: ['ასო L-ს ორი უჯრა მხოლოდ ერთ მხარეს აქვს.', 'იპოვე უჯრა, რომელსაც წყვილი არ აქვს.'],
      explanation: 'ასო L არ არის სიმეტრიული ამ ხაზზე: ქვედა მარჯვენა უჯრას მარცხნივ წყვილი არ აქვს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მოძებნე უჯრა წყვილის გარეშე.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი ნახატია სიმეტრიული?',
      response: {
        type: 'choice',
        options: [
          { id: 'b', text: 'ნახატი ბ', visual: { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART } } },
          { id: 'a', text: 'ნახატი ა', visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 }] } } },
        ],
        answer: 'b',
      },
      hints: ['შეადარე ორივე ნახატის ნახევრები.', 'ერთ ნახატს მხოლოდ ერთ მხარეს უჯრები აქვს.'],
      explanation: 'გულისებრი ნახატი სიმეტრიულია: ორივე მხარე ერთნაირია. ა-ში მარჯვენა მხარეს მხოლოდ ერთი უჯრაა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ერთ ნახატს არათანაბარი ნახევრები აქვს.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რას ნიშნავს, რომ ფიგურა სიმეტრიულია?',
      response: {
        type: 'choice',
        options: [
          { id: 'mirror', text: 'სარკის ხაზის ორივე მხარეს ფიგურა ერთნაირია' },
          { id: 'big', text: 'ფიგურა დიდია' },
          { id: 'round', text: 'ფიგურა მრგვალია' },
        ],
        answer: 'mirror',
      },
      hints: ['სიმეტრია სარკეზეა.', 'ზომა და ფორმა აქ არაფერს ნიშნავს.'],
      explanation: 'სიმეტრიული ფიგურა სარკის ხაზის ორივე მხარეს ერთნაირად გამოიყურება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. საკვანძო სიტყვაა „სარკე“.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'ეს ფიგურა სიმეტრიულია ვერტიკალურ ხაზზე?',
      visual: { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART }, line: { axis: 'vertical', at: 4 } },
      response: {
        type: 'choice',
        options: [
          { id: 'yes', text: 'დიახ' },
          { id: 'no', text: 'არა' },
        ],
        answer: 'yes',
      },
      hints: [],
      explanation: 'გულის ნახატი ვერტიკალურ ხაზზე სიმეტრიულია: ორივე მხარე ერთნაირია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორი ნახევარი.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'ეს ფიგურა სიმეტრიულია?',
      visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: LSHAPE }, line: { axis: 'horizontal', at: 2 } },
      response: {
        type: 'choice',
        options: [
          { id: 'no', text: 'არა' },
          { id: 'yes', text: 'დიახ' },
        ],
        answer: 'no',
      },
      hints: [],
      explanation: 'ასო L ჰორიზონტალურ ხაზზე არ არის სიმეტრიული: ზედა ნაწილი ქვედას არ ემთხვევა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ზედა და ქვედა ნახევარს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი ფიგურაა სიმეტრიული სარკის ხაზზე?',
      response: {
        type: 'choice',
        options: [
          { id: 'heart', text: 'გული', visual: { type: 'grid-picture', picture: { width: 5, height: 4, cells: HEART }, line: { axis: 'vertical', at: 4 } } },
          { id: 'l', text: 'ასო L', visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: LSHAPE }, line: { axis: 'vertical', at: 2 } } },
        ],
        answer: 'heart',
      },
      hints: [],
      explanation: 'გული სიმეტრიულია, ასო L — არა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე ფიგურა, რომლის ნახევრებიც ემთხვევა.',
    },
  ],
};
