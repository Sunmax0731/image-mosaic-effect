import type { DrawTool, ExportFormat, MosaicSettings, MosaicType } from '../types'

export const SETTINGS_KEY = 'image-mosaic-effect.settings.v1'

export const DEFAULT_SETTINGS: MosaicSettings = {
  version: 1,
  mosaicType: 'pixelate',
  drawTool: 'brush',
  brushSize: 72,
  blockSize: 18,
  strength: 0.86,
  suffix: '_mosaic',
  exportFormat: 'original',
  jpegQuality: 0.92,
}

const MOSAIC_TYPES = new Set(['pixelate', 'blur', 'noise'])
const DRAW_TOOLS = new Set(['brush', 'rectangle'])
const EXPORT_FORMATS = new Set(['original', 'png', 'jpeg'])

export function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  return Math.min(max, Math.max(min, value))
}

export function normalizeSettings(value: unknown): MosaicSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS
  }

  const candidate = value as Partial<MosaicSettings>
  const mosaicType = isMosaicType(candidate.mosaicType)
    ? candidate.mosaicType
    : DEFAULT_SETTINGS.mosaicType
  const drawTool = isDrawTool(candidate.drawTool)
    ? candidate.drawTool
    : DEFAULT_SETTINGS.drawTool
  const exportFormat = isExportFormat(candidate.exportFormat)
    ? candidate.exportFormat
    : DEFAULT_SETTINGS.exportFormat

  return {
    version: 1,
    mosaicType,
    drawTool,
    brushSize: clampNumber(candidate.brushSize, DEFAULT_SETTINGS.brushSize, 16, 220),
    blockSize: clampNumber(candidate.blockSize, DEFAULT_SETTINGS.blockSize, 4, 48),
    strength: clampNumber(candidate.strength, DEFAULT_SETTINGS.strength, 0.1, 1),
    suffix:
      typeof candidate.suffix === 'string' && candidate.suffix.trim()
        ? candidate.suffix.trim().slice(0, 32)
        : DEFAULT_SETTINGS.suffix,
    exportFormat,
    jpegQuality: clampNumber(candidate.jpegQuality, DEFAULT_SETTINGS.jpegQuality, 0.6, 1),
  }
}

function isMosaicType(value: unknown): value is MosaicType {
  return typeof value === 'string' && MOSAIC_TYPES.has(value)
}

function isDrawTool(value: unknown): value is DrawTool {
  return typeof value === 'string' && DRAW_TOOLS.has(value)
}

function isExportFormat(value: unknown): value is ExportFormat {
  return typeof value === 'string' && EXPORT_FORMATS.has(value)
}

export function loadSettings(storage: Storage | undefined = globalThis.localStorage) {
  if (!storage) {
    return DEFAULT_SETTINGS
  }

  try {
    return normalizeSettings(JSON.parse(storage.getItem(SETTINGS_KEY) ?? 'null'))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(
  settings: MosaicSettings,
  storage: Storage | undefined = globalThis.localStorage,
) {
  if (!storage) {
    return
  }

  storage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
}
