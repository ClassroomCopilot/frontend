import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { CCSlideContentFrameShape } from './CCSlideContentFrameUtil'
import { CCSlideShape } from './CCSlideShapeUtil'
import { logger } from '../../../../debugConfig'

export interface CCSlideContentBinding extends TLBaseBinding<'cc-slide-content-binding', {
  placeholder: boolean
}> {}

export class CCSlideContentBindingUtil extends BindingUtil<CCSlideContentBinding> {
  static type = 'cc-slide-content-binding' as const

  getDefaultProps() {
    return {
      placeholder: false
    }
  }

  onBeforeCreate = ({ binding }: BindingOnCreateOptions<CCSlideContentBinding>) => {
    logger.debug('binding', '🔗 Creating slide content binding', { binding })
    return binding
  }

  onBeforeDelete = () => {
    return
  }

  onTranslateStart = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (binding.props.placeholder) {
      return
    }

    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape

    if (!contentFrame || contentFrame.type !== 'cc-slide-content' || !parentSlide || parentSlide.type !== 'cc-slide') {
      return
    }

    logger.debug('binding', '🔄 Starting content frame translation', {
      frameId: contentFrame.id,
      slideId: parentSlide.id
    })
  }

  onTranslate = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (binding.props.placeholder) {
      return
    }

    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape

    if (!contentFrame || contentFrame.type !== 'cc-slide-content' || !parentSlide || parentSlide.type !== 'cc-slide') {
      return
    }

    // Update content frame position relative to parent slide
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      x: 0, // Keep position relative to parent slide
      y: contentFrame.y,
      props: contentFrame.props
    })

    logger.debug('binding', '🔄 Updating content frame position', {
      frameId: contentFrame.id,
      slideId: parentSlide.id
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (!binding.props.placeholder) {
      return
    }

    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape

    if (!contentFrame || contentFrame.type !== 'cc-slide-content' || !parentSlide || parentSlide.type !== 'cc-slide') {
      return
    }

    // Reset placeholder status
    this.editor.updateBinding({
      id: binding.id,
      type: binding.type,
      fromId: binding.fromId,
      toId: binding.toId,
      props: { placeholder: false }
    })

    logger.debug('binding', '✅ Completed content frame translation', {
      frameId: contentFrame.id,
      slideId: parentSlide.id
    })
  }
} 