import { useState } from 'react';
import type { ExploreTool, ExplainBlock, PuzzleSentence, PuzzleStep } from '../types';
import { holds, runSteps, sentenceText, solve, stepText, withBlank } from './PuzzleGeometry';
import { ChainBoard, FamilyTriBoard, SentenceBoard } from './PuzzleBoard';
import { SentenceFillAnswer } from './PuzzleAnswers';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Exploration tools and demonstrations for G2 U11.
 *
 * Nothing here is graded. Every tool shows the arithmetic it is doing — the sentence, the numbers that went into it and
 * whether it holds — so the student can see *why* a number is the missing one instead of being told it.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────────────────── L1: the balance sentence ───────────────────────────

/** Put a number into a blank and watch the sentence hold or fall apart. */
export function SentenceBoxLab({ tool }: { tool: ToolOf<'sentence-box-lab'> }) {
  const [which, setWhich] = useState(0);
  const [value, setValue] = useState('');
  const setup = tool.examples[which] ?? tool.examples[0];
  const sentence: PuzzleSentence = withBlank(setup.a, setup.op, setup.b, setup.c, setup.place, '□');
  const n = Number(value);
  const answered = value !== '' && Number.isFinite(n);
  const filled = answered
    ? { a: setup.place === 'a' ? n : setup.a, b: setup.place === 'b' ? n : setup.b, c: setup.place === 'c' ? n : setup.c }
    : null;
  const ok = filled ? holds(filled.a, setup.op, filled.b, filled.c) : false;
  return (
    <div className="lab lab-sentencebox">
      <div className="xt-modes" role="group" aria-label="მაგალითი">
        {tool.examples.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`xt-mode ${i === which ? 'is-on' : ''}`}
            aria-pressed={i === which}
            onClick={() => {
              setWhich(i);
              setValue('');
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <SentenceFillAnswer sentence={sentence} blanks={[setup.place]} value={value} onChange={setValue} disabled={false} label="შეავსე უჯრა" />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!filled
          ? `წინადადება: ${sentenceText(sentence)}. ჩაწერე რიცხვი და ნახე, სრულდება თუ არა.`
          : ok
            ? `სწორია: ${filled.a} ${setup.op} ${filled.b} = ${filled.c} — წინადადება სრულდება.`
            : `ჯერ არა: ${filled.a} ${setup.op} ${filled.b} = ${setup.op === '+' ? filled.a + filled.b : filled.a - filled.b}, არა ${filled.c}.`}
      </p>
      <p className="lab-facts">
        <span>უცნობის ადგილი: {setup.place === 'a' ? 'დასაწყისში' : setup.place === 'b' ? 'შუაში' : 'ბოლოში'}</span>
        <span>მოქმედება: {setup.op === '+' ? 'შეკრება' : 'გამოკლება'}</span>
      </p>
      <p className="lab-hint">{`დასაწყისის საპოვნელად: ${setup.op === '+' ? `${setup.c} − ${setup.b}` : `${setup.c} + ${setup.b}`}.`}</p>
    </div>
  );
}

// ─────────────────────────── L2: taking from a collection ───────────────────────────

/** Take objects out of a collection until the sentence is true, and read the missing number off the tray. */
export function TakeawayLab({ tool }: { tool: ToolOf<'takeaway-lab'> }) {
  const [which, setWhich] = useState(0);
  const [taken, setTaken] = useState(0);
  const setup = tool.examples[which] ?? tool.examples[0];
  const left = setup.total - taken;
  const target = setup.total - setup.remove;
  return (
    <div className="lab lab-takeaway">
      <div className="xt-modes" role="group" aria-label="მაგალითი">
        {tool.examples.map((_, i) => (
          <button key={i} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setTaken(0); }}>
            {i + 1}
          </button>
        ))}
      </div>
      <ul className="tk-row" aria-label={`${setup.total} საგანი, ${taken} გამოტანილი`}>
        {Array.from({ length: setup.total }, (_, i) => (
          <li key={i} className={`tk-item ${i < taken ? 'is-out' : ''}`} aria-hidden="true">
            ●
          </li>
        ))}
      </ul>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setTaken((n) => Math.min(setup.total, n + 1))} aria-label="გამოიტანე ერთი">
          −1
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setTaken((n) => Math.max(0, n - 1))} aria-label="დააბრუნე ერთი">
          +1
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setTaken(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${setup.total} − ${taken} = ${left}. `}
        {left === target ? 'ეს არის მოცემული სხვაობა — გამოკლებული სწორია.' : 'სხვაობა ჯერ არ ემთხვევა.'}
      </p>
      <p className="lab-facts">
        <span>სულ: {setup.total}</span>
        <span>გამოტანილი: {taken}</span>
        <span>დარჩა: {left}</span>
        <span>მიზანი: {target}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── L3: the fact-family triangle ───────────────────────────

/** One triangle, its three numbers, and all four sentences they make. Cover a number and read the rest. */
export function FactFamilyLab({ tool }: { tool: ToolOf<'fact-family-lab'> }) {
  const [which, setWhich] = useState(0);
  const [hidden, setHidden] = useState<'whole' | 'a' | 'b' | null>(null);
  const family = tool.families[which] ?? tool.families[0];
  const whole = family.a + family.b;
  const covered = hidden;
  return (
    <div className="lab lab-family">
      <div className="xt-modes" role="group" aria-label="რიცხვების ოჯახი">
        {tool.families.map((f, i) => (
          <button key={i} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setHidden(null); }}>
            {f.a} + {f.b}
          </button>
        ))}
      </div>
      <FamilyTriBoard whole={whole} parts={[family.a, family.b]} hide={covered ?? undefined} />
      <div className="xt-row">
        <button type="button" className={`btn ${covered === 'whole' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={covered === 'whole'} onClick={() => setHidden(covered === 'whole' ? null : 'whole')}>
          დაფარე მთელი
        </button>
        <button type="button" className={`btn ${covered === 'a' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={covered === 'a'} onClick={() => setHidden(covered === 'a' ? null : 'a')}>
          დაფარე {family.a}
        </button>
        <button type="button" className={`btn ${covered === 'b' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={covered === 'b'} onClick={() => setHidden(covered === 'b' ? null : 'b')}>
          დაფარე {family.b}
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {covered === null
          ? `ოჯახი: ${family.a}, ${family.b}, ${whole}. ოთხივე წინადადება ამ სამი რიცხვით იწერება.`
          : covered === 'whole'
            ? `მთელი დაფარულია: ${family.a} + ${family.b} = ${whole}.`
            : covered === 'a'
              ? `დაფარულია ${family.a}: ${whole} − ${family.b} = ${family.a}.`
              : `დაფარულია ${family.b}: ${whole} − ${family.a} = ${family.b}.`}
      </p>
      <p className="lab-facts">
        <span>მთელი: {whole}</span>
        <span>ნაწილები: {family.a}, {family.b}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── L4: symbol cards ───────────────────────────

/** The same symbol stands for the same number. Put numbers on the symbols and watch every sentence be checked. */
export function SymbolLab({ tool }: { tool: ToolOf<'symbol-lab'> }) {
  const [which, setWhich] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const puzzle = tool.puzzles[which] ?? tool.puzzles[0];
  const numeric: Record<string, number> = {};
  for (const [sym, text] of Object.entries(values)) {
    const n = Number(text);
    if (text !== '' && Number.isFinite(n)) numeric[sym] = n;
  }
  const allFilled = puzzle.symbols.every((sym) => numeric[sym] !== undefined);
  const results = puzzle.sentences.map((sentence) => {
    const full = Object.keys(numeric).length > 0;
    if (!full) return null;
    try {
      const a = typeof sentence.a === 'number' ? sentence.a : numeric[sentence.a.sym];
      const b = typeof sentence.b === 'number' ? sentence.b : numeric[sentence.b.sym];
      const c = typeof sentence.c === 'number' ? sentence.c : numeric[sentence.c.sym];
      if ([a, b, c].some((v) => v === undefined)) return null;
      return holds(a, sentence.op, b, c);
    } catch {
      return null;
    }
  });
  const allTrue = allFilled && results.every((r) => r === true);
  return (
    <div className="lab lab-symbol">
      <div className="xt-modes" role="group" aria-label="თავსატეხი">
        {tool.puzzles.map((_, i) => (
          <button key={i} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setValues({}); }}>
            {i + 1}
          </button>
        ))}
      </div>
      <ul className="pzs-list">
        {puzzle.sentences.map((sentence, i) => (
          <li key={i}>
            <SentenceBoard sentence={sentence} label={sentenceText(sentence)} />
            {results[i] !== null && <span className={`pzs-mark ${results[i] ? 'is-ok' : 'is-no'}`}>{results[i] ? '✓' : '✗'}</span>}
          </li>
        ))}
      </ul>
      <ul className="pzs-cards">
        {puzzle.symbols.map((sym) => (
          <li key={sym}>
            <label className="pzs-slot">
              <span className="pz-box">{sym}</span>
              <span>=</span>
              <input
                inputMode="numeric"
                value={values[sym] ?? ''}
                onChange={(e) => setValues((all) => ({ ...all, [sym]: e.target.value.replace(/[^\d-]/g, '') }))}
                aria-label={`${sym} რიცხვი`}
              />
            </label>
          </li>
        ))}
      </ul>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {allTrue
          ? `ყველა წინადადება სრულდება: ${puzzle.sentences.map((s) => sentenceText(s)).join('; ')}.`
          : allFilled
            ? 'ერთი წინადადება მაინც არ სრულდება — შეცვალე რიცხვი.'
            : 'შეავსე ყველა სიმბოლო. ერთი სიმბოლო ყველგან ერთი და იმავე რიცხვია.'}
      </p>
      <p className="lab-facts">
        <span>სიმბოლოები: {puzzle.symbols.join(', ')}</span>
        <span>უცნობი: {puzzle.symbols.filter((s) => numeric[s] === undefined).length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── L5: unlock the chain ───────────────────────────

/** Each stage of a chain opens only when the previous one is answered — a multi-step puzzle worked one step at a time. */
export function ChainLab({ tool }: { tool: ToolOf<'chain-lab'> }) {
  const [which, setWhich] = useState(0);
  const [stage, setStage] = useState(0);
  const [value, setValue] = useState('');
  const puzzle = tool.puzzles[which] ?? tool.puzzles[0];
  const results = runSteps(puzzle.start, puzzle.steps);
  const finished = stage >= puzzle.stages.length;
  const wanted = puzzle.stages[Math.min(stage, puzzle.stages.length - 1)];
  const target = results[wanted - 1];
  const typed = Number(value);
  const opened = value !== '' && typed === target;
  return (
    <div className="lab lab-chain">
      <div className="xt-modes" role="group" aria-label="თავსატეხი">
        {tool.puzzles.map((_, i) => (
          <button key={i} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setStage(0); setValue(''); }}>
            {i + 1}
          </button>
        ))}
      </div>
      <ChainBoard start={puzzle.start} steps={puzzle.steps} hide={puzzle.stages.filter((_, i) => i >= stage)} />
      <ol className="chn-stages" aria-label="საფეხურები">
        {puzzle.stages.map((at, i) => (
          <li key={at} className={`chn-stage ${i < stage ? 'is-done' : i === stage ? 'is-now' : 'is-locked'}`}>
            <span className="chn-stage-num">{i + 1}</span>
            <span className="chn-stage-text">{i < stage ? `${at}-ე ნაბიჯი: ${results[at - 1]}` : i === stage ? `${at}-ე ნაბიჯი: ?` : 'ჩაკეტილი'}</span>
          </li>
        ))}
      </ol>
      <div className="pzch-row">
        <label className="pzch-slot">
          <span className="pzch-where">{`${wanted}-ე ნაბიჯის შემდეგ`}</span>
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
            aria-label={`${wanted}-ე ნაბიჯის შემდეგ`}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={finished || !opened}
          onClick={() => {
            setStage((s) => Math.min(puzzle.stages.length, s + 1));
            setValue('');
          }}
        >
          {stage + 1 < puzzle.stages.length ? 'შემდეგი საფეხური' : 'დაასრულე'}
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {stage >= puzzle.stages.length
          ? `ყველა საფეხური გაიხსნა: ${puzzle.start} ${puzzle.steps.map(stepText).join(' ')} = ${results[results.length - 1]}.`
          : opened
            ? `სწორია: ${wanted}-ე ნაბიჯის შემდეგ ${target}. გააგრძელე.`
            : `მიმდინარე ნაბიჯი: ${stepText(puzzle.steps[wanted - 1] ?? { op: '+', n: 0 })} — რა გამოვა?`}
      </p>
      <p className="lab-facts">
        <span>საფეხურები: {puzzle.stages.length}</span>
        <span>გახსნილი: {Math.min(stage, puzzle.stages.length)}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** A sentence with its blank, the same sentence as a scale, the missing number, and the completed sentence. */
export function SentenceDemo({ block }: { block: Extract<ExplainBlock, { type: 'sentence-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const shown = Math.min(frame, block.steps.length - 1);
  const sentence = withBlank(block.a, block.op, block.b, block.c, block.place, '□');
  const values = solve(sentence).values;
  return (
    <figure className="demo demo-sentence">
      <span className="demo-badge">უცნობი</span>
      <SentenceBoard sentence={sentence} solved={shown >= 2} values={shown >= 2 ? values : undefined} />
      {shown === 1 && (
        <p className="demo-cap">{`სასწორივით: ერთ მხარეს ${block.place === 'c' ? `${block.a} ${block.op} ${block.b}` : block.op === '+' ? block.c : block.c}, მეორე მხარეს მთელი.`}</p>
      )}
      {shown >= 3 && <p className="demo-cap">{`შემოწმება: ${block.a} ${block.op} ${block.b} = ${block.c}`}</p>}
      <p className="demo-cap">{block.steps[shown]}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A number line walked back or forward to find what is missing, one step at a time. */
export function InverseDemo({ block }: { block: Extract<ExplainBlock, { type: 'inverse-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const shown = Math.min(frame, block.steps.length - 1);
  const sentence: PuzzleSentence = withBlank(block.a, block.op, block.b, block.c, block.place, '□');
  const values = solve(sentence).values;
  return (
    <figure className="demo demo-inverse">
      <span className="demo-badge">საპირისპირო მოქმედება</span>
      <SentenceBoard sentence={sentence} solved={shown >= 1} values={shown >= 1 ? values : undefined} />
      <p className="demo-rule">
        {block.op === '+' ? `შეკრებას ამოწმებს გამოკლება: ${block.c} − ${block.a} = ${block.b}` : `გამოკლებას ამოწმებს შეკრება: ${block.c} + ${block.b} = ${block.a}`}
      </p>
      <p className="demo-cap">{block.steps[shown]}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A chain built one step at a time, with the running value beside each step. */
export function ChainDemo({ block }: { block: Extract<ExplainBlock, { type: 'chain-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length + 1);
  const shown = Math.min(frame, block.steps.length);
  const results = runSteps(block.start, block.steps);
  const visible = Math.max(1, Math.min(block.steps.length, shown));
  return (
    <figure className="demo demo-chain">
      <span className="demo-badge">ნაბიჯები</span>
      <ChainBoard start={block.start} steps={block.steps.slice(0, visible)} />
      <p className="demo-rule">{`${block.start} ${block.steps.slice(0, visible).map((s, i) => `${stepText(s)} → ${results[i]}`).join(' ')}`}</p>
      <p className="demo-cap">{block.steps.length === 0 ? 'ჯერ არც ერთი ნაბიჯი არ არის.' : `ნაბიჯი ${visible} / ${block.steps.length}`}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The puzzle's own cells, for a board that wants a plain list. */
export const stepsOf = (steps: PuzzleStep[]): PuzzleStep[] => steps;
