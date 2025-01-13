import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, Vec } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  placeholder: boolean
  isMovingWithParent?: boolean
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps() {
    return {
      placeholder: false,
      isMovingWithParent: false
    }
  }

  onBeforeCreate = ({ binding }: BindingOnCreateOptions<CCSlideLayoutBinding>) => {
    logger.debug('system', '🔗 Creating slide layout binding', { binding })
    return binding
  }

  onBeforeDelete = () => {
    return
  }

  getSnapPoints(binding: CCSlideLayoutBinding) {
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    if (!parentSlideshow) return []

    const slotWidth = parentSlideshow.props.w / parentSlideshow.props.slides.length
    const snapPoints: Vec[] = []

    // Create snap points for each slot position
    for (let i = 0; i < parentSlideshow.props.slides.length; i++) {
      snapPoints.push(new Vec(
        parentSlideshow.x + (i * slotWidth),
        parentSlideshow.y + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
      ))
    }

    return snapPoints
  }

  onTranslateStart = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    logger.debug('system', '🔄 Starting slide layout translation', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId
    })

    if (!binding.props.placeholder) {
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { ...binding.props, isMovingWithParent: true }
      })
    }
  }

  onTranslate = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide || binding.props.placeholder || !binding.props.isMovingWithParent) {
      return
    }

    const slotWidth = parentSlideshow.props.w / parentSlideshow.props.slides.length
    const currentPosition = slide.x - parentSlideshow.x
    const nearestSlot = Math.round(currentPosition / slotWidth)
    const snapX = parentSlideshow.x + (nearestSlot * slotWidth)

    // Update slide position to snap to nearest slot
    this.editor.updateShape({
      id: slide.id,
      type: slide.type,
      x: snapX,
      y: slide.y
    })

    logger.debug('system', '📏 Snapping slide during translation', {
      slideId: slide.id,
      currentPosition,
      nearestSlot,
      snapX
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide) {
      logger.warn('system', '⚠️ Missing parent slideshow or slide at translation end', {
        parentSlideshow,
        slide,
        binding
      })
      return
    }

    const slotWidth = parentSlideshow.props.w / parentSlideshow.props.slides.length
    const currentPosition = slide.x - parentSlideshow.x
    const nearestSlot = Math.round(currentPosition / slotWidth)
    const currentIndex = parentSlideshow.props.slides.indexOf(slide.id)

    // Only update the slide order if the position has changed
    if (nearestSlot !== currentIndex && nearestSlot >= 0 && nearestSlot < parentSlideshow.props.slides.length) {
      const newSlides = [...parentSlideshow.props.slides]
      newSlides.splice(currentIndex, 1)
      newSlides.splice(nearestSlot, 0, slide.id)

      this.editor.updateShape({
        id: parentSlideshow.id,
        type: parentSlideshow.type,
        props: {
          ...parentSlideshow.props,
          slides: newSlides
        }
      })

      logger.debug('system', '✅ Updated slide order', {
        slideId: slide.id,
        from: currentIndex,
        to: nearestSlot,
        newOrder: newSlides
      })
    }

    if (!binding.props.placeholder && binding.props.isMovingWithParent) {
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { ...binding.props, isMovingWithParent: false }
      })
    }
  }
} 