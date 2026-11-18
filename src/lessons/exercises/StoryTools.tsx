import { useId, useState, type KeyboardEvent } from 'react';
import type { ExplainBlock, ExploreTool, Glyph, ResponseSpec, VisualSpec } from '../types';
import { NumberLine } from './NumberLine';
import { GLYPH_NAME, GlyphIcon, ObjectField } from './Objects';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Story problems (Grade 1 · Unit 4): the picture, the workspace where a story is acted out, the seven-step
 * demonstration and the answer control (+ or −, then a number). The story's numbers come from one data
 * object, so the picture, the sign and the equation always describe the same situation.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;
type Mode = 'join' | 'separate';

export const signOf = (mode: Mode): '+' | '−' => (mode === 'join' ? '+' : '−');
export const resultOf = (mode: Mode, first: number, change: number): number => (mode === 'join' ? first + change : first - change);

// ───────────────────────── picture ─────────────────────────

/** The objects of a story. Objects drawn with a dashed outline are the ones that arrive (join) or leave (separate). */
export function StoryPicture({ glyph, first, change, mode, showChange = true }: { glyph: Glyph; first: number; change: number; mode: Mode; showChange?: boolean }) {
  const count = mode === 'join' ? first + (showChange ? change : 0) : first;
  const marked = showChange ? Array.from({ length: change }, (_, i) => (mode === 'join' ? first + i : first - 1 - i)) : [];
  return (
    <figure className={`storyscene is-${mode}`}>
      <ObjectField count={count} glyph={glyph} layout="rows" extras={new Set(marked)} label={`${GLYPH_NAME[glyph]}: ${first}${showChange ? (mode === 'join' ? `, მოვიდა ${change}` : `, წავიდა ${change}`) : ''}`} />
      {showChange && <figcaption>{mode === 'join' ? 'წყვეტილი ჩარჩო: ახლად მოსული საგნები' : 'წყვეტილი ჩარჩო და გადახაზვა: წასული საგნები'}</figcaption>}
    </figure>
  );
}

export function StoryVisual({ spec }: { spec: Extract<VisualSpec, { type: 'story' }> }) {
  return <StoryPicture glyph={spec.glyph} first={spec.first} change={spec.change} mode={spec.mode} />;
}

// ───────────────────────── explore ─────────────────────────

type Story = ToolOf<'story-workspace'>['stories'][number];
export interface StoryJudgement {
  tone: 'ok' | 'no' | 'info';
  text: string;
}

/** Compares the student's picture (`n` objects) and sign with the story. Never gives the number away before the picture is right. */
export function judgeStory(story: Story, n: number, op: '+' | '−' | null): StoryJudgement {
  const join = story.mode === 'join';
  const moved = n - story.first;
  if (moved === 0) return { tone: 'info', text: 'ჯერ შეცვალე სურათი ისე, როგორც ისტორიაშია.' };
  if ((join && moved < 0) || (!join && moved > 0)) {
    return { tone: 'no', text: join ? 'ისტორიაში საგნები ემატება, შენს სურათში კი პირიქით მოხდა. წაიკითხე ისტორია ისევ.' : 'ისტორიაში საგნები მიდის, შენს სურათში კი პირიქით მოხდა. წაიკითხე ისტორია ისევ.' };
  }
  if (Math.abs(moved) !== story.change) return { tone: 'no', text: `ისტორიაში ${story.change}-ით იცვლება, შენს სურათში კი ${Math.abs(moved)}-ით შეიცვალა. წაიკითხე რიცხვები ისევ.` };
  if (op === null) return { tone: 'info', text: 'სურათი ისტორიას ემთხვევა. ახლა აირჩიე, რომელი ნიშანი ამას აჩვენებს: + ან −.' };
  if (op !== signOf(story.mode)) return { tone: 'no', text: join ? 'ჯგუფი იზრდება, საგნები ემატება. რომელი ნიშანი აჩვენებს, რომ რაღაც ემატება?' : 'ჯგუფი მცირდება, საგნები მიდის. რომელი ნიშანი აჩვენებს, რომ რაღაც მცირდება?' };
  return { tone: 'ok', text: `ისტორიას ემთხვევა: ${story.first} ${op} ${story.change} = ${n}. სურათიც, ნიშანიც და ტოლობაც ერთსა და იმავეს ამბობს.` };
}

const LIMIT = 20;

export function StoryWorkspace({ spec }: { spec: ToolOf<'story-workspace'> }) {
  const [si, setSi] = useState(0);
  const story = spec.stories[si];
  const [n, setN] = useState(story.first);
  const [op, setOp] = useState<'+' | '−' | null>(null);
  const [verdict, setVerdict] = useState<StoryJudgement | null>(null);

  const change = (d: number) => {
    setN((x) => Math.min(LIMIT, Math.max(0, x + d)));
    setVerdict(null);
  };
  const reset = () => {
    setN(story.first);
    setOp(null);
    setVerdict(null);
  };
  const pickStory = (i: number) => {
    setSi(i);
    setN(spec.stories[i].first);
    setOp(null);
    setVerdict(null);
  };
  const pickOp = (o: '+' | '−') => {
    setOp(o);
    setVerdict(null);
  };

  return (
    <div className="xt sw">
      {spec.stories.length > 1 && (
        <div className="xt-modes" role="group" aria-label="ისტორიის არჩევა">
          {spec.stories.map((_, i) => (
            <button key={i} type="button" className={`xt-mode ${i === si ? 'is-on' : ''}`} aria-pressed={i === si} onClick={() => pickStory(i)}>
              ისტორია {i + 1}
            </button>
          ))}
        </div>
      )}
      <p className="story">{story.text}</p>
      <div className="sw-scene" role="img" aria-label={`სურათზე ${n} ${GLYPH_NAME[story.glyph]}`}>
        {n === 0 && <span className="sw-empty">ცარიელია</span>}
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`sw-item ${i >= story.first ? 'is-new' : ''}`} aria-hidden="true">
            <GlyphIcon glyph={story.glyph} />
          </span>
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" onClick={() => change(1)} disabled={n >= LIMIT} aria-label="ერთი საგნის დამატება სურათზე">
          + საგნის დამატება
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => change(-1)} disabled={n <= 0} aria-label="ერთი საგნის ამოღება სურათიდან">
          − საგნის ამოღება
        </button>
      </div>
      <div className="xt-modes" role="group" aria-label="მოქმედების არჩევა">
        <button type="button" className={`xt-mode sw-op ${op === '+' ? 'is-on' : ''}`} aria-pressed={op === '+'} onClick={() => pickOp('+')}>
          + შეკრება
        </button>
        <button type="button" className={`xt-mode sw-op ${op === '−' ? 'is-on' : ''}`} aria-pressed={op === '−'} onClick={() => pickOp('−')}>
          − გამოკლება
        </button>
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={() => setVerdict(judgeStory(story, n, op))}>
          შევადაროთ ისტორიას
        </button>
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ↻ თავიდან
        </button>
      </div>
      <p className={`xt-note ${verdict ? `is-${verdict.tone}` : ''}`} role="status" aria-live="polite">
        {verdict ? `${verdict.tone === 'ok' ? '✓ ' : verdict.tone === 'no' ? '✗ ' : 'ℹ '}${verdict.text}` : 'წაიკითხე ისტორია, სურათზე ისე შეცვალე საგნები, როგორც ისტორიაშია, და აირჩიე + ან −. სანამ შეამოწმებ, ყველაფრის შეცვლა შეგიძლია.'}
      </p>
    </div>
  );
}

// ───────────────────────── demonstration ─────────────────────────

export function StoryDemo({ block }: { block: Block<'story-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length, 1700);
  const result = resultOf(block.mode, block.first, block.change);
  const sign = signOf(block.mode);
  return (
    <figure className="demo sd">
      <p className="story">{block.text}</p>
      <StoryPicture glyph={block.glyph} first={block.first} change={block.change} mode={block.mode} showChange={frame >= 3} />
      <div className="sd-chips" aria-hidden="true">
        {frame >= 1 && (
          <span className="sd-chip">
            <small>ვიცით</small>
            <b>{block.first}</b>
          </span>
        )}
        {frame >= 1 && (
          <span className="sd-chip">
            <small>ვიცით</small>
            <b>{block.mode === 'join' ? `+${block.change}` : `−${block.change}`}</b>
          </span>
        )}
        {frame >= 2 && (
          <span className="sd-chip is-find">
            <small>ვეძებთ</small>
            <b>?</b>
          </span>
        )}
        {frame >= 4 && (
          <span className="sd-chip is-op">
            <small>{block.mode === 'join' ? 'ერთად' : 'მცირდება'}</small>
            <b>{sign}</b>
          </span>
        )}
      </div>
      {frame >= 5 && (
        <p className="sd-eq" role="status">
          {block.first} {sign} {block.change} = <strong>{result}</strong>
          {frame >= 6 && <span className="sd-ok"> ✓ ისტორიას ემთხვევა</span>}
        </p>
      )}
      <ol className="jd-steps">
        {block.steps.map((text, i) => (
          <li key={i} className={`${i === frame ? 'is-active' : ''} ${i < frame ? 'is-done' : ''}`} aria-current={i === frame ? 'step' : undefined}>
            {text}
          </li>
        ))}
      </ol>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

// ───────────────────────── answer control ─────────────────────────

interface AnswerProps {
  response?: Extract<ResponseSpec, { type: 'story' }>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  label: string;
}

const splitStory = (value: string): { op: '+' | '-' | ''; num: string } => ({
  op: value.startsWith('+') ? '+' : value.startsWith('-') ? '-' : '',
  num: value.includes(',') ? value.slice(value.indexOf(',') + 1) : '',
});

/** A scratch model the student may use to think (counters or a number line). It is never graded and never shows the answer. */
function Scratch() {
  const [tab, setTab] = useState<'counters' | 'line'>('counters');
  const [count, setCount] = useState(0);
  const [mark, setMark] = useState(0);
  return (
    <details className="sa-model">
      <summary>ჩემი მოდელი (არ ფასდება)</summary>
      <div className="xt-modes" role="group" aria-label="მოდელის არჩევა">
        <button type="button" className={`xt-mode ${tab === 'counters' ? 'is-on' : ''}`} aria-pressed={tab === 'counters'} onClick={() => setTab('counters')}>
          კუბიკები
        </button>
        <button type="button" className={`xt-mode ${tab === 'line' ? 'is-on' : ''}`} aria-pressed={tab === 'line'} onClick={() => setTab('line')}>
          რიცხვითი ღერძი
        </button>
      </div>
      {tab === 'counters' ? (
        <div className="sa-counters">
          <div className="sw-scene" role="img" aria-label={`ჩემს მოდელში ${count} კუბიკია`}>
            {count === 0 && <span className="sw-empty">ცარიელია</span>}
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className="sw-item" aria-hidden="true">
                <span className="cb-disc is-a" />
              </span>
            ))}
          </div>
          <div className="xt-row">
            <button type="button" className="btn btn-primary" onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label="ერთი კუბიკის დამატება მოდელზე">
              + კუბიკი
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="ერთი კუბიკის ამოღება მოდელიდან">
              − კუბიკი
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCount(0)}>
              ↻ გასუფთავება
            </button>
          </div>
        </div>
      ) : (
        <NumberLine min={0} max={20} value={mark} onChange={setMark} arrows showValue ariaLabel="ჩემი რიცხვითი ღერძი" />
      )}
    </details>
  );
}

export function StoryAnswer({ value, onChange, onSubmit, disabled, label }: AnswerProps) {
  const { op, num } = splitStory(value);
  const id = useId();
  const set = (nextOp: string, nextNum: string) => onChange(nextOp || nextNum ? `${nextOp},${nextNum}` : '');
  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
  return (
    <div className="sa" aria-label={label}>
      <div className="sa-ops" role="radiogroup" aria-label="რომელი მოქმედება ესადაგება ისტორიას?">
        <button type="button" role="radio" aria-checked={op === '+'} className={`xt-mode sw-op ${op === '+' ? 'is-on' : ''}`} disabled={disabled} onClick={() => set('+', num)}>
          + შეკრება
        </button>
        <button type="button" role="radio" aria-checked={op === '-'} className={`xt-mode sw-op ${op === '-' ? 'is-on' : ''}`} disabled={disabled} onClick={() => set('-', num)}>
          − გამოკლება
        </button>
      </div>
      <label className="sa-answer" htmlFor={id}>
        პასუხი:
        <input id={id} className="lp-input" type="text" inputMode="numeric" autoComplete="off" spellCheck={false} placeholder="ჩაწერე რიცხვი" value={num} disabled={disabled} onChange={(e) => set(op, e.target.value)} onKeyDown={onEnter} />
      </label>
      <Scratch />
    </div>
  );
}
