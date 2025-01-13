import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../../cc-styles'
import { CCSlideShowShape } from '../CCSlideShowShapeUtil'
import { CCSlideShape } from '../CCSlideShapeUtil'

const { SLIDE_SPACING: spacing, SLIDE_HEADER_HEIGHT: headerHeight, SLIDE_CONTENT_PADDING: contentPadding } = CC_SLIDESHOW_STYLE_CONSTANTS

export interface SlotPosition {
  x: number
  y: number
}

export class SlidePositionUtil {
  static getSlotDimensions(slideshow: CCSlideShowShape) {
    const slotWidth = slideshow.props.w / slideshow.props.slides.length
    const slotHeight = slideshow.props.h - headerHeight - (2 * contentPadding)
    return { slotWidth, slotHeight }
  }

  static getSlotPosition(
    pattern: string, 
    index: number, 
    slideshow: CCSlideShowShape, 
    slide: CCSlideShape
  ): SlotPosition {
    const { slotWidth, slotHeight } = this.getSlotDimensions(slideshow)
    const verticalOffset = headerHeight + contentPadding

    // Pre-calculate grid values
    const gridColumns = Math.floor((slideshow.props.w - spacing) / slotWidth)
    const gridCol = index % gridColumns
    const gridRow = Math.floor(index / gridColumns)

    switch (pattern) {
      case 'horizontal':
        return {
          x: slideshow.x + spacing + (index * slotWidth),
          y: slideshow.y + verticalOffset
        }
      case 'vertical':
        return {
          x: slideshow.x + (slideshow.props.w - slide.props.w) / 2,
          y: slideshow.y + verticalOffset + (index * slotHeight)
        }
      case 'grid':
        return {
          x: slideshow.x + spacing + (gridCol * slotWidth),
          y: slideshow.y + verticalOffset + (gridRow * slotHeight)
        }
      default:
        throw new Error(`Unsupported slide pattern: ${pattern}`)
    }
  }

  static getNearestSlot(
    currentX: number, 
    parentX: number, 
    slotWidth: number, 
    totalSlots: number
  ): number {
    const relativePosition = currentX - parentX
    const nearestSlot = Math.round(relativePosition / slotWidth)
    return Math.max(0, Math.min(totalSlots - 1, nearestSlot))
  }

  static getConstrainedPosition(
    pattern: string,
    current: CCSlideShape,
    initial: CCSlideShape,
    slideshow: CCSlideShowShape
  ): SlotPosition {
    const verticalOffset = headerHeight + contentPadding

    switch (pattern) {
      case 'horizontal':
        return {
          x: Math.max(
            spacing,
            Math.min(slideshow.props.w - current.props.w - spacing, current.x)
          ),
          y: initial.y
        }
      case 'vertical':
        return {
          x: (slideshow.props.w - current.props.w) / 2,
          y: Math.max(
            verticalOffset + spacing,
            Math.min(slideshow.props.h - current.props.h - spacing, current.y)
          )
        }
      case 'grid':
        return {
          x: Math.max(
            spacing,
            Math.min(slideshow.props.w - current.props.w - spacing, current.x)
          ),
          y: Math.max(
            verticalOffset + spacing,
            Math.min(slideshow.props.h - current.props.h - spacing, current.y)
          )
        }
      default:
        throw new Error(`Unsupported slide pattern: ${pattern}`)
    }
  }
} 