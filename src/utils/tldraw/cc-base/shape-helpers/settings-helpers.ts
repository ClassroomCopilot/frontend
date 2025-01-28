import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'

const type = 'cc-settings'
const config = CC_SHAPE_CONFIGS[type]

export const createSettingsShape = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  }
) => {
  editor.createShape({
    ...baseProps,
    type,
    props: {
      ...config.defaultProps,
      w: config.width,
      h: config.height,
    },
  })
}

export const createSettingsShapeAtCenter = (editor: Editor) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();
  const shapeId = createShapeId();

  createSettingsShape(editor, {
    id: shapeId,
    x: x - config.xOffset,
    y: y - config.yOffset,
    rotation: 0,
    isLocked: false,
  });
} 