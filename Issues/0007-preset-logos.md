# Fantia/Skebプリセットにロゴを表示

- Status: closed
- Priority: P2
- Type: enhancement
- Source: local
- Draft source: codex-cli
- Phase: 04-implementation
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

プリセットボタンがテキストだけでは Fantia / Skeb の識別性が弱いため、ユーザー提供のロゴ画像に合わせた静的ロゴ asset を表示する。GitHub Pages のサブパス配信で壊れないよう、Vite の asset import として扱う。

## Acceptance Criteria

- [x] Fantia向けプリセットボタンに Fantia ロゴが表示される
- [x] Skeb向けプリセットボタンに Skeb ロゴが表示される
- [x] ロゴ表示後もプリセットのアクセシブルなボタン名と既存クリック操作が維持される
- [x] 静的サイト配信で参照できる asset としてビルドされる
- [x] docs、TODO、tests、QCDS 証跡が同期される

## Notes

- Initial logo assets were implemented here; exact official/source-provided logo replacement is tracked in [0008](0008-official-preset-logos.md).
- Preset buttons render the logo image with an empty alt and retain visible text labels for accessibility.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.
