import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, Vec } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { SlideValidationUtil } from './utils/SlideValidationUtil'
import { CCSlideShape } from './CCSlideShapeUtil'

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
    const currentSlot = slideshow.props.slots.find(slot => slot.occupiedBy === slide.id)
    const currentIndex = currentSlot?.index ?? slideshow.props.slides.indexOf(slide.id)

    logger.debug('system', '🔄 Starting slide layout translation', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      currentIndex,
      currentSlot
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
    const slots = slideshow.props.slots
    
    // Find nearest slot based on current position
    const nearestSlot = slots.reduce((nearest, slot) => {
      const distance = Math.abs(slide.x - slot.x)
      if (distance < Math.abs(slide.x - nearest.x)) {
        return slot
      }
      return nearest
    }, slots[0])

    // Log translation metrics and slot state
    logger.debug('system', '📏 Translation state', {
      slideId: slide.id,
      currentPosition: { x: slide.x, y: slide.y },
      nearestSlot,
      lastKnownSlot: binding.props.lastKnownSlot,
      allSlots: slots
    })

    // Check if we've moved to a new slot
    if (nearestSlot.index !== binding.props.lastKnownSlot) {
      logger.info('system', '🔄 Slot change detected during translation', {
        slideId: slide.id,
        from: binding.props.lastKnownSlot,
        to: nearestSlot.index,
        slot: nearestSlot
      })

      // Move displaced slide to current position
      const currentSlot = slots.find(s => s.index === binding.props.lastKnownSlot)
      if (currentSlot && nearestSlot.occupiedBy) {
        const displacedSlide = this.editor.getShape(nearestSlot.occupiedBy) as CCSlideShape
        if (displacedSlide) {
          this.editor.updateShape({
            id: displacedSlide.id,
            type: 'cc-slide',
            x: currentSlot.x,
            y: currentSlot.y
          })
        }
      }

      // Update slide position
      this.editor.updateShape({
        id: slide.id,
        type: 'cc-slide',
        x: nearestSlot.x,
        y: nearestSlot.y
      })

      // Update slideshow slots and order
      const newSlides = [...slideshow.props.slides]
      const fromIndex = binding.props.lastKnownSlot ?? 0
      const [movedSlide] = newSlides.splice(fromIndex, 1)
      newSlides.splice(nearestSlot.index, 0, movedSlide)

      this.editor.updateShape({
        id: slideshow.id,
        type: slideshow.type,
        props: {
          ...slideshow.props,
          slides: newSlides,
          slots: slots.map(slot => ({
            ...slot,
            occupiedBy: slot.index === nearestSlot.index ? slide.id :
                       slot.index === binding.props.lastKnownSlot ? nearestSlot.occupiedBy :
                       slot.occupiedBy
          }))
        }
      })

      // Update binding to track the new slot
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { 
          ...binding.props, 
          lastKnownSlot: nearestSlot.index 
        }
      })
    }
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    const validated = SlideValidationUtil.validateBinding(this.editor, binding)
    if (!validated) return

    const { slide, slideshow } = validated
    const slots = slideshow.props.slots

    logger.debug('system', '🎯 Slide translation ended', {
      slideId: slide.id,
      finalPosition: { x: slide.x, y: slide.y },
      slots
    })

    // Ensure final position matches nearest slot
    const nearestSlot = slots.reduce((nearest, slot) => {
      const distance = Math.abs(slide.x - slot.x)
      if (distance < Math.abs(slide.x - nearest.x)) {
        return slot
      }
      return nearest
    }, slots[0])

    this.editor.updateShape({
      id: slide.id,
      type: slide.type,
      x: nearestSlot.x,
      y: nearestSlot.y
    })

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