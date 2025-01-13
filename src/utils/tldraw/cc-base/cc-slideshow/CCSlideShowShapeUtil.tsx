import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, TLShapeId } from '@tldraw/tldraw'
import { getDefaultCCSlideShowProps } from '../cc-props'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

export interface CCSlideShowShape extends CCBaseShape {
  type: 'cc-slideshow'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    slides: TLShapeId[]
    currentSlideIndex: number
    slidePattern: string
    slots: Array<{
      x: number
      y: number
      index: number
      occupiedBy?: TLShapeId
    }>
  }
}

export class CCSlideShowShapeUtil extends CCBaseShapeUtil<CCSlideShowShape> {
  static override type = 'cc-slideshow' as const
  static override props = ccShapeProps.slideshow
  static override migrations = ccShapeMigrations.slideshow

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  getDefaultProps(): CCSlideShowShape['props'] {
    return {
      ...getDefaultCCSlideShowProps(),
      slots: [],
      slides: []
    } as CCSlideShowShape['props']
  }

  override canResize = () => false
  override isAspectRatioLocked = () => true
  override hideResizeHandles = () => false
  override hideRotateHandle = () => false
  override canEdit = () => false
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    return true
  }

  onBeforeCreate(shape: CCSlideShowShape): CCSlideShowShape {
    return shape
  }

  onChildrenChange = (shape: CCSlideShowShape) => {
    const children = this.editor.getSortedChildIdsForParent(shape.id)
    if (children.length === 0) return []

    return [{
      id: shape.id,
      type: 'cc-slideshow',
      props: {
        ...shape.props,
        slides: children
      }
    }]
  }

  updateSlots(shape: CCSlideShowShape) {
    const { w, h, slidePattern, slides } = shape.props
    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING
    const verticalOffset = headerHeight + contentPadding
    const slots = []

    // Pre-calculate all slot dimensions
    const horizontalSlotWidth = w / Math.max(1, slides.length)
    const verticalSlotHeight = (h - headerHeight - (2 * contentPadding)) / Math.max(1, slides.length)

    // Pre-calculate grid values
    const gridColumns = Math.ceil(Math.sqrt(slides.length))
    const gridRows = Math.ceil(slides.length / gridColumns)
    const gridSlotWidth = (w - spacing * (gridColumns + 1)) / gridColumns
    const gridSlotHeight = (h - headerHeight - contentPadding * 2 - spacing * (gridRows + 1)) / gridRows

    // Pre-calculate radial values
    const radius = Math.min(w, h - headerHeight - 2 * contentPadding) / 3
    const centerX = shape.x + w / 2
    const centerY = shape.y + verticalOffset + (h - headerHeight - 2 * contentPadding) / 2

    let i = 0, gridCol = 0, gridRow = 0, angle = 0

    switch (slidePattern) {
      case 'horizontal':
        for (i = 0; i < slides.length; i++) {
          slots.push({
            x: shape.x + spacing + (i * horizontalSlotWidth),
            y: shape.y + verticalOffset,
            index: i,
            occupiedBy: slides[i]
          })
        }
        break

      case 'vertical':
        for (i = 0; i < slides.length; i++) {
          slots.push({
            x: shape.x + spacing,
            y: shape.y + verticalOffset + (i * verticalSlotHeight),
            index: i,
            occupiedBy: slides[i]
          })
        }
        break

      case 'grid':
        for (i = 0; i < slides.length; i++) {
          gridCol = i % gridColumns
          gridRow = Math.floor(i / gridColumns)
          slots.push({
            x: shape.x + spacing + (gridCol * (gridSlotWidth + spacing)),
            y: shape.y + verticalOffset + (gridRow * (gridSlotHeight + spacing)),
            index: i,
            occupiedBy: slides[i]
          })
        }
        break

      case 'radial':
        for (i = 0; i < slides.length; i++) {
          angle = (2 * Math.PI * i) / slides.length
          slots.push({
            x: centerX + radius * Math.cos(angle) - w / (2 * slides.length),
            y: centerY + radius * Math.sin(angle) - (h - headerHeight - 2 * contentPadding) / (2 * slides.length),
            index: i,
            occupiedBy: slides[i]
          })
        }
        break
    }

    return slots
  }

  override renderContent = () => {
    return <div />
  }
} 