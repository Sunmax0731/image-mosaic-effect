# TODO

This file is the work contract for `image-mosaic-effect`.

## Current Iteration

- [x] [P2] [Phase:04-implementation] Fantia/Skebプリセットの公式ロゴと短縮表示へ差し替え [Issue](Issues/0008-official-preset-logos.md) [QCDS:Quality,Satisfaction]
- [x] [P2] [Phase:04-implementation] Fantia/Skebプリセットにロゴを表示 [Issue](Issues/0007-preset-logos.md) [QCDS:Quality,Satisfaction]

- [x] Remove visible `画像一覧` and `設定` section heading text.
- [x] Add an image-list show/hide toggle next to the image-list reset button.
- [x] Replace the image list when importing from a folder instead of appending to it.
- [x] Validate the updated list/settings chrome with lint, tests, e2e, and rendered screenshots.

## Completed List Reset Iteration

- [x] Add a loaded-image list reset action.
- [x] Clear the loaded-image list automatically after successful batch export.
- [x] Compress mobile settings into horizontal groups for mosaic/tool, ranges, and suffix/export format.
- [x] Increase the mobile image-list thumbnail area so thumbnails are not clipped.
- [x] Validate list reset, export reset, compact mobile settings, and larger thumbnails with lint, tests, e2e, and screenshots.

## Completed Compact Chrome Iteration

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

## Work Items
- [x] [P2] [Phase:02-specification] Fantia/Skeb向けモザイクプリセット追加 [Issue](Issues/0001-fantia-skeb.md) [QCDS:Quality,Cost,Satisfaction]
- [x] [P2] [Phase:05-test] Before/After確認ボタンの追加 [Issue](Issues/0002-before-after.md) [QCDS:Quality,Satisfaction]
- [x] [P2] [Phase:04-implementation] ブラシモザイク中のドラッグ範囲可視化 [Issue](Issues/0003-issue.md) [QCDS:Quality,Satisfaction]
- [x] [P2] [Phase:04-implementation] モバイル画像選択後の一覧自動折りたたみ [Issue](Issues/0004-issue.md) [QCDS:Quality,Satisfaction]
- [x] [P2] [Phase:03-design] 画像プレビューの表示倍率操作 [Issue](Issues/0005-issue.md) [QCDS:Quality,Satisfaction]
- [x] [P2] [Phase:04-implementation] READMEを利用者向けに整備 [Issue](Issues/0006-readme.md) [QCDS:Quality,Satisfaction]
