import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { addMinutes, digitalText, fivesTo, hourAngle, minuteAngle, minuteHandNumber, parseDigital, spokenTime, type ClockTime } from './ClockGeometry';
import { ClockFace, ClockReadout, FiveMinuteRing, MatchBoard, SetClockBoard, handDegrees } from './ClockBoard';
import { FLAT_NAME, type Flat, type FlatSpec, hasEqualSides, sidesOf, shapeGroup, sideLengths, verticesOf } from './Shape2DGeometry';
import { Shape2D, groupsFor, tapWordsText } from './Shape2DBoard';

/**
 * Explore tools and explain demos for Unit 7 (time) and Unit 8 (2D shapes). Everything here shows real numbers:
 * the hands follow the time, the five-minute counts follow the minute, and the sides and corners are counted from
 * the outline.
 */

type ClockLabTool = Extract<ExploreTool, { tool: 'clock-lab' }>;
type TimeSetLabTool = Extract<ExploreTool, { tool: 'time-set-lab' }>;
type TimeMatchLabTool = Extract<ExploreTool, { tool: 'time-match-lab' }>;
type FiveMinuteLabTool = Extract<ExploreTool, { tool: 'five-minute-lab' }>;
type FlatLabTool = Extract<ExploreTool, { tool: 'flat-lab' }>;
type RoomLabTool = Extract<ExploreTool, { tool: 'room-lab' }>;

// ═══════════════════════════ U07 ═══════════════════════════

/** Move the hands freely and watch the hour hand creep as the minutes pass. */
export function ClockLab({ tool }: { tool: ClockLabTool }) {
  const [time, setTime] = useState<ClockTime>(tool.start);
  const [picked, setPicked] = useState<ClockTime | null>(null);
  const hand = handDegrees(time);
  const same = picked !== null && picked.h === time.h && picked.m === time.m;
  return (
    <div className="lab lab-clock">
      <div className="lab-head">
        {tool.times.map((t) => (
          <button
            key={`${t.h}:${t.m}`}
            type="button"
            className={`btn btn-ghost btn-small ${picked && picked.h === t.h && picked.m === t.m ? 'is-on' : ''}`}
            onClick={() => {
              setTime(t);
              setPicked(t);
            }}
          >
            {digitalText(t)}
          </button>
        ))}
      </div>
      <SetClockBoard time={time} onChange={(next) => (setTime(next), setPicked(null))} step={5} label="საათი: გადაატრიალე ისრები" />
      <ul className="lab-facts">
        <li>საათის ისარი: {Math.round(hand.hour)}° </li>
        <li>წუთის ისარი: {Math.round(hand.minute)}° </li>
        <li>{time.m === 0 ? 'საათის ისარი ზუსტად ციფრზეა.' : `საათის ისარი ${time.h}-სა და ${(time.h % 12) + 1}-ს შორისაა.`}</li>
      </ul>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {picked === null
          ? 'სცადე: წუთის ისარი გადაატრიალე და ნახე, როგორ იძვრება საათის ისარიც.'
          : same
            ? `სწორია: ${spokenTime(time)}.`
            : `ჯერ არა — ეს ${digitalText(time)}-ია, არა ${digitalText(picked)}.`}
      </p>
    </div>
  );
}

/** Set the clock to an asked time, and read one back. */
export function TimeSetLab({ tool }: { tool: TimeSetLabTool }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState<ClockTime>({ h: 12, m: 0 });
  const target = tool.times[Math.min(index, tool.times.length - 1)];
  const ok = time.h === target.h && time.m === target.m;
  const next = () => {
    setIndex((i) => (i + 1) % tool.times.length);
    setTime({ h: 12, m: 0 });
  };
  return (
    <div className="lab lab-setclock">
      <div className="lab-head">
        {tool.times.map((t, i) => (
          <button key={`${t.h}:${t.m}`} type="button" className={`btn btn-ghost btn-small ${i === index ? 'is-on' : ''}`} onClick={() => { setIndex(i); setTime({ h: 12, m: 0 }); }}>
            {digitalText(t)}
          </button>
        ))}
      </div>
      <p className="lab-note">
        დააყენე: <strong>{spokenTime(target)}</strong> ({digitalText(target)})
      </p>
      <SetClockBoard time={time} onChange={setTime} step={tool.step === 1 ? 1 : 5} label="საათი: დააყენე დრო" />
      <div className="lab-head">
        <button type="button" className="btn btn-ghost btn-small" onClick={next}>
          შემდეგი დრო →
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {ok ? `✓ სწორია: ${spokenTime(target)}.` : `ასე არ არის: საათი ${digitalText(time)}-ს აჩვენებს.`}
      </p>
    </div>
  );
}

/** Match analog faces to digital displays. */
export function TimeMatchLab({ tool }: { tool: TimeMatchLabTool }) {
  const faces = tool.pairs.map((p) => p.time);
  const [mapping, setMapping] = useState<string[]>(faces.map(() => ''));
  // the displays are deliberately shuffled, so position can never be the answer
  const [displays] = useState<string[]>(() => {
    const texts = faces.map((t) => digitalText(t));
    return texts.length > 1 ? [...texts.slice(1), texts[0]] : texts;
  });
  const right = faces.every((t, i) => parseDigital(displays[Number(mapping[i])] ?? '')?.h === t.h && parseDigital(displays[Number(mapping[i])] ?? '')?.m === t.m);
  return (
    <div className="lab lab-match">
      <MatchBoard faces={faces} displays={displays} mapping={mapping} onChange={setMapping} label="შეუსაბამე საათები ციფრულ დროს" />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {right ? '✓ ყველა საათი შეუსაბამებია სწორ დროს.' : 'ჯერ არ არის ყველა შეუსაბამებული.'}
      </p>
    </div>
  );
}

/** Count round the face by fives, one mark at a time. */
export function FiveMinuteLab({ tool }: { tool: FiveMinuteLabTool }) {
  const [time, setTime] = useState<ClockTime>(tool.start);
  const top = Math.floor(time.m / 5) * 5;
  return (
    <div className="lab lab-five">
      <ClockFace time={time} size={176} showFiveLabels label={`საათი: ${spokenTime(time)}`} />
      <FiveMinuteRing upTo={time} />
      <div className="ck-controls">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setTime(addMinutes(time, -5))}>
          ← 5 წუთი უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={() => setTime(addMinutes(time, 5))}>
          5 წუთი წინ →
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setTime({ h: 12, m: 0 })}>
          ↻ 12:00
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        წუთის ისარი {minuteHandNumber(time)}-ზეა: {top} წუთი. წუთები ხუთეულებით: {fivesTo(time.m).join(', ') || '0'}.{' '}
        {time.m === 0 ? 'ეს არის ზუსტად ამ საათის დასაწყისი.' : `ანუ ${time.h} საათი და ${time.m} წუთი.`}
      </p>
    </div>
  );
}

// ═══════════════════════════ U08 ═══════════════════════════

/** A collection of shapes to identify: tap one, and read its properties. */
export function FlatLab({ tool }: { tool: FlatLabTool }) {
  const [index, setIndex] = useState(0);
  const [showSides, setShowSides] = useState(true);
  const spec = tool.shapes[Math.min(index, tool.shapes.length - 1)];
  const lengths = sideLengths(spec);
  return (
    <div className="lab lab-flat">
      <div className="f2-row">
        {tool.shapes.map((s, i) => (
          <button key={i} type="button" className={`f2-pick ${i === index ? 'is-on' : ''}`} aria-pressed={i === index} aria-label={`ფიგურა ${i + 1}`} onClick={() => setIndex(i)}>
            <Shape2D spec={s} size={64} />
          </button>
        ))}
      </div>
      <Shape2D spec={spec} size={190} markSides={showSides} markCorners={showSides} label={`${FLAT_NAME[shapeGroup(spec)]}: ${sidesOf(spec)} გვერდი, ${verticesOf(spec)} კუთხე`} />
      <div className="f2-facts">
        <span>სახეობა: {FLAT_NAME[shapeGroup(spec)]}</span>
        <span>გვერდები: {sidesOf(spec)}</span>
        <span>კუთხეები: {verticesOf(spec)}</span>
        <span>{hasEqualSides(spec) ? 'ყველა გვერდი ტოლია' : lengths.length === 0 ? 'სწორი გვერდი არ აქვს' : 'გვერდები სხვადასხვა სიგრძისაა'}</span>
        {spec.rotate ? <span>მობრუნებულია {spec.rotate}°</span> : null}
      </div>
      <div className="lab-head">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setShowSides((v) => !v)}>
          {showSides ? 'დამალე ნიშნები' : 'აჩვენე გვერდები და კუთხეები'}
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {sidesOf(spec) === 0
          ? 'წრეს სწორი გვერდი და კუთხე არ აქვს — ის მრუდე ხაზია ბოლოების გარეშე.'
          : `${FLAT_NAME[shapeGroup(spec)]}: ${sidesOf(spec)} სწორი გვერდი და ${verticesOf(spec)} კუთხე. ზომა და მობრუნება ფიგურას არ ცვლის.`}
      </p>
    </div>
  );
}

/** The illustrated room: find the objects with the asked shape. */
export function RoomLab({ tool }: { tool: RoomLabTool }) {
  const [picked, setPicked] = useState<string[]>([]);
  const right = tool.items.filter((item) => item.spec.kind === tool.target).map((item) => item.id);
  const ok = picked.length === right.length && right.every((id) => picked.includes(id));
  return (
    <div className="lab lab-room">
      <div className="room" role="group" aria-label="ოთახი">
        <p className="room-task">
          იპოვე ოთახში ყველა საგანი, რომლის ფორმაც <strong>{FLAT_NAME[tool.target]}</strong>-ია.
        </p>
        <div className="room-grid">
          {tool.items.map((item) => {
            const on = picked.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`room-item ${on ? 'is-picked' : ''}`}
                aria-pressed={on}
                aria-label={`${item.label}${on ? ', არჩეულია' : ''}`}
                onClick={() => setPicked(on ? picked.filter((x) => x !== item.id) : [...picked, item.id])}
              >
                <Shape2D spec={item.spec} size={70} />
                <span className="room-name">
                  {on && <span aria-hidden="true">✓ </span>}
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <output className="room-count" aria-live="polite">
          არჩეულია: <strong>{picked.length}</strong> / {right.length}
        </output>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {picked.length === 0 ? 'შეეხე საგნებს, რომლებსაც ეს ფიგურა აქვს.' : ok ? '✓ ყველა სწორი საგანი არჩეულია.' : 'ჯერ არ არის ყველა სწორი.'}
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={picked.length === 0} onClick={() => setPicked([])}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

/** The sorting table for the shape lab, so a student can try all three groupings. */
export function ShapeGroupLab({ shapes }: { shapes: FlatSpec[] }) {
  const [groupBy, setGroupBy] = useState<'kind' | 'sides' | 'corners'>('kind');
  return (
    <div className="lab lab-group">
      <div className="lab-head">
        {(['kind', 'sides', 'corners'] as const).map((g) => (
          <button key={g} type="button" className={`btn btn-ghost btn-small ${groupBy === g ? 'is-on' : ''}`} onClick={() => setGroupBy(g)}>
            {g === 'kind' ? 'სახეობით' : g === 'sides' ? 'გვერდებით' : 'კუთხეებით'}
          </button>
        ))}
      </div>
      <div className="f2-row">
        {groupsFor(groupBy).map((g) => (
          <section key={g.id} className="f2-group" aria-label={g.label}>
            <h4>{g.label}</h4>
            <div className="f2-group-items">
              {shapes
                .filter((s) => (groupBy === 'kind' ? shapeGroup(s) === g.id : groupBy === 'sides' ? String(sidesOf(s)) === g.id : String(verticesOf(s)) === g.id))
                .map((s, i) => (
                  <Shape2D key={i} spec={s} size={58} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════ explain demos ═══════════════════════════

/** The clock story, one step at a time. */
export function ClockDemo({ block }: { block: Extract<ExplainBlock, { type: 'clock-demo' }> }) {
  const [step, setStep] = useState(0);
  const shown = Math.min(step, block.steps.length - 1);
  const next = () => setStep((s) => Math.min(s + 1, block.steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const t = block.time;
  const highlight = block.mode === 'hands' ? (shown === 0 ? 'none' : shown === 1 ? 'hour' : shown === 2 ? 'minute' : 'both') : 'both';
  const showHands = block.mode !== 'hands' || shown > 0;
  const display = block.mode === 'five' && shown >= 1;
  return (
    <div className="ck-demo">
      <ClockFace time={t} size={200} highlight={highlight} showHands={showHands} showFiveLabels={display} label={`საათი: ${spokenTime(t)}`} />
      {block.mode === 'five' && shown >= 2 && <FiveMinuteRing upTo={t} />}
      {block.times && shown >= block.steps.length - 1 && (
        <div className="ck-row is-compact">
          {block.times.map((other, i) => (
            <ClockFace key={i} time={other} size={92} label={spokenTime(other)} />
          ))}
        </div>
      )}
      <ClockReadout time={t} extra={block.mode === 'half' ? 'საათის ისარი ციფრებს შორისაა' : block.mode === 'oclock' ? 'წუთის ისარი 12-ზეა' : undefined} />
      <ol className="ms-steps">
        {block.steps.map((text, i) => (
          <li key={text} className={i === shown ? 'is-on' : i < shown ? 'is-past' : ''}>
            {i === shown && <span aria-hidden="true">▸ </span>}
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={back} disabled={shown === 0}>
          ← უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={next} disabled={shown >= block.steps.length - 1}>
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

/** The shape story: sides, corners, or the same shape turned. */
export function Shape2DDemo({ block }: { block: Extract<ExplainBlock, { type: 'shape2d-demo' }> }) {
  const [step, setStep] = useState(0);
  const shown = Math.min(step, block.steps.length - 1);
  const sides = sidesOf(block.spec);
  const corners = verticesOf(block.spec);
  // one more part is lit at every step, and the last step shows them all at once — so the count on screen always
  // matches the number of parts the step is talking about
  const last = shown >= block.steps.length - 1;
  const litSides = block.mode === 'sides' ? Array.from({ length: last ? sides : Math.min(sides, shown) }, (_, i) => i + 1) : [];
  const litCorners = block.mode === 'corners' ? Array.from({ length: last ? corners : Math.min(corners, shown) }, (_, i) => i + 1) : [];
  return (
    <div className="f2-demo">
      <div className="f2-row">
        <Shape2D
          spec={block.mode === 'turn' && shown >= 1 ? { ...block.spec, rotate: (block.spec.rotate ?? 0) + 30 } : block.spec}
          size={180}
          markSides={block.mode === 'sides'}
          markCorners={block.mode === 'corners'}
          litSides={litSides}
          litCorners={litCorners}
          label={`${FLAT_NAME[shapeGroup(block.spec)]}: ${sides} გვერდი, ${corners} კუთხე`}
        />
        {block.contrast && shown >= 1 && <Shape2D spec={block.contrast} size={140} label={FLAT_NAME[shapeGroup(block.contrast)]} />}
      </div>
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

// ═══════════════════════════ the routers ═══════════════════════════

export function ExploreToolViewClock({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'clock-lab':
      return <ClockLab tool={tool} />;
    case 'time-set-lab':
      return <TimeSetLab tool={tool} />;
    case 'time-match-lab':
      return <TimeMatchLab tool={tool} />;
    case 'five-minute-lab':
      return <FiveMinuteLab tool={tool} />;
    default:
      return null;
  }
}

export function ExploreToolViewShapes2D({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'flat-lab':
      return <FlatLab tool={tool} />;
    case 'room-lab':
      return <RoomLab tool={tool} />;
    default:
      return null;
  }
}

// ═══════════════════════════ small helpers ═══════════════════════════

/** The angle facts the five-minute lesson builds on. */
export const angleFacts = (time: ClockTime) => ({
  hour: Math.round(hourAngle(time) * 10) / 10,
  minute: Math.round(minuteAngle(time.m) * 10) / 10,
});

/** A shape named with its property, for a prompt. */
export const flatText = (spec: FlatSpec): string => `${FLAT_NAME[shapeGroup(spec)]} (${sidesOf(spec)} გვერდი)`;

/** An everyday object's shape, for the room tool. */
export const roomTarget = (kind: Flat): string => FLAT_NAME[kind];

/** Re-export so the player and tests can read the five-minute words. */
export { tapWordsText };
