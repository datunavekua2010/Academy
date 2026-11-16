import { describe, expect, it } from 'vitest';
import { G6_U11_SUBTOPICS, G6_U11_TEMPLATES } from '../src/practice/templates/g6-u11-measure-time';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 11: measurement and time.
 * Each story is recomputed from the numbers in its printed prompt, with the
 * decimal comma and thin-space grouping read back.
 */

const id = (n: number) => `g6-u11-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U11',
  topic: 'g6-measure-time',
  subtopics: G6_U11_SUBTOPICS,
  templates: G6_U11_TEMPLATES,
  idPattern: /^g6-u11-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
/** Every number in a text, signed, decimals read with the comma. */
const nums = (text: string): number[] =>
  [...ungroup(text).matchAll(/(−)?(\d+(?:,\d+)?)/g)].map((m) => (m[1] ? -1 : 1) * Number(m[2]!.replace(',', '.')));
const lead = (answer: string): number => nums(answer)[0]!;
/** Rounded to the thousandth so decimal arithmetic compares exactly. */
const eq = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;
const hmOf = (text: string): number => {
  const h = /(\d+) სთ/.exec(text);
  const m = /(\d+) წთ/.exec(text);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
};
const clockOf = (text: string): number => {
  const [h, m] = text.split(':').map(Number) as [number, number];
  return h * 60 + m;
};
const times = (text: string): number[] => [...text.matchAll(/(\d\d):(\d\d)/g)].map((m) => Number(m[1]) * 60 + Number(m[2]));
const clock = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

describe('G6 U11.1 — scale', () => {
  const scaleOf = (prompt: string): number => Number(ungroup(/1:(\d[\d\u2009\u00a0\u202f ]*\d|\d+)/.exec(prompt)![1]!));
  it('map length → real kilometres / metres', () => {
    for (const n of [1, 2]) {
      eachDraw(id(n), (d) => {
        const c = Number(/(\d+) სმ/.exec(d.prompt)![1]);
        expect(lead(d.answer), d.prompt).toBeCloseTo((c * scaleOf(d.prompt)) / 100000, 6);
        expect(d.answer).toMatch(/ კმ$/);
      });
    }
    eachDraw(id(4), (d) => {
      const c = Number(/(\d+) სმ/.exec(d.prompt)![1]);
      expect(lead(d.answer), d.prompt).toBeCloseTo((c * scaleOf(d.prompt)) / 100, 6);
      expect(d.answer).toMatch(/ მ$/);
    });
    eachDraw(id(5), (d) => {
      const c = nums(d.prompt)[0]!;
      expect(lead(d.answer), d.prompt).toBeCloseTo((c * scaleOf(d.prompt)) / 100000, 6);
    });
  });
  it('real kilometres → centimetres on the map', () => {
    eachDraw(id(3), (d) => {
      const km = nums(d.prompt.split('თუ')[0]!)[0]!;
      expect(lead(d.answer), d.prompt).toBeCloseTo((km * 100000) / scaleOf(d.prompt), 6);
    });
  });
  it('finding the scale', () => {
    eachDraw(id(6), (d) => {
      const [km, c] = nums(d.prompt) as [number, number];
      expect(Number(ungroup(d.answer.slice(2))), d.prompt).toBeCloseTo((km * 100000) / c, 3);
      expect(d.answer).toMatch(/^1:/);
    });
  });
});

describe('G6 U11.2 — reasonable estimates', () => {
  const KEYS: Record<string, string> = {
    'სკოლის დერეფნის სიგრძისთვის': '20 მ', 'ფეხბურთის მოედნის სიგრძისთვის': '100 მ', 'სასკოლო კლასის სიგრძისთვის': '8 მ',
    'ავტობუსის სიგრძისთვის': '12 მ', 'საცურაო აუზის სიგრძისთვის': '50 მ', 'ორსართულიანი სახლის სიმაღლისთვის': '7 მ',
    'ტენისის მოედნის სიგრძისთვის': '24 მ', 'ბავშვის ნაბიჯის სიგრძისთვის': '50 სმ',
    'კლასის კარის სიმაღლე': '2 მ', 'მაგიდის სიმაღლე': '70 სმ', 'ზრდასრული ადამიანის სიმაღლე': '170 სმ', 'ფანქრის სიგრძე': '17 სმ',
    'ფეხსაცმლის სიგრძე': '26 სმ', 'მობილური ტელეფონის სიგრძე': '15 სმ', 'ხელის გულის სიგანე': '8 სმ', 'რვეულის სისქე': '2 მმ',
    'ქალაქებს შორის მანძილის': 'კილომეტრი', 'ფანქრის სისქის': 'მილიმეტრი', 'ფეხბურთის მოედნის სიგრძის': 'მეტრი',
    'მწერის სხეულის სიგრძის': 'მილიმეტრი', 'ქვეყნებს შორის მანძილის': 'კილომეტრი', 'ოთახის სიგრძის': 'მეტრი',
    'სატვირთო მანქანის მასის': 'ტონა', 'ჭიქის ტევადობის': 'მილილიტრი',
    'წყლის ბოთლის ტევადობა': '500 მლ', 'ჭიქა წყლის ტევადობა': '200 მლ', 'ჩაის კოვზის ტევადობა': '5 მლ', 'აბაზანის ტევადობა': '150 ლ',
    'რძის კოლოფის ტევადობა': '1 ლ', 'მანქანის საწვავის ავზის ტევადობა': '50 ლ', 'ვედროს ტევადობა': '10 ლ', 'პატარა ბოთლის (სიროფის) ტევადობა': '10 მლ',
    'მოსწავლის მასისთვის': '45 კგ', 'ვაშლის მასისთვის': '200 გ', 'კატის მასისთვის': '4 კგ', 'ზრდასრული კაცის მასისთვის': '80 კგ',
    'წიგნის მასისთვის': '300 გ', 'ავტომობილის მასისთვის': '1,5 ტ', 'ფანქრის მასისთვის': '5 გ', 'პური ბატონის მასისთვის': '500 გ',
    'ერთი გაკვეთილის ხანგრძლივობა': '45 წუთი', 'ფილმის ხანგრძლივობა': '2 საათი', 'კბილების გასუფთავების ხანგრძლივობა': '2 წუთი',
    'სკოლაში ყოფნის ხანგრძლივობა დღეში': '6 საათი', 'თვალის დახამხამების ხანგრძლივობა': '0,3 წამი', 'ზაფხულის არდადეგების ხანგრძლივობა': '3 თვე',
    'ხელების დაბანის ხანგრძლივობა': '20 წამი', 'ღამის ძილის ხანგრძლივობა': '9 საათი',
  };
  it('every drawn thing has the expected key, three different options', () => {
    for (const n of [7, 8, 9, 10, 11, 12]) {
      const seen = new Set<string>();
      eachDraw(id(n), (d) => {
        const thing = /(?:გონივრული|შესაფერისი|შეაფასე) (.+?)(?:: | გამოსახატავად)/.exec(d.prompt)![1]!;
        const key = thing.replace(/^უფრო (გონივრული|შესაფერისი) /, '');
        expect(KEYS[key], `unknown thing: ${key}`).toBeDefined();
        expect(d.answer, d.prompt).toBe(KEYS[key]);
        expect(new Set(d.options).size).toBe(3);
        seen.add(key);
      }, 80);
      expect(seen.size, id(n)).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('G6 U11.3 — length units', () => {
  it('metres, millimetres and the like', () => {
    eachDraw(id(13), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! * 100, 6));
    eachDraw(id(14), (d) => {
      const cm = nums(d.prompt)[0]! / 10;
      expect(d.answer, d.prompt).toBe(`${Math.floor(cm / 100)} მ ${cm % 100} სმ`);
    });
    eachDraw(id(15), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! * 10, 6));
    eachDraw(id(16), (d) => {
      const [k, m] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(k * 1000 + m);
    });
    eachDraw(id(17), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! * 100, 6));
    eachDraw(id(18), (d) => {
      const [m, c, s] = nums(d.prompt) as [number, number, number];
      expect(lead(d.answer), d.prompt).toBe(m * 100 + c - s);
    });
  });
});

describe('G6 U11.4 — miles and kilometres', () => {
  it('× 1,6 and ÷ 1,6', () => {
    for (const n of [19, 20, 23, 24]) {
      eachDraw(id(n), (d) => {
        const mi = nums(d.prompt.replace('1 მილი ≈ 1,6 კმ', ''))[0]!;
        expect(lead(d.answer), d.prompt).toBeCloseTo(mi * 1.6, 6);
      });
    }
    for (const n of [21, 22]) {
      eachDraw(id(n), (d) => {
        const km = nums(d.prompt.replace('1 მილი ≈ 1,6 კმ', ''))[0]!;
        expect(lead(d.answer), d.prompt).toBeCloseTo(km / 1.6, 6);
        expect(Number.isInteger(lead(d.answer))).toBe(true);
      });
    }
  });
});

describe('G6 U11.5 — conversions', () => {
  it('×1 000 and ÷1 000', () => {
    for (const n of [25, 26]) eachDraw(id(n), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! * 1000, 6));
    eachDraw(id(27), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! * 60, 6));
    eachDraw(id(28), (d) => expect(lead(d.answer), d.prompt).toBeCloseTo(nums(d.prompt)[0]! / 1000, 6));
    eachDraw(id(29), (d) => {
      const [l, ml] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(l * 1000 + ml);
    });
    eachDraw(id(30), (d) => {
      const [a, b, c] = nums(d.prompt) as [number, number, number];
      const [x, y, z] = nums(d.answer) as [number, number, number];
      expect([x, y, z].map((n) => Math.round(n * 100)), d.prompt).toEqual([a, b, c]);
      expect(d.answer).toMatch(/^სიგრძე .+ მ, სიგანე .+ მ, სიმაღლე .+ მ$/);
    });
  });
});

describe('G6 U11.6 — temperatures', () => {
  it('rises, falls and differences', () => {
    eachDraw(id(31), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(a + b);
    });
    eachDraw(id(32), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(a - b);
    });
    eachDraw(id(33), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(Math.abs(a - b));
    });
    eachDraw(id(34), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(Math.abs(a - b));
    });
    eachDraw(id(35), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(a + b);
    });
    eachDraw(id(36), (d) => {
      const [a, b, c] = nums(d.prompt) as [number, number, number];
      expect(lead(d.answer), d.prompt).toBe(a - b + c);
    });
    for (const n of [31, 32, 35, 36]) eachDraw(id(n), (d) => expect(d.answer).toMatch(/°C$/));
  });
});

describe('G6 U11.7 — Fahrenheit and Celsius', () => {
  it('both formulas', () => {
    for (const n of [37, 38, 39]) {
      eachDraw(id(n), (d) => {
        const c = nums(d.prompt.split('გადაიყვანე')[1]!)[0]!;
        expect(lead(d.answer), d.prompt).toBe((9 * c) / 5 + 32);
        expect(d.answer).toMatch(/°F$/);
      });
    }
    for (const n of [40, 41, 42]) {
      eachDraw(id(n), (d) => {
        const f = nums(d.prompt.replace(/.*\(F − 32\)\./, ''))[0]!;
        expect(lead(d.answer), d.prompt).toBe((5 * (f - 32)) / 9);
        expect(d.answer).toMatch(/°C$/);
      });
    }
  });
});

describe('G6 U11.8 — time problems', () => {
  it('durations and clock times', () => {
    for (const n of [43, 44]) {
      eachDraw(id(n), (d) => {
        const [a, b] = times(d.prompt) as [number, number];
        expect(hmOf(d.answer), d.prompt).toBe(b - a);
      });
    }
    eachDraw(id(45), (d) => {
      const [a] = times(d.prompt) as [number];
      const [h, m] = /(\d+) საათი და (\d+) წუთი/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      expect(d.answer, d.prompt).toBe(clock(a + h * 60 + m));
    });
    eachDraw(id(46), (d) => {
      const [a] = times(d.prompt) as [number];
      const m = Number(/გაგრძელდა (\d+) წუთი/.exec(d.prompt)![1]);
      expect(clockOf(d.answer), d.prompt).toBe(a + m);
    });
    eachDraw(id(47), (d) => {
      const [a, b] = times(d.prompt) as [number, number];
      expect(Number(d.answer.split(' ')[0]), d.prompt).toBe(b - a);
    });
    eachDraw(id(48), (d) => {
      const [a] = times(d.prompt) as [number];
      const [h, m, w] = /(\d+) საათი და (\d+) წუთი.*? (\d+) წუთი გაატარა/.exec(d.prompt)!.slice(1).map(Number) as [number, number, number];
      expect(clockOf(d.answer), d.prompt).toBe(a + h * 60 + m + w);
    });
  });
});

describe('G6 U11.9 — time units', () => {
  const seconds = (text: string): number => (text.includes('წუთი') ? lead(text) * 60 : lead(text));
  it('ordering spans', () => {
    eachDraw(id(49), (d) => {
      const items = /ზრდადობით: (.+)\.$/.exec(d.prompt)![1]!.split(', ');
      const sorted = items.map(seconds).sort((p, q) => p - q);
      expect(d.answer.split('; ').map(seconds), d.prompt).toEqual(sorted);
      expect(new Set(items.map(seconds)).size).toBe(4);
    });
  });
  it('conversions and sums', () => {
    eachDraw(id(50), (d) => {
      const [m, s] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(m * 60 + s);
    });
    eachDraw(id(51), (d) => expect(hmOf(d.answer), d.prompt).toBe(nums(d.prompt)[0]!));
    eachDraw(id(52), (d) => expect(hmOf(d.answer), d.prompt).toBe(nums(d.prompt).reduce((a, b) => a + b, 0)));
    eachDraw(id(53), (d) => {
      const [a] = times(d.prompt) as [number];
      const [l, b] = nums(d.prompt.replace(/\d\d:\d\d/, '')) as [number, number];
      expect(clockOf(d.answer), d.prompt).toBe(a + 2 * l + b);
    });
    eachDraw(id(54), (d) => {
      const [days, h, m] = nums(d.prompt) as [number, number, number];
      expect(hmOf(d.answer), d.prompt).toBe(days * (h * 60 + m));
    });
  });
});
