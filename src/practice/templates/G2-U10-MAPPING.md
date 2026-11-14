# Grade 2 — Unit 10: მონაცემები და ალბათობა (Data & Probability)
## Template Mapping & Architecture Documentation

### Overview
Unit 10 covers data representation (frequency tables, tally marks, pictograms, bar charts, dot plots) and foundational probability concepts (more/less/equally likely outcomes, possible/impossible events, and changing chances) for Grade 2 mathematics in Georgian. It contains 9 subtopics with exactly 6 questions per subtopic, totaling 54 authored templates (Q01–Q54).

---

### Subtopics in Unit 10 (`g2-monacemebi-albatoba`)

| Subtopic ID | Georgian Title | English Description | Difficulty Levels | Template Count |
|---|---|---|---|---|
| `u10-choosing-tables-charts` | ცხრილებისა და დიაგრამების არჩევა | Selecting appropriate tables and visual charts for given data sets | L1, L2, L3 | 6 |
| `u10-tally-marks` | აღრიცხვის ნიშნები | Counting and decomposing tally marks into bundles of 5 and single lines | L1, L2, L3 | 6 |
| `u10-collecting-data` | მონაცემების შეგროვება | Survey data organization, category tallying, finding missing components | L1, L2, L3 | 6 |
| `u10-pictograms` | პიქტოგრამები | Reading, scaling, calculating totals and differences from picture graphs | L1, L2, L3 | 6 |
| `u10-bar-charts` | სვეტოვანი დიაგრამები | Analyzing bar charts, comparing heights, differences, and composite totals | L1, L2, L3 | 6 |
| `u10-dot-plots` | წერტილოვანი დიაგრამები | Line plots / dot plots frequency analysis, mode identification, range filtering | L1, L2, L3 | 6 |
| `u10-more-less-equally-likely` | უფრო მეტად, ნაკლებად ან თანაბრად მოსალოდნელი | Qualitative probability comparison between outcomes | L1, L2, L3 | 6 |
| `u10-possible-impossible` | შესაძლებელი და შეუძლებელი მოვლენები | Classifying events as possible, certain, or impossible | L1, L2, L3 | 6 |
| `u10-changing-chances` | ალბათობის ცვლილება | Understanding how adding or removing items changes event likelihood | L1, L2, L3 | 6 |

Total: **54 authored templates** across 9 subtopics (6 questions each).

---

### Core Pedagogical & Technical Rules
1. **აღრიცხვის ნიშნები (Tally Marks)**: Grouped in bundles of 5 (four vertical lines crossed by a fifth slash) plus individual lines. Decompositions (`total = bundles × 5 + remainder`) are explicitly exercised.
2. **პიქტოგრამები (Pictograms)**: Every pictogram template defines the scale value of a single symbol (e.g., 1 symbol = 2, 3, 4, 5, or 10 units).
3. **დიაგრამები და ცხრილები (Charts & Tables)**: Questions use specifically generated dynamic datasets and compute answers directly from them.
4. **ალბათობა (Probability Assumptions)**: All items in bags/boxes are assumed equally accessible unless specified otherwise.
5. **სირთულის ზრდა (Difficulty Progression)**: Difficulty advances from straightforward identification (Level 1) to multi-step calculation and comparative reasoning (Level 2), and finally synthesis, inference, and conditional evaluation (Level 3).
6. **Scoring & Progression**: Continuous score progression up to 100 points (`MAX_SCORE`). Every subtopic supports playthroughs to completion.

---

### Detailed Question Mapping (Q01–Q54)

| ID | Subtopic | Level | Format | Description / Prompt Concept |
|---|---|---|---|---|
| `g2-u10-01` | `u10-choosing-tables-charts` | 1 | MC | Choose appropriate tool (frequency table) to compare categorical frequencies |
| `g2-u10-02` | `u10-choosing-tables-charts` | 1 | MC | Select matching table structure (category and student count) for survey data |
| `g2-u10-03` | `u10-choosing-tables-charts` | 2 | MC | Identify bar chart as best visual method to compare activity participants |
| `g2-u10-04` | `u10-choosing-tables-charts` | 2 | MC | Identify required metric (item count per day) to answer comparison questions |
| `g2-u10-05` | `u10-choosing-tables-charts` | 3 | MC | Choose bar chart to compare quantities across multiple species/types |
| `g2-u10-06` | `u10-choosing-tables-charts` | 3 | MC | Determine proper column header names for frequency table |
| `g2-u10-07` | `u10-tally-marks` | 1 | Numeric | Evaluate 1 bundle of five plus `k` single lines (`5 + k`) |
| `g2-u10-08` | `u10-tally-marks` | 1 | Numeric | Evaluate `b` bundles of five plus `k` single lines (`b × 5 + k`) |
| `g2-u10-09` | `u10-tally-marks` | 2 | MC | Decompose total count into full bundles of 5 and remaining single marks |
| `g2-u10-10` | `u10-tally-marks` | 2 | MC | Decompose item count into bundles of 5 and leftover tally marks |
| `g2-u10-11` | `u10-tally-marks` | 3 | Numeric | Sum total votes across two groups (`a + b`) |
| `g2-u10-12` | `u10-tally-marks` | 3 | Numeric | Evaluate higher count of tally bundles and singles (`b × 5 + k` for `b ≥ 3`) |
| `g2-u10-13` | `u10-collecting-data` | 1 | Numeric | Sum total survey participants across three choices (`a + b + c`) |
| `g2-u10-14` | `u10-collecting-data` | 1 | Numeric | Find remainder of respondents choosing third option (`total − a − b`) |
| `g2-u10-15` | `u10-collecting-data` | 2 | Numeric | Conservation rule: each participant provides 1 record, total responses = `n` |
| `g2-u10-16` | `u10-collecting-data` | 2 | Numeric | Sum four daily attendance records (`a + b + c + d`) |
| `g2-u10-17` | `u10-collecting-data` | 3 | Numeric | Multi-part survey deduction: determine remaining responses in larger sample |
| `g2-u10-18` | `u10-collecting-data` | 3 | Numeric | Aggregate total count across four distinct categories |
| `g2-u10-19` | `u10-pictograms` | 1 | Numeric | Interpret scaled pictogram symbol (`count × scale`, scale = 2, 3, 4) |
| `g2-u10-20` | `u10-pictograms` | 1 | Numeric | Multiply symbol count by scale factor for fruit inventory |
| `g2-u10-21` | `u10-pictograms` | 2 | Numeric | Find scaled difference between two pictogram categories |
| `g2-u10-22` | `u10-pictograms` | 2 | Numeric | Evaluate scaled pictogram with 5-unit or 10-unit scale per symbol |
| `g2-u10-23` | `u10-pictograms` | 3 | Numeric | Combine two categories and multiply by scale factor |
| `g2-u10-24` | `u10-pictograms` | 3 | Numeric | Calculate additional symbols needed to reach target total (`target / scale − curr`) |
| `g2-u10-25` | `u10-bar-charts` | 1 | MC | Identify category with maximum bar height in chart |
| `g2-u10-26` | `u10-bar-charts` | 1 | Numeric | Compute numerical difference between two bar heights (`c − d`) |
| `g2-u10-27` | `u10-bar-charts` | 2 | MC | Identify category/day with minimum value in chart |
| `g2-u10-28` | `u10-bar-charts` | 2 | Numeric | Calculate range: difference between highest and lowest bar (`max − min`) |
| `g2-u10-29` | `u10-bar-charts` | 3 | Numeric | Compute combined sum of two specific bars in a chart (`v2 + v3`) |
| `g2-u10-30` | `u10-bar-charts` | 3 | Numeric | Calculate overall total across all three bars in a chart (`v1 + v2 + v3`) |
| `g2-u10-31` | `u10-dot-plots` | 1 | Numeric | Read exact frequency count for a given score on a dot plot |
| `g2-u10-32` | `u10-dot-plots` | 1 | MC | Identify mode (most frequent number) from dot plot data sequence |
| `g2-u10-33` | `u10-dot-plots` | 2 | Numeric | Determine number of dots to place above target value |
| `g2-u10-34` | `u10-dot-plots` | 2 | Numeric | Calculate total dots across entire plot (`a + b + c`) |
| `g2-u10-35` | `u10-dot-plots` | 3 | Numeric | Count data points exactly equal to target value in dataset |
| `g2-u10-36` | `u10-dot-plots` | 3 | Numeric | Count data points strictly greater than threshold (`> 3`) |
| `g2-u10-37` | `u10-more-less-equally-likely` | 1 | MC | Determine more likely outcome when `a > b` (two colors) |
| `g2-u10-38` | `u10-more-less-equally-likely` | 1 | MC | Recognize equally likely outcomes when quantities are equal (`a = b`) |
| `g2-u10-39` | `u10-more-less-equally-likely` | 2 | MC | Determine less likely outcome when `b < a` |
| `g2-u10-40` | `u10-more-less-equally-likely` | 2 | MC | Three equal categories: all outcomes are equally likely |
| `g2-u10-41` | `u10-more-less-equally-likely` | 3 | MC | Identify outcome with higher chance (`a > b`) |
| `g2-u10-42` | `u10-more-less-equally-likely` | 3 | MC | Synthesize conclusion: equal counts imply equal likelihood |
| `g2-u10-43` | `u10-possible-impossible` | 1 | MC | Number on 6-sided die (1..6) is a possible event (`შესაძლებელია`) |
| `g2-u10-44` | `u10-possible-impossible` | 1 | MC | Number not on 6-sided die (> 6 or 0) is impossible (`შეუძლებელია`) |
| `g2-u10-45` | `u10-possible-impossible` | 2 | MC | Drawing absent color from monochromatic bag is impossible |
| `g2-u10-46` | `u10-possible-impossible` | 2 | MC | Drawing one of present colors from bag is possible |
| `g2-u10-47` | `u10-possible-impossible` | 3 | MC | Sequence of days of the week: following day is possible/certain |
| `g2-u10-48` | `u10-possible-impossible` | 3 | MC | Drawing odd-numbered card from set of even cards is impossible |
| `g2-u10-49` | `u10-changing-chances` | 1 | MC | Adding items of color A increases chance of drawing color A |
| `g2-u10-50` | `u10-changing-chances` | 1 | MC | Adding item of color B makes drawing color B more likely (`დიახ`) |
| `g2-u10-51` | `u10-changing-chances` | 2 | MC | Removing items of color B makes color A more likely to be drawn |
| `g2-u10-52` | `u10-changing-chances` | 2 | MC | Adding more of color B makes drawing color A less likely |
| `g2-u10-53` | `u10-changing-chances` | 3 | MC | Decreasing color A increases relative share and chance of color B |
| `g2-u10-54` | `u10-changing-chances` | 3 | MC | Starting equal and adding color A makes color A more likely |

---

### Verification and Quality Checklist
- [x] All 9 subtopics registered in `src/practice/curriculum.ts`.
- [x] All 54 templates implemented in `src/practice/templates/g2-u10-data-probability.ts`.
- [x] Registered in `TEMPLATE_REGISTRY` and exported in `src/practice/templates/catalog.ts`.
- [x] Fallback placeholders in `grade2-placeholders.ts` removed for U10.
- [x] 100% typecheck clean (`npm run typecheck`).
- [x] 100% test pass (`npm test`, 45 test files, 4,132 tests passed).
- [x] Full gameplay simulation reaches 100 points on all 9 subtopics.
- [x] Production build clean (`npm run build`).
