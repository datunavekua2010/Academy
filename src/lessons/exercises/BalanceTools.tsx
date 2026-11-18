import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { differenceOf, heavierSide, isBalanced, panTotal, puzzleAnswer, sentenceHolds, type ScaleSpec, type SentenceSpec } from './BalanceGeometry';
import { BalanceScale, GroupsBoard, SentenceBoard, SentenceLine, WeightTiles } from './BalanceBoard';

/**
 * Explore tools and explain demos for Unit 9. Everything here reports real totals: the beam, the words and the
 * difference are all computed from the weights the student placed.
 */

type BalanceLabTool = Extract<ExploreTool, { tool: 'balance-lab' }>;
type EqualGroupsLabTool = Extract<ExploreTool, { tool: 'equal-groups-lab' }>;
type SentenceLabTool = Extract<ExploreTool, { tool: 'sentence-lab' }>;
type PuzzleLabTool = Extract<ExploreTool, { tool: 'puzzle-lab' }>;

/** Put weights on two pans and watch the beam, the totals and the difference. */
export function BalanceLab({ tool }: { tool: BalanceLabTool }) {
  const [left, setLeft] = useState<number[]>(tool.start?.left ?? []);
  const [right, setRight] = useState<number[]>(tool.start?.right ?? []);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const pool = [...tool.weights];
  for (const w of [...left, ...right]) {
    const at = pool.indexOf(w);
    if (at >= 0) pool.splice(at, 1);
  }
  const scale: ScaleSpec = { left: { weights: left }, right: { weights: right }, unit: tool.unit };
  const balanced = isBalanced(scale) && left.length > 0 && right.length > 0;
  const heavy = heavierSide(scale);
  return (
    <div className="lab lab-balance">
      <div className="lab-head" role="radiogroup" aria-label="რომელ თაროზე">
        {(['left', 'right'] as const).map((s) => (
          <label key={s} className={`twopan-side ${side === s ? 'is-on' : ''}`}>
            <input type="radio" name="balance-lab-side" value={s} checked={side === s} onChange={() => setSide(s)} />
            {s === 'left' ? 'მარცხენა თარო' : 'მარჯვენა თარო'}
          </label>
        ))}
      </div>
      <BalanceScale scale={scale} label="სასწორი" size={290} />
      <div className="lab-head">
        {pool.length === 0 ? <span className="twopan-empty">ყველა წონა გამოყენებულია</span> : pool.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            className="wt-tile is-button"
            aria-label={`დადე ${w} ${side === 'left' ? 'მარცხენა' : 'მარჯვენა'} თაროზე`}
            onClick={() => (side === 'left' ? setLeft([...left, w]) : setRight([...right, w]))}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="lab-head">
        <button type="button" className="btn btn-ghost btn-small" disabled={left.length === 0 && right.length === 0} onClick={() => (setLeft([]), setRight([]))}>
          ↻ გასუფთავება
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {left.length + right.length === 0
          ? 'დააწყვე წონები და ნახე, როდის გახდება სასწორი თანაბარი.'
          : balanced
            ? `✓ თანაბარია: ${panTotal({ weights: left })} = ${panTotal({ weights: right })}. ორივე მხარეს ერთი და იგივე რაოდენობაა.`
            : heavy
              ? `ჯერ არ არის: ${heavy === 'left' ? 'მარცხენა' : 'მარჯვენა'} მხარე ${differenceOf(scale)}-ით მძიმეა (${panTotal({ weights: left })} და ${panTotal({ weights: right })}).`
              : 'ჯერ არ არის.'}
      </p>
      <p className="lab-facts">
        <span>მარცხენა: {left.join(' + ') || '0'} = {panTotal({ weights: left })}</span>
        <span>მარჯვენა: {right.join(' + ') || '0'} = {panTotal({ weights: right })}</span>
      </p>
    </div>
  );
}

/** Add and remove objects in two groups, watching the comparison sign change. */
export function EqualGroupsLab({ tool }: { tool: EqualGroupsLabTool }) {
  const [a, setA] = useState(tool.start.a);
  const [b, setB] = useState(tool.start.b);
  const equal = a === b;
  return (
    <div className="lab lab-groups">
      <GroupsBoard a={a} b={b} label="ორი ჯგუფი" max={tool.max ?? 12} onChange={(na, nb) => (setA(na), setB(nb))} />
      <div className="lab-head">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => (setA(tool.start.a), setB(tool.start.b))}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {equal
          ? `✓ თანაბარია: ორივე ჯგუფში ${a} საგანია. ფერი და განლაგება არაფერს ცვლის.`
          : `ჯერ არ არის: ${Math.abs(a - b)}-ით განსხვავდება. სცადე ${b > a ? 'ა-ში დამატება' : 'ბ-ში დამატება'} ან ${a > b ? 'ა-დან წაღება' : 'ბ-დან წაღება'}.`}
      </p>
    </div>
  );
}

/** Build any sentence from cards and see immediately whether it holds. */
export function SentenceLab({ tool }: { tool: SentenceLabTool }) {
  const [values, setValues] = useState<string[]>(['', '', '']);
  const filled = values.every((v) => v);
  const a = values[0] === '' ? null : Number(values[0]);
  const op = values[1] === '+' || values[1] === '−' ? values[1] : null;
  const b = values[2] === '' ? null : Number(values[2]);
  const left = a === null || op === null || b === null ? null : op === '+' ? a + b : a - b;
  return (
    <div className="lab lab-sentence">
      <p className="lab-note">
        ააწყვე წინადადება: აირჩიე ბარათი, მერე ადგილი. ნახე, როდის არის ტოლობა მართალი.
      </p>
      <SentenceBoard places={3} values={values} onChange={setValues} cards={tool.cards} signs={tool.signs} label="რიცხვითი წინადადება" />
      <p className="lab-note" aria-live="polite">
        <strong>{values.join(' ') || '□ □ □'} = {tool.result}</strong>
      </p>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!filled
          ? 'ჯერ არ არის შევსებული.'
          : left === null
            ? 'ჯერ არ არის სრული ტოლობა.'
            : left === tool.result
              ? `✓ მართალია: ${values.join(' ')} = ${tool.result}. ორივე მხარე ერთი და იგივეა.`
              : `✗ არ არის მართალი: ${values.join(' ')} = ${left}. ორი მხარე სხვადასხვაა.`}
      </p>
    </div>
  );
}

/** Work through balance puzzles one at a time. */
export function PuzzleLab({ tool }: { tool: PuzzleLabTool }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [shown, setShown] = useState(false);
  const puzzle = tool.puzzles[Math.min(index, tool.puzzles.length - 1)];
  const given = puzzleAnswer(puzzle.clues.find((c) => puzzleAnswer(c) !== null) ?? puzzle.clues[0]);
  const parsed = Number(value.replace(',', '.'));
  const right = value.trim() !== '' && parsed === puzzle.answer;
  return (
    <div className="lab lab-puzzle">
      <div className="lab-head">
        {tool.puzzles.map((p, i) => (
          <button key={`${p.unknown}-${i}`} type="button" className={`btn btn-ghost btn-small ${i === index ? 'is-on' : ''}`} onClick={() => (setIndex(i), setValue(''), setShown(false))}>
            {i + 1}
          </button>
        ))}
      </div>
      <p className="lab-note">
        დააკვირდი სასწორებს. ერთ თაროზე მხოლოდ <strong>{puzzle.unknown}</strong> წონებია, მეორეზე — რიცხვი. აქედან იპოვე ერთი {puzzle.unknown}.
      </p>
      <div className="puz-clues">
        {puzzle.clues.map((clue, i) => {
          const answer = puzzleAnswer(clue);
          const scale: ScaleSpec =
            clue.onLeft === false
              ? { left: { weights: [clue.known] }, right: { weights: Array.from({ length: clue.unknownCount }, (_, k) => k + 1) } }
              : { left: { weights: Array.from({ length: clue.unknownCount }, (_, k) => k + 1) }, right: { weights: [clue.known] } };
          return (
            <div key={i} className="puz-clue">
              <p className="puz-clue-text">
                {clue.unknownCount} ცალი {puzzle.unknown} = {clue.known}
              </p>
              <BalanceScale scale={scale} size={170} label={`მინიშნება ${i + 1}`} showTotals={false} />
              {shown && answer !== null && <p className="puz-clue-note">ამ სასწორიდან: {clue.known} ÷ {clue.unknownCount} = {answer}.</p>}
            </div>
          );
        })}
      </div>
      <label className="puz-input">
        <span>{puzzle.unknown} =</span>
        <input
          type="text"
          inputMode="numeric"
          className="lp-input"
          aria-label={`${puzzle.unknown}-ის მნიშვნელობა`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <div className="lab-head">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setShown((v) => !v)}>
          {shown ? 'დამალე გაყოფა' : 'მაჩვენე გაყოფა'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => (setIndex((i) => (i + 1) % tool.puzzles.length), setValue(''), setShown(false))}>
          შემდეგი თავსატეხი →
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {value.trim() === ''
          ? 'ჩაწერე ერთი წონის მნიშვნელობა.'
          : right
            ? `✓ სწორია: ერთი ${puzzle.unknown} = ${puzzle.answer}.`
            : `ჯერ არ არის: ${clueTextLine(puzzle.unknown, given)}`}
      </p>
    </div>
  );
}

const clueTextLine = (unknown: string, value: number | null): string =>
  value === null ? `ნახე, რამდენი ${unknown} არის ერთ თაროზე და გაყავი.` : `სასწორზე ${unknown} წონები თანაბრად იყოფა — გაყავი რიცხვი ცალების რაოდენობაზე.`;

// ═══════════════════════════ explain demos ═══════════════════════════

/** The balance story: level, tilt, or solve a sentence. */
export function BalanceDemo({ block }: { block: Extract<ExplainBlock, { type: 'balance-demo' }> }) {
  const [step, setStep] = useState(0);
  const shown = Math.min(step, block.steps.length - 1);
  const extra = block.mode === 'tilt' && shown >= 2 ? (block.add ?? 0) : 0;
  const left = block.left;
  const right = block.mode === 'tilt' && shown >= 2 ? [...block.right, ...(extra ? [extra] : [])] : block.right;
  const scale: ScaleSpec = { left: { weights: left }, right: { weights: right } };
  return (
    <div className="bal-demo">
      {block.mode === 'solve' && block.sentence && (
        <div className="bal-sent">
          <SentenceLine sentence={{ left: block.sentence.left, right: block.sentence.right }} blank={shown >= 1 ? block.sentence.blank : undefined} />
        </div>
      )}
      <BalanceScale scale={scale} size={260} label="სასწორი" showTotals={shown >= 1} />
      <ol className="ms-steps">
        {block.steps.map((text, i) => (
          <li key={text} className={i === shown ? 'is-on' : i < shown ? 'is-past' : ''}>
            {i === shown && <span aria-hidden="true">▸ </span>}
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={shown === 0}>
          ← უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={() => setStep((s) => Math.min(s + 1, block.steps.length - 1))} disabled={shown >= block.steps.length - 1}>
          შემდეგ →
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep(0)} disabled={shown === 0}>
          ↻ თავიდან
        </button>
      </div>
      {block.caption && <p className="ms-caption">{block.caption}</p>}
    </div>
  );
}

// ═══════════════════════════ the router ═══════════════════════════

export function ExploreToolViewBalance({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'balance-lab':
      return <BalanceLab tool={tool} />;
    case 'equal-groups-lab':
      return <EqualGroupsLab tool={tool} />;
    case 'sentence-lab':
      return <SentenceLab tool={tool} />;
    case 'puzzle-lab':
      return <PuzzleLab tool={tool} />;
    default:
      return null;
  }
}

// ═══════════════════════════ small helpers ═══════════════════════════

/** A sentence in words, for a prompt. */
export const sentenceWords = (sentence: SentenceSpec): string => `${sentence.left.a}${sentence.left.op ? ` ${sentence.left.op} ${sentence.left.b}` : ''} = ${sentence.right}`;

/** Whether a sentence holds, exposed for lessons and tests. */
export const holds = (sentence: SentenceSpec): boolean => sentenceHolds(sentence);

/** The weight of a pan, for a caption. */
export const panWords = (weights: number[], unit?: string): string => `${weights.join(' + ') || '0'}${unit ? ` ${unit}` : ''}`;

/** Re-exported so a lesson can show weights without importing the board twice. */
export { WeightTiles };
