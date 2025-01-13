import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'

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

  onTranslateStart = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    logger.debug('system', '🔄 Starting slide layout translation', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId
    })

    // Get the parent slideshow and slide
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide) {
      logger.warn('system', '⚠️ Missing parent slideshow or slide at translation start', {
        parentSlideshow,
        slide,
        binding
      })
      return
    }

    if (!binding.props.placeholder) {
      logger.debug('system', '🔄 Marking layout binding as moving', {
        slideshowId: parentSlideshow.id,
        slideId: slide.id
      })

      // Mark binding as in motion
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
    // Get the parent slideshow and slide
    const parentSlideshow = this.editor.getShape(binding.fromId) as CCSlideShowShape
    const slide = this.editor.getShape(binding.toId) as CCSlideShape

    if (!parentSlideshow || !slide) {
      logger.warn('system', '⚠️ Missing parent slideshow or slide during translation', {
        parentSlideshow,
        slide,
        binding
      })
      return
    }

    logger.debug('system', '🔄 Slide layout translation in progress', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      isMovingWithParent: binding.props.isMovingWithParent,
      slideshowPosition: { x: parentSlideshow.x, y: parentSlideshow.y },
      slidePosition: { x: slide.x, y: slide.y }
    })

    if (binding.props.placeholder || !binding.props.isMovingWithParent) {
      logger.debug('system', '⏭️ Skipping slide update - not moving', {
        placeholder: binding.props.placeholder,
        isMoving: binding.props.isMovingWithParent
      })
      return
    }

    // Get all slides in the slideshow
    const slides = this.editor.getSortedChildIdsForParent(parentSlideshow.id)
      .map(id => this.editor.getShape(id))
      .filter((shape): shape is CCSlideShape => {
        if (!shape) return false
        return shape.type === 'cc-slide'
      })

    // Calculate current slide position and nearest slot
    const currentPosition = slide.x - parentSlideshow.x
    const slotWidth = parentSlideshow.props.w / slides.length
    const nearestSlot = Math.round(currentPosition / slotWidth)

    // Get current slide index
    const currentIndex = slides.findIndex(s => s.id === slide.id)

    // If nearest slot is different from current index, trigger swap
    if (nearestSlot !== currentIndex && nearestSlot >= 0 && nearestSlot < slides.length) {
      logger.debug('system', '🔄 Slide position swap triggered during translation', {
        slideId: slide.id,
        from: currentIndex,
        to: nearestSlot,
        slidePattern: parentSlideshow.props.slidePattern
      })

      // Update slide positions
      const targetX = parentSlideshow.x + (nearestSlot * slotWidth)
      this.editor.updateShape({
        id: slide.id,
        type: slide.type,
        parentId: parentSlideshow.id,
        x: targetX,
        y: slide.y
      })
    }

    logger.debug('system', '📏 Updated slide position', {
      slideshowId: parentSlideshow.id,
      slideId: slide.id,
      currentPosition,
      nearestSlot
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    // Get the parent slideshow and slide
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

    logger.debug('system', '✅ Slide layout translation complete', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      finalPositions: {
        slideshow: { x: parentSlideshow.x, y: parentSlideshow.y },
        slide: { x: slide.x, y: slide.y }
      }
    })

    if (!binding.props.placeholder && binding.props.isMovingWithParent) {
      // Ensure final parent relationship is correct
      this.editor.updateShape({
        id: slide.id,
        type: slide.type,
        parentId: parentSlideshow.id
      })

      // Reset moving state
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { ...binding.props, isMovingWithParent: false }
      })

      logger.debug('system', '✅ Slide parent relationship finalized', {
        slideshowId: parentSlideshow.id,
        slideId: slide.id
      })
    }
  }
} 