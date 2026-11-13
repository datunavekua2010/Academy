# U16 — ლოგიკური აზროვნება (Logical Reasoning)

Grade 1, `topicId: 'logikuri-azrovneba'`. Thirty-three templates across the curriculum's
final four subtopics in Grade 1, all reaching levels 1, 2, and 3:

| Subtopic | Title | Templates | L1 | L2 | L3 |
|---|---|---:|---:|---:|---:|
| `ferebi-wesis-mixedviT` | ფერები წესის მიხედვით (Choosing Colors by Rule) | 8 | 3 | 3 | 2 |
| `gamoricxva` | გამორიცხვა (Elimination / Odd One Out) | 9 | 3 | 3 | 3 |
| `sascori` | სასწორი (Balance Scales) | 7 | 3 | 2 | 2 |
| `Cafiqrebuli-ricxvi` | ჩაფიქრებული რიცხვი (The Thought-of Number) | 9 | 3 | 3 | 3 |
| **total** | | **33** | **12** | **11** | **10** |

## Milestone: Grade 1 Complete

With Unit 16 authored and registered:
- **113 of 113 subtopics in Grade 1** are now covered by real authored templates.
- **Zero Grade 1 placeholders remain** in the catalog (`GRADE1_PLACEHOLDERS` is empty).
- Every single subtopic in Grade 1 reaches all three difficulty levels and can successfully complete a full session up to 100 points without running dry.

---

## Architectural Principles of Logical Reasoning (U16)

1. **Color Sequences as Observable Data (`ferebi-wesis-mixedviT`):**
   - In `src/practice/templates/logic.ts`, colors carry canonical Georgian names, genitives, and emoji representations (🔴, 🔵, 🟢, 🟡, 🟠, 🟣, ⚫, ⚪).
   - Sequences follow strict repeating algebraic kernels (AB, AAB, ABB, ABC).
   - Missing items are indicated by `❓` in the visual and `___` in words, ensuring that visual and prompt always agree.
   - Tests parse the rendered diagrams back into tokens using `parseColorSequenceVisual` to verify target positions.

2. **Categorical and Semantic Elimination (`gamoricxva`):**
   - Questions ask "რომელია ზედმეტი?" based on crisp mathematical and semantic rules.
   - Grounded in distinct categories: semantic sets (fruits vs furniture, animals vs vegetables, tableware vs toys), parity (odd among evens / even among odds), base-10 structure (multiples of 5, full tens), digit count (single-digit vs two-digit), and geometry (polygons vs circle/oval, 2D vs 3D shapes).
   - Distractors and options are generated dynamically with zero ambiguity.

3. **Physical Balance Scale Equilibrium (`sascori`):**
   - Every balance scale problem is constructed via `createBalanceScale(left, right, item, emoji)`.
   - The scale renders an ASCII diagram depicting the left pan, fulcrum `▲`, beam tilt, and right pan.
   - If weights are equal, the scale is balanced (`წონასწორობაშია`). If unequal, the heavier side is lower (`დაბლა`), establishing intuitive physical reasoning before algebraic substitution.
   - Level 3 introduces equivalence substitution (e.g. 1 watermelon = 2 melons, so 2 watermelons = 4 melons).

4. **Thought-of Number & Inverse Operations (`Cafiqrebuli-ricxvi`):**
   - Models the classic Georgian prompt: "ჩავიფიქრე რიცხვი, მას დავუმატე a და მივიღე b. რა რიცხვი ჩავიფიქრე?"
   - Algebraically reinforces inverse operations:
     - Addition inverse: $x + a = b \implies x = b - a$
     - Subtraction inverse: $x - a = b \implies x = b + a$
     - Doubling inverse: $x + x = b \implies x = b / 2$
     - Two-step operations: $(x + a) - b = c \implies x = (c + b) - a$
   - Formatted as typed integer entry and mystery boxes `[ ? ]`, reinforcing algebraic foundations.

---

## Reference question → template mapping

### U16.1: Choosing Colors by Rule (`ferebi-wesis-mixedviT`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | წითელი, ლურჯი, წითელი, ლურჯი, ? | წითელი | `g1-u16-1-ab-color-sequence` | 1 |
| 2 | მწვანე, ყვითელი, მწვანე, ყვითელი, მწვანე, ? | ყვითელი | `g1-u16-1-ab-color-sequence` | 1 |
| 3 | წითელი, წითელი, ლურჯი, წითელი, წითელი, ? | ლურჯი | `g1-u16-1-aab-color-sequence` | 1 |
| 4 | მწვანე, ლურჯი, ლურჯი, მწვანე, ლურჯი, ლურჯი, ? | მწვანე | `g1-u16-1-abb-color-sequence` | 1 |
| 5 | წითელი, ყვითელი, ლურჯი, წითელი, ყვითელი, ? | ლურჯი | `g1-u16-1-abc-color-sequence` | 2 |
| 6 | ლურჯი, წითელი, ლურჯი, ?, ლურჯი, წითელი | წითელი | `g1-u16-1-middle-blank-color` | 2 |
| 7 | წითელი, ლურჯი, ყვითელი, წითელი, ლურჯი, ყვითელი... რამდენი ფერი მეორდება? | 3 | `g1-u16-1-pattern-core` | 3 |
| 8 | წესი: "ორი ყვითელი, ერთი მწვანე". წითლის შემდეგ რა ფერია? | ყვითელი | `g1-u16-1-rule-text-color` | 2 |
| 9 | წესი: "წითელი, ლურჯი". მე-7 ფერი რა იქნება? | წითელი | `g1-u16-1-position-color` | 3 |
| 10 | თეთრი, შავი, თეთრი, შავი... რომელი იქნება მე-10? | შავი | `g1-u16-1-position-color` | 3 |

---

### U16.2: Elimination / Odd One Out (`gamoricxva`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | ვაშლი, მსხალი, ბანანი, სტაფილო (რომელია ზედმეტი?) | სტაფილო | `g1-u16-2-category-elimination` | 1 |
| 2 | ძაღლი, კატა, ძროხა, მტრედი (რომელია ზედმეტი?) | მტრედი | `g1-u16-2-category-elimination` | 1 |
| 3 | მაისური, შარვალი, ქუდი, ჩანთა (რომელია ზედმეტი?) | ჩანთა | `g1-u16-2-category-elimination` | 1 |
| 4 | კალამი, რვეული, ფანქარი, ვაშლი (რომელია ზედმეტი?) | ვაშლი | `g1-u16-2-category-elimination` | 1 |
| 5 | 2, 4, 6, 7 (რომელია ზედმეტი?) | 7 | `g1-u16-2-parity-even-odd` | 1 |
| 6 | 1, 3, 5, 8 (რომელია ზედმეტი?) | 8 | `g1-u16-2-parity-odd-even` | 1 |
| 7 | სამკუთხედი, კვადრატი, მართკუთხედი, წრე (რომელია ზედმეტი?) | წრე | `g1-u16-2-polygons-vs-circle` | 3 |
| 8 | 12, 14, 16, 25 (რომელია ზედმეტი?) | 25 | `g1-u16-2-full-tens` | 2 |
| 9 | 5, 10, 15, 17 (რომელია ზედმეტი?) | 17 | `g1-u16-2-multiples-of-five` | 2 |
| 10 | 3, 6, 8, 12 (რომელია ზედმეტი?) | 12 | `g1-u16-2-single-vs-two-digit` | 2 |

---

### U16.3: Balance Scales (`sascori`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | მარცხნივ 2 ვაშლი, მარჯვნივ 2 ვაშლი. სასწორი წონასწორობაშია? | დიახ | `g1-u16-3-is-scale-balanced` | 1 |
| 2 | მარცხნივ 3 ვაშლი, მარჯვნივ 1 ვაშლი. რომელი მხარე იქნება დაბლა? | 3 ვაშლის მხარე | `g1-u16-3-which-side-lower` | 1 |
| 3 | მარცხნივ 1 ბურთი, მარჯვნივ 4 ბურთი. რომელია უფრო მძიმე? | 4 ბურთის მხარე | `g1-u16-3-which-side-lower` | 1 |
| 4 | მარცხნივ 5 კუბიკი, მარჯვნივ 5 კუბიკი. წონასწორობაშია? | დიახ | `g1-u16-3-is-scale-balanced` | 1 |
| 5 | მარცხნივ 4 ვაშლი, მარჯვნივ 2 ვაშლი. რამდენით მეტია? | 2 | `g1-u16-3-difference-between-sides` | 2 |
| 6 | 1 საზამთრო = 3 ნესვი. სასწორის მეორე მხარეს რამდენი ნესვია? | 3 | `g1-u16-3-equivalence-balance` | 3 |
| 7 | 2 ბურთი = 4 კუბიკი. 1 ბურთი რამდენ კუბიკს გააწონასწორებს? | 2 | `g1-u16-3-two-step-balance-scale` | 3 |
| 8 | მარცხნივ 3 კუბიკი, მარჯვნივ 1. რამდენი უნდა დავამატოთ გასათანაბრებლად? | 2 | `g1-u16-3-add-to-balance` | 2 |
| 9 | მარცხნივ 6 ვაშლი, მარჯვნივ 4 ვაშლი. რა არის განსხვავება? | 2 | `g1-u16-3-difference-between-sides` | 2 |
| 10 | 1 წიგნი = 2 რვეული. 2 წიგნი რამდენ რვეულს უდრის? | 4 | `g1-u16-3-two-step-balance-scale` | 3 |

---

### U16.4: The Thought-of Number (`Cafiqrebuli-ricxvi`, Q1–Q10)

| Q | Reference Question | Answer | Template | Level |
|---|---|---|---|---|
| 1 | ჩავიფიქრე რიცხვი, დავუმატე 3 და მივიღე 7. რა რიცხვია? | 4 | `g1-u16-4-thought-add-single` | 1 |
| 2 | ჩავიფიქრე რიცხვი, დავუმატე 5 და მივიღე 10. რა რიცხვია? | 5 | `g1-u16-4-thought-add-single` | 1 |
| 3 | ჩავიფიქრე რიცხვი, გამოვაკელი 2 და მივიღე 6. რა რიცხვია? | 8 | `g1-u16-4-thought-sub-single` | 1 |
| 4 | ჩავიფიქრე რიცხვი, გამოვაკელი 4 და მივიღე 5. რა რიცხვია? | 9 | `g1-u16-4-thought-sub-single` | 1 |
| 5 | [ ? ] + 6 = 10 | 4 | `g1-u16-4-mystery-box` | 1 |
| 6 | [ ? ] - 3 = 7 | 10 | `g1-u16-4-mystery-box` | 1 |
| 7 | ჩავიფიქრე რიცხვი, დავუმატე 7 და მივიღე 15. რა რიცხვია? | 8 | `g1-u16-4-thought-add-larger` | 2 |
| 8 | ჩავიფიქრე რიცხვი, გამოვაკელი 8 და მივიღე 12. რა რიცხვია? | 20 | `g1-u16-4-thought-sub-larger` | 2 |
| 9 | ჩავიფიქრე რიცხვი, გავაორმაგე (დავუმატე იგივე) და მივიღე 8. რა რიცხვია? | 4 | `g1-u16-4-thought-double` | 2 |
| 10 | ჩავიფიქრე რიცხვი, დავუმატე 2, გამოვაკელი 3 და მივიღე 5. რა რიცხვია? | 6 | `g1-u16-4-thought-two-step` | 3 |
