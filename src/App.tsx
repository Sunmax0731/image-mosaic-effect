import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import {
  Brush,
  ChevronLeft,
  ChevronRight,
  Download,
  FolderOpen,
  Images,
  RotateCcw,
  Save,
  SlidersHorizontal,
  SquareDashedMousePointer,
  Undo2,
} from 'lucide-react'
import './App.css'
import {
  appendSuffixToFileName,
  readableBytes,
} from './lib/fileNames'
import {
  createBrushOperation,
  createRectangleOperation,
  getCanvasPoint,
  loadImageElement,
  normalizeRectangle,
  redrawCanvas,
  renderImageBlob,
  type Rect,
} from './lib/mosaic'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from './lib/settings'
import type {
  CanvasPoint,
  DrawTool,
  ExportFormat,
  ImageEntry,
  MosaicSettings,
  MosaicType,
} from './types'

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const TOOL_OPTIONS = [
  { id: 'brush', label: 'Brush', Icon: Brush },
  { id: 'rectangle', label: 'Rect', Icon: SquareDashedMousePointer },
] as const

function App() {
  const [settings, setSettings] = useState<MosaicSettings>(() => loadSettings())
  const [images, setImages] = useState<ImageEntry[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [selection, setSelection] = useState<Rect | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 })
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState('Settings saved locally')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const activeImageRef = useRef<HTMLImageElement | null>(null)
  const imagesRef = useRef<ImageEntry[]>([])
  const drawSessionRef = useRef<{
    start: CanvasPoint
    last: CanvasPoint
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const activeIndex = images.findIndex((image) => image.id === activeId)
  const activeImage = activeIndex >= 0 ? images[activeIndex] : undefined
  const editedCount = images.filter((image) => image.operations.length > 0).length

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.url)
      }
    }
  }, [])

  useEffect(() => {
    if (!activeImage || !canvasRef.current) {
      activeImageRef.current = null
      return
    }

    let cancelled = false
    loadImageElement(activeImage.url)
      .then((image) => {
        if (cancelled || !canvasRef.current) {
          return
        }

        activeImageRef.current = image
        redrawCanvas(canvasRef.current, image, activeImage.operations)
        setCanvasSize({ width: image.naturalWidth, height: image.naturalHeight })

        if (activeImage.width !== image.naturalWidth || activeImage.height !== image.naturalHeight) {
          setImages((current) =>
            current.map((entry) =>
              entry.id === activeImage.id
                ? { ...entry, width: image.naturalWidth, height: image.naturalHeight }
                : entry,
            ),
          )
        }
      })
      .catch(() => setStatus('Image decode failed'))

    return () => {
      cancelled = true
    }
  }, [activeImage])

  const updateSettings = useCallback((patch: Partial<MosaicSettings>) => {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
    setStatus('Settings saved locally')
  }, [])

  const addOperation = useCallback(
    (operation: ReturnType<typeof createBrushOperation>) => {
      if (!activeImage) {
        return
      }

      setImages((current) =>
        current.map((entry) =>
          entry.id === activeImage.id
            ? {
                ...entry,
                operations: [...entry.operations, operation],
                lastEditedAt: Date.now(),
              }
            : entry,
        ),
      )
    },
    [activeImage],
  )

  const importFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) {
        return
      }

      const nextImages = Array.from(fileList)
        .filter((file) => ACCEPTED_IMAGE_TYPES.has(file.type) || file.type.startsWith('image/'))
        .sort((a, b) => getRelativePath(a).localeCompare(getRelativePath(b)))
        .map((file) => ({
          id: createImageId(file),
          name: file.name,
          relativePath: getRelativePath(file),
          type: file.type || 'image/*',
          size: file.size,
          url: URL.createObjectURL(file),
          operations: [],
        }))

      if (!nextImages.length) {
        setStatus('No supported images selected')
        return
      }

      setImages((current) => [...current, ...nextImages])
      setActiveId((current) => current ?? nextImages[0].id)
      setStatus(`${nextImages.length} images imported`)
    },
    [],
  )

  const undoOperation = useCallback(() => {
    if (!activeImage?.operations.length) {
      return
    }

    setImages((current) =>
      current.map((entry) =>
        entry.id === activeImage.id
          ? { ...entry, operations: entry.operations.slice(0, -1), lastEditedAt: Date.now() }
          : entry,
      ),
    )
    setStatus('Last operation removed')
  }, [activeImage])

  const resetActiveImage = useCallback(() => {
    if (!activeImage) {
      return
    }

    setImages((current) =>
      current.map((entry) =>
        entry.id === activeImage.id
          ? { ...entry, operations: [], lastEditedAt: Date.now() }
          : entry,
      ),
    )
    setStatus('Current image reset')
  }, [activeImage])

  const goToImage = useCallback(
    (offset: number) => {
      if (!images.length) {
        return
      }

      const nextIndex = Math.min(images.length - 1, Math.max(0, activeIndex + offset))
      setActiveId(images[nextIndex]?.id)
    },
    [activeIndex, images],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!activeImage || !canvasRef.current) {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      const point = getCanvasPoint(event, event.currentTarget)
      drawSessionRef.current = { start: point, last: point }

      if (settings.drawTool === 'brush') {
        addOperation(createBrushOperation(point, settings))
      } else {
        setSelection({ x: point.x, y: point.y, width: 0, height: 0 })
      }
    },
    [activeImage, addOperation, settings],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const session = drawSessionRef.current
      if (!session || !canvasRef.current) {
        return
      }

      const point = getCanvasPoint(event, event.currentTarget)

      if (settings.drawTool === 'rectangle') {
        setSelection(normalizeRectangle(session.start, point))
        return
      }

      const distance = Math.hypot(point.x - session.last.x, point.y - session.last.y)
      if (distance >= settings.brushSize * 0.34) {
        addOperation(createBrushOperation(point, settings))
        drawSessionRef.current = { ...session, last: point }
      }
    },
    [addOperation, settings],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const session = drawSessionRef.current
      if (!session) {
        return
      }

      event.currentTarget.releasePointerCapture(event.pointerId)
      const point = getCanvasPoint(event, event.currentTarget)
      const rect = normalizeRectangle(session.start, point)

      if (settings.drawTool === 'rectangle' && rect.width > 6 && rect.height > 6) {
        addOperation(createRectangleOperation(rect, settings))
      }

      drawSessionRef.current = null
      setSelection(null)
    },
    [addOperation, settings],
  )

  const exportAll = useCallback(async () => {
    if (!images.length || isExporting) {
      return
    }

    setIsExporting(true)
    setStatus('Preparing ZIP export')

    try {
      const zip = new JSZip()
      for (const image of images) {
        const blob = await renderImageBlob(
          image.url,
          image.operations,
          settings.exportFormat,
          settings.jpegQuality,
        )
        zip.file(
          appendSuffixToFileName(image.name, settings.suffix, settings.exportFormat),
          blob,
        )
      }

      const archive = await zip.generateAsync({ type: 'blob' })
      downloadBlob(archive, 'image-mosaic-effect-export.zip')
      setStatus(`Exported ${images.length} images as ZIP`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [images, isExporting, settings])

  const selectionStyle = useMemo(() => {
    if (!selection) {
      return undefined
    }

    return {
      left: `${(selection.x / canvasSize.width) * 100}%`,
      top: `${(selection.y / canvasSize.height) * 100}%`,
      width: `${(selection.width / canvasSize.width) * 100}%`,
      height: `${(selection.height / canvasSize.height) * 100}%`,
    }
  }, [canvasSize, selection])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">IM</span>
          <div>
            <h1>Image Mosaic Effect</h1>
            <p>{status}</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
            <Images aria-hidden="true" />
            Import files
          </button>
          <button type="button" className="button" onClick={() => folderInputRef.current?.click()}>
            <FolderOpen aria-hidden="true" />
            Import folder
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={!images.length || isExporting}
            onClick={exportAll}
          >
            <Download aria-hidden="true" />
            {isExporting ? 'Exporting' : 'Export all'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          data-testid="file-input"
          hidden
          multiple
          accept="image/*"
          type="file"
          onChange={(event) => importFiles(event.currentTarget.files)}
        />
        <input
          ref={folderInputRef}
          data-testid="folder-input"
          hidden
          multiple
          accept="image/*"
          type="file"
          {...{ webkitdirectory: '', directory: '' }}
          onChange={(event) => importFiles(event.currentTarget.files)}
        />
      </header>

      <main className="workspace">
        <aside className="queue-panel" aria-label="Image queue">
          <div className="panel-header">
            <div>
              <h2>Queue</h2>
              <p>
                {editedCount}/{images.length} edited
              </p>
            </div>
          </div>
          <div className="image-list">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`image-row ${image.id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(image.id)}
              >
                <img src={image.url} alt="" />
                <span>
                  <strong>{image.name}</strong>
                  <small>
                    {index + 1} / {images.length} - {image.operations.length} ops -{' '}
                    {readableBytes(image.size)}
                  </small>
                </span>
              </button>
            ))}
            {!images.length && <div className="empty-list">No images</div>}
          </div>
        </aside>

        <section className="canvas-panel" aria-label="Mosaic editor">
          <div className="canvas-toolbar">
            <div>
              <h2>{activeImage?.name ?? 'Ready'}</h2>
              <p>
                {activeImage?.width && activeImage.height
                  ? `${activeImage.width} x ${activeImage.height}px`
                  : 'Import images to start'}
              </p>
            </div>
            <div className="icon-actions">
              <button
                type="button"
                className="icon-button"
                title="Previous image"
                disabled={activeIndex <= 0}
                onClick={() => goToImage(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title="Next image"
                disabled={activeIndex < 0 || activeIndex >= images.length - 1}
                onClick={() => goToImage(1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title="Undo"
                disabled={!activeImage?.operations.length}
                onClick={undoOperation}
              >
                <Undo2 aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title="Reset image"
                disabled={!activeImage?.operations.length}
                onClick={resetActiveImage}
              >
                <RotateCcw aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={`stage ${activeImage ? 'has-image' : ''}`}>
            {activeImage ? (
              <div className="canvas-wrap">
                <canvas
                  ref={canvasRef}
                  data-testid="mosaic-canvas"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    drawSessionRef.current = null
                    setSelection(null)
                  }}
                />
                {selectionStyle && <div className="selection" style={selectionStyle} />}
              </div>
            ) : (
              <div className="empty-stage">
                <Images aria-hidden="true" />
                <strong>Import local images</strong>
                <span>Files stay in this browser session.</span>
              </div>
            )}
          </div>

          <footer className="bottom-status">
            <span>
              {activeIndex >= 0 ? activeIndex + 1 : 0} / {images.length}
            </span>
            <span>{settings.drawTool === 'brush' ? 'Brush mode' : 'Rectangle mode'}</span>
            <span>{settings.mosaicType}</span>
          </footer>
        </section>

        <aside className="settings-panel" aria-label="Mosaic settings">
          <div className="panel-header">
            <div>
              <h2>Settings</h2>
              <p>
                <Save aria-hidden="true" /> Persisted
              </p>
            </div>
            <SlidersHorizontal aria-hidden="true" />
          </div>

          <fieldset>
            <legend>Mosaic type</legend>
            <div className="segmented">
              {(['pixelate', 'blur', 'noise'] as MosaicType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={settings.mosaicType === type ? 'is-selected' : ''}
                  onClick={() => updateSettings({ mosaicType: type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Tool</legend>
            <div className="tool-grid">
              {TOOL_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={settings.drawTool === item.id ? 'tool-button is-selected' : 'tool-button'}
                  onClick={() => updateSettings({ drawTool: item.id as DrawTool })}
                >
                  <item.Icon aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <RangeControl
            label="Brush size"
            value={settings.brushSize}
            min={16}
            max={220}
            step={2}
            suffix="px"
            onChange={(brushSize) => updateSettings({ brushSize })}
          />
          <RangeControl
            label="Block size"
            value={settings.blockSize}
            min={4}
            max={48}
            step={1}
            suffix="px"
            onChange={(blockSize) => updateSettings({ blockSize })}
          />
          <RangeControl
            label="Strength"
            value={Math.round(settings.strength * 100)}
            min={10}
            max={100}
            step={1}
            suffix="%"
            onChange={(value) => updateSettings({ strength: value / 100 })}
          />

          <label className="field">
            <span>File suffix</span>
            <input
              value={settings.suffix}
              maxLength={32}
              onChange={(event) => updateSettings({ suffix: event.currentTarget.value })}
            />
          </label>

          <label className="field">
            <span>Export format</span>
            <select
              value={settings.exportFormat}
              onChange={(event) =>
                updateSettings({ exportFormat: event.currentTarget.value as ExportFormat })
              }
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>

          <button
            type="button"
            className="button reset-settings"
            onClick={() => {
              setSettings(DEFAULT_SETTINGS)
              setStatus('Settings saved locally')
            }}
          >
            Reset settings
          </button>
        </aside>
      </main>
    </div>
  )
}

interface RangeControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (value: number) => void
}

function RangeControl({ label, value, min, max, step, suffix, onChange }: RangeControlProps) {
  return (
    <label className="range-field">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  )
}

function getRelativePath(file: File) {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
}

function createImageId(file: File) {
  return `${getRelativePath(file)}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export default App
