import type { Lesson } from '../types';

/**
 * GRADE 2 · U08.4 "Reading and Comparing Clock Times".
 *
 * The clock faces come from `ClockBoard` and every "right time" is the time the face is set to, so a written label can
 * never disagree with the hands. Comparing two times is comparing minutes past the hour as `ClockGeometry` computes
 * them.
 */
export const g2u08l4: Lesson = {
  id: 'g2-u08-l4',
  status: 'placeholder',
  objective: 'ვკითხულობ საათს ზუსტად, ნახევარზე და ხუთ წუთზე, ვადარებ ორ დროს და ვამბობ, რომელია ადრე.',
  prerequisites: ['საათის ისრები (G1 U08)'],
  minutes: 13,
  concepts: ['საათები და წუთები', 'ნახევარი', 'ხუთწუთიანი ნიშნები', 'ადრე და გვიან'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! საათს თვითონ კითხულობ.',
    retry: 'სცადე ისევ. ჯერ მოკლე ისარი — საათები, მერე გრძელი — წუთები.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელ დროს აჩვენებს საათი?',
      mascot: { intro: 'დღეს საათის კითხვას ვიმეორებთ.' },
      visual: { type: 'clock', time: { h: 3, m: 0 } },
      response: {
        type: 'choice',
        options: [
          { id: 'three', text: '3 საათი' },
          { id: 'twelve', text: '12 საათი' },
          { id: 'five', text: '5 საათი' },
        ],
        answer: 'three',
      },
      hints: ['შეხედე მოკლე ისარს.', 'გრძელი ისარი 12-ზეა — ზუსტი საათია.'],
      explanation: 'მოკლე ისარი 3-ზეა, გრძელი — 12-ზე. ეს 3 საათია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მოკლე ისარი საათებს გიჩვენებს.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'ატრიალე ისრები',
      prompt: 'ატრიალე საათის ისრები და შეხედე, როგორ იცვლება დრო. სცადე ნახევრები.',
      hints: ['გრძელი ისარი 30 წუთზე ნახევარს ნიშნავს.', 'ნახევარზე მოკლე ისარი რიცხვებს შუა დგას.'],
      tool: { tool: 'time-set-lab', times: [{ h: 3, m: 0 }, { h: 3, m: 30 }, { h: 4, m: 15 }, { h: 6, m: 45 }], step: 5 },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ორი ისარი, ორი ამბავი',
      prompt: 'ვნახოთ, როგორ იკითხება საათი ერთად.',
      blocks: [
        { type: 'clock-demo', mode: 'half', time: { h: 3, m: 30 }, steps: ['გრძელი ისარი 6-ზეა — 30 წუთი.', 'მოკლე ისარი 3-სა და 4-ს შუა დგას.', 'ეს ნახევარია: 3:30.', '3 საათი და ნახევარი.'] },
        { type: 'text', text: 'საათი ორ რამეს გვიჩვენებს: მოკლე ისარი ამბობს საათებს, გრძელი — წუთებს. გრძელი ისარი 12-ზეა — ზუსტი საათია, 6-ზე — ნახევარი.' },
        { type: 'callout', tone: 'tip', text: 'ნახევარზე მოკლე ისარი ორ რიცხვს შუა დგას — ის ჯერ არ არის მისულა შემდეგ რიცხვამდე.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ დროს აჩვენებს საათი?',
      visual: { type: 'clock', time: { h: 5, m: 30 } },
      response: {
        type: 'choice',
        options: [
          { id: 'halfFive', text: '5 საათი და ნახევარი (5:30)' },
          { id: 'halfSix', text: '6 საათი და ნახევარი (6:30)' },
          { id: 'five', text: '5 საათი (5:00)' },
        ],
        answer: 'halfFive',
      },
      hints: ['გრძელი ისარი 6-ზეა — ნახევარია.', 'მოკლე ისარი 5-სა და 6-ს შუაა — ის 5 საათია.'],
      explanation: 'მოკლე ისარი 5-სა და 6-ს შუაა, გრძელი — 6-ზე. ეს 5:30-ია.',
      misconceptions: [{ id: 'readsNextHour', answers: ['halfSix'], feedback: 'მოკლე ისარი ჯერ 6-ს არ მიუღწევია — საათი 5-ია, ამიტომ 5:30.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ნახევარზე საათს მოკლე ისრის ქვედა რიცხვი ამბობს.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი საათი აჩვენებს 4:15-ს?',
      response: {
        type: 'choice',
        options: [
          { id: 'a', text: 'საათი 4:15-ზე', visual: { type: 'clock', time: { h: 4, m: 15 } } },
          { id: 'b', text: 'საათი 3:15-ზე', visual: { type: 'clock', time: { h: 3, m: 15 } } },
          { id: 'c', text: 'საათი 4:45-ზე', visual: { type: 'clock', time: { h: 4, m: 45 } } },
        ],
        answer: 'a',
      },
      hints: ['ჯერ საათი მოძებნე — 4.', 'შემდეგ წუთები — გრძელი ისარი 3-ზეა, ეს 15 წუთია.'],
      explanation: '4:15-ზე მოკლე ისარი 4-ის შემდეგ ცოტა წინაა, გრძელი — 3-ზე.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მოკლე ისარი 4-ს უნდა ეხებოდეს.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი დროა უფრო ადრე: 2:30 თუ 4:00?',
      response: {
        type: 'choice',
        options: [
          { id: 'first', text: '2:30' },
          { id: 'second', text: '4:00' },
          { id: 'same', text: 'ორივე ერთი და იმავე დროსაა' },
        ],
        answer: 'first',
      },
      hints: ['ადრე ნიშნავს უფრო პატარა საათს.', '2 საათი 4 საათზე ადრეა.'],
      explanation: '2:30 უფრო ადრეა, ვიდრე 4:00 — დღე 2 საათიდან 4 საათამდე მიდის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე საათები ჯერ.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ დროს აჩვენებს საათი?',
      visual: { type: 'clock', time: { h: 8, m: 45 } },
      response: {
        type: 'choice',
        options: [
          { id: 'eight45', text: '8:45' },
          { id: 'nine45', text: '9:45' },
          { id: 'eight15', text: '8:15' },
        ],
        answer: 'eight45',
      },
      hints: ['გრძელი ისარი 9-ზეა — 45 წუთი.', 'მოკლე ისარი 8-სა და 9-ს შუა, 9-ს ახლოსაა.'],
      explanation: 'გრძელი ისარი 9-ზე — 45 წუთი. მოკლე ისარი ჯერ კიდევ 8 საათის მხარესაა, ამიტომ 8:45.',
      misconceptions: [{ id: 'readsNine', answers: ['nine45'], feedback: 'მოკლე ისარი 9-ს არ მიუღწევია — საათი 8-ია.' }],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. მოკლე ისარი ჯერ 8-სა და 9-ს შუაა.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელ დროს აჩვენებს საათი?',
      visual: { type: 'clock', time: { h: 9, m: 0 } },
      response: { type: 'read-clock', time: { h: 9, m: 0 }, options: [{ h: 9, m: 0 }, { h: 12, m: 45 }, { h: 3, m: 0 }] },
      hints: [],
      explanation: 'მოკლე ისარი 9-ზეა, გრძელი — 12-ზე. ეს ზუსტად 9 საათია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ზუსტ საათზე გრძელი ისარი 12-ზეა.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი დროა უფრო გვიან: 6:15 თუ 5:45?',
      response: {
        type: 'choice',
        options: [
          { id: 'later', text: '6:15' },
          { id: 'earlier', text: '5:45' },
          { id: 'same', text: 'ორივე ერთი და იმავე დროსაა' },
        ],
        answer: 'later',
      },
      hints: [],
      explanation: '6:15 უფრო გვიანაა: ჯერ 5:45 მოდის, მერე 6:00, შემდეგ 6:15.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე საათები.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'დააკავშირე საათები ციფრულ ჩვენებასთან: 2:30 და 7:00.',
      response: { type: 'match-time', faces: [{ h: 2, m: 30 }, { h: 7, m: 0 }], displays: ['7:00', '2:30'] },
      hints: [],
      explanation: '2:30 — ნახევარი სამის წინ; 7:00 — ზუსტად შვიდი. თითოეულ საათს თავისი ციფრული ჩვენება აქვს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ორივე ისარს.',
    },
  ],
};
