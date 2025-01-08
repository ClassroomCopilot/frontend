import { Editor, TLShapeId } from '@tldraw/tldraw'
import { logger } from '../../debugConfig'
import { moveToSlide, getCurrentSlideId } from '../../utils/tldraw/cc-base/cc-slideshow/useSlideShow'
import { CCSlideShape } from '../../utils/tldraw/cc-base/cc-slideshow/CCSlideShapeUtil'

interface PresentationSlideChangeEvent {
  slideId: string
  slideshowId: string
  index: number
}

// Extend the editor's event map with our custom event
declare module '@tldraw/tldraw' {
  interface TLEventMap {
    'custom-presentation-slide-change': PresentationSlideChangeEvent
  }
}

export class PresentationService {
  private editor: Editor

  constructor(editor: Editor) {
    this.editor = editor
  }

  startPresentationMode() {
    logger.info('presentation', '🎬 Starting presentation mode')

    // Move to current slide with presentation mode enabled
    const currentSlideId = getCurrentSlideId()
    if (currentSlideId) {
      const currentSlide = this.editor.getShape(currentSlideId as TLShapeId) as CCSlideShape | undefined
      if (currentSlide) {
        logger.info('presentation', '🎯 Moving to initial slide', {
          slideId: currentSlideId,
          timestamp: new Date().toISOString()
        })
        moveToSlide(this.editor, currentSlide, true)
      }
    }

    // Listen for slide change events
    const handleSlideChange = (event: PresentationSlideChangeEvent) => {
      logger.info('presentation', '🔄 Received slide change event', {
        slideId: event.slideId,
        slideshowId: event.slideshowId,
        index: event.index,
        timestamp: new Date().toISOString()
      })

      const slide = this.editor.getShape(event.slideId as TLShapeId) as CCSlideShape | undefined
      if (slide) {
        moveToSlide(this.editor, slide, true)
      }
    }

    // Register event listener
    this.editor.on('custom-presentation-slide-change', handleSlideChange)

    // Return cleanup function
    return () => {
      this.editor.off('custom-presentation-slide-change', handleSlideChange)
    }
  }

  stopPresentationMode() {
    logger.info('presentation', '⏹️ Stopping presentation mode')
    // Additional cleanup if needed
  }
}
