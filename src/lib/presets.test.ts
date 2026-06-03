import { describe, expect, it } from 'vitest'
import { getPreset, getSkebBlockSize } from './presets'

describe('mosaic presets', () => {
  it('provides Fantia pixelate and blur presets', () => {
    expect(getPreset('fantiaPixelate')?.settings({})).toMatchObject({
      mosaicType: 'pixelate',
      drawTool: 'rectangle',
      blockSize: 72,
      strength: 1,
    })
    expect(getPreset('fantiaBlur')?.settings({})).toMatchObject({
      mosaicType: 'blur',
      drawTool: 'rectangle',
      blockSize: 64,
      strength: 1,
    })
  })

  it('sets Skeb pixelate units to at least one percent of the long edge', () => {
    expect(getSkebBlockSize(2142)).toBe(22)
    expect(getSkebBlockSize(640)).toBe(7)
    expect(getSkebBlockSize(undefined)).toBe(4)
  })
})
