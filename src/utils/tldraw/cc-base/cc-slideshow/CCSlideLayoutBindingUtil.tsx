import { BindingUtil, TLBaseBinding, BindingOnCreateOptions } from '@tldraw/tldraw'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  placeholder: boolean
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps() {
    return {
      placeholder: false
    }
  }

  onBeforeCreate = ({ binding }: BindingOnCreateOptions<CCSlideLayoutBinding>) => {
    return binding
  }

  onBeforeDelete = () => {
    return
  }

  onTranslateStart = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    if (binding.props.placeholder) {
      return
    }

    const maybeSlideshow = this.editor.getShape(binding.fromId)
    if (!maybeSlideshow || maybeSlideshow.type !== 'cc-slideshow') {
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

  onTranslateEnd = ({ binding }: { binding: CCSlideLayoutBinding }) => {
    if (!binding.props.placeholder) {
      return
    }

    const maybeSlideshow = this.editor.getShape(binding.fromId)
    if (!maybeSlideshow || maybeSlideshow.type !== 'cc-slideshow') {
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