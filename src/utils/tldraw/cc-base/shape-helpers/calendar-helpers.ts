import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'

export const createCalendarShape = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  }
) => {
  const config = CC_SHAPE_CONFIGS['cc-calendar']
  
  editor.createShape({
    ...baseProps,
    type: 'cc-calendar',
    props: {
      ...config.defaultProps,
      w: config.width,
      h: config.height,
    },
  })
}

export const createCalendarShapeAtCenter = (editor: Editor) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();
  const config = CC_SHAPE_CONFIGS['cc-calendar'];
  const shapeId = createShapeId();

  createCalendarShape(editor, {
    id: shapeId,
    x: x - config.xOffset,
    y: y - config.yOffset,
    rotation: 0,
    isLocked: false,
  });
} 