import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, TLShape } from '@tldraw/tldraw'
import { CCSlideContentFrameShape } from './CCSlideContentFrameUtil'
import { CCSlideShape } from './CCSlideShapeUtil'
import { logger } from '../../../../debugConfig'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

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

    // Get all shapes within the content frame
    const contentShapes = this.editor.getSortedChildIdsForParent(contentFrame.id)
      .map(id => this.editor.getShape(id))
      .filter((shape): shape is TLShape => shape !== null)

    // Update content frame position to maintain fixed offset from parent slide
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      x: 0,
      y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
      props: contentFrame.props
    })

    // Update positions of all shapes within the content frame
    contentShapes.forEach(shape => {
      // Keep relative positions within the content frame
      this.editor.updateShape({
        id: shape.id,
        type: shape.type,
        parentId: contentFrame.id,
        x: shape.x,
        y: shape.y,
        props: shape.props
      })
    })

    logger.debug('binding', '🔄 Updated content frame and children positions', {
      frameId: contentFrame.id,
      slideId: parentSlide.id,
      childCount: contentShapes.length
    })
  }

  onTranslateEnd = ({ binding }: { binding: CCSlideContentBinding }) => {
    if (binding.props.placeholder) {
      return
    }

    const contentFrame = this.editor.getShape(binding.toId) as CCSlideContentFrameShape
    const parentSlide = this.editor.getShape(binding.fromId) as CCSlideShape

    if (!contentFrame || contentFrame.type !== 'cc-slide-content' || !parentSlide || parentSlide.type !== 'cc-slide') {
      return
    }

    // Ensure final positions are correct
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      x: 0,
      y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
      props: contentFrame.props
    })

    logger.debug('binding', '✅ Completed content frame translation', {
      frameId: contentFrame.id,
      slideId: parentSlide.id
    })
  }
} 