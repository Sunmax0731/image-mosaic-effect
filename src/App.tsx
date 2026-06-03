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
import { resolveExportTarget } from './lib/fileNames'
import {
  loadLanguage,
  normalizeLanguage,
  saveLanguage,
  UI_COPY,
  type Language,
  type UiCopy,
} from './lib/i18n'
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
  { id: 'brush', Icon: Brush },
  { id: 'rectangle', Icon: SquareDashedMousePointer },
] as const

type StatusState =
  | { key: 'settingsSaved' }
  | { key: 'noSupportedImages' }
  | { key: 'imageDecodeFailed' }
  | { key: 'lastOperationRemoved' }
  | { key: 'currentImageReset' }
  | { key: 'preparingExport' }
  | { key: 'exportFailed' }
  | { key: 'imagesImported'; count: number }
  | { key: 'exportedImages'; count: number }

declare global {
  interface Window {
    imageMosaicEffect?: {
      getLanguage: () => Language
      setLanguage: (language: Language) => void
    }
  }
}

function App() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage())
  const [settings, setSettings] = useState<MosaicSettings>(() => loadSettings())
  const [images, setImages] = useState<ImageEntry[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [selection, setSelection] = useState<Rect | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 })
  const [isExporting, setIsExporting] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [status, setStatus] = useState<StatusState>({ key: 'settingsSaved' })

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
  const copy = UI_COPY[language]
  const statusText = getStatusText(copy, status)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveLanguage(language)
    window.imageMosaicEffect = {
      getLanguage: () => language,
      setLanguage: (nextLanguage) => setLanguage(normalizeLanguage(nextLanguage)),
    }

    return () => {
      delete window.imageMosaicEffect
    }
  }, [language])

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
      .catch(() => setStatus({ key: 'imageDecodeFailed' }))

    return () => {
      cancelled = true
    }
  }, [activeImage])

  const updateSettings = useCallback((patch: Partial<MosaicSettings>) => {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
    setStatus({ key: 'settingsSaved' })
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
        setStatus({ key: 'noSupportedImages' })
        return
      }

      setImages((current) => [...current, ...nextImages])
      setActiveId((current) => current ?? nextImages[0].id)
      setStatus({ key: 'imagesImported', count: nextImages.length })
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
    setStatus({ key: 'lastOperationRemoved' })
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
    setStatus({ key: 'currentImageReset' })
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
    setStatus({ key: 'preparingExport' })

    try {
      const zip = new JSZip()
      for (const image of images) {
        const exportTarget = resolveExportTarget(
          image.name,
          image.type,
          settings.suffix,
          settings.exportFormat,
        )
        const blob = await renderImageBlob(
          image.url,
          image.operations,
          exportTarget.format,
          settings.jpegQuality,
        )
        zip.file(exportTarget.fileName, blob)
      }

      const archive = await zip.generateAsync({ type: 'blob' })
      downloadBlob(archive, 'image-mosaic-effect-export.zip')
      setStatus({ key: 'exportedImages', count: images.length })
    } catch {
      setStatus({ key: 'exportFailed' })
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
          <span className="brand-mark">{copy.brandMark}</span>
          <div>
            <h1>{copy.appTitle}</h1>
            <p>{statusText}</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
            <Images aria-hidden="true" />
            {copy.actions.importFiles}
          </button>
          <button type="button" className="button" onClick={() => folderInputRef.current?.click()}>
            <FolderOpen aria-hidden="true" />
            {copy.actions.importFolder}
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={!images.length || isExporting}
            onClick={exportAll}
          >
            <Download aria-hidden="true" />
            {isExporting ? copy.actions.exporting : copy.actions.exportAll}
          </button>
          <button
            type="button"
            className={`button settings-toggle ${settingsOpen ? 'is-active' : ''}`}
            title={settingsOpen ? copy.actions.hideSettings : copy.actions.showSettings}
            aria-pressed={settingsOpen}
            onClick={() => setSettingsOpen((current) => !current)}
          >
            <SlidersHorizontal aria-hidden="true" />
            {settingsOpen ? copy.actions.hideSettings : copy.actions.showSettings}
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

      <main className={`workspace ${settingsOpen ? '' : 'settings-collapsed'}`}>
        <aside className="queue-panel" aria-label={copy.queue.label}>
          <div className="panel-header">
            <div>
              <h2>{copy.queue.title}</h2>
              <p>{copy.queue.count(editedCount, images.length)}</p>
            </div>
          </div>
          <div className="image-list">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={`image-row ${image.id === activeId ? 'is-active' : ''}`}
                aria-label={copy.queue.thumbnailLabel(
                  index + 1,
                  images.length,
                  image.operations.length > 0,
                )}
                onClick={() => setActiveId(image.id)}
              >
                <img src={image.url} alt="" />
              </button>
            ))}
            {!images.length && <div className="empty-list">{copy.queue.empty}</div>}
          </div>
        </aside>

        <section className="canvas-panel" aria-label={copy.editor.label}>
          <div className="canvas-toolbar">
            <div>
              <h2>{activeImage ? copy.editor.activeTitle : copy.editor.readyTitle}</h2>
              <p>{activeImage ? copy.editor.activeHint : copy.editor.readyHint}</p>
            </div>
            <div className="icon-actions">
              <button
                type="button"
                className="icon-button"
                title={copy.editor.previous}
                disabled={activeIndex <= 0}
                onClick={() => goToImage(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title={copy.editor.next}
                disabled={activeIndex < 0 || activeIndex >= images.length - 1}
                onClick={() => goToImage(1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title={copy.editor.undo}
                disabled={!activeImage?.operations.length}
                onClick={undoOperation}
              >
                <Undo2 aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button"
                title={copy.editor.reset}
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
                  aria-label={copy.editor.canvasLabel}
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
                <strong>{copy.editor.emptyTitle}</strong>
                <span>{copy.editor.emptyBody}</span>
              </div>
            )}
          </div>

          <footer className="bottom-status">
            <span>
              {copy.editor.progress(activeIndex >= 0 ? activeIndex + 1 : 0, images.length)}
            </span>
            <span>{copy.editor.toolMode[settings.drawTool]}</span>
            <span>{copy.settings.mosaicTypes[settings.mosaicType]}</span>
          </footer>
        </section>

        {settingsOpen && <aside className="settings-panel" aria-label={copy.settings.label}>
          <div className="panel-header">
            <div>
              <h2>{copy.settings.title}</h2>
              <p>
                <Save aria-hidden="true" /> {copy.settings.persisted}
              </p>
            </div>
            <SlidersHorizontal aria-hidden="true" />
          </div>

          <fieldset>
            <legend>{copy.settings.mosaicType}</legend>
            <div className="segmented">
              {(['pixelate', 'blur', 'noise'] as MosaicType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={settings.mosaicType === type ? 'is-selected' : ''}
                  onClick={() => updateSettings({ mosaicType: type })}
                >
                  {copy.settings.mosaicTypes[type]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{copy.settings.tool}</legend>
            <div className="tool-grid">
              {TOOL_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={settings.drawTool === item.id ? 'tool-button is-selected' : 'tool-button'}
                  onClick={() => updateSettings({ drawTool: item.id as DrawTool })}
                >
                  <item.Icon aria-hidden="true" />
                  {copy.settings.tools[item.id]}
                </button>
              ))}
            </div>
          </fieldset>

          <RangeControl
            label={copy.settings.brushSize}
            value={settings.brushSize}
            min={16}
            max={220}
            step={2}
            suffix="px"
            onChange={(brushSize) => updateSettings({ brushSize })}
          />
          <RangeControl
            label={copy.settings.blockSize}
            value={settings.blockSize}
            min={4}
            max={48}
            step={1}
            suffix="px"
            onChange={(blockSize) => updateSettings({ blockSize })}
          />
          <RangeControl
            label={copy.settings.strength}
            value={Math.round(settings.strength * 100)}
            min={10}
            max={100}
            step={1}
            suffix="%"
            onChange={(value) => updateSettings({ strength: value / 100 })}
          />

          <label className="field">
            <span>{copy.settings.fileSuffix}</span>
            <input
              value={settings.suffix}
              maxLength={32}
              onChange={(event) => updateSettings({ suffix: event.currentTarget.value })}
            />
          </label>

          <label className="field">
            <span>{copy.settings.exportFormat}</span>
            <select
              value={settings.exportFormat}
              onChange={(event) =>
                updateSettings({ exportFormat: event.currentTarget.value as ExportFormat })
              }
            >
              <option value="original">{copy.settings.originalExtension}</option>
              <option value="png">{copy.settings.png}</option>
              <option value="jpeg">{copy.settings.jpeg}</option>
            </select>
          </label>

          <button
            type="button"
            className="button reset-settings"
            onClick={() => {
              setSettings(DEFAULT_SETTINGS)
              setStatus({ key: 'settingsSaved' })
            }}
          >
            {copy.settings.reset}
          </button>
        </aside>}
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

function getStatusText(copy: UiCopy, status: StatusState) {
  switch (status.key) {
    case 'imagesImported':
      return copy.status.imagesImported(status.count)
    case 'exportedImages':
      return copy.status.exportedImages(status.count)
    default:
      return copy.status[status.key]
  }
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
