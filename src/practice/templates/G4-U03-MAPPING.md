# Grade 4 Unit 3: გამრავლება (Multiplication)

## Overview
Unit 03 (`g4-gamravleba`) implements the complete Grade 4 curriculum for multiplication as specified in Google Docs document `U03` (ID: `1QNam-JS9uwDgTxiYD7CCewET3BEEyW5qkQLdEYHVaBU`, folder `WEBSITE GRADE 4`):
- Properties of multiplication: commutative law ($a \times b = b \times a$), associative grouping ($a \times (b \times c) = (a \times b) \times c$), and distributive property ($a \times (b + c) = a \times b + a \times c$).
- Multiplication tables up to 12 and missing factor equations ($a \times \square = p$, $\square \times b = p$).
- Written column multiplication of multi-digit numbers by 1-digit, 2-digit, and 3-digit numbers.
- Multiplication of numbers ending with zeros ($a \times 10, 100, 1\,000$ and $a\,00 \times b\,0$).
- Identifying compatible factors and factor pairs that yield a given product.
- Smart calculation shortcuts using grouping and friendly pairs ($2 \times 5 = 10$, $4 \times 25 = 100$, $8 \times 125 = 1\,000$, $50 \times 2 = 100$).
- Product estimation and rounding factors to nearest tens and hundreds.
- Chains of three or more factors ($a \times b \times c$).
- Function and pattern tables with multiplicative rules.
- Evaluating products with rounded factors and establishing product bounds.
- Visual rectangular arrays (rows $\times$ columns) and conservation of items under transposition.
- Effects of factor scaling ($a \times 2b = 2(a \times b)$).
- Multiplication table matrix matching and sequence completion up to 12.

## Architecture & Subtopics
The unit contains **114 dynamic question templates** (Q01–Q114) evenly distributed across **19 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U03.1: გამრავლების თვისებები** (`u03-multiplication-properties`, Q01–Q06)
   - Q01 (`g4-u03-01`, Level 1, Numeric): გამრავლების განრიგებადობის თვისება: $a \times (b + c) = a \times b + a \times c$.
   - Q02 (`g4-u03-02`, Level 1, Numeric): გამრავლების გადანაცვლებადობის თვისება: $a \times b = b \times a$.
   - Q03 (`g4-u03-03`, Level 2, Numeric): გამოთვლა მოხერხებული დაჯგუფებით: $a \times b \times c$ მეგობრული წყვილებით.
   - Q04 (`g4-u03-04`, Level 2, Numeric): შეავსე ტოლობა დაჯგუფებადობის კანონით: $a \times (b \times c) = (a \times b) \times \square$.
   - Q05 (`g4-u03-05`, Level 3, Numeric): გამოთვალე: $a \times (b \times c)$ 2-ნიშნა რიცხვებზე.
   - Q06 (`g4-u03-06`, Level 3, Numeric): განრიგებადობის თვისების გამოყენება გამოთვლის გასამარტივებლად: $a \times b + a \times c = a \times (b + c)$.

2. **U03.2: გამრავლების ტაბულა 12-მდე** (`u03-multiplication-table-12`, Q07–Q12)
   - Q07 (`g4-u03-07`, Level 1, Numeric): ერთნიშნა რიცხვების გამრავლება: $a \times b$.
   - Q08 (`g4-u03-08`, Level 1, Numeric): 12-ზე გამრავლება: $a \times 12$.
   - Q09 (`g4-u03-09`, Level 2, Numeric): 11-ზე გამრავლება: $a \times 11$.
   - Q10 (`g4-u03-10`, Level 2, Numeric): უცნობი რიცხვის პოვნა: $\square \times a = p$.
   - Q11 (`g4-u03-11`, Level 3, Numeric): უცნობი რიცხვის პოვნა ტაბულაში 12-მდე: $a \times \square = p$.
   - Q12 (`g4-u03-12`, Level 3, Numeric): რიცხვის კვადრატი 12-მდე: $a \times a$.

3. **U03.3: უცნობი მამრავლის პოვნა** (`u03-unknown-factor`, Q13–Q18)
   - Q13 (`g4-u03-13`, Level 1, Numeric): უცნობი პირველი მამრავლი ტაბულურ დიაპაზონში: $\square \times a = p$.
   - Q14 (`g4-u03-14`, Level 1, Numeric): უცნობი მეორე მამრავლი: $a \times \square = p$.
   - Q15 (`g4-u03-15`, Level 2, Numeric): უცნობი მამრავლი 2-ნიშნა ნამრავლში: $a \times \square = p$.
   - Q16 (`g4-u03-16`, Level 2, Numeric): უცნობი მამრავლი 100-მდე: $\square \times a = p$.
   - Q17 (`g4-u03-17`, Level 3, Numeric): უცნობი მამრავლი 3-ნიშნა ნამრავლში: $a \times \square = p$.
   - Q18 (`g4-u03-18`, Level 3, Numeric): უცნობი მამრავლი მრგვალ ათეულებზე: $\square \times a = p$.

4. **U03.4: ერთნიშნა რიცხვზე მრავალნიშნა რიცხვის წერითი გამრავლება** (`u03-written-single-digit`, Q19–Q24)
   - Q19 (`g4-u03-19`, Level 1, Numeric): 2-ნიშნა $\times$ 1-ნიშნა გადასვლის გარეშე: $a \times b$.
   - Q20 (`g4-u03-20`, Level 1, Numeric): 2-ნიშნა $\times$ 1-ნიშნა ერთეულების გადასვლით.
   - Q21 (`g4-u03-21`, Level 2, Numeric): 3-ნიშნა $\times$ 1-ნიშნა გადასვლით.
   - Q22 (`g4-u03-22`, Level 2, Numeric): 3-ნიშნა $\times$ 1-ნიშნა ნულოვანი ათეულით ($a0b \times c$).
   - Q23 (`g4-u03-23`, Level 3, Numeric): 4-ნიშნა $\times$ 1-ნიშნა მრავალჯერადი გადასვლით.
   - Q24 (`g4-u03-24`, Level 3, Numeric): 4-ნიშნა $\times$ 1-ნიშნა შიდა ნულებით ($a00b \times c$).

5. **U03.5: ნულით დამთავრებული რიცხვების გამრავლება** (`u03-multiply-ending-zeros`, Q25–Q30)
   - Q25 (`g4-u03-25`, Level 1, Numeric): გამრავლება 10-ზე და 100-ზე: $a \times 10, 100$.
   - Q26 (`g4-u03-26`, Level 1, Numeric): გამრავლება 1 000-ზე: $a \times 1\,000$.
   - Q27 (`g4-u03-27`, Level 2, Numeric): მრგვალი ათეულის გამრავლება ერთნიშნა რიცხვზე: $a0 \times b$.
   - Q28 (`g4-u03-28`, Level 2, Numeric): მრგვალი ასეულის გამრავლება ერთნიშნა რიცხვზე: $a00 \times b$.
   - Q29 (`g4-u03-29`, Level 3, Numeric): ორი მრგვალი ათეულის გამრავლება: $a0 \times b0$.
   - Q30 (`g4-u03-30`, Level 3, Numeric): მრგვალი ასეულისა და ათეულის გამრავლება: $a00 \times b0$.

6. **U03.6: მრავალნიშნა რიცხვების წერითი გამრავლება** (`u03-written-multi-digit`, Q31–Q36)
   - Q31 (`g4-u03-31`, Level 1, Numeric): 2-ნიშნა $\times$ 2-ნიშნა მარტივი გამრავლება ($24 \times 13$).
   - Q32 (`g4-u03-32`, Level 1, Numeric): 2-ნიშნა $\times$ 2-ნიშნა 5-ით დაბოლოებული მამრავლით ($36 \times 25$).
   - Q33 (`g4-u03-33`, Level 2, Numeric): 3-ნიშნა $\times$ 2-ნიშნა გამრავლება ($124 \times 23$).
   - Q34 (`g4-u03-34`, Level 2, Numeric): 3-ნიშნა $\times$ 2-ნიშნა გადასვლებით ($215 \times 34$).
   - Q35 (`g4-u03-35`, Level 3, Numeric): 3-ნიშნა $\times$ 2-ნიშნა რთული სვეტური გამრავლება ($326 \times 42$).
   - Q36 (`g4-u03-36`, Level 3, Numeric): 4-ნიშნა $\times$ 2-ნიშნა სვეტური გამრავლება ($1\,245 \times 16$).

7. **U03.7: ნამრავლის შესაბამისი მამრავლების ამოცნობა** (`u03-identify-factors`, Q37–Q42)
   - Q37 (`g4-u03-37`, Level 1, Text/MC): რომელი ორი რიცხვის ნამრავლია $p$ ($4 \times 9 = 36$).
   - Q38 (`g4-u03-38`, Level 1, Text/MC): შეარჩიე წყვილი, რომლის ნამრავლია $p$ ($8 \times 9 = 72$).
   - Q39 (`g4-u03-39`, Level 2, Text/MC): რომელი წყვილის ნამრავლი არ არის $p$.
   - Q40 (`g4-u03-40`, Level 2, Numeric): იპოვე გამოტოვებული მამრავლი: $a \times \square = p$.
   - Q41 (`g4-u03-41`, Level 3, Text/MC): რომელი წყვილის ნამრავლია 3-ნიშნა რიცხვი $p$ ($15 \times 12 = 180$).
   - Q42 (`g4-u03-42`, Level 3, Numeric): მამრავლის განახევრება/გაორმაგება: $a \times b = (a/2) \times \square$.

8. **U03.8: დაჯგუფების თვისება და გამოთვლის ხერხები** (`u03-associative-tricks`, Q43–Q48)
   - Q43 (`g4-u03-43`, Level 1, Numeric): გამოთვალე: $4 \times 25 \times a = 100 \times a$.
   - Q44 (`g4-u03-44`, Level 1, Numeric): გამოთვალე: $5 \times a \times 2 = 10 \times a$.
   - Q45 (`g4-u03-45`, Level 2, Numeric): გამოთვალე: $8 \times 125 \times a = 1\,000 \times a$.
   - Q46 (`g4-u03-46`, Level 2, Numeric): გამოთვალე მოხერხებული ხერხით: $25 \times 4k = 100 \times k$.
   - Q47 (`g4-u03-47`, Level 3, Numeric): გამოთვალე: $4 \times a \times 25 = 100 \times a$.
   - Q48 (`g4-u03-48`, Level 3, Numeric): გამოთვალე: $50 \times a \times 2 = 100 \times a$.

9. **U03.9: გამრავლების გადანაცვლებადობის კანონი** (`u03-commutative-law`, Q49–Q54)
   - Q49 (`g4-u03-49`, Level 1, Numeric): შეავსე ტოლობა: $a \times b = b \times \square$.
   - Q50 (`g4-u03-50`, Level 1, Text/MC): შეადარე: $a \times b \;\_\_\; b \times a$ ($=$).
   - Q51 (`g4-u03-51`, Level 2, Numeric): შეავსე ტოლობა: $a \times b = b \times \square$.
   - Q52 (`g4-u03-52`, Level 2, Numeric): გამოთვალე ნამრავლი მამრავლთა გადანაცვლებით.
   - Q53 (`g4-u03-53`, Level 3, Text/MC): ჩასვი შესაბამისი ნიშანი: $a \times b \;\_\_\; b \times a$.
   - Q54 (`g4-u03-54`, Level 3, Text/MC): შეარჩიე $a \times b$-ს ტოლი გამოსახულება მამრავლების გადანაცვლებით ($b \times a$).

10. **U03.10: ნამრავლის მიახლოებითი მნიშვნელობა** (`u03-estimate-product`, Q55–Q60)
    - Q55 (`g4-u03-55`, Level 1, Numeric): დაამრგვალე $a$ უახლოეს ათეულამდე და გამოთვალე $a \times b$.
    - Q56 (`g4-u03-56`, Level 1, Numeric): დაამრგვალე $a$ უახლოეს ასეულამდე და გამოთვალე $a \times b$.
    - Q57 (`g4-u03-57`, Level 2, Numeric): დაამრგვალე ორივე მამრავლი უახლოეს ათეულამდე და გამოთვალე $a \times b$.
    - Q58 (`g4-u03-58`, Level 2, Numeric): 3-ნიშნა მამრავლის ასეულამდე დამრგვალებით ნამრავლის მიახლოება.
    - Q59 (`g4-u03-59`, Level 3, Numeric): ორივე 2-ნიშნა რიცხვის ათეულებამდე დამრგვალებით ნამრავლის მიახლოება.
    - Q60 (`g4-u03-60`, Level 3, Numeric): ტექსტური ამოცანა ქარხნის წარმოების მოცულობაზე (დამრგვალებით ასეულამდე).

11. **U03.11: რამდენიმე მამრავლის მქონე მრავალნიშნა გამრავლება** (`u03-multiple-factors`, Q61–Q66)
    - Q61 (`g4-u03-61`, Level 1, Numeric): $a \times b \times c$ მცირე მამრავლებით ($12 \times 3 \times 4$).
    - Q62 (`g4-u03-62`, Level 1, Numeric): $a \times b \times c$ მრგვალი ათეულებით ($25 \times 8 \times 2$).
    - Q63 (`g4-u03-63`, Level 2, Numeric): $a \times b \times c$ საშუალო სიდიდის მამრავლებით ($14 \times 5 \times 6$).
    - Q64 (`g4-u03-64`, Level 2, Numeric): $125 \times b \times c$ მოხერხებული დაჯგუფებით ($125 \times 4 \times 7 = 3\,500$).
    - Q65 (`g4-u03-65`, Level 3, Numeric): $a \times 25 \times 4 = a \times 100$.
    - Q66 (`g4-u03-66`, Level 3, Numeric): $a \times b \times c$ რთული მრავალნიშნა მამრავლებით ($15 \times 12 \times 8$).

12. **U03.12: კანონზომიერებიანი ცხრილის შევსება** (`u03-pattern-table`, Q67–Q72)
    - Q67 (`g4-u03-67`, Level 1, Numeric): წესი 3-ჯერ მეტი: $n \to n \times 3$.
    - Q68 (`g4-u03-68`, Level 1, Numeric): წესი 8-ზე გამრავლება: $n \to n \times 8$.
    - Q69 (`g4-u03-69`, Level 2, Numeric): წესი 25-ზე გამრავლება: $n \to n \times 25$.
    - Q70 (`g4-u03-70`, Level 2, Numeric): იპოვე წესი და შეავსე: $3 \to 12, 5 \to 20, n \to n \times 4$.
    - Q71 (`g4-u03-71`, Level 3, Numeric): წესი 7-ზე გამრავლება: $6 \to 42, 8 \to 56, n \to n \times 7$.
    - Q72 (`g4-u03-72`, Level 3, Numeric): უცნობი მამრავლის წესი: $a \to p \implies k = p / a$.

13. **U03.13: ნამრავლის გამოთვლა დამრგვალებული მამრავლებით** (`u03-product-rounded-factors`, Q73–Q78)
    - Q73 (`g4-u03-73`, Level 1, Numeric): მამრავლის ჩანაცვლება მრგვალი ათეულით ($49 \to 50 \implies 50 \times b$).
    - Q74 (`g4-u03-74`, Level 1, Numeric): მამრავლის ჩანაცვლება მრგვალი ასეულით ($198 \to 200 \implies 200 \times b$).
    - Q75 (`g4-u03-75`, Level 2, Numeric): ორივე მამრავლის ჩანაცვლება მრგვალი ათეულებით ($31 \times 19 \to 30 \times 20$).
    - Q76 (`g4-u03-76`, Level 2, Numeric): 3-ნიშნა მამრავლის ჩანაცვლება მრგვალი ასეულით ($402 \to 400$).
    - Q77 (`g4-u03-77`, Level 3, Numeric): ორივე 2-ნიშნა მამრავლის ჩანაცვლება ($62 \times 48 \to 60 \times 50$).
    - Q78 (`g4-u03-78`, Level 3, Numeric): 3-ნიშნა და 2-ნიშნა მამრავლის ჩანაცვლება ($297 \times 21 \to 300 \times 20$).

14. **U03.14: ნამრავლის შეფასება** (`u03-product-comparison-bounds`, Q79–Q84)
    - Q79 (`g4-u03-79`, Level 1, Text/MC): შეაფასე $a \times b$: ნამრავლი 100-ზე მეტია თუ ნაკლები.
    - Q80 (`g4-u03-80`, Level 1, Text/MC): შეაფასე $a \times b$: ნამრავლი 1 000-ზე მეტია თუ ნაკლები.
    - Q81 (`g4-u03-81`, Level 2, Text/MC): რომელ შუალედშია ნამრავლი (მაგ. 400-სა და 500-ს შორის).
    - Q82 (`g4-u03-82`, Level 2, Text/MC): შეაფასე $a \times b$: ნამრავლი ზღვრულ მნიშვნელობაზე მეტია თუ ნაკლები.
    - Q83 (`g4-u03-83`, Level 3, Text/MC): რომელი ნამრავლია მეტი: $a_1 \times b$ თუ $a_2 \times b$ საერთო მამრავლით.
    - Q84 (`g4-u03-84`, Level 3, Text/MC): ქვედა ზღვარი: ერთი მამრავლია $a$, მეორე $> b \implies$ ნამრავლი $> (a \times b)$.

15. **U03.15: გადანაცვლებადობის თვისება ილუსტრაციებით** (`u03-commutative-arrays`, Q85–Q90)
    - Q85 (`g4-u03-85`, Level 1, Numeric): მართკუთხა განლაგება: $r$ მწკრივი და $c$ წერტილი $\implies r \times c$.
    - Q86 (`g4-u03-86`, Level 1, Numeric): გადალაგებული წერტილები: $c$ მწკრივი და $r$ წერტილი $\implies c \times r$.
    - Q87 (`g4-u03-87`, Level 2, Numeric): ვარსკვლავების მართკუთხა მასივი: $r \times c$.
    - Q88 (`g4-u03-88`, Level 2, Numeric): გადალაგებული ვარსკვლავების მასივი: $c \times r$.
    - Q89 (`g4-u03-89`, Level 3, Numeric): შეავსე: $r \text{ მწკრივი} \times c \text{ წერტილი} = c \text{ მწკრივი} \times \square \text{ წერტილი}$.
    - Q90 (`g4-u03-90`, Level 3, Numeric): სკამების რიგების გადაწყობა: $r \times c = c \times r$.

16. **U03.16: გადანაცვლებადობის თვისების გამოყენება** (`u03-apply-commutative`, Q91–Q96)
    - Q91 (`g4-u03-91`, Level 1, Numeric): გამოთვალე მოხერხებულად: $4 \times a$.
    - Q92 (`g4-u03-92`, Level 1, Numeric): გამოთვალე მოხერხებულად: $125 \times a$ ($125 \times 8k = 1\,000 \times k$).
    - Q93 (`g4-u03-93`, Level 2, Numeric): გადაანაცვლე მამრავლები: $a \times 5 = 5 \times a$.
    - Q94 (`g4-u03-94`, Level 2, Numeric): გამოთვალე მოხერხებულად: $25 \times 4k = 100 \times k$.
    - Q95 (`g4-u03-95`, Level 3, Numeric): შეავსე გადანაცვლებადობის ტოლობა: $a \times 125 = 125 \times \square$.
    - Q96 (`g4-u03-96`, Level 3, Numeric): გამოთვალე: $2 \times a \times 5 = 10 \times a$.

17. **U03.17: ერთი და იმავე რიცხვზე გამრავლება** (`u03-multiply-same-number`, Q97–Q102)
    - Q97 (`g4-u03-97`, Level 1, Numeric): საბაზისო გამრავლება: $a \times b$.
    - Q98 (`g4-u03-98`, Level 1, Text/MC): რამდენჯერ მეტია $a \times 2b$ ნამრავლზე $a \times b$ (2-ჯერ).
    - Q99 (`g4-u03-99`, Level 2, Numeric): თუ $a \times 5 = p$, გამოთვალე $a \times 10 = 2p$.
    - Q100 (`g4-u03-100`, Level 2, Numeric): თუ $a \times 4 = p$, გამოთვალე $a \times 8 = 2p$.
    - Q101 (`g4-u03-101`, Level 3, Numeric): თუ $a \times 3 = p$, გამოთვალე $a \times 6 = 2p$.
    - Q102 (`g4-u03-102`, Level 3, Text/MC): მამრავლის $k$-ჯერ ზრდისას ნამრავლი $k$-ჯერ იზრდება.

18. **U03.18: გამრავლების ცხრილის შევსება (გადათრევა და ჩასმა)** (`u03-table-fill-drag`, Q103–Q108)
    - Q103 (`g4-u03-103`, Level 1, Text/MC): 3-ზე გამრავლების ტაბულის სამეულის შევსება: $3 \times a, 3 \times b, 3 \times c$.
    - Q104 (`g4-u03-104`, Level 1, Text/MC): 5-ზე გამრავლების ტაბულის სამეულის შევსება: $5 \times a, 5 \times b, 5 \times c$.
    - Q105 (`g4-u03-105`, Level 2, Text/MC): 7-ზე გამრავლების ტაბულის სამეულის შევსება: $7 \times a, 7 \times b, 7 \times c$.
    - Q106 (`g4-u03-106`, Level 2, Text/MC): 8-ზე გამრავლების ტაბულის სამეულის შევსება: $8 \times a, 8 \times b, 8 \times c$.
    - Q107 (`g4-u03-107`, Level 3, Text/MC): 9-ზე გამრავლების ტაბულის სამეულის შევსება: $9 \times a, 9 \times b, 9 \times c$.
    - Q108 (`g4-u03-108`, Level 3, Text/MC): 12-ზე გამრავლების ტაბულის სამეულის შევსება: $12 \times a, 12 \times b, 12 \times c$.

19. **U03.19: გამრავლების ტაბულა 12-მდე (გადათრევა და ჩასმა)** (`u03-table-12-drag`, Q109–Q114)
    - Q109 (`g4-u03-109`, Level 1, Text/MC): 7-ზე გამრავლების ტაბულის სვეტი: $a \times 7, b \times 7, c \times 7$.
    - Q110 (`g4-u03-110`, Level 1, Text/MC): 8-ზე გამრავლების ტაბულის სვეტი: $a \times 8, b \times 8, c \times 8$.
    - Q111 (`g4-u03-111`, Level 2, Text/MC): 9-ზე გამრავლების ტაბულის სვეტი: $a \times 9, b \times 9, c \times 9$.
    - Q112 (`g4-u03-112`, Level 2, Text/MC): 12-ზე გამრავლების ტაბულის სვეტი: $a \times 12, b \times 12, c \times 12$.
    - Q113 (`g4-u03-113`, Level 3, Text/MC): 11-ზე გამრავლების ტაბულის სვეტი: $a \times 11, b \times 11, c \times 11$.
    - Q114 (`g4-u03-114`, Level 3, Text/MC): 12-ზე გამრავლების რთული სვეტი: $a \times 12, b \times 12, c \times 12$.

## Verification & Test Coverage
- **Template Count**: Exactly 114 question templates registered in `TEMPLATE_REGISTRY`.
- **Subtopic Coverage**: All 19 subtopics have 6 templates spanning difficulties 1, 2, and 3.
- **Variation Richness**: Every template produces at least 12 distinct mathematical variations.
- **Session Gameplay**: Playthrough tests confirm every subtopic advances to `MAX_SCORE = 100` without errors.
- **Vitest Suite**: `tests/g4-u03-templates.test.ts` (137 tests passing).
