# U06 — the 50 reference questions, mapped to templates

Reference: *U06: შეკრება* — 50 questions over U06.1–U06.12, each with three
levels.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

**Current state: 60 templates.**

```
ra-aris-Sekreba          6    uknobi-SeSveTi          4
SuratiT-10               6    martalia-tu-ara         3
teqsti                   6    raodenobis-gzebi        4
ricxviT-xazze            6    samive-ze-meti          3
nuli-gakvireba           6    SeSveTebis-arCevani     3
cxrili-20                7    Sekreba-cxrili-Sevseba  4
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

### A sum stays inside its subtopic's range by construction

U06.2's sums stay within ten and U06.6's within twenty. Rather than draw freely
and reject most attempts, the second addend is **derived** from what is left of
the range:

```ts
b: { kind: 'int', min: 1, max: (v) => 10 - Number(v.a) }
```

So every draw is already valid and no attempt is wasted. Where a range is a fact
about the answer rather than about an addend (U06.6's totals), the total is a
derived `choice` variable equal to the sum, and a constraint asserts the range.

### The missing addend is computed, never stored

`missing = total − known`, in one factory used by both U06.6 and U06.7. The total
is itself derived from the two addends, so the printed equation is true by
construction and the answer cannot disagree with it.

### True/false is decided by arithmetic, and both answers must occur

Each draw picks `truth ∈ {true, false}` and, when false, a **near miss** (off by
one or two, never by ten) so the claim is plausible and a child who computes gets
it right. Measured over 600 draws of the level-1 template: **302 მართალია, 298
მცდარია**.

### Georgian declines a name before „აქვს“ with the dative

„**დავითს** აქვს 5 ფანქარი“ — not „დავითის აქვს“. The genitive is the possessive
form and belongs in „დავითის ფანქარი“, which this unit never prints. The endings
are irregular (მარიამი → მარიამს, ანა → ანას by dropping its final vowel), so both
the name and its declined form are stored and nothing is glued on at generation
time. **The same bug existed in U05 and is fixed there too.**

Nouns follow the same rule: Georgian takes the singular after a numeral
(„5 ვაშლი“), and a noun's other cases are not built by appending an ending
(მსხალი → მსხლის, not მსხალიის), so each stored object carries only the forms its
sentences need.

---

## U06.1 — რას ნიშნავს შეკრება?

| Reference | Template |
|---|---|
| Q1 (two plates of apples) | `1-two-plates` — drawn |
| Q2 (which expression matches the union) | `1-which-expression` — 3 expressions |
| Q3 (5 red and 4 blue cubes) | `1-two-colours` — drawn |
| Q4 (fill `6 + 3 = __`) | `1-fill-sum` |
| Q5 (7 stars and 6 stars) | `1-two-groups` — drawn |
| Q6 (8 things and 5 more) | `1-which-expression-large` |

Q2 and Q6 offer **three expressions**, not three numbers: the child has to read
the operation. The wrong options are the difference, a doubling, and the same
sum read the other way up — the last of which is a *correct* expression and is
therefore filtered out.

## U06.2 — შეკრება სურათების დახმარებით 10-ის ფარგლებში

| Reference | Template |
|---|---|
| Q7 (3 cats and 2 dogs) | `2-animals` — each row drawn with that animal |
| Q8 (4 yellow and 4 green circles) | `2-two-colours` |
| Q9 (6 stars and 3 more) | `2-stars` |
| Q10 (fill `5 + 4 = __`) | `2-fill-sum` |
| Q11 (3 red, 2 blue, 4 green) | `2-three-groups` — three rows |
| Q12 (how many more to make 10) | `2-to-ten` — the inverse |

Every sum here is **at most ten** by construction. Q7's animals are stored as
`{emoji, name}` pairs: an earlier version kept a name list and a fixed pair of
emoji, so a row labelled „ყვავი“ was drawn as cats.

## U06.3 — ტექსტური ამოცანები შეკრებაზე

| Reference | Template |
|---|---|
| Q13 (Nino's pencils) | `3-pencils` |
| Q14 (birds on a tree) | `3-birds` |
| Q15 (balls sold morning and evening) | `3-shop` |
| Q16 (two shelves of books) | `3-shelves` |
| Q17 (stickers, three amounts) | `3-stickers` — three addends |
| Q18 (passengers on a bus) | `3-bus` |

Six different *stories*, not six wordings of one: the subject matter, the verb
and the closing question are all part of the template, and the name is drawn
from the declined forms. Q17 is the only one with three addends inside a story,
so the child has to hold a running total.

## U06.4 — შეკრება რიცხვით ღერძზე

| Reference | Template |
|---|---|
| Q19 (2, three steps right) | `4-walk-small` |
| Q20 (4, two steps right) | `4-walk-small-two` |
| Q21 (7, five steps right) | `4-walk-teen` |
| Q22 (13, four steps right) | `4-walk-twenties` |
| Q23 (26, eight steps right) | `4-walk-large` |
| Q24 (end 45, twelve steps → start) | `4-walk-back` |

The line is drawn from the start for exactly `steps + 1` ticks, so the
destination is the **last tick** and nothing beyond it is visible — the picture
never marks the answer. Q24 is the same walk read backwards, and its answer is a
subtraction.

## U06.5 — ნულზე შეკრება და გაორმაგება

| Reference | Template |
|---|---|
| Q25 (5 + 0) | `5-plus-zero` |
| Q26 (3 + 3) | `5-double-small` — drawn as two rows |
| Q27 (8 + 8) | `5-double-mid` |
| Q28 (12 + 0) | `5-zero-to-large` |
| Q29 (double 17) | `5-double-large` |
| Q30 (`__ + __ = 18`, equal addends) | `5-equal-addends` — **recast** |
| — | `5-which-double` — recognising the double among three numbers |

Adding zero changes nothing, so its wrong options are **not** the number plus
zero: they are the number shifted by one or two, which is what a child writes
when they add nine to a number that had a zero.

## U06.6 — ჯამები 20-ის ფარგლებში

| Reference | Template |
|---|---|
| Q31 (6 + 5) | `6-carry-small` |
| Q32 (8 + 7) | `6-carry-large` |
| Q33 (9 + 8) | `6-nine-plus` |
| Q34 (12 + 6) | `6-two-digit` |
| Q35 (7 + __ = 16) | `6-missing` |
| Q36 (addends from a table) | `6-table` |

Every total is **at most twenty**. Q36 prints the table's two headers above the
empty cell, so the child reads a table rather than a bare equation.

## U06.7 — უცნობი შესაკრები

| Reference | Template |
|---|---|
| Q37 (3 + __ = 7) | `7-missing-small` |
| — | `7-missing-middle` — the blank in the other position |
| Q38 (__ + 8 = 15) | `7-missing-first` |
| Q39 (12 + __ = 19) | `7-missing-teen` |
| Q40 (sum 30, one addend 18) | `7-missing-word` |

All four are one factory: `answer = total − known`, with the total derived from
the two addends. The blank moves position between templates because a child who
only ever sees it at the end can pattern-match the position instead of solving.

## U06.8 — ჭეშმარიტი თუ მცდარი შეკრება

| Reference | Template |
|---|---|
| Q41, Q42 (small sums) | `8-true-small` |
| Q43, Q44 (sums with a carry) | `8-true-mid` |
| Q45 (12 + 9 = 20) | `8-true-large` |

Two options, and both occur — measured at 302/298 over 600 draws. The false
claims are **off by one or two**, never by ten: a claim that is wildly wrong is
no test of whether the child computed.

## U06.9 — რიცხვის მიღების სხვადასხვა გზა

| Reference | Template |
|---|---|
| Q46 (two numbers that make 10) | `9-pair-to-ten` — **recast** |
| — | `9-pair-to-ten-left` — the blank on the left |
| Q47 (two addends that make 15) | `9-pair-to-fifteen` — **recast** |
| — | `9-partner-choice` — the partner among three options |
| Q48 (every pair that makes 12) | `9-pair-to-twelve` — **recast** |

Q46 and Q47 ask for *any* pair. „The ways to make ten“ is nine facts, so asking
it once cannot fill a session; the recast keeps the same knowledge and makes the
answer unique:

- **Q46** → „6 + __ = 10“ (the spec's own example answer is „6 + 4“ — this asks
  for the 4 given the 6). The total varies (8–12) so it is not always ten.
- **Q47** → one addend given, find the other, total fifteen.
- **Q48** → „the sum of two numbers is T; one is K; find the other“, over
  20/24/30/36/40, so the same decomposition is asked at a size where it is work.

None is dropped; each is asked in the one-answer form the engine can mark.

## U06.10 — სამი ან მეტი ერთნიშნა რიცხვის შეკრება

| Reference | Template |
|---|---|
| Q49 (2 + 3 + 1) | `10-three-small` |
| Q50 (4 + 5 + 3) | `10-three-mid` |
| — | `10-four-addends` — four addends, the level-3 shape |

With four numbers there is no single pair to add first, which is what makes the
third level harder than the second rather than merely larger. The wrong options
are the sums of the neighbouring pairs — which is what dropping an addend looks
like.

## U06.11 — შესაკრებების არჩევა

| Reference | Template |
|---|---|
| The spec's drag-and-drop stage | `11-arrange-two`, `11-arrange-three`, `11-arrange-three-large` |

This is the engine's `shuffle` answer mode: the student taps the addends into
ascending order, and the key is a sequence of **display positions**. The addends
are drawn first and the total is their sum, so the printed total and the numbers
to arrange can never disagree.

## U06.12 — შეკრების ცხრილის შევსება

| Reference | Template |
|---|---|
| The spec's table-filling stage | `12-table-cell`, `12-table-row`, `12-table-two-cells`, `12-table-diagonal` |

`12-table-cell` prints the row and column headers above the empty cell, so the
question is a table rather than a bare sum. `12-table-two-cells` compares two
cells that share a row — the difference is the columns, so the shared addend
cancels, which is the first taste of structure rather than fact.

## Capacity

Distinct questions per level, over 600 seeds per template with 0 generation
errors:

| subtopic | level 1 | level 2 | level 3 |
|---|---|---|---|
| ra-aris-Sekreba | 686 | 345 | 501 |
| SuratiT-10 | 240 | 57 | 144 |
| teqsti | 287 | 120 | 589 |
| ricxviT-xazze | 74 | 64 | 307 |
| nuli-gakvireba | 44 | 37 | 58 |
| cxrili-20 | 148 | 37 | 103 |
| uknobi-SeSveTi | 60 | 66 | 120 |
| martalia-tu-ara | 117 | 187 | 404 |
| raodenobis-gzebi | 84 | 59 | 74 |
| samive-ze-meti | 48 | 100 | 393 |
| SeSveTebis-arCevani | 62 | 466 | 467 |
| Sekreba-cxrili-Sevseba | 81 | 88 | 324 |

Every level clears 35 — the threshold a session needs — with the tightest cells
(`nuli-gakvireba` at 37, `cxrili-20` at 37) still just over a session. A perfect
run was also played through all twelve subtopics with the real ladder: every one
reaches 100 in 35 questions.

## Multi-answer recasts

| Reference asks for | Recast as | Template |
|---|---|---|
| `__ + __ = 18`, both addends equal (Q30) | one number that, doubled, makes the total | `5-equal-addends` |
| which two numbers make 10 (Q46) | one addend given, find the other | `9-pair-to-ten` |
| fill two addends that make 15 (Q47) | one addend given, find the other | `9-pair-to-fifteen` |
| select every pair that sums to 12 (Q48) | the partner of a given addend | `9-pair-to-twelve` |
| drag the addends into order (U06.11) | `shuffle` ordering, key is a position sequence | `11-*` |

The reasoning is unchanged in every case; only the number of marks on the page
changes. This is the same recasting U04 and U05 do, and it is recorded rather
than hidden because a reviewer should be able to see exactly what was traded.

## What is deliberately *not* asked

- **Nothing is answered by typing a word.** Numbers, expressions and orderings
  only.
- **No picture marks the answer.** A number line shows only up to the
  destination; a drawn group's count is what the child supplies.
- **No invented Georgian**, no plural after a numeral, and no name in the wrong
  case before „აქვს“.
- **No sum outside its subtopic's range** — ten for U06.2, twenty for U06.6,
  enforced by derivation rather than by rejection.
