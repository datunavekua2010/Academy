import { describe, expect, it } from 'vitest';
import { G6_U14_SUBTOPICS, G6_U14_TEMPLATES } from '../src/practice/templates/g6-u14-patterns-chance';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 14: patterns and chance. Sequences are read back from the
 * prompt and extended with the rule the prompt implies; "which does not belong"
 * is re-checked against the family; chance questions against the rule of the
 * die, the coin and the bag.
 */

const id = (n: number) => `g6-u14-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U14',
  topic: 'g6-patterns-chance',
  subtopics: G6_U14_SUBTOPICS,
  templates: G6_U14_TEMPLATES,
  idPattern: /^g6-u14-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
const nums = (text: string): number[] => (ungroup(text).match(/\d+/g) ?? []).map(Number);
const val = (answer: string): number => Number(ungroup(answer));
/** The printed run after the colon: `3, 7, 11, 15, ___`. */
const seqOf = (prompt: string): (number | null)[] =>
  ungroup(prompt.replace(/^[^:]*:\s*/, '').replace(/[.?]$/, ''))
    .split(',')
    .map((x) => x.trim())
    .map((x) => (x === '___' ? null : Number(x)));
const seqBeforeDots = (prompt: string): number[] => ungroup(prompt.match(/მიმდევრობაა ([\d, ]+),\s*\.\.\./)![1]!).split(',').map((x) => Number(x.trim()));

/** Fills a hole or extends by an arithmetic or geometric rule found in the known terms. */
function nextTerm(xs: (number | null)[]): number {
  const idx = xs.indexOf(null);
  const known = xs.map((x, i) => ({ x, i })).filter((p): p is { x: number; i: number } => p.x !== null);
  const diffs = known.slice(1).map((p, k) => (p.x - known[k]!.x) / (p.i - known[k]!.i));
  const arithmetic = diffs.every((d) => Math.abs(d - diffs[0]!) < 1e-9);
  const ratios = known.slice(1).map((p, k) => Math.pow(p.x / known[k]!.x, 1 / (p.i - known[k]!.i)));
  const geometric = ratios.every((r) => Math.abs(r - ratios[0]!) < 1e-9);
  const at = idx === -1 ? xs.length : idx;
  if (arithmetic) return known[0]!.x + diffs[0]! * (at - known[0]!.i);
  if (geometric) return Math.round(known[0]!.x * ratios[0]! ** (at - known[0]!.i));
  throw new Error(`no rule in ${xs.join(',')}`);
}

describe('G6 U14 — sequences', () => {
  it('arithmetic and geometric runs, with a gap or open', () => {
    for (const n of [1, 2, 3, 5, 7, 8, 9, 10, 11]) eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBe(nextTerm(seqOf(d.prompt))));
  });
  it('squares and cubes', () => {
    eachDraw(id(4), (d) => {
      const xs = seqOf(d.prompt) as number[];
      const power = d.explanation.includes('კუბებისგან') ? 3 : 2;
      const base = Math.round(xs[0]! ** (1 / power));
      xs.slice(0, 4).forEach((x, i) => expect(x, d.prompt).toBe((base + i) ** power));
      expect(val(d.answer), d.prompt).toBe((base + 4) ** power);
    });
  });
  it('a start term and a ratio', () => {
    eachDraw(id(6), (d) => {
      const [a, r] = nums(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(a * r ** 4);
    });
    eachDraw(id(12), (d) => {
      const [a, r] = nums(d.prompt) as [number, number];
      expect(val(d.answer) * r ** 4, d.prompt).toBe(a);
    });
  });
});

describe('G6 U14 — the odd one out', () => {
  const printed = (prompt: string): number[] => ungroup(prompt.match(/ზედმეტი: ([\d, ]+)\?/)![1]!).split(',').map((x) => Number(x.trim()));
  const isSquare = (x: number) => Number.isInteger(Math.sqrt(x));
  const isPrime = (x: number) => x > 1 && Array.from({ length: x - 2 }, (_, i) => i + 2).every((k) => x % k !== 0);
  const strangerBy = (xs: number[], test: (x: number) => boolean): number[] => {
    const yes = xs.filter(test);
    const no = xs.filter((x) => !test(x));
    return yes.length === 1 ? yes : no;
  };
  it('parity, multiples, squares, primes', () => {
    eachDraw(id(13), (d) => expect([val(d.answer)], d.prompt).toEqual(strangerBy(printed(d.prompt), (x) => x % 2 === 0)));
    eachDraw(id(14), (d) => {
      const xs = printed(d.prompt);
      const m = Number(d.explanation.match(/იყოფა (\d+)-ზე/)![1]);
      expect([val(d.answer)], d.prompt).toEqual(strangerBy(xs, (x) => x % m === 0));
    });
    eachDraw(id(15), (d) => expect([val(d.answer)], d.prompt).toEqual(strangerBy(printed(d.prompt), isSquare)));
    eachDraw(id(18), (d) => expect([val(d.answer)], d.prompt).toEqual(strangerBy(printed(d.prompt), isPrime)));
  });
  it('the stranger breaks the step or the ratio', () => {
    eachDraw(id(16), (d) => {
      const xs = printed(d.prompt);
      const step = Number(d.explanation.match(/იზრდებოდეს (\d+)-ით/)![1]);
      const a = xs[0]!;
      expect(xs.filter((x) => (x - a) % step !== 0 || x < a), d.prompt).toEqual([val(d.answer)]);
    });
    eachDraw(id(17), (d) => {
      const xs = printed(d.prompt);
      const r = Number(d.explanation.match(/(\d+)-ჯერ/)![1]);
      const a = xs[0]!;
      const geo = new Set(Array.from({ length: 6 }, (_, i) => a * r ** i));
      expect(xs.filter((x) => !geo.has(x)), d.prompt).toEqual([val(d.answer)]);
    });
  });
});

describe('G6 U14 — prediction', () => {
  it('next term of a step run and of triangular numbers', () => {
    eachDraw(id(19), (d) => expect(val(d.answer), d.prompt).toBe(nextTerm(seqBeforeDots(d.prompt))));
    eachDraw(id(22), (d) => {
      const xs = seqBeforeDots(d.prompt);
      expect(val(d.answer), d.prompt).toBe(xs[xs.length - 1]! + (xs[xs.length - 1]! - xs[xs.length - 2]! + 1));
    });
  });
  it('the likelier colour', () => {
    eachDraw(id(20), (d) => {
      const [r, b] = nums(d.prompt) as [number, number];
      const [c1, c2] = [...d.prompt.matchAll(/(\d+) (\S+)/g)].slice(0, 2).map((m) => m[2]!);
      expect(d.answer, d.prompt).toBe(r > b ? c1 : r < b ? c2 : 'ორივე ერთნაირად მოსალოდნელია');
    });
  });
  it('growth over weeks', () => {
    eachDraw(id(21), (d) => {
      const [dd, h, w] = nums(d.prompt) as [number, number, number];
      expect(val(d.answer), d.prompt).toBe(h + dd * w);
    });
  });
  it('a repeating pattern', () => {
    eachDraw(id(23), (d) => {
      const [a] = nums(d.prompt) as [number];
      expect(val(d.answer), d.prompt).toBe(a);
    });
  });
  it('multiply and add', () => {
    eachDraw(id(24), (d) => {
      const xs = seqBeforeDots(d.prompt);
      const [m, c] = nums(d.prompt.replace(/მიმდევრობაა [\d, ]+,\s*\.\.\./, '')) as [number, number];
      xs.slice(1).forEach((x, i) => expect(x, d.prompt).toBe(xs[i]! * m + c));
      expect(val(d.answer), d.prompt).toBe(xs[xs.length - 1]! * m + c);
    });
  });
});

describe('G6 U14 — impossible and certain', () => {
  const DIE = [1, 2, 3, 4, 5, 6];
  it('the die', () => {
    const rules: Array<[RegExp, (x: number) => boolean]> = [
      [/^7-ის მიღება/, (x) => x === 7],
      [/^0-ის/, (x) => x === 0],
      [/^8-ის/, (x) => x === 8],
      [/^10-ის/, (x) => x === 10],
      [/^1-დან 6-მდე/, (x) => x >= 1 && x <= 6],
      [/^6-ზე მეტი/, (x) => x > 6],
      [/^7-ზე ნაკლები/, (x) => x < 7],
      [/^1-ზე არანაკლები/, (x) => x >= 1],
    ];
    eachDraw(id(25), (d) => {
      const ev = d.prompt.match(/გაგორებისას (.+) შეუძლებელია/)![1]!;
      const rule = rules.find(([re]) => re.test(ev))!;
      expect(rule, ev).toBeTruthy();
      const hits = DIE.filter(rule[1]).length;
      const expected = hits === 6 ? 'აუცილებელია' : hits === 0 ? 'შეუძლებელია' : null;
      expect(d.answer, d.prompt).toBe(expected);
    });
  });
  it('the bag with one colour', () => {
    eachDraw(id(26), (d) => {
      const [, c1, c2] = d.prompt.match(/მხოლოდ (\S+) ბურთებია\. .* (\S+) ბურთის მიღება/)!;
      expect(d.answer, d.prompt).toBe(c1 === c2 ? 'აუცილებელია' : 'შეუძლებელია');
    });
  });
  it('the box with two colours', () => {
    eachDraw(id(28), (d) => {
      const m = d.prompt.match(/არის \d+ (\S+) და \d+ (\S+) ბურთი\. .* სამწუხარო|ამოღებისას (.+) მიღება/)!;
      const present = [...d.prompt.matchAll(/\d+ (\S+)/g)].map((x) => x[1]);
      const event = d.prompt.match(/ამოღებისას (.+?) ბურთის მიღება/)![1]!;
      const colours = event.split(' ან ');
      void m;
      const certain = colours.every((c) => present.includes(c)) && colours.length === 2;
      expect(d.answer, d.prompt).toBe(certain ? 'აუცილებელია' : 'შეუძლებელია');
    });
  });
  it('coin and dice rule events', () => {
    eachDraw(id(27), (d) => {
      const ev = d.prompt.match(/აგდებისას (.+) შეუძლებელია/)![1]!;
      const certain = ['გერბის ან საფასურის მიღება', 'ზუსტად ერთი მხარის მიღება', 'გერბის მიღება, ან გერბის მიუღებლობა', 'ორი მხარიდან ერთ-ერთის მიღება'];
      expect(d.answer, ev).toBe(certain.includes(ev) ? 'აუცილებელია' : 'შეუძლებელია');
    });
    eachDraw(id(29), (d) => {
      const ev = d.prompt.match(/გაგორებისას (.+) შეუძლებელია/)![1]!;
      const certain = ['ლუწი ან კენტი რიცხვის მიღება', 'ერთნიშა რიცხვის მიღება', 'ათზე ნაკლები რიცხვის მიღება', '6-ზე ნაკლები ან 6-ის ტოლი რიცხვის მიღება'];
      expect(d.answer, ev).toBe(certain.includes(ev) ? 'აუცილებელია' : 'შეუძლებელია');
    });
  });
  it('three verdicts', () => {
    eachDraw(id(30), (d) => {
      const ev = d.prompt.match(/გაგორებისას (.+) შეუძლებელია,/)![1]!;
      const table: Record<string, number> = {
        'ლუწი რიცხვის მიღება': 3, '3-ზე მეტი რიცხვის მიღება': 3, '5-ის მიღება': 1, '1-ის მიღება': 1, 'ლუწი ან კენტი რიცხვის მიღება': 6, '7-ის მიღება': 0,
        'კენტი რიცხვის მიღება': 3, '6-ზე მეტი რიცხვის მიღება': 0, '7-ზე ნაკლები რიცხვის მიღება': 6, '2-ზე მეტი რიცხვის მიღება': 4, '4-ის მიღება': 1,
        '3-ის ჯერადი რიცხვის მიღება': 2, '12-ის მიღება': 0, '1-ზე მეტი ან 1-ის ტოლი რიცხვის მიღება': 6,
      };
      const hits = table[ev]!;
      expect(hits, ev).toBeDefined();
      expect(d.answer, d.prompt).toBe(hits === 0 ? 'შეუძლებელია' : hits === 6 ? 'აუცილებელია' : 'შესაძლებელია, მაგრამ არა აუცილებელი');
    });
  });
});

describe('G6 U14 — factorials', () => {
  const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
  it('n!, n!/k!, a! + b!', () => {
    for (const n of [31, 32, 33]) eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBe(fact(nums(d.prompt)[0]!)));
    for (const n of [34, 36]) {
      eachDraw(id(n), (d) => {
        const [a, b] = nums(d.prompt) as [number, number];
        expect(val(d.answer), d.prompt).toBe(fact(a) / fact(b));
      });
    }
    eachDraw(id(35), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(fact(a) + fact(b));
    });
  });
});
