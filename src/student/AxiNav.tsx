import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Mascot } from '../components/Mascot';
import { Link } from '../router';
import { STUDENT_NAV } from './navItems';

/**
 * Axi's radial navigation.
 *
 * The component is deliberately self-contained: it owns the open/closed state,
 * focus handling, Escape / outside-click dismissal and the bubble layout. The
 * dashboard (or any other student page) only has to render <AxiNav />.
 */

const ANGLES = [-90, -18, 54, 126, 198];

export function AxiNav() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    }
  };

  // Move focus into the menu when it opens (keyboard + screen-reader friendly).
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLAnchorElement>('.axi-bubble')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Escape closes; a pointer press outside the whole widget dismisses it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const handled = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!handled.includes(event.key)) return;

    const links = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>('.axi-bubble') ?? [],
    );
    if (links.length === 0) return;

    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next: number;

    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = current < 0 ? 0 : (current + 1) % links.length;
    } else {
      next = current < 0 ? links.length - 1 : (current - 1 + links.length) % links.length;
    }

    event.preventDefault();
    links[next]?.focus();
  };

  return (
    <div className={`axi-nav ${open ? 'is-open' : ''}`} ref={wrapperRef}>
      <div className="axi-stage">
        <div className="axi-halo" aria-hidden="true">
          <span className="axi-halo-ring" />
          <span className="axi-halo-dot halo-dot-one" />
          <span className="axi-halo-dot halo-dot-two" />
          <span className="axi-halo-dot halo-dot-three" />
        </div>

        <Mascot
          className="axi-nav-mascot"
          scale={1}
          thoughts={['აირჩიე სექცია']}
          waveOnMount={false}
          showThoughtBubble={false}
          onClick={() => setOpen((value) => !value)}
          buttonRef={triggerRef}
          buttonLabel={open ? 'Axi-ს ნავიგაციის დახურვა' : 'Axi-ს ნავიგაციის გახსნა'}
          ariaExpanded={open}
          ariaControls={open ? 'axi-nav-panel' : undefined}
        />

        {open && (
          <nav
            id="axi-nav-panel"
            ref={panelRef}
            className="axi-bubbles"
            aria-label="მოსწავლის სექციები"
            onKeyDown={onPanelKeyDown}
          >
            {STUDENT_NAV.map((item, index) => (
              <div
                className="axi-slot"
                key={item.key}
                style={{ '--angle': `${ANGLES[index]}deg`, '--i': index } as CSSProperties}
              >
                <Link
                  to={item.to}
                  className={`axi-bubble tone-${item.tone}`}
                  onClick={() => setOpen(false)}
                  aria-label={`${item.label} — ${item.description}`}
                >
                  <span className="axi-bubble-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="axi-bubble-text">
                    <span className="axi-bubble-label">{item.label}</span>
                    <span className="axi-bubble-desc">{item.description}</span>
                  </span>
                </Link>
              </div>
            ))}
          </nav>
        )}
      </div>

      <p className={`axi-hint ${open ? 'is-open' : ''}`} role="status">
        {open
          ? 'აირჩიე სექცია, რომელზეც გინდა გადახვიდე.'
          : 'დააჭირე Axi-ს, რომ გაიხსნას ნავიგაცია.'}
      </p>

      {open && (
        <button type="button" className="axi-dismiss" onClick={() => close(true)}>
          <span aria-hidden="true">×</span> დახურვა
        </button>
      )}
    </div>
  );
}
