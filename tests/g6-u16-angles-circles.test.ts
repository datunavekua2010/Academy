import { describe, expect, it } from 'vitest';
import { G6_U16_SUBTOPICS, G6_U16_TEMPLATES } from '../src/practice/templates/g6-u16-angles-circles';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 16: angles, lines and circles. Every prompt is read back
 * (angles, lengths, points, radii) and the answer is recomputed from geometry.
 */

const id = (n: number) => `g6-u16-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U16',
  topic: 'g6-angles-circles',
  subtopics: G6_U16_SUBTOPICS,
  templates: G6_U16_TEMPLATES,
  idPattern: /^g6-u16-q\d{2}$/,
});

const MINUS = '\u2212';
const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
const ints = (text: string): number[] => (ungroup(text).match(/\d+/g) ?? []).map(Number);
const num = (text: string): number => Number(ungroup(text).replace(MINUS, '-').replace(',', '.').match(/-?\d+(?:\.\d+)?/)![0]);
const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6);

/** `3π/2` → 270; `π` → 180. */
const radToDeg = (text: string): number => {
  const m = text.match(/^(\d*)π(?:\/(\d+))?$/)!;
  return ((m[1] ? Number(m[1]) : 1) * 180) / (m[2] ? Number(m[2]) : 1);
};
const deg = (text: string): number => num(text);

describe('G6 U16 — lines, segments, rays', () => {
  it('end points and common points', () => {
    eachDraw(id(1), (d) => {
      const expected = d.prompt.includes('მონაკვეთს') ? 2 : d.prompt.includes('სხივს') || d.prompt.includes('უსასრულოდ') ? 1 : 0;
      expect(Number(d.answer), d.prompt).toBe(expected);
    });
    eachDraw(id(2), (d) => {
      const n = ints(d.prompt)[0]!;
      expect(Number(d.answer), d.prompt).toBe(n * (d.prompt.includes('მონაკვეთს') ? 2 : 1));
    });
    eachDraw(id(3), (d) => {
      const zero = /პარალელურ|დაშორებულ/.test(d.prompt);
      expect(Number(d.answer), d.prompt).toBe(zero ? 0 : 1);
    });
  });
  it('segments from points; sums and differences of lengths', () => {
    eachDraw(id(4), (d) => {
      const n = ints(d.prompt)[0]!;
      expect(Number(d.answer), d.prompt).toBe((n * (n - 1)) / 2);
    });
    eachDraw(id(5), (d) => {
      const [x, y] = ints(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(x + y);
    });
    eachDraw(id(6), (d) => {
      const [x, y] = ints(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(x - y);
      expect(y).toBeLessThan(x);
    });
  });
});

describe('G6 U16 — measuring angles', () => {
  const kind = (a: number) => (a < 90 ? 'მახვილი' : a === 90 ? 'მართი' : a < 180 ? 'ბლაგვი' : 'გაშლილი');
  it('acute, right, obtuse, straight', () => {
    for (const n of [7, 8, 9]) eachDraw(id(n), (d) => expect(d.answer, d.prompt).toBe(kind(ints(d.prompt)[0]!)));
  });
  it('named angles', () => {
    const table: Record<string, number> = {
      'გაშლილი კუთხე': 180, 'მართი კუთხე': 90, 'სრული კუთხე (სრული ბრუნი)': 360, 'გაშლილი კუთხის ნახევარი': 90, 'მართი კუთხის ნახევარი': 45, 'ორი მართი კუთხის ჯამი': 180,
    };
    eachDraw(id(10), (d) => {
      const what = d.prompt.match(/რამდენი გრადუსია (.+)\?/)![1]!;
      expect(deg(d.answer), d.prompt).toBe(table[what]);
    });
  });
  it('complement and supplement', () => {
    eachDraw(id(11), (d) => expect(deg(d.answer), d.prompt).toBe(90 - ints(d.prompt)[0]!));
    eachDraw(id(12), (d) => {
      const [s, a] = ints(d.prompt) as [number, number];
      expect(deg(d.answer), d.prompt).toBe(s - a);
    });
  });
});

describe('G6 U16 — radians', () => {
  it('degrees to radians', () => {
    for (const n of [13, 16, 17]) eachDraw(id(n), (d) => expect(radToDeg(d.answer), d.prompt).toBe(ints(d.prompt)[0]));
  });
  it('radians to degrees', () => {
    for (const n of [14, 15, 18]) {
      eachDraw(id(n), (d) => {
        const r = d.prompt.match(/(\d*π(?:\/\d+)?) რადიანი/)![1]!;
        expect(deg(d.answer), d.prompt).toBe(radToDeg(r));
      });
    }
  });
});

describe('G6 U16 — parallel lines', () => {
  it('corresponding, alternate, co-interior and adjacent angles', () => {
    for (const n of [19, 21, 25]) eachDraw(id(n), (d) => expect(deg(d.answer), d.prompt).toBe(ints(d.prompt)[0]));
    eachDraw(id(26), (d) => expect(deg(d.answer), d.prompt).toBe(180 - ints(d.prompt)[1]!));
    for (const n of [20, 24]) eachDraw(id(n), (d) => expect(deg(d.answer), d.prompt).toBe(180 - ints(d.prompt)[0]!));
  });
  it('an unknown in equal angles', () => {
    for (const n of [22, 27]) {
      eachDraw(id(n), (d) => {
        const [k, a] = ints(d.prompt) as [number, number];
        expect(Number(d.answer) * k, d.prompt).toBe(a);
      });
    }
  });
  it('co-interior and adjacent angles with unknowns', () => {
    const coefs = (prompt: string): [number, number] => {
      const m = [...prompt.matchAll(/(\d*)x°/g)].map((x) => (x[1] ? Number(x[1]) : 1));
      return [m[0]!, m[1]!];
    };
    eachDraw(id(23), (d) => {
      const [p, q] = coefs(d.prompt);
      expect(Number(d.answer) * (p + q), d.prompt).toBe(180);
    });
    eachDraw(id(28), (d) => {
      const [p, q] = coefs(d.prompt);
      const [a, b] = d.answer.split(' და ').map(deg);
      expect(a! + b!, d.prompt).toBe(180);
      expect(a! * q, d.prompt).toBe(b! * p);
    });
  });
});

describe('G6 U16 — adjacent and vertical angles', () => {
  it('three other angles', () => {
    eachDraw(id(29), (d) => {
      const a = ints(d.prompt)[0]!;
      expect(d.answer, d.prompt).toBe(`${a}°, ${180 - a}°, ${180 - a}°`);
    });
  });
  it('vertical angles with expressions', () => {
    eachDraw(id(30), (d) => {
      const m = d.prompt.match(/\((\d+)x\+(\d+)\)° და \((\d+)x−(\d+)\)°/)!;
      const [p, c1, q, c2] = m.slice(1).map(Number) as [number, number, number, number];
      const x = (c1 + c2) / (q - p);
      expect(Number.isInteger(x)).toBe(true);
      expect(d.answer, d.prompt).toBe(`x = ${x}; ${p * x + c1}°`);
      expect(p * x + c1).toBe(q * x - c2);
    });
  });
});

describe('G6 U16 — translations', () => {
  const read = (text: string): { name: string; x: number; y: number } => {
    const m = text.match(/([A-F])\((−?\d+);(−?\d+)\)/)!;
    return { name: m[1]!, x: Number(m[2]!.replace(MINUS, '-')), y: Number(m[3]!.replace(MINUS, '-')) };
  };
  const show = (name: string, x: number, y: number) => `${name}′(${x < 0 ? MINUS : ''}${Math.abs(x)};${y < 0 ? MINUS : ''}${Math.abs(y)})`;
  const rest = (prompt: string) => prompt.replace(/[A-F]\(−?\d+;−?\d+\)/, '');
  it('horizontal and vertical moves', () => {
    eachDraw(id(31), (d) => {
      const p = read(d.prompt);
      const [a, b] = ints(rest(d.prompt)) as [number, number];
      expect(d.answer, d.prompt).toBe(show(p.name, p.x + a, p.y + b));
    });
    eachDraw(id(32), (d) => {
      const p = read(d.prompt);
      const [a, b] = ints(rest(d.prompt)) as [number, number];
      expect(d.answer, d.prompt).toBe(show(p.name, p.x - a, p.y - b));
    });
    eachDraw(id(33), (d) => {
      const p = read(d.prompt);
      const a = ints(rest(d.prompt))[0]!;
      expect(d.answer, d.prompt).toBe(show(p.name, p.x + (d.prompt.includes('მარჯვნივ') ? a : -a), p.y));
    });
    eachDraw(id(34), (d) => {
      const p = read(d.prompt);
      const b = ints(rest(d.prompt))[0]!;
      expect(d.answer, d.prompt).toBe(show(p.name, p.x, p.y + (d.prompt.includes('ზემოთ') ? b : -b)));
    });
  });
  it('a vector', () => {
    eachDraw(id(35), (d) => {
      const p = read(d.prompt);
      const m = d.prompt.match(/ვექტორით \((−?\d+);(−?\d+)\)/)!;
      const [a, b] = [m[1]!, m[2]!].map((x) => Number(x.replace(MINUS, '-')));
      expect(d.answer, d.prompt).toBe(show(p.name, p.x + a!, p.y + b!));
    });
  });
  it('the shift between a point and its image', () => {
    eachDraw(id(36), (d) => {
      const p = read(d.prompt);
      const m = d.prompt.match(/([A-F])′\((−?\d+);(−?\d+)\)/)!;
      const dx = Number(m[2]!.replace(MINUS, '-')) - p.x;
      const dy = Number(m[3]!.replace(MINUS, '-')) - p.y;
      expect(d.answer, d.prompt).toBe(`${Math.abs(dx)} ერთეულით ${dx > 0 ? 'მარჯვნივ' : 'მარცხნივ'} და ${Math.abs(dy)} ერთეულით ${dy > 0 ? 'ზემოთ' : 'ქვემოთ'}`);
    });
  });
});

describe('G6 U16 — two circles', () => {
  const relation = (r1: number, r2: number, d: number) => {
    const outer = r1 + r2;
    const inner = Math.abs(r1 - r2);
    return d > outer ? 'far' : d === outer ? 'ext' : d > inner ? 'cross' : d === inner ? 'int' : 'inside';
  };
  const labels: Record<string, string> = {
    far: 'ერთმანეთისგან დაშორებულია (არ იკვეთება)', ext: 'გარედან ეხება ერთმანეთს', cross: 'იკვეთება ორ წერტილში', int: 'შიგნიდან ეხება ერთმანეთს', inside: 'ერთი მეორის შიგნითაა (არ იკვეთება)',
  };
  const radiiAndDistance = (prompt: string): [number, number, number] => {
    const n = ints(prompt) as [number, number, number];
    return prompt.startsWith('ორი წრეწირის ცენტრებს შორის') ? [n[1], n[2], n[0]] : n;
  };
  it('do the circles cross?', () => {
    for (const n of [37, 41]) {
      eachDraw(id(n), (d) => {
        const [r1, r2, dist] = radiiAndDistance(d.prompt);
        expect(['ext', 'int']).not.toContain(relation(r1, r2, dist));
        expect(d.answer, d.prompt).toBe(relation(r1, r2, dist) === 'cross' ? 'დიახ' : 'არა');
      });
    }
  });
  it('how are they placed?', () => {
    for (const n of [38, 42]) {
      eachDraw(id(n), (d) => {
        const [r1, r2, dist] = radiiAndDistance(d.prompt);
        expect(d.answer, d.prompt).toBe(labels[relation(r1, r2, dist)]);
      });
    }
  });
  it('how many common points?', () => {
    for (const n of [39, 40]) {
      eachDraw(id(n), (d) => {
        const [r1, r2, dist] = radiiAndDistance(d.prompt);
        const r = relation(r1, r2, dist);
        expect(Number(d.answer), d.prompt).toBe(r === 'cross' ? 2 : r === 'ext' || r === 'int' ? 1 : 0);
      });
    }
  });
});

describe('G6 U16 — central and inscribed angles', () => {
  it('central equals the arc, inscribed is half', () => {
    eachDraw(id(43), (d) => expect(deg(d.answer), d.prompt).toBe(ints(d.prompt)[0]));
    for (const n of [44, 45, 46]) eachDraw(id(n), (d) => expect(deg(d.answer) * 2, d.prompt).toBe(ints(d.prompt)[0]));
    eachDraw(id(47), (d) => expect(deg(d.answer), d.prompt).toBe(2 * ints(d.prompt)[0]!));
  });
  it('an inscribed angle on a fraction of the circle', () => {
    const share: Record<string, number> = { ნახევარწრეწირს: 1 / 2, 'წრეწირის მეოთხედს': 1 / 4, 'წრეწირის მესამედს': 1 / 3, 'წრეწირის მეექვსედს': 1 / 6, 'წრეწირის მეთორმეტედს': 1 / 12, 'წრეწირის მეათედს': 1 / 10 };
    eachDraw(id(48), (d) => {
      const arc = d.prompt.match(/ეყრდნობა (.+)\. რამდენი/)![1]!;
      close(deg(d.answer), (360 * share[arc]!) / 2);
    });
  });
});

describe('G6 U16 — radius, diameter, chord', () => {
  it('radius and diameter', () => {
    eachDraw(id(49), (d) => expect(num(d.answer), d.prompt).toBe(2 * ints(d.prompt)[0]!));
    eachDraw(id(50), (d) => expect(num(d.answer) * 2, d.prompt).toBe(ints(d.prompt)[0]));
    eachDraw(id(53), (d) => expect(num(d.answer), d.prompt).toBe(ints(d.prompt)[0]));
  });
  it('a chord and its distance from the centre', () => {
    eachDraw(id(51), (d) => {
      const [dist, R] = ints(d.prompt) as [number, number];
      close(num(d.answer), 2 * Math.sqrt(R * R - dist * dist));
    });
    eachDraw(id(52), (d) => {
      const [R, dist] = ints(d.prompt) as [number, number];
      close(num(d.answer), 2 * Math.sqrt(R * R - dist * dist));
    });
    eachDraw(id(54), (d) => {
      const [R, c] = ints(d.prompt) as [number, number];
      close(num(d.answer), Math.sqrt(R * R - (c / 2) ** 2));
    });
  });
});

describe('G6 U16 — sectors', () => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  it('the fraction of a circle', () => {
    for (const n of [55, 56]) {
      eachDraw(id(n), (d) => {
        const a = ints(d.prompt)[0]!;
        const g = gcd(a, 360);
        expect(d.answer, d.prompt).toBe(`${a / g}/${360 / g}`);
      });
    }
  });
  it('the area of a sector', () => {
    for (const n of [57, 58, 60]) {
      eachDraw(id(n), (d) => {
        const [r, a] = ints(d.prompt) as [number, number];
        const coefficient = d.answer.startsWith('π') ? 1 : num(d.answer);
        close(coefficient, (r * r * a) / 360);
        expect(d.answer).toMatch(/π სმ²$/);
      });
    }
  });
  it('sector or segment', () => {
    eachDraw(id(59), (d) => {
      const sector = d.prompt.includes('ორი რადიუსითა');
      expect(d.answer, d.prompt).toBe(sector ? 'წრიული სექტორი' : 'წრიული სეგმენტი');
    });
  });
});

describe('G6 U16 — circumference and area of a circle', () => {
  it('with π = 22/7', () => {
    eachDraw(id(61), (d) => {
      const r = ints(d.prompt)[0]!;
      expect(r % 7).toBe(0);
      close(num(d.answer), (2 * 22 * r) / 7);
    });
    eachDraw(id(66), (d) => {
      const area = ints(d.prompt)[0]!;
      const r = num(d.answer);
      close((22 / 7) * r * r, area);
    });
  });
  it('with π = 3,14', () => {
    eachDraw(id(62), (d) => close(num(d.answer), 3.14 * ints(d.prompt)[0]!));
    eachDraw(id(63), (d) => close(num(d.answer), 3.14 * ints(d.prompt)[0]! ** 2));
    eachDraw(id(64), (d) => close(num(d.answer), 3.14 * (ints(d.prompt)[0]! / 2) ** 2));
    eachDraw(id(65), (d) => {
      const c = num(d.prompt.replace(/\(π.*$/, '').replace(/^[^\d]*/, ''));
      close(2 * 3.14 * num(d.answer), c);
    });
  });
});
