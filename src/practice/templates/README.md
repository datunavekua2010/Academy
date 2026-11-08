# Question templates

Every question in Axiom Academy is **generated**, not stored. There is no question
bank. A *template* is a pattern; the engine turns it into an unlimited number of
different, mathematically valid questions.

```
template  ──generate(seed)──►  question (prompt, 4 options, answer, explanation)
```

## Why templates

- One template replaces hundreds of hand-written questions.
- The answer is **recomputed** from the numbers that were drawn, every time.
- Numbers are constrained, so a template can never produce a division by zero,
  a negative result where one makes no sense, or an unwanted fraction.
- Every question is reproducible from its id (`templateId~seed`), so a saved
  session survives a page reload.

## Adding a template

Create a file (e.g. `src/practice/templates/geometry.ts`) and export templates
made with `defineTemplate`:

```ts
import { defineTemplate } from './types';

export const GEOMETRY_TEMPLATES = [
  defineTemplate({
    id: 'g5-perimeter-square',      // unique, stable
    grade: 5,
    topicId: 'perimetri',           // must exist in curriculum.ts
    subtopicId: 'perim',

    prompt: 'კვადრატის გვერდია {a} სმ. იპოვე პერიმეტრი.',

    variables: {
      a: { kind: 'int', min: 2, max: 20 },
    },

    answer: (v) => 4 * Number(v.a),                 // recomputed, never constant
    format: { kind: 'integer', min: 0, format: (n) => `${n} სმ` },

    explanation: ({ vars, answer }) => `P = 4 × ${vars.a} = ${answer}.`,

    distractors: ({ answer }) => [Number(answer) / 2, Number(answer) + 4, Number(answer) - 4],
  }),
];
```

Then register it in `src/practice/templates/catalog.ts`:

```ts
import { GEOMETRY_TEMPLATES } from './geometry';

export const TEMPLATE_REGISTRY = createTemplateRegistry([
  ...SAMPLE_TEMPLATES,
  ...COVERAGE_TEMPLATES,
  ...GEOMETRY_TEMPLATES,
]);
```

Nothing else changes: the practice page, session engine, scoring, progress and
homework all read from the registry.

## The template fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique and stable. Used in question ids and saved sessions. |
| `grade`, `topicId`, `subtopicId` | yes | Curriculum address; must match `curriculum.ts`. |
| `prompt` | yes | Georgian wording with `{placeholders}`. |
| `hint` | no | Georgian instruction shown above the prompt. |
| `variables` | yes | The numbers/text that vary. |
| `constraints` | no | Whole-set rules; a draw is retried until they all hold. |
| `answer` | yes | Function computing the answer from the drawn values. |
| `format` | no | Answer kind (`integer` / `decimal` / `text`), bounds, display formatting. |
| `distractors` | no | Builds the wrong options; a numeric default is used otherwise. |
| `explanation` | yes | Georgian worked solution shown after answering. |
| `difficulty` | no | 1–3, defaults to 1. |

### Variables

```ts
{ kind: 'int', min: 2, max: 9 }                 // integer in [2, 9]
{ kind: 'int', min: 2, max: 9, step: 5 }        // 2, 7, … multiples of step
{ kind: 'int', min: 1, max: 9, nonZero: true }  // never 0 — use for divisors
{ kind: 'int', min: (v) => v.b, max: 20 }       // bound may depend on earlier draws
{ kind: 'choice', values: ['+', '−'] }          // fixed pool
```

Later variables can depend on earlier ones. Declaration order is draw order.

### Making a division exact

Draw the divisor and quotient first, then build the dividend from them:

```ts
variables: {
  b: { kind: 'int', min: 2, max: 9 },
  q: { kind: 'int', min: 2, max: 9 },
  a: { kind: 'int', min: (v) => Number(v.b) * Number(v.q),
                  max: (v) => Number(v.b) * Number(v.q) },
},
answer: (v) => Number(v.a) / Number(v.b),   // always a whole number
```

### Constraints

```ts
constraints: [
  { test: (v) => Number(v.a) + Number(v.b) < 180, note: 'დარჩენილი კუთხე დადებითი იყოს' },
],
```

`note` is for diagnostics only. If a draw fails, the generator retries with the
next values from the same seed; after 200 failures the template is reported as
broken rather than shipped.

### Answers and options

- `format.kind: 'integer'` rejects fractional answers — a template that can draw
  them fails loudly in the test suite instead of showing a wrong question.
- `format.kind: 'decimal'` rounds to `format.decimals` (default 2).
- `format.kind: 'text'` is for fractions (`"3/4"`), units and category answers.
- The correct answer is placed in a **random** position each time.
- Options are always distinct; a template that cannot produce 4 distinct options
  fails in tests.

## Testing templates

`npm test` already runs every catalog template:

- 40 variations per template, checking the prompt renders, options are distinct,
  the answer is present, and no question repeats;
- determinism (same seed → same question);
- curriculum coverage (every subtopic has a template);
- per-template algebra checks in `tests/generator.test.ts` for the answer
  formulas (e.g. `a × b` really equals the reported answer).

When you add a template with a new answer formula, add one line to
`tests/generator.test.ts` recomputing the answer independently.

## Replacing the sample templates

`catalog.ts` currently contains two example sets:

- `SAMPLE_TEMPLATES` — one per generator capability;
- `COVERAGE_TEMPLATES` — one compact pattern per remaining subtopic so every
  grade is playable today.

Delete either array from the registry once the academy's templates are supplied.
A subtopic with no template stays visible in the curriculum but shows
"შაბლონი ჯერ არ არის დამატებული" instead of breaking the page.
