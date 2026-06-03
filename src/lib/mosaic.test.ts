import { describe, expect, it } from 'vitest'
import { clampRegion, createBrushOperation, normalizeRectangle } from './mosaic'
import { DEFAULT_SETTINGS } from './settings'

describe('mosaic geometry helpers', () => {
  it('normalizes drag direction into a positive rectangle', () => {
    expect(normalizeRectangle({ x: 90, y: 80 }, { x: 10, y: 20 })).toEqual({
      x: 10,
      y: 20,
      width: 80,
      height: 60,
    })
  })

  it('clamps operation regions to the canvas', () => {
    expect(clampRegion({ x: -10, y: 20, width: 40, height: 90 }, 100, 80)).toEqual({
      x: 0,
      y: 20,
      width: 30,
      height: 60,
    })
  })

  it('creates brush operations from current persisted settings', () => {
    expect(createBrushOperation({ x: 50, y: 60 }, DEFAULT_SETTINGS, 'fixed-id')).toMatchObject({
      id: 'fixed-id',
      shape: 'circle',
      type: DEFAULT_SETTINGS.mosaicType,
      width: DEFAULT_SETTINGS.brushSize,
      height: DEFAULT_SETTINGS.brushSize,
      blockSize: DEFAULT_SETTINGS.blockSize,
      strength: DEFAULT_SETTINGS.strength,
    })
  })
})
