# U14 — ფული (money)

Grade 1, `topicId: 'fasebi'`. Fifty templates over the curriculum's six
subtopics, and every subtopic reaches all three levels:

| Subtopic | Templates | L1 | L2 | L3 |
|---|---:|---:|---:|---:|
| `monetebis-vertoba` | 10 | 4 | 3 | 3 |
| `fulis-amocanebi` | 11 | 3 | 5 | 3 |
| `sakmarisi-fuli` | 4 | 1 | 1 | 2 |
| `tolzRvari-monetebi` | 10 | 2 | 3 | 5 |
| `yvelaze-cota-monetebi` | 5 | 2 | 2 | 1 |
| `tanxaTa-Sedareba` | 10 | 1 | 5 | 4 |
| **total** | **50** | **13** | **19** | **18** |

The curriculum gives „ფული“ **six** subtopics while the specification describes
**four** sections (U14.1–U14.4), so the two cannot line up one-to-one. Rather
than flatten the extra two, every reference question is filed under the subtopic
that *teaches* it. Two of the six are teaching skills the specification folds
into a section: „საკმარისია თუ არა?“ receives Q15, Q16, Q19 and Q22 from U14.2,
and „ყველაზე ცოტა მონეტა“ receives Q36 from U14.3 plus four questions that teach
*how* the greedy walk reaches the fewest coins.

## The one idea this unit must not break

**A purse is a list of coins, and every number in the question comes out of that
list.** `src/practice/templates/coins.ts` draws the tokens, adds them up, and
counts the ways to pay an amount; no template computes a sum of its own, and no
picture holds a second copy of the amount. A purse cannot disagree with the
answer beside it for the same reason a dial cannot disagree with the time.

Three consequences shape the whole unit:

- **Real coins only.** `COINS` is `[1, 2, 5, 10, 20, 50]`, the coins Georgia
  mints, and it is the only source of coin values. A hundred თეთრი is one ლარი
  and the specification forbids decimals, so every amount stays inside
  1–100 თეთრი and `checkAmount` throws outside it.
- **Combinations are unordered.** `10 + 5` and `5 + 10` are one way to pay 15;
  `combinationText` sorts before writing, so they cannot appear as two options
  and `coinCombinations` cannot count them twice. The four ways to pay 12 are
  five coins, not eight, and the count question says so.
- **An amount that is not a coin is a price tag, not a coin.** `amountTag` writes
  `◆ 45 თეთრი`. Drawing 45 as a coin would invent a denomination; drawing it as
  the fewest coins that make it would hand over the answer to „which combination
  equals 45“.

## Reference question → template

**U14.1 `monetebis-vertoba`** — მონეტების ღირებულება და დათვლა (Q1–Q10)

| Q | Reference | Template | Level |
|---|---|---|---|
| 1 | read the denomination off the drawn coin | `g1-u14-1-name-coin` | 1 |
| 2 | two coins of one denomination | `g1-u14-1-two-same-coins` | 1 |
| 3 | three of one denomination, capped under a lari | `g1-u14-1-three-same-coins` | 1 |
| 4 | which of three drawn coins is worth most | `g1-u14-1-which-is-more` | 1 |
| 5 | two different coins, typed | `g1-u14-1-two-different-coins` | 2 |
| 6 | three mixed coins, typed | `g1-u14-1-three-coins` | 2 |
| 7 | **how many** coins, not how much | `g1-u14-1-count-coins` | 2 |
| 8 | a mixed purse, as a choice | `g1-u14-1-count-purse` | 3 |
| 9 | pay an amount with exactly two coins | `g1-u14-1-make-amount-two` | 3 |
| 10 | which row is worth the same — the bridge into U14.3 | `g1-u14-1-value-two-ways` | 3 |

**U14.2 `fulis-amocanebi`** — ფულის ამოცანები (Q11–Q14, Q17–Q18, Q20–Q21, Q23–Q25)

| Q | Reference | Template | Level |
|---|---|---|---|
| 11 | one price, read off a tag | `g1-u14-2-one-price` | 1 |
| 12 | two prices: `a + b`, typed | `g1-u14-2-two-prices` | 1 |
| 13 | three prices: `a + b + c` | `g1-u14-2-three-prices` | 2 |
| 14 | change from one purchase: `m − p` | `g1-u14-2-change-one` | 2 |
| 17 | how much is missing: `p − m` | `g1-u14-2-how-much-short` | 2 |
| 18 | change after two purchases: `m − a − b` | `g1-u14-2-change-after-two` | 3 |
| 21 | change after three purchases: `m − a − b − c` | `g1-u14-2-three-item-change` | 3 |
| 20 | which of three things is most expensive | `g1-u14-2-most-expensive` | 1 |
| 23 | top up to a price: `t − a` | `g1-u14-2-top-up` | 3 |
| 24 | the difference between two prices: `a − b` | `g1-u14-2-price-difference` | 2 |
| 25 | split evenly between two children: `m ÷ 2` | `g1-u14-2-split-evenly` | 2 |

**U14.2 `sakmarisi-fuli`** — საკმარისია თუ არა? (Q15, Q16, Q19, Q22)

| Q | Reference | Template | Level |
|---|---|---|---|
| 15 | is the purse enough for one thing? yes/no | `g1-u14-2-enough-for-one` | 1 |
| 16 | is the purse enough for **two** things together? | `g1-u14-2-enough-for-two` | 3 |
| 19 | **mark every item you can buy** (multi-select) | `g1-u14-2-what-can-i-buy` | 3 |
| 22 | **which pairs can you buy together?** (multi-select) | `g1-u14-2-two-affordable` | 2 |

**U14.3 `tolzRvari-monetebi`** — ტოლღირებული მონეტები (Q26–Q35, Q37–Q40)

| Q | Reference | Template | Level |
|---|---|---|---|
| 26, 28, 32 | „how many of this coin make that coin?“ | `g1-u14-3-how-many-fit` | 1 |
| 29 | tens inside a round amount: `t ÷ 10` | `g1-u14-3-tens-in-target` | 1 |
| 31 | make an amount from two **different** coins | `g1-u14-3-two-different-coins` | 2 |
| 37 | pay with a bigger coin and get change: `big − price` | `g1-u14-3-change-from-big-coin` | 2 |
| 26 | one big coin against a row of small ones | `g1-u14-3-one-coin-many` | 2 |
| 33 | which combination equals a target | `g1-u14-3-which-combination` | 3 |
| 35 | **mark both ways** to pay (multi-select) | `g1-u14-3-two-ways` | 3 |
| 38 | compare two coin rows: which is worth more | `g1-u14-3-compare-combinations` | 3 |
| 39 | order three coin rows by value | `g1-u14-3-order-rows` | 3 |
| 40 | how many different ways, counted order-free | `g1-u14-3-number-of-ways` | 3 |

**U14.3 `yvelaze-cota-monetebi`** — ყველაზე ცოტა მონეტა (Q36 + four that teach it)

| Q | Reference | Template | Level |
|---|---|---|---|
| — | the fewest coins for an amount, as rows to pick | `g1-u14-3-fewest-row` | 1 |
| — | the greedy rule's first step: the biggest coin that fits | `g1-u14-3-biggest-coin-first` | 1 |
| — | the greedy rule's second step: the remainder | `g1-u14-3-remainder-after-big` | 2 |
| 36 | how many coins that is, typed | `g1-u14-3-min-coins-count` | 2 |
| 34, 36 | „exactly N coins“ for an amount | `g1-u14-3-exactly-n-coins` | 3 |

**U14.4 `tanxaTa-Sedareba`** — თანხების შედარება (Q41–Q50)

| Q | Reference | Template | Level |
|---|---|---|---|
| 41 | which of two purses is worth more | `g1-u14-4-which-larger` | 1 |
| 42 | order three amounts ascending | `g1-u14-4-order-ascending` | 2 |
| 43 | whose purse is heavier, named children | `g1-u14-4-two-purses` | 2 |
| 44 | how much **more**: `a − b` | `g1-u14-4-how-much-more` | 2 |
| 45 | how much **less**: the mirror of Q44 | `g1-u14-4-how-much-less` | 2 |
| 46 | order four amounts descending | `g1-u14-4-order-descending` | 3 |
| 47 | the two purses combined: `a + b` | `g1-u14-4-combined-purses` | 2 |
| 48 | after a transfer: `a − x`, and what the other child then has | `g1-u14-4-transfer` | 3 |
| 49 | equalise: half the gap between the purses | `g1-u14-4-equalise` | 3 |
| 50 | the multi-step purse: `m − a − b + r` | `g1-u14-4-multi-step` | 3 |

## Folds: reference questions carried by one template

These are the only places where a spec question does not have a template of its
own, and each is a fold in the sense the mapping promises — the same *task*, asked
once with more than one drawing:

- **Q26, Q28, Q32 → `how-many-fit`** (1 template, 3 questions). All three ask
  „how many of *this* coin make *that* coin“, and the only thing that varies is
  the pair of denominations. Three templates would differ only in two constants.
  The covered pairs are the whole real coin ladder — 1s in 2, 5, 10; 2s in 10;
  5s in 10, 20, 50; 10s in 20, 50 — so the arithmetic is not narrower for being
  in one template.
- **Q28 → also `how-many-fit`**, in its „tens in a target“ form, which is why
  `tens-in-target` exists separately (Q29): Q29 asks `t ÷ 10` for round numbers
  up to 100, a different reading of the same fact.
- **Q34, Q36 → `exactly-n-coins` and `min-coins-count`.** Q36 asks for the
  *count*; Q34 asks a shape question („can you pay exactly N coins“). The count
  is the answer in one and the constraint in the other, so they are two
  templates rather than one with a flag.

Everything else is 1:1. U14.1 is ten templates for ten questions, U14.4 is ten
for ten, and U14.2's eleven arithmetic questions are eleven.

## Deviations from the specification

Four, all recorded rather than hidden.

- **Drag-and-drop → a choice that names the right pair** (`order-rows`,
  `order-ascending`, `order-descending` are ordering recasts; the specification's
  drag tasks on Q39, Q42 and Q46 become „tap the rows in order“). The runner has
  no drop targets. Ordering questions submit an order key (`"2,3,1"`) by tapping
  rows in sequence, and the picture is numbered (`#1 ◆ 21 თეთრი`) because the
  number is what the answer refers to.
- **Multi-select is a new answer mode, used on four questions** (Q19, Q22, Q35,
  and the „mark every pair“ reading of Q22). The specification writes these as
  „mark all that apply“; `answerMode: 'multi'` is that, and the answer is the
  chosen subset joined in display order. It is not a recast — it is the
  specified task, in the runner the rest of the unit uses.
- **No decimals anywhere.** Every amount is a whole number of თეთრი under 100.
  Prices above 100 are not asked, and „1 ლარი 20 თეთრი“ is never written. This is
  the specification's own rule, and a test checks prompt, picture and explanation
  for a decimal comma or point rather than trusting the templates.
- **„Which is heavier“ is asked by name, not by picture.** Q43's purses belong to
  named children (ანა, ლევანი), and the name is in the picture above the coins
  *and* in the prompt and the options. A picture with two unlabelled purses cannot
  say which is whose.

## What is honestly ambiguous, and how each is closed

| Ambiguity | How the template closes it |
|---|---|
| „How much is this coin worth?“ — face value or buying power? | face value; the denomination is the only source |
| „Can I buy it?“ — exactly, or with change? | the question says „საკმარისია“ (enough), so ≥ is enough and the answer is yes/no |
| „Which is worth more“ between equal purses? | never asked; the comparison constrains a non-zero gap |
| „Pay with two coins“ — same coin twice? | Q9 is „two coins“, Q31 is „two **different** coins“, and they are separate templates |
| Counting the ways to pay 12 — does `10 + 2` and `2 + 10` count twice? | no; `combinationText` sorts, and the count question's explanation says „თანმიმდევრობა არ ითვლება“ |
| An amount that is not a coin (45) | a price tag, `◆ 45 თეთრი`, never a drawn coin |
| „Fewest coins“ when several sets have the same size | the greedy set is the answer and the explanation lists it; ties are broken at the source, in `minCoinSet` |
| A purse that can afford everything | the question's purse is capped so both a fitting and a non-fitting pair exist, by a constraint in the template |
| „How much change?“ when the payment is exact | never asked; change templates constrain `paid > price` |

## Capacity

A 100-point session spends 35 answers: 20 questions at +4, then five at +2, then
ten at +1 (rules in `src/practice/scoring.ts`). Distinct **wordings and
pictures** per subtopic and level, measured over 300 draws of six with
de-duplication:

| Subtopic | L1 | L2 | L3 |
|---|---:|---:|---:|
| `monetebis-vertoba` | 131 | 304 | 325 |
| `fulis-amocanebi` | 486 | 251 | 754 |
| `tolzRvari-monetebi` | 21 | 27 | 540 |
| `tanxaTa-Sedareba` | 207 | 609 | 901 |
| `yvelaze-cota-monetebi` | 40 | 31 | 20 |
| `sakmarisi-fuli` | 60 | 53 | 360 |

`session-length.test.ts` plays every U14 subtopic through to 100 points and does
not run dry, and a third test requires that no question repeats within a run.
The thin cells are `tolzRvari-monetebi` at L1/L2 and `yvelaze-cota-monetebi` at
L3, and they are thin for a structural reason worth stating: their universes are
small. „How many 5s make 20“ has a handful of wordings however many templates
ask it, and the fewest-coins walk for amounts under 20 has few distinct answers.
The margin is between half and one session's worth in those cells — enough, but
the first place to add material if a student practises one subtopic for a long
time.

Three templates are answer-space-limited on purpose: `g1-u14-1-name-coin` (six
coins, six questions), and `g1-u14-1-two-same-coins` / `three-same-coins` (five
sums each, the ones that stay under a lari). They are recognition and first-doubling questions; padding
them with different wording would be the same six questions wearing hats.

## Defects the first draft had

None of these were visible to the type checker:

- **Five ordering questions had no picture.** `order-rows` and
  `order-ascending`/`order-descending` asked „arrange these“, and the things to
  arrange lived only in the options. The session's de-dup key is prompt +
  picture, so every variation looked like the same question and a session dried
  up after a handful. `amountTags` now numbers the amounts in the picture, which
  is both what the answer refers to and what makes two variations two questions.
- **`sakmarisi-fuli` at level 2 had six distinct questions.** „Which pairs can
  you buy together?“ drew the same four options from a fixed window, so a
  35-answer session could not finish. The window now slides over every frugal
  pair (45 თეთრი or less), giving 53 distinct screens, and the picture carries
  the price list — without prices the question is unanswerable anyway.
- **A vacuous CSS test.** The dial and coins assertions used
  `/\bpre\b/` against `white-space`, which also matches `pre-line`. Both passed
  against deliberately broken CSS. They are anchored at the `;` now, and each
  was re-checked by breaking the rule and watching the test fail.
- **The picture was the only copy of the question.** Fifteen templates carry the
  question purely in the picture („which coin is this“, „count the purse“,
  „which purse is heavier“). Every visual has `aria-hidden`, so a screen reader
  got the prompt and no data. `visualText` now writes a sentence beside the
  picture — „5, 5 და 10 თეთრი მონეტა“ per purse, „N თეთრი“ per tag — inside
  `.visually-hidden`, which is clipped rather than `display: none`, so it is
  spoken and not seen. This closes the limitation U13 recorded as unfixable.

## What the tests do not cover

- **A reading-level review by a teacher.** The Georgian is checked for being real
  Georgian, for case endings and for one sentence per question, not for whether a
  six-year-old will follow „აირჩიე ყველა წყვილი, რომლის ყიდვაც ერთად შეგიძლია“.
- **Whether the coins are legible on a phone.** A purse is 27 characters wide for
  four coins and scrolls horizontally rather than wrapping. Nobody has looked at
  it on a real phone.
- **The spoken description's ordering.** `visualText` names the coins of each
  purse in drawing order; it is tested for that, not for whether the resulting
  sentence is easy to follow when read aloud.
- **Real prices.** Every good's price is a plausible school item; none has been
  checked against a shop, and some are round on purpose to keep the arithmetic
  honest.
- **Multi-select discoverability.** The hint says to mark every right option, and
  a test checks the hint is rendered; no test can say whether a child reads it.
