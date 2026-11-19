import { useState } from 'react';
import { NumberLine } from './NumberLine';
import { estimateCalculation, roundingInterval } from './RoundingGeometry';
import { DemoButtons, useStepper } from './Visuals';
import type { ExplainBlock, ExploreTool } from '../types';

type RoundingTool = Extract<ExploreTool, { tool: 'rounding-lab' }>;

/** Exploration is ungraded: markers can be dragged or adjusted using the keyboard. */
export function RoundingLab({ tool }: { tool: RoundingTool }) {
  const [index, setIndex] = useState(0);
  const [marker, setMarker] = useState<number | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [estimateChoice, setEstimateChoice] = useState<number | null>(null);
  const [reasonable, setReasonable] = useState<boolean | null>(null);
  const example = tool.examples[index];
  const interval = roundingInterval(example.number, tool.place);
  const lineValue = marker ?? interval.lower;
  const located = marker === example.number;
  const calc = example.other === undefined ? null : estimateCalculation(example.number, example.other, example.op ?? '+', tool.place);
  const pickExample = (i: number) => { setIndex(i); setMarker(null); setChoice(null); setSecondChoice(null); setEstimateChoice(null); setReasonable(null); setReveal(false); };
  return <section className="round-lab" aria-label="დამრგვალების კვლევა">
    <div className="xt-modes">{tool.examples.map((e, i) => <button type="button" key={i} className={`xt-mode ${index === i ? 'is-on' : ''}`} aria-pressed={index === i} onClick={() => pickExample(i)}>{e.number}{e.other === undefined ? '' : ` ${e.op ?? '+'} ${e.other}`}</button>)}</div>
    <p>{tool.mode === 'context' ? `წიგნების რაოდენობაა ${example.number}. რომელი მიახლოებითი რაოდენობაა გონივრული?`  : `მოათავსე ${example.number} რიცხვით წრფეზე, შემდეგ აირჩიე უახლოესი ${tool.place === 10 ? 'ათეული' : 'ასეული'}.`}</p>
    <NumberLine min={interval.lower} max={interval.upper} value={choice === interval.rounded ? interval.rounded : lineValue} onChange={(n) => { setMarker(n); setChoice(null); setSecondChoice(null); setEstimateChoice(null); setReveal(false); }} labelled={[interval.lower, interval.midpoint, interval.upper]} pins={[{ value: interval.midpoint, label: 'შუა' }]} arrows showValue ariaLabel="დამრგვალების წრფე" />
    <p aria-live="polite">{marker === null ? 'გადაადგილე მარკერი ან გამოიყენე ისრები.' : located ? `${example.number} სწორ ადგილასაა.` : `მარკერი ${marker}-ზეა; მოძებნე ${example.number}.`}</p>
    <div className="xt-row">{(tool.mode === 'context' ? [interval.lower, interval.upper, interval.upper * 10] : [interval.lower, interval.upper]).map((n) => <button key={n} type="button" className="btn btn-ghost" disabled={!located} aria-pressed={choice === n} onClick={() => { setChoice(n); setReveal(false); }}>{n}</button>)}</div>
    {choice !== null && <p role="status">{choice === interval.rounded ? 'სწორია!' : tool.mode === 'context' ? `სცადე ისევ: ${choice} მოცემულ რაოდენობას არ უახლოვდება ისე, როგორც უახლოესი ასეული.` : 'სცადე ისევ.'} დაშორება {interval.lower}-მდე: {interval.down}; {interval.upper}-მდე: {interval.up}. {example.number === interval.midpoint ? 'შუაში მდგომი რიცხვი ზემოთ მრგვალდება.' : `შუა წერტილია ${interval.midpoint}.`}</p>}
    {calc && choice === interval.rounded && <div>
      <p>ახლა დაამრგვალე {example.other}:</p>
      {[roundingInterval(example.other!, tool.place).lower, roundingInterval(example.other!, tool.place).upper].map(n => <button type="button" key={n} aria-pressed={secondChoice === n} onClick={() => { setSecondChoice(n); setEstimateChoice(null); setReveal(false); }}>{n}</button>)}
      {secondChoice !== null && <p role="status">{secondChoice === calc.roundedB ? 'სწორია.' : 'სცადე მეორე ასეული.'}</p>}
      {secondChoice === calc.roundedB && <><p>აირჩიე {calc.roundedA} {example.op} {calc.roundedB}-ის შეფასება:</p>
        {[calc.estimate, calc.estimate + 100, calc.estimate - 100].map(n => <button type="button" key={n} aria-pressed={estimateChoice === n} onClick={() => { setEstimateChoice(n); setReveal(false); }}>{n}</button>)}
        {estimateChoice !== null && <p role="status">{estimateChoice === calc.estimate ? 'სწორია.' : 'ხელახლა შეასრულე მოქმედება.'}</p>}
        {estimateChoice === calc.estimate && <><button type="button" onClick={() => setReveal(true)}>ზუსტი პასუხის ნახვა</button>{reveal && <><p>ზუსტი: {calc.exact}; მიახლოებითი: {calc.estimate}. სხვაობა: {Math.abs(calc.exact - calc.estimate)}.</p><p>გონივრულია შეფასება?</p><button type="button" aria-pressed={reasonable === true} onClick={() => setReasonable(true)}>დიახ</button><button type="button" aria-pressed={reasonable === false} onClick={() => setReasonable(false)}>არა</button>{reasonable !== null && <p role="status">{reasonable ? 'დიახ: შეფასება ზუსტ პასუხთან ახლოსაა.' : 'შეადარე სხვაობა მთლიან შედეგს: შეფასება ახლოსაა.'}</p>}</>}</>}
      </>}
    </div>}
  </section>;
}

export function RoundingDemo({ block }: { block: Extract<ExplainBlock, { type: 'rounding-demo' }> }) {
  const { frame, done, replay, step } = useStepper(4);
  const x = roundingInterval(block.number, block.place);
  return <figure className="round-demo"><NumberLine min={x.lower} max={x.upper} value={frame >= 3 ? x.rounded : block.number} labelled={[x.lower, x.midpoint, x.upper]} pins={[{ value: x.midpoint, label: 'შუა' }]} ariaLabel="დამრგვალების მაგალითი" />
    <figcaption>{[`${block.number} მდებარეობს ${x.lower}-სა და ${x.upper}-ს შორის.`, `შუა წერტილია ${x.midpoint}.`, `დაშორებებია ${x.down} და ${x.up}.`, `${block.number} ≈ ${x.rounded}. შუა წერტილი მაღლა მრგვალდება.`][frame]}</figcaption><DemoButtons done={done} replay={replay} step={step} /></figure>;
}
