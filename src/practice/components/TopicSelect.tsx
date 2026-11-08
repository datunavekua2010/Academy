import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Topic } from '../types';

interface TopicSelectProps {
  topics: Topic[];
  value: string;
  onChange: (topicId: string) => void;
}

/**
 * Topics drop-down.
 *
 * A plain trigger + panel built from the same design tokens as the rest of the
 * student area. Options are real buttons, so keyboard and mobile behaviour come
 * from the platform instead of a hand-rolled listbox.
 */
export function TopicSelect({ topics, value, onChange }: TopicSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = topics.find((topic) => topic.id === value) ?? topics[0];

  // Close when the grade changes and the panel is open.
  useEffect(() => {
    setOpen(false);
  }, [topics]);

  // Move focus to the current option when the panel opens.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const current = panelRef.current?.querySelector<HTMLButtonElement>(
        '.topic-option[aria-current="true"]',
      );
      (current ?? panelRef.current?.querySelector<HTMLButtonElement>('.topic-option'))?.focus({
        preventScroll: true,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Escape closes; a press outside the control dismisses it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const options = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('.topic-option') ?? [],
    );
    if (options.length === 0) return;

    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % options.length;
    else next = current < 0 ? options.length - 1 : (current - 1 + options.length) % options.length;

    event.preventDefault();
    options[next]?.focus();
  };

  const choose = (topicId: string) => {
    onChange(topicId);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  if (!selected) return null;

  return (
    <div className={`topic-select ${open ? 'is-open' : ''}`} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="topic-select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={open ? 'topic-select-panel' : undefined}
        aria-haspopup="true"
        aria-label={`თემები — არჩეულია ${selected.title}`}
      >
        <span className="topic-select-label">თემები</span>
        <span className="topic-select-value">
          <span className="topic-select-emoji" aria-hidden="true">
            {selected.emoji}
          </span>
          <span className="topic-select-text">
            <strong>{selected.title}</strong>
            <span>{selected.subtopics.length} ქვეთემა</span>
          </span>
        </span>
        <span className="topic-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          id="topic-select-panel"
          className="topic-select-panel"
          ref={panelRef}
          role="group"
          aria-label="თემების არჩევა"
          onKeyDown={onPanelKeyDown}
        >
          {topics.map((topic) => {
            const isCurrent = topic.id === selected.id;
            return (
              <button
                key={topic.id}
                type="button"
                className={`topic-option tone-${topic.tone} ${isCurrent ? 'is-current' : ''}`}
                onClick={() => choose(topic.id)}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <span className="topic-option-emoji" aria-hidden="true">
                  {topic.emoji}
                </span>
                <span className="topic-option-text">
                  <strong>{topic.title}</strong>
                  <span>{topic.summary}</span>
                </span>
                <span className="topic-option-count">{topic.subtopics.length}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
