import { useEffect, useState } from 'react';
import { numberName } from '../numberNames';
import type { ExplainBlock, VisualSpec } from '../types';
import { BondPicture, PartsPicture } from './BondVisuals';
import { CompareGroups, compareSign, compareWords } from './Compare';
import { NumberLine } from './NumberLine';
import { ObjectField, TenFrame } from './Objects';
import { JumpLinePicture } from './JumpTools';
import { StoryVisual } from './StoryTools';
import { CompareStage, ShapeBoard, ShapePicture, describeShape } from './ShapeBoard';
import { divisionOf } from './ShapeGeometry';
import { ObjectRow } from './LengthBoard';
import { ClockFace } from './ClockBoard';
import { Shape2DRow } from './Shape2DBoard';
import { BalanceScale, GroupsBoard, SentenceLine } from './BalanceBoard';
import { PictureChart, SortChip, VennBoard } from './SortBoard';
import { valueLabel } from './SortBoard';
import { ExpandedLine, PlaceBlocks, PlaceCards } from './PlaceValueBoard';
import { GroupCount, SkipLine } from './PatternBoard';

/**
 * Small, reusable pictures for the lessons: a number sequence with a hidden
 * number, groups of ten and ones, and the two animated demonstrations used on
 * the "understand" screens (a walking highlight and a hopping marker). Every
 * animation has Replay and Step buttons, and every picture has a text label.
 */

// ─────────────────────────── stepping ───────────────────────────

/** Plays through `length` frames on a timer; the student can also replay or step by hand. */
export function useStepper(length: number, intervalMs = 850) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return undefined;
    if (frame >= length - 1) {
      setPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => setFrame((f) => f + 1), intervalMs);
    return () => window.clearTimeout(id);
  }, [playing, frame, length, intervalMs]);
  return {
    frame,
    done: frame >= length - 1,
    replay: () => {
      setFrame(0);
      setPlaying(true);
    },
    step: () => {
      setPlaying(false);
      setFrame((f) => Math.min(f + 1, length - 1));
    },
  };
}

// ─────────────────────────── sequence ───────────────────────────

export function SequenceRow({ items, arrows, activeIndex, reveal, onHole }: { items: Array<number | null>; arrows?: string; activeIndex?: number; reveal?: number; onHole?: () => void }) {
  const spoken = items.map((n) => (n === null ? 'გამოტოვებული რიცხვი' : String(n))).join(', ');
  return (
    <ol className="seq" role={onHole ? 'group' : 'img'} aria-label={`მიმდევრობა: ${spoken}`}>
      {items.map((n, i) => (
        <li key={i} className="seq-cell" aria-hidden={onHole ? undefined : true}>
          {i > 0 && (
            <span className={`seq-arrow ${arrows ? 'has-label' : ''}`} aria-hidden="true">
              {arrows ? <small>{arrows}</small> : null}
              <b>→</b>
            </span>
          )}
          {n === null && onHole ? (
            <button type="button" className="seq-tile is-hole is-button" onClick={onHole} aria-label="ცარიელი ადგილი: შეეხე და ნახე რიცხვი">
              ?
            </button>
          ) : (
            <span className={`seq-tile ${n === null ? 'is-hole' : ''} ${i === activeIndex ? 'is-active' : ''} ${reveal !== undefined && i === reveal ? 'is-new' : ''}`}>{n === null ? '?' : n}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

// ─────────────────────────── quantity ───────────────────────────

/** A number as groups of ten (one bar each) and single dots. Never more than ten bars, so it stays small. */
export function Quantity({ tens, ones }: { tens: number; ones: number }) {
  const label = `${tens > 0 ? `${tens} ათიანი` : ''}${tens > 0 && ones > 0 ? ' და ' : ''}${ones > 0 || tens === 0 ? `${ones} ცალი` : ''}`;
  return (
    <div className="qty" role="img" aria-label={label}>
      {Array.from({ length: tens }, (_, i) => (
        <span key={`t${i}`} className="qty-ten" aria-hidden="true">
          {Array.from({ length: 10 }, (_, k) => (
            <i key={k} />
          ))}
        </span>
      ))}
      {ones > 0 && (
        <span className="qty-ones" aria-hidden="true">
          {Array.from({ length: ones }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      )}
    </div>
  );
}

export const quantityText = (n: number): string => {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (tens === 0) return `${ones} ცალი`;
  return ones === 0 ? `${tens} ათიანი` : `${tens} ათიანი და ${ones} ცალი`;
};

// ─────────────────────────── question visual ───────────────────────────

/** The picture alone, without the framed box (used inside answer options too). */
export function VisualBare({ spec, compact = false }: { spec: VisualSpec; compact?: boolean }) {
  switch (spec.type) {
    case 'sequence':
      return <SequenceRow items={spec.items} arrows={spec.arrows} />;
    case 'quantity':
      return <Quantity tens={spec.tens} ones={spec.ones} />;
    case 'line':
      return <NumberLine min={spec.min} max={spec.max} value={spec.marker ?? null} labelled={spec.labelled} hops={spec.hops} ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე`} />;
    case 'objects':
      return <MarkableObjects spec={spec} compact={compact} />;
    case 'ten-frame':
      return <TenFrame count={spec.count} second={spec.second} size={spec.size} label={`${spec.size === 5 ? 'ხუთეულის' : 'ათიანი'} ჩარჩო: ${spec.count}${spec.second ? ` და ${spec.second}` : ''}`} />;
    case 'compare':
      return <CompareGroups a={spec.a} b={spec.b} view={spec.view} glyph={spec.glyph} />;
    case 'part-whole':
      return <PartWhole whole={spec.whole} part={spec.part} counters={spec.counters} />;
    case 'bond':
      return <BondPicture whole={spec.whole} a={spec.a} b={spec.b} counters={spec.counters} compact={compact} />;
    case 'parts':
      return <PartsPicture a={spec.a} b={spec.b} glyph={spec.glyph} palette={spec.palette} compact={compact} />;
    case 'jump-line':
      return <JumpLinePicture spec={spec} />;
    case 'story':
      return <StoryVisual spec={spec} />;
    case 'shape':
      return <ShapePicture item={spec} compact={compact} />;
    case 'length':
      return <ObjectRow objects={spec.objects} align={spec.align} showCm={spec.showCm} />;
    case 'clock':
      return <ClockFace time={spec.time} showHands={spec.showHands !== false} size={132} label={`საათი`} />;
    case 'flat':
      return <Shape2DRow shapes={spec.shapes} compact showSides={spec.showSides} />;
    case 'scale':
      return <BalanceScale scale={{ left: { weights: spec.left }, right: { weights: spec.right }, unit: spec.unit }} size={252} label="სასწორი" />;
    case 'groups':
      return <GroupsBoard a={spec.a} b={spec.b} glyph={spec.glyph ? GLYPH_OF[spec.glyph] : undefined} label="ორი ჯგუფი" />;
    case 'sentence':
      return <SentenceLine sentence={{ left: spec.left, right: spec.right }} />;
    case 'chart':
      return <PictureChart chart={{ glyph: spec.glyph, rows: spec.rows }} label="ნახატი დიაგრამა" />;
    case 'sorted-groups':
      return (
        <div className="lab-sort-groups">
          {spec.groups.map((g) => (
            <section key={g.value} className="lab-sort-group" aria-label={valueLabel(spec.attr, g.value)}>
              <h4>{valueLabel(spec.attr, g.value)} <small>({g.objects.length})</small></h4>
              <div className="lab-sort-items">
                {g.objects.map((o) => (
                  <SortChip key={o.id} obj={o as never} size={44} />
                ))}
              </div>
            </section>
          ))}
        </div>
      );
    case 'place-blocks':
      return <PlaceBlocks counts={{ hundreds: spec.hundreds, tens: spec.tens, ones: spec.ones }} size={46} label="ადგილობრივი ღირებულების ბლოკები" />;
    case 'place-cards':
      return <PlaceCards value={spec.value} hide={spec.hide} label="რიცხვის ციფრები" />;
    case 'expanded':
      return <ExpandedLine value={spec.value} hide={spec.hide} label={spec.hide ? `გაშლილი სახე, ${spec.hide} დაფარულია` : undefined} />;
    case 'skip-line':
      return <SkipLine spec={{ start: spec.start, step: spec.step, count: spec.count, hideLandings: spec.hideLandings, walker: spec.walker }} />;
    case 'group-count':
      return <GroupCount size={spec.size} groups={spec.groups} noun={spec.noun} />;
    case 'venn':
      return (
        <VennBoard
          objects={spec.regions.flatMap((r) => r.objects as never[])}
          leftLabel={spec.leftLabel}
          rightLabel={spec.rightLabel}
          placement={spec.regions.flatMap((r) => r.objects.map(() => r.region))}
          onChange={() => undefined}
          disabled
          label="ვენის დიაგრამა"
        />
      );
  }
}

/** The characters used for a group of objects, so a picture is never only a colour. */
const GLYPH_OF: Record<string, string> = { star: '★', apple: '●', fish: '◆', ball: '●' };

export function VisualView({ spec }: { spec: VisualSpec }) {
  return (
    <div className="lp-visual">
      <VisualBare spec={spec} />
    </div>
  );
}

/** Objects the student may tap to keep track while counting; the number is never shown. */
function MarkableObjects({ spec, compact }: { spec: Extract<VisualSpec, { type: 'objects' }>; compact: boolean }) {
  const [counted, setCounted] = useState<number[]>([]);
  const tap = (i: number) => setCounted((all) => (all.includes(i) ? all : [...all, i]));
  return (
    <div className="objs">
      <ObjectField count={spec.count} glyph={spec.glyph} layout={spec.layout} seed={spec.seed} label="საგნები" compact={compact} counted={spec.markable ? counted : undefined} picked={spec.known ? new Set(Array.from({ length: spec.known }, (_, i) => i)) : undefined} onTap={spec.markable ? tap : undefined} />
      {spec.markable && (
        <div className="objs-bar">
          <span>
            მონიშნულია: <strong>{counted.length}</strong>
          </span>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setCounted([])}>
            ↻ გასუფთავება
          </button>
        </div>
      )}
    </div>
  );
}

export function PartWhole({ whole, part, counters }: { whole: number; part: number; counters?: 'split' | 'plain' }) {
  return (
    <div className="pw" role="img" aria-label={`მთელი ${whole}. ერთი ნაწილია ${part}. მეორე ნაწილი უცნობია`}>
      <div className="pw-whole" aria-hidden="true">
        <small>მთელი</small>
        <strong>{whole}</strong>
      </div>
      {counters && (
        <div aria-hidden="true">
          <TenFrame count={counters === 'split' ? part : whole} second={counters === 'split' ? whole - part : 0} label="" />
        </div>
      )}
      <div className="pw-parts" aria-hidden="true">
        <div className="pw-part">
          <small>ერთი ნაწილი</small>
          <strong>{part}</strong>
        </div>
        <div className="pw-part is-unknown">
          <small>მეორე ნაწილი</small>
          <strong>?</strong>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── animated demonstrations ───────────────────────────

export function DemoButtons({ done, replay, step }: { done: boolean; replay: () => void; step: () => void }) {
  return (
    <div className="demo-buttons">
      <button type="button" className="btn btn-ghost btn-small" onClick={replay}>
        ↻ ხელახლა
      </button>
      <button type="button" className="btn btn-ghost btn-small" onClick={step} disabled={done}>
        შემდეგი ნაბიჯი
      </button>
    </div>
  );
}

const DIRECTION_BADGE = { forward: 'წინ თვლა ▶', backward: '◀ უკან თვლა', steps: 'ტოლი ნაბიჯები' } as const;

type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

export function ChainDemo({ block }: { block: Block<'chain'> }) {
  const { frame, done, replay, step } = useStepper(block.numbers.length);
  return (
    <figure className="demo">
      <span className={`demo-badge is-${block.direction}`}>{DIRECTION_BADGE[block.direction]}</span>
      <ol className="chain" aria-label={`${block.numbers.join(', ')}`}>
        {block.numbers.map((n, i) => (
          <li key={i} className="chain-cell">
            {i > 0 && (
              <span className={`chain-arrow ${i <= frame ? 'is-on' : ''}`} aria-hidden="true">
                <small>{block.label}</small>
                <b>→</b>
              </span>
            )}
            <span className={`chain-num ${i === frame ? 'is-active' : ''} ${i < frame ? 'is-seen' : ''}`}>{n}</span>
          </li>
        ))}
      </ol>
      <div className="demo-status" role="status" aria-live="polite">
        {done ? `ბოლო რიცხვი: ${block.numbers[block.numbers.length - 1]}` : `ახლა: ${block.numbers[frame]}`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

export function HopDemo({ block }: { block: Block<'hops'> }) {
  const step = block.step ?? 1;
  const dir = block.to >= block.from ? 1 : -1;
  const path: number[] = [];
  for (let v = block.from; dir > 0 ? v <= block.to : v >= block.to; v += dir * step) path.push(v);
  const { frame, done, replay, step: advance } = useStepper(path.length);
  const hops = frame;
  return (
    <figure className="demo">
      <NumberLine min={block.min} max={block.max} value={path[frame]} start={block.from} destination={block.to} hops={path.slice(0, frame + 1)} ariaLabel={`მარკერი გადადის ${block.from}-დან ${block.to}-მდე`} />
      <div className="demo-status" role="status" aria-live="polite">
        {done ? `მივედით ${block.to}-ზე ${path.length - 1} ნაბიჯით ${dir > 0 ? 'მარჯვნივ' : 'მარცხნივ'}` : `ახლა: ${path[frame]} · ნაბიჯი ${hops}`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={advance} />
    </figure>
  );
}

export function QuantitiesBlock({ block }: { block: Block<'quantities'> }) {
  return (
    <div className="reps">
      {block.numbers.map((n) => (
        <figure key={n} className="rep">
          <div className="rep-numeral">{n}</div>
          <div className="rep-name">{numberName(n)}</div>
          <Quantity tens={Math.floor(n / 10)} ones={n % 10} />
          <figcaption className="rep-split">{quantityText(n)}</figcaption>
        </figure>
      ))}
    </div>
  );
}

// ─────────────────────────── U02 demonstrations ───────────────────────────

export function CountDemo({ block }: { block: Block<'count-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.count + 1, 650);
  const counted = Array.from({ length: frame }, (_, i) => i);
  return (
    <figure className="demo">
      <ObjectField count={block.count} glyph={block.glyph} layout="rows" counted={counted} label="დასათვლელი საგნები" />
      <div className="demo-status" role="status" aria-live="polite">
        {frame === 0 ? 'დავიწყოთ ერთიდან' : done ? `ბოლო რიცხვი ${block.count} გვეუბნება: სულ ${block.count} საგანია` : `ვითვლით: ${frame}`}
      </div>
      {block.second && (
        <div className="demo-second">
          <span className="demo-badge">იგივე საგნები სხვანაირად</span>
          <ObjectField count={block.count} glyph={block.glyph} layout={block.second.layout} seed={block.second.seed} label="იგივე საგნები სხვა დალაგებით" />
          <p className="demo-status">ისევ {block.count} საგანია.</p>
        </div>
      )}
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

export function CompareBlock({ block }: { block: Block<'compare'> }) {
  return (
    <figure className="demo">
      <CompareGroups a={block.a} b={block.b} view={block.view} glyph={block.glyph} showNumbers />
      <div className="cmp-words" role="status">
        {block.symbol && (
          <span className="cmp-sentence" aria-hidden="true">
            {block.a} {compareSign(block.a, block.b)} {block.b}
          </span>
        )}
        <span>{compareWords(block.a, block.b)}</span>
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

export function OrderDemo({ block }: { block: Block<'order-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.numbers.length, 1000);
  return (
    <figure className="demo">
      <NumberLine min={block.min} max={block.max} value={block.numbers[frame]} labelled={block.numbers} hops={block.numbers.slice(0, frame + 1)} ariaLabel={`რიცხვები ღერძზე: ${block.numbers.join(', ')}`} />
      <ol className="chain" aria-label={block.numbers.join(', ')}>
        {block.numbers.map((n, i) => (
          <li key={n} className="chain-cell">
            {i > 0 && (
              <span className={`chain-arrow ${i <= frame ? 'is-on' : ''}`} aria-hidden="true">
                <b>→</b>
              </span>
            )}
            <span className={`chain-num ${i === frame ? 'is-active' : ''} ${i < frame ? 'is-seen' : ''}`}>{n}</span>
          </li>
        ))}
      </ol>
      <div className="demo-status" role="status" aria-live="polite">
        {done ? (block.direction === 'asc' ? 'პატარიდან დიდისკენ: ღერძზე მარჯვნივ მივდივართ.' : 'დიდიდან პატარისკენ: ღერძზე მარცხნივ მივდივართ.') : `ახლა: ${block.numbers[frame]}`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

const STATIC_COUNTERS = (n: number) =>
  Array.from({ length: n }, (_, i) => <span key={i} className="spl-counter is-static" aria-hidden="true" />);

export function ComposeDemo({ block }: { block: Block<'compose'> }) {
  const [a, b] = block.parts;
  const { frame, done, replay, step } = useStepper(3, 1500);
  return (
    <figure className="demo">
      {frame !== 1 ? (
        <div className="spl-box is-whole" role="img" aria-label={`ერთად ${block.whole}`}>
          <span className="spl-label">{frame === 0 ? 'მთელი ჯგუფი' : 'ისევ ერთად'}</span>
          <div className="spl-counters">{STATIC_COUNTERS(block.whole)}</div>
          <output className="spl-count">{block.whole}</output>
        </div>
      ) : (
        <div className="spl-boxes" role="img" aria-label={`ორი ნაწილი: ${a} და ${b}`}>
          <div className="spl-box">
            <span className="spl-label">ერთი ნაწილი</span>
            <div className="spl-counters">{STATIC_COUNTERS(a)}</div>
            <output className="spl-count">{a}</output>
          </div>
          <div className="spl-box is-second">
            <span className="spl-label">მეორე ნაწილი</span>
            <div className="spl-counters">{STATIC_COUNTERS(b)}</div>
            <output className="spl-count">{b}</output>
          </div>
        </div>
      )}
      <div className="demo-status" role="status" aria-live="polite">
        {frame === 0 ? `ეს არის ${block.whole}.` : frame === 1 ? `ორ ნაწილად გავყავით: ${a} და ${b}.` : `${a} და ${b} ერთად ისევ ${block.whole} არის.`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

// ─────────────────────────── U05 shape demonstrations ───────────────────────────

type ShapeBlock = Block<'shape-demo'>;

/** One shape story told step by step: whole and parts, comparing parts, dividing, halves, quarters. */
export function ShapeDemo({ block }: { block: ShapeBlock }) {
  const { frame, done, replay, step } = useStepper(block.steps.length, 1200);
  const division = divisionOf(block.shape);
  const contrast = divisionOf(block.contrast);
  const hi = (list: number[]): Record<number, 'hi'> => Object.fromEntries(list.map((i) => [i, 'hi' as const]));
  const pair = division.pieces.length >= 2 ? ([division.pieces[0], division.pieces[1]] as const) : null;

  let picture: React.ReactNode = null;
  if (block.mode === 'whole-parts') {
    if (frame === 0) picture = <ShapeBoard spec={block.shape} merged label={describeShape(block.shape)} />;
    else if (frame === 1) picture = <ShapeBoard spec={block.shape} spread={1} label={describeShape(block.shape)} />;
    else if (frame === 2) picture = <ShapeBoard spec={block.shape} merged label={describeShape(block.shape)} />;
    else picture = <ShapeBoard spec={block.contrast} spread={1} label={describeShape(block.contrast)} />;
  } else if (block.mode === 'compare') {
    if (frame === 0) picture = <ShapeBoard spec={block.shape} lines={1} label={describeShape(block.shape)} />;
    else if (frame === 1) picture = <ShapeBoard spec={block.shape} marks={hi([1])} label={describeShape(block.shape)} />;
    else if (frame === 2) picture = <ShapeBoard spec={block.shape} marks={hi([2])} label={describeShape(block.shape)} />;
    else if (frame === 3 && pair) picture = <CompareStage a={pair[0]} b={pair[1]} overlaid nameA="ნაწილი 1" nameB="ნაწილი 2" />;
    else if (contrast.pieces.length >= 2) picture = <CompareStage a={contrast.pieces[0]} b={contrast.pieces[1]} overlaid nameA="ნაწილი 1" nameB="ნაწილი 2" />;
  } else if (block.mode === 'cut') {
    if (frame === 0) picture = <ShapeBoard spec={block.shape} merged label={describeShape(block.shape)} />;
    else if (frame === 1) picture = <ShapeBoard spec={block.shape} lines={1} label={describeShape(block.shape)} />;
    else if (frame === 2) picture = <ShapeBoard spec={block.shape} lines={1} marks={hi(division.pieces.map((_, i) => i + 1))} label={describeShape(block.shape)} />;
    else if (frame === 3 && pair) picture = <CompareStage a={pair[0]} b={pair[1]} overlaid nameA="ნაწილი 1" nameB="ნაწილი 2" />;
    else picture = <ShapeBoard spec={block.contrast} lines={1} label={describeShape(block.contrast)} />;
  } else {
    // half / quarter
    if (frame === 0) picture = <ShapeBoard spec={block.shape} merged label={describeShape(block.shape)} />;
    else if (frame === 1) picture = <ShapeBoard spec={block.shape} lines={1} label={describeShape(block.shape)} />;
    else if (frame === 2) picture = <ShapeBoard spec={block.shape} marks={hi([1])} badges label={describeShape(block.shape)} />;
    else if (frame === 3) picture = <ShapeBoard spec={block.shape} marks={hi([2])} badges label={describeShape(block.shape)} />;
    else if (frame === 4) picture = <ShapeBoard spec={block.shape} marks={hi(division.pieces.map((_, i) => i + 1))} badges label={describeShape(block.shape)} />;
    else picture = <ShapeBoard spec={block.contrast} lines={1} badges label={describeShape(block.contrast)} />;
  }

  return (
    <figure className="demo">
      {picture}
      <div className="demo-status" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)]}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}
