import { expect, test } from '@playwright/test'

const SAMPLE_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgklEQVR4nO3YQQqAIBRA0Vb3v2sXbWFDkqJwHwZ+QRcS8mAqWgAAAAAAAAAAsK1r7d6jXqv3zvMSz+Z8vC0h1+fKr9xg7Gm9yq2c0h7j4GNQZ8wq+8YgkY1nJr9qB9p3s+3nAqv5Dk5xw9e8a6q4a3Vx0m9zAgAAAAAAAAAA8G8f9gE2pQZtfsd0sAAAAABJRU5ErkJggg=='

function sampleFiles(count = 16) {
  return Array.from({ length: count }, (_, index) => ({
    name: `sample-${String(index + 1).padStart(2, '0')}.png`,
    mimeType: 'image/png',
    buffer: Buffer.from(SAMPLE_PNG, 'base64'),
  }))
}

test('imports images, resets the list, applies a brush operation, persists settings, and exports a ZIP', async ({
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
  await expect(page.getByRole('banner').getByRole('button', { name: /設定を初期化/ })).toBeVisible()
  await expect(page.getByText('保存済み', { exact: true })).toHaveCount(0)

  const primaryButtonTops = await page.locator('.primary-actions .button').evaluateAll((buttons) =>
    buttons.map((button) => Math.round(button.getBoundingClientRect().top)),
  )
  expect(new Set(primaryButtonTops).size).toBe(1)

  await page.getByTestId('file-input').setInputFiles(sampleFiles())
  await expect(page.locator('.image-row')).toHaveCount(16)
  await expect(page.getByTitle('リストをリセット')).toBeEnabled()
  await page.getByTitle('リストをリセット').click()
  await expect(page.locator('.image-row')).toHaveCount(0)
  await expect(page.getByText('画像なし')).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toHaveCount(0)

  await page.getByTestId('file-input').setInputFiles(sampleFiles())

  await expect(page.getByText('編集中', { exact: true })).toHaveCount(0)
  await expect(page.getByText('範囲を指定してモザイクを適用します')).toHaveCount(0)
  await expect(page.getByText('sample-01.png')).toHaveCount(0)
  await expect(page.locator('.bottom-status')).toHaveCount(0)
  await expect(page.getByTestId('mosaic-canvas')).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toBeInViewport()

  const queueScrolls = await page.locator('.image-list').evaluate((element) => {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  })
  expect(queueScrolls).toBe(true)

  const isMobile = await page.evaluate(() => window.innerWidth <= 640)
  if (isMobile) {
    const rangeTops = await page
      .locator('.settings-row-ranges > .range-field')
      .evaluateAll((fields) => fields.map((field) => Math.round(field.getBoundingClientRect().top)))
    expect(new Set(rangeTops).size).toBe(1)

    const modeTops = await page
      .locator('.settings-row-modes > fieldset')
      .evaluateAll((fields) => fields.map((field) => Math.round(field.getBoundingClientRect().top)))
    expect(new Set(modeTops).size).toBe(1)

    const outputTops = await page
      .locator('.settings-row-output > .field')
      .evaluateAll((fields) => fields.map((field) => Math.round(field.getBoundingClientRect().top)))
    expect(new Set(outputTops).size).toBe(1)

    const firstThumbWidth = await page
      .locator('.image-row')
      .first()
      .evaluate((row) => Math.round(row.getBoundingClientRect().width))
    expect(firstThumbWidth).toBeGreaterThanOrEqual(160)
  }

  await page.getByLabel('接尾辞').fill('_temporary')
  await page.getByRole('banner').getByRole('button', { name: /設定を初期化/ }).click()
  await expect(page.getByLabel('接尾辞')).toHaveValue('_mosaic')

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
  await expect(page.locator('.image-row')).toHaveCount(0)
  await expect(page.getByText('画像なし')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('接尾辞')).toHaveValue('_checked')
})
