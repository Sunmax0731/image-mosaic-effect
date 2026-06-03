import type { ExportFormat } from '../types'

const EXTENSION_BY_FORMAT: Record<ExportFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
}

export function sanitizeSuffix(suffix: string) {
  const clean = suffix.trim().replace(/[\\/:*?"<>|]+/g, '-')
  return clean || '_mosaic'
}

export function appendSuffixToFileName(
  fileName: string,
  suffix: string,
  format: ExportFormat,
) {
  const safeSuffix = sanitizeSuffix(suffix)
  const extension = EXTENSION_BY_FORMAT[format]
  const dotIndex = fileName.lastIndexOf('.')
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
  return `${baseName}${safeSuffix}.${extension}`
}

export function readableBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
