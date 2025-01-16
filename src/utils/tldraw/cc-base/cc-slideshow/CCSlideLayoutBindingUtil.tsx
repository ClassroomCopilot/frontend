import { BindingUtil, TLBaseBinding, IndexKey, Vec, TLShapeId } from '@tldraw/tldraw'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { logger } from '../../../../debugConfig'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  index: IndexKey
  isMovingWithParent: boolean
  placeholder: boolean
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps(): CCSlideLayoutBinding['props'] {
    return {
      index: 'a1' as IndexKey,
      isMovingWithParent: false,
      placeholder: false
    }
  }

  private updateSlidePosition(binding: CCSlideLayoutBinding) {
    const { fromId: slideshowId, toId: slideId } = binding
    const slideshow = this.editor.getShape<CCSlideShowShape>(slideshowId)
    const slide = this.editor.getShape<CCSlideShape>(slideId)
    
    if (!slideshow || !slide) return

    // Get all bindings from the slideshow, sorted by index
    const bindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    // Find position in sorted bindings array
    const index = bindings.findIndex(b => b.id === binding.id)
    if (index === -1) return

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Calculate new position based on pattern
    let offset: Vec = new Vec(0, 0)
    if (slideshow.props.slidePattern === 'horizontal') {
      offset = new Vec(
        spacing + index * (slide.props.w + spacing),
        headerHeight + contentPadding + spacing
      )
    } else if (slideshow.props.slidePattern === 'vertical') {
      offset = new Vec(
        spacing,
        headerHeight + contentPadding + spacing + index * (slide.props.h + spacing)
      )
    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(bindings.length))
      const row = Math.floor(index / cols)
      const col = index % cols
      offset = new Vec(
        spacing + col * (slide.props.w + spacing),
        headerHeight + contentPadding + spacing + row * (slide.props.h + spacing)
      )
    }

    const point = this.editor.getPointInParentSpace(
      slide,
      this.editor.getShapePageTransform(slideshow)!.applyToPoint(offset)
    )

    if (slide.x !== point.x || slide.y !== point.y) {
      this.editor.updateShape<CCSlideShape>({
        id: slideId,
        type: 'cc-slide',
        x: point.x,
        y: point.y,
      })
    }
  }

  private updateSlideshowSize(slideshowId: TLShapeId) {
    const slideshow = this.editor.getShape<CCSlideShowShape>(slideshowId)
    if (!slideshow) return

    // Get all bindings, including placeholders
    const bindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Default dimensions for empty slideshow
    const defaultWidth = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH + (spacing * 2)
    const defaultHeight = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + 
                         headerHeight + (contentPadding * 2) + (spacing * 2)

    // If no bindings, set to default size
    if (bindings.length === 0) {
      if (slideshow.props.w !== defaultWidth || slideshow.props.h !== defaultHeight) {
        this.editor.updateShape<CCSlideShowShape>({
          id: slideshow.id,
          type: 'cc-slideshow',
          props: { 
            ...slideshow.props,
            w: defaultWidth,
            h: defaultHeight
          }
        })
      }
      return
    }

    // Get first slide to calculate dimensions
    const firstSlide = this.editor.getShape<CCSlideShape>(bindings[0].toId)
    if (!firstSlide) return

    const slideWidth = firstSlide.props.w
    const slideHeight = firstSlide.props.h

    let width = defaultWidth
    let height = defaultHeight

    if (slideshow.props.slidePattern === 'horizontal') {
      width = Math.max(
        spacing + (bindings.length * slideWidth + (bindings.length - 1) * spacing) + spacing,
        slideWidth + (spacing * 2)
      )
      height = headerHeight + contentPadding * 2 + spacing * 2 + slideHeight
    } else if (slideshow.props.slidePattern === 'vertical') {
      width = slideWidth + (spacing * 2)
      height = Math.max(
        headerHeight + contentPadding * 2 + spacing + 
        (bindings.length * slideHeight + (bindings.length - 1) * spacing) + spacing,
        headerHeight + contentPadding * 2 + spacing * 2 + slideHeight
      )
    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(bindings.length))
      const rows = Math.ceil(bindings.length / cols)
      width = Math.max(
        spacing + (cols * slideWidth + (cols - 1) * spacing) + spacing,
        slideWidth + (spacing * 2)
      )
      height = Math.max(
        headerHeight + contentPadding * 2 + spacing +
        (rows * slideHeight + (rows - 1) * spacing) + spacing,
        headerHeight + contentPadding * 2 + spacing * 2 + slideHeight
      )
    }

    if (width !== slideshow.props.w || height !== slideshow.props.h) {
      this.editor.updateShape<CCSlideShowShape>({
        id: slideshow.id,
        type: 'cc-slideshow',
        props: { 
          ...slideshow.props,
          w: width,
          h: height
        }
      })
    }

    // Update positions for all bindings
    bindings.forEach(binding => this.updateSlidePosition(binding))
  }

  override onAfterCreate({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterCreate', { binding })
    this.updateSlidePosition(binding)
    this.updateSlideshowSize(binding.fromId)
  }

  override onAfterChange({ bindingAfter }: { bindingAfter: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterChange', { bindingAfter })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(bindingAfter.fromId)
    if (!slideshow) return

    this.updateSlidePosition(bindingAfter)
    this.updateSlideshowSize(bindingAfter.fromId)
  }

  override onAfterChangeFromShape({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterChangeFromShape', { binding })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(binding.fromId)
    if (!slideshow) return

    this.updateSlidePosition(binding)
    this.updateSlideshowSize(binding.fromId)
  }

  override onAfterDelete({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterDelete', { binding })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(binding.fromId)
    if (!slideshow) return

    this.updateSlideshowSize(binding.fromId)
  }
} 