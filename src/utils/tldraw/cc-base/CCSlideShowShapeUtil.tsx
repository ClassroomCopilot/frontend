import { ShapeUtil, TLBaseShape, HTMLContainer, DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, Rectangle2d, TLShapeId } from '@tldraw/tldraw'
import { getDefaultCCSlideShowProps } from './cc-props'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'
import { ccShapeProps } from './cc-props'
import { ccShapeMigrations } from './cc-migrations'

export type CCSlideShowShape = TLBaseShape<'cc-slideshow', {
  title: string
  w: number
  h: number
  headerColor: string
  isLocked: boolean
  slides: TLShapeId[]
  currentSlideIndex: number
  slidePattern: string
}>

export class CCSlideShowShapeUtil extends ShapeUtil<CCSlideShowShape> {
  static type = 'cc-slideshow' as const
  static props = ccShapeProps.slideshow
  static migrations = ccShapeMigrations.slideshow

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  getDefaultProps() {
    return getDefaultCCSlideShowProps()
  }

  getGeometry(shape: CCSlideShowShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  component(shape: CCSlideShowShape) {
    const { title, headerColor, slides, currentSlideIndex, slidePattern } = shape.props
    const { SLIDE_COLORS } = CC_SLIDESHOW_STYLE_CONSTANTS

    return (
      <HTMLContainer
        id={shape.id}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: SLIDE_COLORS.background,
            borderRadius: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_BORDER_RADIUS,
            border: `${CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_BORDER_WIDTH}px solid ${SLIDE_COLORS.border}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
              padding: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_PADDING,
              backgroundColor: headerColor,
              color: SLIDE_COLORS.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <span>{title}</span>
            <span>{`${currentSlideIndex + 1}/${slides.length}`}</span>
          </div>
          <div
            style={{
              flex: 1,
              padding: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING,
              display: 'flex',
              flexDirection: slidePattern === 'vertical' ? 'column' : 'row',
              gap: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING,
              overflow: 'auto',
            }}
          />
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: CCSlideShowShape) {
    const isHovered = this.editor.getHoveredShapeId() === shape.id;

    return (
      <>
        <rect 
          width={shape.props.w} 
          height={CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT}
          fill="none"
          stroke={isHovered ? "var(--color-selected)" : "none"}
          strokeWidth={2}
        />
        <rect 
          width={shape.props.w} 
          height={shape.props.h}
          fill="none"
          stroke={isHovered ? "var(--color-selected)" : "none"}
          strokeWidth={2}
        />
      </>
    )
  }

  override canBind = () => true
  override hideRotateHandle = () => true
  override canResize = () => false

  override onBeforeCreate(shape: CCSlideShowShape): CCSlideShowShape {
    return shape
  }

  override onChildrenChange = (shape: CCSlideShowShape) => {
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

  override onTranslate = (initial: CCSlideShowShape, current: CCSlideShowShape) => {
    // Let TLDraw handle the translation of children automatically
    return current
  }

  override isAspectRatioLocked = () => true

  isPointInShape(shape: CCSlideShowShape, point: { x: number; y: number }, margin?: number) {
    const { y } = point;
    
    // Lower priority than slide headers
    if (y <= CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT) {
      return {
        isHit: true,
        priority: 1  // Lower priority than slide headers
      };
    }

    // For the rest of the shape, use default hit testing with lower priority
    return {
      isHit: this.getGeometry(shape).bounds.containsPoint(point, margin ?? 0),
      priority: 1
    };
  }

  hideSelectionBoundsFg = () => false
  hideSelectionBoundsBg = () => false

  canEdit = () => true
  hideResizeHandles = () => false
  canUnmount = () => true

  onPointerEnter = () => {
    this.editor.setCursor({ type: 'pointer' });
  }

  onPointerLeave = () => {
    this.editor.setCursor({ type: 'default' });
  }
} 