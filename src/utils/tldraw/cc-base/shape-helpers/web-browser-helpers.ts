import { Editor, createShapeId, TLShapeId, IndexKey, TLParentId } from '@tldraw/tldraw'
import { CCWebBrowserShape } from '../cc-web-browser/CCWebBrowserUtil'

interface WebBrowserShapeOptions {
  url: string
  x?: number
  y?: number
  w?: number
  h?: number
  title?: string
  isLoading?: boolean
}

interface WebBrowserShapeResult {
  id: TLShapeId
  url: string
  x: number
  y: number
}

export function createWebBrowserShapeInfo(options: WebBrowserShapeOptions): CCWebBrowserShape {
  const shapeId = createShapeId()
  return {
    id: shapeId,
    type: 'cc-web-browser',
    typeName: 'shape',
    x: options.x ?? 0,
    y: options.y ?? 0,
    rotation: 0,
    index: 'a1' as IndexKey,
    parentId: 'page:page' as TLParentId,
    isLocked: false,
    opacity: 1,
    meta: {},
    props: {
      w: options.w ?? 800,
      h: options.h ?? 600,
      title: options.title ?? 'Web Browser',
      headerColor: '#1a73e8',
      backgroundColor: '#ffffff',
      isLocked: false,
      url: options.url,
      history: [options.url],
      currentHistoryIndex: 0,
      isLoading: options.isLoading ?? true,
    },
  }
}

export function createWebBrowserShape(editor: Editor, options: WebBrowserShapeOptions): WebBrowserShapeResult {
  const shape = createWebBrowserShapeInfo(options)
  editor.createShape(shape)
  
  return {
    id: shape.id,
    url: options.url,
    x: shape.x,
    y: shape.y
  }
}

interface MultipleWebBrowserOptions {
  browsers: WebBrowserShapeOptions[]
  layout?: 'grid' | 'cascade' | 'horizontal' | 'vertical'
  spacing?: number
  startX?: number
  startY?: number
}

export function createMultipleWebBrowsers(
  editor: Editor,
  { browsers, layout = 'cascade', spacing = 20, startX = 0, startY = 0 }: MultipleWebBrowserOptions
): WebBrowserShapeResult[] {
  const results: WebBrowserShapeResult[] = []
  const baseWidth = 800
  const baseHeight = 600

  editor.batch(() => {
    browsers.forEach((browser, index) => {
      let x = startX
      let y = startY

      switch (layout) {
        case 'grid': {
          const cols = Math.ceil(Math.sqrt(browsers.length))
          x += (index % cols) * (baseWidth + spacing)
          y += Math.floor(index / cols) * (baseHeight + spacing)
          break
        }
        case 'cascade':
          x += index * spacing
          y += index * spacing
          break
        case 'horizontal':
          x += index * (baseWidth + spacing)
          break
        case 'vertical':
          y += index * (baseHeight + spacing)
          break
      }

      const result = createWebBrowserShape(editor, {
        ...browser,
        x,
        y,
        w: baseWidth,
        h: baseHeight
      })
      results.push(result)
    })
  })

  return results
}

// Helper function to arrange browser shapes in a specific layout
export function arrangeBrowserShapes(
  editor: Editor,
  shapeIds: TLShapeId[],
  layout: 'grid' | 'cascade' | 'horizontal' | 'vertical',
  options?: { spacing?: number; startX?: number; startY?: number }
) {
  const spacing = options?.spacing ?? 20
  const startX = options?.startX ?? 0
  const startY = options?.startY ?? 0
  const baseWidth = 800
  const baseHeight = 600

  editor.batch(() => {
    shapeIds.forEach((id, index) => {
      let x = startX
      let y = startY

      switch (layout) {
        case 'grid': {
          const cols = Math.ceil(Math.sqrt(shapeIds.length))
          x += (index % cols) * (baseWidth + spacing)
          y += Math.floor(index / cols) * (baseHeight + spacing)
          break
        }
        case 'cascade':
          x += index * spacing
          y += index * spacing
          break
        case 'horizontal':
          x += index * (baseWidth + spacing)
          break
        case 'vertical':
          y += index * (baseHeight + spacing)
          break
      }

      editor.updateShape({
        id,
        type: 'cc-web-browser',
        x,
        y,
      })
    })
  })
} 