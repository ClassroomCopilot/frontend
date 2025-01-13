import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, TLShapeId } from '@tldraw/tldraw'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

export interface CCSlideContentFrameShape extends CCBaseShape {
  type: 'cc-slide-content'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    parentSlideId: TLShapeId
  }
}

export class CCSlideContentFrameUtil extends CCBaseShapeUtil<CCSlideContentFrameShape> {
  static override type = 'cc-slide-content' as const
  static override props = ccShapeProps.slideContent
  static override migrations = ccShapeMigrations.slideContent

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  getDefaultProps(): CCSlideContentFrameShape['props'] {
    return {
      title: 'Slide Content',
      w: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH,
      h: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT - CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
      headerColor: 'transparent',
      isLocked: false,
      parentSlideId: '' as TLShapeId
    }
  }

  override canResize = () => false
  override isAspectRatioLocked = () => true
  override hideResizeHandles = () => true
  override hideRotateHandle = () => true
  override canEdit = () => false

  override canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    // Allow binding from any shape to the content frame
    return args.toShapeType === 'cc-slide-content' && args.bindingType === 'cc-slide-content-binding'
  }

  onBeforeCreate(shape: CCSlideContentFrameShape): CCSlideContentFrameShape {
    return shape
  }

  onChildrenChange = () => {
    // Handle children changes if needed
    return []
  }

  override renderContent = () => {
    return <div style={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: 'transparent',
      position: 'relative'
    }} />
  }
} 