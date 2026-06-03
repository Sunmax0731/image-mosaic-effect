# Test Plan

## Automated Checks

- `npm run lint`
  - ESLint over TypeScript and React files.
- `npm test`
  - Vitest unit tests for settings schema, file names, and mosaic geometry.
  - TypeScript build and Vite production build.
- `npm run test:e2e`
  - Playwright Chromium checks for Japanese default UI, internal language switching API, nonblank render, one-row primary import/export controls, top-toolbar settings reset, compact settings header, multi-image import, thumbnail-only queue, internal queue scrolling, visible canvas position, single-button settings panel toggle, hidden editor status text, canvas edit, settings persistence, and ZIP export.
  - Desktop Chrome and mobile Chrome projects are configured.

## Runtime Gate

Platform gate for WebApp:

1. Open the app in Chrome or headless Chromium.
2. Confirm the page is nonblank and titled `Image Mosaic Effect`.
3. Confirm queue, canvas/editor, and settings surfaces are visible with Japanese UI copy.
4. Import enough images to overflow the queue and confirm the queue scrolls inside its panel without page-level scrolling.
5. Confirm image add, folder import, and export all are on the same row.
6. Confirm settings reset is immediately to the right of the settings show/hide button.
7. Confirm queue items show larger thumbnails without file names, dimensions, or data sizes.
8. Confirm the active image is visible in the canvas area without filename, dimension, editor-state, instruction, or bottom status text.
9. Confirm the settings panel header shows only `設定` and does not show persisted-state text or icon.
10. Hide and show the settings panel from the same always-visible toolbar button.
11. Confirm `window.imageMosaicEffect.setLanguage('en')` switches copy internally and `setLanguage('ja')` restores Japanese.
12. Confirm `Original extension` is the default export format.
13. Apply a brush or rectangle mosaic operation.
14. Change a persisted setting and reload to confirm it remains.
15. Export all and confirm a ZIP download is produced.

## Manual Mobile Notes

- On mobile browsers, folder picking may be unavailable or converted into photo-library selection.
- ZIP export support should be confirmed on the target phone because download handling differs between mobile browsers.
