import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'

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
  const config = CC_SHAPE_CONFIGS['cc-settings']
  
  editor.createShape({
    ...baseProps,
    type: 'cc-settings',
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
  const config = CC_SHAPE_CONFIGS['cc-settings'];
  const shapeId = createShapeId();

  createSettingsShape(editor, {
    id: shapeId,
    x: x - config.xOffset,
    y: y - config.yOffset,
    rotation: 0,
    isLocked: false,
  });
} 