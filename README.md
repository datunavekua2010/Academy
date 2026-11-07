# Academy

Axiom Academy — online mathematics and logic for Grades I–VII.

## Student area (demo)

The authenticated student dashboard lives at `#/student`. Hash routing keeps the
single-file production build portable (no server rewrites required).

- Click Axi to open or close the five radial navigation bubbles.
- `Escape`, clicking Axi again, the dismiss button, or an outside tap closes the menu.
- Bubble destinations: `#/student/lessons`, `#/student/homework`, `#/student/practice`,
  `#/student/progress`, `#/student/profile`.
- A demo student session is pre-populated so the dashboard is explorable. Use
  **გასვლა** in the header to see the session gate. Real authentication and
  authorization must be connected before production.
- The public landing page keeps its conventional navigation. A discreet
  **მოსწავლის შესვლა** link in the header/footer opens the student area.
- The footer of every student page also lists all five sections, so navigation
  remains usable if the bubble animation fails.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (single `dist/index.html`)
- `npm test` — interaction tests (jsdom)
- `npm run typecheck` — TypeScript check
