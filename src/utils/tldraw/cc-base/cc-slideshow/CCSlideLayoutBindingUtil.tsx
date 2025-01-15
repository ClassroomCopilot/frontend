import { BindingUtil, TLBaseBinding } from '@tldraw/tldraw'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  isMovingWithParent: boolean
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps(): CCSlideLayoutBinding['props'] {
    return {
      isMovingWithParent: false
    }
  }

  onBeforeCreate = () => {
    return
  }

  onBeforeDelete = () => {
    return
  }

  onTranslateStart = () => {
    return
  }

  onTranslateEnd = () => {
    return
  }
} 