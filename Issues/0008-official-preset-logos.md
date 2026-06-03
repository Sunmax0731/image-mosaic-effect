# Fantia/Skebプリセットの公式ロゴと短縮表示へ差し替え

- Status: closed
- Priority: P2
- Type: enhancement
- Source: local
- Draft source: codex-cli
- Phase: 04-implementation
- Created: 2026-06-03
- QCDS: Quality, Satisfaction

## Context

プリセットボタンのロゴは正確な公式素材に近いものを使う必要がある。Fantia は指定された画像 URL から取得し、Skeb はユーザー提供の SVG データをそのまま asset として使用する。表示文言は最小化し、Fantia は `ピクセル` / `ぼかし`、Skeb はアイコンのみとする。

## Acceptance Criteria

- [x] Fantia ロゴは `https://help.fantia.jp/wp-content/uploads/2019/01/fantia-square-logo.png` から取得した PNG を使用する
- [x] Skeb ロゴはユーザー提供 SVG データを使用する
- [x] Fantia プリセットの見えるラベルは `ピクセル` / `ぼかし` のみになる
- [x] Skeb プリセットは見える文字を出さず、アイコンのみで表示される
- [x] アクセシブルなボタン名と既存プリセット操作は維持される
- [x] docs、TODO、tests、QCDS 証跡が同期される

## Notes

- Replaced generated Fantia SVG with downloaded `src/assets/fantia-square-logo.png`.
- Replaced Skeb SVG with the exact SVG payload provided by the user.
- Preset buttons use visual labels separately from accessible labels.
- Evidence: `npm run lint`, `npm test`, and `npm run test:e2e` passed on 2026-06-03.
