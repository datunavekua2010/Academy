import type { PuzzleSentence, PuzzleStep } from '../types';
import { fill, filledText, holds, runSteps, sentenceText, solve, stepText, symbolsOf } from './PuzzleGeometry';

/**
 * Pictures and answer controls for G2 U11.
 *
 * A sentence is always drawn from the same data the checker solves: the symbol in a blank is the symbol that is missing,
 * and the "check" line under a solved sentence is `holds()` on the numbers that were just filled in. Nothing is written
 * out twice, so the picture cannot claim a sentence the checker disagrees with.
 */

/** One part of a sentence: a number, or the symbol standing in a blank. */
export function SentenceTerm({ term }: { term: PuzzleSentence['a'] }) {
  if (typeof term === 'number') return <span className="pz-num">{term}</span>;
  return (
    <span className="pz-box" aria-label={`უცნობი ${term.sym}`}>
      {term.sym}
    </span>
  );
}

/**
 * A whole sentence, read left to right. `solved` fills the symbols in with their values and shows the check underneath,
 * which is how the student verifies an answer without being told "correct".
 */
export function SentenceBoard({
  sentence,
  solved,
  values,
  caption,
  label,
}: {
  sentence: PuzzleSentence;
  /** Show the numbers in place of the symbols, and the check that the sentence now holds. */
  solved?: boolean;
  /** When the values are known from elsewhere (a fact family, an earlier step). */
  values?: Record<string, number>;
  caption?: string;
  label?: string;
}) {
  const known = values ?? (solved ? solve(sentence).values : {});
  const filled = Object.keys(known).length > 0 ? fill(sentence, known) : null;
  return (
    <figure className="pz" aria-label={label ?? `წინადადება ${sentenceText(sentence)}`}>
      <div className="pz-line">
        {solved && filled ? (
          <>
            <span className="pz-num">{filled.a}</span>
            <span className="pz-op">{filled.op}</span>
            <span className="pz-num">{filled.b}</span>
            <span className="pz-eq">=</span>
            <span className={`pz-num ${holds(filled.a, filled.op, filled.b, filled.c) ? 'is-true' : 'is-false'}`}>{filled.c}</span>
          </>
        ) : (
          <>
            <SentenceTerm term={sentence.a} />
            <span className="pz-op">{sentence.op}</span>
            <SentenceTerm term={sentence.b} />
            <span className="pz-eq">=</span>
            <SentenceTerm term={sentence.c} />
          </>
        )}
      </div>
      {solved && filled && (
        <figcaption className={`pz-check ${holds(filled.a, filled.op, filled.b, filled.c) ? 'is-ok' : 'is-no'}`}>
          {holds(filled.a, filled.op, filled.b, filled.c) ? 'წინადადება სრულდება' : 'წინადადება არ სრულდება'}
        </figcaption>
      )}
      {caption && <figcaption className="pz-cap">{caption}</figcaption>}
    </figure>
  );
}

/**
 * The fact-family triangle: the whole at the top, the two parts at the bottom. A symbol marks the number the student has
 * to find, and the three sentences below are the family itself.
 */
export function FamilyTriBoard({
  whole,
  parts,
  hide,
  caption,
}: {
  whole: number;
  parts: [number, number];
  /** Which of the three numbers is covered. */
  hide?: 'whole' | 'a' | 'b';
  caption?: string;
}) {
  const shown = (which: 'whole' | 'a' | 'b', value: number) => (hide === which ? '□' : String(value));
  return (
    <figure className="fam" aria-label={`ოჯახის სამკუთხედი: ${shown('whole', whole)}, ${shown('a', parts[0])}, ${shown('b', parts[1])}`}>
      <div className="fam-tri" aria-hidden="true">
        <span className="fam-top">{shown('whole', whole)}</span>
        <span className="fam-part">{shown('a', parts[0])}</span>
        <span className="fam-part">{shown('b', parts[1])}</span>
      </div>
      <ul className="fam-list">
        <li>
          {shown('a', parts[0])} + {shown('b', parts[1])} = {shown('whole', whole)}
        </li>
        <li>
          {shown('whole', whole)} − {shown('a', parts[0])} = {shown('b', parts[1])}
        </li>
        <li>
          {shown('whole', whole)} − {shown('b', parts[1])} = {shown('a', parts[0])}
        </li>
      </ul>
      {caption && <figcaption className="fam-cap">{caption}</figcaption>}
    </figure>
  );
}

/** A chain of steps with every intermediate value drawn — a missing value is a blank box. */
export function ChainBoard({
  start,
  steps,
  hide,
  caption,
}: {
  start: number;
  steps: PuzzleStep[];
  /** Which results to cover: 1 for the first step's result, and so on. The start is index 0. */
  hide?: number[];
  caption?: string;
}) {
  const results = runSteps(start, steps);
  const cells: Array<{ value: number; hidden: boolean; kind: 'start' | 'step' }> = [{ value: start, hidden: Boolean(hide?.includes(0)), kind: 'start' }];
  results.forEach((value, i) => cells.push({ value, hidden: Boolean(hide?.includes(i + 1)), kind: 'step' }));
  return (
    <figure className="chn" aria-label={`ნაბიჯების ჯაჭვი: ${cells.map((cell) => cell.hidden ? 'უცნობი' : cell.value).join(' → ')}`}>
      <ol className="chn-row">
        {cells.map((cell, i) => (
          <li key={i} className="chn-item">
            {cell.kind === 'step' && <span className="chn-step">{stepText(steps[i - 1])}</span>}
            <span className={`chn-cell ${cell.hidden ? 'is-hidden' : ''} ${cell.kind === 'start' ? 'is-start' : ''}`}>
              {cell.hidden ? '□' : cell.value}
            </span>
          </li>
        ))}
      </ol>
      {caption && <figcaption className="chn-cap">{caption}</figcaption>}
    </figure>
  );
}

/** The symbol legend for a puzzle, so a symbol is never only a shape. */
export function SymbolLegend({ sentence, values }: { sentence: PuzzleSentence; values?: Record<string, number> }) {
  const syms = symbolsOf(sentence);
  return (
    <ul className="pz-legend" aria-label="უცნობები">
      {syms.map((sym) => (
        <li key={sym}>
          <span className="pz-box">{sym}</span>
          <span>=</span>
          <span className="pz-num">{values?.[sym] ?? '?'}</span>
        </li>
      ))}
    </ul>
  );
}

/** A sentence said in words, for feedback and for the check line. */
export const sentenceWords = (sentence: PuzzleSentence, values?: Record<string, number>): string =>
  values ? filledText(sentence, values) : sentenceText(sentence);
