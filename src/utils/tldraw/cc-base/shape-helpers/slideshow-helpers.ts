import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { CCSlideShowShape } from '../cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShape } from '../cc-slideshow/CCSlideShapeUtil'
import { logger } from '../../../../debugConfig'

interface SlideshowBaseProps {
  type: string
  x: number
  y: number
  rotation: number
  isLocked: boolean
  props: {
    w: number
    h: number
  }
}

export function createSlideshow(
  editor: Editor,
  baseProps: SlideshowBaseProps,
  slidePattern: string = 'horizontal',
  numSlides: number = 4
) {
  const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
  const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
  const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING
  const verticalOffset = headerHeight + contentPadding

  // Create slide IDs
  const slideIds: TLShapeId[] = Array(numSlides)
    .fill(0)
    .map(() => createShapeId())

  // Calculate slots based on pattern
  const slots = slideIds.map((id, index) => {
    const slotWidth = baseProps.props.w / numSlides
    const x = baseProps.x + spacing + (index * slotWidth)
    const y = baseProps.y + verticalOffset

    return {
      x,
      y,
      index,
      occupiedBy: id
    }
  })

  // Create slideshow
  const slideshowId = createShapeId()
  const slideshowShape = editor.createShape<CCSlideShowShape>({
    id: slideshowId,
    ...baseProps,
    type: 'cc-slideshow',
    props: {
      title: 'Slideshow',
      w: baseProps.props.w,
      h: baseProps.props.h,
      headerColor: '#718096',
      isLocked: false,
      slides: slideIds,
      currentSlideIndex: 0,
      slidePattern,
      slots
    }
  })

  // Create slides and their bindings
  slideIds.forEach((id, index) => {
    const slot = slots[index]
    editor.createShape<CCSlideShape>({
      id,
      type: 'cc-slide',
      x: slot.x,
      y: slot.y,
      rotation: 0,
      isLocked: false,
      props: {
        title: `Slide ${index + 1} (${id})`,
        w: baseProps.props.w / numSlides - (2 * spacing),
        h: baseProps.props.h - headerHeight - (2 * contentPadding),
        headerColor: '#718096',
        isLocked: false
      }
    })

    // Create binding
    editor.batch(() => {
      const binding = editor.createBinding({
        type: 'cc-slide-layout',
        fromId: slideshowId,
        toId: id,
        props: {
          placeholder: false,
          isMovingWithParent: false,
          lastKnownSlot: index
        }
      })

      if (!binding) {
        logger.error('system', '❌ Failed to create slide layout binding', {
          slideshowId,
          slideId: id,
          index
        })
      } else {
        logger.info('system', '✅ Created slide layout binding', {
          slideshowId,
          slideId: id,
          index
        })
      }
    })
  })

  return slideshowShape
} 