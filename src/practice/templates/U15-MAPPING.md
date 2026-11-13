# U15 — ტოლი ნაწილები (Equal Parts)

Grade 1, `topicId: 'toli-nawilebi'`. Thirty templates over the curriculum's two
subtopics, and both subtopics reach all three difficulty levels:

| Subtopic | Title | Templates | L1 | L2 | L3 |
|---|---|---:|---:|---:|---:|
| `diagramiT-gayofa` | გაყოფა დიაგრამით (Sharing with a Diagram) | 14 | 5 | 5 | 4 |
| `toli-nawilebi-2` | ტოლი ნაწილები (Equal Parts) | 16 | 5 | 6 | 5 |
| **total** | | **30** | **10** | **11** | **9** |

## The one idea this unit must not break

**A diagram is data, not a hand-drawn picture.**

In `src/practice/templates/parts.ts`, every sharing question and divided shape is
constructed from real data:
- **Sharing diagrams (`diagramiT-gayofa`):** A total count of items is split
  among recipients (children, vases, baskets, plates, groups). The diagram
  renders each group's items on its own labeled line (`1-ლი ბავშვი: 🍎 🍎 🍎`,
  `ვაზა 1: 🌸 🌸 🌸 🌸`). The prompt, diagram, and answer are derived from the same
  numbers (`total ÷ recipients = perGroup`), ensuring the visual and answer
  always agree.
- **Divided shapes (`toli-nawilebi-2`):** Every part is rendered as a bracketed
  token block `[ ■ … ]` or `[ 🍕 … ]`. Parts are equal (`თანაბარი` / `ტოლი`) if and
  only if every bracket contains the identical number of tokens; they are unequal
  (`არათანაბარი` / `არატოლი`) if the token counts differ.
- **Picture reading in tests:** Tests in `tests/u15-templates.test.ts` parse the
  visuals back into token counts (`parseSharingDiagram`, `parseVisualParts`) and
  verify that the on-screen diagram mathematically justifies the answer.

---

## Reference question → template mapping

### U15.1: Sharing with a Diagram (`diagramiT-gayofa`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | 6 ვაშლი თანაბრად გაუნაწილეს 2 ბავშვს. რამდენი ვაშლი შეხვდა თითოეულს? | 3 | `g1-u15-1-share-children` | 1 |
| 2 | 8 ბურთი თანაბრად გაუნაწილეს 4 ბავშვს. რამდენი ბურთი შეხვდა თითოეულს? | 2 | `g1-u15-1-share-children` | 1 |
| 3 | 4 ნამცხვარი თანაბრად გაუნაწილეს 2 ბავშვს. რამდენი ნამცხვარი შეხვდა თითოეულს? | 2 | `g1-u15-1-share-children` | 1 |
| 4 | 9 ფანქარი თანაბრად გაუნაწილეს 3 ბავშვს. რამდენი ფანქარი შეხვდა თითოეულს? | 3 | `g1-u15-1-share-children` | 1 |
| 5 | 10 მარწყვი თანაბრად გაუნაწილეს 2 ბავშვს. რამდენი მარწყვი შეხვდა თითოეულს? | 5 | `g1-u15-1-share-children` | 1 |
| 6 | 12 კუბიკი თანაბრად გაუნაწილეს 4 ბავშვს. რამდენი კუბიკი შეხვდა თითოეულს? | 3 | `g1-u15-2-share-larger` | 2 |
| 7 | 6 ფუნთუშა თანაბრად გაუნაწილეს 3 ბავშვს. რამდენი ფუნთუშა შეხვდა თითოეულს? | 2 | `g1-u15-1-share-children` | 1 |
| 8 | 8 კანფეტი თანაბრად გაუნაწილეს 2 ბავშვს. რამდენი კანფეტი შეხვდა თითოეულს? | 4 | `g1-u15-1-share-children` | 1 |
| 9 | 12 ყვავილი თანაბრად ჩააწყვეს 3 ვაზაში. რამდენი ყვავილი მოხვდა თითოეულ ვაზაში? | 4 | `g1-u15-1-share-containers` | 1 |
| 10 | 10 სათამაშო თანაბრად გაუნაწილეს 5 ბავშვს. რამდენი სათამაშო შეხვდა თითოეულს? | 2 | `g1-u15-1-share-children` | 1 |

#### U15.1 Extension templates (Levels 1–3)
- `g1-u15-1-count-per-group-diagram` (L1): Count items in each group from diagram boxes.
- `g1-u15-1-halving-objects` (L1): Halving objects into two equal parts.
- `g1-u15-1-how-many-groups` (L1): Find the number of recipients given total and per-recipient count.
- `g1-u15-2-which-share-equation` (L2): Identify matching division equation (`total ÷ children = share`).
- `g1-u15-2-fair-or-unfair-sharing` (L2): Determine if diagram shows equal or unequal distribution (`თანაბრად` / `არათანაბრად`).
- `g1-u15-2-missing-total` (L2): Reverse sharing / multiplication (`children × share = total`).
- `g1-u15-2-equal-share-yes-no` (L2): Can total be divided without remainder? (`დიახ` / `არა`).
- `g1-u15-3-share-with-remainder` (L3): Finding remainder when items are shared as equally as possible.
- `g1-u15-3-how-many-more-needed` (L3): How many more items needed to achieve target share.
- `g1-u15-3-two-step-sharing` (L3): Total after adding, then shared equally.
- `g1-u15-3-compare-shares` (L3): Compare per-child share between two groups.

---

### U15.2: Equal Parts (`toli-nawilebi-2`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | მართკუთხედი გაყოფილია 2 ერთნაირ ნაწილად. ეს ნაწილები არის თანაბარი თუ არათანაბარი? | თანაბარი | `g1-u15-1-equal-vs-unequal` | 1 |
| 2 | წრე გაყოფილია 2 ნაწილად: ერთი ნაწილი დიდია, მეორე — პატარა. ნაწილები არის თანაბარი თუ არათანაბარი? | არათანაბარი | `g1-u15-1-equal-vs-unequal` | 1 |
| 3 | კვადრატი გაყოფილია 4 ერთნაირ პატარა კვადრატად. ნაწილები არის თანაბარი თუ არათანაბარი? | თანაბარი | `g1-u15-1-equal-vs-unequal` | 1 |
| 4 | პიცა გაყოფილია 4 ნაჭრად. ყველა ნაჭერი ერთნაირი ზომისაა. ნაჭრები არის თანაბარი თუ არათანაბარი? | თანაბარი | `g1-u15-1-equal-vs-unequal` | 1 |
| 5 | მართკუთხედი გაყოფილია 2 ნაწილად, რომელთაგან ერთი მეორეზე დიდია. ნაწილები არის თანაბარი თუ არათანაბარი? | არათანაბარი | `g1-u15-1-equal-vs-unequal` | 1 |
| 6 | რომელი ნახატი გვიჩვენებს ორ თანაბარ ნაწილს? A vs B | A | `g1-u15-2-which-shows-equal` | 2 |
| 7 | კვადრატი გაყოფილია 4 თანაბარ ნაწილად. რამდენი თანაბარი ნაწილია? | 4 | `g1-u15-1-count-equal-parts` | 1 |
| 8 | წრე გაყოფილია 2 თანაბარ ნაწილად. რამდენი ნაწილი აქვს წრეს? | 2 | `g1-u15-1-count-equal-parts` | 1 |
| 9 | რომელია თანაბარი ნაწილების მაგალითი? A vs B | B | `g1-u15-2-which-shows-equal` | 2 |
| 10 | მართკუთხედი გაყოფილია 3 თანაბარ ნაწილად. რამდენი ნაწილია ერთნაირი ზომის? | 3 | `g1-u15-1-count-equal-parts` | 1 |

#### U15.2 Extension templates (Levels 1–3)
- `g1-u15-1-are-parts-equal` (L1): Visual discrimination (`ტოლია` / `არ არის ტოლი`).
- `g1-u15-1-halves-name` (L1): Naming halves (`ნახევარი`).
- `g1-u15-1-quarters-name` (L1): Naming quarters (`მეოთხედი`).
- `g1-u15-2-which-shows-unequal` (L2): Candidate comparison identifying unequal parts (A vs B).
- `g1-u15-2-halves-in-whole` (L2): How many halves make a whole (2).
- `g1-u15-2-quarters-in-whole` (L2): How many quarters make a whole (4).
- `g1-u15-2-shaded-equal-parts` (L2): Counting unshaded equal parts given total and shaded.
- `g1-u15-2-chocolate-fair-split` (L2): Chocolate bar pieces split check (`თანაბარი` / `არათანაბარი`).
- `g1-u15-3-cuts-for-equal-parts` (L3): Number of cuts needed to divide a strip into N parts (`parts - 1`).
- `g1-u15-3-balance-parts` (L3): Transferring blocks between unequal parts to equalize them.
- `g1-u15-3-fold-symmetry-equal` (L3): Folding along symmetry axis produces equal parts (`თანაბარი`).
- `g1-u15-3-combine-halves` (L3): Combining two halves yields one whole (`ერთ მთელს`).
- `g1-u15-3-three-equal-parts-third` (L3): Naming thirds (`მესამედი`).

---

## Verification & Session Length

Every playable subtopic in U15 satisfies:
- **No dry queues:** `tests/session-length.test.ts` plays through both `diagramiT-gayofa` and `toli-nawilebi-2` from score 0 to 100 (level 1 → level 2 → level 3) without exhausting questions.
- **De-duplication safety:** Every question provides a distinct `visual` and `prompt`, ensuring signatures remain unique throughout long practice sessions.
- **Accessibility:** Visual diagrams use clean Unicode/emoji text that screen readers announce clearly through `.visually-hidden`.
