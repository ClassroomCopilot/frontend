import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

export interface CCSlideContentBinding extends TLBaseBinding<'cc-slide-content', {
  placeholder: boolean
  isMovingWithParent?: boolean
}> {}

export class CCSlideContentBindingUtil extends BindingUtil<CCSlideContentBinding> {
  static type = 'cc-slide-content' as const

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

    if (binding.props.placeholder) {
      return
    }

    // Mark binding as in motion
    this.editor.updateBinding({
      id: binding.id,
      type: binding.type,
      fromId: binding.fromId,
      toId: binding.toId,
      props: { ...binding.props, isMovingWithParent: true }
    })
  }

  onTranslate = ({ binding }: { binding: CCSlideContentBinding }) => {
    logger.debug('system', '🔄 Slide content translation in progress', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      isMovingWithParent: binding.props.isMovingWithParent
    })

    if (binding.props.placeholder || !binding.props.isMovingWithParent) {
      return
    }

    // Get the parent slide and content frame
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId)

    if (!parentSlide || !contentFrame) {
      logger.warn('system', '⚠️ Missing parent slide or content frame during translation', {
        parentSlide,
        contentFrame
      })
      return
    }

    // Update content frame position relative to parent slide
    // Content frame should maintain a fixed offset from the parent slide's top
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      x: 0, // Always at x=0 relative to parent
      y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT // Fixed offset from parent's top
    })

    logger.debug('system', '📏 Updated content frame position', {
      slideId: parentSlide.id,
      frameId: contentFrame.id,
      position: { x: 0, y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT }
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    logger.debug('system', '✅ Slide content translation complete', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId
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
    }
  }
} 