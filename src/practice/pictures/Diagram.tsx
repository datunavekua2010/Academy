import type { ReactElement } from 'react';
import type { DrawItem, Picture } from './types';

const NAVY = '#33415c';

/** The primitives of a diagram, drawn into an `<svg>` (also used under the plane widget). */
export function DrawItems({ items }: { items: DrawItem[] }): ReactElement {
  return (
    <>
      {items.map((item, i) => {
        switch (item.t) {
          case 'poly': {
            const pts = item.pts.map(([x, y]) => `${x},${y}`).join(' ');
            return item.open ? (
              <polyline key={i} points={pts} fill="none" stroke={item.stroke ?? NAVY} strokeWidth={item.width ?? 2.5} strokeDasharray={item.dash ? '6 5' : undefined} strokeLinejoin="round" strokeLinecap="round" />
            ) : (
              <polygon key={i} points={pts} fill={item.fill ?? 'none'} stroke={item.stroke ?? NAVY} strokeWidth={item.width ?? 2.5} strokeDasharray={item.dash ? '6 5' : undefined} strokeLinejoin="round" />
            );
          }
          case 'line':
            return (
              <line
                key={i}
                x1={item.from[0]}
                y1={item.from[1]}
                x2={item.to[0]}
                y2={item.to[1]}
                stroke={item.stroke ?? NAVY}
                strokeWidth={item.width ?? 2.5}
                strokeDasharray={item.dash ? '6 5' : undefined}
                strokeLinecap="round"
                markerEnd={item.arrow ? 'url(#diagram-arrow)' : undefined}
              />
            );
          case 'circle':
            return <circle key={i} cx={item.c[0]} cy={item.c[1]} r={item.r} fill={item.fill ?? 'none'} stroke={item.stroke ?? NAVY} strokeWidth={item.width ?? 2.5} strokeDasharray={item.dash ? '6 5' : undefined} />;
          case 'path':
            return <path key={i} d={item.d} fill={item.fill ?? 'none'} stroke={item.stroke ?? NAVY} strokeWidth={item.width ?? 2.5} strokeDasharray={item.dash ? '6 5' : undefined} strokeLinejoin="round" strokeLinecap="round" />;
          case 'text':
            return (
              <text key={i} x={item.at[0]} y={item.at[1]} textAnchor={item.anchor ?? 'middle'} dominantBaseline="central" fontSize={item.size ?? 14} fontWeight={item.bold === false ? 500 : 800} fill={item.color ?? '#1d2a4a'}>
                {item.text}
              </text>
            );
          case 'dot':
            return <circle key={i} cx={item.at[0]} cy={item.at[1]} r={item.r ?? 5} fill={item.color ?? '#e8473f'} stroke="#fff" strokeWidth={1.5} />;
        }
      })}
    </>
  );
}

export function DiagramPicture({ picture }: { picture: Extract<Picture, { kind: 'diagram' }> }) {
  return (
    <div className="pic-diagram-wrap">
      {picture.label && <span className="pic-label">{picture.label}</span>}
      <svg className="pic-diagram" viewBox={`0 0 ${picture.width} ${picture.height}`} style={{ maxWidth: picture.width * 1.5 }} role="img" aria-label={picture.alt}>
        <defs>
          <marker id="diagram-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={NAVY} />
          </marker>
        </defs>
        <DrawItems items={picture.items} />
      </svg>
    </div>
  );
}
