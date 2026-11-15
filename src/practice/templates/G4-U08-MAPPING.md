# Grade 4 Unit 8: მონაცემთა ანალიზი (Data Analysis)

## Overview
Unit 08 (`g4-monacemta-analizi`) implements the complete Grade 4 curriculum for data analysis and interpretation as specified in Google Docs document `U08` (ID: `1S_K77AQ_VPV3TzCSDOa2co59efB8CktRWgAzQNBBxHU`, folder `WEBSITE GRADE 4` / `1ICXAouMBmoTDNwQb9J0p5b0XWKFPZFuX`):
- Data collection, surveys, and multi-value aggregation.
- Data selection, filtering, threshold conditions, and numerical properties (e.g. parity).
- Reading, interpreting, and querying data tables.
- Interpreting graphical charts, comparisons, and combined totals.
- Pictograms with scaled keys (each symbol representing 2, 3, 4, 5, 10 units).
- Bar charts (horizontal/vertical bar representations, comparisons, and summations).
- Frequency tables, tallying counts, and finding frequencies of specific values.

## Architecture & Subtopics
The unit contains **42 dynamic question templates** (Q01–Q42) evenly distributed across **7 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U08.1: მონაცემების შეგროვება** (`u08-data-collection`, Q01–Q06)
   - Q01 (`g4-u08-01`, Level 1, Numeric): საყვარელი სპორტის სახეობების ჯამური რაოდენობა ($a + b + c$).
   - Q02 (`g4-u08-02`, Level 1, Multiple Choice): კვირის ტემპერატურის მონაცემები — ყველაზე მაღალი ტემპერატურის დღე.
   - Q03 (`g4-u08-03`, Level 2, Multiple Choice): ხილის გამოკითხვა — ყველაზე ხშირად დასახელებული ხილი.
   - Q04 (`g4-u08-04`, Level 2, Numeric): სკოლის ეზოს ხეების საერთო რაოდენობა ($a + b + c$).
   - Q05 (`g4-u08-05`, Level 3, Numeric): ხუთდღიანი გაყიდვების ჯამი ($d_1 + d_2 + d_3 + d_4 + d_5$).
   - Q06 (`g4-u08-06`, Level 3, Numeric): წაკითხული წიგნების სიხშირე კონკრეტული მნიშვნელობისთვის.

2. **U08.2: მონაცემების შერჩევა** (`u08-data-selection`, Q07–Q12)
   - Q07 (`g4-u08-07`, Level 1, Numeric): მოცემული ზღვარზე (10) მეტი რიცხვების რაოდენობა.
   - Q08 (`g4-u08-08`, Level 1, Numeric): 20°C-ზე მაღალი ტემპერატურების რაოდენობა.
   - Q09 (`g4-u08-09`, Level 2, Numeric): 25-ზე მეტი გაყიდვების რაოდენობების შერჩევა.
   - Q10 (`g4-u08-10`, Level 2, Numeric): კონკრეტული ასაკის მოსწავლეთა რაოდენობა სიაში.
   - Q11 (`g4-u08-11`, Level 3, Numeric): ლუწი რიცხვების რაოდენობა ჩამონათვალში.
   - Q12 (`g4-u08-12`, Level 3, Numeric): 50-ზე მეტი წიგნის მქონე თაროების რაოდენობა.

3. **U08.3: ცხრილების წაკითხვა** (`u08-reading-tables`, Q13–Q18)
   - Q13 (`g4-u08-13`, Level 1, Multiple Choice): ცხრილიდან ყველაზე პოპულარული ხილის პოვნა.
   - Q14 (`g4-u08-14`, Level 1, Numeric): ორი კატეგორიის ჯამური რაოდენობა ცხრილში.
   - Q15 (`g4-u08-15`, Level 2, Multiple Choice): ცხრილის მიხედვით ყველაზე მაღალი მაჩვენებლის დღე.
   - Q16 (`g4-u08-16`, Level 2, Numeric): ცხრილის ოთხივე მონაცემის საერთო ჯამი.
   - Q17 (`g4-u08-17`, Level 3, Numeric): ორ სიდიდეს შორის სხვაობა ცხრილის მიხედვით.
   - Q18 (`g4-u08-18`, Level 3, Numeric): ორი განყოფილების წიგნების ჯამური რაოდენობა.

4. **U08.4: დიაგრამების წაკითხვა** (`u08-reading-charts`, Q19–Q24)
   - Q19 (`g4-u08-19`, Level 1, Multiple Choice): დიაგრამაზე ყველაზე მაღალი მაჩვენებლის დღის ამოცნობა.
   - Q20 (`g4-u08-20`, Level 1, Numeric): დიაგრამის ორი სვეტის ჯამი.
   - Q21 (`g4-u08-21`, Level 2, Multiple Choice): დიაგრამაზე ყველაზე დაბალი მაჩვენებლის კლასი.
   - Q22 (`g4-u08-22`, Level 2, Numeric): ორ კლასს შორის სხვაობის გამოთვლა დიაგრამიდან.
   - Q23 (`g4-u08-23`, Level 3, Numeric): ხუთი სვეტის საერთო ჯამი.
   - Q24 (`g4-u08-24`, Level 3, Numeric): ორ კატეგორიას შორის სხვაობის პოვნა დიაგრამიდან.

5. **U08.5: პიქტოგრამები** (`u08-pictograms`, Q25–Q30)
   - Q25 (`g4-u08-25`, Level 1, Numeric): ვარსკვლავის სიმბოლო ($★ = 5$) — საერთო რაოდენობა ($n \times 5$).
   - Q26 (`g4-u08-26`, Level 1, Numeric): ვაშლის სიმბოლო ($🍎 = 4$) — საერთო რაოდენობა ($n \times 4$).
   - Q27 (`g4-u08-27`, Level 2, Numeric): ბურთის სიმბოლო ($⚽ = 3$) — საერთო რაოდენობა ($n \times 3$).
   - Q28 (`g4-u08-28`, Level 2, Numeric): ყვავილის სიმბოლო ($🌼 = 2$) — სხვაობა ორ ნაკვეთს შორის ($ (n_1 - n_2) \times 2 $).
   - Q29 (`g4-u08-29`, Level 3, Numeric): წიგნის სიმბოლო ($📘 = 10$) — საერთო რაოდენობა ($n \times 10$).
   - Q30 (`g4-u08-30`, Level 3, Numeric): ვარსკვლავის სიმბოლო ($★ = 4$) — სხვაობა ქულებში ($ (n_1 - n_2) \times 4 $).

6. **U08.6: სვეტოვანი დიაგრამები** (`u08-bar-charts`, Q31–Q36)
   - Q31 (`g4-u08-31`, Level 1, Numeric): კონკრეტული დღის მნიშვნელობის ამოკითხვა სვეტოვანი დიაგრამიდან.
   - Q32 (`g4-u08-32`, Level 1, Numeric): ორი სვეტის სხვაობა სვეტოვან დიაგრამაზე.
   - Q33 (`g4-u08-33`, Level 2, Multiple Choice): ყველაზე მაღალი სვეტის მფლობელის დადგენა.
   - Q34 (`g4-u08-34`, Level 2, Numeric): ოთხი სვეტის მონაცემთა სრული ჯამი.
   - Q35 (`g4-u08-35`, Level 3, Numeric): სკოლების მოსწავლეთა რაოდენობის სხვაობა.
   - Q36 (`g4-u08-36`, Level 3, Numeric): ორი სკოლის მოსწავლეთა საერთო ჯამი.

7. **U08.7: სიხშირეთა ცხრილები** (`u08-frequency-tables`, Q37–Q42)
   - Q37 (`g4-u08-37`, Level 1, Numeric): ფერების ჩამონათვალში მოცემული ფერის სიხშირის დათვლა.
   - Q38 (`g4-u08-38`, Level 1, Numeric): მონაცემთა რიგში რიცხვის სიხშირის განსაზღვრა.
   - Q39 (`g4-u08-39`, Level 2, Numeric): მოსწავლეთა ქულების სიხშირის დათვლა.
   - Q40 (`g4-u08-40`, Level 2, Numeric): სიხშირეთა ცხრილიდან დღეების რაოდენობის ამოკითხვა.
   - Q41 (`g4-u08-41`, Level 3, Numeric): 10-ელემენტიან მონაცემთა რიგში სიხშირის პოვნა.
   - Q42 (`g4-u08-42`, Level 3, Numeric): წაკითხული წიგნების მონაცემთა რიგში სიხშირის პოვნა.

## Test Verification
- All 42 templates generate at least 12 distinct variations without placeholder leakage (`tests/g4-u08-templates.test.ts`).
- Full simulated gameplay playthroughs reach the maximum score (100 points) on every one of the 7 subtopics.
- Full catalog unit metadata integrity verified (`tests/template-catalog.test.ts`).
