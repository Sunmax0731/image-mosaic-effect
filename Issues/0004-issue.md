# モバイル画像選択後の一覧自動折りたたみ

- Status: closed
- Priority: P2
- Type: feature
- Source: local
- Draft source: codex-cli
- Phase: 04-implementation
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

モバイル画面で画像選択後も画像一覧が表示されたままだと編集領域が狭くなるため、画像選択完了時に画像一覧を自動で折りたたみ、編集作業へ自然に移れるようにする。静的ブラウザアプリとして画像はローカル処理のまま維持する。

## Acceptance Criteria

- [x] モバイル幅の画面で画像一覧から画像を選択すると、選択後に画像一覧が自動で折りたたまれる。
- [x] 折りたたみ後も選択した画像の編集ビューと主要操作が利用できる。
- [x] ユーザーが画像一覧を再表示して別の画像を選択できる。
- [x] デスクトップ幅での既存の画像一覧表示や選択挙動が意図せず変わらない。

## Notes

- Queue thumbnail selection now collapses the image list only when the viewport matches the mobile media query.
- The queue show button remains available so another image can be selected.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

## Codex Sessions

- 2026-06-03T04:51:32.968Z `codex-session-20260603045132-yafm0p` - All Work Items (VS Code Codex handoff); access=danger-full-access; model=gpt-5.5; intelligence=xhigh; [prompt](c:/Users/gkkjh/AppData/Roaming/Code/User/workspaceStorage/2b6404d157bb45a1a5a4c8eeb27a7cab/sunmax0731.codex-friendly-project-starter/first-prompt-20260603T045132Z.md)
