import { TldrawUiButton } from '@tldraw/tldraw'
import { useEditor } from '@tldraw/tldraw'
import { createCCSlideShowFromTemplate } from './useSlideShow'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'

export function CCShapesPanel() {
  const editor = useEditor()

  const handleCreateSlideShow = (pattern: 'horizontal' | 'vertical' | 'grid') => {
    const newShapeId = createCCSlideShowFromTemplate(editor, pattern, {
      slideWidth: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH,
      slideHeight: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT,
    })
    if (newShapeId) {
      editor.select(newShapeId)
      editor.setCurrentTool('select')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
      <TldrawUiButton
        type="normal"
        onClick={() => handleCreateSlideShow('horizontal')}
      >
        Horizontal Slideshow
      </TldrawUiButton>
      <TldrawUiButton
        type="normal"
        onClick={() => handleCreateSlideShow('vertical')}
      >
        Vertical Slideshow
      </TldrawUiButton>
      <TldrawUiButton
        type="normal"
        onClick={() => handleCreateSlideShow('grid')}
      >
        Grid Slideshow
      </TldrawUiButton>
    </div>
  )
} 