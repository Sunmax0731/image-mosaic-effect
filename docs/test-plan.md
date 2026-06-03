# Test Plan

## Automated Checks

- `npm run lint`
  - ESLint over TypeScript and React files.
- `npm test`
  - Vitest unit tests for settings schema, file names, mosaic geometry, i18n, and preset sizing.
  - TypeScript build and Vite production build.
- `npm run test:e2e`
  - Playwright Chromium checks for Japanese default UI, internal language switching API, nonblank render, one-row primary import/export controls, top-toolbar settings reset, hidden queue/settings section headings, image-list show/hide toggle, image-list reset, folder import list replacement, auto list reset after export, multi-image import, official Fantia logo presets with shortened visible labels, icon-only Skeb preset, Before/After toggle, brush drag range visualization, preview fit/zoom/pan controls, mobile auto-collapse after queue selection, larger thumbnail-only queue, internal queue scrolling, visible canvas position, mobile horizontal settings groups, single-button settings panel toggle, hidden editor status text, canvas edit, settings persistence, and ZIP export.
  - Desktop Chrome and mobile Chrome projects are configured.

## Runtime Gate

Platform gate for WebApp:

1. Open the app in Chrome or headless Chromium.
2. Confirm the page is nonblank and titled `Image Mosaic Effect`.
3. Confirm queue, canvas/editor, and settings surfaces are visible with Japanese UI copy.
4. Import enough images to overflow the queue and confirm the queue scrolls inside its panel without page-level scrolling.
5. Confirm image add, folder import, and export all are on the same row.
6. Confirm settings reset is immediately to the right of the settings show/hide button.
7. Confirm the visible `画像一覧` and `設定` section headings are not rendered.
8. Confirm queue items show larger thumbnails without file names, dimensions, or data sizes.
9. Hide and show the image list from the single icon button placed left of the list reset trash button.
10. Import a folder after a file import and confirm the list is replaced instead of appended.
11. Reset the image list manually and confirm thumbnails and active canvas are cleared.
12. Confirm the active image is visible in the canvas area without filename, dimension, editor-state, instruction, or bottom status text.
13. On smartphone width, confirm mosaic/tool, brush/block/strength, and suffix/export format groups each stay on one row without settings-panel scrolling.
14. Confirm Fantia pixelate and Fantia blur show the official Fantia logo with only `ピクセル` / `ぼかし` visible, and Skeb 1% shows only the Skeb logo while all presets switch the relevant settings.
15. Confirm brush and rectangle drag operations display a visible range while dragging.
16. Confirm Before/After toggles original and edited preview without removing operations.
17. Confirm fit-to-width, fit-to-height, 100%, zoom in/out, and pan change the preview only.
18. On smartphone width, select a thumbnail and confirm the image list collapses automatically, then can be reopened.
19. Hide and show the settings panel from the same always-visible toolbar button.
20. Confirm `window.imageMosaicEffect.setLanguage('en')` switches copy internally and `setLanguage('ja')` restores Japanese.
21. Confirm `Original extension` is the default export format.
22. Apply a brush or rectangle mosaic operation.
23. Change a persisted setting and reload to confirm it remains.
24. Export all and confirm a ZIP download is produced and the image list is cleared after the export.

## Manual Mobile Notes

- See [docs/user-guide.md](user-guide.md) for the user-facing manual checklist.
- On mobile browsers, folder picking may be unavailable or converted into photo-library selection.
- ZIP export support should be confirmed on the target phone because download handling differs between mobile browsers.
