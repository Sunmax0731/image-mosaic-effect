import type { MosaicSettings } from '../types'
import { MAX_BLOCK_SIZE, MIN_BLOCK_SIZE } from './settings'

export type MosaicPresetId = 'fantiaPixelate' | 'fantiaBlur' | 'skebPixelate'

export interface MosaicPreset {
  id: MosaicPresetId
  settings: (context: MosaicPresetContext) => Partial<MosaicSettings>
}

export interface MosaicPresetContext {
  longestEdge?: number
}

export const MOSAIC_PRESETS: MosaicPreset[] = [
  {
    id: 'fantiaPixelate',
    settings: () => ({
      mosaicType: 'pixelate',
      drawTool: 'rectangle',
      brushSize: 160,
      blockSize: 72,
      strength: 1,
    }),
  },
  {
    id: 'fantiaBlur',
    settings: () => ({
      mosaicType: 'blur',
      drawTool: 'rectangle',
      brushSize: 180,
      blockSize: 64,
      strength: 1,
    }),
  },
  {
    id: 'skebPixelate',
    settings: ({ longestEdge }) => {
      const blockSize = getSkebBlockSize(longestEdge)

      return {
        mosaicType: 'pixelate',
        drawTool: 'rectangle',
        brushSize: Math.min(MAX_BLOCK_SIZE, Math.max(96, blockSize * 4)),
        blockSize,
        strength: 1,
      }
    },
  },
]

export function getPreset(id: MosaicPresetId) {
  return MOSAIC_PRESETS.find((preset) => preset.id === id)
}

export function getSkebBlockSize(longestEdge: number | undefined) {
  if (!longestEdge || longestEdge < 1) {
    return MIN_BLOCK_SIZE
  }

  return Math.min(MAX_BLOCK_SIZE, Math.max(MIN_BLOCK_SIZE, Math.ceil(longestEdge * 0.01)))
}
