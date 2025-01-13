import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, Vec } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

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
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide) return

    const currentIndex = parentSlideshow.props.slides.indexOf(slide.id)

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
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide || binding.props.placeholder || !binding.props.isMovingWithParent) {
      return
    }

    const slotWidth = parentSlideshow.props.w / parentSlideshow.props.slides.length
    const currentPosition = slide.x - parentSlideshow.x
    const nearestSlot = Math.round(currentPosition / slotWidth)
    const snapX = parentSlideshow.x + (nearestSlot * slotWidth)
    const currentIndex = parentSlideshow.props.slides.indexOf(slide.id)

    // Only update if we're moving to a new slot
    if (nearestSlot !== binding.props.lastKnownSlot && 
        nearestSlot >= 0 && 
        nearestSlot < parentSlideshow.props.slides.length) {
      
      const newSlides = [...parentSlideshow.props.slides]
      newSlides.splice(currentIndex, 1)
      newSlides.splice(nearestSlot, 0, slide.id)

      this.editor.batch(() => {
        // Update slide position
        this.editor.updateShape({
          id: slide.id,
          type: slide.type,
          x: snapX,
          y: slide.y
        })

        // Update slideshow order
        this.editor.updateShape({
          id: parentSlideshow.id,
          type: parentSlideshow.type,
          props: {
            ...parentSlideshow.props,
            slides: newSlides
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
            lastKnownSlot: nearestSlot 
          }
        })
      })

      logger.debug('system', '📏 Snapping slide during translation', {
        slideId: slide.id,
        currentPosition,
        nearestSlot,
        snapX,
        previousSlot: binding.props.lastKnownSlot,
        newOrder: newSlides
      })
    }
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

    // Ensure final position matches the last known slot
    if (binding.props.lastKnownSlot !== undefined) {
      const slotWidth = parentSlideshow.props.w / parentSlideshow.props.slides.length
      const finalX = parentSlideshow.x + (binding.props.lastKnownSlot * slotWidth)

      this.editor.updateShape({
        id: slide.id,
        type: slide.type,
        x: finalX,
        y: slide.y
      })

      logger.debug('system', '✅ Final slide position set', {
        slideId: slide.id,
        finalSlot: binding.props.lastKnownSlot,
        finalX
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