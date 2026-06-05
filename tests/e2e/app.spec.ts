import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

declare global {
  interface Window {
    __lastClipboardWrite?: {
      itemCount: number
      type?: string
      size: number
    }
  }
}

const SAMPLE_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgklEQVR4nO3YQQqAIBRA0Vb3v2sXbWFDkqJwHwZ+QRcS8mAqWgAAAAAAAAAAsK1r7d6jXqv3zvMSz+Z8vC0h1+fKr9xg7Gm9yq2c0h7j4GNQZ8wq+8YgkY1nJr9qB9p3s+3nAqv5Dk5xw9e8a6q4a3Vx0m9zAgAAAAAAAAAA8G8f9gE2pQZtfsd0sAAAAABJRU5ErkJggg=='

function sampleFiles(count = 16, prefix = 'sample') {
  return Array.from({ length: count }, (_, index) => ({
    name: `${prefix}-${String(index + 1).padStart(2, '0')}.png`,
    mimeType: 'image/png',
    buffer: Buffer.from(SAMPLE_PNG, 'base64'),
  }))
}

function sampleFolder(basePath: string, count = 6, prefix = 'folder') {
  fs.mkdirSync(basePath, { recursive: true })
  for (let index = 0; index < count; index += 1) {
    fs.writeFileSync(
      path.join(basePath, `${prefix}-${String(index + 1).padStart(2, '0')}.png`),
      Buffer.from(SAMPLE_PNG, 'base64'),
    )
  }
  return basePath
}

test('imports images, toggles and resets the list, replaces folder imports, and exports a ZIP', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        write: async (items: ClipboardItem[]) => {
          const item = items[0]
          const type = item?.types[0]
          const blob = type ? await item.getType(type) : undefined
          window.__lastClipboardWrite = {
            itemCount: items.length,
            type,
            size: blob?.size ?? 0,
          }
        },
      },
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: (data: { files?: File[] }) => {
        const file = data.files?.[0]
        return data.files?.length === 1 && file?.type === 'image/png'
      },
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: { title?: string; text?: string; files?: File[] }) => {
        throw new Error(`Unexpected native share call: ${data.title ?? ''}`)
      },
    })
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: '画像モザイク加工' })).toBeVisible()
  await expect(page.getByText('画像なし')).toBeVisible()
  await expect(page.getByTitle('画像を読み込むとTwitter共有できます')).toBeDisabled()

  await page.evaluate(() => window.imageMosaicEffect?.setLanguage('en'))
  await expect(page.getByRole('heading', { name: 'Image Mosaic Effect' })).toBeVisible()
  await page.evaluate(() => window.imageMosaicEffect?.setLanguage('ja'))
  await expect(page.getByRole('heading', { name: '画像モザイク加工' })).toBeVisible()

  await expect(page.getByLabel('保存形式')).toHaveValue('original')
  await expect(page.getByRole('banner').getByRole('button', { name: /設定を初期化/ })).toBeVisible()
  await expect(page.getByText('保存済み', { exact: true })).toHaveCount(0)
  await expect(page.getByText('画像一覧', { exact: true })).toHaveCount(0)
  await expect(page.getByText('設定', { exact: true })).toHaveCount(0)

  const primaryButtonTops = await page.locator('.primary-actions .button').evaluateAll((buttons) =>
    buttons.map((button) => Math.round(button.getBoundingClientRect().top)),
  )
  expect(new Set(primaryButtonTops).size).toBe(1)

  await page.getByTestId('file-input').setInputFiles(sampleFiles(16, 'file'))
  await expect(page.locator('.image-row')).toHaveCount(16)
  await expect(page.getByTitle('画像一覧を隠す')).toBeVisible()
  await expect(page.getByTitle('リストをリセット')).toBeEnabled()

  await page
    .getByTestId('folder-input')
    .setInputFiles(sampleFolder(testInfo.outputPath('folder-import')))
  await expect(page.locator('.image-row')).toHaveCount(6)

  await page.getByTitle('画像一覧を隠す').click()
  await expect(page.locator('.image-list')).toHaveCount(0)
  await expect(page.getByTestId('mosaic-canvas')).toBeVisible()
  await expect(page.getByTitle('画像一覧を表示')).toBeVisible()
  await page.getByTitle('画像一覧を表示').click()
  await expect(page.locator('.image-row')).toHaveCount(6)

  await page.getByTitle('リストをリセット').click()
  await expect(page.locator('.image-row')).toHaveCount(0)
  await expect(page.getByText('画像なし')).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toHaveCount(0)

  await page.getByTestId('file-input').setInputFiles(sampleFiles())
  await expect(page.getByTitle('モザイク適用後にTwitter共有できます')).toBeDisabled()

  const isMobile = await page.evaluate(() => window.innerWidth <= 640)
  if (isMobile) {
    await page.locator('.image-row').nth(1).click()
    await expect(page.locator('.image-list')).toHaveCount(0)
    await expect(page.getByTestId('mosaic-canvas')).toBeVisible()
    await page.getByTitle('画像一覧を表示').click()
    await expect(page.locator('.image-row')).toHaveCount(16)
  }

  await expect(page.getByText('編集中', { exact: true })).toHaveCount(0)
  await expect(page.getByText('範囲を指定してモザイクを適用します')).toHaveCount(0)
  await expect(page.getByText('sample-01.png')).toHaveCount(0)
  await expect(page.locator('.bottom-status')).toHaveCount(0)
  await expect(page.getByTestId('mosaic-canvas')).toBeVisible()
  await expect(page.getByTestId('mosaic-canvas')).toBeInViewport()

  await expect(page.locator('.preset-logo')).toHaveCount(3)
  await expect(page.locator('.preset-label')).toHaveText(['ピクセル', 'ぼかし'])
  await expect(page.getByText('Fantia ピクセル', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Skeb 1%', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Fantia ピクセル' }).locator('.preset-logo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skeb 1%' }).locator('.preset-logo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Skeb 1%' }).locator('.preset-label')).toHaveCount(0)
  await page.getByRole('button', { name: 'Fantia ピクセル' }).click()
  await expect(page.getByLabel('ブロックサイズ')).toHaveValue('72')
  await page.getByRole('button', { name: 'Fantia ぼかし' }).click()
  await expect(page.getByLabel('ブロックサイズ')).toHaveValue('64')
  await page.getByRole('button', { name: 'Skeb 1%' }).click()
  await expect(page.getByLabel('ブロックサイズ')).toHaveValue('4')

  const queueScrolls = await page.locator('.image-list').evaluate((element) => {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  })
  expect(queueScrolls).toBe(true)

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
  await page.getByTitle('100%表示').click()
  await expect(page.getByTitle('100%表示')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTitle('幅に合わせる').click()
  await expect(page.getByTitle('幅に合わせる')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTitle('拡大').click()
  await expect(page.locator('.zoom-level')).toContainText('%')
  await page.getByTitle('パン').click()
  await expect(page.getByTitle('編集')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTitle('編集').click()

  await canvas.scrollIntoViewIfNeeded()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) {
    return
  }

  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.35)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.65, { steps: 5 })
  const brushCursor = page.locator('.selection.is-circle')
  await expect(brushCursor).toBeVisible()
  const brushCursorStyle = await brushCursor.evaluate((element) => {
    const style = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return {
      borderRadius: style.borderRadius,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  })
  expect(brushCursorStyle.borderRadius).not.toBe('0px')
  expect(Math.abs(brushCursorStyle.width - brushCursorStyle.height)).toBeLessThanOrEqual(2)
  await page.mouse.up()
  await expect(page.locator('.selection')).toHaveCount(0)

  await expect(page.getByTitle('元に戻す')).toBeEnabled()
  await expect(page.getByTitle('Twitterへ共有')).toBeEnabled()
  await page.getByTitle('Before/After確認').click()
  await expect(page.getByRole('button', { name: 'After表示に戻す', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByTitle('After表示に戻すとTwitter共有できます')).toBeDisabled()
  await page.getByRole('button', { name: 'After表示に戻す', exact: true }).click()
  await expect(page.getByTitle('Before/After確認')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTitle('Twitterへ共有')).toBeEnabled()

  await page.getByTitle('Twitterへ共有').click()
  await expect(page.getByText('共有用画像を準備しました')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Twitter共有準備' })).toBeVisible()
  await expect(page.getByRole('button', { name: '画像をコピー' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Twitterを開く' })).toBeVisible()
  await expect(page.getByRole('button', { name: '画像を保存' })).toBeVisible()

  await page.getByRole('button', { name: '画像をコピー' }).click()
  await expect(
    page.getByText('画像をコピーしました。Twitter投稿画面で貼り付けてください'),
  ).toBeVisible()
  const clipboardWrite = await page.evaluate(() => window.__lastClipboardWrite)
  expect(clipboardWrite).toMatchObject({
    itemCount: 1,
    type: 'image/png',
  })
  expect(clipboardWrite?.size).toBeGreaterThan(0)
  const openedUrl = await page.getByRole('link', { name: 'Twitterを開く' }).getAttribute('href')
  expect(openedUrl).toContain('https://twitter.com/intent/tweet')
  const tweetText = new URL(openedUrl ?? '').searchParams.get('text') ?? ''
  expect(tweetText).toContain('#画像モザイク加工')
  expect(tweetText).toContain('#ImageMosaicEffect')
  expect(tweetText).toContain('https://sunmax0731.github.io/image-mosaic-effect/')
  expect(tweetText).toBe(
    '#画像モザイク加工 #ImageMosaicEffect\nhttps://sunmax0731.github.io/image-mosaic-effect/',
  )

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
