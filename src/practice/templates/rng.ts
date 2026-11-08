/**
 * Deterministic pseudo-random numbers.
 *
 * Every generated question carries a seed, so `templateId~seed` can always be
 * regenerated into exactly the same question. That matters for two reasons:
 *
 *  1. a restored draft session shows the same questions it had before reload;
 *  2. tests can assert on exact numbers instead of fishing for a lucky draw.
 */

/** Small, fast, well-distributed 32-bit hash (FNV-1a + avalanche). */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // final avalanche so short seeds don't clump
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x21f0aaad);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x735a2d97);
  hash ^= hash >>> 15;
  return hash >>> 0;
}

/** mulberry32 — tiny, deterministic, good enough for classroom exercises. */
export function makeRng(seed: number | string): () => number {
  let state = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] (inclusive). */
export function randomInt(rng: () => number, min: number, max: number): number {
  if (max < min) return min;
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Fisher–Yates; returns a new array. */
export function shuffleWith<T>(rng: () => number, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
