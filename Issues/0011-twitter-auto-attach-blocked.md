# Twitter画像添付の完全自動化

- Status: blocked
- Priority: P2
- Type: feature
- Source: local
- Phase: 02-specification
- Created: 2026-06-05
- QCDS: Quality, Delivery, Satisfaction

## Context

`Twitterへ共有` で投稿画面に画像添付まで自動化したい。ただし、現行の静的ブラウザアプリではユーザーのローカル画像を Twitter Web Intent に直接添付する標準手段がない。

## Blocker

- X/Twitter Web Intent は投稿文、URL、ハッシュタグなどを事前入力できるが、ローカル画像ファイルを添付するパラメータがない。
- Web ページは別 origin の Twitter 投稿画面のファイル入力へ、ユーザーのローカルファイルや Blob を自動設定できない。
- 画像を X API の media upload で添付するには、ユーザー認可、API credentials、X への画像アップロード経路が必要になる。これは「静的サイト」「ユーザー画像はローカルに留める」という現行契約外。
- ブラウザ拡張や外部自動化で Twitter 画面を操作する案も、GitHub Pages 配信の静的アプリ単体では成立しない。

## Current Feasible Path

- `Issues/0010-twitter.md` では、現在の加工済み画像1枚だけを共有用 PNG として準備する。
- 共有パネルから `画像をコピー`、`Twitterを開く`、`画像を保存` を別々のユーザー操作として提供する。
- 投稿文はユーザー指定どおり、以下の2行だけにする。

```text
#画像モザイク加工 #ImageMosaicEffect
https://sunmax0731.github.io/image-mosaic-effect/
```

## Unblock Conditions

- ユーザーが X API media upload と OAuth 認可、またはブラウザ拡張/外部自動化の導入を明示承認する。
- その場合は、画像アップロード経路、認可方式、API credential 管理、GitHub Pages で成立するかどうかを別途設計する。

## Notes

- 2026-06-05: X/Twitter 公式 Web Intent docs の投稿 intent は `text`、`url`、`hashtags` などの事前入力用途であり、画像添付パラメータは見つからなかった。
- 2026-06-05: X/Twitter 公式 media upload docs では、画像添付には media upload API が必要で、ローカル画像を X 側へアップロードする経路になる。
