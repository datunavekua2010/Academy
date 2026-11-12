# U08 — the 50 reference questions, mapped to templates

Reference: *U08: ათეულები და ორნიშნა რიცხვები* — 50 questions over U08.1–U08.9,
each with three levels.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

**Current state: 46 templates.**

```
ateulebi-ateulebi        5    aszeulSi               6
ateulebis-gamokleba      5    Sedareba-10Tan         5
orcifra-ertcifra         5    ricxviTi-gamocanebi    4
gadajgufebiT             5
esveTis-chamowerTa       5    nulidan-9-mde          6
```

## The shape the curriculum is authored to

1. Every task is answered by **multiple choice or a typed number** — nothing is
   marked by hand.
2. Every subtopic has **three question types**, and a session walks through them
   as the score rises: type 1 up to 30 points, type 2 up to 60, then the third.
   The level is re-read from the score on every refill, so it also steps back
   down if the score falls.
3. The app asks **level-aware** batches, so each level must carry a whole
   session *by itself* — examined under "Capacity".

## The rules this unit could not be built without

### A printed number is the number, not its tens count

The first draft of U08.1, U08.2, U08.7 and U08.9 printed the **tens count** and
answered with the number:

```
შეავსე: 1 + 3 = __.        →  40
შეავსე: 17 + 4 = __.       →  57
გადაათრიე: 1 + __ = 6.     →  50
```

Every one of those is the same defect the comparison question had before it was
fixed: the sentence shows arithmetic that does not produce the key. The tens
count is therefore drawn (`at`, `bt`) and the printed number is *derived* from it:

```ts
at: { kind: 'int', min: 1, max: 9 },
a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
```

so the prompt says `20 + 30` and the answer is 50. This is checked in
`tests/u08-templates.test.ts` by re-deriving every answer from the prompt text,
not from the template's own answer function.

### The subtopic's rule is a constraint, not a proportion

U08.3 is *addition without regrouping* and U08.4 is *addition with it*. They
differ by one arithmetic fact — whether the ones digits carry:

```ts
const noCarry = (v) => (Number(v.a) % 10) + Number(v.b) < 10;   // U08.3
const carries = (v) => (Number(v.a) % 10) + Number(v.b) >= 10;  // U08.4
```

Both are `constraints`, so a draw that belongs to the neighbouring subtopic is
rejected rather than shipped. Drawn freely, `27 + 5` would appear under „without
regrouping“ about half the time, and the two subtopics would be the same
subtopic with different titles.

The tests assert the *consequence* as well as the rule: in U08.3 the tens digit
of the answer equals the tens digit of the first addend, and in U08.4 it is
exactly one more. That is what „carry“ means, and it catches a template whose
constraint is right but whose sum is not.

### Both sides of a comparison are evaluated

Rule 8 of the spec. „7 + 6 __ 20 − 7“ is decided by 13 against 13, never by the
shape of the expression.

The *sign* is drawn before the right-hand side is built, for the same reason the
answer in a multiple-choice question is placed rather than hoped for: left to
chance, `>` came up 69% of the time, `<` 24% and `=` under 8%, so a child
answering „greater“ every time would have been right two times in three. Drawing
the sign gives `<` 122, `=` 141, `>` 137 over 400 seeds.

### One puzzle, one answer

Rule 9. The blank's value is drawn first and the equation is built around it, so
no second number closes the sentence. The options are that answer plus numbers
that are wrong *for a reason*: one ten out, the other printed number, and the
value the sentence would need if the operation were the other way round.

## Item map

| Reference | Template(s) |
|---|---|
| Q1 20 + 30, Q2 40 + 10 | `1-tens-small` |
| Q3 30 + 50 | `1-tens-mid` |
| Q4 20 + __ = 70 | `1-missing-addend` |
| Q5 10 + 30 + 40 | `1-three-tens` |
| Q6 red + blue cubes, 20 more | `1-boxes` |
| Q7 70 − 20, Q8 90 − 40 | `2-tens-small` |
| Q9 80 − 30 | `2-tens-mid` |
| Q10 100 − __ = 60 | `2-missing-subtrahend` |
| Q11 90 − 20 − 30 | `2-two-subtractions` |
| Q12 80 books, 30 then 20 | `2-library` |
| Q13 23 + 4, Q14 41 + 6 | `3-add-small` |
| Q15 52 + 7 | `3-add-mid` |
| Q16 34 + __ = 39 | `3-missing-ones` |
| Q17 61 + 8 | `3-add-large` |
| Q18 42 cubes plus 5 | `3-box` |
| Q19 27 + 5, Q20 36 + 8 | `4-carry-small` |
| Q21 48 + 7 | `4-carry-mid` |
| Q22 59 + 6 | `4-carry-near-ten` |
| Q23 67 + 8 | `4-carry-large` |
| Q24 38 stickers plus 7 | `4-stickers` |
| Q25 46 − 3, Q26 58 − 6 | `5-within-ten` |
| Q27 72 − 5 | `5-break-ten` |
| Q28 61 − 8 | `5-break-ten-mid` |
| Q29 83 − 7, set down in columns | `5-columns` |
| Q30 54 cubes, 8 taken | `5-box` |
| Q31 35 − 0 | `6-zero` |
| Q32 49 − 9 | `6-to-ten` |
| Q33 62 − 4 | `6-mid` |
| Q34 71 − 6 | `6-mid-large` |
| Q35 90 − 7 | `6-from-ten` |
| Q36 __ − 8 = 47 | `6-missing-minuend` |
| Q37 25 + 10 | `7-plus-ten` |
| Q38 68 − 20 | `7-minus-ten` |
| Q39 37 + 20 | `7-plus-twenty` |
| Q40 84 − 30 | `7-minus-thirty` |
| Q41 26 + 30 − 10 | `7-two-steps` |
| Q42 95 exercise books, 20 then 10 | `7-shop` |
| Q43 4 + 3 and 10 | `8-sum-to-ten` |
| Q44 8 + 5 and 10 | `8-sum-past-ten` |
| Q45 17 − 7 and 10 | `8-difference-equals` |
| Q46 16 − 4 and 10 | `8-difference-past` |
| Q47 7 + 6 __ 20 − 7 | `8-two-sides` |
| Q48 drag 20 + __ = 50 | `9-drag-tens` |
| Q49 place __ + 7 = 42 | `9-drag-minuend` |
| Q50 drag 35 + __ − 10 = 50 | `9-drag-two-steps` |

`9-box` is an extra level-1 shape („how many more to make 62?“) so that level 1
is not a single template.

## Recasts

Unlike U06 and U07, this unit's 50 questions are **all single-answer already** —
the spec names no multi-select and no drag-to-role item. Two things were still
adapted to what the engine grades:

| Reference asks for | Recast as | Template |
|---|---|---|
| Q48–Q50 „drag the number onto the gap“ | a four-way choice of whole tens, the same gesture with the tiles clicked instead of dragged | `9-drag-tens` |
| Q29 „the example set down in columns“ | the column layout is the `visual`, the answer is still typed | `5-columns` |

Both keep the reasoning and change only the input device, because the engine
grades one answer per question and has no free-form tile-placement mode.

## Capacity

Distinct questions per level, 600 seeds per template, 0 generation errors:

| subtopic | level 1 | level 2 | level 3 |
|---|---|---|---|
| ateulebi-ateulebi | 40 | 61 | 198 |
| ateulebis-gamokleba | 44 | 67 | 148 |
| orcifra-ertcifra | 78 | 252 | 466 |
| gadajgufebiT | 104 | 153 | 605 |
| esveTis-chamowerTa | 209 | 225 | 630 |
| nulidan-9-mde | 156 | 336 | 420 |
| aszeulSi | 330 | 337 | 710 |
| Sedareba-10Tan | 64 | 42 | 635 |
| ricxviTi-gamocanebi | 490 | 348 | 594 |

Every level clears 35 — the threshold a session needs — with the tightest cell
(`ateulebi-ateulebi` level 1, at 40) just over a session. The two tight ones are
tight for an honest reason: U08.1's level 1 is a sum of two whole tens under one
hundred, which is a genuinely small set, and U08.8's level 2 is a difference that
equals exactly ten. A perfect run was also played through all nine subtopics with
the real ladder: every one reaches 100 in 35 questions.

## What the tests check that a type checker cannot

`tests/u08-templates.test.ts` re-derives every answer from the printed prompt and
additionally asserts:

- no answer below zero and none above one hundred, on any template at any level;
- U08.3 never carries and U08.4 always does, measured on the tens digit of the
  result as well as on the ones digits of the addends;
- U08.1 and U08.2 print only whole tens;
- U08.6's subtrahend is a 0…9 number wherever the sentence puts it;
- U08.7's ones digit never moves, which is what adding a whole ten means;
- every comparison is decided by evaluating both sides, and all three signs occur;
- each puzzle is closed by its own answer and by no other;
- no prompt prints a single-digit sentence whose answer is ten times as large —
  the exact bug the first draft had.
