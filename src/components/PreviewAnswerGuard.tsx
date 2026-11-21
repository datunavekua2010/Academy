import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { Link } from '../router';

/** Keep answer controls visible to visitors, but intercept attempts to use them. */
export function PreviewAnswerGuard({ preview, children }: { preview: boolean; children: ReactNode }) {
  const [notice, setNotice] = useState(false);
  const block = (event: SyntheticEvent) => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
    setNotice(true);
  };
  return (
    <>
      <div
        onClickCapture={block}
        onPointerDownCapture={(event) => {
          // Some picture widgets change answers on pointer-down, not click.
          if (preview && (event.target as Element).closest('svg, canvas, [draggable="true"]')) block(event);
        }}
        onKeyDownCapture={(event) => {
          if (event.key !== 'Tab' && !['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) block(event);
        }}
        onFocusCapture={(event) => {
          if (!preview) return;
          const target = event.target;
          if (target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && ['text', 'number', 'tel', 'search', ''].includes(target.type))) {
            target.readOnly = true;
            target.setAttribute('aria-readonly', 'true');
          }
        }}
        onBeforeInputCapture={block}
        onInputCapture={block}
        onChangeCapture={block}
        onSubmitCapture={block}
        onPasteCapture={block}
        onDropCapture={block}
        onDragStartCapture={block}
      >
        {children}
      </div>
      {preview && notice && (
        <p className="guest-answer-notice" role="status">
          ანგარიშში არ ხარ შესული. პასუხის გასაცემად <Link to="/student">შედი აკადემიის ანგარიშით</Link> ან დაუკავშირდი აკადემიას.
        </p>
      )}
    </>
  );
}
