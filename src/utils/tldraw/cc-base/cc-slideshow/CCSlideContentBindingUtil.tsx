import { BindingUtil, TLBaseBinding, BindingOnCreateOptions, TLParentId, TLShape } from '@tldraw/tldraw'
import { logger } from '../../../../debugConfig'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'

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

    // Update the content frame's parent relationship and position
    this.editor.updateShape({
      id: contentFrame.id,
      type: contentFrame.type,
      parentId: parentSlide.id as TLParentId,
      x: 0,
      y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    })

    // Get all shapes bound to the content frame
    const boundShapes = this.editor.getSortedChildIdsForParent(contentFrame.id)
      .map(id => this.editor.getShape(id))
      .filter((shape): shape is TLShape => shape !== null)

    // Update each bound shape's parent relationship
    boundShapes.forEach(shape => {
      const shapeBounds = this.editor.getShapePageBounds(shape.id)
      const frameBounds = this.editor.getShapePageBounds(contentFrame.id)

      if (shapeBounds && frameBounds) {
        // Calculate relative position within the content frame
        const relativeX = shapeBounds.minX - frameBounds.minX
        const relativeY = shapeBounds.minY - frameBounds.minY

        this.editor.updateShape({
          id: shape.id,
          type: shape.type,
          parentId: contentFrame.id as TLParentId,
          x: relativeX,
          y: relativeY
        })

        logger.debug('system', '📏 Updated bound shape position', {
          shapeId: shape.id,
          position: { x: relativeX, y: relativeY }
        })
      }
    })

    logger.debug('system', '📏 Updated content frame and bound shapes', {
      slideId: parentSlide.id,
      frameId: contentFrame.id,
      boundShapesCount: boundShapes.length
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