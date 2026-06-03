import { describe, expect, it } from 'vitest'
import { appendSuffixToFileName, sanitizeSuffix } from './fileNames'

describe('file name helpers', () => {
  it('adds a suffix before the export extension', () => {
    expect(appendSuffixToFileName('sample.photo.jpg', '_masked', 'png')).toBe(
      'sample.photo_masked.png',
    )
  })

  it('sanitizes characters that are invalid on Windows paths', () => {
    expect(sanitizeSuffix('_a:b*c?')).toBe('_a-b-c-')
  })
})
