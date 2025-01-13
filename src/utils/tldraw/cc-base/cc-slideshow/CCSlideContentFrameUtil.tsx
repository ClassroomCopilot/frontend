import { BaseBoxShapeUtil, DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, T, TLBaseShape, TLFrameShapeProps, TLShapeId } from '@tldraw/tldraw'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

export interface CCSlideContentFrameShape extends TLBaseShape<'cc-slide-content-frame', TLFrameShapeProps & {
  name: string
  headerColor: string
  isLocked: boolean
  parentSlideId: TLShapeId
}> {}

export class CCSlideContentFrameUtil extends BaseBoxShapeUtil<CCSlideContentFrameShape> {
  static type = 'cc-slide-content-frame' as const
  
  // Define props with proper validators
  static props = {
    name: T.string,
    w: T.number,
    h: T.number,
    headerColor: T.string,
    isLocked: T.boolean,
    parentSlideId: T.string // TLShapeId is a string at runtime
  }

  static migrations = {
    currentVersion: 1,
    firstVersion: 1,
    migrators: {},
    sequence: []
  }

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  getDefaultProps(): TLFrameShapeProps & {
    name: string
    headerColor: string
    isLocked: boolean
    parentSlideId: TLShapeId
  } {
    return {
      name: 'Slide Content Frame',
      w: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH,
      h: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT - CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
      headerColor: 'transparent',
      isLocked: false,
      parentSlideId: '' as TLShapeId
    }
  }

  // Prevent resizing
  canResize = () => false
  isAspectRatioLocked = () => true
  hideResizeHandles = () => true
  hideRotateHandle = () => true
  canEdit = () => false

  // Prevent selection and movement
  canSelect = () => false
  canUnmount = () => false
  canBind = (args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean => {
    // Allow binding from any shape to the content frame
    return args.toShapeType === 'cc-slide-content-frame' && args.bindingType === 'cc-slide-content-binding'
  }

  // Prevent translation/movement
  onTranslate = () => {
    return
  }

  onBeforeCreate = (shape: CCSlideContentFrameShape) => {
    return shape
  }

  onChildrenChange = () => {
    // Handle children changes if needed
    return []
  }

  indicator(shape: CCSlideContentFrameShape) {
    const { w, h } = shape.props
    return (
      <rect
        width={w}
        height={h}
        fill="none"
      />
    )
  }

  component(shape: CCSlideContentFrameShape) {
    const { w, h } = shape.props
    return (
      <div style={{ 
        width: w,
        height: h,
        backgroundColor: 'transparent',
        position: 'relative',
        pointerEvents: 'none' // Prevent interaction with the frame itself
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          pointerEvents: 'all' // Allow interaction with frame contents
        }}>
          {/* Frame contents will be rendered by TLDraw */}
        </div>
      </div>
    )
  }
} 