import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'

export interface CCSlideContentBinding extends TLBaseBinding<'cc-slide-content-binding', {
  placeholder: boolean
  isMovingWithParent?: boolean
}> {}

export class CCSlideContentBindingUtil extends BindingUtil<CCSlideContentBinding> {
  static type = 'cc-slide-content-binding' as const

  getDefaultProps() {
    return {
      placeholder: false,
      isMovingWithParent: false
    }
  }

  onBeforeCreate = ({ binding }: BindingOnCreateOptions<CCSlideContentBinding>) => {
    logger.debug('system', '🔗 Creating slide content binding', { binding })
    return binding
  }

  onBeforeDelete = () => {
    return
  }

  onTranslateStart = ({ binding }: { binding: CCSlideContentBinding }) => {
    logger.debug('system', '🔄 Starting slide content translation', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId
    })

    // Get the parent slide and content frame
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId)

    if (!parentSlide || !contentFrame) {
      logger.warn('system', '⚠️ Missing parent slide or content frame at translation start', {
        parentSlide,
        contentFrame,
        binding
      })
      return
    }

    // Mark binding as in motion and ensure it's not a placeholder
    if (!binding.props.placeholder) {
      logger.debug('system', '🔄 Marking content binding as moving', {
        slideId: parentSlide.id,
        frameId: contentFrame.id,
        initialPositions: {
          slide: { x: parentSlide.x, y: parentSlide.y },
          frame: { x: contentFrame.x, y: contentFrame.y }
        }
      })

      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { ...binding.props, isMovingWithParent: true }
      })
    }
  }

  onTranslate = ({ binding }: { binding: CCSlideContentBinding }) => {
    // Get the parent slide and content frame
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId)

    if (!parentSlide || !contentFrame) {
      logger.warn('system', '⚠️ Missing parent slide or content frame during translation', {
        parentSlide,
        contentFrame,
        binding
      })
      return
    }

    logger.debug('system', '🔄 Slide content translation in progress', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      isMovingWithParent: binding.props.isMovingWithParent,
      slidePosition: { x: parentSlide.x, y: parentSlide.y },
      framePosition: { x: contentFrame.x, y: contentFrame.y }
    })

    if (binding.props.placeholder || !binding.props.isMovingWithParent) {
      logger.debug('system', '⏭️ Skipping content frame update - not moving', {
        placeholder: binding.props.placeholder,
        isMoving: binding.props.isMovingWithParent
      })
      return
    }

    // Only update the parent relationship during translation
    // Let the TLDraw engine handle the relative positioning
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      parentId: parentSlide.id
    })

    logger.debug('system', '📏 Updated content frame parent relationship', {
      slideId: parentSlide.id,
      frameId: contentFrame.id
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    // Get the parent slide and content frame
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId)

    if (!parentSlide || !contentFrame) {
      logger.warn('system', '⚠️ Missing parent slide or content frame at translation end', {
        parentSlide,
        contentFrame,
        binding
      })
      return
    }

    logger.debug('system', '✅ Slide content translation complete', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      finalPositions: {
        slide: { x: parentSlide.x, y: parentSlide.y },
        frame: { x: contentFrame.x, y: contentFrame.y }
      }
    })

    if (!binding.props.placeholder && binding.props.isMovingWithParent) {
      // Reset moving state
      this.editor.updateBinding({
        id: binding.id,
        type: binding.type,
        fromId: binding.fromId,
        toId: binding.toId,
        props: { ...binding.props, isMovingWithParent: false }
      })

      logger.debug('system', '✅ Content frame binding state reset', {
        slideId: parentSlide.id,
        frameId: contentFrame.id
      })
    }
  }
} 