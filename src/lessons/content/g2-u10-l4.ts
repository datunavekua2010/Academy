import type { Lesson, Cell } from '../types';

/**
 * GRADE 2 · U10.4 "Understanding Flips and Reflections".
 *
 * A flip changes orientation. The right option is decided by `isReflectionOf`, and the wrong ones are built to be
 * tempting: the same shape slid sideways (a slide, not a flip) and the same shape flipped the other way. Only the true
 * reflection passes, so "it looks flipped" is never enough.
 */
/** An L that faces one way. */
const LPIECE: Cell[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
];

/** A flag: a pole and a corner. Its vertical mirror is visibly different. */
const FLAG: Cell[] = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 1, y: 1 },
];

export const g2u10l4: Lesson = {
  id: 'g2-u10-l4',
  status: 'placeholder',
  objective: 'ვხვდები, რომ არეკვლა ფიგურის ორიენტაციას ცვლის, და ვარჩევ ნამდვილ ანარეკლს გადატანილისაგან.',
  prerequisites: ['სიმეტრიის შევსება (U10.3)'],
  minutes: 14,
  concepts: ['არეკვლა', 'გადატანა', 'ორიენტაცია', 'სარკული ანარეკლი'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ახლა არეკვლას გადატანისგან გაარჩევ.',
    retry: 'სცადე ისევ. არეკვლა ფიგურას აბრუნებს, გადატანა — მხოლოდ ამოძრავებს.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ფიგურაა ა-ს ნამდვილი ანარეკლი ვერტიკალურ სარკეში?',
      mascot: { intro: 'დღეს არეკვლას ვისწავლით.' },
      visual: { type: 'grid-picture', picture: { width: 5, height: 3, cells: LPIECE } },
      response: {
        type: 'flip-pick',
        source: LPIECE,
        line: { axis: 'vertical', at: 4 },
        width: 5,
        height: 3,
        options: [
          { id: 'a', cells: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 3, y: 2 }] },
          { id: 'b', cells: LPIECE },
          { id: 'c', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }] },
        ],
      },
      hints: ['სარკეში მარცხენა ხდება მარჯვენა.', 'ფიგურის ქვედა ნაწილი ზედაში არ გადადის.'],
      explanation: 'ვერტიკალურ სარკეში L მარჯვნივ იბრუნებს: მისი ვერტიკალური ნაწილი მარჯვნივ გადადის, ქვედა კი ქვედა რჩება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. არეკვლა ორიენტაციას ცვლის, გადატანა — არა.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'არეკვლა თუ გადატანა',
      prompt: 'აირჩიე ვერტიკალური ანარეკლი, ჰორიზონტალური ანარეკლი ან უბრალო გადატანა და შეადარე შედეგები.',
      hints: ['გადატანისას ფიგურა იგივე რჩება.', 'არეკვლა ფიგურას აბრუნებს.'],
      tool: { tool: 'flip-lab', cells: LPIECE, width: 4, height: 3 },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'არეკვლა ცვლის ორიენტაციას',
      prompt: 'ვნახოთ, რით განსხვავდება არეკვლა გადატანისგან.',
      blocks: [
        { type: 'symmetry-demo', mode: 'flip', picture: { width: 4, height: 3, cells: LPIECE }, line: { axis: 'vertical', at: 3 }, steps: ['აი ფიგურა: L ერთი მიმართულებით იხრება.', 'სარკე ვერტიკალურად დგას.', 'ფიგურა ირეკლება — L ახლა საპირისპიროდ იხრება.', 'ეს არის არეკვლა: ორიენტაცია შეიცვალა.'] },
        { type: 'text', text: 'არეკვლა ფიგურას სარკეში ასახავს: ის აბრუნებს ფიგურას, ამიტომ „მარცხენა“ ხდება „მარჯვენა“. გადატანა კი ფიგურას მხოლოდ სხვა ადგილზე გადაიტანს — ორიენტაცია იგივე რჩება.' },
        { type: 'grid-picture', picture: { width: 3, height: 3, cells: LPIECE }, caption: 'თავდაპირველი: L მარცხნივ იხრება.' },
        { type: 'grid-picture', picture: { width: 3, height: 3, cells: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }] }, caption: 'ვერტიკალური ანარეკლი: L მარჯვნივ იხრება.' },
        { type: 'callout', tone: 'tip', text: 'თუ ფიგურა ისევ ისე გამოიყურება, მხოლოდ სხვა ადგილზეა — ეს გადატანაა, არა არეკვლა.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელია დროშის ნამდვილი ანარეკლი ვერტიკალურ სარკეში?',
      visual: { type: 'grid-picture', picture: { width: 4, height: 3, cells: FLAG } },
      response: {
        type: 'flip-pick',
        source: FLAG,
        line: { axis: 'vertical', at: 6 },
        width: 7,
        height: 3,
        options: [
          { id: 'a', cells: [{ x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 1 }] },
          { id: 'b', cells: FLAG },
          { id: 'c', cells: [{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 1 }] },
        ],
      },
      hints: ['დროშის ძელი მარცხნივაა — სარკეში ის მარჯვნივ გადავა.', 'ქსოვილი ზედა მარცხენა კუთხეშია.'],
      explanation: 'ვერტიკალურ სარკეში ძელი მარჯვნივ გადადის, ქსოვილი კი ზედა მარცხნივ რჩება — ეს ვარიანტი ა-ა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. არეკვლა მარცხენას მარჯვნივ გადააქცევს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რა ხდება ფიგურასთან არეკვლისას?',
      response: {
        type: 'choice',
        options: [
          { id: 'orientation', text: 'ორიენტაცია იცვლება — მარცხენა მარჯვენა ხდება' },
          { id: 'moves', text: 'ფიგურა მხოლოდ სხვა ადგილზე გადადის' },
          { id: 'size', text: 'ფიგურა უფრო დიდი ხდება' },
        ],
        answer: 'orientation',
      },
      hints: ['სარკე ფიგურას აბრუნებს.', 'ზომა არ იცვლება — იცვლება მიმართულება.'],
      explanation: 'არეკვლისას ფიგურის ორიენტაცია იცვლება: რაც მარცხნივ იყო, მარჯვნივ გადადის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. არეკვლა ორიენტაციას ცვლის.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელია L-ს ნამდვილი ანარეკლი ჰორიზონტალურ სარკეში?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: LPIECE } },
      response: {
        type: 'flip-pick',
        source: LPIECE,
        line: { axis: 'horizontal', at: 4 },
        width: 3,
        height: 5,
        options: [
          { id: 'a', cells: [{ x: 0, y: 4 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
          { id: 'b', cells: LPIECE },
          { id: 'c', cells: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }] },
        ],
      },
      hints: ['ჰორიზონტალურ სარკეში ზედა ქვედა ხდება.', 'ვერტიკალური ნაწილი იმავე მხარეს რჩება.'],
      explanation: 'ჰორიზონტალურ სარკეში L უნდა აირეკლოს ზემოდან ქვემოთ: ქვედა ჰორიზონტალური ნაწილი ზედა ხდება.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ეს სარკე ზემოდან ქვემოთ ასახავს.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'ეს ორი ფიგურა ანარეკლია თუ გადატანილი?',
      response: {
        type: 'choice',
        options: [
          { id: 'slide', text: 'გადატანილი — ორივე ერთნაირად გამოიყურება', visual: { type: 'grid-picture', picture: { width: 5, height: 3, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 }] } } },
          { id: 'flip', text: 'ანარეკლი — ერთი მეორის სარკული ანარეკლია', visual: { type: 'grid-picture', picture: { width: 5, height: 3, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 1 }] } } },
        ],
        answer: 'slide',
      },
      hints: ['შეადარე ორივე ფიგურის მიმართულება.', 'თუ ისინი ერთნაირად იხრებიან, ეს გადატანაა.'],
      explanation: 'ორივე ფიგურა ერთი და იმავე მიმართულებით იხრება — ეს გადატანაა. ანარეკლისას ერთი საპირისპიროდ იხრებოდა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ორივე ფიგურის მიმართულება.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელია ფიგურის ნამდვილი ანარეკლი ვერტიკალურ სარკეში?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: LPIECE } },
      response: {
        type: 'flip-pick',
        source: LPIECE,
        line: { axis: 'vertical', at: 4 },
        width: 5,
        height: 3,
        options: [
          { id: 'a', cells: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 3, y: 2 }] },
          { id: 'b', cells: LPIECE },
        ],
      },
      hints: [],
      explanation: 'ვერტიკალურ სარკეში L მარჯვნივ იბრუნებს — ვარიანტი ა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. არეკვლა ორიენტაციას ცვლის.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'დროშის ვერტიკალურ სარკეში ანარეკლისას სად გადადის ძელი?',
      response: {
        type: 'choice',
        options: [
          { id: 'right', text: 'მარჯვენა მხარეს' },
          { id: 'left', text: 'მარცხენა მხარეს — იქ სადაც იყო' },
          { id: 'top', text: 'ზედა კიდეში' },
        ],
        answer: 'right',
      },
      hints: [],
      explanation: 'ვერტიკალური სარკე მარცხენას მარჯვნივ აქცევს, ამიტომ ძელი მარჯვნივ გადადის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ვერტიკალური არეკვლა მარცხენას მარჯვნივ ცვლის.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელია L-ს ანარეკლი ჰორიზონტალურ სარკეში?',
      visual: { type: 'grid-picture', picture: { width: 3, height: 3, cells: LPIECE } },
      response: {
        type: 'flip-pick',
        source: LPIECE,
        line: { axis: 'horizontal', at: 4 },
        width: 3,
        height: 5,
        options: [
          { id: 'a', cells: [{ x: 0, y: 4 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
          { id: 'b', cells: LPIECE },
        ],
      },
      hints: [],
      explanation: 'ჰორიზონტალურ სარკეში L ზემოდან ქვემოთ აირეკლება — ვარიანტი ა.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ეს სარკე ზემოდან ქვემოთ ასახავს.',
    },
  ],
};
