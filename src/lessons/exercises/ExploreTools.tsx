import { useMemo, useState } from 'react';
import { numberName } from '../numberNames';
import type { ExploreTool } from '../types';
import { CutBoard, SortBoard, parseGroups } from './ShapeAnswers';
import { ComparableBoard, ShapeBoard, describeShape } from './ShapeBoard';
import { SIZE, divisionOf, groupOf } from './ShapeGeometry';
import { DemoButtons, useStepper } from './Visuals';
import { BondSplit, FramePairs, MissingPart, StoryBond } from './BondTools';
import { DoublesLab } from './DoublesTools';
import { JumpExplore } from './JumpTools';
import { MakeTenExplore } from './MakeTenTools';
import { StoryWorkspace } from './StoryTools';
import { CompareExplore, CountObjects, NumberBuilder, OrderLine, SplitExplore } from './ExploreToolsU02';
import { NumberLine } from './NumberLine';
import { Quantity, SequenceRow, quantityText } from './Visuals';
import { ExploreToolViewMeasure } from './MeasureTools';
import { ExploreToolViewClock, ExploreToolViewShapes2D } from './TimeShapeTools';
import { ExploreToolViewBalance } from './BalanceTools';
import { ExploreToolViewSort } from './SortTools';
import { DigitLab, ExpandedLab, MissingPlaceLab, PlaceLab } from './PlaceValueTools';
import { HundredLab, PatternLab, SkipLab, TenGroupsLab } from './PatternTools';
import { AddLab, ColumnsLab, StoryLab, SubtractLab } from './AddSubTools';
import { ArrayLab, EqualGroupsLab, GroupStoryLab, MultiplyLab, RepeatLab } from './GroupsTools';

/**
 * Free-exploration tools. Nothing here is graded and nothing is "submitted":
 * the student can poke at the picture, reset it and try again, then move on.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────── L1: tiles with forward / backward arrows ───────────────

function TileWalk({ spec }: { spec: ToolOf<'tile-walk'> }) {
  const [current, setCurrent] = useState(spec.start);
  const [mode, setMode] = useState<'forward' | 'backward'>('forward');
  const [note, setNote] = useState('');
  const tiles = Array.from({ length: spec.to - spec.from + 1 }, (_, i) => spec.from + i);
  const delta = mode === 'forward' ? 1 : -1;
  const target = current + delta;
  const canMove = target >= spec.from && target <= spec.to;

  const move = () => {
    if (!canMove) return;
    setNote(mode === 'forward' ? `${current} → ${target}: ერთით მეტი` : `${current} → ${target}: ერთით ნაკლები`);
    setCurrent(target);
  };
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="თვლის მიმართულება">
        <button type="button" className={`xt-mode ${mode === 'forward' ? 'is-on' : ''}`} aria-pressed={mode === 'forward'} onClick={() => setMode('forward')}>
          წინ თვლა
        </button>
        <button type="button" className={`xt-mode ${mode === 'backward' ? 'is-on' : ''}`} aria-pressed={mode === 'backward'} onClick={() => setMode('backward')}>
          უკან თვლა
        </button>
      </div>
      <div className="tiles" role="group" aria-label="რიცხვების ფილები">
        {tiles.map((n) => (
          <button key={n} type="button" className={`tile ${n === current ? 'is-active' : ''}`} aria-pressed={n === current} aria-label={`რიცხვი ${n}`} onClick={() => setCurrent(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={move} disabled={!canMove}>
          {mode === 'forward' ? 'შემდეგი რიცხვი ▶' : '◀ წინა რიცხვი'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setCurrent(spec.start); setNote(''); }}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        მონიშნულია: <strong>{current}</strong>
        {note && <> · {note}</>}
        {!canMove && <> · აქ ფილები მთავრდება</>}
      </p>
    </div>
  );
}

// ─────────────── L2: numeral · name · quantity ───────────────

type Panel = 'numeral' | 'name' | 'quantity';

function Representations({ spec }: { spec: ToolOf<'representations'> }) {
  const [n, setN] = useState(spec.numbers[0]);
  const [panel, setPanel] = useState<Panel | null>(null);
  const linked = panel !== null;
  const pick = (p: Panel) => setPanel(p);
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="რიცხვის არჩევა">
        {spec.numbers.map((k) => (
          <button key={k} type="button" className={`xt-mode ${k === n ? 'is-on' : ''}`} aria-pressed={k === n} onClick={() => { setN(k); setPanel(null); }}>
            {k}
          </button>
        ))}
      </div>
      <div className={`panels ${linked ? 'is-linked' : ''}`}>
        <button type="button" className={`panel ${panel === 'numeral' ? 'is-picked' : ''}`} aria-pressed={panel === 'numeral'} onClick={() => pick('numeral')}>
          <small>ციფრებით</small>
          <span className="panel-numeral">{n}</span>
        </button>
        <button type="button" className={`panel ${panel === 'name' ? 'is-picked' : ''}`} aria-pressed={panel === 'name'} onClick={() => pick('name')}>
          <small>სიტყვით</small>
          <span className="panel-name">{numberName(n)}</span>
        </button>
        <button type="button" className={`panel ${panel === 'quantity' ? 'is-picked' : ''}`} aria-pressed={panel === 'quantity'} onClick={() => pick('quantity')}>
          <small>ჯგუფებით</small>
          <Quantity tens={Math.floor(n / 10)} ones={n % 10} />
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {linked ? (
          <>
            ეს ერთი და იგივე რიცხვია: <strong>{n}</strong> = {numberName(n)} = {quantityText(n)}.
          </>
        ) : (
          'შეეხე ერთ-ერთ ბარათს და ნახე, როგორ ემთხვევა ერთმანეთს სამივე.'
        )}
      </p>
    </div>
  );
}

// ─────────────── L3: extend a sequence ───────────────

function SequenceExtend({ spec }: { spec: ToolOf<'sequence-extend'> }) {
  const [which, setWhich] = useState(0);
  const [counts, setCounts] = useState(() => spec.sequences.map((s) => s.shown));
  const seq = spec.sequences[which];
  const count = counts[which];
  const full = count >= seq.total;
  const numbers = Array.from({ length: count }, (_, i) => seq.start + i * seq.step);
  const items: Array<number | null> = full ? numbers : [...numbers, null];
  const extend = () => {
    if (full) return;
    setCounts((all) => all.map((c, i) => (i === which ? c + 1 : c)));
  };
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="მიმდევრობის არჩევა">
        {spec.sequences.map((s, i) => (
          <button key={s.label} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="seq-scroll">
        <SequenceRow items={items} arrows={`+${seq.step}`} reveal={numbers.length > seq.shown ? numbers.length - 1 : undefined} onHole={full ? undefined : extend} />
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={extend} disabled={full}>
          შემდეგი რიცხვი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setCounts((all) => all.map((c, i) => (i === which ? seq.shown : c)))}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {full ? 'მიმდევრობა დასრულდა.' : 'შემდეგი ადგილი ცარიელია. შეეხე მას ან დააჭირე ღილაკს და ნახე, რა რიცხვი მოდის.'}
        {count - seq.shown >= 2 && (
          <>
            {' '}
            ყოველ ნაბიჯზე ემატება <strong>{seq.step}</strong>.
          </>
        )}
      </p>
    </div>
  );
}

// ─────────────── L4: tap · drag · step ───────────────

function LineExplorer({ spec }: { spec: ToolOf<'number-line'> }) {
  const [value, setValue] = useState(spec.start);
  const [note, setNote] = useState('');
  const change = (next: number) => {
    setNote(next > value ? 'მარჯვნივ გადავედით: რიცხვი გაიზარდა.' : 'მარცხნივ გადავედით: რიცხვი შემცირდა.');
    setValue(next);
  };
  return (
    <div className="xt">
      <NumberLine min={spec.min} max={spec.max} value={value} onChange={change} start={spec.start} arrows showValue ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე`} />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => { setValue(spec.start); setNote(''); }}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {note || 'შეეხე რიცხვს, გადაათრიე მარკერი ან გამოიყენე ისრები.'}
      </p>
    </div>
  );
}

// ─────────────── L5: hop by 2 · 5 · 10 ───────────────

function SkipLine({ spec }: { spec: ToolOf<'skip-line'> }) {
  const [step, setStep] = useState(spec.steps[0]);
  const [trails, setTrails] = useState<Record<number, number[]>>(() => Object.fromEntries(spec.steps.map((s) => [s, [spec.min]])));
  const trail = trails[step];
  const here = trail[trail.length - 1];
  const canHop = here + step <= spec.max;
  const hop = () => {
    if (!canHop) return;
    setTrails((all) => ({ ...all, [step]: [...all[step], here + step] }));
  };
  const reached = (s: number): number[] => trails[s].slice(1);
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ნახტომის სიდიდე">
        {spec.steps.map((s) => (
          <button key={s} type="button" className={`xt-mode ${s === step ? 'is-on' : ''}`} aria-pressed={s === step} onClick={() => setStep(s)}>
            {s}-ით
          </button>
        ))}
      </div>
      <NumberLine min={spec.min} max={spec.max} value={here} hops={trail} ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე`} />
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={hop} disabled={!canHop}>
          გადახტი +{step}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setTrails(Object.fromEntries(spec.steps.map((s) => [s, [spec.min]])))}>
          ↻ თავიდან
        </button>
      </div>
      <ul className="compare" aria-label="მიღებული რიცხვები">
        {spec.steps.map((s) => (
          <li key={s} className={s === step ? 'is-now' : ''}>
            <b>{s}-ით:</b> {reached(s).length ? reached(s).join(', ') : '—'}
          </li>
        ))}
      </ul>
      <p className="xt-note" role="status" aria-live="polite">
        {canHop ? `ახლა ${here}-ზე ვდგავართ. ყოველ ნახტომზე ემატება ${step}.` : 'ღერძის ბოლოში მივედით. სცადე სხვა ნახტომი ან დაიწყე თავიდან.'}
      </p>
    </div>
  );
}


// ─────────────── U05 L1: wholes that fall apart ───────────────

function PartsLab({ spec }: { spec: ToolOf<'parts-lab'> }) {
  const [which, setWhich] = useState(0);
  const example = spec.examples[which];
  const division = divisionOf(example.spec);
  const [home, setHome] = useState<boolean[]>(() => division.pieces.map(() => true));
  const [apart, setApart] = useState(false);
  const pick = (i: number) => {
    setHome((all) => all.map((h, k) => (k === i ? !h : h)));
    setApart(false);
  };
  const split = () => {
    setHome(division.pieces.map(() => false));
    setApart(true);
  };
  const gather = () => {
    setHome(division.pieces.map(() => true));
    setApart(false);
  };
  const [w, h] = SIZE[example.spec.shape];
  const center: [number, number] = [w / 2, h / 2];
  const offsets = division.pieces.map((piece, i) => {
    if (home[i]) return [0, 0] as [number, number];
    const dir: [number, number] = [piece.cx - center[0], piece.cy - center[1]];
    const len = Math.hypot(dir[0], dir[1]) || 1;
    return [(dir[0] / len) * 13, (dir[1] / len) * 13] as [number, number];
  });
  const allHome = home.every(Boolean);
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ფიგურის არჩევა">
        {spec.examples.map((ex, i) => (
          <button key={ex.label} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setHome(divisionOf(ex.spec).pieces.map(() => true)); setApart(false); }}>
            {ex.label}
          </button>
        ))}
      </div>
      <ShapeBoard spec={example.spec} offsets={offsets} onPiece={pick} badges={false} label={describeShape(example.spec)} />
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={split} disabled={apart && !home.some(Boolean)}>
          დაიყო ნაწილებად
        </button>
        <button type="button" className="btn btn-ghost" onClick={gather} disabled={allHome}>
          შეიკრიბე მთლიანად
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {allHome
          ? `ეს არის ერთი მთელი: ${example.label}. დააჭირე ღილაკს და ნახე, როგორ დაიყოფა ნაწილებად.`
          : `ნაწილები: ${home.filter((h) => !h).length} გარეთაა, ${home.filter(Boolean).length} ადგილზე. შეეხე ნაწილს, რომ უკან გადავიდეს, ან შეიკრიბე ყველაფერი ერთად.`}
      </p>
    </div>
  );
}

// ─────────────── U05 L2: compare parts and sort them ───────────────

function CompareLab({ spec }: { spec: ToolOf<'compare-lab'> }) {
  const [which, setWhich] = useState(0);
  const [groups, setGroups] = useState(() => spec.sort.map(() => ''));
  const example = spec.examples[which];
  const right = useMemo(() => spec.sort.map((item) => groupOf('equal', item)), [spec]);
  const placed = groups.filter(Boolean).length;
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ფიგურის არჩევა">
        {spec.examples.map((ex, i) => (
          <button key={ex.label} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {ex.label}
          </button>
        ))}
      </div>
      <ComparableBoard spec={example.spec} label={describeShape(example.spec)} resetKey={which} />
      <h3 className="xt-sub">დაალაგე ნახატები ჯგუფებად</h3>
      <SortBoard items={spec.sort} rule="equal" groups={parseGroups(groups.join(','), spec.sort.length)} onChange={setGroups} right={(i) => groups[i] === right[i]} label="ნახატების დალაგება ტოლ და არატოლ ნაწილებად" />
      <p className="xt-note" role="status" aria-live="polite">
        {placed === spec.sort.length ? 'ყველა ნახატი თავის ჯგუფშია. შეადარე ნაწილები კიდევ ერთხელ და დაიწყე თავიდან, თუ გინდა.' : `ჯგუფებშია ${placed} ნახატი ${spec.sort.length}-დან. შეეხე ნახატს და მერე ჯგუფს.`}
      </p>
    </div>
  );
}

// ─────────────── U05 L3: divide a shape yourself ───────────────

function CutLab({ spec }: { spec: ToolOf<'cut-lab'> }) {
  const [which, setWhich] = useState(0);
  const [values, setValues] = useState<string[]>(() => spec.shapes.map(() => ''));
  const shape = spec.shapes[which];
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ფიგურის არჩევა">
        {spec.shapes.map((sh, i) => (
          <button key={sh.label} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {sh.label}
          </button>
        ))}
      </div>
      <CutBoard
        shape={shape.shape}
        parts={0}
        maxCuts={2}
        skin={shape.skin}
        compare
        tell="verdict"
        value={values[which]}
        onChange={(v) => setValues((all) => all.map((x, i) => (i === which ? v : x)))}
        disabled={false}
        label={shape.label}
      />
      <p className="xt-note">შეეხე ორ წერტილს კიდეზე, რომ ხაზი გაივლოს. მერე შეადარე ნაწილები: დაადე ერთი მეორეზე და ნახე, ემთხვევა თუ არა.</p>
    </div>
  );
}

// ─────────────── U05 L4/L5: halves and quarters ───────────────

function FractionLab({ spec }: { spec: ToolOf<'fraction-lab'> }) {
  const [which, setWhich] = useState(0);
  const example = spec.examples[which];
  const division = divisionOf(example.spec);
  const n = division.pieces.length;
  const word = spec.parts === 2 ? 'ნახევარი' : 'მეოთხედი';
  const frames = n + 3;
  const { frame, done, replay, step } = useStepper(frames, 1100);
  const marks: Record<number, 'hi'> = {};
  if (frame >= 2 && frame < frames - 1) marks[frame - 1] = 'hi';
  if (frame === frames - 1) division.pieces.forEach((_, i) => (marks[i + 1] = 'hi'));
  const status =
    frame === 0
      ? 'ეს არის მთელი.'
      : frame === 1
        ? `ფიგურა ${n} ტოლ ნაწილად დავყავით.`
        : frame === frames - 1
          ? `ყველა ნაწილი ერთად ისევ მთელს აკეთებს.`
          : `ეს არის ერთი ${word}.`;
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ფიგურის არჩევა">
        {spec.examples.map((ex, i) => (
          <button key={ex.label} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); replay(); }}>
            {ex.label}
          </button>
        ))}
      </div>
      <figure className="demo">
        <ShapeBoard spec={example.spec} merged={frame === 0} lines={frame === 1 ? 1 : 0} marks={marks} badges={frame >= 2} label={describeShape(example.spec)} />
        <div className="demo-status" role="status" aria-live="polite">
          {status}
        </div>
        <DemoButtons done={done} replay={replay} step={step} />
      </figure>
      <h3 className="xt-sub">როცა ნაწილები ტოლი არ არის</h3>
      {spec.unequal.map((ex) => (
        <div key={ex.label} className="xt-block">
          <p className="xt-note">{ex.label}. შეადარე ნაწილები: ისინი ზუსტად არ ემთხვევა.</p>
          <ComparableBoard spec={ex.spec} label={describeShape(ex.spec)} resetKey={ex.label} />
        </div>
      ))}
    </div>
  );
}

export function ExploreToolView({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'tile-walk':
      return <TileWalk spec={tool} />;
    case 'representations':
      return <Representations spec={tool} />;
    case 'sequence-extend':
      return <SequenceExtend spec={tool} />;
    case 'number-line':
      return <LineExplorer spec={tool} />;
    case 'skip-line':
      return <SkipLine spec={tool} />;
    case 'count-objects':
      return <CountObjects spec={tool} />;
    case 'number-builder':
      return <NumberBuilder spec={tool} />;
    case 'compare':
      return <CompareExplore spec={tool} />;
    case 'order-line':
      return <OrderLine spec={tool} />;
    case 'split':
      return <SplitExplore spec={tool} />;
    case 'bond-split':
      return <BondSplit spec={tool} />;
    case 'frame-pairs':
      return <FramePairs spec={tool} />;
    case 'missing-part':
      return <MissingPart spec={tool} />;
    case 'story-bond':
      return <StoryBond spec={tool} />;
    case 'jump-line':
      return <JumpExplore spec={tool} />;
    case 'make-ten':
      return <MakeTenExplore spec={tool} />;
    case 'doubles-lab':
      return <DoublesLab spec={tool} />;
    case 'story-workspace':
      return <StoryWorkspace spec={tool} />;
    case 'parts-lab':
      return <PartsLab spec={tool} />;
    case 'compare-lab':
      return <CompareLab spec={tool} />;
    case 'cut-lab':
      return <CutLab spec={tool} />;
    case 'fraction-lab':
      return <FractionLab spec={tool} />;
    case 'length-lab':
    case 'length-sort-lab':
    case 'units-lab':
    case 'ruler-lab':
    case 'metre-lab':
      return <ExploreToolViewMeasure tool={tool} />;
    case 'clock-lab':
    case 'time-set-lab':
    case 'time-match-lab':
    case 'five-minute-lab':
      return <ExploreToolViewClock tool={tool} />;
    case 'flat-lab':
    case 'room-lab':
      return <ExploreToolViewShapes2D tool={tool} />;
    case 'balance-lab':
    case 'equal-groups-lab':
    case 'sentence-lab':
    case 'puzzle-lab':
      return <ExploreToolViewBalance tool={tool} />;
    case 'sort-lab':
    case 'grid-lab':
    case 'venn-lab':
    case 'chart-lab':
      return <ExploreToolViewSort tool={tool} />;
    case 'place-lab':
      return <PlaceLab tool={tool} />;
    case 'digit-lab':
      return <DigitLab tool={tool} />;
    case 'expanded-lab':
      return <ExpandedLab tool={tool} />;
    case 'missing-place-lab':
      return <MissingPlaceLab tool={tool} />;
    case 'skip-lab':
      return <SkipLab tool={tool} />;
    case 'ten-groups-lab':
      return <TenGroupsLab tool={tool} />;
    case 'hundred-lab':
      return <HundredLab tool={tool} />;
    case 'pattern-lab':
      return <PatternLab tool={tool} />;
    case 'add-lab':
      return <AddLab tool={tool} />;
    case 'subtract-lab':
      return <SubtractLab tool={tool} />;
    case 'columns-lab':
      return <ColumnsLab tool={tool} />;
    case 'story-lab':
      return <StoryLab tool={tool} />;
    case 'groups-equal-lab':
      return <EqualGroupsLab tool={tool} />;
    case 'repeat-lab':
      return <RepeatLab tool={tool} />;
    case 'multiply-lab':
      return <MultiplyLab tool={tool} />;
    case 'array-lab':
      return <ArrayLab tool={tool} />;
    case 'group-story-lab':
      return <GroupStoryLab tool={tool} />;
  }
}
