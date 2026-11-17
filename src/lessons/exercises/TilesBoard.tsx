import type { TileGroup } from '../types';

/**
 * Algebra-tile grouping board. The student taps tiles to move them from their
 * starting groups into one shared group. Pure presentation: `moved[i]` is how
 * many tiles of group i have been moved, owned by the player.
 */

interface Props {
  groups: TileGroup[];
  moved: number[];
  onMove: (groupIndex: number) => void;
  onReset: () => void;
  locked: boolean;
}

function Tile({ label, tone, onClick, disabled, name }: { label: string; tone: TileGroup['tone']; onClick?: () => void; disabled?: boolean; name: string }) {
  const inner = <span className="lp-tile-face">{label}</span>;
  if (!onClick) return <span className={`lp-tile tone-${tone}`} role="img" aria-label={name}>{inner}</span>;
  return (
    <button type="button" className={`lp-tile is-button tone-${tone}`} onClick={onClick} disabled={disabled} aria-label={name}>
      {inner}
    </button>
  );
}

export function TilesBoard({ groups, moved, onMove, onReset, locked }: Props) {
  const total = groups.reduce((n, g) => n + g.count, 0);
  const movedTotal = moved.reduce((n, m) => n + m, 0);
  const together = groups.flatMap((g, gi) => Array.from({ length: moved[gi] ?? 0 }, (_, k) => ({ g, key: `${gi}-${k}` })));

  return (
    <div className="lp-tiles">
      <div className="lp-tile-zones">
        {groups.map((g, gi) => {
          const left = g.count - (moved[gi] ?? 0);
          return (
            <div className="lp-tile-zone" key={gi}>
              <div className="lp-zone-title">
                {g.count}
                {g.label}
              </div>
              <div className="lp-tile-row" aria-label={`${g.count}${g.label} ჯგუფი, დარჩენილია ${left} ფილა`}>
                {Array.from({ length: left }, (_, k) => (
                  <Tile key={k} label={g.label} tone={g.tone} name={`${g.label} ფილა — გადაიტანე საერთო ჯგუფში`} onClick={() => onMove(gi)} disabled={locked} />
                ))}
                {left === 0 && <span className="lp-zone-empty">ცარიელია</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lp-tile-zone is-target" aria-live="polite">
        <div className="lp-zone-title">ერთი ჯგუფი</div>
        <div className="lp-tile-row">
          {together.map(({ g, key }) => (
            <Tile key={key} label={g.label} tone={g.tone} name={`${g.label} ფილა საერთო ჯგუფში`} />
          ))}
          {together.length === 0 && <span className="lp-zone-empty">აქ გადმოვა ფილები</span>}
        </div>
        <div className="lp-zone-foot">
          <span>
            გადატანილია {movedTotal} / {total}
          </span>
          {movedTotal > 0 && !locked && (
            <button type="button" className="text-button" onClick={onReset}>
              თავიდან
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
