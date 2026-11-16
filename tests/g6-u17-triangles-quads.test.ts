import { describe, expect, it } from 'vitest';
import { G6_U17_SUBTOPICS, G6_U17_TEMPLATES } from '../src/practice/templates/g6-u17-triangles-quads';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 17: triangles and quadrilaterals. Lengths and angles are read
 * back from the prompt; perimeters, angle sums, Pythagoras, Thales and the
 * trapezoid formulas are recomputed independently.
 */

const id = (n: number) => `g6-u17-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U17',
  topic: 'g6-triangles-quads',
  subtopics: G6_U17_SUBTOPICS,
  templates: G6_U17_TEMPLATES,
  idPattern: /^g6-u17-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
const ints = (text: string): number[] => (ungroup(text).match(/\d+/g) ?? []).map(Number);
const val = (answer: string): number => Number(ungroup(answer).replace(/\D.*$/, ''));
const at = (prompt: string, label: string): number => Number(ungroup(prompt).match(new RegExp(`${label} = (\\d+)`))![1]);

describe('G6 U17 — quadrilaterals', () => {
  it('named from the description', () => {
    const names: Array<[RegExp, string]> = [
      [/ყველა კუთხე მართია, ხოლო ყველა გვერდი ტოლია/, 'კვადრატი'],
      [/ყველა კუთხე მართია, მაგრამ/, 'მართკუთხედი'],
      [/ყველა გვერდი ტოლია, მაგრამ/, 'რომბი'],
      [/მოპირდაპირე გვერდები პარალელური და ტოლია/, 'პარალელოგრამი'],
      [/მხოლოდ ორი გვერდია პარალელური/, 'ტრაპეცია'],
    ];
    eachDraw(id(1), (d) => expect(d.answer, d.prompt).toBe(names.find(([re]) => re.test(d.prompt))![1]));
  });
  it('perimeters and angles', () => {
    eachDraw(id(2), (d) => {
      const [a, b] = ints(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(2 * (a + b));
      expect(a).toBeGreaterThan(b);
    });
    eachDraw(id(3), (d) => expect(val(d.answer), d.prompt).toBe(4 * ints(d.prompt)[0]!));
    for (const n of [4, 5]) eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBe(180 - ints(d.prompt)[0]!));
    eachDraw(id(6), (d) => expect(val(d.answer), d.prompt).toBe(360 - ints(d.prompt).reduce((a, b) => a + b, 0)));
  });
});

describe('G6 U17 — elements of a triangle', () => {
  it('sides and medians', () => {
    const sides: Record<string, number> = { სამკუთხედს: 3, 'ტოლფერდა სამკუთხედს': 3, 'ტოლგვერდა სამკუთხედს': 3, 'მართკუთხა სამკუთხედს': 3, ოთხკუთხედს: 4, ხუთკუთხედს: 5, კვადრატს: 4, მართკუთხედს: 4, რომბს: 4, ტრაპეციას: 4, პარალელოგრამს: 4, ექვსკუთხედს: 6 };
    eachDraw(id(7), (d) => expect(Number(d.answer), d.prompt).toBe(sides[d.prompt.match(/აქვს (.+)\?/)![1]!]));
    eachDraw(id(8), (d) => expect(Number(d.answer)).toBe(3));
  });
  it('perimeters and the third side', () => {
    eachDraw(id(9), (d) => {
      const [a, b, p] = ints(d.prompt) as [number, number, number];
      const c = val(d.answer);
      expect(c, d.prompt).toBe(p - a - b);
      expect(c < a + b && a < b + c && b < a + c, d.prompt).toBe(true);
    });
    eachDraw(id(10), (d) => expect(val(d.answer), d.prompt).toBe(ints(d.prompt).reduce((a, b) => a + b, 0)));
    eachDraw(id(11), (d) => {
      const [b, l] = ints(d.prompt) as [number, number];
      expect(2 * l).toBeGreaterThan(b);
      expect(val(d.answer), d.prompt).toBe(b + 2 * l);
    });
    eachDraw(id(12), (d) => {
      const [p, a, b] = ints(d.prompt) as [number, number, number];
      const c = val(d.answer);
      expect(c, d.prompt).toBe(p - a - b);
      expect(c < a + b && a < b + c && b < a + c, d.prompt).toBe(true);
    });
  });
});

describe('G6 U17 — exterior angles', () => {
  it('interior, exterior and remote angles', () => {
    eachDraw(id(13), (d) => expect(val(d.answer), d.prompt).toBe(180 - ints(d.prompt)[0]! - ints(d.prompt)[1]!));
    for (const n of [14, 16]) {
      eachDraw(id(n), (d) => {
        const [e, a] = ints(d.prompt) as [number, number];
        expect(val(d.answer), d.prompt).toBe(e - a);
      });
    }
    eachDraw(id(15), (d) => expect(val(d.answer), d.prompt).toBe(ints(d.prompt)[0]! + ints(d.prompt)[1]!));
  });
  it('an unknown in an exterior angle', () => {
    eachDraw(id(17), (d) => {
      const [m, e] = ints(d.prompt) as [number, number];
      expect(val(d.answer) * (m + 1), d.prompt).toBe(e);
    });
    eachDraw(id(18), (d) => {
      const [p, a] = ints(d.prompt) as [number, number];
      expect(val(d.answer) * (p - 1), d.prompt).toBe(a);
    });
  });
});

describe('G6 U17 — interior angle sums', () => {
  it('sums by polygon', () => {
    const sums: Record<string, number> = { სამკუთხედის: 180, 'ტოლფერდა სამკუთხედის': 180, 'მართკუთხა სამკუთხედის': 180, ოთხკუთხედის: 360, მართკუთხედის: 360, კვადრატის: 360, ხუთკუთხედის: 540, ექვსკუთხედის: 720 };
    eachDraw(id(19), (d) => expect(val(d.answer), d.prompt).toBe(sums[d.prompt.match(/რამდენია (.+) შიგა/)![1]!]));
  });
  it('the third angle and special triangles', () => {
    eachDraw(id(20), (d) => expect(val(d.answer), d.prompt).toBe(180 - ints(d.prompt)[0]! - ints(d.prompt)[1]!));
    eachDraw(id(21), (d) => expect(val(d.answer), d.prompt).toBe(90 - ints(d.prompt)[0]!));
    eachDraw(id(22), (d) => expect(val(d.answer) * 2 + ints(d.prompt)[0]!, d.prompt).toBe(180));
  });
  it('angles in proportion and with an unknown', () => {
    eachDraw(id(23), (d) => {
      const coefs = [...d.prompt.matchAll(/(\d*)x°/g)].map((m) => (m[1] ? Number(m[1]) : 1));
      const angles = d.answer.split(', ').map((x) => val(x));
      expect(angles.reduce((a, b) => a + b, 0), d.prompt).toBe(180);
      angles.forEach((a, i) => expect(a * coefs[0]!).toBe(angles[0]! * coefs[i]!));
    });
    eachDraw(id(24), (d) => {
      const [m, c, g] = ints(d.prompt) as [number, number, number];
      const x = (180 - c - g) / (m + 1);
      expect(Number.isInteger(x)).toBe(true);
      expect(d.answer, d.prompt).toBe(`x = ${x}; ${m * x}°, ${x + c}°, ${g}°`);
    });
  });
});

describe('G6 U17 — the Pythagorean theorem', () => {
  it('hypotenuse', () => {
    for (const n of [25, 26, 30]) {
      eachDraw(id(n), (d) => {
        const [p, q] = ints(d.prompt) as [number, number];
        expect(val(d.answer) ** 2, d.prompt).toBe(p * p + q * q);
      });
    }
  });
  it('a leg', () => {
    for (const n of [27, 28, 29]) {
      eachDraw(id(n), (d) => {
        const [r, p] = ints(d.prompt) as [number, number];
        expect(val(d.answer) ** 2, d.prompt).toBe(r * r - p * p);
      });
    }
    eachDraw(id(29), (d) => expect(d.answer).toMatch(/ მ$/));
  });
});

describe('G6 U17 — congruence', () => {
  const SSS = 'სამი გვერდის ტოლობის ნიშანი';
  const SAS = 'ორი გვერდისა და მათ შორის მოქცეული კუთხის ტოლობის ნიშანი';
  const ASA = 'გვერდისა და მასთან მიმდებარე ორი კუთხის ტოლობის ნიშანი';
  it('the three signs', () => {
    eachDraw(id(31), (d) => expect(d.answer).toBe(SSS));
    eachDraw(id(32), (d) => expect(d.answer).toBe(SAS));
    eachDraw(id(33), (d) => expect(d.answer).toBe(ASA));
    for (const n of [31, 32, 33]) eachDraw(id(n), (d) => expect(d.options).toContain('სამი კუთხის ტოლობა (ტოლობის ნიშანი არ არის)'));
  });
  it('compare sides', () => {
    eachDraw(id(34), (d) => {
      const [a, b, c, a2, b2, c2] = [at(d.prompt, 'AB'), at(d.prompt, 'BC'), at(d.prompt, 'AC'), at(d.prompt, 'DE'), at(d.prompt, 'EF'), at(d.prompt, 'DF')];
      for (const [x, y, z] of [[a, b, c], [a2, b2, c2]] as const) expect(x + y > z && x + z > y && y + z > x, d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(a === a2 && b === b2 && c === c2 ? 'დიახ, ტოლია' : 'არა, არ არის ტოლი');
    });
    eachDraw(id(35), (d) => {
      const [a, b, a2, b2] = [at(d.prompt, 'AB'), at(d.prompt, 'AC'), at(d.prompt, 'DE'), at(d.prompt, 'DF')];
      const g = Number(d.prompt.match(/∠A = (\d+)°/)![1]);
      const g2 = Number(d.prompt.match(/∠D = (\d+)°/)![1]);
      expect(d.answer, d.prompt).toBe(a === a2 && b === b2 && g === g2 ? 'დიახ, ტოლია' : 'არა, არ არის ტოლი');
    });
  });
  it('two sides are not enough on their own', () => {
    const enough: Array<[string, boolean]> = [
      ['მათ შორის მოქცეული კუთხეები განსხვავებულია', false], ['და მათ შორის მოქცეული კუთხეებიც ტოლია', true], ['მესამე გვერდებიც ტოლია', true],
      ['მესამე გვერდები განსხვავებულია', false], ['მათ შორის მოქცეული კუთხეებიდან ერთი მეორეზე დიდია', false], ['მოქცეული კუთხეებიც შესაბამისად ტოლია', true], ['მესამე გვერდებიც შესაბამისად ტოლია', true], ['მოქცეული კუთხეები ერთმანეთს არ უდრის', false],
    ];
    eachDraw(id(36), (d) => {
      const hit = enough.find(([text]) => d.prompt.includes(text))!;
      expect(d.answer, d.prompt).toBe(hit[1] ? 'საკმარისია' : 'საკმარისი არ არის');
    });
  });
});

describe('G6 U17 — perimeter problems', () => {
  it('perimeters and sides', () => {
    for (const n of [37, 42]) eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBe(ints(d.prompt).reduce((a, b) => a + b, 0)));
    eachDraw(id(38), (d) => expect(val(d.answer) * 4, d.prompt).toBe(ints(d.prompt)[0]));
    eachDraw(id(39), (d) => {
      const [p, l] = ints(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(p / 2 - l);
    });
    eachDraw(id(40), (d) => expect(val(d.answer), d.prompt).toBe(2 * (ints(d.prompt)[0]! + ints(d.prompt)[1]!)));
    eachDraw(id(41), (d) => {
      const [p, b] = ints(d.prompt) as [number, number];
      expect(b + 2 * val(d.answer), d.prompt).toBe(p);
    });
  });
});

describe('G6 U17 — Thales', () => {
  const L = (prompt: string, label: string) => at(prompt, label);
  it('proportional segments', () => {
    eachDraw(id(43), (d) => expect(val(d.answer) * L(d.prompt, 'AD'), d.prompt).toBe(L(d.prompt, 'AE') * L(d.prompt, 'DB')));
    eachDraw(id(44), (d) => expect(val(d.answer) * L(d.prompt, 'AB'), d.prompt).toBe(L(d.prompt, 'AD') * L(d.prompt, 'AC')));
    eachDraw(id(45), (d) => {
      expect(L(d.prompt, 'AD')).toBe(L(d.prompt, 'DB'));
      expect(val(d.answer), d.prompt).toBe(L(d.prompt, 'AE'));
    });
    eachDraw(id(46), (d) => expect(val(d.answer) * L(d.prompt, 'AB'), d.prompt).toBe(L(d.prompt, 'AD') * L(d.prompt, 'BC')));
    eachDraw(id(47), (d) => expect(val(d.answer) * L(d.prompt, 'DB'), d.prompt).toBe(L(d.prompt, 'AD') * L(d.prompt, 'EC')));
    eachDraw(id(48), (d) => expect(val(d.answer) * L(d.prompt, 'AD'), d.prompt).toBe(L(d.prompt, 'DE') * L(d.prompt, 'AB')));
  });
});

describe('G6 U17 — trapezoids', () => {
  it('midline, area, perimeter', () => {
    for (const n of [49, 54]) {
      eachDraw(id(n), (d) => {
        const [a, b] = ints(d.prompt) as [number, number];
        expect(val(d.answer) * 2, d.prompt).toBe(a + b);
      });
    }
    for (const n of [50, 53]) {
      eachDraw(id(n), (d) => {
        const [a, b, h] = ints(d.prompt) as [number, number, number];
        expect(val(d.answer) * 2, d.prompt).toBe((a + b) * h);
        expect(d.answer).toMatch(/ სმ²$/);
      });
    }
    eachDraw(id(51), (d) => {
      const [a, b, c] = ints(d.prompt) as [number, number, number];
      expect(val(d.answer), d.prompt).toBe(a + b + 2 * c);
    });
    eachDraw(id(52), (d) => {
      const [m, a] = ints(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(2 * m - a);
    });
  });
});
