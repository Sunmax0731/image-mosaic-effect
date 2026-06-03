# ブラシモザイク中のドラッグ範囲可視化

- Status: closed
- Priority: P2
- Type: feature
- Source: local
- Draft source: codex-cli
- Phase: 04-implementation
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

画像をブラシでモザイク処理する際、スワイプまたはドラッグ中の処理範囲が見えず、ユーザーが適用範囲を把握しにくい。矩形選択のような可視フィードバックを追加し、ローカルブラウザ上の静的アプリとして画像処理フローを維持したまま操作性を改善する。

## Acceptance Criteria

- [x] ブラシモザイク操作中、ドラッグ開始から終了まで現在の選択範囲が矩形などの視覚表現で表示される。
- [x] ドラッグ終了時に、可視化された範囲と実際にモザイク処理される範囲が一致する。
- [x] タッチ操作とマウス操作の両方で範囲表示が破綻しない。
- [x] 既存の画像インポート、編集、エクスポート操作に回帰がない。

## Notes

- Brush drags now show the clamped bounding rectangle for the brush stamp path while pointer input is active.
- The same selection overlay is reused for rectangle drags, and Playwright validates the overlay during mouse drag.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

## Codex Sessions

- 2026-06-03T04:51:32.968Z `codex-session-20260603045132-yafm0p` - All Work Items (VS Code Codex handoff); access=danger-full-access; model=gpt-5.5; intelligence=xhigh; [prompt](c:/Users/gkkjh/AppData/Roaming/Code/User/workspaceStorage/2b6404d157bb45a1a5a4c8eeb27a7cab/sunmax0731.codex-friendly-project-starter/first-prompt-20260603T045132Z.md)
