import type { ReactNode } from 'react';
import type { Cell, GridPicture, MirrorLine } from '../types';
import { lineName, sameCells } from './SymmetryGeometry';

/**
 * Answer controls for G2 U10.4–U10.5: which picture is the real reflection, and which cells complete a pattern.
 *
 * The reflection is decided by `isReflectionOf` in `check.ts`, so an option that is only the source slid sideways can
 * never pass as a flip.
 */

/** Choose the picture that is the true reflection of `source` across `line`. */
export function FlipPickAnswer({
  source,
  line,
  options,
  value,
  onChange,
  disabled,
  label,
  render,
}: {
  source: Cell[];
  line: MirrorLine;
  options: Array<{ id: string; cells: Cell[] }>;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
  render: (cells: Cell[]) => ReactNode;
}) {
  return (
    <div className="symp" role="group" aria-label={label}>
      <ul className="symp-list">
        {options.map((option) => (
          <li key={option.id}>
            <button type="button" className={`symp-opt ${value === option.id ? 'is-on' : ''}`} aria-pressed={value === option.id} disabled={disabled} onClick={() => onChange(option.id)}>
              {render(option.cells)}
              <span className="symp-tag">{option.id.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="symp-note" aria-live="polite">
        {value === ''
          ? `აირჩიე ფიგურა, რომელიც ${lineName(line)} სარკეში იგივე ფიგურას იძლევა.`
          : options.find((o) => o.id === value) && sameCells(options.find((o) => o.id === value)!.cells, source)
            ? 'ეს ფიგურა მხოლოდ გადატანილია — არეკვლა ორიენტაციას ცვლის.'
            : 'არჩეულია ერთი ფიგურა.'}
      </p>
    </div>
  );
}

/** A grid picture built from a cell list, for a board that only holds cells. */
export const pictureOf = (cells: Cell[], width: number, height: number): GridPicture => ({ width, height, cells });
