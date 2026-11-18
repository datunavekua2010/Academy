import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 1 · U07.4 "Matching Analog and Digital Times".
 * Demonstration content only. An analog clock shows the time with hands; a digital clock shows it with digits.
 * The same moment looks different on the two clocks, so matching them means reading both correctly.
 */
export const g1u07l4: Lesson = {
  id: 'g1-u07-l4',
  status: 'placeholder',
  objective: 'ვკითხულობ ციფრულ დროს და ვუსაბამებ ანალოგურ საათს.',
  prerequisites: ['ზუსტი საათები და ნახევარი (U07.2, U07.3)'],
  minutes: 10,
  concepts: ['ანალოგური საათი', 'ციფრული საათი', 'დროის შედარება', 'შესაბამისობა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ერთი და იმავე დრო ორ საათზე ორ სხვადასხვა სახით ჩანს.',
    retry: 'სცადე ისევ. ჯერ ანალოგური საათი წაიკითხე, მერე მოძებნე იგივე დრო ციფრულად.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელი ციფრული დრო ემთხვევა საათს?',
      visual: { type: 'clock', time: { h: 4, m: 30 } },
      mascot: { intro: 'ციფრულ საათზე ჯერ საათებია, შემდეგ წუთები: 4:30.' },
      response: {
        type: 'choice',
        options: [
          { id: '430', text: '4:30' },
          { id: '400', text: '4:00' },
          { id: '630', text: '6:30' },
        ],
        answer: '430',
      },
      hints: ['წუთის ისარი 6-ზეა, ანუ 30 წუთი. საათის ისარი 4-სა და 5-ს შორისაა.'],
      explanation: 'საათი 4:30-ს აჩვენებს: 4 საათი და 30 წუთი. ციფრულად ეს 4:30 არის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ჯერ ანალოგური საათი წაიკითხე.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'საათების შესაბამისობა',
      prompt: 'შეუსაბამე ანალოგური საათები ციფრულ დროს. დააკვირდი, როგორ იკითხება ერთი და იმავე დრო ორი სახით.',
      hints: ['ჯერ აირჩიე საათი, მერე დააჭირე ციფრულ დროს, რომელიც იგივეს აჩვენებს.', '3:00 — ზუსტი, 3:30 — ნახევარი.'],
      tool: {
        tool: 'time-match-lab',
        pairs: [{ time: { h: 3, m: 0 } }, { time: { h: 6, m: 30 } }, { time: { h: 9, m: 0 } }],
      },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'ორი სახის საათი',
      prompt: 'შევადაროთ ანალოგური და ციფრული დრო.',
      blocks: [
        { type: 'text', text: 'ანალოგურ საათს ისრები აქვს: მოკლე ისარი საათებია, გრძელი — წუთები. ციფრული საათი დროს ციფრებით გვიჩვენებს, ორწერტილის ორივე მხარეს.' },
        {
          type: 'clock-demo',
          mode: 'oclock',
          time: { h: 3, m: 0 },
          steps: [
            'ანალოგურად: საათის ისარი 3-ზე, წუთის ისარი 12-ზე.',
            'ციფრულად: 3:00 — ორწერტილამდე საათებია, შემდეგ წუთები.',
            'თუ წუთების ადგილზე 00 წერია, დრო ზუსტი საათია.',
          ],
          caption: 'ანალოგური: ისრებით. ციფრული: ციფრებით. დრო იგივეა.',
        },
        { type: 'callout', tone: 'tip', text: 'ციფრულ ჩანაწერში ორი წერტილი გამოყოფს საათებსა და წუთებს: 4:30 ნიშნავს 4 საათს და 30 წუთს.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'შეუსაბამე საათი ციფრულ დროს: 7:00, 2:30, 10:00.',
      response: {
        type: 'match-time',
        faces: [
          { h: 7, m: 0 },
          { h: 2, m: 30 },
          { h: 10, m: 0 },
        ],
        displays: ['10:00', '7:00', '2:30'],
      },
      hints: ['ჯერ 7:00 იპოვე: წუთის ისარი 12-ზე, საათის ისარი 7-ზე.'],
      explanation: '7:00 → 7:00, 2:30 → 2:30, 10:00 → 10:00. ორივე საათი ერთსა და იმავე დროს აჩვენებს.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. თითოეული საათი ცალ-ცალკე წაიკითხე.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელი დრო აჩვენებს ციფრულ საათს?',
      visual: { type: 'clock', time: { h: 8, m: 0 } },
      response: { type: 'read-clock', time: { h: 8, m: 0 }, options: [{ h: 8, m: 0 }, { h: 8, m: 30 }, { h: 12, m: 0 }] },
      hints: ['წუთის ისარი 12-ზეა, ანუ 00 წუთი. საათის ისარი 8-ზეა.'],
      explanation: '8:00 — რვა საათი. ციფრულად: 8:00.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე წუთის ისარს.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'ციფრული საათი 5:30-ს აჩვენებს. როგორ გამოიყურება ანალოგური საათი?',
      response: {
        type: 'choice',
        options: [
          { id: 'five30', text: 'წუთის ისარი 6-ზე, საათის ისარი 5-სა და 6-ს შორის' },
          { id: 'five', text: 'წუთის ისარი 12-ზე, საათის ისარი 5-ზე' },
          { id: 'six30', text: 'წუთის ისარი 6-ზე, საათის ისარი 6-სა და 7-ს შორის' },
        ],
        answer: 'five30',
      },
      hints: ['30 წუთი ნახევარია: წუთის ისარი 6-ზე. საათის ისარი შემდეგ ციფრზე გადასვლისას შუაშია.'],
      explanation: '5:30 — წუთის ისარი 6-ზე, საათის ისარი 5-სა და 6-ს შორის.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. 5:30 = 5 საათი და 30 წუთი.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'რამდენი საათი და რამდენი წუთია 9:00-ზე?',
      response: { type: 'numeric', answer: 0, unit: 'წუთი' },
      hints: ['ორწერტილის შემდეგ 00 წერია — ანუ ნული წუთი.'],
      explanation: '9:00 — 9 საათი და 0 წუთი. ამიტომ ეს ზუსტი საათია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. ორი წერტილის შემდეგ რა წერია?',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'შეუსაბამე საათი ციფრულ დროს: 1:30, 12:00.',
      response: {
        type: 'match-time',
        faces: [
          { h: 1, m: 30 },
          { h: 12, m: 0 },
        ],
        displays: ['12:00', '1:30'],
      },
      hints: [],
      explanation: '1:30 → 1:30, 12:00 → 12:00.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. წაიკითხე თითოეული საათი.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი დროა?',
      response: { type: 'read-clock', time: { h: 11, m: 30 }, options: [{ h: 11, m: 0 }, { h: 5, m: 30 }, { h: 11, m: 30 }] },
      hints: [],
      explanation: '11:30 — თერთმეტი საათი და ნახევარი.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეხედე ორივე ისარს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელი წინადადებაა სწორი?',
      response: {
        type: 'choice',
        options: [
          { id: 'both', text: 'ანალოგური და ციფრული საათი ერთსა და იმავე დროს აჩვენებს, მხოლოდ სხვადასხვანაირად' },
          { id: 'different', text: 'ისინი ყოველთვის სხვადასხვა დროს აჩვენებენ' },
          { id: 'onlydigital', text: 'ციფრული საათი დროს არ აჩვენებს' },
        ],
        answer: 'both',
      },
      hints: [],
      explanation: 'ორივე საათი ერთსა და იმავე დროს აჩვენებს: ანალოგური ისრებით, ციფრული ციფრებით.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაიხსენი შესაბამისობის სავარჯიშო.',
    },
  ],
};
