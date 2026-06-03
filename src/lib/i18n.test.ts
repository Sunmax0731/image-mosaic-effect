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
    expect(UI_COPY.ja.queue.reset).toBe('リストをリセット')
    expect(UI_COPY.ja.status.imageListReset).toBe('画像一覧をリセットしました')
  })

  it('keeps English copy available for future language controls', () => {
    expect(UI_COPY.en.appTitle).toBe('Image Mosaic Effect')
    expect(UI_COPY.en.queue.reset).toBe('Reset list')
    expect(normalizeLanguage('en')).toBe('en')
    expect(normalizeLanguage('unsupported')).toBe('ja')
  })
})
