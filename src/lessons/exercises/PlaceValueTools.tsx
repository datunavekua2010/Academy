import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import {
  PLACES,
  PLACE_NAME,
  PLACE_PLURAL,
  PLACE_WORTH,
  blocksText,
  digitsOf,
  exchangeable,
  exchangeRule,
  expandedShortText,
  expandedText,
  isStandard,
  partsOf,
  placeUp,
  regroup,
  valueOfBlocks,
  type DigitCounts,
  type Place,
} from './PlaceValueGeometry';
import { BuildMat, ExpandedCards, ExpandedLine, ExpandedPanel, PlaceBlocks, PlaceCards, RegroupDemo, countsText, parseCounts } from './PlaceValueBoard';
import { useStepper } from './Visuals';

/**
 * Exploration labs and step-by-step demonstrations for G2 U01. Every lab reports the value it is showing, computed from
 * its own blocks, so nothing on screen can drift away from the number it claims to be.
 */

// ─────────────────────────── the block lab ───────────────────────────

/** Put blocks on the mat, read the value back, and exchange ten of a place for one of the next. */
export function PlaceLab({ tool }: { tool: Extract<ExploreTool, { tool: 'place-lab' }> }) {
  const start = tool.start ?? { hundreds: 1, tens: 2, ones: 5 };
  const [counts, setCounts] = useState<DigitCounts>(start);
  const max = tool.max ?? 12;
  const value = valueOfBlocks(counts);
  const standard = isStandard(counts);
  const canExchange = exchangeable(counts);
  return (
    <div className="lab lab-place">
      <BuildMat counts={counts} onChange={setCounts} label="ადგილობრივი ღირებულების დაფა" max={max} allowRegroup={tool.allowRegroup !== false} />
      <div className="lab-place-read">
        <PlaceBlocks counts={counts} size={40} label="დაფაზე დადებული ბლოკები" showValue={false} />
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {value === 0
          ? 'დააწყვე ბლოკები და ნახე, რა რიცხვი გამოდის.'
          : standard
            ? `✓ სტანდარტული სახე: ${blocksText(counts)} = ${value}. თითოეულ ადგილზე 9-ზე მეტი არ არის.`
            : `ჯერ დაუჯგუფებელია: ${blocksText(counts)} = ${value}. ${canExchange.map((x) => `10 ${PLACE_PLURAL[x.place]} = 1 ${PLACE_NAME[placeUp(x.place) ?? x.place]}`).join(', ')}.`}
      </p>
      <p className="lab-facts">
        <span>ასეულები: {counts.hundreds}</span>
        <span>ათეულები: {counts.tens}</span>
        <span>ერთეულები: {counts.ones}</span>
        <span>სულ: {value}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the digit lab ───────────────────────────

/** Pick a number, tap one of its digits, and see the place it sits in and what it is worth. */
export function DigitLab({ tool }: { tool: Extract<ExploreTool, { tool: 'digit-lab' }> }) {
  const numbers = tool.numbers.length > 0 ? tool.numbers : [345];
  const [index, setIndex] = useState(0);
  const [place, setPlace] = useState<Place | null>(null);
  const value = numbers[index] ?? numbers[0];
  const digits = digitsOf(value);
  const chosen = place ? { digit: digits[place], worth: digits[place] * PLACE_WORTH[place] } : null;
  return (
    <div className="lab lab-digit">
      <div className="lab-head" role="radiogroup" aria-label="აირჩიე რიცხვი">
        {numbers.map((n, i) => (
          <label key={n} className={`twopan-side ${i === index ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="digit-lab-number"
              value={n}
              checked={i === index}
              onChange={() => {
                setIndex(i);
                setPlace(null);
              }}
            />
            {n}
          </label>
        ))}
      </div>
      <PlaceCards value={value} onTap={(p) => setPlace(p)} active={place} label="რიცხვის ციფრები" />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!chosen
          ? 'შეეხე ერთ ციფრს და ნახე, რა ღირს ის ამ ადგილზე.'
          : `${PLACE_NAME[place ?? 'ones']}ის ადგილზე დგას ციფრი ${chosen.digit}, რომლის ღირებულებაც ${chosen.worth}-ია (${chosen.digit} × ${PLACE_WORTH[place ?? 'ones']}).`}
      </p>
      <p className="lab-facts">
        {PLACES.map((p) => (
          <span key={p}>
            {PLACE_NAME[p]}: {digits[p]} → {digits[p] * PLACE_WORTH[p]}
          </span>
        ))}
      </p>
    </div>
  );
}

// ─────────────────────────── the expanded-form lab ───────────────────────────

/** Split a number into its cards, then put them back; the sum updates as the cards go in. */
export function ExpandedLab({ tool }: { tool: Extract<ExploreTool, { tool: 'expanded-lab' }> }) {
  const numbers = tool.numbers.length > 0 ? tool.numbers : [345];
  const [index, setIndex] = useState(0);
  const value = numbers[index] ?? numbers[0];
  const cards = [...new Set(partsOf(value).flatMap((p) => [p.value, p.value === 0 ? 0 : p.digit]))].sort((a, b) => b - a);
  const [slots, setSlots] = useState<string[]>(['', '', '']);
  return (
    <div className="lab lab-expanded">
      <div className="lab-head" role="radiogroup" aria-label="აირჩიე რიცხვი">
        {numbers.map((n, i) => (
          <label key={n} className={`twopan-side ${i === index ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="expanded-lab-number"
              value={n}
              checked={i === index}
              onChange={() => {
                setIndex(i);
                setSlots(['', '', '']);
              }}
            />
            {n}
          </label>
        ))}
      </div>
      <PlaceCards value={value} label="რიცხვი" />
      <ExpandedCards
        value={value}
        cards={cards}
        slots={slots}
        onChange={setSlots}
        label="გაშლილი ფორმის ბარათები"
      />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {slots.every(Boolean)
          ? slots.reduce((sum, x) => sum + Number(x), 0) === value
            ? `✓ ${slots.join(' + ')} = ${value}. აი, ასე იწერება რიცხვი გაშლილი სახით.`
            : `ჯამი ${slots.reduce((sum, x) => sum + Number(x), 0)}, საჭიროა ${value}.`
          : `გაშლილი სახე: ${expandedText(value)}. დაალაგე ბარათები.`}
      </p>
      <p className="lab-facts">
        <span>გაშლილი: {expandedText(value)}</span>
        <span>მოკლე: {expandedShortText(value)}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the missing-place lab ───────────────────────────

/** Hide one place, read the two that remain, and check the value that would fill the gap. */
export function MissingPlaceLab({ tool }: { tool: Extract<ExploreTool, { tool: 'missing-place-lab' }> }) {
  const numbers = tool.numbers.length > 0 ? tool.numbers : [345];
  const places = tool.places.length > 0 ? tool.places : (['tens'] as Place[]);
  const [nIndex, setNIndex] = useState(0);
  const [pIndex, setPIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const value = numbers[nIndex] ?? numbers[0];
  const missing = places[pIndex] ?? places[0];
  const answer = digitsOf(value)[missing] * PLACE_WORTH[missing];
  const shown = PLACES.filter((p) => p !== missing);
  const sum = shown.reduce((s, p) => s + digitsOf(value)[p] * PLACE_WORTH[p], 0);
  const typedNumber = Number(typed);
  const filled = typed.trim() !== '' && Number.isFinite(typedNumber);
  return (
    <div className="lab lab-missing">
      <div className="lab-head">
        <div role="radiogroup" aria-label="აირჩიე რიცხვი" className="lab-head">
          {numbers.map((n, i) => (
            <label key={n} className={`twopan-side ${i === nIndex ? 'is-on' : ''}`}>
              <input
                type="radio"
                name="missing-lab-number"
                value={n}
                checked={i === nIndex}
                onChange={() => {
                  setNIndex(i);
                  setTyped('');
                }}
              />
              {n}
            </label>
          ))}
        </div>
      </div>
      <div className="lab-head" role="radiogroup" aria-label="რომელი ადგილი დავმალო">
        {places.map((p, i) => (
          <label key={p} className={`twopan-side ${i === pIndex ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="missing-lab-place"
              value={p}
              checked={i === pIndex}
              onChange={() => {
                setPIndex(i);
                setTyped('');
              }}
            />
            {PLACE_NAME[p]}
          </label>
        ))}
      </div>
      <PlaceCards value={value} hide={missing} label="დაფარული რიცხვი" />
      <ExpandedLine value={value} hide={missing} label={`გაშლილი სახე, ${PLACE_NAME[missing]} დაფარულია`} />
      <label className="pma-input">
        <span>რა ღირს დაფარული ადგილი?</span>
        <input type="text" inputMode="numeric" value={typed} aria-label="დაფარული ადგილის მნიშვნელობა" onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ''))} />
      </label>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!filled
          ? `ნაჩვენები ნაწილების ჯამია ${sum}, მთელი რიცხვი — ${value}. მოძებნე დაფარული ნაწილი.`
          : typedNumber === answer
            ? `✓ სწორია: ${sum} + ${answer} = ${value}.`
            : `ჯერ არ არის: ${sum} + ${typedNumber} = ${sum + typedNumber}, საჭიროა ${value}.`}
      </p>
      <p className="lab-facts">
        <span>
          ნაჩვენები: {shown.map((p) => `${PLACE_NAME[p]} ${digitsOf(value)[p]}`).join(', ')}
        </span>
      </p>
    </div>
  );
}

// ─────────────────────────── explaining: the step demos ───────────────────────────

type DemoBlock = Extract<ExplainBlock, { type: 'place-demo' }>;

/**
 * A four-step place-value story. The picture is drawn from the number each step, so the last step is always the number
 * the story is about.
 */
export function PlaceDemo({ block }: { block: DemoBlock }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const value = block.value;
  const digits = digitsOf(value);
  const place = block.place ?? 'tens';
  return (
    <figure className="demo demo-place">
      <span className="demo-badge">{DEMO_BADGE[block.mode]}</span>
      <div className="demo-place-body">{renderFrame(block.mode, value, place, frame, digits)}</div>
      <p className="demo-step" role="status" aria-live="polite">
        <span className="demo-step-num">
          ნაბიჯი {frame + 1} / {block.steps.length}
        </span>
        {block.steps[frame]}
      </p>
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={replay}>
          ↻ ხელახლა
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={step} disabled={done}>
          შემდეგი ნაბიჯი
        </button>
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

const DEMO_BADGE: Record<DemoBlock['mode'], string> = {
  regroup: 'გაერთიანება: 10 → 1',
  expand: 'გაშლილი სახე',
  digit: 'ციფრი და მისი ადგილი',
  build: 'რიცხვის აწყობა',
};

function renderFrame(mode: DemoBlock['mode'], value: number, place: Place, frame: number, digits: DigitCounts) {
  if (mode === 'regroup') {
    // step 0: ten ones; step 1: the ten ones named; step 2: exchanged for one ten; step 3: the value unchanged
    const tenOnes: DigitCounts = { hundreds: 0, tens: 0, ones: 10 };
    const oneTen: DigitCounts = { hundreds: 0, tens: 1, ones: 0 };
    // the last frame is the whole number in standard form, so the story ends on the number it is about
    const counts =
      frame <= 1 ? tenOnes : frame === 2 ? oneTen : value >= 100 ? digitsOf(value) : { hundreds: 0, tens: Math.floor(value / 10) || 1, ones: value % 10 };
    const rule = exchangeRule('ones');
    return (
      <div className="demo-place-stack">
        <PlaceBlocks counts={counts} size={40} label={frame >= 2 ? 'ერთი ათეული' : 'ათი ერთეული'} animateKey={frame} />
        <p className="demo-place-rule">{frame >= 2 ? `${rule.ten} = ${rule.one}` : 'ითვლი ერთეულებს: 1, 2, 3 … 10'}</p>
      </div>
    );
  }
  if (mode === 'expand') {
    return (
      <div className="demo-place-stack">
        <PlaceBlocks counts={digits} size={40} label="ბლოკები" animateKey={frame} />
        {frame >= 1 && <PlaceCards value={value} label="ციფრები" />}
        {frame >= 2 && <ExpandedLine value={value} />}
        {frame >= 3 && <p className="demo-place-rule">= {value} — სტანდარტული ჩანაწერი</p>}
      </div>
    );
  }
  if (mode === 'digit') {
    const shown = frame >= 1 ? place : null;
    return (
      <div className="demo-place-stack">
        <PlaceCards value={value} active={shown} label="ციფრები" />
        {shown && (
          <p className="demo-place-rule">
            {PLACE_NAME[shown]}: ციფრი {digits[shown]}, ღირებულება {digits[shown] * PLACE_WORTH[shown]} ({digits[shown]} × {PLACE_WORTH[shown]})
          </p>
        )}
        {frame >= 2 && <ExpandedLine value={value} />}
      </div>
    );
  }
  // build: the target, then hundreds, then tens and ones, then the number
  const built: DigitCounts = frame <= 0 ? { hundreds: 0, tens: 0, ones: 0 } : frame === 1 ? { hundreds: digits.hundreds, tens: 0, ones: 0 } : digits;
  return (
    <div className="demo-place-stack">
      <p className="demo-place-target">
        სამიზნე: <strong>{value}</strong>
      </p>
      <PlaceBlocks counts={built} size={40} label="ნაგები რიცხვი" animateKey={frame} />
      {frame >= 3 && <PlaceCards value={value} label="შედეგი" />}
    </div>
  );
}

/** A number split into its cards and joined back, using the same lab the explore step uses. */
export function ExpandedDemo({ block }: { block: Extract<ExplainBlock, { type: 'place-blocks' }> }) {
  const value = block.hundreds * 100 + block.tens * 10 + block.ones;
  return (
    <figure className="demo demo-expanded">
      <PlaceBlocks counts={{ hundreds: block.hundreds, tens: block.tens, ones: block.ones }} size={44} label="ბლოკები" />
      <ExpandedPanel value={value} />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

/** Re-exported for the lessons' explore steps. */
export { BuildMat, ExpandedCards, PlaceBlocks, PlaceCards, RegroupDemo, countsText, parseCounts, regroup };
