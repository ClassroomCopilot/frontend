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
    return binding
  }

  onBeforeDelete = () => {
    return
  }

  onTranslateStart = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (binding.props.placeholder) {
      return
    }

    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape

    if (!parentSlide || parentSlide.type !== 'cc-slide' || !contentFrame || contentFrame.type !== 'cc-slide-content') {
      return
    }

    logger.debug('binding', '🔄 Starting content frame translation', {
      slideId: parentSlide.id,
      frameId: contentFrame.id
    })

    // Mark binding as placeholder during translation
    this.editor.updateBinding({
      id: binding.id,
      type: binding.type,
      fromId: binding.fromId,
      toId: binding.toId,
      props: { placeholder: true }
    })
  }

  onTranslate = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (!binding.props.placeholder) {
      return
    }

    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape

    if (!parentSlide || parentSlide.type !== 'cc-slide' || !contentFrame || contentFrame.type !== 'cc-slide-content') {
      return
    }

    // Get all shapes within the content frame
    const shapesInFrame = this.editor.getSortedChildIdsForParent(contentFrame.id)
    if (shapesInFrame.length > 0) {
      logger.debug('binding', '📦 Moving shapes with content frame', {
        count: shapesInFrame.length,
        slideId: parentSlide.id,
        frameId: contentFrame.id
      })

      // Update each shape's position relative to the content frame
      this.editor.batch(() => {
        shapesInFrame.forEach(shapeId => {
          const shape = this.editor.getShape(shapeId)
          if (shape) {
            const pageBounds = this.editor.getShapePageBounds(shape.id)
            const frameBounds = this.editor.getShapePageBounds(contentFrame.id)
            
            if (pageBounds && frameBounds) {
              const relativeX = pageBounds.minX - frameBounds.minX
              const relativeY = pageBounds.minY - frameBounds.minY

              this.editor.updateShape({
                id: shape.id,
                type: shape.type,
                x: relativeX,
                y: relativeY
              })
            }
          }
        })
      })
    }
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (!binding.props.placeholder) {
      return
    }

    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape
    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape

    if (!parentSlide || parentSlide.type !== 'cc-slide' || !contentFrame || contentFrame.type !== 'cc-slide-content') {
      return
    }

    logger.debug('binding', '✅ Completed content frame translation', {
      slideId: parentSlide.id,
      frameId: contentFrame.id
    })

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