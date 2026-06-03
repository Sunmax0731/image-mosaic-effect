# Test Plan

## Automated Checks

- `npm run lint`
  - ESLint over TypeScript and React files.
- `npm test`
  - Vitest unit tests for settings schema, file names, and mosaic geometry.
  - TypeScript build and Vite production build.
- `npm run test:e2e`
  - Playwright Chromium checks for nonblank render, image import, canvas edit, settings persistence, and ZIP export.
  - Desktop Chrome and mobile Chrome projects are configured.

## Runtime Gate

Platform gate for WebApp:

1. Open the app in Chrome or headless Chromium.
2. Confirm the page is nonblank and titled `Image Mosaic Effect`.
3. Confirm queue, canvas/editor, and settings surfaces are visible.
4. Import at least one image.
5. Apply a brush or rectangle mosaic operation.
6. Change a persisted setting and reload to confirm it remains.
7. Export all and confirm a ZIP download is produced.

## Manual Mobile Notes

- On mobile browsers, folder picking may be unavailable or converted into photo-library selection.
- ZIP export support should be confirmed on the target phone because download handling differs between mobile browsers.
