import type { Glyph, Verdict } from '../types';
import { GLYPH_NAME, GlyphIcon } from './Objects';
import { dealOut, fairShare, groupInto, groupsMade, quotientOf, shareText, totalOfCounts } from './ShareGeometry';

/**
 * Pictures and answer controls for G2 U06 (fair sharing and division).
 *
 * Everything is drawn from the counts: a row of characters holding counters, or a set of containers. "Fair" is never a
 * judgement about the picture — it is `allSame(counts)` and nothing left over, computed in `ShareGeometry`.
 */

const namer = (glyph: Glyph) => GLYPH_NAME[glyph];

/** One character (or container) holding `count` objects. */
export function ShareBox({ count, index, glyph = 'apple', kind = 'child', label }: { count: number; index: number; glyph?: Glyph; kind?: 'child' | 'basket'; label?: string }) {
  return (
    <div className={`shbox is-${kind}`} aria-label={label ?? `${index + 1}-ე ${kind === 'child' ? 'ბავშვს' : 'კალათაში'} ${count} ${namer(glyph)}`}>
      <div className="shbox-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="shbox-dot">
            <GlyphIcon glyph={glyph} />
          </span>
        ))}
      </div>
      <b className="shbox-count">{count}</b>
    </div>
  );
}

/** The counters that have not been shared yet. */
function Pile({ count, glyph }: { count: number; glyph: Glyph }) {
  if (count <= 0) return <p className="shpile is-empty">ყველა საგანი დარიგებულია.</p>;
  return (
    <div className="shpile" aria-label={`დარჩენილია ${count} ${namer(glyph)}`}>
      <span className="shpile-label">დარჩა {count}</span>
      <div className="shpile-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="shbox-dot">
            <GlyphIcon glyph={glyph} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** A share of objects among characters, with the division sentence underneath. */
export function ShareBoard({ total, people, glyph = 'apple', caption, showSentence = true }: { total: number; people: number; glyph?: Glyph; caption?: string; showSentence?: boolean }) {
  const counts = dealOut(total, people);
  return (
    <figure className="shb" aria-label={shareText(total, people)}>
      <div className="shb-row">
        {counts.map((c, i) => (
          <ShareBox key={i} count={c} index={i} glyph={glyph} />
        ))}
      </div>
      {showSentence && <figcaption className="shb-note">{`${total} ÷ ${people} = ${quotientOf(total, people) ?? '?'} — ${shareText(total, people)}`}</figcaption>}
      {caption && <figcaption className="shb-cap">{caption}</figcaption>}
    </figure>
  );
}

/** Containers holding a given number each, for the grouping reading of division. */
export function GroupsBoardShare({ groups, size, glyph = 'apple', caption }: { groups: number; size: number; glyph?: Glyph; caption?: string }) {
  return (
    <figure className="shb" aria-label={`${groups} ჯგუფი, თითოეულში ${size}`}>
      <div className="shb-row">
        {Array.from({ length: Math.max(1, groups) }, (_, i) => (
          <ShareBox key={i} count={size} index={i} glyph={glyph} kind="basket" />
        ))}
      </div>
      <figcaption className="shb-note">{`${groups} × ${size} = ${groups * size}`}</figcaption>
      {caption && <figcaption className="shb-cap">{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────── answer controls ───────────────────────────

/** Share `total` fairly: the student picks each character's share. Stored as `"share,leftover"`. */
export function ShareFairAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { total: number; people: number; glyph?: Glyph };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const glyph = response.glyph ?? 'apple';
  const [share = '', leftover = ''] = value.split(',');
  const given = Number(share) || 0;
  const used = given * response.people;
  const left = Number(leftover) || 0;
  return (
    <div className={`shf ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="shf-ask">
        <strong>{response.total}</strong> {namer(glyph)} გაუნაწილე <strong>{response.people}</strong> ბავშვს თანაბრად.
      </p>
      <div className="shb-row">
        {Array.from({ length: response.people }, (_, i) => (
          <ShareBox key={i} count={given} index={i} glyph={glyph} />
        ))}
      </div>
      <div className="shf-slot" role="group" aria-label={label}>
        <label className="shf-field">
          <span>თითოეულს</span>
          <input type="text" inputMode="numeric" value={share} disabled={disabled} onChange={(e) => onChange(`${e.target.value.replace(/[^\d]/g, '')},${leftover}`)} aria-label="თითოეულს რამდენი" />
        </label>
        <label className="shf-field">
          <span>დარჩება</span>
          <input type="text" inputMode="numeric" value={leftover} disabled={disabled} onChange={(e) => onChange(`${share},${e.target.value.replace(/[^\d]/g, '')}`)} aria-label="დარჩენილი რაოდენობა" />
        </label>
      </div>
      <Pile count={Math.max(0, response.total - used - left)} glyph={glyph} />
      <p className="shf-note">
        {`${response.people} × ${given} = ${used}. ${used === response.total ? 'ყველა საგანი დარიგდა.' : used < response.total ? `კიდევ ${response.total - used} რჩება.` : `${used - response.total} ზედმეტია.`}`}
      </p>
    </div>
  );
}

/** Put `total` objects into `groups` containers; stored as the counts. */
export function ShareGroupsAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { total: number; groups: number; glyph?: Glyph };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const glyph = response.glyph ?? 'apple';
  const counts = Array.from({ length: response.groups }, (_, i) => Number(value.split(',')[i] ?? '') || 0);
  const bump = (i: number, by: number) => {
    if (disabled) return;
    const next = counts.map((n, k) => (k === i ? Math.max(0, Math.min(response.total, n + by)) : n));
    onChange(next.join(','));
  };
  const used = totalOfCounts(counts);
  const fair = counts.every((n) => n === counts[0]) && used === response.total;
  return (
    <div className={`shg ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="shg-ask">
        {response.total} {namer(glyph)} გაყავი <strong>{response.groups}</strong> ჯგუფად ისე, რომ ყველგან ერთი და იგივე იყოს.
      </p>
      <div className="shb-row" role="group" aria-label={label}>
        {counts.map((c, i) => (
          <div key={i} className={`shbox is-basket ${fair ? 'is-fair' : ''}`}>
            <div className="shbox-dots" aria-hidden="true">
              {Array.from({ length: c }, (_, k) => (
                <span key={k} className="shbox-dot">
                  <GlyphIcon glyph={glyph} />
                </span>
              ))}
            </div>
            <div className="shbox-acts">
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled || c === 0} onClick={() => bump(i, -1)} aria-label={`${i + 1}-ე ჯგუფიდან წაიღე ერთი`}>
                −
              </button>
              <b className="shbox-count">{c}</b>
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled || used >= response.total} onClick={() => bump(i, 1)} aria-label={`${i + 1}-ე ჯგუფს დაამატე ერთი`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <Pile count={Math.max(0, response.total - used)} glyph={glyph} />
      <p className="shg-note" aria-live="polite">
        {fair ? `✓ ყველა ჯგუფში ${counts[0]} — თანაბრად გაიყო. ${response.total} ÷ ${response.groups} = ${counts[0]}.` : 'ჯერ არ არის თანაბრად გაყოფილი: შეადარე რაოდენობები.'}
      </p>
    </div>
  );
}

/** Make complete groups of `size` and count them. Stored as `"groups,leftover"`. */
export function GroupIntoAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { total: number; size: number; glyph?: Glyph };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const glyph = response.glyph ?? 'apple';
  const [groups = '', leftover = ''] = value.split(',');
  const made = Number(groups) || 0;
  return (
    <div className={`shgi ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="shgi-ask">
        {response.total} {namer(glyph)} ჩასვი ყუთებში, თითოეულში <strong>{response.size}</strong>. რამდენი სრული ყუთი გამოვა?
      </p>
      <div className="shb-row">
        {Array.from({ length: Math.max(1, made) }, (_, i) => (
          <ShareBox key={i} count={response.size} index={i} glyph={glyph} kind="basket" />
        ))}
      </div>
      <div className="shf-slot" role="group" aria-label={label}>
        <label className="shf-field">
          <span>სრული ჯგუფი</span>
          <input type="text" inputMode="numeric" value={groups} disabled={disabled} onChange={(e) => onChange(`${e.target.value.replace(/[^\d]/g, '')},${leftover}`)} aria-label="სრული ჯგუფების რაოდენობა" />
        </label>
        <label className="shf-field">
          <span>ნაშთი</span>
          <input type="text" inputMode="numeric" value={leftover} disabled={disabled} onChange={(e) => onChange(`${groups},${e.target.value.replace(/[^\d]/g, '')}`)} aria-label="ნაშთი" />
        </label>
      </div>
      <p className="shgi-note">
        {`${response.size} × ${made} = ${response.size * made}. ${response.total - response.size * made > 0 ? `კიდევ ${response.total - response.size * made} რჩება.` : 'ყველა საგანი ყუთშია.'}`}
      </p>
    </div>
  );
}

/** A division sentence written from the numbers: stored as `"total,by"`. */
export function DivisionSentenceAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { total: number; by: number; family?: 'share' | 'group' };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const [total = '', by = ''] = value.split(',');
  const q = Number(by) > 0 ? quotientOf(Number(total), Number(by)) : null;
  const write = (which: 'total' | 'by', text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onChange(which === 'total' ? `${clean},${by}` : `${total},${clean}`);
  };
  return (
    <div className={`shd ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <ShareBoard total={response.total} people={response.by} showSentence={false} />
      <div className="shd-inputs" role="group" aria-label={label}>
        <label className="shd-slot">
          <span>სულ</span>
          <input type="text" inputMode="numeric" value={total} disabled={disabled} onChange={(e) => write('total', e.target.value)} aria-label="საერთო რაოდენობა" />
        </label>
        <span className="shd-sign" aria-hidden="true">÷</span>
        <label className="shd-slot">
          <span>ჯგუფები</span>
          <input type="text" inputMode="numeric" value={by} disabled={disabled} onChange={(e) => write('by', e.target.value)} aria-label="ჯგუფების რაოდენობა" />
        </label>
        <span className="shd-sign" aria-hidden="true">=</span>
        <output className="shd-quotient" aria-live="polite">
          {q ?? '?'}
        </output>
      </div>
      <p className="shd-note">
        {q !== null ? `${total} ÷ ${by} = ${q}. შემოწმება: ${by} × ${q} = ${Number(by) * q}.` : 'ორივე რიცხვი ჩაწერე; თუ ზუსტად არ იყოფა, კოეფიციენტი მთელი რიცხვი არ არის.'}
      </p>
    </div>
  );
}

/** One missing number from a fact family. Stored as the number written. */
export function FactFamilyAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { a: number; b: number; missing: 'a' | 'b' | 'product' };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const product = response.a * response.b;
  const blank = '▢';
  const first = response.missing === 'a' ? blank : String(response.a);
  const second = response.missing === 'b' ? blank : String(response.b);
  const total = response.missing === 'product' ? blank : String(product);
  return (
    <div className={`shfam ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <div className="shfam-grid" aria-label={label}>
        <span className="shfam-line">
          {first} × {second} = {total}
        </span>
        <span className="shfam-line is-divide">
          {response.missing === 'product' ? blank : String(product)} ÷ {response.missing === 'a' ? blank : String(response.a)} = {response.missing === 'b' ? blank : String(response.b)}
        </span>
      </div>
      <label className="shd-slot">
        <span>გამოტოვებული რიცხვი</span>
        <input type="text" inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))} aria-label="გამოტოვებული რიცხვი" />
      </label>
      <GroupsBoardShare groups={response.a} size={response.b} />
      <p className="shfam-note">
        {`${response.a} × ${response.b} = ${product}. ${response.a} ჯგუფი, თითოეულში ${response.b}.`}
      </p>
    </div>
  );
}

/** A static picture of a grouping, for a question. */
export function GroupingPicture({ total, size, glyph = 'apple' }: { total: number; size: number; glyph?: Glyph }) {
  const { groups, leftover } = groupInto(total, size);
  return (
    <figure className="shb" aria-label={`${total} საგანი ${size}-ად: ${groups} ჯგუფი, ნაშთი ${leftover}`}>
      <div className="shb-row">
        {groupsMade(total, size).map((_, i) => (
          <ShareBox key={i} count={size} index={i} glyph={glyph} kind="basket" />
        ))}
      </div>
      <figcaption className="shb-note">{leftover === 0 ? `${groups} სრული ჯგუფი — ნაშთი არ არის.` : `${groups} სრული ჯგუფი, ნაშთი ${leftover}.`}</figcaption>
    </figure>
  );
}

/** The fair share written as words, for a caption. */
export const shareCaption = (total: number, people: number): string => {
  const { share, leftover } = fairShare(total, people);
  return leftover === 0 ? `${total} ÷ ${people} = ${share}` : `${total} ÷ ${people} = ${share}, ნაშთი ${leftover}`;
};
