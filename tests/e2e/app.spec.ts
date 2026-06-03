import { expect, test } from '@playwright/test'

const SAMPLE_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgklEQVR4nO3YQQqAIBRA0Vb3v2sXbWFDkqJwHwZ+QRcS8mAqWgAAAAAAAAAAsK1r7d6jXqv3zvMSz+Z8vC0h1+fKr9xg7Gm9yq2c0h7j4GNQZ8wq+8YgkY1nJr9qB9p3s+3nAqv5Dk5xw9e8a6q4a3Vx0m9zAgAAAAAAAAAA8G8f9gE2pQZtfsd0sAAAAABJRU5ErkJggg=='

test('imports an image, applies a brush operation, persists settings, and exports a ZIP', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Image Mosaic Effect' })).toBeVisible()
  await expect(page.getByText('No images')).toBeVisible()

  await page.getByTestId('file-input').setInputFiles({
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: Buffer.from(SAMPLE_PNG, 'base64'),
  })

  await expect(page.getByRole('heading', { name: 'sample.png' })).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toBeVisible()

  const canvas = page.getByTestId('mosaic-canvas')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) {
    return
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2)
  await page.mouse.up()

  await expect(page.getByText(/[1-9]\d* ops/)).toBeVisible()

  await page.getByLabel('File suffix').fill('_checked')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export all/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('image-mosaic-effect-export.zip')

  await page.reload()
  await expect(page.getByLabel('File suffix')).toHaveValue('_checked')
})
