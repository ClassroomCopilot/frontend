import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'

export const createYoutubeShape = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  },
  videoUrl: string
) => {
  const config = CC_SHAPE_CONFIGS['cc-youtube-embed']
  
  editor.createShape({
    ...baseProps,
    type: 'cc-youtube-embed',
    props: {
      ...config.defaultProps,
      w: config.width,
      h: config.height,
      video_url: videoUrl,
    },
  })
}

export const createYoutubeShapeAtCenter = (editor: Editor, videoUrl: string) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();
  const config = CC_SHAPE_CONFIGS['cc-youtube-embed'];
  const shapeId = createShapeId();

  createYoutubeShape(editor, {
    id: shapeId,
    x: x - config.xOffset,
    y: y - config.yOffset,
    rotation: 0,
    isLocked: false,
  }, videoUrl);
} 