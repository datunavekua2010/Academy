import type { ReactElement } from 'react';

/**
 * The artwork. Every object a practice question can show is drawn here, once,
 * as a small flat illustration on a 40×40 board, so a row of apples is a row of
 * apples on every device — not whatever the platform's emoji font happens to
 * contain.
 *
 * Colours are fixed per object. Meaning is never carried by colour alone: the
 * counted objects differ in *shape*, and a crossed-out object gets a drawn
 * cross (see `PictureView`).
 */

const OUT = '#33415c';

type Draw = () => ReactElement;

const stroke = { stroke: OUT, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const dot = (fill: string): Draw => () => (
  <circle cx="20" cy="20" r="14" fill={fill} {...stroke} />
);
const square = (fill: string): Draw => () => (
  <rect x="6" y="6" width="28" height="28" rx="5" fill={fill} {...stroke} />
);

const fruit = (body: string, leaf = '#3fae5a'): Draw => () => (
  <g {...stroke}>
    <path d="M20 12c-8-5-15 1-14 10 1 8 7 14 12 12 1-.5 3-.5 4 0 5 2 11-4 12-12 1-9-6-15-14-10z" fill={body} />
    <path d="M20 12c0-4 2-7 5-8" fill="none" />
    <path d="M22 8c3-3 7-2 8 0-3 3-6 3-8 0z" fill={leaf} />
  </g>
);

export const ICONS: Record<string, Draw> = {
  apple: fruit('#e8473f'),
  'apple-green': fruit('#7bc043'),
  pear: () => (
    <g {...stroke}>
      <path d="M20 8c4 0 5 5 6 8 5 4 7 8 6 12-1 4-6 7-12 7s-11-3-12-7c-1-4 1-8 6-12 1-3 2-8 6-8z" fill="#cfe05a" />
      <path d="M20 8c0-3 1-5 3-6" fill="none" />
      <path d="M22 5c3-2 6-1 7 1-3 2-5 2-7-1z" fill="#3fae5a" />
    </g>
  ),
  orange: () => (
    <g {...stroke}>
      <circle cx="20" cy="22" r="14" fill="#f7a233" />
      <path d="M20 9c1-3 3-5 6-5-1 3-3 5-6 5z" fill="#3fae5a" />
      <path d="M12 18c2-2 4-3 6-3" fill="none" strokeWidth="1.2" />
    </g>
  ),
  lemon: () => (
    <g {...stroke}>
      <path d="M4 20c0-6 6-12 16-12s16 6 16 12-6 12-16 12S4 26 4 20z" fill="#f6dc3b" />
      <path d="M2 20h3M35 20h3" fill="none" />
    </g>
  ),
  banana: () => (
    <g {...stroke}>
      <path d="M7 10c1 12 9 23 25 22-6 3-13 3-19-2C7 25 4 17 7 10z" fill="#f6d643" />
      <path d="M7 10c0-3 1-4 3-5" fill="none" />
    </g>
  ),
  strawberry: () => (
    <g {...stroke}>
      <path d="M8 13c4-3 20-3 24 0 0 11-6 22-12 24C14 35 8 24 8 13z" fill="#e63b53" />
      <path d="M12 12c3-4 13-4 16 0-3 2-13 2-16 0z" fill="#3fae5a" />
      <circle cx="15" cy="20" r=".9" fill="#fff" stroke="none" />
      <circle cx="22" cy="19" r=".9" fill="#fff" stroke="none" />
      <circle cx="19" cy="26" r=".9" fill="#fff" stroke="none" />
      <circle cx="25" cy="25" r=".9" fill="#fff" stroke="none" />
    </g>
  ),
  blueberry: () => (
    <g {...stroke}>
      <circle cx="20" cy="21" r="13" fill="#4a5fc1" />
      <path d="M16 11l4 3 4-3-1 5h-6z" fill="#2f3e86" />
    </g>
  ),
  watermelon: () => (
    <g {...stroke}>
      <path d="M3 14h34c0 12-8 22-17 22S3 26 3 14z" fill="#e8473f" />
      <path d="M3 14h34" fill="none" />
      <path d="M5 17c3 13 12 17 15 17s12-4 15-17" fill="none" stroke="#3fae5a" strokeWidth="3" />
      <circle cx="14" cy="21" r="1" fill={OUT} stroke="none" />
      <circle cx="20" cy="25" r="1" fill={OUT} stroke="none" />
      <circle cx="26" cy="21" r="1" fill={OUT} stroke="none" />
    </g>
  ),
  melon: () => (
    <g {...stroke}>
      <circle cx="20" cy="21" r="14" fill="#9fd36a" />
      <path d="M12 12c4 6 4 14 0 20M20 8v26M28 12c-4 6-4 14 0 20" fill="none" strokeWidth="1.1" />
    </g>
  ),
  croissant: () => (
    <g {...stroke}>
      <path d="M3 27c2-12 9-18 17-18s15 6 17 18c-4 2-7-1-10-1-3 2-8 2-14 0-3 0-6 3-10 1z" fill="#e3a14a" />
      <path d="M13 12l3 14M20 9v17M27 12l-3 14" fill="none" strokeWidth="1.2" />
    </g>
  ),
  cookie: () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="15" fill="#d9a15a" />
      <circle cx="14" cy="15" r="2" fill="#6b4226" stroke="none" />
      <circle cx="25" cy="14" r="2" fill="#6b4226" stroke="none" />
      <circle cx="26" cy="25" r="2" fill="#6b4226" stroke="none" />
      <circle cx="15" cy="26" r="2" fill="#6b4226" stroke="none" />
      <circle cx="20" cy="20" r="1.6" fill="#6b4226" stroke="none" />
    </g>
  ),
  candy: () => (
    <g {...stroke}>
      <path d="M2 12l9 5v6l-9 5z M38 12l-9 5v6l9 5z" fill="#ff8fb3" />
      <rect x="10" y="12" width="20" height="16" rx="8" fill="#ff5c8a" />
      <path d="M16 14l-2 12M22 14l-2 12" fill="none" stroke="#fff" strokeWidth="1.6" />
    </g>
  ),
  chocolate: () => (
    <g {...stroke}>
      <rect x="6" y="5" width="28" height="30" rx="3" fill="#7a4a2b" />
      <path d="M6 15h28M6 25h28M16 5v30M26 5v30" fill="none" stroke="#a9744b" strokeWidth="1.3" />
    </g>
  ),
  cone: () => (
    <g {...stroke}>
      <path d="M12 20h16l-8 17z" fill="#e0a85a" />
      <circle cx="20" cy="14" r="9" fill="#ff9fc2" />
      <path d="M16 24l3 8M24 24l-3 8" fill="none" strokeWidth="1" />
    </g>
  ),
  pizza: () => (
    <g {...stroke}>
      <path d="M4 12c10-8 22-8 32 0L20 37z" fill="#f4c35a" />
      <path d="M4 12c10-8 22-8 32 0" fill="none" stroke="#c98a3a" strokeWidth="3" />
      <circle cx="15" cy="16" r="2.4" fill="#d9413a" stroke="none" />
      <circle cx="25" cy="16" r="2.4" fill="#d9413a" stroke="none" />
      <circle cx="20" cy="25" r="2.4" fill="#d9413a" stroke="none" />
    </g>
  ),
  cupcake: () => (
    <g {...stroke}>
      <path d="M9 21h22l-3 15H12z" fill="#e8b25c" />
      <path d="M8 21c-3-8 5-13 7-10 1-5 9-5 10 0 3-3 10 2 7 10z" fill="#ff8fb3" />
      <circle cx="20" cy="7" r="2.2" fill="#e63b53" />
    </g>
  ),
  plate: () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="15" fill="#f1f4fa" />
      <circle cx="20" cy="20" r="9" fill="#fff" />
    </g>
  ),
  fish: () => (
    <g {...stroke}>
      <path d="M3 20c6-10 16-12 24-6l9-6v24l-9-6c-8 6-18 4-24-6z" fill="#4aa8e8" />
      <circle cx="12" cy="18" r="1.6" fill={OUT} stroke="none" />
      <path d="M18 14c2 4 2 8 0 12" fill="none" strokeWidth="1.2" />
    </g>
  ),
  dog: () => (
    <g {...stroke}>
      <path d="M7 11c-4 2-4 10-1 14 1-5 3-8 5-9z M33 11c4 2 4 10 1 14-1-5-3-8-5-9z" fill="#8a5a3a" />
      <rect x="8" y="8" width="24" height="26" rx="11" fill="#d9a066" />
      <ellipse cx="20" cy="26" rx="7" ry="5" fill="#f5e0c3" />
      <circle cx="14" cy="19" r="1.7" fill={OUT} stroke="none" />
      <circle cx="26" cy="19" r="1.7" fill={OUT} stroke="none" />
      <ellipse cx="20" cy="23" rx="2.4" ry="1.7" fill={OUT} />
    </g>
  ),
  cat: () => (
    <g {...stroke}>
      <path d="M7 6l7 6h12l7-6v16c0 8-6 13-13 13S7 30 7 22z" fill="#f0a24a" />
      <circle cx="14" cy="21" r="1.7" fill={OUT} stroke="none" />
      <circle cx="26" cy="21" r="1.7" fill={OUT} stroke="none" />
      <path d="M18 26l2 2 2-2M5 25l7 1M35 25l-7 1" fill="none" strokeWidth="1.2" />
    </g>
  ),
  mouse: () => (
    <g {...stroke}>
      <circle cx="9" cy="10" r="5" fill="#cfd6e4" />
      <circle cx="26" cy="10" r="5" fill="#cfd6e4" />
      <ellipse cx="18" cy="22" rx="14" ry="12" fill="#b9c2d4" />
      <circle cx="12" cy="20" r="1.5" fill={OUT} stroke="none" />
      <circle cx="12" cy="26" r="2" fill="#ff8fb3" />
      <path d="M32 24c4 0 5 4 2 7" fill="none" />
    </g>
  ),
  bird: () => (
    <g {...stroke}>
      <path d="M5 22c2-10 12-15 20-10l8-1-5 6c0 9-6 14-13 14S4 31 5 22z" fill="#5aa5e8" />
      <circle cx="24" cy="15" r="1.5" fill={OUT} stroke="none" />
      <path d="M33 11l5 2-5 3z" fill="#f7a233" />
      <path d="M12 24c4 0 7 2 9 5" fill="none" strokeWidth="1.2" />
    </g>
  ),
  chick: () => (
    <g {...stroke}>
      <circle cx="20" cy="22" r="13" fill="#f9d949" />
      <circle cx="15" cy="19" r="1.6" fill={OUT} stroke="none" />
      <circle cx="25" cy="19" r="1.6" fill={OUT} stroke="none" />
      <path d="M17 24l3 3 3-3z" fill="#f08a2d" />
      <path d="M20 9c-2-3 0-5 2-5" fill="none" />
    </g>
  ),
  tree: () => (
    <g {...stroke}>
      <rect x="17" y="24" width="6" height="12" fill="#8a5a3a" />
      <circle cx="20" cy="15" r="11" fill="#4cae5a" />
      <circle cx="13" cy="21" r="7" fill="#4cae5a" />
      <circle cx="27" cy="21" r="7" fill="#4cae5a" />
    </g>
  ),
  'flower-pink': () => flower('#ff8fb3'),
  'flower-yellow': () => flower('#f7d447'),
  'flower-red': () => flower('#e8473f'),
  moon: () => (
    <g {...stroke}>
      <path d="M26 5a15 15 0 1 0 9 22 12 12 0 0 1-9-22z" fill="#f6d94c" />
    </g>
  ),
  sun: () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="8" fill="#f9c933" />
      <path d="M20 4v5M20 31v5M4 20h5M31 20h5M9 9l3.5 3.5M27.5 27.5L31 31M31 9l-3.5 3.5M12.5 27.5L9 31" fill="none" />
    </g>
  ),
  star: () => (
    <path
      d="M20 3l5 11 12 1.4-9 8 2.6 12L20 29.5 9.4 35.4 12 23.4 3 15.4 15 14z"
      fill="#f9c933"
      {...stroke}
    />
  ),
  heart: () => (
    <path d="M20 35C5 24 4 14 10 9c4-3 8-1 10 3 2-4 6-6 10-3 6 5 5 15-10 26z" fill="#e8473f" {...stroke} />
  ),
  balloon: () => (
    <g {...stroke}>
      <ellipse cx="20" cy="16" rx="11" ry="13" fill="#e8473f" />
      <path d="M18 29l2 3 2-3z" fill="#e8473f" />
      <path d="M20 32c-3 2 3 3 0 6" fill="none" />
      <path d="M14 10c1-2 3-3 5-3" fill="none" stroke="#fff" strokeWidth="1.6" />
    </g>
  ),
  ball: () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="15" fill="#fff" />
      <path d="M20 12l7 5-3 8h-8l-3-8z" fill={OUT} />
      <path d="M20 12V5M27 17l8-3M24 25l5 7M16 25l-5 7M13 17l-8-3" fill="none" strokeWidth="1.2" />
    </g>
  ),
  volleyball: () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="15" fill="#f4e8c4" />
      <path d="M20 5c-6 6-6 14 0 20M8 10c8 2 14 8 16 16M34 12c-8-1-15 3-18 10" fill="none" strokeWidth="1.3" />
    </g>
  ),
  dice: () => (
    <g {...stroke}>
      <rect x="6" y="6" width="28" height="28" rx="5" fill="#fff" />
      <circle cx="14" cy="14" r="2.3" fill={OUT} />
      <circle cx="26" cy="14" r="2.3" fill={OUT} />
      <circle cx="20" cy="20" r="2.3" fill={OUT} />
      <circle cx="14" cy="26" r="2.3" fill={OUT} />
      <circle cx="26" cy="26" r="2.3" fill={OUT} />
    </g>
  ),
  brick: () => (
    <g {...stroke}>
      <rect x="4" y="10" width="32" height="20" rx="2" fill="#d2603e" />
      <path d="M4 20h32M14 10v10M26 10v10M20 20v10" fill="none" stroke="#f1c9b8" strokeWidth="1.3" />
    </g>
  ),
  box: () => (
    <g {...stroke}>
      <path d="M6 12l14-6 14 6v18l-14 6-14-6z" fill="#d9a15a" />
      <path d="M6 12l14 6 14-6M20 18v18" fill="none" />
      <path d="M13 9l14 6v5" fill="none" strokeWidth="1.1" />
    </g>
  ),
  'book-blue': () => book('#3f6fd8'),
  'book-red': () => book('#d9413a'),
  books: () => (
    <g {...stroke}>
      <rect x="5" y="9" width="8" height="26" rx="1.5" fill="#3f6fd8" />
      <rect x="14" y="5" width="8" height="30" rx="1.5" fill="#e8473f" />
      <rect x="23" y="11" width="8" height="24" rx="1.5" fill="#4cae5a" />
    </g>
  ),
  chair: () => (
    <g {...stroke}>
      <path d="M11 4h14l-1 17H12z" fill="#c98a4a" />
      <rect x="9" y="21" width="20" height="5" rx="1.5" fill="#a96f35" />
      <path d="M11 26v10M27 26v10" fill="none" strokeWidth="2.4" />
    </g>
  ),
  'clock-icon': () => (
    <g {...stroke}>
      <circle cx="20" cy="20" r="15" fill="#fff" />
      <path d="M20 10v10l7 4" fill="none" strokeWidth="2.2" />
    </g>
  ),
  car: () => (
    <g {...stroke}>
      <path d="M4 26v-6l5-2 5-7h12l5 7 5 2v6z" fill="#e8473f" />
      <path d="M15 13l-3 5h16l-3-5z" fill="#cfe9ff" />
      <circle cx="12" cy="27" r="4.4" fill="#33415c" />
      <circle cx="29" cy="27" r="4.4" fill="#33415c" />
    </g>
  ),
  train: () => (
    <g {...stroke}>
      <rect x="6" y="12" width="20" height="16" rx="3" fill="#3f6fd8" />
      <rect x="22" y="6" width="12" height="22" rx="2" fill="#e8473f" />
      <rect x="9" y="15" width="6" height="6" rx="1" fill="#cfe9ff" />
      <rect x="25" y="9" width="6" height="6" rx="1" fill="#cfe9ff" />
      <circle cx="12" cy="31" r="3.6" fill="#33415c" />
      <circle cx="29" cy="31" r="3.6" fill="#33415c" />
    </g>
  ),
  bell: () => (
    <g {...stroke}>
      <path d="M8 29c3-3 3-6 3-12 0-6 4-10 9-10s9 4 9 10c0 6 0 9 3 12z" fill="#f6c43a" />
      <circle cx="20" cy="33" r="3" fill="#d89a1f" />
      <path d="M20 7V4" fill="none" />
    </g>
  ),
  bear: () => (
    <g {...stroke}>
      <circle cx="9" cy="10" r="5" fill="#a9744b" />
      <circle cx="31" cy="10" r="5" fill="#a9744b" />
      <circle cx="20" cy="21" r="14" fill="#c48a5c" />
      <ellipse cx="20" cy="25" rx="6" ry="4.5" fill="#f1d9bd" />
      <circle cx="14" cy="18" r="1.6" fill={OUT} stroke="none" />
      <circle cx="26" cy="18" r="1.6" fill={OUT} stroke="none" />
      <ellipse cx="20" cy="23" rx="2" ry="1.4" fill={OUT} />
    </g>
  ),
  robot: () => (
    <g {...stroke}>
      <rect x="8" y="12" width="24" height="20" rx="4" fill="#9db4d8" />
      <path d="M20 12V6" fill="none" />
      <circle cx="20" cy="5" r="2" fill="#e8473f" />
      <circle cx="15" cy="20" r="3" fill="#fff" />
      <circle cx="25" cy="20" r="3" fill="#fff" />
      <path d="M14 27h12" fill="none" />
    </g>
  ),
  drum: () => (
    <g {...stroke}>
      <ellipse cx="20" cy="13" rx="14" ry="5" fill="#f3e6c8" />
      <path d="M6 13v16c0 3 6 5 14 5s14-2 14-5V13" fill="#e8473f" />
      <path d="M6 13c0 3 6 5 14 5s14-2 14-5" fill="none" />
      <path d="M14 8l-6-5M26 8l6-5" fill="none" strokeWidth="2.2" />
    </g>
  ),
  puzzle: () => (
    <g {...stroke}>
      <path d="M6 10h10a4 4 0 1 1 8 0h10v10a4 4 0 1 0 0 8v8H24a4 4 0 1 0-8 0H6V28a4 4 0 1 1 0-8z" fill="#8b6fd1" />
    </g>
  ),
  pencil: () => (
    <g {...stroke}>
      <path d="M6 34l3-9L28 6l6 6L15 31z" fill="#f6c43a" />
      <path d="M6 34l3-9 6 6z" fill="#f1d4a8" />
      <path d="M28 6l6 6 3-3-6-6z" fill="#e8473f" />
    </g>
  ),
  can: () => (
    <g {...stroke}>
      <ellipse cx="20" cy="9" rx="11" ry="4" fill="#cfd6e4" />
      <path d="M9 9v22c0 2 5 4 11 4s11-2 11-4V9" fill="#e8473f" />
      <path d="M9 17h22M9 25h22" fill="none" stroke="#fff" strokeWidth="2" />
    </g>
  ),
  roll: () => (
    <g {...stroke}>
      <ellipse cx="20" cy="10" rx="12" ry="5" fill="#fff" />
      <path d="M8 10v20c0 3 5 5 12 5s12-2 12-5V10" fill="#f1f4fa" />
      <ellipse cx="20" cy="10" rx="4" ry="2" fill="#b9c2d4" />
    </g>
  ),
  window: () => (
    <g {...stroke}>
      <rect x="6" y="6" width="28" height="28" rx="2" fill="#cfe9ff" />
      <path d="M20 6v28M6 20h28" fill="none" strokeWidth="2" />
    </g>
  ),
  'ice-cube': () => (
    <g {...stroke}>
      <path d="M6 12l14-6 14 6v16l-14 6-14-6z" fill="#cfe9ff" />
      <path d="M6 12l14 6 14-6M20 18v16" fill="none" />
    </g>
  ),
  'sign-triangle': () => (
    <g {...stroke}>
      <path d="M20 5l16 28H4z" fill="#f6d643" />
      <path d="M20 15v9" fill="none" strokeWidth="2.4" />
      <circle cx="20" cy="28" r="1.4" fill={OUT} />
    </g>
  ),
  'dot-red': dot('#e8473f'),
  'dot-orange': dot('#f7a233'),
  'dot-yellow': dot('#f6d643'),
  'dot-green': dot('#4cae5a'),
  'dot-blue': dot('#3f8be8'),
  'dot-purple': dot('#8b5fd1'),
  'dot-white': () => <circle cx="20" cy="20" r="14" fill="#fff" {...stroke} />,
  'dot-black': dot('#33415c'),
  'sq-red': square('#e8473f'),
  'sq-orange': square('#f7a233'),
  'sq-yellow': square('#f6d643'),
  'sq-green': square('#4cae5a'),
  'sq-blue': square('#3f8be8'),
  'sq-purple': square('#8b5fd1'),
  'sq-white': () => <rect x="6" y="6" width="28" height="28" rx="5" fill="#fff" strokeDasharray="4 3" {...stroke} />,
  'sq-black': square('#33415c'),
  'diamond-blue': () => <path d="M20 4l15 16-15 16L5 20z" fill="#3f8be8" {...stroke} />,
  'tri-red': () => <path d="M20 5l16 28H4z" fill="#e8473f" {...stroke} />,
  // geometry — outlines for the flat shapes children name, filled marks for counting
  'shape-circle': () => <circle cx="20" cy="20" r="14" fill="#dcebff" {...stroke} />,
  'shape-ellipse': () => <ellipse cx="20" cy="20" rx="16" ry="10" fill="#dcebff" {...stroke} />,
  'shape-triangle': () => <path d="M20 5l16 29H4z" fill="#ffe2c7" {...stroke} />,
  'shape-square': () => <rect x="7" y="7" width="26" height="26" fill="#d9f2dc" {...stroke} />,
  'shape-rectangle': () => <rect x="3" y="11" width="34" height="18" fill="#ead9ff" {...stroke} />,
  'shape-pentagon': () => <path d="M20 4l15 11-6 18H11L5 15z" fill="#ffd9e4" {...stroke} />,
  'shape-hexagon': () => <path d="M10 6h20l8 14-8 14H10L2 20z" fill="#fff0b8" {...stroke} />,
  'shape-rhombus': () => <path d="M20 3l15 17-15 17L5 20z" fill="#cdeee9" {...stroke} />,
  'mark-circle': dot('#8b5fd1'),
  'mark-triangle': () => <path d="M20 5l16 29H4z" fill="#e8473f" {...stroke} />,
  'mark-square': square('#3f8be8'),
  'mark-diamond': () => <path d="M20 3l15 17-15 17L5 20z" fill="#4cae5a" {...stroke} />,
  'line-open': () => <path d="M6 8h22v24H6" fill="none" {...stroke} strokeWidth={3} />,
  'line-wave': () => (
    <path d="M3 22c4-12 8-12 12 0s8 12 12 0 6-8 10-4" fill="none" {...stroke} strokeWidth={3} />
  ),
  'line-arc': () => <path d="M5 30c0-14 8-22 15-22s15 8 15 22" fill="none" {...stroke} strokeWidth={3} />,
  'rod-ten': () => (
    <g {...stroke}>
      <rect x="15" y="2" width="10" height="36" rx="2" fill="#3f8be8" />
      <path d="M15 11h10M15 20h10M15 29h10" fill="none" stroke="#cfe0fa" strokeWidth="1.2" />
    </g>
  ),
  unit: () => <rect x="12" y="12" width="16" height="16" rx="2" fill="#f6d643" {...stroke} />,
  'unit-light': () => <rect x="12" y="12" width="16" height="16" rx="2" fill="#fff6c9" {...stroke} />,
  cross: () => (
    <path d="M8 8l24 24M32 8L8 32" fill="none" stroke="#d9413a" strokeWidth="4.5" strokeLinecap="round" />
  ),
};

function flower(petal: string): ReactElement {
  return (
    <g {...stroke}>
      <path d="M20 22v14" fill="none" stroke="#3fae5a" strokeWidth="2.4" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="20" cy="9" rx="5" ry="7" fill={petal} transform={`rotate(${a} 20 16)`} />
      ))}
      <circle cx="20" cy="16" r="4.4" fill="#f6c43a" />
    </g>
  );
}

function book(cover: string): ReactElement {
  return (
    <g {...stroke}>
      <path d="M8 6h22a2 2 0 0 1 2 2v26H10a2 2 0 0 1-2-2z" fill={cover} />
      <path d="M12 6v28" fill="none" stroke="#fff" strokeOpacity=".6" />
      <rect x="16" y="12" width="12" height="5" rx="1" fill="#fff" fillOpacity=".8" stroke="none" />
    </g>
  );
}

/** Draws one icon; an unknown key falls back to its own character. */
export function drawIcon(key: string): ReactElement {
  if (key.startsWith('glyph:')) {
    return (
      <text x="20" y="29" textAnchor="middle" fontSize="26">
        {key.slice(6)}
      </text>
    );
  }
  const draw = ICONS[key];
  return draw ? draw() : <circle cx="20" cy="20" r="12" fill="#cfd6e4" {...stroke} />;
}
