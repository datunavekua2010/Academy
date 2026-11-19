import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { MoneyPiece, MoneyPurse, PricePicture, WaysPicture } from './MoneyBoard';
import {
  canAfford,
  changeFrom,
  changePieces,
  fewestPieces,
  minPieces,
  moneyText,
  pieceText,
  totalOf,
  waysToMake,
} from './MoneyGeometry';

/**
 * Exploration labs and demonstrations for G2 U09.
 *
 * The purse's total is always the sum of the pieces that are in it, and the change is always paid minus cost — the
 * lab says the arithmetic it is doing rather than showing a number beside a picture.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

/** Build a purse from a tray and watch the total grow. */
export function MoneyLab({ tool }: { tool: ToolOf<'money-lab'> }) {
  const [picked, setPicked] = useState<number[]>([]);
  const total = totalOf(picked);
  const target = tool.target;
  const reached = target !== undefined && total === target;
  return (
    <div className="lab lab-money">
      <MoneyPurse pieces={picked} showTotal label="შენი პარკუჭი" />
      <ul className="mnyb-tray">
        {tool.tray.map((v) => (
          <li key={v}>
            <button type="button" className="mnyb-take" onClick={() => setPicked((all) => [...all, v])} aria-label={`დაამატე ${pieceText(v)}`}>
              <MoneyPiece value={v} />
            </button>
          </li>
        ))}
      </ul>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setPicked((all) => all.slice(0, -1))} aria-label="აიღე ბოლო ნაჭერი">
          ← უკან
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPicked([])}>
          ↻ გასუფთავება
        </button>
        {target !== undefined && (
          <button type="button" className="btn btn-primary" onClick={() => setPicked(fewestPieces(target))}>
            ყველაზე ცოტა ნაჭრით
          </button>
        )}
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {picked.length === 0
          ? 'პარკუჭი ცარიელია. დააჭირე ფულს.'
          : reached
            ? `${total} თეთრი — ზუსტად ${moneyText(total)}!`
            : `${picked.length} ნაჭერი: ${picked.join(' + ')} = ${total} თეთრი (${moneyText(total)}).`}
      </p>
      <p className="lab-facts">
        <span>ნაჭრები: {picked.length}</span>
        <span>სულ: {moneyText(total)}</span>
        {target !== undefined && <span>მიზანი: {moneyText(target)}</span>}
      </p>
    </div>
  );
}

/** Every way to make an amount, fewest first — the same amount in different pieces. */
export function WayLab({ tool }: { tool: ToolOf<'way-lab'> }) {
  const [which, setWhich] = useState(0);
  const amount = tool.amounts[which] ?? tool.amounts[0];
  const ways = waysToMake(amount);
  return (
    <div className="lab lab-ways">
      <div className="xt-modes" role="group" aria-label="თანხა">
        {tool.amounts.map((a, i) => (
          <button key={a} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {moneyText(a)}
          </button>
        ))}
      </div>
      <WaysPicture ways={ways} caption={`${moneyText(amount)} — ${ways.length} გზა`} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${moneyText(amount)} შეიძლება ${ways.length} გზით: ყველაზე ცოტა ${minPieces(amount)} ნაჭერი, ყველაზე მეტი ${ways[ways.length - 1]?.length ?? 0} ნაჭერი.`}
      </p>
      <p className="lab-facts">
        <span>გზები: {ways.length}</span>
        <span>ყველაზე ცოტა: {ways[0]?.map(pieceText).join(' + ')}</span>
      </p>
    </div>
  );
}

/** A purse and a price: move money in and watch the change. */
export function ChangeLab({ tool }: { tool: ToolOf<'change-lab'> }) {
  const [which, setWhich] = useState(0);
  const pair = tool.pairs[which] ?? tool.pairs[0];
  const enough = canAfford(pair.paid, pair.cost);
  const change = enough ? changeFrom(pair.paid, pair.cost) : 0;
  return (
    <div className="lab lab-change">
      <div className="xt-modes" role="group" aria-label="ყიდვა">
        {tool.pairs.map((_, i) => (
          <button key={i} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {i + 1}
          </button>
        ))}
      </div>
      <PricePicture cost={pair.cost} money={pair.paid} />
      <MoneyPurse pieces={enough && change > 0 ? changePieces(pair.paid, pair.cost) : []} showTotal={change > 0} caption={enough ? 'ხურდა' : 'ხურდა არ არის'} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {enough ? `${pair.paid} − ${pair.cost} = ${change} თეთრი — ხურდა ${moneyText(change)}.` : `${pair.cost} − ${pair.paid} = ${pair.cost - pair.paid} თეთრი აკლია.`}
      </p>
      <p className="lab-facts">
        <span>ფული: {moneyText(pair.paid)}</span>
        <span>ფასი: {moneyText(pair.cost)}</span>
        <span>საკმარისია: {enough ? 'კი' : 'არა'}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** A purse arranged for counting and added up piece by piece. */
export function MoneyDemo({ block }: { block: Extract<ExplainBlock, { type: 'money-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const shown = Math.min(frame, block.steps.length - 1);
  const pieces = block.mode === 'total' ? block.pieces.slice(0, Math.max(1, Math.ceil((block.pieces.length * (shown + 1)) / block.steps.length))) : block.pieces;
  const total = totalOf(pieces);
  return (
    <figure className="demo demo-money">
      <span className="demo-badge">{block.mode === 'total' ? 'დათვლა' : block.mode === 'make' ? 'შედგენა' : 'ხურდა'}</span>
      {block.mode === 'change' && block.paid !== undefined && block.cost !== undefined ? (
        <PricePicture cost={block.cost} money={block.paid} />
      ) : (
        <MoneyPurse pieces={pieces} showTotal running={block.mode === 'total'} />
      )}
      <p className="demo-rule">
        {block.mode === 'total'
          ? `${pieces.join(' + ') || 0} = ${total} თეთრი`
          : block.mode === 'make'
            ? `${moneyText(block.target ?? total)}: ${fewestPieces(block.target ?? total).map(pieceText).join(' + ') || '0'}`
            : `${block.paid ?? 0} − ${block.cost ?? 0} = ${Math.max(0, (block.paid ?? 0) - (block.cost ?? 0))} თეთრი`}
      </p>
      <p className="demo-cap">{block.steps[shown]}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The ways of making an amount as a fact sentence, for the lessons' explanations. */
export const waysFact = (amount: number): string => `${moneyText(amount)} — ${waysToMake(amount).length} გზა`;
