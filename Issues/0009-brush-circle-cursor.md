# ブラシ処理範囲を円形カーソル表示に変更

- Status: closed
- Priority: P2
- Type: correction
- Source: local
- Draft source: codex-cli
- Phase: 04-implementation
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

ブラシ処理範囲の可視化を矩形選択のような外接矩形で表示すると、実際には処理されない範囲まで覆われて見える。ブラシの処理範囲はブラシサイズに対応した円形カーソルとして表示し、矩形ツールの範囲表示とは見た目と意味を分ける。

## Acceptance Criteria

- [x] ブラシドラッグ中は現在のブラシ位置に、ブラシサイズと対応する円形カーソルが表示される。
- [x] ブラシストローク全体の外接矩形で、処理されない範囲を覆わない。
- [x] 矩形ツールのドラッグ中は従来どおり矩形範囲が表示される。
- [x] Playwright E2E がブラシ表示の円形クラス、丸い `border-radius`、正方形寸法を検証する。
- [x] README、設計、テスト計画、ユーザーガイド、QCDS 証跡、TODO が同期されている。

## Notes

- `src/App.tsx` now stores selection overlays with `shape: 'circle' | 'rect'`.
- Brush pointer movement updates only the current brush footprint; it no longer unions brush stamp bounds into a path rectangle.
- `.selection.is-circle` renders the brush cursor as a circular overlay, while `.selection.is-rect` remains rectangular.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.

