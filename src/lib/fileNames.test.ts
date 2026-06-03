import { describe, expect, it } from 'vitest'
import { appendSuffixToFileName, resolveExportTarget, sanitizeSuffix } from './fileNames'

describe('file name helpers', () => {
  it('adds a suffix before the export extension', () => {
    expect(appendSuffixToFileName('sample.photo.jpg', '_masked', 'png')).toBe(
      'sample.photo_masked.png',
    )
  })

  it('sanitizes characters that are invalid on Windows paths', () => {
    expect(sanitizeSuffix('_a:b*c?')).toBe('_a-b-c-')
  })

  it('preserves the original supported extension when requested', () => {
    expect(resolveExportTarget('camera.JFIF', 'image/jpeg', '_mosaic', 'original')).toEqual({
      fileName: 'camera_mosaic.jfif',
      format: 'jpeg',
    })
    expect(resolveExportTarget('screen.webp', 'image/webp', '_mosaic', 'original')).toEqual({
      fileName: 'screen_mosaic.webp',
      format: 'webp',
    })
  })

  it('falls back to png for unsupported original extensions', () => {
    expect(resolveExportTarget('motion.gif', 'image/gif', '_mosaic', 'original')).toEqual({
      fileName: 'motion_mosaic.png',
      format: 'png',
    })
  })
})
