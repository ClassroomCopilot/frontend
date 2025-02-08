import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle } from '@tldraw/tldraw'
import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { ccShapeProps, getDefaultCCSlideShowProps, CCBaseProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape } from '../cc-types'

type CCSlideshowProps = CCBaseProps & {
  currentSlideIndex: number
  slidePattern: string
  numSlides: number
  slides: string[]
}

export interface CCSlideShowShape extends CCBaseShape {
  type: 'cc-slideshow'
  props: CCSlideshowProps
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
    return getDefaultCCSlideShowProps() as CCSlideShowShape['props']
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

  override renderContent = () => {
    return <div />
  }
}