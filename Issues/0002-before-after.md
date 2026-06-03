# Before/After確認ボタンの追加

- Status: closed
- Priority: P2
- Type: feature
- Source: local
- Draft source: codex-cli
- Phase: 05-test
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

モザイク処理結果を適用前画像と比較して確認できる機能を追加する。既存の「1つ戻る」「リセット」ボタンの並びにBefore/After確認機能を呼び出すボタンを配置し、編集作業中の比較確認をしやすくする。

## Acceptance Criteria

- [x] モザイク処理前後の表示を比較できるBefore/After確認機能が利用できる
- [x] Before/After確認ボタンが既存の「1つ戻る」「リセット」ボタンの並びに配置されている
- [x] ボタン操作により現在の編集状態を壊さずにBefore/After確認を開始または切り替えできる
- [x] 未処理画像やリセット後など比較対象がない状態でもUIが破綻しない

## Notes

- Added an icon button beside previous/next/undo/reset to toggle original-preview and edited-preview drawing.
- The toggle redraws the canvas only; it does not mutate the image operation list.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

## Codex Sessions

- 2026-06-03T04:51:32.968Z `codex-session-20260603045132-yafm0p` - All Work Items (VS Code Codex handoff); access=danger-full-access; model=gpt-5.5; intelligence=xhigh; [prompt](c:/Users/gkkjh/AppData/Roaming/Code/User/workspaceStorage/2b6404d157bb45a1a5a4c8eeb27a7cab/sunmax0731.codex-friendly-project-starter/first-prompt-20260603T045132Z.md)
