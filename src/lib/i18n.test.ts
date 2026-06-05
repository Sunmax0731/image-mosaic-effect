import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  UI_COPY,
} from './i18n'

describe('i18n', () => {
  it('defaults to Japanese UI copy', () => {
    expect(DEFAULT_LANGUAGE).toBe('ja')
    expect(UI_COPY.ja.appTitle).toBe('画像モザイク加工')
    expect(UI_COPY.ja.actions.importFiles).toBe('画像を追加')
    expect(UI_COPY.ja.queue.hide).toBe('画像一覧を隠す')
    expect(UI_COPY.ja.queue.reset).toBe('リストをリセット')
    expect(UI_COPY.ja.status.imageListReset).toBe('画像一覧をリセットしました')
    expect(UI_COPY.ja.status.shareStarted).toBe('画像ファイル共有を開始しました')
    expect(UI_COPY.ja.status.shareReady).toBe('共有用画像を準備しました')
    expect(UI_COPY.ja.status.shareImageCopied).toBe(
      '画像をコピーしました。Twitter投稿画面で貼り付けてください',
    )
    expect(UI_COPY.ja.editor.fitWidth).toBe('幅に合わせる')
    expect(UI_COPY.ja.editor.shareTwitter).toBe('Twitterへ共有')
    expect(UI_COPY.ja.editor.shareNeedsMosaic).toBe('モザイク適用後にTwitter共有できます')
    expect(UI_COPY.ja.editor.copyTwitterImage).toBe('画像をコピー')
    expect(UI_COPY.ja.settings.presetLabels.skebPixelate).toBe('Skeb 1%')
    expect(UI_COPY.ja.settings.presetVisibleLabels.fantiaPixelate).toBe('ピクセル')
    expect(UI_COPY.ja.settings.presetVisibleLabels.skebPixelate).toBe('')
  })

  it('keeps English copy available for future language controls', () => {
    expect(UI_COPY.en.appTitle).toBe('Image Mosaic Effect')
    expect(UI_COPY.en.queue.show).toBe('Show image list')
    expect(UI_COPY.en.queue.reset).toBe('Reset list')
    expect(UI_COPY.en.editor.compareBefore).toBe('Before/After preview')
    expect(UI_COPY.en.editor.shareTwitter).toBe('Share to Twitter')
    expect(UI_COPY.en.status.shareUnsupported).toBe(
      'This browser does not support image file sharing',
    )
    expect(UI_COPY.en.status.shareImageCopied).toBe(
      'Image copied. Paste it into the Twitter composer.',
    )
    expect(UI_COPY.en.editor.openTwitter).toBe('Open Twitter')
    expect(normalizeLanguage('en')).toBe('en')
    expect(normalizeLanguage('unsupported')).toBe('ja')
  })
})
