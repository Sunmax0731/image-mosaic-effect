export type MosaicType = 'pixelate' | 'blur' | 'noise'

export type DrawTool = 'brush' | 'rectangle'

export type MosaicShape = 'circle' | 'rect'

export type ExportFormat = 'png' | 'jpeg'

export interface MosaicSettings {
  version: 1
  mosaicType: MosaicType
  drawTool: DrawTool
  brushSize: number
  blockSize: number
  strength: number
  suffix: string
  exportFormat: ExportFormat
  jpegQuality: number
}

export interface MosaicOperation {
  id: string
  type: MosaicType
  shape: MosaicShape
  x: number
  y: number
  width: number
  height: number
  radius: number
  blockSize: number
  strength: number
}

export interface ImageEntry {
  id: string
  name: string
  relativePath: string
  type: string
  size: number
  url: string
  operations: MosaicOperation[]
  width?: number
  height?: number
  lastEditedAt?: number
}

export interface CanvasPoint {
  x: number
  y: number
}
