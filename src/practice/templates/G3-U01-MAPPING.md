# Grade 3 Unit 1: რიცხვები 100-მდე (Numbers up to 100)

## Overview
Unit 01 (`g3-ricxvebi100`) implements the foundational Grade 3 curriculum for two-digit numbers up to 100 as specified in Google Docs document `U01` (ID: `1NSiJDGuBzcjXPSdU7A1iOo6f_0rKuwQ5PL6lMAS1LeE`, folder "WEBSITE GRADE 3"):
- Navigating the hundred chart (horizontal steps of ±1, vertical row steps of ±10, ±20, and 3×3 grid patterns).
- Reading and writing numbers in Georgian words (vigesimal structure e.g., ორმოცდაექვსი = 46, სამოცდაცხრამეტი = 79).
- Ordinal numbers and positional queue problems (1-ლი, მე-2, მე-3 ... მე-10, predecessor/successor in line).
- Place value: decomposing into tens and units (e.g., 47 = 4 ათეული და 7 ერთეული, extracting digit values).
- Previous and next numbers, neighbors, and sequences within 0–100.
- Number line up to 100: stepping forward and backward, calculating distances, finding starting positions.
- Comparing and ordering: finding maximum and minimum numbers, sorting arrays ascending/descending.
- Roman numerals: core single symbols (I = 1, V = 5, X = 10, L = 50), additive and subtractive compound numerals (VII = 7, XV = 15, XL = 40, etc.).

## Architecture & Subtopics
The unit contains **48 dynamic question templates** (Q01–Q48) evenly distributed across **8 subtopics** (6 questions each) covering progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U01.1: ასეულთა ცხრილი** (`u01-hundred-chart`, Q01–Q06)
   - Q01 (`g3-u01-01`, Level 1, Numeric): იპოვე გამოტოვებული რიცხვი მიმდევრობაში (`a, b, __, d`).
   - Q02 (`g3-u01-02`, Level 1, Numeric): ერთი მწკრივით ქვემოთ მდებარე რიცხვი (`n + 10`).
   - Q03 (`g3-u01-03`, Level 2, Numeric): ერთი უჯრით მარცხნივ მდებარე რიცხვი (`n − 1`).
   - Q04 (`g3-u01-04`, Level 2, Numeric): ერთი უჯრით მარჯვნივ მდებარე რიცხვი (`n + 1`).
   - Q05 (`g3-u01-05`, Level 3, Numeric): ორი მწკრივით ქვემოთ გადასვლა (`n + 20`).
   - Q06 (`g3-u01-06`, Level 3, Numeric): 3×3 ასეულის ცხრილის მონაკვეთში ცენტრალური უჯრის ამოცნობა.

2. **U01.2: რიცხვები სიტყვიერად** (`u01-numbers-in-words`, Q07–Q12)
   - Q07 (`g3-u01-07`, Level 1, Numeric): სიტყვიერი ჩანაწერიდან ციფრებით ჩაწერა.
   - Q08 (`g3-u01-08`, Level 1, Numeric): სიტყვიერი სახელწოდების შესაბამისი რიცხვის პოვნა.
   - Q09 (`g3-u01-09`, Level 2, Text/MC): რიცხვის სიტყვიერი წაკითხვის ვარიანტის შერჩევა.
   - Q10 (`g3-u01-10`, Level 2, Text/MC): ორნიშნა რიცხვის სიტყვიერი ფორმა.
   - Q11 (`g3-u01-11`, Level 3, Numeric): რიცხვის იდენტიფიცირება რთული სიტყვიერი ჩანაწერიდან.
   - Q12 (`g3-u01-12`, Level 3, Numeric): სიტყვებიდან ციფრებზე გადასვლა.

3. **U01.3: რიგობითი რიცხვები** (`u01-ordinal-numbers`, Q13–Q18)
   - Q13 (`g3-u01-13`, Level 1, Text/MC): შეჯიბრში ადგილის მიხედვით რიგითი ნომრის პოვნა (1-ლი, მე-2, მე-3...).
   - Q14 (`g3-u01-14`, Level 1, Text/MC): რიგში მოცემული ადგილის მომდევნო პოზიცია.
   - Q15 (`g3-u01-15`, Level 2, Text/MC): საგნების რიგში მარცხნიდან k-ური პოზიციის სიტყვიერი სახელი.
   - Q16 (`g3-u01-16`, Level 2, Text/MC): რიგობითი რიცხვის სახელის ცნობა (მესამე, მეოთხე, მეექვსე...).
   - Q17 (`g3-u01-17`, Level 3, Text/MC): ვინ დგას მოცემული ბავშვის წინ/შემდეგ რიგში.
   - Q18 (`g3-u01-18`, Level 3, Text/MC): ბოლო ბავშვის რიგითი პოზიცია ცნობილი საერთო რაოდენობისას.

4. **U01.4: ათეულები და ერთეულები** (`u01-tens-and-ones`, Q19–Q24)
   - Q19 (`g3-u01-19`, Level 1, Text/MC): ორნიშნა რიცხვის დაშლა ათეულებად და ერთეულებად.
   - Q20 (`g3-u01-20`, Level 1, Numeric): მოცემული ათეულებითა და ერთეულებით რიცხვის შედგენა.
   - Q21 (`g3-u01-21`, Level 2, Numeric): სრული ათეულების რაოდენობის განსაზღვრა მრგვალ რიცხვში.
   - Q22 (`g3-u01-22`, Level 2, Numeric): ერთეულების ციფრის ამოცნობა.
   - Q23 (`g3-u01-23`, Level 3, Numeric): ათეულებისა და ერთეულებისგან რიცხვის მიღება.
   - Q24 (`g3-u01-24`, Level 3, Numeric): გამოტოვებული ერთეულების რაოდენობის პოვნა.

5. **U01.5: წინა და მომდევნო რიცხვები** (`u01-before-and-after`, Q25–Q30)
   - Q25 (`g3-u01-25`, Level 1, Numeric): უშუალოდ წინა რიცხვი (`n − 1`).
   - Q26 (`g3-u01-26`, Level 1, Numeric): უშუალოდ მომდევნო რიცხვი (`n + 1`).
   - Q27 (`g3-u01-27`, Level 2, Numeric): ორ რიცხვს შორის მდებარე შუა რიცხვის პოვნა (`a, __, c`).
   - Q28 (`g3-u01-28`, Level 2, Numeric): ორი რიცხვით წინ მდებარე რიცხვი (`n − 2`).
   - Q29 (`g3-u01-29`, Level 3, Numeric): ორი რიცხვით შემდეგ მდებარე რიცხვი (`n + 2`).
   - Q30 (`g3-u01-30`, Level 3, Numeric): 4-წევრიანი თანმიმდევრობის შევსება.

6. **U01.6: რიცხვითი ღერძი 100-მდე** (`u01-number-line`, Q31–Q36)
   - Q31 (`g3-u01-31`, Level 1, Numeric): ერთი ნაბიჯი მარჯვნივ (+1).
   - Q32 (`g3-u01-32`, Level 1, Numeric): ერთი ნაბიჯი მარცხნივ (−1).
   - Q33 (`g3-u01-33`, Level 2, Numeric): k ნაბიჯით მარჯვნივ გადაადგილება (`start + step`).
   - Q34 (`g3-u01-34`, Level 2, Numeric): k ნაბიჯით მარცხნივ გადაადგილება (`start − step`).
   - Q35 (`g3-u01-35`, Level 3, Numeric): მანძილის გამოთვლა ორ წერტილს შორის (`b − a`).
   - Q36 (`g3-u01-36`, Level 3, Numeric): საწყისი რიცხვის პოვნა საბოლოო პოზიციისა და ნაბიჯების მიხედვით.

7. **U01.7: უდიდესი და უმცირესი რიცხვები** (`u01-largest-and-smallest`, Q37–Q42)
   - Q37 (`g3-u01-37`, Level 1, Numeric): უდიდესი რიცხვის პოვნა 4-რიცხვიან ჩამონათვალში.
   - Q38 (`g3-u01-38`, Level 1, Numeric): უმცირესი რიცხვის პოვნა 4-რიცხვიან ჩამონათვალში.
   - Q39 (`g3-u01-39`, Level 2, Numeric): ყველაზე დიდი რიცხვის შერჩევა.
   - Q40 (`g3-u01-40`, Level 2, Numeric): ყველაზე პატარა რიცხვის შერჩევა.
   - Q41 (`g3-u01-41`, Level 3, Text/MC): რიცხვების დალაგება ზრდის მიხედვით.
   - Q42 (`g3-u01-42`, Level 3, Text/MC): რიცხვების დალაგება კლების მიხედვით.

8. **U01.8: რომაული ციფრები I, V, X, L** (`u01-roman-numerals`, Q43–Q48)
   - Q43 (`g3-u01-43`, Level 1, Numeric): რომაული ციფრი I (= 1).
   - Q44 (`g3-u01-44`, Level 1, Numeric): რომაული ციფრი V (= 5).
   - Q45 (`g3-u01-45`, Level 2, Numeric): რომაული ციფრი X (= 10).
   - Q46 (`g3-u01-46`, Level 2, Numeric): რომაული ციფრი L (= 50).
   - Q47 (`g3-u01-47`, Level 3, Numeric): რომაული ჩანაწერის გარდაქმნა არაბულ რიცხვად (VII, XV, XL...).
   - Q48 (`g3-u01-48`, Level 3, Text/MC): არაბული რიცხვის ჩაწერა რომაულად.

## Quality Control & Guidelines Adherence
- **Data logging ready:** Every question generates and preserves `template_id`, `generated_parameters`, `student_answer`, `correct_answer`, `is_correct`, `points_change` (+1 / −1), and `attempt_timestamp`.
- **Mathematical accuracy:**
  - Hundred chart movements adhere to right = +1, left = −1, down = +10, down 2 rows = +20.
  - Numbers in neighbor/sequence questions stay within 0–100.
  - Tens and units accurately mirror base-10 decomposition.
  - Roman numerals use standard additive and subtractive conventions (I, V, X, L, IV, IX, VII, XV, XL, etc.).
- **Randomization:** Distractors are uniquely shuffled per question, eliminating fixed-index bias.
- **Variations:** Every template produces ≥ 12 unique variations without warnings.

## Test Verification
- `tests/g3-u01-templates.test.ts`:
  - 8 subtopics verified.
  - 48 authored templates (Q01–Q48) validated.
  - Difficulty levels 1, 2, and 3 represented in all subtopics.
  - Every template generates ≥ 12 unique, valid questions without warnings or unresolved placeholders.
  - Distractors are verified non-empty, mathematically distinct from the correct answer, and non-duplicate.
  - Full end-to-end interactive session simulations to 100 points (`MAX_SCORE`) pass across all 8 subtopics.
- Full test suite: 51 test files, 5,337 passing tests, 0 failures.
- Production build: `npm run build` compiles cleanly.
