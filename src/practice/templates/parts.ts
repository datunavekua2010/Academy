/**
 * U15 — ტოლი ნაწილები (equal parts and sharing).
 *
 * The whole unit rests on one idea: **a diagram is data, not a hand-drawn picture.**
 *
 * Two concepts form U15:
 *
 * 1. `diagramiT-gayofa` (Sharing with a diagram):
 *    A total number of items is divided equally among recipients (children, vases,
 *    baskets, plates, or groups). The diagram renders the actual groups of items;
 *    the prompt states the total and recipient count; the answer is the size of
 *    one group (`total ÷ recipients`).
 *
 * 2. `toli-nawilebi-2` (Equal parts):
 *    A shape (rectangle, square, circle, pizza, chocolate, strip) is divided into
 *    parts. Each part is drawn as a bracketed token block `[ ■ … ]`. Parts are
 *    equal (`თანაბარი` / `ტოლი`) if and only if every bracket contains the same
 *    number of marks; they are unequal (`არათანაბარი` / `არატოლი`) if the block
 *    counts differ.
 *
 * Tests parse the rendered diagrams back into numbers and check that:
 *  - the item counts in the picture agree with the prompt;
 *  - the part count and equality flag in the picture agree with the answer.
 */

/* ================================================================== *\
 * Items and recipients for sharing
 * ================================================================== */

export interface ShareItem {
  key: string;
  name: string;
  emoji: string;
}

export const SHARE_ITEMS: Record<string, ShareItem> = {
  apple: { key: 'apple', name: 'ვაშლი', emoji: '🍎' },
  ball: { key: 'ball', name: 'ბურთი', emoji: '⚽' },
  cake: { key: 'cake', name: 'ნამცხვარი', emoji: '🍰' },
  pencil: { key: 'pencil', name: 'ფანქარი', emoji: '✏️' },
  strawberry: { key: 'strawberry', name: 'მარწყვი', emoji: '🍓' },
  cube: { key: 'cube', name: 'კუბიკი', emoji: '🧊' },
  bun: { key: 'bun', name: 'ფუნთუშა', emoji: '🥐' },
  candy: { key: 'candy', name: 'კანფეტი', emoji: '🍬' },
  flower: { key: 'flower', name: 'ყვავილი', emoji: '🌸' },
  toy: { key: 'toy', name: 'სათამაშო', emoji: '🧸' },
  pear: { key: 'pear', name: 'მსხალი', emoji: '🍐' },
  orange: { key: 'orange', name: 'ფორთოხალი', emoji: '🍊' },
  book: { key: 'book', name: 'წიგნი', emoji: '📚' },
  balloon: { key: 'balloon', name: 'ბუშტი', emoji: '🎈' },
};

export const SHARE_ITEM_LIST: ShareItem[] = Object.values(SHARE_ITEMS);

export const itemByKey = (key: string): ShareItem => {
  const found = SHARE_ITEMS[key];
  if (!found) throw new Error(`unknown share item "${key}"`);
  return found;
};

export interface Container {
  key: string;
  name: string;
  inName: string;
  emoji: string;
}

export const CONTAINERS: Record<string, Container> = {
  vase: { key: 'vase', name: 'ვაზა', inName: 'ვაზაში', emoji: '🏺' },
  basket: { key: 'basket', name: 'კალათა', inName: 'კალათაში', emoji: '🧺' },
  plate: { key: 'plate', name: 'თეფში', inName: 'თეფშზე', emoji: '🍽️' },
  box: { key: 'box', name: 'ყუთი', inName: 'ყუთში', emoji: '📦' },
};

export const CONTAINER_LIST: Container[] = Object.values(CONTAINERS);

export const containerByKey = (key: string): Container => {
  const found = CONTAINERS[key];
  if (!found) throw new Error(`unknown container "${key}"`);
  return found;
};

/* ================================================================== *\
 * Sharing diagrams
 * ================================================================== */

/**
 * Ordinal prefix in Georgian for children / groups.
 */
export const ordinalLabel = (index: number, noun = 'ბავშვი'): string => {
  if (index === 0) return `1-ლი ${noun}`;
  if (index === 1) return `მე-2 ${noun}`;
  if (index === 2) return `მე-3 ${noun}`;
  if (index === 3) return `მე-4 ${noun}`;
  if (index === 4) return `მე-5 ${noun}`;
  if (index === 5) return `მე-6 ${noun}`;
  return `მე-${index + 1} ${noun}`;
};

/**
 * Draws sharing groups with labels per child or container.
 *
 * Example:
 *   1-ლი ბავშვი: 🍎 🍎 🍎
 *   მე-2 ბავშვი: 🍎 🍎 🍎
 */
export const sharingLabeledDiagram = (
  groups: number,
  perGroup: number,
  emoji: string,
  noun = 'ბავშვი',
): string => {
  const lines: string[] = [];
  for (let i = 0; i < groups; i += 1) {
    const tokens = Array.from({ length: perGroup }, () => emoji).join(' ');
    lines.push(`${ordinalLabel(i, noun)}: ${tokens}`);
  }
  return lines.join('\n');
};

/**
 * Draws sharing groups in bracketed boxes on separate lines.
 *
 * Example:
 *   [ 🍎 🍎 🍎 ]
 *   [ 🍎 🍎 🍎 ]
 */
export const sharingBoxesDiagram = (groups: number, perGroup: number, emoji: string): string => {
  const lines: string[] = [];
  for (let i = 0; i < groups; i += 1) {
    const tokens = Array.from({ length: perGroup }, () => emoji).join(' ');
    lines.push(`[ ${tokens} ]`);
  }
  return lines.join('\n');
};

/**
 * Draws sharing groups on a single line separated by vertical bars.
 *
 * Example:
 *   🍎 🍎 🍎 │ 🍎 🍎 🍎
 */
export const sharingRowDiagram = (groups: number, perGroup: number, emoji: string): string => {
  const groupTexts: string[] = [];
  for (let i = 0; i < groups; i += 1) {
    groupTexts.push(Array.from({ length: perGroup }, () => emoji).join(' '));
  }
  return groupTexts.join('  │  ');
};

/**
 * Draws sharing groups with a leftover / remainder row.
 *
 * Example:
 *   1-ლი ბავშვი: 🍎 🍎 🍎
 *   მე-2 ბავშვი: 🍎 🍎 🍎
 *   დარჩა: 🍎
 */
export const sharingWithRemainderDiagram = (
  groups: number,
  perGroup: number,
  remainder: number,
  emoji: string,
  noun = 'ბავშვი',
): string => {
  const base = sharingLabeledDiagram(groups, perGroup, emoji, noun);
  if (remainder <= 0) return base;
  const leftTokens = Array.from({ length: remainder }, () => emoji).join(' ');
  return `${base}\nდარჩა: ${leftTokens}`;
};

/* ================================================================== *\
 * Geometric divided shapes and equal parts
 * ================================================================== */

export interface DividedShape {
  shapeKey: string;
  shapeName: string;
  parts: number;
  equal: boolean;
  visual: string;
  description: string;
}

const BLOCK = '■';
const PIZZA = '🍕';
const CHOCO = '🍫';

/**
 * Renders bracketed tokens for each part of a shape.
 *
 * `sizes` holds the number of blocks in each part.
 * If all sizes are equal, the shape is divided equally.
 */
export const drawDividedParts = (sizes: number[], glyph = BLOCK): string => {
  return sizes
    .map((size) => {
      const tokens = Array.from({ length: size }, () => glyph).join(' ');
      return `[ ${tokens} ]`;
    })
    .join('   ');
};

/**
 * Two-row layout for a 4-part square (2×2 quadrants).
 */
export const drawDividedGrid2x2 = (sizes: [number, number, number, number], glyph = BLOCK): string => {
  const row1 = `[ ${Array.from({ length: sizes[0] }, () => glyph).join(' ')} ]   [ ${Array.from({ length: sizes[1] }, () => glyph).join(' ')} ]`;
  const row2 = `[ ${Array.from({ length: sizes[2] }, () => glyph).join(' ')} ]   [ ${Array.from({ length: sizes[3] }, () => glyph).join(' ')} ]`;
  return `${row1}\n${row2}`;
};

/**
 * A divided rectangle with `parts` sections.
 */
export const dividedRectangle = (parts: number, equal: boolean): DividedShape => {
  let sizes: number[];
  let description: string;

  if (parts === 2) {
    sizes = equal ? [2, 2] : [1, 3];
    description = equal
      ? '2 ერთნაირ ნაწილად'
      : '2 ნაწილად, რომელთაგან ერთი მეორეზე დიდია';
  } else if (parts === 3) {
    sizes = equal ? [2, 2, 2] : [1, 2, 3];
    description = equal
      ? '3 ერთნაირ ნაწილად'
      : '3 სხვადასხვა ზომის ნაწილად';
  } else if (parts === 4) {
    sizes = equal ? [2, 2, 2, 2] : [1, 2, 2, 3];
    description = equal
      ? '4 ერთნაირ ნაწილად'
      : '4 სხვადასხვა ზომის ნაწილად';
  } else {
    sizes = equal ? Array(parts).fill(2) : [1, ...Array(parts - 1).fill(2)];
    description = equal ? `${parts} ერთნაირ ნაწილად` : `${parts} არათანაბარ ნაწილად`;
  }

  return {
    shapeKey: 'rectangle',
    shapeName: 'მართკუთხედი',
    parts,
    equal,
    visual: drawDividedParts(sizes),
    description,
  };
};

/**
 * A divided square with `parts` sections.
 */
export const dividedSquare = (parts: number, equal: boolean): DividedShape => {
  if (parts === 4) {
    const quadSizes: [number, number, number, number] = equal ? [2, 2, 2, 2] : [1, 3, 2, 2];
    const visual = drawDividedGrid2x2(quadSizes);
    const description = equal
      ? '4 ერთნაირ პატარა კვადრატად'
      : '4 სხვადასხვა ზომის ნაწილად';
    return {
      shapeKey: 'square',
      shapeName: 'კვადრატი',
      parts: 4,
      equal,
      visual,
      description,
    };
  }

  const sizes = equal
    ? Array.from({ length: parts }, () => 2)
    : parts === 2
      ? [1, 3]
      : [1, 2, 3];
  const description = equal ? `${parts} ერთნაირ ნაწილად` : `${parts} არათანაბარ ნაწილად`;
  return {
    shapeKey: 'square',
    shapeName: 'კვადრატი',
    parts,
    equal,
    visual: drawDividedParts(sizes),
    description,
  };
};

/**
 * A divided circle with `parts` sections.
 */
export const dividedCircle = (parts: number, equal: boolean): DividedShape => {
  const sizes = equal
    ? Array.from({ length: parts }, () => 2)
    : parts === 2
      ? [1, 3]
      : [1, 2, 3];
  const description = equal
    ? `${parts} ერთნაირ ნაწილად`
    : parts === 2
      ? '2 ნაწილად: ერთი ნაწილი დიდია, მეორე — პატარა'
      : `${parts} არათანაბარ ნაწილად`;

  return {
    shapeKey: 'circle',
    shapeName: 'წრე',
    parts,
    equal,
    visual: drawDividedParts(sizes),
    description,
  };
};

/**
 * A divided pizza with `parts` sections.
 */
export const dividedPizza = (parts: number, equal: boolean): DividedShape => {
  const sizes = equal
    ? Array.from({ length: parts }, () => 1)
    : parts === 2
      ? [1, 2]
      : [1, 1, 2];
  const description = equal
    ? `${parts} ნაჭრად. ყველა ნაჭერი ერთნაირი ზომისაა`
    : `${parts} ნაჭრად, რომელთა ზომები განსხვავებულია`;

  return {
    shapeKey: 'pizza',
    shapeName: 'პიცა',
    parts,
    equal,
    visual: drawDividedParts(sizes, PIZZA),
    description,
  };
};

/**
 * A divided chocolate bar.
 */
export const dividedChocolate = (parts: number, equal: boolean): DividedShape => {
  const sizes = equal ? [2, 2] : [1, 3];
  const description = equal
    ? '2 ერთნაირ ნაწილად'
    : '2 ნაწილად: ერთში 1 ნატეხია, მეორეში — 3';

  return {
    shapeKey: 'chocolate',
    shapeName: 'შოკოლადი',
    parts,
    equal,
    visual: drawDividedParts(sizes, CHOCO),
    description,
  };
};

/**
 * A strip divided into `parts` sections.
 */
export const dividedStrip = (parts: number, equal: boolean): DividedShape => {
  const sizes = equal
    ? Array.from({ length: parts }, () => 2)
    : parts === 2
      ? [1, 3]
      : [1, 2, 3];
  const description = equal ? `${parts} ერთნაირ ნაწილად` : `${parts} არათანაბარ ნაწილად`;

  return {
    shapeKey: 'strip',
    shapeName: 'ზოლი',
    parts,
    equal,
    visual: drawDividedParts(sizes),
    description,
  };
};

/**
 * Builds lettered comparison pictures: A vs B.
 */
export const letteredFigures = (a: DividedShape, b: DividedShape): string => {
  return `A: ${a.visual}\n\nB: ${b.visual}`;
};

/* ================================================================== *\
 * Inspection and verification helpers for tests
 * ================================================================== */

/**
 * Parses all bracketed parts `[ … ]` from a visual and counts tokens in each part.
 */
export const parseVisualParts = (visual: string): { parts: number; sizes: number[]; equal: boolean } => {
  const matches = [...visual.matchAll(/\[([^\]]+)\]/g)];
  if (matches.length === 0) {
    return { parts: 0, sizes: [], equal: false };
  }
  const sizes = matches.map((m) => {
    const inner = m[1]!.trim();
    // tokens separated by spaces
    const tokens = inner.split(/\s+/).filter((t) => t.length > 0);
    return tokens.length;
  });
  const equal = sizes.every((s) => s === sizes[0]);
  return { parts: sizes.length, sizes, equal };
};

/**
 * Counts total items across all labeled lines in a sharing diagram.
 */
export const parseSharingDiagram = (
  visual: string,
): { lines: number; perLine: number[]; total: number; equal: boolean } => {
  const rawLines = visual.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('დარჩა:'));
  const perLine = rawLines.map((line) => {
    const colonIndex = line.indexOf(':');
    const content = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : line.trim();
    const tokens = content.split(/\s+/).filter((t) => t.length > 0 && t !== '[' && t !== ']');
    return tokens.length;
  });
  const total = perLine.reduce((sum, n) => sum + n, 0);
  const equal = perLine.length > 0 && perLine.every((n) => n === perLine[0]);
  return { lines: rawLines.length, perLine, total, equal };
};
