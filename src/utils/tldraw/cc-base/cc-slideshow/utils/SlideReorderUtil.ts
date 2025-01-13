import { Editor, TLShapeId } from '@tldraw/tldraw'
import { CCSlideShowShape } from '../CCSlideShowShapeUtil'
import { CCSlideShape } from '../CCSlideShapeUtil'
import { SlidePositionUtil } from './SlidePositionUtil'
import { logger } from '../../../../../debugConfig'

export class SlideReorderUtil {
  static reorderSlides(
    slides: TLShapeId[],
    fromIndex: number,
    toIndex: number
  ): TLShapeId[] {
    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, movedSlide)
    return newSlides
  }

  static applyReorder(
    editor: Editor,
    slideshow: CCSlideShowShape,
    fromIndex: number,
    toIndex: number,
    movedSlide: CCSlideShape
  ) {
    const newSlides = this.reorderSlides(slideshow.props.slides, fromIndex, toIndex)

    editor.batch(() => {
      // Move displaced slide to original position if it exists
      const displacedSlideId = slideshow.props.slides[toIndex]
      if (displacedSlideId !== movedSlide.id) {
        const displacedSlide = editor.getShape(displacedSlideId) as CCSlideShape
        if (displacedSlide) {
          const originalPosition = SlidePositionUtil.getSlotPosition(
            slideshow.props.slidePattern,
            fromIndex,
            slideshow,
            displacedSlide
          )

          editor.updateShape({
            id: displacedSlideId,
            type: 'cc-slide',
            x: originalPosition.x,
            y: originalPosition.y
          })
        }
      }

      // Update moved slide position
      const newPosition = SlidePositionUtil.getSlotPosition(
        slideshow.props.slidePattern,
        toIndex,
        slideshow,
        movedSlide
      )

      editor.updateShape({
        id: movedSlide.id,
        type: 'cc-slide',
        x: newPosition.x,
        y: newPosition.y
      })

      // Update slideshow order
      editor.updateShape({
        id: slideshow.id,
        type: slideshow.type,
        props: {
          ...slideshow.props,
          slides: newSlides
        }
      })

      logger.debug('system', '✅ Slide reorder applied', {
        movedSlideId: movedSlide.id,
        fromIndex,
        toIndex,
        newOrder: newSlides
      })
    })

    return newSlides
  }
} 