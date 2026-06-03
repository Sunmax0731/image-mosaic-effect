# TODO

This file is the work contract for `image-mosaic-effect`.

## Current Iteration

- [x] Move the settings reset action next to the settings show/hide toggle in the top toolbar.
- [x] Keep import files, import folder, and export all on one row across mobile widths.
- [x] Remove editor header status/instruction text and the bottom progress/tool status bar.
- [x] Remove the persisted-status text and icon from the settings panel header.
- [x] Validate the compact editor UI with lint, tests, e2e, and rendered screenshots.

## Completed Localization Iteration

- [x] Replace the settings panel close button with one always-visible toggle button whose label/state changes.
- [x] Localize visible UI text to Japanese by default.
- [x] Add language-switching infrastructure without rendering a language selector UI.
- [x] Simplify image thumbnails by hiding file names, dimensions, and data-size text.
- [x] Remove current-image file name and dimensions from the editor header.
- [x] Validate the adjusted UI with lint, tests, e2e, and rendered screenshots.

## Completed Layout Iteration

- [x] Keep the active image visible without page-level scrolling after large batch import.
- [x] Make the queue list scroll inside its panel instead of expanding the whole page.
- [x] Make `Original extension` the default export format and preserve loaded image extensions where canvas export supports them.
- [x] Add a settings panel show/hide toggle.
- [x] Validate the adjusted layout and export behavior.

## Completed Baseline

- [x] Create public GitHub remote `Sunmax0731/image-mosaic-effect`.
- [x] Scaffold React + Vite static app under `D:\AI\WebApp\image-mosaic-effect`.
- [x] Create repo governance files: README.md, AGENTS.md, SKILL.md, TODO.md.
- [x] Implement local image batch import with file and folder inputs.
- [x] Implement canvas mosaic editing with brush and rectangle tools.
- [x] Persist mosaic parameters for the next browser session.
- [x] Implement suffixed batch export as static-site-safe ZIP download.
- [x] Add unit tests and headless browser runtime gate.
- [x] Update docs/design.md and docs/test-plan.md.
- [x] Create QCDS evaluation and strict metrics JSON.
- [x] Build, mirror to `D:\AI\GithubPages\image-mosaic-effect`, and package docs ZIP.
- [x] Commit and push according to the repository policy.
