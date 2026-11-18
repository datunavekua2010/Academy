/**
 * A short progression of cards joined by arrows (for example 8 + 5 → 8 + 2 + 3 → 10 + 3 → 13).
 * A card with no text is a dashed placeholder, so the student sees how many steps are still to come
 * without being handed the numbers.
 */
export interface ChainCard {
  /** Small caption above the card, e.g. "ჯამი". */
  label: string;
  text: string | null;
  active?: boolean;
}

export function StepChain({ cards, ariaLabel }: { cards: ChainCard[]; ariaLabel: string }) {
  return (
    <ol className="sc" aria-label={ariaLabel}>
      {cards.map((c, i) => (
        <li key={i} className={`sc-card ${c.text === null ? 'is-empty' : ''} ${c.active ? 'is-active' : ''}`}>
          <small>{c.label}</small>
          <strong>{c.text === null ? '?' : c.text}</strong>
        </li>
      ))}
    </ol>
  );
}
