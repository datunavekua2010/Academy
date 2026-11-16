/**
 * Independent arithmetic for the Grade VI tests.
 *
 * The templates compute their keys from drawn variables. These helpers read the
 * *printed* prompt instead — decimal comma, U+2212 minus, grouped thousands,
 * `a/b` fractions — and recompute the answer a second way with exact rational
 * arithmetic, so a template whose wording and key disagree cannot pass.
 */

export interface Q {
  n: number;
  d: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const q = (n: number, d = 1): Q => {
  const g = gcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
};
export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qEq = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;
export const qNum = (a: Q): number => a.n / a.d;

const MINUS = '\u2212';

/** `−1 234,5` → an exact fraction. */
export const parseDecimal = (text: string): Q => {
  const clean = text.replace(new RegExp(MINUS, 'g'), '-').replace(/\s/g, '');
  const negative = clean.startsWith('-');
  const body = negative ? clean.slice(1) : clean;
  const [whole, frac = ''] = body.split(',');
  const value = q(Number(whole + frac), 10 ** frac.length);
  return negative ? q(-value.n, value.d) : value;
};

/** A printed answer: integer, decimal, `a/b`, `−a/b` or a mixed number `1 2/3`. */
export const parseValue = (text: string): Q => {
  const clean = text.trim();
  const mixed = /^([\u2212-]?)(\d+) (\d+)\/(\d+)$/.exec(clean);
  if (mixed) {
    const v = qAdd(q(Number(mixed[2])), q(Number(mixed[3]), Number(mixed[4])));
    return mixed[1] ? q(-v.n, v.d) : v;
  }
  const frac = /^([\u2212-]?)(\d+)\/(\d+)$/.exec(clean);
  if (frac) return q((frac[1] ? -1 : 1) * Number(frac[2]), Number(frac[3]));
  return parseDecimal(clean);
};

const NUMBER = /^(?:\d{1,3}(?: \d{3})+|\d+)(?:,\d+)?/;

/** Evaluates an expression as printed: + − × ÷ ( ) | | and `a/b` fraction literals. */
export const evalExpr = (source: string): Q => {
  let i = 0;
  const s = source;
  const skip = () => {
    while (s[i] === ' ') i += 1;
  };
  const atom = (): Q => {
    skip();
    if (s[i] === '(') {
      i += 1;
      const v = expr();
      skip();
      i += 1;
      return v;
    }
    if (s[i] === '|') {
      i += 1;
      const v = expr();
      skip();
      i += 1;
      return q(Math.abs(v.n), v.d);
    }
    const mixed = /^(\d{1,2}) ([1-9]\d?)\/(\d+)/.exec(s.slice(i));
    if (mixed) {
      i += mixed[0].length;
      return qAdd(q(Number(mixed[1])), q(Number(mixed[2]), Number(mixed[3])));
    }
    const m = NUMBER.exec(s.slice(i));
    if (!m) throw new Error(`cannot read a number at "${s.slice(i)}" in "${s}"`);
    i += m[0].length;
    let v = parseDecimal(m[0]);
    if (s[i] === '/') {
      i += 1;
      const m2 = NUMBER.exec(s.slice(i))!;
      i += m2[0].length;
      v = qDiv(v, parseDecimal(m2[0]));
    }
    return v;
  };
  const unary = (): Q => {
    skip();
    if (s[i] === MINUS) {
      i += 1;
      const v = unary();
      return q(-v.n, v.d);
    }
    return atom();
  };
  const term = (): Q => {
    let v = unary();
    for (;;) {
      skip();
      if (s[i] === '×') {
        i += 1;
        v = qMul(v, unary());
      } else if (s[i] === '÷') {
        i += 1;
        v = qDiv(v, unary());
      } else return v;
    }
  };
  const expr = (): Q => {
    let v = term();
    for (;;) {
      skip();
      if (s[i] === '+') {
        i += 1;
        v = qAdd(v, term());
      } else if (s[i] === MINUS) {
        i += 1;
        v = qSub(v, term());
      } else return v;
    }
  };
  const result = expr();
  return result;
};

/** The expression of a „გამოთვალე: …“ prompt. */
export const expressionOf = (prompt: string): string => /გამოთვალე: (.+?)\.?$/.exec(prompt)![1]!.replace(/\.$/, '');

/** Every number printed in a text, in order (grouped thousands and decimals understood). */
export const numbersIn = (text: string): number[] =>
  [...text.matchAll(/[\u2212-]?(?:\d{1,3}(?: \d{3})+|\d+)(?:,\d+)?/g)].map((m) => qNum(parseDecimal(m[0])));

export const isPrimeNumber = (n: number): boolean => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

export const primeFactors = (n: number): number[] => {
  const out: number[] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) while (rest % p === 0) { out.push(p); rest /= p; }
  if (rest > 1) out.push(rest);
  return out;
};

/** Georgian number words → number (an independent reader of what `georgianWords` writes). */
export const wordsToNumber = (words: string): number => {
  const units: Record<string, number> = {
    ერთი: 1, ორი: 2, სამი: 3, ოთხი: 4, ხუთი: 5, ექვსი: 6, შვიდი: 7, რვა: 8, ცხრა: 9, ათი: 10,
    თერთმეტი: 11, თორმეტი: 12, ცამეტი: 13, თოთხმეტი: 14, თხუთმეტი: 15, თექვსმეტი: 16, ჩვიდმეტი: 17, თვრამეტი: 18, ცხრამეტი: 19,
  };
  const twenties: Record<string, number> = { ოც: 20, ორმოც: 40, სამოც: 60, ოთხმოც: 80 };
  const hundreds: Record<string, number> = { ას: 100, ორას: 200, სამას: 300, ოთხას: 400, ხუთას: 500, ექვსას: 600, შვიდას: 700, რვაას: 800, ცხრაას: 900 };

  const word = (w: string): number => {
    if (w in units) return units[w]!;
    const hundred = w.replace(/ი$/, '');
    if (hundred in hundreds) return hundreds[hundred]!;
    // 20·k [+ და + 1…19]
    for (const [stem, value] of Object.entries(twenties)) {
      if (w === `${stem}ი`) return value;
      if (w.startsWith(`${stem}და`)) return value + word(w.slice(stem.length + 2));
    }
    throw new Error(`unknown word ${w}`);
  };

  let total = 0;
  let chunk = 0;
  for (const w of words.split(' ')) {
    if (w === 'მილიონ' || w === 'მილიონი') { total += (chunk || 1) * 1_000_000; chunk = 0; }
    else if (w === 'ათას' || w === 'ათასი') { total += (chunk || 1) * 1000; chunk = 0; }
    else chunk += word(w);
  }
  return total + chunk;
};

export const romanToNumber = (r: string): number => {
  const v: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < r.length; i += 1) {
    const cur = v[r[i]!]!;
    const next = v[r[i + 1]!] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
};

export const numberToRoman = (n: number): string => {
  const map: Array<[number, string]> = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let rest = n;
  let out = '';
  for (const [value, text] of map) while (rest >= value) { out += text; rest -= value; }
  return out;
};
