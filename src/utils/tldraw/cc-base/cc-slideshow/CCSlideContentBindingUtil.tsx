import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'
import { CCSlideContentFrameShape } from './CCSlideContentFrameUtil'

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
    if (!contentFrame || contentFrame.type !== 'cc-slide-content') {
      return
    }

    // Mark binding as placeholder during translation
    this.editor.updateBinding({
      id: binding.id,
      type: binding.type,
      fromId: binding.fromId,
      toId: binding.toId,
      props: { placeholder: true }
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (!binding.props.placeholder) {
      return
    }

    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape
    if (!contentFrame || contentFrame.type !== 'cc-slide-content') {
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
  }
} 