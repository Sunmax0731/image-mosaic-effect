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
  })

  it('keeps English copy available for future language controls', () => {
    expect(UI_COPY.en.appTitle).toBe('Image Mosaic Effect')
    expect(normalizeLanguage('en')).toBe('en')
    expect(normalizeLanguage('unsupported')).toBe('ja')
  })
})
