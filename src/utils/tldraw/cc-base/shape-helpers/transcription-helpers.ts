import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'

export const createLiveTranscriptionShape = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  }
) => {
  const config = CC_SHAPE_CONFIGS['cc-live-transcription']
  
  editor.createShape({
    ...baseProps,
    type: 'cc-live-transcription',
    props: {
      ...config.defaultProps,
      w: config.width,
      h: config.height,
    },
  })
}

export const createLiveTranscriptionShapeAtCenter = (editor: Editor) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();
  const config = CC_SHAPE_CONFIGS['cc-live-transcription'];
  const shapeId = createShapeId();

  createLiveTranscriptionShape(editor, {
    id: shapeId,
    x: x - config.xOffset,
    y: y - config.yOffset,
    rotation: 0,
    isLocked: false,
  });
} 