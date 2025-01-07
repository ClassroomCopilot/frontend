import { Editor, createShapeId, createBindingId } from '@tldraw/tldraw'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideShape } from './CCSlideShapeUtil'

export function createCCSlideShowFromTemplate(
  editor: Editor,
  pattern: CCSlideShowShape['props']['slidePattern'],
  defaults: {
    slideCount?: number
    slideWidth?: number
    slideHeight?: number
  } = {}
) {
  const slideshowId = createShapeId()
  const slideCount = defaults.slideCount || 3
  const slideWidth = defaults.slideWidth || 800
  const slideHeight = defaults.slideHeight || 600
  const gap = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING

  // Calculate initial slideshow dimensions based on pattern
  let slideshowWidth = 0
  let slideshowHeight = 0

  switch (pattern) {
    case 'vertical':
      slideshowWidth = slideWidth + (gap * 2)
      slideshowHeight = (slideHeight * slideCount) + (gap * (slideCount - 1)) + (gap * 2)
      break
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(slideCount))
      const rows = Math.ceil(slideCount / cols)
      slideshowWidth = (slideWidth * cols) + (gap * (cols - 1)) + (gap * 2)
      slideshowHeight = (slideHeight * rows) + (gap * (rows - 1)) + (gap * 2)
      break
    }
    default: // horizontal
      slideshowWidth = (slideWidth * slideCount) + (gap * (slideCount - 1)) + (gap * 2)
      slideshowHeight = slideHeight + (gap * 2)
  }

  // Create all slides first and collect their IDs
  const slideIds = Array.from({ length: slideCount }, (_, i) => {
    const slideId = createShapeId()

    // Calculate initial position based on pattern
    let x = gap
    let y = gap

    switch (pattern) {
      case 'vertical':
        y += i * (slideHeight + gap)
        break
      case 'grid': {
        const cols = Math.ceil(Math.sqrt(slideCount))
        x += (i % cols) * (slideWidth + gap)
        y += Math.floor(i / cols) * (slideHeight + gap)
        break
      }
      default: // horizontal
        x += i * (slideWidth + gap)
    }

    // Create slide
    editor.createShape<CCSlideShape>({
      id: slideId,
      type: 'cc-slide',
      x,
      y,
      props: {
        title: `Slide ${i + 1}`,
        w: slideWidth,
        h: slideHeight,
        headerColor: '#3e6589',
        isLocked: false,
      },
    })

    return slideId
  })

  // Create slideshow with collected slide IDs
  editor.createShape<CCSlideShowShape>({
    id: slideshowId,
    type: 'cc-slideshow',
    x: 0,
    y: 0,
    props: {
      title: 'Slideshow',
      w: slideshowWidth,
      h: slideshowHeight,
      headerColor: '#3e6589',
      isLocked: false,
      slides: slideIds,
      currentSlideIndex: 0,
      slidePattern: pattern,
    },
  })

  // Create bindings after both slideshow and slides exist
  slideIds.forEach(slideId => {
    editor.createBinding({
      id: createBindingId(),
      type: 'cc-slide-layout',
      fromId: slideshowId,
      toId: slideId,
      props: {
        placeholder: false,
      },
    })
  })

  // Move camera to show the new slideshow
  const bounds = editor.getShapePageBounds(slideshowId)
  if (bounds) {
    editor.zoomToBounds(bounds, {
      animation: { duration: 400 },
      inset: 50,
    })
  }

  return slideshowId
} 