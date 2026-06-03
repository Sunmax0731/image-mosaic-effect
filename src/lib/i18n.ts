import type { DrawTool, MosaicType } from '../types'

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
    imageListReset: string
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
      imageListReset: '画像一覧をリセットしました',
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
      imageListReset: 'Image list reset',
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
