import type { DrawTool, MosaicType } from '../types'
import type { MosaicPresetId } from './presets'

export type Language = 'ja' | 'en'

export const DEFAULT_LANGUAGE: Language = 'ja'
export const LANGUAGE_KEY = 'image-mosaic-effect.language.v1'

export interface UiCopy {
  appTitle: string
  brandMark: string
  status: {
    settingsSaved: string
    noSupportedImages: string
    imageDecodeFailed: string
    lastOperationRemoved: string
    currentImageReset: string
    preparingExport: string
    exportFailed: string
    preparingShare: string
    shareStarted: string
    shareFailed: string
    shareUnsupported: string
    shareCancelled: string
    shareReady: string
    shareImageCopied: string
    shareImageCopyFailed: string
    shareTwitterOpened: string
    imageListReset: string
    presetApplied: (name: string) => string
    imagesImported: (count: number) => string
    exportedImages: (count: number) => string
  }
  actions: {
    importFiles: string
    importFolder: string
    exportAll: string
    exporting: string
    showSettings: string
    hideSettings: string
  }
  queue: {
    label: string
    title: string
    count: (edited: number, total: number) => string
    show: string
    hide: string
    reset: string
    empty: string
    thumbnailLabel: (index: number, total: number, edited: boolean) => string
  }
  editor: {
    label: string
    readyTitle: string
    activeTitle: string
    readyHint: string
    activeHint: string
    previous: string
    next: string
    undo: string
    reset: string
    compareBefore: string
    compareAfter: string
    shareTwitter: string
    sharingTwitter: string
    shareNeedsImage: string
    shareNeedsMosaic: string
    shareNeedsAfter: string
    shareUnsupported: string
    shareTrayLabel: string
    shareReadyHint: string
    copyTwitterImage: string
    openTwitter: string
    saveTwitterImage: string
    fitWidth: string
    fitHeight: string
    actualSize: string
    zoomIn: string
    zoomOut: string
    pan: string
    edit: string
    emptyTitle: string
    emptyBody: string
    canvasLabel: string
    progress: (current: number, total: number) => string
    toolMode: Record<DrawTool, string>
  }
  settings: {
    label: string
    title: string
    persisted: string
    mosaicType: string
    mosaicTypes: Record<MosaicType, string>
    tool: string
    tools: Record<DrawTool, string>
    brushSize: string
    blockSize: string
    strength: string
    fileSuffix: string
    exportFormat: string
    originalExtension: string
    png: string
    jpeg: string
    presets: string
    presetLabels: Record<MosaicPresetId, string>
    presetVisibleLabels: Record<MosaicPresetId, string>
    skebNeedsImage: string
    reset: string
  }
}

export const UI_COPY: Record<Language, UiCopy> = {
  ja: {
    appTitle: '画像モザイク加工',
    brandMark: 'モ',
    status: {
      settingsSaved: '設定を保存済み',
      noSupportedImages: '対応している画像が選択されていません',
      imageDecodeFailed: '画像の読み込みに失敗しました',
      lastOperationRemoved: '直前の加工を取り消しました',
      currentImageReset: '現在の画像をリセットしました',
      preparingExport: 'ZIPを書き出しています',
      exportFailed: '書き出しに失敗しました',
      preparingShare: 'Twitter共有用の画像を準備しています',
      shareStarted: '画像ファイル共有を開始しました',
      shareFailed: 'Twitter共有を開始できませんでした',
      shareUnsupported: 'このブラウザは画像付き共有に対応していません',
      shareCancelled: 'Twitter共有をキャンセルしました',
      shareReady: '共有用画像を準備しました',
      shareImageCopied: '画像をコピーしました。Twitter投稿画面で貼り付けてください',
      shareImageCopyFailed: '画像コピーに失敗しました。画像を保存して添付してください',
      shareTwitterOpened: 'Twitter投稿画面を開きました',
      imageListReset: '画像一覧をリセットしました',
      presetApplied: (name) => `${name}を適用しました`,
      imagesImported: (count) => `${count}件の画像を読み込みました`,
      exportedImages: (count) => `${count}件の画像を書き出しました`,
    },
    actions: {
      importFiles: '画像を追加',
      importFolder: 'フォルダ読込',
      exportAll: '一括保存',
      exporting: '保存中',
      showSettings: '設定を表示',
      hideSettings: '設定を隠す',
    },
    queue: {
      label: '画像一覧',
      title: '画像一覧',
      count: (edited, total) => `${edited}/${total} 加工済み`,
      show: '画像一覧を表示',
      hide: '画像一覧を隠す',
      reset: 'リストをリセット',
      empty: '画像なし',
      thumbnailLabel: (index, total, edited) =>
        `${index} / ${total}${edited ? '、加工済み' : ''}`,
    },
    editor: {
      label: 'モザイク編集',
      readyTitle: '準備完了',
      activeTitle: '編集中',
      readyHint: '画像を読み込んでください',
      activeHint: '範囲を指定してモザイクを適用します',
      previous: '前の画像',
      next: '次の画像',
      undo: '元に戻す',
      reset: 'この画像をリセット',
      compareBefore: 'Before/After確認',
      compareAfter: 'After表示に戻す',
      shareTwitter: 'Twitterへ共有',
      sharingTwitter: 'Twitter共有を準備中',
      shareNeedsImage: '画像を読み込むとTwitter共有できます',
      shareNeedsMosaic: 'モザイク適用後にTwitter共有できます',
      shareNeedsAfter: 'After表示に戻すとTwitter共有できます',
      shareUnsupported: '画像付き共有に対応したブラウザで利用できます',
      shareTrayLabel: 'Twitter共有準備',
      shareReadyHint: '画像をコピーしてからTwitterを開き、投稿欄へ貼り付けてください。',
      copyTwitterImage: '画像をコピー',
      openTwitter: 'Twitterを開く',
      saveTwitterImage: '画像を保存',
      fitWidth: '幅に合わせる',
      fitHeight: '高さに合わせる',
      actualSize: '100%表示',
      zoomIn: '拡大',
      zoomOut: '縮小',
      pan: 'パン',
      edit: '編集',
      emptyTitle: '画像を読み込む',
      emptyBody: 'このブラウザ内で処理します',
      canvasLabel: '編集キャンバス',
      progress: (current, total) => `${current} / ${total}`,
      toolMode: {
        brush: 'ブラシ',
        rectangle: '矩形',
      },
    },
    settings: {
      label: 'モザイク設定',
      title: '設定',
      persisted: '保存済み',
      mosaicType: 'モザイク種類',
      mosaicTypes: {
        pixelate: 'ピクセル',
        blur: 'ぼかし',
        noise: 'ノイズ',
      },
      tool: '範囲指定',
      tools: {
        brush: 'ブラシ',
        rectangle: '矩形',
      },
      brushSize: 'ブラシサイズ',
      blockSize: 'ブロックサイズ',
      strength: '強さ',
      fileSuffix: '接尾辞',
      exportFormat: '保存形式',
      originalExtension: '元の拡張子',
      png: 'PNG',
      jpeg: 'JPEG',
      presets: 'プリセット',
      presetLabels: {
        fantiaPixelate: 'Fantia ピクセル',
        fantiaBlur: 'Fantia ぼかし',
        skebPixelate: 'Skeb 1%',
      },
      presetVisibleLabels: {
        fantiaPixelate: 'ピクセル',
        fantiaBlur: 'ぼかし',
        skebPixelate: '',
      },
      skebNeedsImage: 'Skeb 1%は画像読み込み後に使用できます',
      reset: '設定を初期化',
    },
  },
  en: {
    appTitle: 'Image Mosaic Effect',
    brandMark: 'IM',
    status: {
      settingsSaved: 'Settings saved locally',
      noSupportedImages: 'No supported images selected',
      imageDecodeFailed: 'Image decode failed',
      lastOperationRemoved: 'Last operation removed',
      currentImageReset: 'Current image reset',
      preparingExport: 'Preparing ZIP export',
      exportFailed: 'Export failed',
      preparingShare: 'Preparing image for Twitter sharing',
      shareStarted: 'Image file sharing started',
      shareFailed: 'Twitter sharing could not start',
      shareUnsupported: 'This browser does not support image file sharing',
      shareCancelled: 'Twitter sharing cancelled',
      shareReady: 'Share image prepared',
      shareImageCopied: 'Image copied. Paste it into the Twitter composer.',
      shareImageCopyFailed: 'Image copy failed. Save and attach the image instead.',
      shareTwitterOpened: 'Twitter composer opened',
      imageListReset: 'Image list reset',
      presetApplied: (name) => `${name} applied`,
      imagesImported: (count) => `${count} images imported`,
      exportedImages: (count) => `Exported ${count} images as ZIP`,
    },
    actions: {
      importFiles: 'Import files',
      importFolder: 'Import folder',
      exportAll: 'Export all',
      exporting: 'Exporting',
      showSettings: 'Show settings',
      hideSettings: 'Hide settings',
    },
    queue: {
      label: 'Image queue',
      title: 'Queue',
      count: (edited, total) => `${edited}/${total} edited`,
      show: 'Show image list',
      hide: 'Hide image list',
      reset: 'Reset list',
      empty: 'No images',
      thumbnailLabel: (index, total, edited) =>
        `${index} / ${total}${edited ? ', edited' : ''}`,
    },
    editor: {
      label: 'Mosaic editor',
      readyTitle: 'Ready',
      activeTitle: 'Editing',
      readyHint: 'Import images to start',
      activeHint: 'Mark areas to apply mosaic',
      previous: 'Previous image',
      next: 'Next image',
      undo: 'Undo',
      reset: 'Reset image',
      compareBefore: 'Before/After preview',
      compareAfter: 'Return to after preview',
      shareTwitter: 'Share to Twitter',
      sharingTwitter: 'Preparing Twitter share',
      shareNeedsImage: 'Import an image to share to Twitter',
      shareNeedsMosaic: 'Apply mosaic before sharing to Twitter',
      shareNeedsAfter: 'Return to after preview before sharing',
      shareUnsupported: 'Use a browser that supports image file sharing',
      shareTrayLabel: 'Twitter share prep',
      shareReadyHint: 'Copy the image, then open Twitter and paste it into the composer.',
      copyTwitterImage: 'Copy image',
      openTwitter: 'Open Twitter',
      saveTwitterImage: 'Save image',
      fitWidth: 'Fit to width',
      fitHeight: 'Fit to height',
      actualSize: '100% view',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      pan: 'Pan',
      edit: 'Edit',
      emptyTitle: 'Import local images',
      emptyBody: 'Files stay in this browser session.',
      canvasLabel: 'Editing canvas',
      progress: (current, total) => `${current} / ${total}`,
      toolMode: {
        brush: 'Brush mode',
        rectangle: 'Rectangle mode',
      },
    },
    settings: {
      label: 'Mosaic settings',
      title: 'Settings',
      persisted: 'Persisted',
      mosaicType: 'Mosaic type',
      mosaicTypes: {
        pixelate: 'Pixelate',
        blur: 'Blur',
        noise: 'Noise',
      },
      tool: 'Tool',
      tools: {
        brush: 'Brush',
        rectangle: 'Rect',
      },
      brushSize: 'Brush size',
      blockSize: 'Block size',
      strength: 'Strength',
      fileSuffix: 'File suffix',
      exportFormat: 'Export format',
      originalExtension: 'Original extension',
      png: 'PNG',
      jpeg: 'JPEG',
      presets: 'Presets',
      presetLabels: {
        fantiaPixelate: 'Fantia pixelate',
        fantiaBlur: 'Fantia blur',
        skebPixelate: 'Skeb 1%',
      },
      presetVisibleLabels: {
        fantiaPixelate: 'Pixelate',
        fantiaBlur: 'Blur',
        skebPixelate: '',
      },
      skebNeedsImage: 'Skeb 1% can be used after an image is loaded',
      reset: 'Reset settings',
    },
  },
}

export function normalizeLanguage(value: unknown): Language {
  return value === 'en' || value === 'ja' ? value : DEFAULT_LANGUAGE
}

export function loadLanguage(storage: Storage | undefined = globalThis.localStorage) {
  if (!storage) {
    return DEFAULT_LANGUAGE
  }
  return normalizeLanguage(storage.getItem(LANGUAGE_KEY))
}

export function saveLanguage(
  language: Language,
  storage: Storage | undefined = globalThis.localStorage,
) {
  if (!storage) {
    return
  }
  storage.setItem(LANGUAGE_KEY, normalizeLanguage(language))
}
