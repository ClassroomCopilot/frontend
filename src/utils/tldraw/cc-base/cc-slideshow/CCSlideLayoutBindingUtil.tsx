import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, Vec } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { SlideValidationUtil } from './utils/SlideValidationUtil'
import { SlidePositionUtil } from './utils/SlidePositionUtil'
import { SlideReorderUtil } from './utils/SlideReorderUtil'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  placeholder: boolean
  isMovingWithParent?: boolean
  lastKnownSlot?: number
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps() {
    return {
      placeholder: false,
      isMovingWithParent: false,
      lastKnownSlot: undefined
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
    const validated = SlideValidationUtil.validateBinding(this.editor, binding)
    if (!validated) return

    const { slide, slideshow } = validated
    const currentIndex = slideshow.props.slides.indexOf(slide.id)

    logger.debug('system', '🔄 Starting slide layout translation', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      currentIndex
    })

    if (!binding.props.placeholder) {
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { 
          ...binding.props, 
          isMovingWithParent: true,
          lastKnownSlot: currentIndex
        }
      })
    }
  }

  onTranslate = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    const validated = SlideValidationUtil.validateBinding(this.editor, binding)
    if (!validated) return

    const { slide, slideshow } = validated
    const { slotWidth } = SlidePositionUtil.getSlotDimensions(slideshow)
    const currentPosition = slide.x - slideshow.x
    const nearestSlot = SlidePositionUtil.getNearestSlot(
      slide.x,
      slideshow.x,
      slotWidth,
      slideshow.props.slides.length
    )
    const currentIndex = slideshow.props.slides.indexOf(slide.id)

    // Log translation metrics and slot state
    logger.debug('system', '📏 Translation state', {
      slideId: slide.id,
      currentPosition,
      nearestSlot,
      lastKnownSlot: binding.props.lastKnownSlot,
      currentIndex,
      slotWidth
    })

    // Check if we've moved to a new slot
    if (nearestSlot !== binding.props.lastKnownSlot && 
        nearestSlot >= 0 && 
        nearestSlot < slideshow.props.slides.length) {
      
      logger.info('system', '🔄 Slot change detected during translation', {
        slideId: slide.id,
        from: binding.props.lastKnownSlot,
        to: nearestSlot,
        currentPosition,
        slotWidth
      })

      // Apply the reorder
      SlideReorderUtil.applyReorder(
        this.editor,
        slideshow,
        currentIndex,
        nearestSlot,
        slide
      )

      // Update binding to track the new slot
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { 
          ...binding.props, 
          lastKnownSlot: nearestSlot 
        }
      })
    }
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    const validated = SlideValidationUtil.validateBinding(this.editor, binding)
    if (!validated) return

    const { slide, slideshow } = validated

    logger.debug('system', '🎯 Slide translation ended', {
      slideId: slide.id
    })

    // Ensure final position matches the last known slot
    if (binding.props.lastKnownSlot !== undefined) {
      const finalPosition = SlidePositionUtil.getSlotPosition(
        slideshow.props.slidePattern,
        binding.props.lastKnownSlot,
        slideshow,
        slide
      )

      this.editor.updateShape({
        id: slide.id,
        type: slide.type,
        x: finalPosition.x,
        y: finalPosition.y
      })

      logger.debug('system', '✅ Slide reorder complete', {
        slideId: slide.id,
        newOrder: slideshow.props.slides
      })
    }

    if (!binding.props.placeholder && binding.props.isMovingWithParent) {
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { 
          ...binding.props, 
          isMovingWithParent: false,
          lastKnownSlot: undefined
        }
      })
    }
  }
} 