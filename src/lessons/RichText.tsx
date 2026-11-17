import { Fragment, type ReactNode } from 'react';

/**
 * Renders lesson text. `$…$` marks inline maths; everything else is plain text.
 * Inside maths: `^2` becomes a superscript, `-` a proper minus, `\cdot` a dot.
 * No HTML is ever interpreted, so lesson data cannot inject markup.
 */

function renderMath(source: string): ReactNode[] {
  const cleaned = source.replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/ - /g, ' − ').replace(/(^|\s)-(?=\S)/g, '$1−');
  const parts = cleaned.split(/(\^\d+)/);
  return parts.map((part, i) =>
    /^\^\d+$/.test(part) ? (
      <sup key={i}>{part.slice(1)}</sup>
    ) : (
      // variables are italic, numbers and operators upright
      <Fragment key={i}>{part.split(/([a-zA-Z]+)/).map((piece, k) => (k % 2 === 1 ? <i key={k}>{piece}</i> : piece))}</Fragment>
    ),
  );
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const segments = text.split('$');
  return (
    <span className={className}>
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <span key={i} className="lp-math">
            {renderMath(segment)}
          </span>
        ) : (
          <Fragment key={i}>{segment}</Fragment>
        ),
      )}
    </span>
  );
}

/** Plain-text version (for aria-labels): maths markers removed. */
export const plainText = (text: string): string => text.replace(/\$/g, '').replace(/\^2/g, ' კვადრატში').replace(/\\cdot/g, '·');
