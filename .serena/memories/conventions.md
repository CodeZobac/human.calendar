# Conventions
- TypeScript uses strict unused-local/parameter checks, ES modules, double quotes and semicolons in source.
- React function components use named props interfaces; public component props and engine return types are compatibility boundaries.
- `src/App.tsx` owns tab/date/theme orchestration; calculation code remains under `src/engine/`.
- Preserve local calendar conversion behavior (`T12:00:00Z`) and geolocation failure fallback.
- Existing worktree edits may be user-owned; never revert unrelated changes.
- UI fonts are Cormorant Garamond for expressive roman display and Manrope for body/UI.