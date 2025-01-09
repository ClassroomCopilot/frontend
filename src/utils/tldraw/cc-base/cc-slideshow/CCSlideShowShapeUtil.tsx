import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, TLShapeId } from '@tldraw/tldraw'
import { getDefaultCCSlideShowProps } from '../cc-props'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'

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

  override renderContent = (shape: CCSlideShowShape) => {
    return <div />
  }
} 