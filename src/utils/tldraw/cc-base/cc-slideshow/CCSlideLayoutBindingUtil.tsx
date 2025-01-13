import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'

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

  onTranslate = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    logger.debug('system', '🔄 Slide layout translation in progress', {
      binding,
      fromId: binding.fromId,
      toId: binding.toId,
      isMovingWithParent: binding.props.isMovingWithParent
    })

    if (binding.props.placeholder || !binding.props.isMovingWithParent) {
      return
    }
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    logger.debug('system', '✅ Slide layout translation complete', {
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