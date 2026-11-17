/**
 * Interactions — questions answered by *doing* something to a picture.
 *
 * A spec is plain data (it is regenerated from the question id, never stored),
 * and every spec ends in one canonical **answer string** that the engine compares
 * exactly, like a chosen option. So nothing here is free-hand: a tap, a count, a
 * position, a set — always something that can be checked.
 *
 * | kind     | what the student does                         | answer string          |
 * |----------|-----------------------------------------------|------------------------|
 * | line     | taps a tick on a number line / ruler / scale  | the number             |
 * | chart    | taps a number on a hundred chart              | the number             |
 * | pick     | taps one (or every) fitting item in a row     | 1-based positions, joined by `,` |
 * | clock    | sets both clock hands                         | `h:mm` (h = 1…12)      |
 * | fill     | fills / empties cells, parts or segments      | how many are filled    |
 * | build    | builds a number from tens and ones            | `N` or `tens,ones`     |
 * | purse    | picks coins out of a tray                     | total, or `total/count`|
 * | bins     | sorts items into bins                         | bin index (0-based) per item, joined by `,` |
 * | counters | sets a count per label (bar chart, tally)     | counts joined by `,`   |
 * | sequence | continues a pattern from a palette            | icon keys joined by `,`|
 * | cells    | completes a mirror image                      | right half, rows `/` (`#` filled, `.` empty) |
 * | slots    | sets signs in an expression                   | symbols joined by `,`  |
 */
export type InteractionSpec =
  | {
      kind: 'line';
      min: number;
      max: number;
      step?: number;
      /** Label every n-th tick (default: every tick when ≤ 21, else a sensible gap). */
      labelEvery?: number;
      style?: 'line' | 'ruler' | 'thermo';
      /** A fixed starting dot („დაიწყე აქედან“). */
      start?: number;
      /** Ruler: the object drawn from 0 to this length. Thermometer: the mercury level. */
      bar?: number;
      barIcon?: string;
      /** Suffix shown in the tapped reading, e.g. „სმ“ or „°C“. */
      unit?: string;
    }
  | {
      kind: 'chart';
      from: number;
      to: number;
      cols: number;
      /** Column headings (a calendar's weekdays). */
      heads?: string[];
      /** The first number sits in this column (0-based) — a month that starts midweek. */
      offset?: number;
    }
  | {
      kind: 'pick';
      items: Array<{ icon?: string; label?: string }>;
      /** `one`: tap one item; `many`: tap every item that fits. */
      mode: 'one' | 'many';
    }
  | { kind: 'clock'; minuteStep?: number }
  | {
      kind: 'fill';
      shape: 'frame10' | 'frame20' | 'row' | 'grid' | 'bar' | 'circle';
      total: number;
      cols?: number;
      /** How many cells are on at the start (they are the first ones). */
      start?: number;
      /** How many of those cannot be switched off. */
      locked?: number;
      /** What a filled cell looks like: an icon key, or shaded colour when omitted. */
      icon?: string;
      /**
       * What is reported: every cell that is on (`all`), only those beyond the
       * locked ones (`extra`), or the cells switched off (`off`).
       */
      output?: 'all' | 'extra' | 'off';
      /** Spoken noun for the counter, „ცალი“ by default. */
      noun?: string;
    }
  | { kind: 'build'; startTens: number; startOnes: number; output: 'number' | 'pair'; maxTens?: number }
  | { kind: 'purse'; coins: number[]; output: 'total' | 'totalCount' }
  | { kind: 'bins'; items: Array<{ label?: string; icon?: string }>; bins: string[] }
  | {
      kind: 'counters';
      style: 'bars' | 'tally' | 'icons';
      labels: string[];
      icon: string;
      max: number;
      start?: number[];
      /** Each icon stands for this many (pictograms). */
      per?: number;
    }
  | { kind: 'sequence'; shown: string[]; palette: string[]; length: number }
  | { kind: 'cells'; rows: string[] }
  | { kind: 'slots'; tokens: string[]; options: string[] };
