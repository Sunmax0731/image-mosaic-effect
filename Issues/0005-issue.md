# 画像プレビューの表示倍率操作

- Status: closed
- Priority: P2
- Type: feature
- Source: local
- Draft source: codex-cli
- Phase: 03-design
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

画像モザイク編集時のプレビュー操作性を改善するため、表示倍率に fit-to-width、fit-to-height、100% 表示、ズーム、パンを追加する。静的ブラウザアプリとして動作し、画像処理は引き続きローカルブラウザ内で完結させる。

## Acceptance Criteria

- [x] fit-to-width を選択すると、画像の縦横比を維持したままプレビュー幅に合わせて表示される。
- [x] fit-to-height を選択すると、画像の縦横比を維持したままプレビュー高さに合わせて表示される。
- [x] 100% 表示を選択すると、画像の実ピクセル相当の倍率で表示される。
- [x] ズーム操作とパン操作により、拡大中の画像位置を調整できる。
- [x] 既存の画像インポート、編集、エクスポート操作が表示倍率機能追加後も利用できる。

## Notes

- Added fit width, fit height, 100%, zoom in/out, and pan controls to the canvas toolbar.
- Display sizing is CSS-only; canvas edit coordinates and export rendering continue to use original image pixels.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

## Codex Sessions

- 2026-06-03T04:51:32.968Z `codex-session-20260603045132-yafm0p` - All Work Items (VS Code Codex handoff); access=danger-full-access; model=gpt-5.5; intelligence=xhigh; [prompt](c:/Users/gkkjh/AppData/Roaming/Code/User/workspaceStorage/2b6404d157bb45a1a5a4c8eeb27a7cab/sunmax0731.codex-friendly-project-starter/first-prompt-20260603T045132Z.md)
