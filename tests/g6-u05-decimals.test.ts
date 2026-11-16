import { describe, expect, it } from 'vitest';
import { G6_U05_SUBTOPICS, G6_U05_TEMPLATES } from '../src/practice/templates/g6-u05-decimals';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, numbersIn, parseDecimal, parseValue, q, qDiv, qEq, qMul, qNum } from './support/g6-eval';
import type { Q } from './support/g6-eval';

/**
 * Grade VI — Unit 5: decimals.
 * Every key is recomputed in exact rational arithmetic from the printed prompt.
 */

const id = (n: number) => `g6-u05-q${String(n).padStart(2, '0')}`;
const sub = (s: string) => G6_U05_TEMPLATES.filter((t) => t.subtopicId === s).map((t) => Number(t.id.slice(-2)));

standardSuite({
  unit: 'U05',
  topic: 'g6-decimals',
  subtopics: G6_U05_SUBTOPICS,
  templates: G6_U05_TEMPLATES,
  idPattern: /^g6-u05-q\d{2}$/,
});

const exprOf = (prompt: string): string => /: (.+?)\.$/.exec(prompt)![1]!;
const val = (text: string): Q => parseValue(text.replace(/ (ლარი|ლ|კგ)$/, ''));
const decimals = (text: string): number => qNum(parseDecimal(text));
const roundHalfUp = (x: Q, places: number): Q => {
  const scaled = qMul(x, q(10 ** places));
  const floor = Math.floor((scaled.n * 2 + scaled.d) / (scaled.d * 2));
  return q(floor, 10 ** places);
};
const NUM = '(\\d[\\d ]*(?:,\\d+)?)';
const pick = (s: string, i: number): number => sub(s)[i]!;

describe('G6 U05 — arithmetic keys equal the printed expression', () => {
  const calc = [
    ...sub('u05-06').slice(0, 4), ...sub('u05-07').slice(0, 4), ...sub('u05-08').slice(0, 5),
    ...sub('u05-10').slice(0, 4), ...sub('u05-11').slice(0, 4), ...sub('u05-13'),
  ];
  for (const n of calc) {
    it(`${id(n)} agrees with its expression`, () => {
      eachDraw(id(n), (d) => {
        expect(qEq(val(d.answer), evalExpr(exprOf(d.prompt))), `${d.prompt} → ${d.answer}`).toBe(true);
      });
    });
  }
  it('answers are printed trimmed, with a comma and no stray zero tail', () => {
    for (const n of calc) {
      eachDraw(id(n), (d) => {
        expect(d.answer, d.prompt).not.toMatch(/,\d*0$/);
        expect(d.answer, d.prompt).not.toMatch(/\d\.\d/);
      });
    }
  });
});

describe('G6 U05 — stories', () => {
  it('price × quantity', () => {
    for (const [s, i] of [['u05-01', 5], ['u05-08', 5]] as const) {
      eachDraw(id(pick(s, i)), (d) => {
        const [a, b] = [...d.prompt.matchAll(/(\d[\d ]*(?:,\d+)?)/g)].map((m) => parseDecimal(m[1]!)).slice(-2);
        expect(qEq(val(d.answer), qMul(a!, b!)), d.prompt).toBe(true);
      });
    }
  });
  it('totals and remainders', () => {
    eachDraw(id(pick('u05-06', 4)), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(decimals(d.answer.replace(' ლარი', '')), d.prompt).toBeCloseTo(a! + b!, 8);
    });
    eachDraw(id(pick('u05-07', 4)), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(decimals(d.answer.replace(' ლ', '')), d.prompt).toBeCloseTo(a! - b!, 8);
    });
  });
  it('shares among containers and counts pieces', () => {
    for (const n of sub('u05-10').slice(4)) {
      eachDraw(id(n), (d) => {
        const m = /^(?:(.+?) ლიტრი|(\d+) ერთნაირი წიგნის წონაა (.+?) კგ)/.exec(d.prompt)!;
        const total = parseDecimal(m[1] ?? m[3]!);
        const count = m[2] ? Number(m[2]) : numbersIn(d.prompt)[1]!;
        expect(qEq(val(d.answer), qDiv(total, q(count))), d.prompt).toBe(true);
      });
    }
    eachDraw(id(pick('u05-11', 4)), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(Number(d.answer), d.prompt).toBeCloseTo(a! / b!, 8);
    });
  });
});

describe('G6 U05.1–U05.3 — meaning and place value', () => {
  it('fraction to decimal and back', () => {
    eachDraw(id(pick('u05-01', 0)), (d) => {
      const m = /(\d+)\/(\d+)/.exec(d.prompt)!;
      expect(qEq(parseDecimal(d.answer), q(Number(m[1]), Number(m[2]))), d.prompt).toBe(true);
    });
    eachDraw(id(pick('u05-01', 1)), (d) => {
      const x = parseDecimal(/decimal|ათწილადი (.+?) ჩვეულებრივი/.exec(d.prompt)![1]!);
      expect(qEq(parseValue(d.answer), x), d.prompt).toBe(true);
    });
    eachDraw(id(pick('u05-01', 2)), (d) => {
      const m = /ჩაწერე (\d+) (\d+)\/(\d+)/.exec(d.prompt)!;
      expect(qEq(parseDecimal(d.answer), parseValue(`${m[1]} ${m[2]}/${m[3]}`)), d.prompt).toBe(true);
    });
  });
  it('digit meaning and words', () => {
    const names: Record<string, number> = { ერთეული: 0, მეათედი: 1, მეასედი: 2, მეათასედი: 3 };
    eachDraw(id(pick('u05-01', 3)), (d) => {
      const m = /რიცხვში (.+?) რას აღნიშნავს ციფრი (\d)\?/.exec(d.prompt)!;
      const place = names[/^\d (\S+)$/.exec(d.answer)![1]!]!;
      const frac = m[1]!.split(',')[1]!;
      expect(frac[place - 1], d.prompt).toBe(m[2]);
    });
    eachDraw(id(pick('u05-01', 4)), (d) => {
      const m = /: (\d+) მთელი და (\d+) (\S+)\./.exec(d.prompt)!;
      const k = names[m[3]!]!;
      expect(qEq(parseDecimal(d.answer), q(Number(m[1]) * 10 ** k + Number(m[2]), 10 ** k)), d.prompt).toBe(true);
    });
  });
  it('place value of a digit', () => {
    const [i1, i2, i3] = sub('u05-02');
    const place: Record<string, number> = { მეათედების: 1, მეასედების: 2, მეათასედების: 3 };
    for (const n of [i1!, i2!, i3!]) {
      eachDraw(id(n), (d) => {
        const m = /რიცხვში (.+?) რომელი ციფრია (\S+) თანრიგში/.exec(d.prompt)!;
        expect(m[1]!.split(',')[1]![place[m[2]!]! - 1], d.prompt).toBe(d.answer);
      });
    }
    eachDraw(id(pick('u05-02', 3)), (d) => {
      const x = parseDecimal(/რიცხვი (.+?) თანრიგების/.exec(d.prompt)![1]!);
      expect(qEq(evalExpr(d.answer), x), d.prompt).toBe(true);
    });
    eachDraw(id(pick('u05-02', 4)), (d) => {
      const m = /ციფრ (\d)-ს რიცხვში (.+?)\?/.exec(d.prompt)!;
      const pos = m[2]!.split(',')[1]!.indexOf(m[1]!) + 1;
      expect(qEq(parseDecimal(d.answer), q(Number(m[1]), 10 ** pos)), d.prompt).toBe(true);
    });
    eachDraw(id(pick('u05-02', 5)), (d) => {
      const [w, a, b, c] = numbersIn(d.prompt);
      expect(qEq(parseDecimal(d.answer), q(w! * 1000 + a! * 100 + b! * 10 + c!, 1000)), d.prompt).toBe(true);
    });
  });
  it('decimals and mixed numbers', () => {
    eachDraw(id(pick('u05-03', 0)), (d) => {
      const x = parseDecimal(/ათწილადი (.+?) შერეული/.exec(d.prompt)![1]!);
      expect(qEq(parseValue(d.answer), x), d.prompt).toBe(true);
    });
    for (const i of [1, 2, 3]) {
      eachDraw(id(pick('u05-03', i)), (d) => {
        const m = /ჩაწერე (\d+ \d+\/\d+) ათწილადის/.exec(d.prompt)!;
        expect(qEq(parseDecimal(d.answer), parseValue(m[1]!)), d.prompt).toBe(true);
      });
    }
    for (const i of [4, 5]) {
      eachDraw(id(pick('u05-03', i)), (d) => {
        const x = parseDecimal(/ათწილადი (.+?) (?:ჩვეულებრივი|შერეული)/.exec(d.prompt)![1]!);
        expect(qEq(parseValue(d.answer), x), d.prompt).toBe(true);
      });
    }
  });
});

describe('G6 U05.4 / U05.14 — comparing', () => {
  const holds: Record<string, (a: Q, b: Q) => boolean> = {
    '<': (a, b) => a.n * b.d < b.n * a.d, '>': (a, b) => a.n * b.d > b.n * a.d, '=': (a, b) => qEq(a, b),
  };
  it('picks the right sign', () => {
    for (const n of [...sub('u05-04').filter((x, i) => i !== 3 && i !== 4), pick('u05-14', 0)]) {
      eachDraw(id(n), (d) => {
        const m = /: (.+?) □ (.+?)\.$/.exec(d.prompt)!;
        expect(holds[d.answer]!(evalExpr(m[1]!), evalExpr(m[2]!)), d.prompt).toBe(true);
      });
    }
    eachDraw(id(pick('u05-14', 3)), (d) => {
      const m = /: (.+?) □ (.+?)\.$/.exec(d.prompt)!;
      expect(holds[d.answer]!(evalExpr(m[1]!), evalExpr(m[2]!)), d.prompt).toBe(true);
    });
  });
  it('orders four numbers', () => {
    for (const [i, asc] of [[3, true], [4, false]] as const) {
      eachDraw(id(pick('u05-04', i)), (d) => {
        const list = /: (.+?)\. რომელია/.exec(d.prompt)![1]!.split('; ').map(parseDecimal);
        const sorted = [...list].sort((a, b) => (asc ? 1 : -1) * (a.n * b.d - b.n * a.d));
        const printed = d.answer.split('; ').map(parseDecimal);
        printed.forEach((p, k) => expect(qEq(p, sorted[k]!), d.prompt).toBe(true));
        for (const option of d.options.filter((o) => o !== d.answer)) {
          expect(option.split('; ').every((p, k) => qEq(parseDecimal(p), sorted[k]!)), option).toBe(false);
        }
      });
    }
  });
  it('smallest and largest integer', () => {
    eachDraw(id(pick('u05-14', 1)), (d) => {
      const x = decimals(/x > (.+?)\./.exec(d.prompt)![1]!);
      expect(Number(d.answer), d.prompt).toBe(Math.floor(x) + 1);
    });
    eachDraw(id(pick('u05-14', 2)), (d) => {
      const x = decimals(/x < (.+?)\./.exec(d.prompt)![1]!);
      expect(Number(d.answer), d.prompt).toBe(Math.ceil(x) - 1);
    });
  });
  it('values inside an interval, and the digit that keeps an inequality', () => {
    eachDraw(id(pick('u05-14', 4)), (d) => {
      const m = /(\d+) < x < (\d+): (.+)\.$/.exec(d.prompt)!;
      const expected = m[3]!.split('; ').filter((x) => decimals(x) > Number(m[1]) && decimals(x) < Number(m[2]));
      expect(d.answer, d.prompt).toBe(expected.join('; '));
    });
    eachDraw(id(pick('u05-14', 5)), (d) => {
      const m = /(\d+),(\d)□ < (\d+),(\d)(\d)\./.exec(d.prompt)!;
      const digits = d.answer.split(', ').map(Number);
      for (let x = 0; x <= 9; x += 1) {
        const holdsNow = Number(`${m[1]}.${m[2]}${x}`) < Number(`${m[3]}.${m[4]}${m[5]}`);
        expect(digits.includes(x), `${d.prompt} digit ${x}`).toBe(holdsNow);
      }
    });
  });
});

describe('G6 U05.5 / U05.9 / U05.12 — rounding and estimating', () => {
  it('rounds half up to the named place', () => {
    const places: Record<string, number> = { 'უახლოეს მთელ რიცხვამდე': 0, მეათედებამდე: 1, მეასედებამდე: 2 };
    for (const n of sub('u05-05')) {
      eachDraw(id(n), (d) => {
        const m = /დაამრგვალე (.+?) (უახლოეს მთელ რიცხვამდე|მეათედებამდე|მეასედებამდე)\./.exec(d.prompt)!;
        expect(qEq(parseDecimal(d.answer), roundHalfUp(parseDecimal(m[1]!), places[m[2]!]!)), d.prompt).toBe(true);
      });
    }
  });
  it('estimates a product', () => {
    const [a, b] = sub('u05-09');
    for (const n of [a!, b!]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`შეაფასე ${NUM} × ${NUM},`).exec(d.prompt)!;
        const r = (t: string) => qNum(roundHalfUp(parseDecimal(t), 0));
        expect(Number(d.answer), d.prompt).toBe(r(m[1]!) * r(m[2]!));
      });
    }
    for (const n of [pick('u05-09', 2), pick('u05-09', 3)]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`შეაფასე ${NUM} × ${NUM}, პირველი რიცხვის ${NUM}-მდე და მეორის ${NUM}-მდე`).exec(d.prompt)!;
        expect(decimals(d.answer), d.prompt).toBeCloseTo(decimals(m[3]!) * decimals(m[4]!), 8);
        expect(Math.abs(decimals(m[1]!) - decimals(m[3]!)), d.prompt).toBeLessThan(0.5);
        expect(Math.abs(decimals(m[2]!) - decimals(m[4]!)), d.prompt).toBeLessThan(0.5);
      });
    }
    eachDraw(id(pick('u05-09', 4)), (d) => {
      const m = new RegExp(`რამდენია ${NUM} × ${NUM}, თუ რიცხვებს შესაბამისად (\\d+)-მდე და (\\d+)-მდე`).exec(d.prompt)!;
      expect(Number(d.answer), d.prompt).toBe(Number(m[3]) * Number(m[4]));
    });
  });
  it('estimates a quotient', () => {
    for (const n of [pick('u05-12', 0), pick('u05-12', 1)]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`შეაფასე ${NUM} ÷ ${NUM},`).exec(d.prompt)!;
        const r = (t: string) => qNum(roundHalfUp(parseDecimal(t), 0));
        expect(Number(d.answer), d.prompt).toBe(r(m[1]!) / r(m[2]!));
      });
    }
    for (const n of [pick('u05-12', 2), pick('u05-12', 3)]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`(?:შეაფასე|რამდენია) ${NUM} ÷ ${NUM},(?: თუ რიცხვებს შესაბამისად| რიცხვების) (\\d+)-მდე და (\\d+)-მდე`).exec(d.prompt)!;
        expect(Number(d.answer), d.prompt).toBe(Number(m[3]) / Number(m[4]));
        expect(Math.abs(decimals(m[1]!) - Number(m[3])), d.prompt).toBeLessThan(0.5);
        expect(Math.abs(decimals(m[2]!) - Number(m[4])), d.prompt).toBeLessThan(0.5);
      });
    }
  });
});
