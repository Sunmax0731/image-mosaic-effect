import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import {
  Brush,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Images,
  Maximize2,
  Move,
  RotateCcw,
  Rows2,
  ScanEye,
  SlidersHorizontal,
  SquareDashedMousePointer,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
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
  clampRegion,
  createBrushOperation,
  createRectangleOperation,
  getCanvasPoint,
  loadImageElement,
  normalizeRectangle,
  redrawCanvas,
  renderImageBlob,
  type Rect,
} from './lib/mosaic'
import { getPreset, MOSAIC_PRESETS, type MosaicPresetId } from './lib/presets'
import {
  DEFAULT_SETTINGS,
  MAX_BLOCK_SIZE,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from './lib/settings'
import fantiaLogoUrl from './assets/fantia-logo.svg'
import skebLogoUrl from './assets/skeb-logo.svg'
import type {
  CanvasPoint,
  DrawTool,
  ExportFormat,
  ImageEntry,
  MosaicSettings,
  MosaicType,
} from './types'

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MOBILE_IMAGE_LIST_QUERY = '(max-width: 640px)'
const STAGE_VIEW_PADDING = 44
const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const TOOL_OPTIONS = [
  { id: 'brush', Icon: Brush },
  { id: 'rectangle', Icon: SquareDashedMousePointer },
] as const
const PRESET_LOGOS: Record<MosaicPresetId, string> = {
  fantiaPixelate: fantiaLogoUrl,
  fantiaBlur: fantiaLogoUrl,
  skebPixelate: skebLogoUrl,
}

type ViewMode = 'fit-width' | 'fit-height' | 'actual' | 'custom'
type InteractionMode = 'edit' | 'pan'

type StatusState =
  | { key: 'settingsSaved' }
  | { key: 'noSupportedImages' }
  | { key: 'imageDecodeFailed' }
  | { key: 'lastOperationRemoved' }
  | { key: 'currentImageReset' }
  | { key: 'preparingExport' }
  | { key: 'exportFailed' }
  | { key: 'imageListReset' }
  | { key: 'presetApplied'; preset: string }
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
  const [imageListOpen, setImageListOpen] = useState(true)
  const [showBefore, setShowBefore] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('fit-width')
  const [zoomScale, setZoomScale] = useState(1)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('edit')
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 })
  const [status, setStatus] = useState<StatusState>({ key: 'settingsSaved' })

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const activeImageRef = useRef<HTMLImageElement | null>(null)
  const imagesRef = useRef<ImageEntry[]>([])
  const drawSessionRef = useRef<{
    start: CanvasPoint
    last: CanvasPoint
    brushBounds?: Rect
  } | null>(null)
  const panSessionRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    scrollLeft: number
    scrollTop: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const activeIndex = images.findIndex((image) => image.id === activeId)
  const activeImage = activeIndex >= 0 ? images[activeIndex] : undefined
  const editedCount = images.filter((image) => image.operations.length > 0).length
  const copy = UI_COPY[language]
  const statusText = getStatusText(copy, status)
  const effectiveScale = useMemo(() => {
    const availableWidth = Math.max(1, stageSize.width - STAGE_VIEW_PADDING)
    const availableHeight = Math.max(1, stageSize.height - STAGE_VIEW_PADDING)
    const fitWidthScale = availableWidth / Math.max(1, canvasSize.width)
    const fitHeightScale = availableHeight / Math.max(1, canvasSize.height)

    switch (viewMode) {
      case 'fit-height':
        return Math.max(MIN_ZOOM, fitHeightScale)
      case 'actual':
        return 1
      case 'custom':
        return zoomScale
      case 'fit-width':
      default:
        return Math.max(MIN_ZOOM, fitWidthScale)
    }
  }, [canvasSize, stageSize, viewMode, zoomScale])
  const canvasDisplaySize = useMemo(
    () => ({
      width: Math.max(1, Math.round(canvasSize.width * effectiveScale)),
      height: Math.max(1, Math.round(canvasSize.height * effectiveScale)),
    }),
    [canvasSize, effectiveScale],
  )
  const zoomPercent = Math.round(effectiveScale * 100)

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
        redrawCanvas(canvasRef.current, image, showBefore ? [] : activeImage.operations)
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
  }, [activeImage, showBefore])

  useEffect(() => {
    const element = stageRef.current
    if (!element) {
      return
    }

    const updateStageSize = () => {
      setStageSize({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }

    updateStageSize()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateStageSize)
      return () => window.removeEventListener('resize', updateStageSize)
    }

    const observer = new ResizeObserver(updateStageSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const updateSettings = useCallback((patch: Partial<MosaicSettings>) => {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
    setStatus({ key: 'settingsSaved' })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setStatus({ key: 'settingsSaved' })
  }, [])

  const resetPreviewState = useCallback(() => {
    drawSessionRef.current = null
    panSessionRef.current = null
    setSelection(null)
    setShowBefore(false)
  }, [])

  const applyPreset = useCallback(
    (presetId: MosaicPresetId) => {
      if (presetId === 'skebPixelate' && !activeImage) {
        return
      }

      const preset = getPreset(presetId)
      if (!preset) {
        return
      }

      const longestEdge = Math.max(
        activeImage?.width ?? canvasSize.width,
        activeImage?.height ?? canvasSize.height,
      )

      setSettings((current) =>
        normalizeSettings({
          ...current,
          ...preset.settings({ longestEdge }),
        }),
      )
      setStatus({
        key: 'presetApplied',
        preset: copy.settings.presetLabels[presetId],
      })
    },
    [activeImage, canvasSize, copy.settings.presetLabels],
  )

  const setCustomZoom = useCallback((nextScale: number) => {
    setViewMode('custom')
    setZoomScale(clampZoom(nextScale))
  }, [])

  const zoomBy = useCallback(
    (offset: number) => {
      setCustomZoom(effectiveScale + offset)
    },
    [effectiveScale, setCustomZoom],
  )

  const clearLoadedImages = useCallback(() => {
    for (const image of imagesRef.current) {
      URL.revokeObjectURL(image.url)
    }

    imagesRef.current = []
    activeImageRef.current = null
    drawSessionRef.current = null
    panSessionRef.current = null
    setImages([])
    setActiveId(undefined)
    setSelection(null)
    setCanvasSize({ width: 1, height: 1 })
    setShowBefore(false)
    setInteractionMode('edit')
    setViewMode('fit-width')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = ''
    }
  }, [])

  const resetImageList = useCallback(
    (nextStatus: StatusState = { key: 'imageListReset' }) => {
      clearLoadedImages()
      setStatus(nextStatus)
    },
    [clearLoadedImages],
  )

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
    (fileList: FileList | null, options: { replace?: boolean } = {}) => {
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

      if (options.replace) {
        clearLoadedImages()
      }

      if (!nextImages.length) {
        setStatus({ key: 'noSupportedImages' })
        return
      }

      if (options.replace || !activeId) {
        resetPreviewState()
      }

      setImages((current) => (options.replace ? nextImages : [...current, ...nextImages]))
      setActiveId((current) => (options.replace ? nextImages[0].id : current ?? nextImages[0].id))
      setStatus({ key: 'imagesImported', count: nextImages.length })
    },
    [activeId, clearLoadedImages, resetPreviewState],
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
      resetPreviewState()
      setActiveId(images[nextIndex]?.id)
    },
    [activeIndex, images, resetPreviewState],
  )

  const selectImageFromList = useCallback(
    (imageId: string) => {
      resetPreviewState()
      setActiveId(imageId)

      if (isMobileImageListViewport()) {
        setImageListOpen(false)
      }
    },
    [resetPreviewState],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!activeImage || !canvasRef.current) {
        return
      }

      if (showBefore && interactionMode !== 'pan') {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)

      if (interactionMode === 'pan') {
        panSessionRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          scrollLeft: stageRef.current?.scrollLeft ?? 0,
          scrollTop: stageRef.current?.scrollTop ?? 0,
        }
        return
      }

      const point = getCanvasPoint(event, event.currentTarget)

      if (settings.drawTool === 'brush') {
        const brushBounds = getBrushPointRect(point, settings.brushSize, canvasSize)
        drawSessionRef.current = { start: point, last: point, brushBounds }
        setSelection(brushBounds)
        addOperation(createBrushOperation(point, settings))
      } else {
        drawSessionRef.current = { start: point, last: point }
        setSelection({ x: point.x, y: point.y, width: 0, height: 0 })
      }
    },
    [activeImage, addOperation, canvasSize, interactionMode, settings, showBefore],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const panSession = panSessionRef.current
      if (panSession?.pointerId === event.pointerId && stageRef.current) {
        stageRef.current.scrollLeft = panSession.scrollLeft - (event.clientX - panSession.startX)
        stageRef.current.scrollTop = panSession.scrollTop - (event.clientY - panSession.startY)
        return
      }

      const session = drawSessionRef.current
      if (!session || !canvasRef.current) {
        return
      }

      const point = getCanvasPoint(event, event.currentTarget)

      if (settings.drawTool === 'rectangle') {
        setSelection(normalizeRectangle(session.start, point))
        return
      }

      const pointBounds = getBrushPointRect(point, settings.brushSize, canvasSize)
      const brushBounds = session.brushBounds
        ? clampRegion(unionRects(session.brushBounds, pointBounds), canvasSize.width, canvasSize.height)
        : pointBounds
      const distance = Math.hypot(point.x - session.last.x, point.y - session.last.y)
      if (distance >= settings.brushSize * 0.34) {
        addOperation(createBrushOperation(point, settings))
        drawSessionRef.current = { ...session, last: point, brushBounds }
      } else {
        drawSessionRef.current = { ...session, brushBounds }
      }
      setSelection(brushBounds)
    },
    [addOperation, canvasSize, settings],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const panSession = panSessionRef.current
      if (panSession?.pointerId === event.pointerId) {
        panSessionRef.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
        return
      }

      const session = drawSessionRef.current
      if (!session) {
        return
      }

      event.currentTarget.releasePointerCapture(event.pointerId)
      const point = getCanvasPoint(event, event.currentTarget)
      const rect = normalizeRectangle(session.start, point)

      if (settings.drawTool === 'rectangle' && rect.width > 6 && rect.height > 6) {
        addOperation(createRectangleOperation(rect, settings))
      } else if (settings.drawTool === 'brush') {
        const distance = Math.hypot(point.x - session.last.x, point.y - session.last.y)
        if (distance > Math.max(2, settings.brushSize * 0.1)) {
          addOperation(createBrushOperation(point, settings))
        }
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
      resetImageList({ key: 'exportedImages', count: images.length })
    } catch {
      setStatus({ key: 'exportFailed' })
    } finally {
      setIsExporting(false)
    }
  }, [images, isExporting, resetImageList, settings])

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
  const canvasWrapStyle = useMemo(
    () => ({
      width: `${canvasDisplaySize.width}px`,
      height: `${canvasDisplaySize.height}px`,
    }),
    [canvasDisplaySize],
  )

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
          <div className="primary-actions">
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
          </div>
          <div className="settings-actions">
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
            <button type="button" className="button" onClick={resetSettings}>
              <RotateCcw aria-hidden="true" />
              {copy.settings.reset}
            </button>
          </div>
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
          onChange={(event) => importFiles(event.currentTarget.files, { replace: true })}
        />
      </header>

      <main
        className={[
          'workspace',
          settingsOpen ? '' : 'settings-collapsed',
          imageListOpen ? '' : 'queue-collapsed',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <aside
          className={`queue-panel ${imageListOpen ? '' : 'is-collapsed'}`}
          aria-label={copy.queue.label}
        >
          <div className="panel-header queue-header">
            {imageListOpen && (
              <p className="queue-summary">{copy.queue.count(editedCount, images.length)}</p>
            )}
            <div className="queue-actions">
              <button
                type="button"
                className="icon-button"
                title={imageListOpen ? copy.queue.hide : copy.queue.show}
                aria-pressed={imageListOpen}
                onClick={() => setImageListOpen((current) => !current)}
              >
                {imageListOpen ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="icon-button"
                title={copy.queue.reset}
                disabled={!images.length}
                onClick={() => resetImageList()}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          </div>
          {imageListOpen && (
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
                  onClick={() => selectImageFromList(image.id)}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
              {!images.length && <div className="empty-list">{copy.queue.empty}</div>}
            </div>
          )}
        </aside>

        <section className="canvas-panel" aria-label={copy.editor.label}>
          <div className="canvas-toolbar">
            <div className="view-controls" aria-label="preview controls">
              <div className="icon-actions view-mode-actions">
                <button
                  type="button"
                  className={`icon-button ${viewMode === 'fit-width' ? 'is-active' : ''}`}
                  title={copy.editor.fitWidth}
                  aria-pressed={viewMode === 'fit-width'}
                  disabled={!activeImage}
                  onClick={() => setViewMode('fit-width')}
                >
                  <Columns2 aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`icon-button ${viewMode === 'fit-height' ? 'is-active' : ''}`}
                  title={copy.editor.fitHeight}
                  aria-pressed={viewMode === 'fit-height'}
                  disabled={!activeImage}
                  onClick={() => setViewMode('fit-height')}
                >
                  <Rows2 aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`icon-button ${viewMode === 'actual' ? 'is-active' : ''}`}
                  title={copy.editor.actualSize}
                  aria-pressed={viewMode === 'actual'}
                  disabled={!activeImage}
                  onClick={() => setViewMode('actual')}
                >
                  <Maximize2 aria-hidden="true" />
                </button>
              </div>
              <div className="icon-actions zoom-actions">
                <button
                  type="button"
                  className="icon-button"
                  title={copy.editor.zoomOut}
                  disabled={!activeImage}
                  onClick={() => zoomBy(-ZOOM_STEP)}
                >
                  <ZoomOut aria-hidden="true" />
                </button>
                <span className="zoom-level" aria-label={copy.editor.actualSize}>
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  className="icon-button"
                  title={copy.editor.zoomIn}
                  disabled={!activeImage}
                  onClick={() => zoomBy(ZOOM_STEP)}
                >
                  <ZoomIn aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`icon-button ${interactionMode === 'pan' ? 'is-active' : ''}`}
                  title={interactionMode === 'pan' ? copy.editor.edit : copy.editor.pan}
                  aria-pressed={interactionMode === 'pan'}
                  disabled={!activeImage}
                  onClick={() =>
                    setInteractionMode((current) => (current === 'pan' ? 'edit' : 'pan'))
                  }
                >
                  <Move aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="icon-actions edit-actions">
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
                className={`icon-button ${showBefore ? 'is-active' : ''}`}
                title={showBefore ? copy.editor.compareAfter : copy.editor.compareBefore}
                aria-pressed={showBefore}
                disabled={!activeImage}
                onClick={() => setShowBefore((current) => !current)}
              >
                <ScanEye aria-hidden="true" />
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

          <div ref={stageRef} className={`stage ${activeImage ? 'has-image' : ''}`}>
            {activeImage ? (
              <div
                className={`canvas-wrap ${interactionMode === 'pan' ? 'is-panning' : ''}`}
                style={canvasWrapStyle}
              >
                <canvas
                  ref={canvasRef}
                  data-testid="mosaic-canvas"
                  aria-label={copy.editor.canvasLabel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    drawSessionRef.current = null
                    panSessionRef.current = null
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
        </section>

        {settingsOpen && (
          <aside className="settings-panel" aria-label={copy.settings.label}>
            <div className="settings-row settings-row-presets">
              <fieldset>
                <legend>{copy.settings.presets}</legend>
                <div className="preset-grid">
                  {MOSAIC_PRESETS.map((preset) => {
                    const disabled = preset.id === 'skebPixelate' && !activeImage
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className="preset-button"
                        disabled={disabled}
                        title={disabled ? copy.settings.skebNeedsImage : undefined}
                        onClick={() => applyPreset(preset.id)}
                      >
                        <img
                          className="preset-logo"
                          src={PRESET_LOGOS[preset.id]}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="preset-label">{copy.settings.presetLabels[preset.id]}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </div>

            <div className="settings-row settings-row-modes">
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
                      className={
                        settings.drawTool === item.id ? 'tool-button is-selected' : 'tool-button'
                      }
                      onClick={() => updateSettings({ drawTool: item.id as DrawTool })}
                    >
                      <item.Icon aria-hidden="true" />
                      {copy.settings.tools[item.id]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="settings-row settings-row-ranges">
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
                max={MAX_BLOCK_SIZE}
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
            </div>

            <div className="settings-row settings-row-output">
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
            </div>
          </aside>
        )}
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
    case 'presetApplied':
      return copy.status.presetApplied(status.preset)
    default:
      return copy.status[status.key]
  }
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function isMobileImageListViewport() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia?.(MOBILE_IMAGE_LIST_QUERY).matches ?? window.innerWidth <= 640
}

function getBrushPointRect(
  point: CanvasPoint,
  brushSize: number,
  canvasSize: { width: number; height: number },
): Rect {
  const radius = brushSize / 2
  return clampRegion(
    {
      x: point.x - radius,
      y: point.y - radius,
      width: brushSize,
      height: brushSize,
    },
    canvasSize.width,
    canvasSize.height,
  )
}

function unionRects(first: Rect, second: Rect): Rect {
  const x = Math.min(first.x, second.x)
  const y = Math.min(first.y, second.y)
  const right = Math.max(first.x + first.width, second.x + second.width)
  const bottom = Math.max(first.y + first.height, second.y + second.height)

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
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
