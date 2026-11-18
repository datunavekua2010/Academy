import type { Lesson } from '../types';

const chart = {
  glyph: 'star' as const,
  rows: [
    { label: 'ვაშლი', count: 4 },
    { label: 'მსხალი', count: 2 },
    { label: 'ატამი', count: 5 },
  ],
};

const toyChart = {
  glyph: 'ball' as const,
  rows: [
    { label: 'ბურთი', count: 3 },
    { label: 'კუბიკი', count: 3 },
    { label: 'თოჯინა', count: 1 },
  ],
};

/**
 * PLACEHOLDER lesson — Grade 1 · U10.4 "Reading and Creating Simple Picture Charts".
 * Demonstration content only. In a picture chart one symbol stands for one thing, so the number for a row is the
 * number of symbols in it — never a label written beside it.
 */
export const g1u10l4: Lesson = {
  id: 'g1-u10-l4',
  status: 'placeholder',
  objective: 'ვკითხულობ ნახატ დიაგრამას და ვამბობ, რომელ კატეგორიაშია მეტი, ნაკლები ან თანაბრად.',
  prerequisites: ['დათვლა 10-მდე', 'შედარება (U02)'],
  minutes: 10,
  concepts: ['ნახატი დიაგრამა', 'სიმბოლო', 'მეტი და ნაკლები', 'თანაბარი რაოდენობა'],
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'შესანიშნავია! ერთი სიმბოლო — ერთი საგანი. დათვალე სიმბოლოები და ყველაფერი გაირკვევა.',
    retry: 'სცადე ისევ. დათვალე სიმბოლოები თითოეულ რიგში.',
  },
  activities: [
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'რომელ რიგშია ყველაზე მეტი სიმბოლო?',
      visual: { type: 'chart', ...chart },
      mascot: { intro: 'დიაგრამაში თითო სიმბოლო ერთ საგანს ნიშნავს.' },
      response: {
        type: 'choice',
        options: [
          { id: 'ატამი', text: 'ატამი' },
          { id: 'ვაშლი', text: 'ვაშლი' },
          { id: 'მსხალი', text: 'მსხალი' },
        ],
        answer: 'ატამი',
      },
      hints: ['დათვალე სიმბოლოები სამივე რიგში.'],
      explanation: 'ატამი — 5, ვაშლი — 4, მსხალი — 2. ყველაზე მეტი ატამშია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე თითოეული რიგი.',
      revealOnExhaust: false,
    },
    {
      id: 'explore',
      kind: 'explore',
      stage: 'explore',
      title: 'დიაგრამის აწყობა',
      prompt: 'დაამატე სიმბოლოები და დააკვირდი, როგორ იცვლება რიცხვები. სცადე, რომ ორი რიგი თანაბარი გახადო.',
      hints: ['თითო დაწკაპუნება ერთ სიმბოლოს ამატებს.', 'როცა ორ რიგში ერთი და იგივე რაოდენობაა, ისინი თანაბარია.'],
      tool: { tool: 'chart-lab', glyph: 'star', labels: ['ვაშლი', 'მსხალი', 'ატამი'], target: [3, 3, 1] },
    },
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'როგორ იკითხება ნახატი დიაგრამა',
      prompt: 'ვნახოთ, როგორ იზრდება დიაგრამა სიმბოლო-სიმბოლო და როგორ იკითხება.',
      blocks: [
        { type: 'text', text: 'ნახატ დიაგრამაში თითოეული სიმბოლო ერთ საგანს ნიშნავს. სამი სიმბოლო — სამი საგანი.' },
        {
          type: 'chart-demo',
          glyph: 'star',
          rows: [
            { label: 'ვაშლი', count: 4 },
            { label: 'მსხალი', count: 2 },
            { label: 'ატამი', count: 5 },
          ],
          steps: [
            'დიაგრამა ცარიელია — არც ერთი სიმბოლო.',
            'ვაშლის რიგში ჩნდება პირველი სიმბოლოები.',
            'ყოველ რიგში სიმბოლოები მატულობს.',
            'ბოლოს ვკითხულობთ: ვაშლი 4, მსხალი 2, ატამი 5.',
          ],
          caption: 'რიცხვი ყოველთვის სიმბოლოების რაოდენობაა, არა მწერალი ციფრი.',
        },
        { type: 'callout', tone: 'tip', text: 'შედარებისას ჯერ დაითვალე ორივე რიგი, მერე თქვი: მეტი, ნაკლები თუ თანაბარი.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ რიგშია ყველაზე ნაკლები?',
      response: { type: 'chart-read', chart, ask: 'least' },
      hints: ['დათვალე სამივე რიგი.'],
      explanation: 'მსხალი — 2, ეს ყველაზე ნაკლებია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე სიმბოლოები.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'რომელ რიგშია მეტი, ვიდრე ვაშლი?',
      response: { type: 'chart-read', chart, ask: 'more', compareWith: 'ვაშლი' },
      hints: ['ვაშლი 4-ია. იპოვე რიგი, სადაც 4-ზე მეტია.'],
      explanation: 'ატამი 5-ია — ეს ვაშლზე მეტია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე ვაშლს.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'სათამაშოების დიაგრამაში რომელი ორი რიგია თანაბარი?',
      visual: { type: 'chart', ...toyChart },
      response: {
        type: 'choice',
        options: [
          { id: 'ball-cube', text: 'ბურთი და კუბიკი' },
          { id: 'ball-doll', text: 'ბურთი და თოჯინა' },
          { id: 'none', text: 'არც ერთი' },
        ],
        answer: 'ball-cube',
      },
      hints: ['დათვალე და შეადარე სამივე რიგი.'],
      explanation: 'ბურთი 3, კუბიკი 3 — თანაბარია. თოჯინა 1-ია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. იპოვე ორი ერთნაირი რიცხვი.',
    },
    {
      id: 'practice-4',
      kind: 'question',
      stage: 'practice',
      prompt: 'ააწყვე დიაგრამა: ვაშლი 3, მსხალი 2, ატამი 4.',
      response: { type: 'chart-build', glyph: 'star', labels: ['ვაშლი', 'მსხალი', 'ატამი'], target: [3, 2, 4] },
      hints: ['თითო რიგისთვის საჭირო რაოდენობა დააწკაპუნე + 1-ით.'],
      explanation: '3, 2 და 4 სიმბოლო — ზუსტად ის, რაც მოთხოვნილი იყო.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაითვალე თითოეული რიგი.',
    },
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელ რიგშია ყველაზე მეტი?',
      response: { type: 'chart-read', chart, ask: 'most' },
      hints: [],
      explanation: 'ატამი — 5, ეს ყველაზე მეტია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დათვალე სამივე რიგი.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'რომელ რიგშია მეტი, ვიდრე მსხალი?',
      response: { type: 'chart-read', chart, ask: 'more', compareWith: 'მსხალი' },
      hints: [],
      explanation: 'მსხალი 2-ია; ვაშლი 4 და ატამი 5 მეტია.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეადარე მსხალს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'ააწყვე დიაგრამა: ბურთი 2, კუბიკი 4, თოჯინა 3.',
      response: { type: 'chart-build', glyph: 'ball', labels: ['ბურთი', 'კუბიკი', 'თოჯინა'], target: [2, 4, 3] },
      hints: [],
      explanation: '2, 4 და 3 სიმბოლო — ზუსტად მოთხოვნილი რაოდენობები.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე თითოეული რიგი.',
    },
  ],
};
