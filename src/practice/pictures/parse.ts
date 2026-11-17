import { clockFace } from '../templates/clock';
import {
  CHAR_ICONS,
  PLACEHOLDER_CHARS,
  isPictographic,
  stripVs,
} from './iconMap';
import { liftPictures } from './lift';
import type { NumberCell, PicRow, PicToken, Picture, Segment } from './types';

/**
 * Text pictures → structured pictures.
 *
 * Templates draw their pictures as text: emoji rows, a character dial, coin
 * boxes, a hundred chart as a block of numbers. `pictorialize` reads those
 * lines back as data so the renderer can draw them properly. It is deliberately
 * conservative: a line becomes a picture only when *everything* on it is
 * picture material (objects, brackets, separators, a caption). A sentence that
 * merely contains an emoji stays a sentence, and the question's wording is never
 * touched — only the lines that were drawing something are lifted out.
 */

/* ---------------------------------------------------------------- *\
 * Tokenising one line
 * ---------------------------------------------------------------- */

type Raw =
  | { k: 'icon'; icon: string; ka: string }
  | { k: 'rod'; color: string }
  | { k: 'unknown' }
  | { k: 'cross' }
  | { k: 'pointer' }
  | { k: 'word'; s: string }
  | { k: 'sym'; s: string };

const SYMBOLS = new Set(['[', ']', '(', ')', '|', '│', '➔', '→', '+', '−', '=', '·', '~~']);

const COLOR_OF: Record<string, string> = {
  '🟦': 'blue', '🔵': 'blue', '🔴': 'red', '🟥': 'red', '🟡': 'yellow', '🟨': 'yellow',
  '🟢': 'green', '🟩': 'green', '🟣': 'purple', '🟪': 'purple', '🟠': 'orange', '🟧': 'orange',
};

function tokenize(line: string): Raw[] {
  const text = stripVs(line);
  const out: Raw[] = [];
  const chars = Array.from(text);
  let i = 0;
  let word = '';
  const flush = () => {
    if (word) out.push({ k: 'word', s: word });
    word = '';
  };
  while (i < chars.length) {
    const ch = chars[i]!;
    if (/\s/.test(ch)) {
      flush();
      i += 1;
      continue;
    }
    // A ten rod: a colour then `░░░░░░░░▌`.
    if (chars[i + 1] === '░') {
      let j = i + 1;
      while (chars[j] === '░') j += 1;
      if (chars[j] === '▌') {
        flush();
        out.push({ k: 'rod', color: COLOR_OF[ch] ?? 'blue' });
        i = j + 1;
        continue;
      }
    }
    if (ch === '~' && chars[i + 1] === '~') {
      flush();
      out.push({ k: 'sym', s: '~~' });
      i += 2;
      continue;
    }
    if (SYMBOLS.has(ch)) {
      flush();
      out.push({ k: 'sym', s: ch });
      i += 1;
      continue;
    }
    const placeholder = PLACEHOLDER_CHARS[ch];
    if (placeholder) {
      flush();
      out.push({ k: placeholder === 'crossed' ? 'cross' : placeholder });
      i += 1;
      continue;
    }
    const known = CHAR_ICONS[ch];
    if (known) {
      flush();
      out.push({ k: 'icon', icon: known.key, ka: known.ka });
      i += 1;
      continue;
    }
    if (isPictographic(ch) && !/[0-9#*]/.test(ch)) {
      flush();
      out.push({ k: 'icon', icon: `glyph:${ch}`, ka: 'სურათი' });
      i += 1;
      continue;
    }
    word += ch;
    i += 1;
  }
  flush();
  return out;
}

/* ---------------------------------------------------------------- *\
 * A line of objects
 * ---------------------------------------------------------------- */

const ALLOWED_WORDS = new Set(['და', 'ათეული', 'ერთეული']);
const isNumberWord = (s: string) => /^[0-9.,:+−\-=?<>×÷]+$/.test(s);

interface ParsedLine {
  label?: string;
  tokens: PicToken[];
  icons: number;
}

/**
 * Reads a line as a row of objects, or returns null when the line is a sentence
 * (or a sum, or a table) that merely contains a symbol.
 */
function parseObjectLine(line: string, allowLabelOnly = false): ParsedLine | null {
  const raw = tokenize(line);
  if (raw.length === 0) return null;
  let pos = 0;
  let icons = 0;
  let numeric = 0;
  let crossing = false;

  // A caption at the start: words up to and including one that ends with a colon.
  let label: string | undefined;
  {
    let j = 0;
    const parts: string[] = [];
    while (raw[j]?.k === 'word') {
      const s = (raw[j] as { s: string }).s;
      parts.push(s);
      j += 1;
      if (s.endsWith(':')) {
        label = parts.join(' ').replace(/:$/, '');
        pos = j;
        break;
      }
    }
  }

  const parseList = (closer: string | null, depth: number): PicToken[] | null => {
    const tokens: PicToken[] = [];
    while (pos < raw.length) {
      const token = raw[pos]!;
      if (token.k === 'sym' && closer && token.s === closer) {
        pos += 1;
        return tokens;
      }
      pos += 1;
      switch (token.k) {
        case 'icon':
          icons += 1;
          tokens.push({ t: 'icon', icon: token.icon, state: crossing ? 'crossed' : undefined });
          break;
        case 'rod':
          icons += 1;
          tokens.push({ t: 'rod', color: token.color });
          break;
        case 'unknown':
          tokens.push({ t: 'unknown' });
          break;
        case 'cross':
          tokens.push({ t: 'icon', icon: 'cross', state: undefined });
          break;
        case 'pointer':
          tokens.push({ t: 'pointer' });
          break;
        case 'word': {
          const inside = depth > 0;
          if (inside) {
            tokens.push({ t: 'text', text: token.s });
          } else if (token.s.endsWith(':')) {
            tokens.push({ t: 'text', text: token.s });
          } else if (isNumberWord(token.s)) {
            numeric += 1;
            tokens.push({ t: 'text', text: token.s });
          } else if (ALLOWED_WORDS.has(token.s)) {
            tokens.push({ t: 'text', text: token.s });
          } else if (/^[0-9]+:?$/.test(token.s)) {
            numeric += 1;
            tokens.push({ t: 'text', text: token.s });
          } else {
            return null;
          }
          break;
        }
        case 'sym':
          if (token.s === '~~') {
            crossing = !crossing;
          } else if (token.s === '[' || token.s === '(') {
            const inner = parseList(token.s === '[' ? ']' : ')', depth + 1);
            if (!inner) return null;
            // A parenthesis is a caption; a bracket is a group of objects.
            if (token.s === '(') {
              const words = inner.filter((x) => x.t === 'text').map((x) => (x as { text: string }).text);
              if (inner.some((x) => x.t === 'icon' || x.t === 'rod')) {
                tokens.push({ t: 'group', tokens: inner });
              } else {
                tokens.push({ t: 'text', text: `(${words.join(' ')})` });
              }
            } else {
              tokens.push({ t: 'group', tokens: inner });
            }
          } else if (token.s === ']' || token.s === ')') {
            return null;
          } else if (token.s === '|' || token.s === '│') {
            tokens.push({ t: 'sep', style: 'bar' });
          } else if (token.s === '➔' || token.s === '→') {
            tokens.push({ t: 'sep', style: 'arrow' });
          } else {
            numeric += 1;
            tokens.push({ t: 'text', text: token.s });
          }
          break;
      }
    }
    return closer ? null : tokens;
  };

  const tokens = parseList(null, 0);
  if (!tokens) return null;
  if (icons === 0) {
    if (allowLabelOnly && label !== undefined && tokens.length === 0) return { label, tokens, icons };
    return null;
  }
  if (numeric > 0 && icons < 2) return null;
  const rods = groupTens(tokens);
  return { label, tokens: rods, icons };
}

/** Ten blue squares in a row are one ten rod — the same quantity, drawn as it is taught. */
function groupTens(tokens: PicToken[]): PicToken[] {
  const out: PicToken[] = [];
  let run = 0;
  const flush = () => {
    while (run >= 10) {
      out.push({ t: 'rod', color: 'blue' });
      run -= 10;
    }
    for (; run > 0; run -= 1) out.push({ t: 'icon', icon: 'sq-blue' });
  };
  for (const token of tokens) {
    if (token.t === 'icon' && token.icon === 'sq-blue' && !token.state) {
      run += 1;
      continue;
    }
    flush();
    out.push(token.t === 'group' ? { ...token, tokens: groupTens(token.tokens) } : token);
  }
  flush();
  // Only a whole multiple of ten is a rod; anything else is a count of squares.
  return out;
}

/* ---------------------------------------------------------------- *\
 * Number strips and charts
 * ---------------------------------------------------------------- */

function parseCells(line: string): NumberCell[] | null {
  const spaced = stripVs(line)
    .replace(/—/g, ' ')
    .replace(/\[/g, ' [')
    .replace(/\]/g, '] ');
  const parts = spaced.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const cells: NumberCell[] = [];
  let pointer = false;
  for (const part of parts) {
    if (part === '👉') {
      pointer = true;
      continue;
    }
    let m = /^\[(▼)?(\d+)\]$/.exec(part);
    if (m) {
      cells.push({ text: m[2]!, mark: true, pointer: pointer || Boolean(m[1]) });
      pointer = false;
      continue;
    }
    m = /^(\d+)(\?)?$/.exec(part);
    if (m) {
      cells.push({ text: m[1]!, unknown: Boolean(m[2]), pointer });
      pointer = false;
      continue;
    }
    if (part === '?') {
      cells.push({ text: '?', unknown: true });
      continue;
    }
    return null;
  }
  return cells;
}

/* ---------------------------------------------------------------- *\
 * Fixed vocabularies
 * ---------------------------------------------------------------- */

const CALENDAR_WORDS = new Set([
  'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა',
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
  'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
  'ზამთარი', 'გაზაფხული', 'ზაფხული', 'შემოდგომა',
]);

const SHAPE_KEYS: Record<string, number> = {};
void SHAPE_KEYS;

/* ---------------------------------------------------------------- *\
 * Clock lookup
 * ---------------------------------------------------------------- */

let uniqueFaceList: Array<[string, number]> | null = null;
function uniqueFaces(): Array<[string, number]> {
  if (!uniqueFaceList) {
    const seen = new Map<string, number[]>();
    for (let m = 0; m < 720; m += 1) {
      const face = clockFace(m);
      seen.set(face, [...(seen.get(face) ?? []), m]);
    }
    uniqueFaceList = [...seen].filter(([, times]) => times.length === 1).map(([face, times]) => [face, times[0]!]);
  }
  return uniqueFaceList;
}

/* ---------------------------------------------------------------- *\
 * The block parser
 * ---------------------------------------------------------------- */

export interface PictorialOptions {
  /**
   * Everything in a `visual` is picture material, so a caption on a line of its
   * own („პირველი:“) is a heading of the picture. In a prompt the same line is
   * more likely the question's own wording, so it stays text.
   */
  isVisual: boolean;
  /** Exact times of the clocks drawn in the text, when the generator recorded them. */
  clocks?: number[];
}

/** Splits a text into runs of words and pictures, preserving their order. */
export function pictorialize(source: string, options: PictorialOptions): Segment[] {
  if (!source) return [];
  let text = source;
  const segments: Segment[] = [];

  // 1. The clock dial. It is matched whole, against the face of each time the
  // generator says it drew. Without that list the dial is read back from the
  // characters, but only when the face is unambiguous — a wrong hour is worse
  // than the old drawing.
  if (text.includes('┼')) {
    const recorded = options.clocks ?? [];
    // Of the recorded times, the one whose face comes first in the text.
    let best: { at: number; face: string; minutes: number; index: number } | null = null;
    recorded.forEach((minutes, index) => {
      const face = clockFace(minutes);
      const at = text.indexOf(face);
      if (at >= 0 && (best === null || at < best.at)) best = { at, face, minutes, index };
    });
    const found = best as { at: number; face: string; minutes: number; index: number } | null;
    const candidates: Array<{ at: number; face: string; minutes: number; rest: number[] }> = [];
    if (found) {
      candidates.push({ ...found, rest: recorded.filter((_, i) => i !== found.index) });
    } else if (recorded.length === 0) {
      for (const [face, minutes] of uniqueFaces()) {
        const at = text.indexOf(face);
        if (at >= 0) candidates.push({ at, face, minutes, rest: [] });
      }
    }
    const hit = candidates[0];
    if (hit) {
      return [
        ...pictorialize(text.slice(0, hit.at), { ...options, clocks: [] }),
        { type: 'picture', picture: { kind: 'clock', minutes: hit.minutes } },
        ...pictorialize(text.slice(hit.at + hit.face.length), { ...options, clocks: hit.rest }),
      ];
    }
  }

  // A dial that could not be matched stays the character drawing it always was —
  // its numerals must not be read as a number chart.
  if (text.includes('┼')) return [{ type: 'text', text }];

  const lines = text.split('\n');
  let textBuf: string[] = [];
  const flushText = () => {
    const joined = textBuf.join('\n').replace(/^\n+|\n+$/g, '');
    if (joined.trim() !== '') segments.push({ type: 'text', text: joined });
    textBuf = [];
  };
  const push = (picture: Picture) => {
    flushText();
    segments.push({ type: 'picture', picture });
  };

  let rows: PicRow[] = [];
  const flushRows = () => {
    if (rows.length > 0) push({ kind: 'rows', rows });
    rows = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    // Blank lines end a block of rows.
    if (trimmed === '') {
      flushRows();
      textBuf.push(line);
      i += 1;
      continue;
    }

    // Coins: three-line boxes. A label line may sit directly above.
    if (line.includes('╭')) {
      flushRows();
      let label: string | undefined;
      const prev = textBuf.length > 0 ? textBuf[textBuf.length - 1]! : undefined;
      if (prev !== undefined && prev.trim() !== '' && !/[│╭╰]/.test(prev) && options.isVisual) {
        label = prev.trim();
        textBuf.pop();
      }
      const coins: number[] = [];
      while (i < lines.length && lines[i]!.includes('╭')) {
        const middle = lines[i + 1] ?? '';
        for (const m of middle.matchAll(/│\s*(\d+)\s*│/g)) coins.push(Number(m[1]));
        i += 3;
      }
      push({ kind: 'coins', label, coins });
      continue;
    }

    // Price tags: `◆ 45 თეთრი`, optionally numbered `#1  ◆ …`.
    if (/^(#?\d*\s*)◆\s*\d+\s*თეთრი\s*$/.test(trimmed)) {
      flushRows();
      const items: Array<{ label?: string; amount: number }> = [];
      while (i < lines.length) {
        const m = /^(#\d+)?\s*◆\s*(\d+)\s*თეთრი\s*$/.exec(lines[i]!.trim());
        if (!m) break;
        items.push({ label: m[1], amount: Number(m[2]) });
        i += 1;
      }
      push({ kind: 'tags', items });
      continue;
    }

    // Ribbons: `ა) ▬▬▬ 20 სმ` or a bare ribbon.
    if (/▬/.test(line) && /^(?:\S{1,2}\)\s*)?▬+(?:\s+.*)?$/.test(trimmed)) {
      flushRows();
      const items: Array<{ label?: string; size: number; caption?: string }> = [];
      while (i < lines.length) {
        const m = /^(?:(\S{1,2}\))\s*)?(▬+)(?:\s+(.*))?$/.exec(lines[i]!.trim());
        if (!m) break;
        const caption = m[3]?.trim();
        const valued = caption ? /^(\d+)/.exec(caption) : null;
        items.push({
          label: m[1],
          size: valued ? Number(valued[1]) : m[2]!.length,
          caption,
        });
        i += 1;
      }
      push({ kind: 'bars', items });
      continue;
    }

    // Symmetry cells: lines of ·, ■ and an optional axis │ (at least two rows).
    if (/^[·■│ ]{2,}$/.test(line) && /^[·■│ ]{2,}$/.test(lines[i + 1] ?? '') && /■/.test(line + (lines[i + 1] ?? ''))) {
      flushRows();
      let label: string | undefined;
      const prev = textBuf.length > 0 ? textBuf[textBuf.length - 1]! : undefined;
      if (prev !== undefined && /^\[[^\]]+\]$/.test(prev.trim())) {
        label = prev.trim().replace(/^\[|\]$/g, '');
        textBuf.pop();
      }
      const grid: string[] = [];
      while (i < lines.length && /^[·■│ ]{2,}$/.test(lines[i]!)) {
        grid.push(lines[i]!.trim());
        i += 1;
      }
      push({ kind: 'cells', label, rows: grid });
      continue;
    }

    // Balance scale: a single level line, or the three-line tilted drawing.
    if (/═+\s*▲\s*═+/.test(line) || (/═+\s*▲\s*═+/.test(lines[i + 1] ?? '') && /\[/.test(line))) {
      const level = /^\s*\[.*\]\s*═+\s*▲\s*═+\s*\[.*\]\s*$/.exec(line);
      if (level) {
        const [leftText, rightText] = line.split(/═+\s*▲\s*═+/);
        const left = parseObjectLine(leftText ?? '');
        const right = parseObjectLine(rightText ?? '');
        if (left && right) {
          flushRows();
          push({ kind: 'balance', left: left.tokens, right: right.tokens, tilt: 'level' });
          i += 1;
          continue;
        }
      } else if (/═+\s*▲\s*═+/.test(lines[i + 1] ?? '') && /\[.*\]/.test(line) && /\[.*\]/.test(lines[i + 2] ?? '')) {
        const topLine = line;
        const bottomLine = lines[i + 2]!;
        const topWords = /\((დაბლა|მაღლა)\)/.exec(topLine)?.[1];
        const strip = (s: string) => s.replace(/\((დაბლა|მაღლა)\)/g, '');
        const top = parseObjectLine(strip(topLine));
        const bottom = parseObjectLine(strip(bottomLine));
        if (top && bottom && topWords) {
          flushRows();
          // Both drawings print the left pan on the first line and the right pan
          // on the last; the caption says which of the two hangs lower.
          const left = top;
          const right = bottom;
          const leftDown = topWords === 'დაბლა';
          push({
            kind: 'balance',
            left: left.tokens,
            right: right.tokens,
            tilt: leftDown ? 'left' : 'right',
          });
          i += 3;
          continue;
        }
      }
    }

    // Column arithmetic: a number over a signed number, an optional rule.
    {
      const first = /^\s*(\d+)\s*$/.exec(line);
      const second = lines[i + 1] ? /^\s*([+−-])\s*(\d+)\s*$/.exec(lines[i + 1]!) : null;
      if (first && second) {
        let consumed = 2;
        let result: string | undefined;
        const third = lines[i + 2]?.trim();
        if (third && /^[—-]{2,}$|^[─━]+$/.test(third)) consumed = 3;
        const eq = lines[i + consumed]?.trim();
        if (eq && /^=\s*\?$/.test(eq)) {
          result = '?';
          consumed += 1;
        }
        let heading: string | undefined;
        const prev = textBuf.length > 0 ? textBuf[textBuf.length - 1]! : undefined;
        if (prev !== undefined && /^\S+$/.test(prev.trim()) && options.isVisual) {
          heading = prev.trim();
          textBuf.pop();
        }
        flushRows();
        push({
          kind: 'column',
          heading,
          top: first[1]!,
          sign: second[1] === '+' ? '+' : '−',
          bottom: second[2]!,
          result,
        });
        i += consumed;
        continue;
      }
    }

    // Numbers: several lines are a chart, one line is a number strip.
    {
      const cells = parseCells(line);
      if (cells && cells.length >= 2) {
        const block: NumberCell[][] = [cells];
        let j = i + 1;
        while (j < lines.length) {
          const next = parseCells(lines[j]!);
          if (!next || next.length < 2) break;
          block.push(next);
          j += 1;
        }
        const enough = block.length >= 2 || cells.length >= 3;
        if (enough) {
          flushRows();
          push(block.length >= 2 ? { kind: 'chart', rows: block } : { kind: 'strip', cells });
          i = j;
          continue;
        }
      }
    }

    // Calendar words in a line: weekdays, months, seasons.
    {
      const stripped = stripVs(trimmed);
      const arrows = stripped.includes('→');
      const pieces = stripped.split(/\s*[·→]\s*/).map((p) => p.trim()).filter(Boolean);
      if (
        pieces.length >= 3 &&
        pieces.every((p) => CALENDAR_WORDS.has(p.replace(/^\[|\]$/g, '')))
      ) {
        flushRows();
        push({
          kind: 'chips',
          arrows,
          items: pieces.map((p) => ({
            text: p.replace(/^\[|\]$/g, ''),
            mark: /^\[.*\]$/.test(p),
          })),
        });
        i += 1;
        continue;
      }
    }

    // Parts of a whole: `[ ■ ■ ]   [ ■ ■ ]` — brackets of blocks.
    if (/^\s*(?:[A-Za-zა-ჰ]+:\s*)?(?:\[\s*[■□](?:\s+[■□])*\s*\]\s*[│|]?\s*)+$/.test(line)) {
      const label = /^\s*([A-Za-zა-ჰ]+):/.exec(line)?.[1];
      const body = line.replace(/^\s*[A-Za-zა-ჰ]+:\s*/, '');
      const bars: Array<Array<{ size: number; shaded: boolean }>> = [];
      let current: Array<{ size: number; shaded: boolean }> = [];
      for (const piece of body.split(/(\[[^\]]*\]|[│|])/).filter((p) => p.trim() !== '')) {
        if (piece === '│' || piece === '|') {
          bars.push(current);
          current = [];
          continue;
        }
        const blocks = piece.match(/[■□]/g) ?? [];
        current.push({ size: blocks.length, shaded: blocks.every((b) => b === '■') });
      }
      if (current.length > 0) bars.push(current);
      flushRows();
      push({ kind: 'parts', bars, divider: bars.length > 1, label });
      i += 1;
      continue;
    }

    // A row of objects.
    const parsed = parseObjectLine(line, options.isVisual);
    if (parsed) {
      rows.push({ label: parsed.label, tokens: parsed.tokens });
      i += 1;
      continue;
    }

    // Not a picture: ordinary words. A caption row in a visual is a heading.
    flushRows();
    textBuf.push(line);
    i += 1;
  }
  flushRows();
  flushText();
  return segments;
}

/* ---------------------------------------------------------------- *\
 * Georgian description for assistive technology
 * ---------------------------------------------------------------- */

const iconName = (key: string): string => {
  for (const info of Object.values(CHAR_ICONS)) if (info.key === key) return info.ka;
  if (key === 'cross') return 'გადახაზული';
  return 'სურათი';
};

function countTokens(tokens: PicToken[], counts: Map<string, number>) {
  for (const token of tokens) {
    if (token.t === 'icon') {
      const name = `${iconName(token.icon)}${token.state === 'crossed' ? ' (გადახაზული)' : ''}`;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    } else if (token.t === 'rod') {
      counts.set('ათეული', (counts.get('ათეული') ?? 0) + 1);
    } else if (token.t === 'group') {
      countTokens(token.tokens, counts);
    } else if (token.t === 'unknown') {
      counts.set('უცნობი', (counts.get('უცნობი') ?? 0) + 1);
    }
  }
}

/** The numbers and signs written in a row (a chain such as „52 → −17 → +14 → ?“). */
function writtenTokens(tokens: PicToken[]): string[] {
  return tokens.flatMap((token) =>
    token.t === 'text' ? [token.text] : token.t === 'group' ? writtenTokens(token.tokens) : token.t === 'sep' && token.style === 'arrow' ? ['→'] : [],
  );
}

/** The picture in words, so nothing is lost for a student who cannot see it. */
export function describePicture(picture: Picture): string {
  switch (picture.kind) {
    case 'rows':
      return picture.rows
        .map((row) => {
          const counts = new Map<string, number>();
          countTokens(row.tokens, counts);
          const parts = [...counts].map(([name, n]) => `${name}: ${n}`);
          const written = writtenTokens(row.tokens).join(' ');
          if (written) parts.push(written);
          return `${row.label ? `${row.label}. ` : ''}${parts.join(', ')}`;
        })
        .join('. ');
    case 'strip':
      return `რიცხვითი ხაზი: ${picture.cells.map((c) => (c.mark ? `მონიშნული ${c.text}` : c.text)).join(', ')}`;
    case 'chart':
      return `რიცხვების ცხრილი: ${picture.rows.map((r) => r.map((c) => (c.mark ? `მონიშნული ${c.text}` : c.text)).join(' ')).join('; ')}`;
    case 'clock':
      return 'ანალოგური საათი ისრებით';
    case 'coins':
      return `${picture.label ? `${picture.label}: ` : ''}${picture.coins.map((c) => `${c} თეთრი`).join(', ')}`;
    case 'tags':
      return picture.items.map((t) => `${t.label ? `${t.label} ` : ''}${t.amount} თეთრი`).join('; ');
    case 'bars':
      return picture.items.map((b) => `${b.label ?? ''} ${b.caption ?? ''}`.trim()).join('; ');
    case 'column':
      return `${picture.top} ${picture.sign} ${picture.bottom}`;
    case 'cells':
      return `${picture.label ? `${picture.label}: ` : ''}უჯრებისგან შედგენილი ფიგურა`;
    case 'balance':
      return picture.tilt === 'level'
        ? 'სასწორი წონასწორობაშია'
        : picture.tilt === 'left'
          ? 'სასწორის მარცხენა მხარე დაბლაა'
          : 'სასწორის მარჯვენა მხარე დაბლაა';
    case 'chips':
      return picture.items.map((c) => (c.mark ? `მონიშნული ${c.text}` : c.text)).join(', ');
    case 'blocks':
      return `${picture.label ? `${picture.label}: ` : ''}${picture.tens} ათეული და ${picture.ones} ერთეული`;
    case 'model':
      return `ზოლოვანი მოდელი: მთელი ${picture.whole}, ნაწილები ${picture.parts.join(' და ')}`;
    case 'tally':
      return picture.rows.map((r) => `${r.label ? `${r.label}: ` : ''}${r.count} აღრიცხვის ნიშანი`).join('; ');
    case 'line':
      return `რიცხვითი ხაზი ${picture.from}-დან ${picture.to}-მდე; მონიშნულია ${picture.marks.map((m) => m.value).join(', ')}`;
    case 'rect':
      return `მართკუთხედი: ${picture.width} და ${picture.height}`;
    case 'parts':
      return `ფიგურა დაყოფილია ${picture.bars.map((b) => b.length).join(' და ')} ნაწილად`;
    case 'diagram':
      return picture.alt;
  }
}

/* ---------------------------------------------------------------- *\
 * Pictures the wording describes
 * ---------------------------------------------------------------- */

/**
 * Pictures a question *describes in words* but never drew.
 *
 * „მოდელზე გამოსახულია 8 ათეული და 3 ერთეული“ names a picture that was not
 * there. The sentence stays — it is the question's own data — and the picture it
 * describes is drawn above it, from the same numbers in the same sentence, so the
 * two cannot disagree. Only an exact, unambiguous phrase is drawn; anything with a
 * placeholder (❓, □, ___) is left as words, because there the number is the
 * thing being asked. The exception is `liftPictures`, which draws only what the
 * numbers around the placeholder already fix (a part–whole model for
 * „43 + ___ = 69“, the blocks for each operand).
 */
export function describedPictures(prompt: string): Picture[] {
  const text = stripVs(prompt);
  if (/[❓□]|_{2,}/.test(text)) return liftPictures(prompt);
  const found: Picture[] = [];
  const blocks = /(\d+)\s*ათეულ[ა-ჰ]*(?:\s*\([^)]*\))?\s*(?:და|,)\s*(\d+)\s*ერთეულ/g;
  for (const m of text.matchAll(blocks)) {
    const tens = Number(m[1]);
    const ones = Number(m[2]);
    if (tens >= 1 && tens <= 10 && ones <= 19) found.push({ kind: 'blocks', tens, ones });
  }
  // Only one model per question: two models are a comparison the words already make.
  if (found.length === 1) return found;
  return found.length === 0 ? liftPictures(prompt) : [];
}
