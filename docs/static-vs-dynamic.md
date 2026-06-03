# Static vs Dynamic Architecture Notes

## Static Site Implementation

The current implementation is a GitHub Pages-compatible static app.

- Image import: browser File APIs.
- Editing: Canvas in the user's browser.
- Settings persistence: localStorage.
- Batch save: client-side ZIP download.
- Release artifact: Vite `dist/` copied into the GitHub Pages repository.

## Main Challenges

- Directory access is browser-dependent. Chromium desktop exposes folder selection, while mobile support is inconsistent.
- Direct file-system writes are not portable. A static app can download a ZIP, but cannot reliably write back into the original folder on every browser.
- Large images consume local memory and CPU. A backend could resize, queue, or process images with stronger resource control.
- Settings are per browser profile. A backend could sync settings and project progress across devices.
- A backend could enforce job history, audit trails, permissions, and resumable batch processing.

## Reason for Static First

The static approach fits GitHub Pages, keeps deployment cost low, and preserves image privacy because no upload path exists.
