import { describe, expect, it } from 'vitest';
import { G6_U01_SUBTOPICS, G6_U01_TEMPLATES } from '../src/practice/templates/g6-u01-numbers';
import { eachDraw, standardSuite } from './support/g6-harness';
import {
  evalExpr, expressionOf, isPrimeNumber, numberToRoman, numbersIn, parseDecimal, parseValue, primeFactors, qEq, q,
  qNum, romanToNumber, wordsToNumber,
} from './support/g6-eval';

/**
 * Grade VI — Unit 1: numbers.
 *
 * Every re-derivation below reads the **printed** prompt (and, for a numeric
 * key, the printed options) and recomputes the answer without calling the
 * template's own formula, so a wording that drifts away from its key fails here.
 */

const TOPIC = 'g6-numbers';
const MINUS = '\u2212';
const id = (n: number) => `g6-u01-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U01',
  topic: TOPIC,
  subtopics: G6_U01_SUBTOPICS,
  templates: G6_U01_TEMPLATES,
  idPattern: /^g6-u01-q\d{2}$/,
});

const first = (text: string, pattern: RegExp): string => pattern.exec(text)![1]!;
const digitsOfText = (text: string): number[] => text.replace(/\D/g, '').split('').map(Number);
const asNumber = (text: string): number => qNum(parseDecimal(text));
const listAfter = (prompt: string, marker: string): string[] =>
  first(prompt, new RegExp(`${marker}: (.+?)\\. რომელია`)).split('; ');

describe('G6 U01.1 — natural and large numbers', () => {
  it('writes a number in words, and the words read back to the number', () => {
    eachDraw(id(1), (d) => {
      expect(wordsToNumber(d.answer), d.prompt).toBe(asNumber(first(d.prompt, /რიცხვი (.+)\./)));
    });
  });
  it('reads words back into digits', () => {
    eachDraw(id(2), (d) => {
      expect(asNumber(d.answer), d.prompt).toBe(wordsToNumber(first(d.prompt, /ციფრებით: (.+)\./)));
    });
  });
  it('counts whole units of a place', () => {
    const size: Record<string, number> = { ათასი: 1000, ათიათასი: 10000, ასეული: 100, ათეული: 10 };
    eachDraw(id(3), (d) => {
      const unit = first(d.prompt, /სრული (\S+) არის/);
      const n = asNumber(first(d.prompt, /რიცხვში (.+)\?/));
      expect(asNumber(d.answer), d.prompt).toBe(Math.floor(n / size[unit]!));
    });
  });
  it('reads the digit at a place', () => {
    const place: Record<string, number> = { ერთეულების: 0, ათეულების: 1, ასეულების: 2, ათასეულების: 3, ათიათასეულების: 4, ასიათასეულების: 5 };
    eachDraw(id(4), (d) => {
      const n = first(d.prompt, /რიცხვში (.+) რა ციფრი/);
      const k = place[first(d.prompt, /დგას (\S+) თანრიგში/)]!;
      const ds = digitsOfText(n);
      expect(Number(d.answer), d.prompt).toBe(ds[ds.length - 1 - k]);
    });
  });
  it('names the smallest and largest number of a length', () => {
    eachDraw(id(5), (d) => {
      const k = Number(first(d.prompt, /(\d+)-ნიშნა/));
      const wanted = d.prompt.includes('უმცირესი') ? '1' + '0'.repeat(k - 1) : '9'.repeat(k);
      expect(d.answer.replace(/\s/g, ''), d.prompt).toBe(wanted);
    });
  });
  it('orders four numbers', () => {
    eachDraw(id(6), (d) => {
      const items = listAfter(d.prompt, 'დაალაგე (?:ზრდადობით|კლებადობით)').map(asNumber);
      const sorted = [...items].sort((a, b) => (d.prompt.includes('ზრდადობით') ? a - b : b - a));
      expect(d.answer.split('; ').map(asNumber), d.prompt).toEqual(sorted);
    });
  });
});

describe('G6 U01.2 — positional system', () => {
  it('expands a number into its place values', () => {
    eachDraw(id(7), (d) => {
      const n = asNumber(first(d.prompt, /რიცხვი (.+) თანრიგების/));
      const terms = d.answer.split(' + ').map(asNumber);
      expect(terms.reduce((s, x) => s + x, 0), d.prompt).toBe(n);
      expect(terms.length).toBe(String(n).replace(/0/g, '').length);
      for (const term of terms) expect(/^[1-9]0*$/.test(String(term)), `${term} is digit × power of ten`).toBe(true);
    });
  });
  it('finds the value of a digit', () => {
    eachDraw(id(8), (d) => {
      const digit = first(d.prompt, /ციფრ (\d)-ს/);
      const n = first(d.prompt, /რიცხვში (.+)\?/).replace(/\s/g, '');
      const index = n.indexOf(digit);
      expect(n.indexOf(digit, index + 1), 'digit is unique').toBe(-1);
      expect(asNumber(d.answer), d.prompt).toBe(Number(digit) * 10 ** (n.length - 1 - index));
    });
  });
  it('builds the largest number from given digits', () => {
    eachDraw(id(9), (d) => {
      const ds = first(d.prompt, /ციფრებით (.+)\. თითო/).split(', ').map(Number);
      expect(d.answer.replace(/\s/g, ''), d.prompt).toBe([...ds].sort((a, b) => b - a).join(''));
    });
  });
  it('builds the smallest number from given digits, with no leading zero', () => {
    eachDraw(id(10), (d) => {
      const ds = first(d.prompt, /ციფრებით (.+)\. თითო/).split(', ').map(Number);
      const length = Number(first(d.prompt, /უმცირესი (\d+)-ნიშნა/));
      const answer = d.answer.replace(/\s/g, '');
      expect(answer.length, d.prompt).toBe(length);
      expect(answer[0], 'no leading zero').not.toBe('0');
      expect([...answer].sort().join(''), 'uses every digit once').toBe([...ds].map(String).sort().join(''));
      // brute force: no smaller arrangement exists
      const perms = (items: number[]): number[][] =>
        items.length <= 1 ? [items] : items.flatMap((x, i) => perms([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [x, ...p]));
      const best = Math.min(...perms(ds).filter((p) => p[0] !== 0).map((p) => Number(p.join(''))));
      expect(Number(answer), d.prompt).toBe(best);
    }, 15);
  });
  it('compares the value of one digit in two numbers', () => {
    eachDraw(id(11), (d) => {
      const digit = first(d.prompt, /ციფრი (\d) რამდენჯერ/);
      const [n1, n2] = [first(d.prompt, /რიცხვში (.+?) ციფრი/), first(d.prompt, /ვიდრე ციფრი \d რიცხვში (.+)\?/)].map((x) => x.replace(/\s/g, ''));
      const value = (n: string) => 10 ** (n.length - 1 - n.indexOf(digit));
      expect(asNumber(d.answer), d.prompt).toBe(value(n1!) / value(n2!));
    });
  });
  it('fills the missing digit', () => {
    eachDraw(id(12), (d) => {
      const pattern = first(d.prompt, /რიცხვში (.+) გამოტოვებულია/).replace(/\s/g, '');
      const x = first(d.prompt, /□ = (\d)/);
      expect(d.answer.replace(/\s/g, ''), d.prompt).toBe(pattern.replace('□', x));
    });
  });
});

describe('G6 U01.3 — Roman numerals', () => {
  it('writes an Arabic number in Roman', () => {
    eachDraw(id(13), (d) => expect(d.answer, d.prompt).toBe(numberToRoman(Number(first(d.prompt, /რიცხვით (\d+)\./)))));
  });
  it('reads a Roman numeral', () => {
    eachDraw(id(14), (d) => expect(Number(d.answer), d.prompt).toBe(romanToNumber(first(d.prompt, /ციფრებით: (\S+)\./))));
  });
  it('names the larger of two Roman numerals', () => {
    eachDraw(id(15), (d) => {
      const [a, b] = [first(d.prompt, /დიდი: (\S+) თუ/), first(d.prompt, /თუ (\S+)\?/)];
      expect(d.answer, d.prompt).toBe(romanToNumber(a) > romanToNumber(b) ? a : b);
    });
  });
  it('spots the Roman numeral written without subtraction', () => {
    eachDraw(id(16), (d) => {
      const shown = first(d.prompt, /არასწორია?: (.+)\?|არასწორი: (.+)\?/).split(', ');
      const invalid = shown.filter((r) => numberToRoman(romanToNumber(r)) !== r);
      expect(invalid, d.prompt).toEqual([d.answer]);
    });
  });
  it('adds two Roman numerals', () => {
    eachDraw(id(17), (d) => {
      const [a, b] = [first(d.prompt, /რამდენია (\S+) \+/), first(d.prompt, /\+ (\S+)\?/)];
      expect(Number(d.answer), d.prompt).toBe(romanToNumber(a) + romanToNumber(b));
    });
  });
  it('writes a sum in Roman', () => {
    eachDraw(id(18), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(d.answer, d.prompt).toBe(numberToRoman(a! + b!));
    });
  });
});

describe('G6 U01.4 — prime and composite numbers', () => {
  it('picks the one prime', () => {
    eachDraw(id(19), (d) => {
      const shown = first(d.prompt, /: (.+)\?/).split(', ').map(Number);
      expect(shown.filter(isPrimeNumber), d.prompt).toEqual([Number(d.answer)]);
    });
  });
  it('picks the one composite', () => {
    eachDraw(id(20), (d) => {
      const shown = first(d.prompt, /: (.+)\?/).split(', ').map(Number);
      expect(shown.filter((x) => !isPrimeNumber(x)), d.prompt).toEqual([Number(d.answer)]);
    });
  });
  it('lists the primes in a range', () => {
    eachDraw(id(21), (d) => {
      const [lo, hi] = numbersIn(d.prompt);
      const expected: number[] = [];
      for (let x = lo!; x <= hi!; x += 1) if (isPrimeNumber(x)) expected.push(x);
      expect(d.answer.split(', ').map(Number), d.prompt).toEqual(expected);
    });
  });
  it('counts divisors', () => {
    eachDraw(id(22), (d) => {
      const n = Number(first(d.prompt, /რიცხვს (\d+)\?/));
      expect(Number(d.answer), d.prompt).toBe([...Array(n).keys()].filter((i) => n % (i + 1) === 0).length);
    });
  });
  it('classifies a number', () => {
    eachDraw(id(23), (d) => {
      const n = Number(first(d.prompt, /რიცხვი (\d+) მარტივია/));
      expect(d.answer, d.prompt).toBe(isPrimeNumber(n) ? 'მარტივია' : 'შედგენილია');
    });
  });
  it('counts the primes in a list', () => {
    eachDraw(id(24), (d) => {
      const shown = first(d.prompt, /მარტივი: (.+)\?/).split(', ').map(Number);
      expect(Number(d.answer), d.prompt).toBe(shown.filter(isPrimeNumber).length);
    });
  });
});

describe('G6 U01.5 — prime factorisation', () => {
  it('factorises into primes whose product is the number', () => {
    eachDraw(id(25), (d) => {
      const n = Number(first(d.prompt, /დაშალე (\d+) მარტივ/));
      const factors = d.answer.split(' × ').map(Number);
      expect(factors.every(isPrimeNumber), d.answer).toBe(true);
      expect(factors.reduce((p, x) => p * x, 1), d.prompt).toBe(n);
    });
  });
  it('counts one prime in a factorisation', () => {
    eachDraw(id(26), (d) => {
      const p = Number(first(d.prompt, /მამრავლი (\d+) რიცხვის/));
      const n = asNumber(first(d.prompt, /რიცხვის (.+)-ის/));
      expect(Number(d.answer), d.prompt).toBe(primeFactors(n).filter((x) => x === p).length);
    });
  });
  it('multiplies a printed factorisation back', () => {
    eachDraw(id(27), (d) => {
      const factors = first(d.prompt, /დაშლაა (.+)\. რომელი/).split(' × ').map(Number);
      expect(asNumber(d.answer), d.prompt).toBe(factors.reduce((p, x) => p * x, 1));
    });
  });
  it('rebuilds a number from primes and multiplicities', () => {
    eachDraw(id(28), (d) => {
      const trios = [...d.prompt.matchAll(/(\d+) (?:გვხვდება|—) (\d+)-ჯერ/g)].map((m) => [Number(m[1]), Number(m[2])]);
      expect(trios).toHaveLength(3);
      expect(asNumber(d.answer), d.prompt).toBe(trios.reduce((p, [b, e]) => p * b! ** e!, 1));
    });
  });
  it('counts all prime factors with repeats', () => {
    eachDraw(id(29), (d) => {
      const n = Number(first(d.prompt, /მამრავლია (\d+)-ის/));
      expect(Number(d.answer), d.prompt).toBe(primeFactors(n).length);
    });
  });
  it('lists the distinct prime factors', () => {
    eachDraw(id(30), (d) => {
      const n = Number(first(d.prompt, /რომელია (\d+)-ის/));
      expect(d.answer.split(', ').map(Number), d.prompt).toEqual([...new Set(primeFactors(n))]);
    });
  });
});

describe('G6 U01.6 — GCD and LCM', () => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
  it('finds a greatest common divisor', () => {
    eachDraw(id(31), (d) => { const [a, b] = numbersIn(d.prompt); expect(Number(d.answer), d.prompt).toBe(gcd(a!, b!)); });
  });
  it('finds a least common multiple', () => {
    eachDraw(id(32), (d) => { const [a, b] = numbersIn(d.prompt); expect(Number(d.answer), d.prompt).toBe(lcm(a!, b!)); });
  });
  it('solves the two-bells problem', () => {
    eachDraw(id(33), (d) => { const [a, b] = numbersIn(d.prompt); expect(Number(d.answer), d.prompt).toBe(lcm(a!, b!)); });
  });
  it('solves the pencil-sets problem', () => {
    eachDraw(id(34), (d) => { const [a, b] = numbersIn(d.prompt); expect(Number(d.answer), d.prompt).toBe(gcd(a!, b!)); });
  });
  it('finds a three-number gcd', () => {
    eachDraw(id(35), (d) => { const [a, b, c] = numbersIn(d.prompt); expect(Number(d.answer), d.prompt).toBe(gcd(gcd(a!, b!), c!)); });
  });
  it('finds a three-number lcm', () => {
    eachDraw(id(36), (d) => {
      const [a, b, c] = numbersIn(d.prompt);
      const l = lcm(lcm(a!, b!), c!);
      expect(Number(d.answer), d.prompt).toBe(l);
      expect([a, b, c].every((x) => l % x! === 0)).toBe(true);
    });
  });
});

describe('G6 U01.7 — whole and negative numbers', () => {
  it('adds signed numbers', () => {
    eachDraw(id(37), (d) => expect(qEq(parseValue(d.answer), evalExpr(expressionOf(d.prompt))), d.prompt).toBe(true));
  });
  it('subtracts signed numbers', () => {
    eachDraw(id(38), (d) => expect(qEq(parseValue(d.answer), evalExpr(expressionOf(d.prompt))), d.prompt).toBe(true));
  });
  it('moves a temperature', () => {
    eachDraw(id(39), (d) => {
      const start = parseDecimal(first(d.prompt, /იყო (\S+)°C/));
      const k = Number(first(d.prompt, /ის (\d+) გრადუსით/));
      const end = d.prompt.includes('გაიზარდა') ? start.n + k : start.n - k;
      expect(parseValue(d.answer.replace('°C', '')).n, d.prompt).toBe(end);
    });
  });
  it('orders signed numbers', () => {
    eachDraw(id(40), (d) => {
      const items = first(d.prompt, /: (.+)\. რომელია/).split('; ').map((x) => qNum(parseDecimal(x)));
      const sorted = [...items].sort((a, b) => (d.prompt.includes('ზრდადობით') ? a - b : b - a));
      expect(d.answer.split('; ').map((x) => qNum(parseDecimal(x))), d.prompt).toEqual(sorted);
    });
  });
  it('shifts a number by a distance', () => {
    eachDraw(id(41), (d) => {
      const [a, k] = numbersIn(d.prompt.replace('რიცხვი', ''));
      expect(asNumber(d.answer), d.prompt).toBe(d.prompt.includes('მეტია') ? a! + k! : a! - k!);
    });
  });
  it('names the smaller of two numbers', () => {
    eachDraw(id(42), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(Math.min(a!, b!));
    });
  });
});

describe('G6 U01.8 — rational numbers', () => {
  it('turns a fraction into a decimal', () => {
    eachDraw(id(43), (d) => {
      const [n, den] = first(d.prompt, /წილადი (\S+) ათწილადის/).split('/').map(Number);
      expect(qEq(parseDecimal(d.answer), q(n!, den!)), d.prompt).toBe(true);
    });
  });
  it('turns a decimal into a reduced fraction', () => {
    eachDraw(id(44), (d) => {
      const x = parseDecimal(first(d.prompt, /ათწილადი (\S+) ჩვეულებრივი/));
      expect(qEq(parseValue(d.answer), x), d.prompt).toBe(true);
      const [n, den] = d.answer.split('/').map(Number);
      expect(primeFactors(n!).some((p) => den! % p === 0), 'not reduced').toBe(false);
    });
  });
  for (const [n, label] of [[45, 'adds fractions'], [46, 'subtracts fractions'], [47, 'adds like fractions with a sign']] as const) {
    it(label, () => {
      eachDraw(id(n), (d) => expect(qEq(parseValue(d.answer), evalExpr(expressionOf(d.prompt))), d.prompt).toBe(true));
    });
  }
  it('orders fractions and decimals', () => {
    eachDraw(id(48), (d) => {
      const items = first(d.prompt, /: (.+)\. რომელია/).split('; ');
      const value = (x: string) => qNum(evalExpr(x));
      expect(d.answer.split('; ').map(value), d.prompt).toEqual(items.map(value).sort((a, b) => a - b));
    });
  });
});

describe('G6 U01.9 — absolute value', () => {
  it('takes a modulus', () => {
    eachDraw(id(49), (d) => expect(asNumber(d.answer), d.prompt).toBe(Math.abs(asNumber(first(d.prompt, /\|(.+)\|/)))));
  });
  for (const n of [50, 51]) {
    it(`evaluates a modulus expression (${n})`, () => {
      eachDraw(id(n), (d) => expect(qEq(parseValue(d.answer), evalExpr(expressionOf(d.prompt))), d.prompt).toBe(true));
    });
  }
  it('names the two numbers at a distance from zero', () => {
    eachDraw(id(52), (d) => {
      const k = Number(first(d.prompt, /ნულისგან (\d+) ერთეულით/));
      expect(d.answer, d.prompt).toBe(`${MINUS}${k} და ${k}`);
    });
  });
  it('solves |x| = k with a sign condition', () => {
    eachDraw(id(53), (d) => {
      const k = Number(first(d.prompt, /\|x\| = (\d+)/));
      expect(asNumber(d.answer), d.prompt).toBe(d.prompt.includes('x <') ? -k : k);
    });
  });
  it('compares moduli', () => {
    eachDraw(id(54), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(Math.abs(a!) > Math.abs(b!) ? a : b);
    });
  });
});

describe('G6 U01.10 — comparing and ordering', () => {
  const sign = (x: number, y: number) => (x < y ? '<' : x > y ? '>' : '=');
  it('compares two integers', () => {
    eachDraw(id(55), (d) => { const [a, b] = numbersIn(d.prompt); expect(d.answer, d.prompt).toBe(sign(a!, b!)); });
  });
  it('compares a fraction with a decimal', () => {
    eachDraw(id(56), (d) => {
      const f = qNum(evalExpr(first(d.prompt, /: (\S+) □/)));
      const x = qNum(parseDecimal(first(d.prompt, /□ (\S+)\./)));
      expect(d.answer, d.prompt).toBe(sign(Math.round(f * 1000), Math.round(x * 1000)));
    });
  });
  it('orders integers from largest to smallest', () => {
    eachDraw(id(57), (d) => {
      const items = first(d.prompt, /: (.+)\. რომელია/).split('; ').map((x) => qNum(parseDecimal(x)));
      expect(d.answer.split('; ').map((x) => qNum(parseDecimal(x))), d.prompt).toEqual([...items].sort((a, b) => b - a));
    });
  });
  it('compares two expressions', () => {
    eachDraw(id(58), (d) => {
      const [l, r] = first(d.prompt, /გამოსახულებები: (.+)\.$/).split(' □ ');
      expect(d.answer, d.prompt).toBe(sign(qNum(evalExpr(l!)), qNum(evalExpr(r!))));
    });
  });
  it('orders fractions', () => {
    eachDraw(id(59), (d) => {
      const items = first(d.prompt, /: (.+)\. რომელია/).split('; ');
      const value = (x: string) => qNum(evalExpr(x));
      expect(d.answer.split('; ').map(value), d.prompt).toEqual(items.map(value).sort((a, b) => a - b));
    });
  });
  it('compares modulus expressions', () => {
    eachDraw(id(60), (d) => {
      const [l, r] = first(d.prompt, /გამოსახულებები: (.+)\.$/).split(' □ ');
      expect(d.answer, d.prompt).toBe(sign(qNum(evalExpr(l!)), qNum(evalExpr(r!))));
    });
  });
});

describe('G6 U01 — the key is the only right option', () => {
  it('never offers a second option that is also correct (numeric keys)', () => {
    for (const n of [37, 38, 45, 46, 47, 50, 51]) {
      eachDraw(id(n), (d) => {
        const value = evalExpr(expressionOf(d.prompt));
        const correct = d.options.filter((option) => qEq(parseValue(option), value));
        expect(correct, d.prompt).toEqual([d.answer]);
      });
    }
  });
});
