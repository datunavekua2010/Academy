/**
 * Tiny polynomial normaliser used to compare typed algebraic answers by value
 * rather than by spelling ("5x", "x*5", "5·x" and "2x+3x" all mean the same).
 * Supports + − * × · ( ) ^ ², ³, implicit multiplication, any Latin variables.
 */

export interface Poly {
  /** monomial key (`''` for constants, `'x'`, `'x^2'`, `'x*y'`) → coefficient */
  terms: Map<string, number>;
  /** True when the written form still has brackets or repeated like terms. */
  unsimplified: boolean;
}

type Mono = Map<string, number>; // variable → exponent
type P = Array<{ c: number; m: Mono }>;

const SUPERSCRIPTS: Record<string, string> = { '²': '^2', '³': '^3' };

function normalise(source: string): string {
  return source
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[×·⋅]/g, '*')
    .replace(/[²³]/g, (s) => SUPERSCRIPTS[s])
    .replace(/\s+/g, '');
}

function monoKey(m: Mono): string {
  return [...m.entries()]
    .filter(([, e]) => e !== 0)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([v, e]) => (e === 1 ? v : `${v}^${e}`))
    .join('*');
}

function collect(p: P): Map<string, number> {
  const out = new Map<string, number>();
  for (const { c, m } of p) {
    const key = monoKey(m);
    out.set(key, (out.get(key) ?? 0) + c);
  }
  for (const [k, v] of out) if (Math.abs(v) < 1e-9) out.delete(k);
  return out;
}

function mul(a: P, b: P): P {
  const out: P = [];
  for (const x of a) {
    for (const y of b) {
      const m: Mono = new Map(x.m);
      for (const [v, e] of y.m) m.set(v, (m.get(v) ?? 0) + e);
      out.push({ c: x.c * y.c, m });
    }
  }
  return out;
}

class Parser {
  private i = 0;
  unsimplified = false;
  constructor(private readonly s: string) {}

  parse(): P | null {
    if (!this.s) return null;
    const p = this.expr();
    return p && this.i === this.s.length ? p : null;
  }

  private peek(): string {
    return this.s[this.i] ?? '';
  }

  private expr(): P | null {
    let sign = 1;
    if (this.peek() === '+' || this.peek() === '-') {
      sign = this.peek() === '-' ? -1 : 1;
      this.i += 1;
    }
    let first = this.term();
    if (!first) return null;
    if (sign < 0) first = first.map((t) => ({ c: -t.c, m: t.m }));
    let acc: P = first;
    const seen = new Set<string>(collectKeys(first));
    while (this.peek() === '+' || this.peek() === '-') {
      const minus = this.peek() === '-';
      this.i += 1;
      const next = this.term();
      if (!next) return null;
      for (const key of collectKeys(next)) {
        if (seen.has(key)) this.unsimplified = true;
        seen.add(key);
      }
      acc = acc.concat(minus ? next.map((t) => ({ c: -t.c, m: t.m })) : next);
    }
    return acc;
  }

  private term(): P | null {
    let acc = this.factor();
    if (!acc) return null;
    for (;;) {
      const ch = this.peek();
      if (ch === '*') {
        this.i += 1;
        const f = this.factor();
        if (!f) return null;
        acc = mul(acc, f);
      } else if (/[a-zA-Z(]/.test(ch)) {
        const f = this.factor();
        if (!f) return null;
        acc = mul(acc, f);
      } else break;
    }
    return acc;
  }

  private factor(): P | null {
    const base = this.atom();
    if (!base) return null;
    if (this.peek() === '^') {
      this.i += 1;
      const m = /^\d+/.exec(this.s.slice(this.i));
      if (!m) return null;
      this.i += m[0].length;
      const n = Number(m[0]);
      if (n > 6) return null;
      let out: P = [{ c: 1, m: new Map() }];
      for (let k = 0; k < n; k += 1) out = mul(out, base);
      return out;
    }
    return base;
  }

  private atom(): P | null {
    const ch = this.peek();
    if (ch === '(') {
      this.i += 1;
      this.unsimplified = true;
      const inner = this.expr();
      if (!inner || this.peek() !== ')') return null;
      this.i += 1;
      return inner;
    }
    if (/[a-zA-Z]/.test(ch)) {
      this.i += 1;
      return [{ c: 1, m: new Map([[ch, 1]]) }];
    }
    const num = /^\d+(?:[.,]\d+)?/.exec(this.s.slice(this.i));
    if (num) {
      this.i += num[0].length;
      return [{ c: Number(num[0].replace(',', '.')), m: new Map() }];
    }
    return null;
  }
}

function collectKeys(p: P): string[] {
  return [...collect(p).keys()];
}

export function parsePoly(source: string): Poly | null {
  const parser = new Parser(normalise(source));
  const p = parser.parse();
  if (!p) return null;
  return { terms: collect(p), unsimplified: parser.unsimplified };
}

export function polyEqual(a: Poly, b: Poly): boolean {
  if (a.terms.size !== b.terms.size) return false;
  for (const [k, v] of a.terms) {
    const w = b.terms.get(k);
    if (w === undefined || Math.abs(v - w) > 1e-9) return false;
  }
  return true;
}

/** Parse a plain number the way a student types it (`-3`, `2,5`, `−4`). */
export function parseNumber(source: string): number | null {
  const s = source.replace(/\s+/g, '').replace(/[\u2212\u2013]/g, '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
