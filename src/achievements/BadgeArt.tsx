import type { Achievement } from './catalog';

/** Original, decorative line illustrations; no third-party badge artwork. */
export function BadgeArt({ achievement }: { achievement: Achievement }) {
  let drawing;
  switch (achievement.icon) {
    case 'steps': drawing = <><path d="M25 46h9v-8h9v-8h9v-8" /><path d="m45 22 7-1-1 7" /></>; break;
    case 'book': drawing = <><path d="M20 23c8-3 15-2 20 2v26c-5-4-12-5-20-2zM60 23c-8-3-15-2-20 2v26c5-4 12-5 20-2z" /><path d="M27 30h7m12 0h7M27 36h7m12 0h7" /></>; break;
    case 'flag': drawing = <><path d="M27 57V22m0 2c10-6 15 6 25 0v18c-10 6-15-6-25 0" /><path d="m37 30 2 3 4 .5-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.5z" /></>; break;
    case 'compass': drawing = <><circle cx="40" cy="39" r="19" /><path d="m46 28-3 14-14 6 6-14zM40 18v4m0 34v4M19 39h4m34 0h4" />{achievement.id === 'M07' && <path d="m57 18 1.5 3 3 .5-2.2 2 .5 3-2.8-1.4-2.8 1.4.5-3-2.2-2 3-.5z" />}</>;  break;
    case 'mountain': drawing = <><path d="m19 54 14-23 7 10 6-14 15 27zM29 38l4 4 3-3m6-5 4 4 3-3" /><circle cx="56" cy="23" r="4" />{achievement.id === 'M06' && <path d="M26 57h28" />}</>;  break;
    case 'calendar': drawing = <><rect x="22" y="24" width="36" height="32" rx="5" /><path d="M22 33h36M31 20v8m18-8v8m-18 13 5 5 12-10" /></>; break;
    case 'rhythm': drawing = <><rect x="20" y="24" width="40" height="32" rx="5" /><path d="M20 33h40M30 20v8m20-8v8M28 43h5m6 0h5m6 0h4M28 50h5m6 0h5m6 0h4" /></>; break;
    case 'numbers': drawing = <><circle cx="40" cy="39" r="19" /><path d="M27 33h8m-4-4v8m14-6h8m-8 7h8M29 47h4m14 0h4" /></>; break;
    case 'geometry': drawing = <><path d="m18 54 14-27 14 27z" /><circle cx="50" cy="30" r="9" /><rect x="44" y="43" width="16" height="14" rx="2" /></>; break;
    case 'fraction': drawing = <><circle cx="40" cy="39" r="19" /><path d="M40 20v19h19M40 39 26.5 52.5" /></>; break;
    case 'domains': drawing = <><rect x="22" y="22" width="15" height="15" rx="4" /><circle cx="50" cy="29.5" r="7.5" /><path d="m22 56 7.5-15L37 56z" /><path d="M43 49h15m-7.5-7.5v15" /></>; break;
    case 'pattern': drawing = <><circle cx="24" cy="39" r="6" /><rect x="35" y="33" width="12" height="12" rx="2" /><path d="m53 45 6-12 6 12zM22 52h4m13 0h4m14 0h4" /></>; break;
    case 'detective': drawing = <><circle cx="36" cy="35" r="13" /><path d="m46 45 12 12M31 35h10m-5-5v10" /></>; break;
    case 'puzzle': drawing = <><path d="M22 27h12c-2-7 10-7 8 0h13v12c7-2 7 10 0 8v10H42c2-7-10-7-8 0H22V45c7 2 7-10 0-8z" /></>; break;
    case 'idea': drawing = <><path d="M30 43a15 15 0 1 1 20 0c-3 3-4 5-4 8H34c0-3-1-5-4-8zM35 56h10M40 28v10m-5-5h10" /></>; break;
  }
  return <span className={`achievement-art tier-${achievement.tier ?? 'none'} category-${achievement.category}`} aria-hidden="true">
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path className="achievement-art-disc" d="M40 4 67 17v27c0 14-10 24-27 32C23 68 13 58 13 44V17z" strokeWidth="1.5" />
      <path className="achievement-art-inset" d="M40 10 61 20v23c0 11-8 19-21 25-13-6-21-14-21-25V20z" strokeWidth="1" />
      {drawing}
    </svg>
  </span>;
}
