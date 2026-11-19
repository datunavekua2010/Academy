import { useState } from 'react';
import type { Cell, GridPicture, MirrorLine } from '../types';
import type { ExplainBlock, ExploreTool } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { GridBoard, PictureBoard, SymmetryFillAnswer, candidateLines } from './SymmetryBoard';
import {
  boundsOf,
  cellKey,
  flipHorizontal,
  flipVertical,
  isSymmetricAbout,
  lineName,
  linesOfSymmetry,
  middleHorizontal,
  middleVertical,
  missingForSymmetry,
  nextItem,
  reflectCells,
  rowOf,
  tidy,
} from './SymmetryGeometry';

/**
 * Exploration labs and demonstrations for G2 U10.
 *
 * Every "is it symmetric?" statement here comes from reflecting the cells, so the picture and the claim can never
 * disagree. A line that only looks like a mirror is not reported as one.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────────────────── sliding a mirror ───────────────────────────

/** Slide a mirror line across a picture and watch the reflection appear or miss. */
export function MirrorLab({ tool }: { tool: ToolOf<'mirror-lab'> }) {
  const [which, setWhich] = useState(0);
  const [axis, setAxis] = useState<'vertical' | 'horizontal'>('vertical');
  const [at, setAt] = useState<number | null>(null);
  const picture = tool.pictures[which] ?? tool.pictures[0];
  // the default line is the picture's own middle: down the middle column of an odd grid, between the two of an even one
  const middle = axis === 'vertical' ? middleVertical(picture.width) : middleHorizontal(picture.height);
  const line: MirrorLine = { axis, at: at ?? middle.at };
  const symmetric = isSymmetricAbout(picture.cells, line);
  const missing = missingForSymmetry(picture.cells, line).length;
  const lines = linesOfSymmetry(picture.cells);
  return (
    <div className="lab lab-mirror">
      <div className="xt-modes" role="group" aria-label="სარკის მიმართულება">
        <button type="button" className={`xt-mode ${axis === 'vertical' ? 'is-on' : ''}`} aria-pressed={axis === 'vertical'} onClick={() => { setAxis('vertical'); setAt(null); }}>
          ვერტიკალური
        </button>
        <button type="button" className={`xt-mode ${axis === 'horizontal' ? 'is-on' : ''}`} aria-pressed={axis === 'horizontal'} onClick={() => { setAxis('horizontal'); setAt(null); }}>
          ჰორიზონტალური
        </button>
      </div>
      <GridBoard picture={picture} line={line} ghost label="ფიგურა და სარკის ხაზი" />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setAt(Math.max(0, line.at - 1))} aria-label="სარკის ხაზი მარცხნივ">
          ← გადაადგილე
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setAt(line.at + 1)} aria-label="სარკის ხაზი მარჯვნივ">
          გადაადგილე →
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setAt(null)}>
          ↻ შუაზე
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {symmetric ? `${lineName(line)} ხაზი ნამდვილი სარკის ხაზია: ფიგურა თავის თავზე დადის.` : `ეს ხაზი სარკის ხაზი არ არის: ${missing} უჯრას წყვილი არ აქვს.`}
      </p>
      <p className="lab-facts">
        <span>სარკის ხაზები: {lines.length}</span>
        <span>უჯრები: {picture.cells.length}</span>
      </p>
      {tool.pictures.length > 1 && (
        <div className="xt-row">
          {tool.pictures.map((_, i) => (
            <button key={i} type="button" className={`btn ${i === which ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
              ფიგურა {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── completing a picture ───────────────────────────

/** Complete a picture across its mirror line, cell by cell. */
export function SymmetryLab({ tool }: { tool: ToolOf<'symmetry-lab'> }) {
  const [which, setWhich] = useState(0);
  const [value, setValue] = useState('');
  const picture = tool.pictures[which] ?? tool.pictures[0];
  const shown: GridPicture = {
    ...picture,
    cells: tidy([
      ...picture.cells,
      ...(value === ''
        ? []
        : value.split(';').filter(Boolean).map((chunk) => {
            const [x, y] = chunk.split(',').map(Number);
            return { x, y };
          })),
    ]),
  };
  const missing = missingForSymmetry(picture.cells, tool.line).length;
  return (
    <div className="lab lab-symmetry">
      <SymmetryFillAnswer picture={picture} line={tool.line} value={value} onChange={setValue} disabled={false} label="შეავსე სარკულად" />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setValue('')}>
          ↻ გასუფთავება
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setValue(missingForSymmetry(picture.cells, tool.line).map(cellKey).join(';'))}>
          შეავსე ავტომატურად
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${lineName(tool.line)} ხაზს ${missing} უჯრა აკლია. ახლა შევსებულია ${shown.cells.length}.`}
      </p>
      {tool.pictures.length > 1 && (
        <div className="xt-row">
          {tool.pictures.map((_, i) => (
            <button key={i} type="button" className={`btn ${i === which ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={i === which} onClick={() => { setWhich(i); setValue(''); }}>
              ფიგურა {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── flips ───────────────────────────

/** Flip a shape across a mirror and compare the flip with a slide. */
export function FlipLab({ tool }: { tool: ToolOf<'flip-lab'> }) {
  const [mode, setMode] = useState<'vertical' | 'horizontal' | 'slide'>('vertical');
  const flipped = mode === 'vertical' ? flipVertical(tool.cells, tool.width) : mode === 'horizontal' ? flipHorizontal(tool.cells, tool.height) : tidy(tool.cells.map((c) => ({ x: c.x + 1, y: c.y })));
  const line = mode === 'vertical' ? middleVertical(tool.width) : mode === 'horizontal' ? middleHorizontal(tool.height) : undefined;
  return (
    <div className="lab lab-flip">
      <div className="xt-modes" role="group" aria-label="რა ხდება">
        <button type="button" className={`xt-mode ${mode === 'vertical' ? 'is-on' : ''}`} aria-pressed={mode === 'vertical'} onClick={() => setMode('vertical')}>
          ვერტიკალური არეკვლა
        </button>
        <button type="button" className={`xt-mode ${mode === 'horizontal' ? 'is-on' : ''}`} aria-pressed={mode === 'horizontal'} onClick={() => setMode('horizontal')}>
          ჰორიზონტალური არეკვლა
        </button>
        <button type="button" className={`xt-mode ${mode === 'slide' ? 'is-on' : ''}`} aria-pressed={mode === 'slide'} onClick={() => setMode('slide')}>
          გადატანა
        </button>
      </div>
      <div className="flb-pair">
        <PictureBoard picture={{ width: tool.width, height: tool.height, cells: tool.cells }} caption="თავდაპირველი" />
        <span className="flb-arrow" aria-hidden="true">
          →
        </span>
        <PictureBoard picture={{ width: tool.width + 1, height: tool.height, cells: flipped }} line={line} caption={mode === 'slide' ? 'გადატანილი' : 'არეკლილი'} />
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {mode === 'slide'
          ? 'გადატანამ ფიგურა იგივე დატოვა, მხოლოდ ადგილი შეიცვალა — ორიენტაცია იგივეა.'
          : `${mode === 'vertical' ? 'ვერტიკალურმა' : 'ჰორიზონტალურმა'} არეკვლამ ფიგურა შებრუნებული: ორიენტაცია შეიცვალა.`}
      </p>
      <p className="lab-facts">
        <span>უჯრები: {tool.cells.length}</span>
        <span>არეკვლის უჯრები: {flipped.length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── repeating patterns ───────────────────────────

const SHAPE_GLYPH: Record<string, string> = { circle: '●', square: '■', triangle: '▲', rectangle: '▬', star: '★', heart: '♥' };

/** A repeating row of shapes to extend, and the block to find inside it. */
export function ShapePatternLab({ tool }: { tool: ToolOf<'pattern-shapes-lab'> }) {
  const [length, setLength] = useState(tool.length);
  const row = rowOf(tool.block, length);
  return (
    <div className="lab lab-shapepattern">
      <ul className="shp-row" aria-label="მეორადი ფიგურები">
        {row.map((item, i) => (
          <li key={i} className="shp-cell" aria-label={`${i + 1}-ე: ${item}`}>
            <span aria-hidden="true">{SHAPE_GLYPH[item] ?? item}</span>
          </li>
        ))}
        <li className="shp-cell is-next" aria-label={`შემდეგი: ${nextItem(tool.block, length)}`}>
          <span aria-hidden="true">{SHAPE_GLYPH[nextItem(tool.block, length)] ?? nextItem(tool.block, length)}</span>
        </li>
      </ul>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setLength((n) => n + 1)}>
          + ერთი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setLength(tool.length)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`გამეორებადი ბლოკი: ${tool.block.map((b) => SHAPE_GLYPH[b] ?? b).join(' ')} (${tool.block.length}). შემდეგია ${SHAPE_GLYPH[nextItem(tool.block, length)] ?? nextItem(tool.block, length)}.`}
      </p>
      <p className="lab-facts">
        <span>ბლოკი: {tool.block.length}</span>
        <span>სიგრძე: {length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** Fold along the mirror line, see the halves match, unfold; or flip a picture; or extend a pattern. */
export function SymmetryDemo({ block }: { block: Extract<ExplainBlock, { type: 'symmetry-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const shown = Math.min(frame, block.steps.length - 1);
  const line = block.line ?? middleVertical(block.picture.width);
  const symmetric = isSymmetricAbout(block.picture.cells, line);
  const mirrored = reflectCells(block.picture.cells, line);
  const latest = block.mode === 'pattern' && block.block ? rowOf(block.block, Math.min(block.length ?? block.block.length, shown + 1)) : null;
  return (
    <figure className="demo demo-symmetry">
      <span className="demo-badge">{block.mode === 'fold' ? 'კეცვა' : block.mode === 'flip' ? 'არეკვლა' : 'მეორადი'}</span>
      {latest ? (
        <ul className="shp-row" aria-label="მეორადი ფიგურები">
          {latest.map((item, i) => (
            <li key={i} className="shp-cell">
              <span aria-hidden="true">{SHAPE_GLYPH[item] ?? item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <GridBoard picture={block.picture} line={line} ghost={block.mode === 'flip' && shown > 0} label="ფიგურა" />
      )}
      <p className="demo-rule">
        {latest ? `ბლოკი: ${(block.block ?? []).join(' ')}` : symmetric ? `${lineName(line)} ხაზი ნამდვილი სარკის ხაზია` : `${lineName(line)} ხაზი სარკის ხაზი არ არის`}
      </p>
      {!latest && shown > 1 && (
        <p className="demo-cap">{`არეკვლილი უჯრები: ${mirrored.length} — ${symmetric ? 'იგივე' : 'სხვა'}`}</p>
      )}
      <p className="demo-cap">{block.steps[shown]}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A picture's own cells, tidy, for a board that wants a plain list. */
export const cellsOf = (cells: Cell[]): Cell[] => tidy(cells);

/** The candidate lines a lesson may offer for a picture. */
export const linesFor = (picture: GridPicture): MirrorLine[] => candidateLines(picture.width, picture.height);

/** The size a grid needs for a set of cells, plus one empty column on each side. */
export function gridFor(cells: Cell[]): GridPicture {
  const b = boundsOf(cells);
  if (!b) return { width: 3, height: 3, cells: [] };
  return { width: b.maxX + 2, height: b.maxY + 2, cells };
}
