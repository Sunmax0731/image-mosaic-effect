# SKILL

Use this workflow for Image Mosaic Effect maintenance and release work.

## Description

Build and validate a static browser image-editing app that imports local image batches, applies mosaic operations on canvas, persists settings locally, and exports suffixed files in a ZIP.

## Workflow

1. Read README.md, AGENTS.md, TODO.md, and docs/test-plan.md.
2. Check `git status --short --branch` before editing.
3. Add or refine TODO.md items before implementing newly discovered work.
4. Keep feature logic in `src/lib/` where possible and UI composition in `src/App.tsx`.
5. Run `npm run lint`, `npm test`, and `npm run test:e2e` before release.
6. Update docs/qcds-evaluation.md and docs/qcds-strict-metrics.json when validation results change.
7. Build with `npm run build` and mirror `dist/` to `D:\AI\GithubPages\image-mosaic-effect` for GitHub Pages release prep.

## Static Site Constraints

- Prefer localStorage, browser File APIs, Canvas, and client-side ZIP download.
- Do not require server-side image processing.
- Document browser limitations for folder import and direct directory save, especially on mobile browsers.
