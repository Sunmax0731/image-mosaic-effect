import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, normalizeSettings } from './settings'

describe('settings persistence schema', () => {
  it('returns defaults for invalid payloads', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps valid settings and clamps unsafe numeric values', () => {
    expect(
      normalizeSettings({
        mosaicType: 'noise',
        drawTool: 'rectangle',
        brushSize: 999,
        blockSize: 1,
        strength: 2,
        suffix: '_done',
        exportFormat: 'jpeg',
        jpegQuality: 0.1,
      }),
    ).toMatchObject({
      mosaicType: 'noise',
      drawTool: 'rectangle',
      brushSize: 220,
      blockSize: 4,
      strength: 1,
      suffix: '_done',
      exportFormat: 'jpeg',
      jpegQuality: 0.6,
    })
  })
})
