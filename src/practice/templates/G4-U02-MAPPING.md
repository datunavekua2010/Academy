# Grade 4 Unit 2: შეკრება და გამოკლება (Addition and Subtraction)

## Overview
Unit 02 (`g4-shekreba-gamokleba`) implements the Grade 4 curriculum for multi-digit addition and subtraction as specified in Google Docs document `U02` (ID: `17KS8Sxpfkt9P8ynYoZF7uEU2Pk5P3AAPdiYCABM480w`, folder `WEBSITE GRADE 4`):
- Finding unknown numbers in addition and subtraction equations ($\square + A = B$, $A - \square = B$, $\square - A = B$) up to 5-digit numbers.
- Addition of multi-digit numbers up to 1,000,000 with place value regrouping and carries.
- Subtraction of multi-digit numbers up to 1,000,000 with borrowing, internal zeros, and subtraction from 1,000,000.
- Expanded form decomposition and synthesis across thousands, ten-thousands, and hundred-thousands.
- Estimating sums by rounding to the nearest hundred, thousand, and ten-thousand.
- Estimating differences by rounding to the nearest hundred, thousand, and ten-thousand.
- Real-world word problems on estimated sums and differences (library book counts, municipal district populations, factory manufacturing volumes, store inventory).
- Missing value component tables: addend, second addend, sum; minuend, subtrahend, difference.
- Properties of operations and relational reasoning: scaled operations ($\times 10$), commutative property of addition, inverse operations, and balancing equations.
- Multi-tier number pyramids: computing top brick values by summing base and middle tier adjacent cells, and finding missing base cells.

## Architecture & Subtopics
The unit contains **60 dynamic question templates** (Q01–Q60) evenly distributed across **10 subtopics** (6 questions each) covering progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U02.1: უცნობი რიცხვის პოვნა** (`u02-unknown-number`, Q01–Q06)
   - Q01 (`g4-u02-01`, Level 1, Numeric): პირველი უცნობი შესაკრები 4-ნიშნა რიცხვებში ($\square + A = B$).
   - Q02 (`g4-u02-02`, Level 1, Numeric): უცნობი მაკლები 4-ნიშნა რიცხვებში ($A - \square = B$).
   - Q03 (`g4-u02-03`, Level 2, Numeric): უცნობი საკლები 4-ნიშნა რიცხვებში ($\square - A = B$).
   - Q04 (`g4-u02-04`, Level 2, Numeric): მეორე უცნობი შესაკრები მრგვალი ათასეულების ჯამით ($A + \square = B$).
   - Q05 (`g4-u02-05`, Level 3, Numeric): უცნობი შესაკრები 5-ნიშნა რიცხვებში ($\square + A = B$).
   - Q06 (`g4-u02-06`, Level 3, Numeric): უცნობი მაკლები 5-ნიშნა რიცხვებში ($A - \square = B$).

2. **U02.2: შეკრება მილიონამდე** (`u02-addition-million`, Q07–Q12)
   - Q07 (`g4-u02-07`, Level 1, Numeric): 5-ნიშნა რიცხვების შეკრება ($24\,560 + 13\,280$).
   - Q08 (`g4-u02-08`, Level 1, Numeric): 6-ნიშნა რიცხვების შეკრება მრგვალი ასეულებით ($156\,700 + 242\,500$).
   - Q09 (`g4-u02-09`, Level 2, Numeric): 6-ნიშნა რიცხვების ზოგადი შეკრება ($378\,456 + 214\,327$).
   - Q10 (`g4-u02-10`, Level 2, Numeric): 6-ნიშნა რიცხვების შეკრება ნულოვანი თანრიგებით ($425\,680 + 306\,145$).
   - Q11 (`g4-u02-11`, Level 3, Numeric): 6-ნიშნა რიცხვების შეკრება მრავალჯერადი გადასვლებით ($567\,890 + 123\,456$).
   - Q12 (`g4-u02-12`, Level 3, Numeric): 6-ნიშნა რიცხვების შეკრება მრგვალ ათასეულებამდე ($648\,275 + 251\,725$).

3. **U02.3: გამოკლება მილიონამდე** (`u02-subtraction-million`, Q13–Q18)
   - Q13 (`g4-u02-13`, Level 1, Numeric): 5-ნიშნა რიცხვების გამოკლება ($58\,600 - 24\,300$).
   - Q14 (`g4-u02-14`, Level 1, Numeric): გამოკლება მრგვალი ასიათასეულებიდან ($300\,000 - 147\,500$).
   - Q15 (`g4-u02-15`, Level 2, Numeric): 6-ნიშნა რიცხვების ზოგადი გამოკლება ($624\,815 - 312\,407$).
   - Q16 (`g4-u02-16`, Level 2, Numeric): გამოკლება ნულებიანი საკლებიდან ($700\,000 - 286\,459$).
   - Q17 (`g4-u02-17`, Level 3, Numeric): 6-ნიშნა გამოკლება შიდა ნულოვანი თანრიგებით ($905\,620 - 478\,235$).
   - Q18 (`g4-u02-18`, Level 3, Numeric): გამოკლება მილიონიდან ($1\,000\,000 - 654\,789$).

4. **U02.4: რიცხვის წარმოდგენა შესაკრებების ჯამის სახით** (`u02-expanded-form`, Q19–Q24)
   - Q19 (`g4-u02-19`, Level 1, Text/MC): 4-ნიშნა რიცხვის დაშლა სათანრიგო შესაკრებებად ($4\,582$).
   - Q20 (`g4-u02-20`, Level 1, Text/MC): 5-ნიშნა რიცხვის დაშლა ნულით ($36\,407$).
   - Q21 (`g4-u02-21`, Level 2, Text/MC): 6-ნიშნა რიცხვის დაშლა ნულით ($205\,630$).
   - Q22 (`g4-u02-22`, Level 2, Text/MC): 6-ნიშნა რიცხვის დაშლა რამდენიმე ნულით ($740\,018$).
   - Q23 (`g4-u02-23`, Level 3, Numeric): გამოტოვებული შესაკრების პოვნა გაშლილ ჩანაწერში ($50\,000 + 7\,000 + \square + 6 = 57\,846$).
   - Q24 (`g4-u02-24`, Level 3, Numeric): რიცხვის აღდგენა სათანრიგო შესაკრებების ჯამიდან ($300\,000 + 40\,000 + 2\,000 + 500 + 9$).

5. **U02.5: ჯამის მიახლოებითი გამოთვლა** (`u02-estimate-sum`, Q25–Q30)
   - Q25 (`g4-u02-25`, Level 1, Numeric): შესაკრებების დამრგვალება უახლოეს ათასეულამდე ($4\,280 + 3\,610$).
   - Q26 (`g4-u02-26`, Level 1, Numeric): შესაკრებების დამრგვალება უახლოეს ათიათასეულამდე ($34\,500 + 42\,700$).
   - Q27 (`g4-u02-27`, Level 2, Numeric): 5-ნიშნა ჯამის მიახლოებითი გამოთვლა უახლოეს ათასეულამდე დამრგვალებით ($26\,480 + 12\,350$).
   - Q28 (`g4-u02-28`, Level 2, Numeric): დამრგვალება უახლოეს ასეულამდე ($3\,478 + 2\,641$).
   - Q29 (`g4-u02-29`, Level 3, Numeric): 6-ნიშნა ჯამის მიახლოებითი გამოთვლა უახლოეს ათიათასეულამდე ($248\,000 + 361\,000$).
   - Q30 (`g4-u02-30`, Level 3, Numeric): ტექსტური ამოცანა წიგნების მაღაზიაში მიღებული წიგნების ჯამზე (ათასეულებამდე).

6. **U02.6: სხვაობის მიახლოებითი გამოთვლა** (`u02-estimate-diff`, Q31–Q36)
   - Q31 (`g4-u02-31`, Level 1, Numeric): დამრგვალება უახლოეს ათასეულამდე ($8\,750 - 3\,280$).
   - Q32 (`g4-u02-32`, Level 1, Numeric): დამრგვალება უახლოეს ათიათასეულამდე ($76\,000 - 32\,000$).
   - Q33 (`g4-u02-33`, Level 2, Numeric): დამრგვალება უახლოეს ასეულამდე ($5\,683 - 2\,241$).
   - Q34 (`g4-u02-34`, Level 2, Numeric): 5-ნიშნა სხვაობის მიახლოებითი გამოთვლა უახლოეს ათასეულამდე ($42\,650 - 18\,420$).
   - Q35 (`g4-u02-35`, Level 3, Numeric): 6-ნიშნა სხვაობის მიახლოებითი გამოთვლა უახლოეს ათიათასეულამდე ($685\,000 - 243\,000$).
   - Q36 (`g4-u02-36`, Level 3, Numeric): ტექსტური ამოცანა საწყობში დარჩენილ ფქვილზე (ათასეულებამდე).

7. **U02.7: ტექსტური ამოცანები მიახლოებით ჯამსა და სხვაობაზე** (`u02-estimate-word-problems`, Q37–Q42)
   - Q37 (`g4-u02-37`, Level 1, Numeric): ბიბლიოთეკაში ქართული და უცხოური წიგნების რაოდენობა (ათასეულებამდე).
   - Q38 (`g4-u02-38`, Level 1, Numeric): ქალაქის ორ უბანში მოსახლეობის სხვაობა (ათასეულებამდე).
   - Q39 (`g4-u02-39`, Level 2, Numeric): ქარხნის მიერ ორ თვეში დამზადებული ნივთები (ათიათასეულებამდე).
   - Q40 (`g4-u02-40`, Level 2, Numeric): მაღაზიაში დარჩენილი წყლის ბოთლების რაოდენობა (ათასეულებამდე).
   - Q41 (`g4-u02-41`, Level 3, Numeric): მუზეუმის დამთვალიერებლები ორ დღეში (ათასეულებამდე).
   - Q42 (`g4-u02-42`, Level 3, Numeric): ორ სოფელში მოსახლეობის სხვაობა (ათიათასეულებამდე).

8. **U02.8: ცხრილის შევსება** (`u02-fill-table`, Q43–Q48)
   - Q43 (`g4-u02-43`, Level 1, Numeric): პირველი შესაკრები და მეორე შესაკრები მოცემულია -> ჯამის პოვნა.
   - Q44 (`g4-u02-44`, Level 1, Numeric): საკლები და მაკლები მოცემულია -> სხვაობის პოვნა.
   - Q45 (`g4-u02-45`, Level 2, Numeric): პირველი შესაკრები და ჯამი მოცემულია -> მეორე შესაკრების პოვნა.
   - Q46 (`g4-u02-46`, Level 2, Numeric): საკლები და სხვაობა მოცემულია -> მაკლების პოვნა.
   - Q47 (`g4-u02-47`, Level 3, Numeric): მაკლები და სხვაობა მოცემულია -> საკლების პოვნა.
   - Q48 (`g4-u02-48`, Level 3, Numeric): 6-ნიშნა პირველი შესაკრები და ჯამი მოცემულია -> მეორე შესაკრების პოვნა.

9. **U02.9: შესაბამისი მოქმედებები** (`u02-related-operations`, Q49–Q54)
   - Q49 (`g4-u02-49`, Level 1, Numeric): 10-ჯერ მასშტაბირებული შეკრება ($A + B = S \implies 10A + 10B = 10S$).
   - Q50 (`g4-u02-50`, Level 1, Numeric): 10-ჯერ მასშტაბირებული გამოკლება ($A - B = D \implies 10A - 10B = 10D$).
   - Q51 (`g4-u02-51`, Level 2, Numeric): შეკრების გადანაცვლებადობა ($A + B = B + \square$).
   - Q52 (`g4-u02-52`, Level 2, Numeric): გამოკლების იდენტურობა ($A - B = A - \square$).
   - Q53 (`g4-u02-53`, Level 3, Numeric): შეკრებისა და გამოკლების ურთიერთშებრუნებულობა ($A + B = S \implies S - A = \square$).
   - Q54 (`g4-u02-54`, Level 3, Numeric): განტოლების დაბალანსება ($A + B = \square - C$).

10. **U02.10: რიცხვითი პირამიდები** (`u02-number-pyramids`, Q55–Q60)
    - Q55 (`g4-u02-55`, Level 1, Numeric): ერთნიშნა რიცხვების 3-დონიანი პირამიდის ზედა უჯრა ($A + 2B + C$).
    - Q56 (`g4-u02-56`, Level 1, Numeric): ათეულების 3-დონიანი პირამიდის ზედა უჯრა.
    - Q57 (`g4-u02-57`, Level 2, Numeric): ასეულების 3-დონიანი პირამიდის ზედა უჯრა.
    - Q58 (`g4-u02-58`, Level 2, Numeric): ათასეულების 3-დონიანი პირამიდის ზედა უჯრა.
    - Q59 (`g4-u02-59`, Level 3, Numeric): შერეული ათასეულების 3-დონიანი პირამიდის ზედა უჯრა.
    - Q60 (`g4-u02-60`, Level 3, Numeric): პირამიდის ქვედა რიგის გამოტოვებული უჯრის პოვნა შუა რიგის მიხედვით.

## Verification & Testing
- Unit test suite: `tests/g4-u02-templates.test.ts`
  - 74 passing tests.
  - Verifies all 10 subtopics and all 60 authored templates (Q01–Q60).
  - Asserts full difficulty distribution across Levels 1, 2, and 3.
  - Verifies dynamic question generation and absence of unparsed bracket templates.
  - Simulates end-to-end interactive student sessions from 0 to 100 points (`MAX_SCORE`) on every subtopic.
- Overall catalog test suite: `tests/template-catalog.test.ts`
  - All tests passing across the academy catalog.
