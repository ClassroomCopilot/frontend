import { Editor } from '@tldraw/tldraw'
import { CCSlideLayoutBinding } from '../CCSlideLayoutBindingUtil'
import { CCSlideShowShape } from '../CCSlideShowShapeUtil'
import { CCSlideShape } from '../CCSlideShapeUtil'
import { logger } from '../../../../../debugConfig'

export interface ValidatedSlideContext {
  slide: CCSlideShape
  slideshow: CCSlideShowShape
  binding: CCSlideLayoutBinding
}

export class SlideValidationUtil {
  static validateBinding(
    editor: Editor,
    binding: CCSlideLayoutBinding
  ): ValidatedSlideContext | null {
    const slide = editor.getShape(binding.toId) as CCSlideShape
    const slideshow = editor.getShape(binding.fromId) as CCSlideShowShape

    if (!slide || !slideshow) {
      logger.warn('system', '⚠️ Invalid binding context', {
        binding,
        hasSlide: !!slide,
        hasSlideshow: !!slideshow
      })
      return null
    }

    if (binding.props.placeholder || !binding.props.isMovingWithParent) {
      logger.debug('system', '🚫 Binding not active for movement', {
        slideId: slide.id,
        isPlaceholder: binding.props.placeholder,
        isMoving: binding.props.isMovingWithParent
      })
      return null
    }

    return { slide, slideshow, binding }
  }

  static validateSlideMovement(
    editor: Editor,
    slide: CCSlideShape
  ): { binding: CCSlideLayoutBinding, slideshow: CCSlideShowShape } | null {
    const bindings = editor.getBindingsToShape(slide.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      logger.warn('system', '⚠️ No slide layout binding found', { slideId: slide.id })
      return null
    }

    const slideshow = editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      logger.warn('system', '⚠️ No slideshow found', { slideId: slide.id })
      return null
    }

    return { binding: slideBinding, slideshow }
  }
} 