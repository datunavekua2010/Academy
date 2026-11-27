import { useRef, useState, type KeyboardEvent } from 'react';
import { Mascot } from '../components/Mascot';
import { Link } from '../router';
import { STUDENT_NAV } from './navItems';

/** The same student destinations are available in the sidebar and mobile strip. */
export function AxiNav({ activeSection = '' }: { activeSection?: string }) {
  const [open, setOpen] = useState(true);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
      return;
    }
    const handled = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!handled.includes(event.key)) return;
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % links.length;
    else next = current < 0 ? links.length - 1 : (current - 1 + links.length) % links.length;
    event.preventDefault();
    links[next]?.focus();
  };

  return (
    <div className="student-navigation">
      <div className="student-navigation-heading">
        <Mascot className="student-nav-mascot" thoughts={['']} waveOnMount={false} showThoughtBubble={false}
          onClick={() => setOpen((value) => !value)} buttonRef={triggerRef}
          buttonLabel={open ? 'Axi-ს ნავიგაციის დახურვა' : 'Axi-ს ნავიგაციის გახსნა'}
          ariaExpanded={open} ariaControls={open ? 'student-nav-panel' : undefined} />
        <div><strong>Axi</strong><span>შენი მეგზური</span></div>
        <span className="student-nav-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
      </div>
      {open && <nav id="student-nav-panel" ref={panelRef} aria-label="მოსწავლის სექციები" className="student-nav-list" onKeyDown={onPanelKeyDown}>
        <Link to="/student" className={`axi-bubble student-nav-link ${!activeSection ? 'is-active' : ''}`} aria-current={!activeSection ? 'page' : undefined}>
          <span className="student-nav-icon" aria-hidden="true">⌂</span><span>მთავარი</span>
        </Link>
        {STUDENT_NAV.map((item) => <Link key={item.key} to={item.to} className={`axi-bubble student-nav-link ${item.key === activeSection ? 'is-active' : ''}`} aria-current={item.key === activeSection ? 'page' : undefined}>
          <span className={`student-nav-icon tone-${item.tone}`} aria-hidden="true">{item.icon}</span><span>{item.label}</span>
        </Link>)}
      </nav>}
    </div>
  );
}
