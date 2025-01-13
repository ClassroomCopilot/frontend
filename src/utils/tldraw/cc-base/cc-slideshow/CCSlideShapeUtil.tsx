import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from '../cc-props'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'
import { CCSlideContentFrameShape } from './CCSlideContentFrameUtil'

type CCSlideShowShapeProps = CCSlideShowShape['props']

export interface CCSlideShape extends CCBaseShape {
  type: 'cc-slide'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
  }
}

export class CCSlideShapeUtil extends CCBaseShapeUtil<CCSlideShape> {
  static override type = 'cc-slide' as const
  static override props = ccShapeProps.slide
  static override migrations = ccShapeMigrations.slide

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  override getDefaultProps(): CCSlideShape['props'] {
    return getDefaultCCSlideProps() as CCSlideShape['props']
  }

  override canResize = () => false
  override isAspectRatioLocked = () => true
  override hideResizeHandles = () => true
  override hideRotateHandle = () => true
  override canEdit = () => false

  override canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    return args.fromShapeType === 'cc-slideshow' && args.toShapeType === 'cc-slide' && args.bindingType === 'cc-slide-layout'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderContent = (shape: CCSlideShape) => {
    return <div />
  }

  onBeforeCreate(shape: CCSlideShape): CCSlideShape {
    return shape
  }

  onTranslate = (initial: CCSlideShape, current: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(current.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      return current
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      return current
    }

    // Get constants
    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING;
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT;
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING;
    const verticalOffset = headerHeight + contentPadding;

    // Get all slides in their current order
    const slides = slideshow.props.slides
      .map(id => this.editor.getShape(id))
      .filter((s): s is CCSlideShape => s?.type === 'cc-slide')
      .map((slide, index) => ({ slide, index }));

    const currentIndex = slides.findIndex(s => s.slide.id === current.id);
    if (currentIndex === -1) return current;

    // Get the content frame for the current slide
    const contentFrame = this.editor.getSortedChildIdsForParent(current.id)
      .map(id => this.editor.getShape(id))
      .find((s): s is CCSlideContentFrameShape => s?.type === 'cc-slide-content')

    if (contentFrame) {
      // Trigger content frame binding translation
      const contentBindings = this.editor.getBindingsToShape(contentFrame.id, 'cc-slide-content-binding')
      contentBindings.forEach(binding => {
        if (binding.type === 'cc-slide-content-binding') {
          this.editor.updateBinding({
            id: binding.id,
            type: binding.type,
            fromId: binding.fromId,
            toId: binding.toId,
            props: { placeholder: true }
          })
        }
      })
    }

    let constrainedX = current.x
    let constrainedY = current.y

    // Apply pattern-specific logic
    if (slideshow.props.slidePattern === 'vertical') {
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      constrainedX = (slideshowProps.w - current.props.w) / 2;
      constrainedY = Math.max(
        verticalOffset + spacing,
        Math.min(slideshowProps.h - current.props.h - spacing, current.y)
      );
    } else if (slideshow.props.slidePattern === 'horizontal') {
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      constrainedX = Math.max(
        spacing,
        Math.min(slideshowProps.w - current.props.w - spacing, current.x)
      );
      constrainedY = initial.y;
    } else {
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      constrainedX = Math.max(
        spacing,
        Math.min(slideshowProps.w - current.props.w - spacing, current.x)
      );
      constrainedY = Math.max(
        verticalOffset + spacing,
        Math.min(slideshowProps.h - current.props.h - spacing, current.y)
      );
    }

    // After updating slide position, ensure content frame is updated
    if (contentFrame) {
      this.editor.updateShape<CCSlideContentFrameShape>({
        id: contentFrame.id,
        type: 'cc-slide-content',
        x: 0,
        y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
        props: contentFrame.props
      })
    }

    return {
      ...current,
      x: constrainedX,
      y: constrainedY
    }
  }

  onTranslateEnd = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      return
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      return
    }

    // Get all slides in their current order
    const slides = slideshow.props.slides
      .map(id => this.editor.getShape(id))
      .filter((s): s is CCSlideShape => s?.type === 'cc-slide')
      .map((slide, index) => ({ slide, index }));

    // After updating slide positions, ensure content frames are updated
    slides.forEach((slideInfo) => {
      const slide = slideInfo.slide
      if (slide?.type === 'cc-slide') {
        const contentFrame = this.editor.getSortedChildIdsForParent(slide.id)
          .map(id => this.editor.getShape(id))
          .find((s): s is CCSlideContentFrameShape => s?.type === 'cc-slide-content')

        if (contentFrame) {
          // Reset content frame position relative to slide
          this.editor.updateShape<CCSlideContentFrameShape>({
            id: contentFrame.id,
            type: 'cc-slide-content',
            x: 0,
            y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
            props: contentFrame.props
          })

          // Reset content frame binding placeholder status
          const contentBindings = this.editor.getBindingsToShape(contentFrame.id, 'cc-slide-content-binding')
          contentBindings.forEach(binding => {
            if (binding.type === 'cc-slide-content-binding') {
              this.editor.updateBinding({
                id: binding.id,
                type: binding.type,
                fromId: binding.fromId,
                toId: binding.toId,
                props: { placeholder: false }
              })
            }
          })
        }
      }
    })
  }

  getParentId = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout');
    return bindings[0]?.fromId;
  }
} 