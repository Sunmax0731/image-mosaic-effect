# Fantia/Skeb向けモザイクプリセット追加

- Status: closed
- Priority: P2
- Type: feature
- Source: local
- Draft source: codex-cli
- Phase: 02-specification
- Created: 2026-06-03
- QCDS: Quality, Cost, Satisfaction

## Context

Fantia と Skeb 向けのモザイク基準に合わせた設定を、ユーザーが手動調整せずに選べるプリセットとして追加する。Fantia は添付画像の基準を読み取り、1枚目はピクセル処理、2枚目はぼかし処理の参考値として扱う。Skeb は「モザイクで処理される場合は単位あたりキャンバス長辺の1%以上が必要」という定量条件を満たす設定にする。ユーザー画像はブラウザ内で処理し、静的サイトとして動作する前提を維持する。

## Acceptance Criteria

- [x] Fantia向けのピクセル処理プリセットが追加され、ボタン操作で該当するモザイク設定に切り替わる
- [x] Fantia向けのぼかし処理プリセットが追加され、ボタン操作で該当するぼかし設定に切り替わる
- [x] Skeb向けプリセットはキャンバス長辺の1%以上を単位サイズとして満たすモザイク設定を適用する
- [x] 各プリセット適用後、既存の画像読み込み・編集・書き出しフローが継続して動作する
- [x] プリセット設定の根拠と完了条件がREADME、docs、またはTODOの該当箇所と整合している

## Attachments

![image.png](assets/0001-fantia-skeb/01-image.png)
![image.png](assets/0001-fantia-skeb/02-image.png)

## Notes

- Implemented `src/lib/presets.ts` and settings-panel preset buttons.
- Fantia pixelate uses rectangle selection, pixelate, block size 72, strength 1. Fantia blur uses rectangle selection, blur, block size 64, strength 1.
- Skeb 1% computes block size as `ceil(longEdge * 0.01)` with a 4 px minimum and 512 px maximum.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

## Codex Sessions

- 2026-06-03T04:51:32.968Z `codex-session-20260603045132-yafm0p` - All Work Items (VS Code Codex handoff); access=danger-full-access; model=gpt-5.5; intelligence=xhigh; [prompt](c:/Users/gkkjh/AppData/Roaming/Code/User/workspaceStorage/2b6404d157bb45a1a5a4c8eeb27a7cab/sunmax0731.codex-friendly-project-starter/first-prompt-20260603T045132Z.md)
