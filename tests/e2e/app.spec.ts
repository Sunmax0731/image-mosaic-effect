import { expect, test } from '@playwright/test'

const SAMPLE_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgklEQVR4nO3YQQqAIBRA0Vb3v2sXbWFDkqJwHwZ+QRcS8mAqWgAAAAAAAAAAsK1r7d6jXqv3zvMSz+Z8vC0h1+fKr9xg7Gm9yq2c0h7j4GNQZ8wq+8YgkY1nJr9qB9p3s+3nAqv5Dk5xw9e8a6q4a3Vx0m9zAgAAAAAAAAAA8G8f9gE2pQZtfsd0sAAAAABJRU5ErkJggg=='

test('imports an image, applies a brush operation, persists settings, and exports a ZIP', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '画像モザイク加工' })).toBeVisible()
  await expect(page.getByText('画像なし')).toBeVisible()

  await page.evaluate(() => window.imageMosaicEffect?.setLanguage('en'))
  await expect(page.getByRole('heading', { name: 'Image Mosaic Effect' })).toBeVisible()
  await page.evaluate(() => window.imageMosaicEffect?.setLanguage('ja'))
  await expect(page.getByRole('heading', { name: '画像モザイク加工' })).toBeVisible()

  await expect(page.getByLabel('保存形式')).toHaveValue('original')

  await page.getByTestId('file-input').setInputFiles(
    Array.from({ length: 16 }, (_, index) => ({
      name: `sample-${String(index + 1).padStart(2, '0')}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(SAMPLE_PNG, 'base64'),
    })),
  )

  await expect(page.getByRole('heading', { name: '編集中' })).toBeVisible()
  await expect(page.getByText('sample-01.png')).toHaveCount(0)
  await expect(page.getByTestId('mosaic-canvas')).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toBeInViewport()

  const queueScrolls = await page.locator('.image-list').evaluate((element) => {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  })
  expect(queueScrolls).toBe(true)

  await page.getByRole('banner').getByTitle('設定を隠す').click()
  await expect(page.getByRole('complementary', { name: 'モザイク設定' })).toBeHidden()
  await page.getByRole('banner').getByTitle('設定を表示').click()
  await expect(page.getByRole('complementary', { name: 'モザイク設定' })).toBeVisible()

  const canvas = page.getByTestId('mosaic-canvas')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) {
    return
  }

  await canvas.scrollIntoViewIfNeeded()
  await canvas.click({
    position: {
      x: box.width / 2,
      y: box.height / 2,
    },
  })

  await expect(page.getByTitle('元に戻す')).toBeEnabled()

  await page.getByLabel('接尾辞').fill('_checked')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /一括保存/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('image-mosaic-effect-export.zip')

  await page.reload()
  await expect(page.getByLabel('接尾辞')).toHaveValue('_checked')
})
