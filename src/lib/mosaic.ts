import type {
  CanvasPoint,
  ExportFormat,
  MosaicOperation,
  MosaicSettings,
} from '../types'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface PointerLike {
  clientX: number
  clientY: number
}

export function clampRegion(region: Rect, canvasWidth: number, canvasHeight: number): Rect {
  const x = Math.max(0, Math.min(canvasWidth, region.x))
  const y = Math.max(0, Math.min(canvasHeight, region.y))
  const right = Math.max(0, Math.min(canvasWidth, region.x + region.width))
  const bottom = Math.max(0, Math.min(canvasHeight, region.y + region.height))

  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  }
}

export function normalizeRectangle(start: CanvasPoint, end: CanvasPoint): Rect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

export function createBrushOperation(
  point: CanvasPoint,
  settings: MosaicSettings,
  id = createOperationId(),
): MosaicOperation {
  const radius = settings.brushSize / 2

  return {
    id,
    type: settings.mosaicType,
    shape: 'circle',
    x: point.x - radius,
    y: point.y - radius,
    width: settings.brushSize,
    height: settings.brushSize,
    radius,
    blockSize: settings.blockSize,
    strength: settings.strength,
  }
}

export function createRectangleOperation(
  rect: Rect,
  settings: MosaicSettings,
  id = createOperationId(),
): MosaicOperation {
  return {
    id,
    type: settings.mosaicType,
    shape: 'rect',
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    radius: 0,
    blockSize: settings.blockSize,
    strength: settings.strength,
  }
}

export function getCanvasPoint(event: PointerLike, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

export async function loadImageElement(url: string) {
  const image = new Image()
  image.decoding = 'async'
  image.src = url

  await image.decode()
  return image
}

export function drawBaseImage(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = getContext(canvas)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)
}

export function redrawCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  operations: MosaicOperation[],
) {
  drawBaseImage(canvas, image)
  const context = getContext(canvas)
  for (const operation of operations) {
    applyMosaicOperation(context, operation)
  }
}

export async function renderImageBlob(
  url: string,
  operations: MosaicOperation[],
  format: ExportFormat,
  jpegQuality: number,
) {
  const image = await loadImageElement(url)
  const canvas = document.createElement('canvas')
  redrawCanvas(canvas, image, operations)

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new Error('Unable to export image blob.'))
      },
      mimeType,
      jpegQuality,
    )
  })
}

export function applyMosaicOperation(
  context: CanvasRenderingContext2D,
  operation: MosaicOperation,
) {
  const sourceCanvas = context.canvas
  const region = clampRegion(
    {
      x: operation.x,
      y: operation.y,
      width: operation.width,
      height: operation.height,
    },
    sourceCanvas.width,
    sourceCanvas.height,
  )

  if (region.width < 1 || region.height < 1) {
    return
  }

  const patch = document.createElement('canvas')
  patch.width = Math.max(1, Math.round(region.width))
  patch.height = Math.max(1, Math.round(region.height))
  const patchContext = getContext(patch)
  patchContext.drawImage(
    sourceCanvas,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    patch.width,
    patch.height,
  )

  const processed = processPatch(patch, operation)

  context.save()
  addClipPath(context, operation)
  context.clip()
  context.globalAlpha = operation.strength
  context.drawImage(processed, region.x, region.y, region.width, region.height)
  context.restore()
}

function processPatch(patch: HTMLCanvasElement, operation: MosaicOperation) {
  switch (operation.type) {
    case 'blur':
      return blurPatch(patch, operation)
    case 'noise':
      return noisePatch(patch, operation)
    case 'pixelate':
    default:
      return pixelatePatch(patch, operation)
  }
}

function pixelatePatch(patch: HTMLCanvasElement, operation: MosaicOperation) {
  const blockSize = Math.max(2, Math.round(operation.blockSize))
  const small = document.createElement('canvas')
  small.width = Math.max(1, Math.ceil(patch.width / blockSize))
  small.height = Math.max(1, Math.ceil(patch.height / blockSize))

  const smallContext = getContext(small)
  smallContext.imageSmoothingEnabled = true
  smallContext.drawImage(patch, 0, 0, small.width, small.height)

  const output = document.createElement('canvas')
  output.width = patch.width
  output.height = patch.height
  const outputContext = getContext(output)
  outputContext.imageSmoothingEnabled = false
  outputContext.drawImage(small, 0, 0, output.width, output.height)
  outputContext.imageSmoothingEnabled = true
  return output
}

function blurPatch(patch: HTMLCanvasElement, operation: MosaicOperation) {
  const output = document.createElement('canvas')
  output.width = patch.width
  output.height = patch.height
  const outputContext = getContext(output)
  outputContext.filter = `blur(${Math.max(2, Math.round(operation.blockSize * operation.strength))}px)`
  outputContext.drawImage(patch, 0, 0)
  outputContext.filter = 'none'
  return output
}

function noisePatch(patch: HTMLCanvasElement, operation: MosaicOperation) {
  const output = pixelatePatch(patch, operation)
  const outputContext = getContext(output)
  const imageData = outputContext.getImageData(0, 0, output.width, output.height)
  const data = imageData.data
  const rng = seededRandom(operation.id)
  const amplitude = 96 * operation.strength

  for (let index = 0; index < data.length; index += 4) {
    const noise = (rng() - 0.5) * amplitude
    data[index] = clampByte(data[index] + noise)
    data[index + 1] = clampByte(data[index + 1] + noise)
    data[index + 2] = clampByte(data[index + 2] + noise)
  }

  outputContext.putImageData(imageData, 0, 0)
  return output
}

function addClipPath(context: CanvasRenderingContext2D, operation: MosaicOperation) {
  context.beginPath()
  if (operation.shape === 'circle') {
    context.arc(
      operation.x + operation.width / 2,
      operation.y + operation.height / 2,
      operation.radius,
      0,
      Math.PI * 2,
    )
    return
  }
  context.rect(operation.x, operation.y, operation.width, operation.height)
}

function seededRandom(seed: string) {
  let state = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function createOperationId() {
  if ('crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context is not available.')
  }
  return context
}
