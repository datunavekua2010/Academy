import type { Lesson } from '../types';

/**
 * PLACEHOLDER lesson — Grade 6 · Topic 8 · U10.3 "Combining Like Terms Using Addition".
 *
 * This is demonstration content written to exercise the lesson system. It is
 * NOT an approved lesson. Replace it (and change `status`) when the real
 * lesson is supplied; the player needs no changes.
 *
 * Text is rich text: `$…$` marks inline maths.
 */
export const g6u10l3: Lesson = {
  id: 'g6-u10-l3',
  status: 'placeholder',
  objective: 'მსგავსი წევრების შეკრება: ვკრებთ კოეფიციენტებს, ცვლადი უცვლელი რჩება.',
  prerequisites: ['რა არის ცვლადი', 'რა არის კოეფიციენტი (U10.2)'],
  minutes: 9,
  completion: { minCheckCorrect: 2 },
  mascot: {
    complete: 'ეს წესი უკვე შენი ხდება. შემდეგ გაკვეთილზე გამოკლებას დავამატებთ.',
    retry: 'ცოტა გავიმეოროთ. პასუხამდე ყოველთვის შეხედე, ერთი და იგივე ცვლადია თუ არა.',
  },
  activities: [
    // 1 ─ Challenge
    {
      id: 'challenge',
      kind: 'question',
      stage: 'challenge',
      prompt: 'გაამარტივე გამოსახულება: $3x + 2x$',
      mascot: { intro: 'ერთი კითხვით დავიწყოთ. თუ ჯერ არ იცი, არაუშავს: სცადე და ერთად გავარკვევთ.' },
      response: { type: 'expression', answer: '5x', placeholder: 'ჩაწერე პასუხი' },
      maxAttempts: 2,
      revealOnExhaust: false,
      hints: [
        'შეხედე ორივე წევრს. რა აქვთ საერთო?',
        'წარმოიდგინე, რომ $x$ არის ერთი ყუთი. გაქვს 3 ყუთი და კიდევ 2 ყუთი.',
      ],
      explanation: 'კარგი დასაწყისია. ახლა გამოვიკვლიოთ, რატომ მუშაობს ეს წესი.',
      misconceptions: [
        {
          id: 'square-variable',
          answers: ['5x^2'],
          feedback: 'ორივე წევრში ცვლადი ერთი და იგივეა: $x$. შეკრებისას იცვლება $x$-ების რაოდენობა, ხოლო თვით ცვლადი რჩება $x$ და არ ხდება $x^2$.',
        },
        {
          id: 'multiplied',
          answers: ['6x'],
          feedback: '$6$ მიიღება, თუ $3$-სა და $2$-ს გადავამრავლებთ. აქ კი წევრებს ვაერთიანებთ, ანუ ვკრებთ.',
        },
        {
          id: 'dropped-variable',
          answers: ['5'],
          feedback: 'რიცხვი სწორია, მაგრამ $x$ დაკარგე. ჩვენ ვითვლით $x$-ებს და $x$ პასუხშიც უნდა დარჩეს.',
        },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. დაფიქრდი, რას ითვლიან აქ: რამდენი $x$ გვაქვს სულ?',
    },

    // 2 ─ Explore (interactive algebra tiles)
    {
      id: 'explore-tiles',
      kind: 'tiles',
      stage: 'explore',
      title: 'ალგებრული ფილები',
      prompt: 'ერთი ფერის ფილები $3x$-ია, მეორე ფერის — $2x$. შეეხე ფილებს, რომ ყველა ერთ ჯგუფში გადავიდეს.',
      askPrompt: 'რამდენი $x$-ია ახლა ერთ ჯგუფში?',
      mascot: { discovery: 'ეს შენ აღმოაჩინე: სამი $x$ და ორი $x$ ერთად ხუთი $x$-ია.' },
      tiles: [
        { label: 'x', count: 3, tone: 'blue' },
        { label: 'x', count: 2, tone: 'yellow' },
      ],
      response: { type: 'numeric', answer: 5 },
      hints: ['ჯგუფში ყველა ფილას ერთი და იგივე ნიშანი აქვს. დათვალე, რამდენია სულ.'],
      explanation: 'ერთ ჯგუფში ხუთი $x$-ის ფილაა. ეს ნიშნავს: $3x + 2x = 5x$.',
      misconceptions: [
        {
          id: 'multiplied',
          answers: [6],
          feedback: '$6$ ფილა არ გვაქვს. დათვალე ფილები ჯგუფში სათითაოდ, ისინი ერთმანეთს ემატება და არ მრავლდება.',
        },
      ],
      fallbackFeedback: 'დათვალე ფილები ჯგუფში სათითაოდ.',
    },

    // 3 ─ Understand
    {
      id: 'understand',
      kind: 'explain',
      stage: 'understand',
      title: 'რატომ მუშაობს ეს?',
      prompt: 'ერთი და იგივე ცვლადის მქონე წევრები შეგვიძლია ერთ წევრად გავაერთიანოთ.',
      blocks: [
        { type: 'equation', lines: ['3x + 2x', '= (3 + 2)x', '= 5x'], caption: 'ვკრებთ კოეფიციენტებს, ცვლადი უცვლელი რჩება.' },
        {
          type: 'text',
          text: '$3x$ ნიშნავს „სამ $x$-ს“, ხოლო $2x$ — „ორ $x$-ს“. როცა მათ ვაერთიანებთ, გვაქვს ხუთი $x$. ზუსტად ისევე, როგორც 3 ვაშლს და 2 ვაშლს ვაერთიანებთ და ვიღებთ 5 ვაშლს.',
        },
        {
          type: 'worked',
          title: 'კიდევ ერთი მაგალითი: $7a + 4a$',
          steps: [
            { text: 'ორივე წევრში ცვლადი ერთია: $a$. ესენი მსგავსი წევრებია.' },
            { text: 'ვკრებთ კოეფიციენტებს.', math: '7a + 4a = (7 + 4)a' },
            { text: 'ცვლადი უცვლელი რჩება.', math: '= 11a' },
          ],
        },
        { type: 'callout', tone: 'warning', text: 'ცვლადი არ იკრიბება და არ იცვლება: $3x + 2x$ არ არის $5x^2$.' },
      ],
    },

    // 4 ─ Guided practice
    {
      id: 'practice-1',
      kind: 'question',
      stage: 'practice',
      prompt: 'გაამარტივე გამოსახულება: $6y + 2y$',
      mascot: { intro: 'ახლა შენი ჯერია. თუ გაგიჭირდა, მინიშნება გვერდით არის.' },
      response: { type: 'expression', answer: '8y', placeholder: 'ჩაწერე პასუხი' },
      hints: [
        'შეხედე ცვლადს ორივე წევრში. ერთი და იგივეა?',
        'თუ ცვლადი ერთია, შეკრიბე მხოლოდ რიცხვები მის წინ.',
      ],
      explanation: 'ცვლადი ორივე წევრში $y$-ია, ამიტომ ვკრებთ კოეფიციენტებს: $6 + 2 = 8$. ე.ი. $6y + 2y = 8y$.',
      misconceptions: [
        {
          id: 'square-variable',
          answers: ['8y^2'],
          feedback: 'რიცხვი სწორია. მაგრამ ცვლადი ორივე წევრში $y$-ია და ის რჩება $y$. კვადრატი იქ ჩნდება, სადაც ვამრავლებთ და არა ვკრებთ.',
        },
        {
          id: 'multiplied',
          answers: ['12y'],
          feedback: '$12$ ნამრავლია: $6 \\cdot 2$. ჩვენ კი წევრებს ვკრებთ, ამიტომ კოეფიციენტებსაც ვკრებთ.',
        },
        {
          id: 'dropped-variable',
          answers: ['8'],
          feedback: 'რიცხვი სწორია, მაგრამ ცვლადი $y$ პასუხიდან გამოგრჩა. ის უნდა დარჩეს.',
        },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეამოწმე: შეკრიბე მხოლოდ კოეფიციენტები და ცვლადი დატოვე.',
    },
    {
      id: 'practice-2',
      kind: 'question',
      stage: 'practice',
      prompt: 'ჩაწერე გამოტოვებული რიცხვი.',
      response: { type: 'blanks', template: '$4a +$ {1}$a = 9a$', answers: [5] },
      hints: ['ცვლადი უკვე ორივე მხარეს $a$-ა. იკითხე: $4$-ს რა უნდა დავუმატო, რომ $9$ მივიღო?'],
      explanation: 'კოეფიციენტები უნდა შეკრიბო $9$-მდე: $4 + 5 = 9$. ამიტომ $4a + 5a = 9a$.',
      fallbackFeedback: 'ჯერ არ არის ზუსტი. კოეფიციენტების ჯამი $9$ უნდა გამოვიდეს.',
    },
    {
      id: 'practice-3',
      kind: 'question',
      stage: 'practice',
      prompt: 'ცოტა უფრო რთულია. გაამარტივე: $9m + m$',
      response: { type: 'expression', answer: '10m', placeholder: 'ჩაწერე პასუხი' },
      hints: [
        'ცვლადი $m$-ის წინ რიცხვი არ წერია. რომელი რიცხვი იგულისხმება?',
        '$m$ და $1m$ ერთი და იგივეა.',
      ],
      explanation: '$m$ ნიშნავს $1m$, ამიტომ $9m + 1m = (9 + 1)m = 10m$.',
      misconceptions: [
        {
          id: 'invisible-one',
          answers: ['9m'],
          feedback: 'ცალკე $m$ არ გაქრება. მის წინ უხილავი $1$ დგას: $m = 1m$. ისიც უნდა დაითვალო.',
        },
        {
          id: 'square-variable',
          answers: ['10m^2', '9m^2'],
          feedback: 'ცვლადი ორივე წევრში $m$-ია და რჩება $m$. კვადრატი ვერ ჩნდება შეკრებისას.',
        },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. გაიხსენე: ცალკე $m$-ის კოეფიციენტი რამდენია?',
    },

    // 5 ─ Independent check
    {
      id: 'check-1',
      kind: 'question',
      stage: 'check',
      prompt: 'გაამარტივე გამოსახულება: $5k + 8k$',
      response: { type: 'expression', answer: '13k', placeholder: 'ჩაწერე პასუხი' },
      hints: ['ორივე წევრში ერთი და იგივე ცვლადია. რა უნდა გავაკეთოთ კოეფიციენტებით?'],
      explanation: '$5k + 8k = (5 + 8)k = 13k$.',
      misconceptions: [
        { id: 'square-variable', answers: ['13k^2'], feedback: 'ცვლადი რჩება $k$. კვადრატი ამ შემთხვევაში არ ჩნდება.' },
        { id: 'multiplied', answers: ['40k'], feedback: '$40$ ნამრავლია. აქ კი წევრებს ვკრებთ.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეკრიბე კოეფიციენტები, ცვლადი დატოვე.',
    },
    {
      id: 'check-2',
      kind: 'question',
      stage: 'check',
      prompt: 'გიორგიმ დაწერა: $4x + 3x = 7x^2$. რატომ არის ეს არასწორი?',
      response: {
        type: 'choice',
        answer: 'right',
        options: [
          { id: 'multiply', text: 'წევრები უნდა გადავამრავლოთ, ამიტომ პასუხია $12x$.' },
          { id: 'right', text: 'ცვლადი ორივე წევრში $x$-ია და $x$ რჩება. იკრიბება მხოლოდ კოეფიციენტები, ამიტომ პასუხია $7x$.' },
          { id: 'fine', text: 'ეს არასწორი არ არის. $7x^2$ სწორი პასუხია.' },
          { id: 'drop', text: 'ცვლადი ქრება, ამიტომ პასუხი მხოლოდ $7$-ია.' },
        ],
      },
      hints: ['იკითხე: რას აკეთებს შეკრება $x$-ებთან — ცვლის მათ თუ ითვლის?'],
      explanation: 'შეკრებისას ვითვლით, რამდენი $x$ გვაქვს. ცვლადი უცვლელი რჩება, ამიტომ $4x + 3x = 7x$.',
      misconceptions: [
        { id: 'multiplied', answers: ['multiply'], feedback: 'გამრავლება აქ არ გვჭირდება: წევრებს ვაერთიანებთ, ანუ ვკრებთ.' },
        { id: 'square-variable', answers: ['fine'], feedback: '$x^2$ ნიშნავს $x \\cdot x$. შეკრებისას ასეთი ნამრავლი არ ჩნდება: ორივე წევრი უბრალოდ $x$-ებს ითვლის.' },
        { id: 'dropped-variable', answers: ['drop'], feedback: 'ცვლადი არ ქრება: პასუხშიც ვაითვლით $x$-ებს, ამიტომ $x$ უნდა დარჩეს.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. წაიკითხე ყველა ვარიანტი და შეადარე მათ წესს.',
    },
    {
      id: 'check-3',
      kind: 'question',
      stage: 'check',
      prompt: 'გაამარტივე გამოსახულება: $7n + n + 2n$',
      response: { type: 'expression', answer: '10n', placeholder: 'ჩაწერე პასუხი' },
      hints: ['სამივე წევრში ცვლადი ერთია. გაიხსენე, რა კოეფიციენტი აქვს ცალკე $n$-ს.'],
      explanation: '$n = 1n$, ამიტომ $7n + 1n + 2n = (7 + 1 + 2)n = 10n$.',
      misconceptions: [
        { id: 'invisible-one', answers: ['9n'], feedback: 'ცალკე $n$ ერთ $n$-ს ნიშნავს, ანუ კოეფიციენტი $1$. ის დაგრჩა დაუთვლელი.' },
        { id: 'square-variable', answers: ['10n^2', '9n^2'], feedback: 'ცვლადი რჩება $n$. კვადრატი შეკრებისას არ ჩნდება.' },
      ],
      fallbackFeedback: 'ჯერ არ არის ზუსტი. შეკრიბე სამივე კოეფიციენტი, ცალკე $n$-ისაც.',
    },
  ],
};
