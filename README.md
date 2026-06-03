# Image Mosaic Effect

Image Mosaic Effect is a static browser app for importing local image batches, manually applying mosaic effects, persisting parameters, and exporting suffixed results as a ZIP.

## Features

- Import multiple image files or a browser-supported folder selection.
- Edit one image at a time with brush or rectangle mosaic operations.
- Choose Pixelate, Blur, or Noise mosaic styles.
- Tune brush size, block size, strength, suffix, and output format.
- Use the original image extension by default when exporting; PNG and JPEG can be forced.
- Toggle the settings panel to give the canvas more room.
- Persist settings in localStorage for the next browser session.
- Export all loaded images with a suffix in a client-side ZIP.

## Local Commands

```powershell
npm install
npm run dev
npm run lint
npm test
npm run test:e2e
npm run build
```

## Static Release Shape

The app is designed for GitHub Pages and uses `base: './'`, so the built `dist/` directory can be copied to:

```text
D:\AI\GithubPages\image-mosaic-effect
```

No server-side image processing is required. User images are read through browser File APIs, edited with Canvas, and exported locally.

## Static vs Dynamic Implementation Tradeoffs

Compared with a server-backed implementation, the static site has these constraints:

- Folder import support depends on browser File API behavior. Desktop Chromium supports directory selection; mobile browsers may only expose multi-file/photo selection.
- Direct save-back-to-folder is limited. A ZIP download is the portable static-site path, while server-side or File System Access API workflows can provide stronger folder-write ergonomics.
- Large image batches use device memory and CPU because processing runs in the browser.
- Cross-device work history is not shared because settings are persisted locally and images are not uploaded.
- Background batch processing and audit logging are limited without a backend.

The upside is privacy and deployment simplicity: images never leave the browser, and GitHub Pages can host the app as static assets.

## Repository Docs

- [AGENTS.md](AGENTS.md) - repository rules.
- [SKILL.md](SKILL.md) - maintenance workflow.
- [TODO.md](TODO.md) - current work contract.
- [docs/design.md](docs/design.md) - UI and UX design notes.
- [docs/test-plan.md](docs/test-plan.md) - validation plan.
