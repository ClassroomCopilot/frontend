import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { CCSlideShowShape } from '../cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShape } from '../cc-slideshow/CCSlideShapeUtil'

interface SlideshowDimensions {
  width: number
  height: number
}

export const calculateSlideshowDimensions = (
  numSlides: number,
  slidePattern: string,
  slideWidth: number = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH,
  slideHeight: number = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT
): SlideshowDimensions => {
  const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
  const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING
  const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING

  switch (slidePattern) {
    case 'vertical':
      return {
        width: slideWidth + spacing * 2,
        height: headerHeight + (slideHeight * numSlides + spacing * (numSlides + 1)) + contentPadding * 2
      }
    case 'radial':
      return {
        width: slideWidth + spacing * 2,
        height: headerHeight + (slideHeight * numSlides + spacing * (numSlides + 1)) + contentPadding * 2
      }
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(numSlides))
      const rows = Math.ceil(numSlides / cols)
      return {
        width: slideWidth * cols + spacing * (cols + 1),
        height: headerHeight + (slideHeight * rows + spacing * (rows + 1)) + contentPadding * 2
      }
    }
    case 'horizontal':
    default:
      return {
        width: slideWidth * numSlides + spacing * (numSlides + 1),
        height: headerHeight + (slideHeight + spacing * 2) + contentPadding * 2
      }
  }
}

interface SlidePosition {
  x: number
  y: number
}

export const calculateSlidePosition = (
  index: number,
  numSlides: number,
  slidePattern: string,
  slideWidth: number,
  slideHeight: number,
  slideshowWidth: number,
  slideshowHeight: number
): SlidePosition => {
  const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
  const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
  const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING
  const cols = Math.ceil(Math.sqrt(numSlides))
  const contentHeight = slideshowHeight - headerHeight - contentPadding * 2
  const radius = Math.min(slideshowWidth, contentHeight) / 3

  switch (slidePattern) {
    case 'vertical':
      return {
        x: (slideshowWidth - slideWidth) / 2,
        y: headerHeight + contentPadding + spacing + index * (slideHeight + spacing)
      }
    case 'grid':
      return {
        x: spacing + (index % cols) * (slideWidth + spacing),
        y: headerHeight + contentPadding + spacing + Math.floor(index / cols) * (slideHeight + spacing)
      }
    case 'radial': {
      const angle = (2 * Math.PI * index) / numSlides
      return {
        x: slideshowWidth / 2 + radius * Math.cos(angle) - slideWidth / 2,
        y: headerHeight + contentPadding + contentHeight / 2 + radius * Math.sin(angle) - slideHeight / 2
      }
    }
    case 'horizontal':
    default:
      return {
        x: spacing + index * (slideWidth + spacing),
        y: headerHeight + contentPadding + spacing
      }
  }
}

export const createSlideshow = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  },
  slidePattern: string = 'horizontal',
  numSlides: number = 3
) => {
  const slideWidth = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH
  const slideHeight = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT
  const slideIds: TLShapeId[] = []

  // Create slide IDs first
  for (let i = 0; i < numSlides; i++) {
    slideIds.push(createShapeId())
  }

  // Calculate dimensions
  const { width: slideshowWidth, height: slideshowHeight } = calculateSlideshowDimensions(
    numSlides,
    slidePattern,
    slideWidth,
    slideHeight
  )

  // Create the slideshow
  editor.createShape<CCSlideShowShape>({
    ...baseProps,
    id: baseProps.id,
    type: 'cc-slideshow',
    props: {
      title: `Slideshow (${slidePattern}: ${baseProps.id})`,
      w: slideshowWidth,
      h: slideshowHeight,
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      isLocked: false,
      slides: slideIds,
      currentSlideIndex: 0,
      slidePattern
    }
  })

  // Create slides and bindings
  for (let i = 0; i < numSlides; i++) {
    const { x: slideX, y: slideY } = calculateSlidePosition(
      i,
      numSlides,
      slidePattern,
      slideWidth,
      slideHeight,
      slideshowWidth,
      slideshowHeight
    )

    // Create slide
    editor.createShape<CCSlideShape>({
      id: slideIds[i],
      type: 'cc-slide',
      x: slideX,
      y: slideY,
      parentId: baseProps.id,
      props: {
        title: `Slide ${i + 1} (${slideIds[i]})`,
        w: slideWidth,
        h: slideHeight,
        headerColor: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_COLORS.secondary,
        isLocked: false
      }
    })

    // Create binding
    editor.createBinding({
      type: 'cc-slide-layout',
      fromId: baseProps.id,
      toId: slideIds[i],
      props: {
        placeholder: false
      }
    })
  }
} 