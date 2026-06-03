import type { ExportFormat, RenderFormat } from '../types'

const EXTENSION_BY_FORMAT: Record<RenderFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

const RENDER_FORMAT_BY_EXTENSION: Record<string, RenderFormat> = {
  jpeg: 'jpeg',
  jpg: 'jpeg',
  jfif: 'jpeg',
  png: 'png',
  webp: 'webp',
}

export interface ExportTarget {
  fileName: string
  format: RenderFormat
}

export function sanitizeSuffix(suffix: string) {
  const clean = suffix.trim().replace(/[\\/:*?"<>|]+/g, '-')
  return clean || '_mosaic'
}

export function appendSuffixToFileName(
  fileName: string,
  suffix: string,
  format: RenderFormat,
) {
  const safeSuffix = sanitizeSuffix(suffix)
  const extension = EXTENSION_BY_FORMAT[format]
  const dotIndex = fileName.lastIndexOf('.')
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
  return `${baseName}${safeSuffix}.${extension}`
}

export function resolveExportTarget(
  fileName: string,
  mimeType: string,
  suffix: string,
  setting: ExportFormat,
): ExportTarget {
  const safeSuffix = sanitizeSuffix(suffix)
  const dotIndex = fileName.lastIndexOf('.')
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName

  if (setting !== 'original') {
    return {
      fileName: appendSuffixToFileName(fileName, suffix, setting),
      format: setting,
    }
  }

  const originalExtension = getImageExtension(fileName, mimeType)
  const format = RENDER_FORMAT_BY_EXTENSION[originalExtension] ?? 'png'
  const outputExtension = RENDER_FORMAT_BY_EXTENSION[originalExtension]
    ? originalExtension
    : EXTENSION_BY_FORMAT[format]

  return {
    fileName: `${baseName}${safeSuffix}.${outputExtension}`,
    format,
  }
}

export function getImageExtension(fileName: string, mimeType: string) {
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : ''
  if (extension && RENDER_FORMAT_BY_EXTENSION[extension]) {
    return extension
  }

  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return extension || 'png'
  }
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
