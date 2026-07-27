# Human Cycles
- Single-page React app; `src/App.tsx` owns six tab views and shared date/theme/geolocation state.
- Cycle calculations and public reading types live under `src/engine/`; UI should consume them without changing formulas.
- View components live in `src/components/`; `src/services/geo.ts` handles dawn/geolocation fallback.
- Theme persistence contract: `localStorage["theme"]` with `dark`/`light` and `document.documentElement.dataset.theme`.
- Read `mem:tech_stack` for tooling, `mem:conventions` for code patterns, and `mem:task_completion` before handoff.