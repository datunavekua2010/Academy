# Academy

Axiom Academy — online mathematics and logic for Grades I–VII.

## Student area

The student dashboard lives at `#/student`. Hash routing keeps static-host
navigation portable (no server rewrites required). The build emits a small initial
entry and loads the landing and app bundles on demand. Serve the whole `dist/`
directory over HTTP(S); opening `index.html` as a local file is not supported.

- Click Axi to open or close the six radial navigation bubbles.
- `Escape`, clicking Axi again, the dismiss button, or an outside tap closes the menu.
- Bubble destinations: `#/student/lessons`, `#/student/homework`, `#/student/practice`,
  `#/student/progress`, `#/student/achievements`, `#/student/profile`.
- For now, the student area opens automatically as a clearly labelled **test
  account**, without sign-in. Test data is stored only in this browser under
  isolated keys, never sent to Supabase, and must not be treated as private or
  real student information. Anyone with access to the site can use it.
- The public landing page keeps its conventional navigation. A discreet
  **მოსწავლის შესვლა** link in the header/footer opens the student area.
- The footer of every student page also lists all six sections, so navigation
  remains usable if the bubble animation fails.

## Unified practice and homework system

There is **one** practice system. Homework is the assigned subset of it, not a
separate product, question set or engine.

```
src/practice/
  scoring.ts          the only scoring engine (100-point rules)
  session.ts          the only question runner state machine
  curriculum.ts       Grade → Topic → Unit → Subtopic taxonomy (I–VII)
  bank/               the only question bank (grade1…grade7 + index)
  store.ts            attempts/progress + demo assignments (localStorage)
  PracticeProvider.tsx  wires bank + engine + store for the whole student area
  components/
    PracticeSession.tsx     the runner used by BOTH homework and practice
    CurriculumAccordion.tsx the nested Grade → Topic → Unit → Subtopic menu
    ScoringRules.tsx        rules table rendered from the engine constants
    ScoreMeter.tsx          the one score visual
```

- **Content model** — every question is stored with its grade, topic and subtopic
  ids, and questions are drawn randomly from the subtopic's bank. Units group
  subtopics inside a topic; they are a grouping only, so adding or reshaping
  units never changes a stored score or attempt.
- **Navigation** — the practice page lists every primary topic of the selected
  grade as an accordion. Expanding a topic reveals its units (U1, U2, …), and
  expanding a unit reveals its subtopics; clicking a subtopic opens the exercise
  session for that exact grade → topic → unit → subtopic. Other topics stay
  visible while one is expanded.
- **One workflow** — `Homework` and `Practice` pages both mount the same
  `PracticeSession`. Homework simply filters the list to academy assignments.
- **100-point scoring** — the band is chosen from the score *before* each answer:

  | Score before answering | Correct | Wrong |
  | --- | --- | --- |
  | below 80 | +4 | −2 |
  | 80 – 89 | +2 | −1 |
  | 90 – 99 | +1 | −1 |

  The session ends at exactly 100, never exceeds it, and never drops below 0.
  Points gained/lost are shown after every answer.
- **Progress** — attempts are the single source of truth. Homework completion,
  topic mastery and "needs more work" are derived from them, and they persist in
  `localStorage` (`axiom-academy.practice.v1`) plus a resumable draft session.
- No worksheets, file downloads or photo uploads anywhere in the flow.

### Replacing the demo content

1. Curriculum: edit `src/practice/curriculum.ts` (topic → unit → subtopic ids).
   Units are numbered U1, U2, … from their order in the file.
2. Questions: edit the `src/practice/bank/gradeN.ts` files — each entry is
   `S(prompt, options, correctIndex, explanation, difficulty)`.
3. Assignments: replace `buildDemoAssignments` in `store.ts` with the academy API.
4. Accounts: replace the localStorage reads/writes in `store.ts` with the
   student's account API; the UI is unchanged.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production static build (`dist/index.html` plus hashed assets)
- `node scripts/check-entry-build.mjs` — check the initial payload and required assets after a build
- `npm test` — scoring, bank and interaction tests (jsdom)
- `npm run typecheck` — TypeScript check

## Deployment (Cloudflare Workers)

This project deploys to **Cloudflare Workers as static assets only**. The build
includes `dist/index.html`, hashed JS/CSS and static assets; there is no Worker
script. Deploy the entire `dist/` directory. `wrangler.toml` supplies the
assets-only configuration:

```toml
name = "axiom-academy"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

Without `[assets]`, Workers Builds looks for a Worker entry point, finds none,
and the deployment fails — which is why the file exists. Under Workers Builds
the settings are:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Routing is hash-based (`#/student/practice`), so every route resolves to the
same `index.html`; `not_found_handling` is only there so a future real-path
route keeps working.

To check the configuration locally without deploying:

```bash
npm run build
npx wrangler dev     # serves dist/ exactly as production will
```

## Supabase (sign-in deferred)

See [Supabase setup and security notes](docs/supabase.md) for build-time configuration, the review-only migration and seed, account provisioning, tests, and current limitations. Real account sign-in is currently disabled, even when Supabase variables are configured. Restore it deliberately only after review; no migration is applied automatically.

The 28-item achievement gallery is a catalog preview only; award validation and notifications are blocked until trusted server-side evidence is available. See [achievement system prerequisites](docs/achievement-system.md).
