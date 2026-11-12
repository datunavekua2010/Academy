# U07 — the 50 reference questions, mapped to templates

Reference: *U07: გამოკლება* — 50 questions over U07.1–U07.12, each with three
levels.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

**Current state: 57 templates.**

```
ra-aris-Gamokleba        6    uknobi-ricxvi                  4
SuratiT-10-gamokleba     6    martalia-tu-ara-gamokleba      3
teqsti-gamokleba         6    gamoakeli-raodenoba            3
xazze-gamokleba          6    ramdenit-naklebi               3
nuli-taviT-gamokleba     6    Cevrebi-arCevani               3
cxrili-20-gamokleba      6    gamokleba-cxrili-Sevseba       5
```

## The shape the curriculum is authored to

1. Every task is answered by **multiple choice, a typed number, or a drag-and-
   drop ordering** — nothing is marked by hand.
2. Every subtopic has **three question types**, and a session walks through them
   as the score rises: type 1 up to 30 points, type 2 up to 60, then the third
   type. The level is re-read from the score on every refill, so it also steps
   back down if the score falls.
3. The app asks **level-aware** batches, so each level must carry a whole
   session *by itself* — examined under "Capacity".

## The rules this unit could not be built without

### A difference never goes negative — by construction, not by rejection

Spec rule 3. The second number is always drawn from what is left of the first,
so `a − b ≥ 0` holds on every draw and the generator never has to throw a valid
question away:

```ts
a: { kind: 'int', min: 5, max: 20 },
b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
```

Drawing `a` and `b` independently and rejecting `b > a` would have thrown away
roughly half of all attempts — and, on the narrow ranges (`nuli-taviT`, 1–12),
most of them.

### The unknown is solved from the equation, never stored

Spec rule 5. `8 − __ = 5` is answered `8 − 5`, `__ − 6 = 9` is answered `9 + 6`,
and `difference 14, minuend 35 → 21` is answered `35 − 14`. The template never
keeps a separate "intended answer"; it prints two numbers and computes the third,
so the printed numbers and the key cannot disagree.

### The picture must not print the answer

The first draft of the number line marked the destination with a `?` — which
*is* the answer, so the question was free. The line now runs from the unknown
start to the last printed tick, and the `?` sits on a tick that is not the
answer. The same bug appeared twice more: the subtraction-table cell printed
`11 − 5 = ?` above the question, and the diagonal printed `10 − 10 = 0` beside
it. Both now draw a cell, not an equation.

### An ordering key must vary

With two tiles, "which is the minuend" has exactly one legal scramble, so the
key was always `2,1` — a child could tap the same tile every time. U07.11
therefore sorts **three** tiles by size (largest first, which is what the roles
mean given rule 3), and the generator's `direction: 'desc'` check rejects a
scramble that would already be the answer. Role-assignment over three numbers
was tried and abandoned: `{7, 4, 3}` is both `7 − 4 = 3` and `7 − 3 = 4`, so
"which is the subtrahend" has no single right answer.

### Georgian case endings are stored, never appended

`{who}ს` produces `დავითი-ს`, and `{who}მ` produces `მარიამიმ`. Every name
carries its dative beside its nominative, and `აქვს` takes the dative on **both**
sides: `დავითს აქვს 35 სტიკერი, ნინოს — 18.` A noun after a count stays in the
nominative (`10 ვაშლი`), and a genitive is only used where the sentence needs
one — which U07 never does, because it never prints `…ისა და კიდევ …ის
გაერთიანება` (that is U06's shape).

## Item map

| Reference | Template(s) |
|---|---|
| Q1 basket 7 − 2 | `1-basket` |
| Q2 choose the operation (6 − 3) | `1-which-operation` |
| Q3 name the minuend of 9 − 4 = 5 | `1-name-minuend` |
| Q4 name the difference of 12 − 5 = 7 | `1-name-difference` |
| Q5 name all three terms | `1-name-all-terms` |
| Q6 which expression has difference 4 | `1-which-difference` |
| Q7–Q10 picture subtraction | `2-balls`, `2-birds`, `2-stars`, `2-cubes` |
| Q11 hidden objects (10 total, 6 visible → 4) | `2-hidden` |
| Q12 8 flowers, how many removed to leave 3 → 5 | `2-remove-to` |
| Q13–Q18 word problems, incl. 25 − 7, 32 − 14, 46 − 19 | `3-pencils`, `3-cakes`, `3-shop`, `3-books`, `3-stickers`, `3-bus` |
| Q19–Q23 leftward steps on the line | `4-walk-small`, `4-walk-small-two`, `4-walk-teen`, `4-walk-twenties`, `4-walk-large` |
| Q24 12 steps left, ends at 35 → 47 | `4-walk-back` |
| Q25–Q26 `a − 0 = a`, `a − a = 0` | `5-minus-zero`, `5-minus-itself` |
| Q27 share 10 between 2 | `5-share` |
| Q28 zero from a large number | `5-zero-large` |
| Q29 halve 16 | `5-halve` |
| Q30 `__ − 9 = 0` | `5-zero-result` |
| Q31–Q33 differences to twenty | `6-small`, `6-across-ten`, `6-large-subtrahend` |
| Q34 20 − 7 = 13 | `6-from-twenty` |
| Q35 `18 − __ = 6` | `6-missing-subtrahend` |
| Q36 table: minuend 19, subtrahend 8 → 11 | `6-table` |
| Q37 `8 − __ = 5` | `7-missing-small` |
| Q38 `__ − 6 = 9` (= 15) | `7-missing-whole` |
| Q39 `20 − __ = 12` | `7-missing-mid` |
| Q40 difference 14, minuend 35 → 21 | `7-missing-word` |
| Q41–Q45 true/false | `8-true-small`, `8-true-mid`, `8-true-large` |
| Q46 which expression = 5 | `9-which-expression` |
| Q47 `14 − __ = 6` (= 8) | `9-missing` |
| Q48 select all with difference 7 | `9-which-expression-large` (recast) |
| Q49 8 vs 5 → 3 | `10-plates` |
| Q50 24 vs 16 → 8 | `10-boxes` |
| U07.11 drag and drop | `11-arrange-small`, `11-which-subtrahend`, `11-arrange-teen` |
| U07.12 fill the table | `12-table-cell`, `12-table-missing-col`, `12-table-row`, `12-table-two-cells`, `12-table-diagonal` |

## Multi-answer recasts

| Reference asks for | Recast as | Template |
|---|---|---|
| name all three terms (Q5) | one ordered answer `a, b, c` | `1-name-all-terms` |
| which expressions have difference 4 (Q6) | one expression that does | `1-which-difference` |
| select every expression with difference 7 (Q48) | choose the one expression | `9-which-expression-large` |
| drag the terms into their roles (U07.11) | sort three tiles largest-first | `11-arrange-*` |

The reasoning is unchanged in every case; only the number of marks on the page
changes. This is the same recasting U04, U05 and U06 do, and it is recorded
rather than hidden because a reviewer should be able to see exactly what was
traded. The one place a recast was **refused** is U07.11: assigning the three
roles is genuinely ambiguous (`7 − 4 = 3` and `7 − 3 = 4` are both true for the
same three numbers), so the drag item asks for the ordering those roles imply
rather than pretending the ambiguity is not there.

## Capacity

Distinct questions per level, 600 seeds per template, 0 generation errors:

| subtopic | level 1 | level 2 | level 3 |
|---|---|---|---|
| ra-aris-Gamokleba | 368 | 147 | 120 |
| SuratiT-10-gamokleba | 89 | 84 | 588 |
| teqsti-gamokleba | 318 | 123 | 632 |
| xazze-gamokleba | 63 | 122 | 618 |
| nuli-taviT-gamokleba | 233 | 124 | 40 |
| cxrili-20-gamokleba | 157 | 50 | 135 |
| uknobi-ricxvi | 49 | 113 | 171 |
| martalia-tu-ara-gamokleba | 121 | 188 | 464 |
| gamoakeli-raodenoba | 449 | 72 | 416 |
| ramdenit-naklebi | 99 | 413 | 594 |
| Cevrebi-arCevani | 365 | 64 | 349 |
| gamokleba-cxrili-Sevseba | 175 | 105 | 403 |

Every level clears 35 — the threshold a session needs — with the tightest cell
(`nuli-taviT-gamokleba` level 3, at 40) still just over a session. A perfect run
was also played through all twelve subtopics with the real ladder: every one
reaches 100 in 35 questions.

## What the tests check that a type checker cannot

`tests/u07-templates.test.ts` re-derives every answer from the printed prompt,
and additionally asserts:

- no negative difference, on any template, at any level (rule 3);
- the picture draws exactly the objects the prompt names (rule 4), and the
  number line never draws the answer as a bare tick;
- every true/false template produces both answers over its seeds — 578 true /
  622 false across 400 seeds per template (rule 6);
- every ordering key is a real permutation of the positions and varies between
  draws, so it cannot be tapped blind;
- every name before `აქვს` is a stored dative, and no word carries
  a hyphenated case ending;
- every question's key is one of the options it actually offers, with no
  duplicate options.
