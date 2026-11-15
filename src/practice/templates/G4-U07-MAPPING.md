# Grade 4 Unit 7: მრავალსაფეხურიანი ამოცანები (Multi-Step Problems)

## Overview
Unit 07 (`g4-mravalsapexuriani-amocanebi`) implements the complete Grade 4 curriculum for multi-step mathematical problems as specified in Google Docs document `U07` (ID: `1HQpgaCAsGxds3mSeEGo-tiiNFEiqBkTHeV5Ek_nM-yY`, folder `WEBSITE GRADE 4` / `1ICXAouMBmoTDNwQb9J0p5b0XWKFPZFuX`):
- Estimation & rounding in multi-step word problems (rounding to tens/hundreds before or after addition).
- Multi-step addition word problems (3 or 4 addends).
- Mixed multi-step addition and subtraction word problems.
- Finding missing arithmetic operations ($+$, $-$, $\times$, $\div$) in number sentences and grids.
- Identifying sufficient, insufficient, and missing information in mathematical word problems.
- Solving problems via systematic guess-and-check (trial and error).
- Multi-step linear equations ($x \pm a = b$, $k \cdot x = b$, $x \div k = b$, $a \cdot x \pm b = c$).
- Equalizing quantities between two groups using addition and subtraction.
- Multi-step multiplication and addition/subtraction combination problems.
- Time intervals, durations, elapsed time, and scheduled events.
- Determining and comparing quantities with algebraic relationships ($A = B + d$, $A = k \cdot B$).
- Correct order of operations and arithmetic evaluation rules (parentheses, multiplication/division, addition/subtraction).

## Architecture & Subtopics
The unit contains **72 dynamic question templates** (Q01–Q72) evenly distributed across **12 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U07.1: მიახლოებითი ჯამები მრავალსაფეხურიან ამოცანებში** (`u07-approximate-sums`, Q01–Q06)
   - Q01 (`g4-u07-01`, Level 1, Multiple Choice): შეაფასე ჯამი უახლოეს ათეულებამდე დამრგვალებით ($a + b$).
   - Q02 (`g4-u07-02`, Level 1, Multiple Choice): სამი რიცხვის ჯამის შეფასება ათეულებამდე დამრგვალებით ($a + b + c$).
   - Q03 (`g4-u07-03`, Level 2, Multiple Choice): შეაფასე ჯამი უახლოეს ასეულებამდე დამრგვალებით ($a + b$).
   - Q04 (`g4-u07-04`, Level 2, Multiple Choice): მაღაზიის ხარჯების შეფასება ასეულებამდე დამრგვალებით ($a + b + c$).
   - Q05 (`g4-u07-05`, Level 3, Multiple Choice): სამი სიდიდის ჯამის შეფასება ასეულებამდე დამრგვალებით ($a + b + c$).
   - Q06 (`g4-u07-06`, Level 3, Multiple Choice): ოთხი სიდიდის ჯამის შეფასება ათეულებამდე დამრგვალებით ($a + b + c + d$).

2. **U07.2: შეკრების ამოცანები** (`u07-addition-problems`, Q07–Q12)
   - Q07 (`g4-u07-07`, Level 1, Numeric): სამდღიანი შეკრება ($a + b + c$).
   - Q08 (`g4-u07-08`, Level 1, Numeric): სამი ყუთის საერთო წონა ($a + b + c$).
   - Q09 (`g4-u07-09`, Level 2, Numeric): სამ თაროზე წიგნების ჯამური რაოდენობა ($a + b + c$).
   - Q10 (`g4-u07-10`, Level 2, Numeric): ოთხდღიანი გაყიდვების ჯამი ($a + b + c + d$).
   - Q11 (`g4-u07-11`, Level 3, Numeric): სამი ობიექტის ჯამი ($a + b + c$).
   - Q12 (`g4-u07-12`, Level 3, Numeric): ოთხი სკოლის მოსწავლეთა საერთო რაოდენობა ($a + b + c + d$).

3. **U07.3: შერეული ამოცანები** (`u07-mixed-problems`, Q13–Q18)
   - Q13 (`g4-u07-13`, Level 1, Numeric): საწყისი მარაგის ზრდა და შემცირება ($a + b - c$).
   - Q14 (`g4-u07-14`, Level 1, Numeric): ბიბლიოთეკის წიგნების ბრუნვა ($a - b + c$).
   - Q15 (`g4-u07-15`, Level 2, Numeric): თანხის ხარჯვა ორ ეტაპად ($a - b - c$).
   - Q16 (`g4-u07-16`, Level 2, Numeric): საწყობში საქონლის მიღება და გაცემა ($a + b - c$).
   - Q17 (`g4-u07-17`, Level 3, Numeric): ფერმაში მოსავლის დამატება და გაყიდვა ($a + b - c - d$).
   - Q18 (`g4-u07-18`, Level 3, Numeric): ბიუჯეტის მრავალსაფეხურიანი ბალანსი ($a - b + c - d$).

4. **U07.4: ბადეში მოქმედების ნიშნების ჩასმა** (`u07-operation-signs`, Q19–Q24)
   - Q19 (`g4-u07-19`, Level 1, Multiple Choice): ჩასვი „+“ ან „−“: $a \ \square \ b = c$.
   - Q20 (`g4-u07-20`, Level 1, Multiple Choice): ჩასვი „+“ ან „−“: $a \ \square \ b = c$.
   - Q21 (`g4-u07-21`, Level 2, Multiple Choice): ჩასვი „×“ ან „÷“: $a \ \square \ b = c$.
   - Q22 (`g4-u07-22`, Level 2, Multiple Choice): ჩასვი „×“ ან „÷“: $a \ \square \ b = c$.
   - Q23 (`g4-u07-23`, Level 2, Multiple Choice): ჩასვი მოქმედების ნიშანი (+, −, ×, ÷): $a \ \square \ b = c$.
   - Q24 (`g4-u07-24`, Level 3, Multiple Choice): ჩასვი მოქმედების ნიშანი (+, −, ×, ÷): $a \ \square \ b = c$.

5. **U07.5: საკმარისი ან არასაკმარისი პირობის მქონე ამოცანები** (`u07-sufficient-conditions`, Q25–Q30)
   - Q25 (`g4-u07-25`, Level 1, Multiple Choice): მხოლოდ ვაშლის რაოდენობა ცნობილია — საკმარისია საერთოს საპოვნელად?
   - Q26 (`g4-u07-26`, Level 1, Multiple Choice): კვადრატის გვერდით პერიმეტრის პოვნა — საკმარისია?
   - Q27 (`g4-u07-27`, Level 2, Multiple Choice): მგზავრების ასვლა — საკმარისია?
   - Q28 (`g4-u07-28`, Level 2, Multiple Choice): მართკუთხედის სიგრძით ფართობის პოვნა — რა აკლია?
   - Q29 (`g4-u07-29`, Level 2, Multiple Choice): რაოდენობა და ფასი — საკმარისია საერთო ღირებულებისთვის?
   - Q30 (`g4-u07-30`, Level 3, Multiple Choice): ორი ხის ჯამი და სხვაობა — საკმარისია თითოეულის საპოვნელად?

6. **U07.6: ამოცანების ამოხსნა გამოცდისა და შემოწმების გზით** (`u07-guess-and-check`, Q31–Q36)
   - Q31 (`g4-u07-31`, Level 1, Numeric): ორი რიცხვის ჯამია $S$, სხვაობა $D$. იპოვე მეტი.
   - Q32 (`g4-u07-32`, Level 1, Numeric): ორი რიცხვის ჯამია $S$, სხვაობა $D$. იპოვე ნაკლები.
   - Q33 (`g4-u07-33`, Level 2, Numeric): ჯამია $S$, ერთი მეორეზე $k$-ჯერ მეტია. იპოვე ნაკლები.
   - Q34 (`g4-u07-34`, Level 2, Numeric): ჯამია $S$, ერთი მეორეზე $k$-ჯერ მეტია. იპოვე მეტი.
   - Q35 (`g4-u07-35`, Level 3, Numeric): ქათმებისა და კურდღლების თავები და ფეხები — იპოვე კურდღლები.
   - Q36 (`g4-u07-36`, Level 3, Numeric): ქათმებისა და კურდღლების თავები და ფეხები — იპოვე ქათმები.

7. **U07.7: მრავალსაფეხურიანი განტოლებები** (`u07-equations`, Q37–Q42)
   - Q37 (`g4-u07-37`, Level 1, Numeric): $x + a = b \implies x$.
   - Q38 (`g4-u07-38`, Level 1, Numeric): $x - a = b \implies x$.
   - Q39 (`g4-u07-39`, Level 2, Numeric): $k \cdot x = b \implies x$.
   - Q40 (`g4-u07-40`, Level 2, Numeric): $x \div k = b \implies x$.
   - Q41 (`g4-u07-41`, Level 3, Numeric): $k \cdot x + a = b \implies x$.
   - Q42 (`g4-u07-42`, Level 3, Numeric): $k \cdot x - a = b \implies x$.

8. **U07.8: რაოდენობების გათანაბრება შეკრებით** (`u07-equalizing-quantities`, Q43–Q48)
   - Q43 (`g4-u07-43`, Level 1, Numeric): ერთში $a$-ა, მეორეში $b$. რამდენი უნდა გადავიტანოთ გასათანაბრებლად?
   - Q44 (`g4-u07-44`, Level 1, Numeric): $A$-ს აქვს $a$, $B$-ს $b$. რამდენი უნდა მისცეს $A$-მ $B$-ს?
   - Q45 (`g4-u07-45`, Level 2, Numeric): ერთში $a$-ა, მეორეში $b$. რამდენი უნდა დავუმატოთ მეორეს გასათანაბრებლად?
   - Q46 (`g4-u07-46`, Level 2, Numeric): ერთში $a$-ა, მეორეში $b$. რამდენი უნდა გადავიდეს პირველიდან მეორეში?
   - Q47 (`g4-u07-47`, Level 3, Numeric): სამ ყუთშია $a, b, c$. რამდენი იქნება თითოეულში გათანაბრების შემდეგ?
   - Q48 (`g4-u07-48`, Level 3, Numeric): სამ კალათშია $a, b, c$. რამდენი უნდა გადავიდეს პირველიდან მესამეში?

9. **U07.9: გამრავლებისა და შეკრების ამოცანები** (`u07-multiplication-addition`, Q49–Q54)
   - Q49 (`g4-u07-49`, Level 1, Numeric): $k$ ყუთი თითოეულში $a$, და კიდევ $b$ ცალი ($k \times a + b$).
   - Q50 (`g4-u07-50`, Level 1, Numeric): $k_1 \times a + k_2 \times b$ საერთო თანხა.
   - Q51 (`g4-u07-51`, Level 2, Numeric): იყო $T$, გაიყიდა $k \times a$. რამდენი დარჩა? ($T - k \times a$).
   - Q52 (`g4-u07-52`, Level 2, Numeric): $k_1$ ცალი $p_1$ ლარად და $k_2$ ცალი $p_2$ ლარად ($k_1 \times p_1 + k_2 \times p_2$).
   - Q53 (`g4-u07-53`, Level 3, Numeric): გადაიხადა $B$ ლარი $k$ ნივთში, ხურდა დარჩა $R$. რა ღირდა თითოეული? ($(B - R) \div k$).
   - Q54 (`g4-u07-54`, Level 3, Numeric): $k_1 \times p_1 + k_2 \times p_2 + k_3 \times p_3$ საერთო ღირებულება.

10. **U07.10: დროის ინტერვალებთან დაკავშირებული რაოდენობები** (`u07-time-intervals`, Q55–Q60)
    - Q55 (`g4-u07-55`, Level 1, Multiple Choice): გაკვეთილის დაწყება და ხანგრძლივობა — დასრულების დრო.
    - Q56 (`g4-u07-56`, Level 1, Multiple Choice): ფილმის დაწყება და ხანგრძლივობა (სთ და წთ) — დასრულების დრო.
    - Q57 (`g4-u07-57`, Level 2, Multiple Choice): სამი საგნის მეცადინეობის საერთო დრო წუთებში ($m_1 + m_2 + m_3$).
    - Q58 (`g4-u07-58`, Level 2, Multiple Choice): მატარებლის გასვლა და მისვლა — მგზავრობის ხანგრძლივობა.
    - Q59 (`g4-u07-59`, Level 2, Multiple Choice): ვარჯიშის დაწყება და ხანგრძლივობა — დასრულების დრო.
    - Q60 (`g4-u07-60`, Level 3, Multiple Choice): მგზავრობა ორ ეტაპად შესვენებით — საერთო დრო ($t_1 + t_2 + t_{break}$).

11. **U07.11: რაოდენობების განსაზღვრა და შედარება** (`u07-determine-compare`, Q61–Q66)
    - Q61 (`g4-u07-61`, Level 1, Numeric): $B$-ს აქვს $b$, $A$-ს აქვს $k$-ჯერ მეტი. რამდენი აქვს ორივეს ერთად? ($b + k \cdot b$).
    - Q62 (`g4-u07-62`, Level 1, Numeric): $A$-ს აქვს $a$, $B$-ს აქვს $d$-ით ნაკლები. რამდენი აქვს ორივეს ერთად? ($a + a - d$).
    - Q63 (`g4-u07-63`, Level 2, Numeric): $A$-ს აქვს $a$, $B$-ს აქვს $k$-ჯერ მეტი, $C$-ს $d$-ით მეტი $B$-ზე. რამდენი აქვს $C$-ს?
    - Q64 (`g4-u07-64`, Level 2, Numeric): $A$-ს აქვს $a$, $B$-ს აქვს $k$-ჯერ ნაკლები. რამდენით მეტია $A$ $B$-ზე? ($a - a \div k$).
    - Q65 (`g4-u07-65`, Level 3, Numeric): $A, B, C$-ს ურთიერთკავშირი — სამივეს საერთო რაოდენობა.
    - Q66 (`g4-u07-66`, Level 3, Numeric): $A, B, C$-ს შედარებითი რაოდენობები — პირველისა და მესამის სხვაობა.

12. **U07.12: მოქმედებების დალაგება (თანმიმდევრობა)** (`u07-order-of-operations`, Q67–Q72)
    - Q67 (`g4-u07-67`, Level 1, Multiple Choice): პირველი შესასრულებელი მოქმედება გამოსახულებაში $a + b \times c$.
    - Q68 (`g4-u07-68`, Level 1, Multiple Choice): პირველი შესასრულებელი მოქმედება გამოსახულებაში $(a + b) \times c$.
    - Q69 (`g4-u07-69`, Level 2, Multiple Choice): პირველი შესასრულებელი მოქმედება გამოსახულებაში $a - b \div c + d$.
    - Q70 (`g4-u07-70`, Level 2, Multiple Choice): პირველი შესასრულებელი მოქმედება გამოსახულებაში $a \times (b - c) \div d$.
    - Q71 (`g4-u07-71`, Level 3, Numeric): გამოსახულების მნიშვნელობა $a + b \times c - d$.
    - Q72 (`g4-u07-72`, Level 3, Numeric): გამოსახულების მნიშვნელობა $(a + b) \times c - d \div k$.

## Test Verification
- All 72 templates generate at least 12 distinct variations without placeholder leakage (`tests/g4-u07-templates.test.ts`).
- Full simulated gameplay playthroughs reach the maximum score (100 points) on every one of the 12 subtopics.
- Full catalog unit metadata integrity verified (`tests/template-catalog.test.ts`).
