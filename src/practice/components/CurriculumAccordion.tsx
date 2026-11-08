import { useEffect, useRef, useState } from 'react';
import type { Topic } from '../types';
import { topicSubtopics } from '../types';

interface CurriculumAccordionProps {
  topics: Topic[];
  /** Currently expanded topic id, or null when every topic is collapsed. */
  openTopicId: string | null;
  onToggleTopic: (topicId: string) => void;
  /**
   * Renders the clickable subtopic row. The accordion owns the expand/collapse
   * behaviour; starting an exercise stays with the page that owns the engine.
   */
  renderSubtopic: (args: {
    topic: Topic;
    unitId: string;
    subtopicId: string;
    title: string;
    summary: string;
  }) => React.ReactNode;
}

/**
 * Grade → Topic → Unit → Subtopic accordion.
 *
 * - Every topic of the grade stays visible; expanding one never hides the rest.
 * - A topic and its units expand independently, so opening U2 leaves U1 alone.
 * - Only one topic is expanded at a time (the page owns that state), which
 *   keeps a long curriculum readable on a phone.
 *
 * The open/closed animation is purely CSS (`max-height` + `opacity`), so the
 * menu stays keyboard- and screen-reader-friendly and respects reduced motion.
 */
export function CurriculumAccordion({
  topics,
  openTopicId,
  onToggleTopic,
  renderSubtopic,
}: CurriculumAccordionProps) {
  // Units remember their own open state, keyed by `topicId/unitId` so the state
  // survives collapsing and re-opening a topic.
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const toggleUnit = (key: string) =>
    setOpenUnits((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="accordion" role="list" aria-label="სასწავლო გეგმა">
      {topics.map((topic) => {
        const topicOpen = openTopicId === topic.id;
        const subtopics = topicSubtopics(topic);

        return (
          <div
            key={topic.id}
            role="listitem"
            className={`accordion-topic tone-${topic.tone} ${topicOpen ? 'is-open' : ''}`}
          >
            <h3 className="accordion-topic-heading">
              <button
                type="button"
                className="accordion-topic-trigger"
                onClick={() => onToggleTopic(topic.id)}
                aria-expanded={topicOpen}
                aria-controls={`topic-panel-${topic.id}`}
                id={`topic-trigger-${topic.id}`}
              >
                <span className="accordion-chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
                <span className="accordion-topic-emoji" aria-hidden="true">
                  {topic.emoji}
                </span>
                <span className="accordion-topic-text">
                  <strong>{topic.title}</strong>
                  <span>{topic.summary}</span>
                </span>
                <span className="accordion-topic-count">
                  {subtopics.length} ქვეთემა
                </span>
              </button>
            </h3>

            <div
              id={`topic-panel-${topic.id}`}
              role="region"
              aria-labelledby={`topic-trigger-${topic.id}`}
              className="accordion-panel"
              inert={!topicOpen ? true : undefined}
            >
              <div className="accordion-panel-inner">
                <ul className="accordion-units">
                  {topic.units.map((unit) => {
                    const unitKey = `${topic.id}/${unit.id}`;
                    const unitOpen = Boolean(openUnits[unitKey]);

                    return (
                      <li className={`accordion-unit ${unitOpen ? 'is-open' : ''}`} key={unit.id}>
                        <button
                          type="button"
                          className="accordion-unit-trigger"
                          onClick={() => toggleUnit(unitKey)}
                          aria-expanded={unitOpen}
                          aria-controls={`unit-panel-${topic.id}-${unit.id}`}
                        >
                          <span className="accordion-chevron is-small" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 6 6 6-6 6" />
                            </svg>
                          </span>
                          <span className="accordion-unit-code">{unit.code}</span>
                          <span className="accordion-unit-title">{unit.title}</span>
                          <span className="accordion-unit-count">
                            {unit.subtopics.length}
                          </span>
                        </button>

                        <div
                          id={`unit-panel-${topic.id}-${unit.id}`}
                          className="accordion-unit-panel"
                          inert={!unitOpen ? true : undefined}
                        >
                          <ul className="accordion-subtopics">
                            {unit.subtopics.map((subtopic) => (
                              <li key={subtopic.id}>
                                {renderSubtopic({
                                  topic,
                                  unitId: unit.id,
                                  subtopicId: subtopic.id,
                                  title: subtopic.title,
                                  summary: subtopic.summary,
                                })}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Opens the topic that contains a given subtopic — used so a student landing
 * from homework sees the exact unit expanded.
 */
export function findTopicOf(topics: Topic[], subtopicId: string): string | null {
  const match = topics.find((topic) =>
    topicSubtopics(topic).some((subtopic) => subtopic.id === subtopicId),
  );
  return match?.id ?? null;
}

/** Keeps an element in view when its panel opens on a small screen. */
export function useScrollIntoViewOnOpen(open: boolean) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  return ref;
}
