import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, Vec, getIndexBetween, clamp } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from '../cc-props'
import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'
import { logger } from '../../../../debugConfig'

export interface CCSlideShape extends CCBaseShape {
  type: 'cc-slide'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    imageData?: string // Optional image data in base64 format
  }
}

export class CCSlideShapeUtil extends CCBaseShapeUtil<CCSlideShape> {
  static override type = 'cc-slide' as const
  static override props = ccShapeProps.slide
  static override migrations = ccShapeMigrations.slide

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  override getDefaultProps(): CCSlideShape['props'] {
    return getDefaultCCSlideProps() as CCSlideShape['props']
  }

  override canResize = () => false
  override isAspectRatioLocked = () => true
  override hideResizeHandles = () => true
  override hideRotateHandle = () => true
  override canEdit = () => false

  override canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    return args.fromShapeType === 'cc-slideshow' && args.toShapeType === 'cc-slide' && args.bindingType === 'cc-slide-layout'
  }

  private getTargetSlideshow(shape: CCSlideShape, pageAnchor: Vec) {
    return this.editor.getShapeAtPoint(pageAnchor, {
      hitInside: true,
      filter: (otherShape) =>
        this.editor.canBindShapes({ fromShape: otherShape, toShape: shape, binding: 'cc-slide-layout' }),
    }) as CCSlideShowShape | undefined
  }

  getBindingIndexForPosition(shape: CCSlideShape, slideshow: CCSlideShowShape, pageAnchor: Vec) {
    // Get all non-placeholder bindings, sorted by index
    const allBindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .filter(b => !b.props.placeholder || b.toId === shape.id)  // Include our binding if it's placeholder
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_BASE_STYLE_CONSTANTS.HEADER.height
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Calculate target order based on position
    let order: number
    if (slideshow.props.slidePattern === 'horizontal') {
      order = clamp(
        Math.round((pageAnchor.x - slideshow.x - spacing) / (shape.props.w + spacing)),
        0,
        allBindings.length
      )
    } else if (slideshow.props.slidePattern === 'vertical') {
      order = clamp(
        Math.round((pageAnchor.y - slideshow.y - headerHeight - contentPadding - spacing) / (shape.props.h + spacing)),
        0,
        allBindings.length
      )
    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(allBindings.length))
      const col = clamp(
        Math.round((pageAnchor.x - slideshow.x - spacing) / (shape.props.w + spacing)),
        0,
        cols
      )
      const row = clamp(
        Math.round((pageAnchor.y - slideshow.y - headerHeight - contentPadding - spacing) / (shape.props.h + spacing)),
        0,
        Math.ceil(allBindings.length / cols)
      )
      order = clamp(row * cols + col, 0, allBindings.length)
    } else {
      order = 0
    }

    // Get the bindings before and after our target position
    const belowSib = allBindings[order - 1]
    const aboveSib = allBindings[order]

    // If we're already at this position, keep our current index
    if (belowSib?.toId === shape.id) {
      return belowSib.props.index
    } else if (aboveSib?.toId === shape.id) {
      return aboveSib.props.index
    }

    // Otherwise, get an index between the two siblings
    return getIndexBetween(belowSib?.props.index, aboveSib?.props.index)
  }

  override onTranslateStart = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape<CCSlideLayoutBinding>(shape.id, 'cc-slide-layout')
    logger.debug('shape', '✅ onTranslateStart', { 
      shape,
      bindings,
      hasBindings: bindings.length > 0,
      bindingTypes: bindings.map(b => ({
        id: b.id,
        fromId: b.fromId,
        placeholder: b.props.placeholder,
        isMovingWithParent: b.props.isMovingWithParent
      }))
    })

    this.editor.updateBindings(
      bindings.map((binding) => ({
        ...binding,
        props: { ...binding.props, placeholder: true },
      }))
    )
  }

  override onTranslate = (initial: CCSlideShape, current: CCSlideShape) => {
    const pageAnchor = this.editor.getShapePageTransform(current).applyToPoint({ x: current.props.w / 2, y: current.props.h / 2 })
    const targetSlideshow = this.getTargetSlideshow(current, pageAnchor)

    // Get current binding if any
    const currentBindings = this.editor.getBindingsToShape<CCSlideLayoutBinding>(current.id, 'cc-slide-layout')
    const currentBinding = currentBindings[0]
    const currentSlideshow = currentBinding ? this.editor.getShape<CCSlideShowShape>(currentBinding.fromId) : undefined

    logger.debug('shape', '✅ onTranslate', {
      initial,
      current,
      hasTargetSlideshow: !!targetSlideshow,
      targetSlideshowId: targetSlideshow?.id,
      currentBindings: currentBindings.map(b => ({
        id: b.id,
        fromId: b.fromId,
        placeholder: b.props.placeholder,
        isMovingWithParent: b.props.isMovingWithParent
      })),
      isInSlideshow: targetSlideshow ? this.isSlideInSlideshow(current, targetSlideshow) : false
    })

    // If we're moving out of a slideshow
    if (currentBinding && currentSlideshow && !this.isSlideInSlideshow(current, currentSlideshow)) {
      logger.debug('shape', '✅ onTranslate: Moving out of slideshow', {
        slideId: current.id,
        slideshowId: currentSlideshow.id
      })
      // Delete all bindings
      this.editor.deleteBindings(currentBindings)
      return current
    }

    // If we have no target slideshow, return
    if (!targetSlideshow) {
      return current
    }

    // Calculate new index
    const index = this.getBindingIndexForPosition(current, targetSlideshow, pageAnchor)
    
    // If we have a current binding and it's for this slideshow
    if (currentBinding && currentBinding.fromId === targetSlideshow.id) {
      // Only update if index changed
      if (currentBinding.props.index !== index) {
        logger.debug('shape', '✅ onTranslate: Updating binding index', {
          slideId: current.id,
          slideshowId: targetSlideshow.id,
          oldIndex: currentBinding.props.index,
          newIndex: index
        })
        this.editor.updateBinding<CCSlideLayoutBinding>({
          id: currentBinding.id,
          type: currentBinding.type,
          fromId: currentBinding.fromId,
          toId: currentBinding.toId,
          props: {
            ...currentBinding.props,
            index,
            isMovingWithParent: true,
          },
        })
      }
    } else if (this.isSlideInSlideshow(current, targetSlideshow)) {
      logger.debug('shape', '✅ onTranslate: Creating new placeholder binding', {
        slideId: current.id,
        slideshowId: targetSlideshow.id,
        index
      })
      // Create new placeholder binding if we're inside the slideshow
      this.editor.createBinding<CCSlideLayoutBinding>({
        type: 'cc-slide-layout',
        fromId: targetSlideshow.id,
        toId: current.id,
        props: {
          index,
          isMovingWithParent: true,
          placeholder: true,
        },
      })
    }

    return current
  }

  private isSlideInSlideshow(slide: CCSlideShape, slideshow: CCSlideShowShape): boolean {
    const slideCenter = this.editor.getShapePageTransform(slide).applyToPoint({
      x: slide.props.w / 2,
      y: slide.props.h / 2
    })
    const slideshowBounds = this.editor.getShapeGeometry(slideshow).bounds
    
    // Use smaller padding to be more lenient
    const padding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING / 4
    return (
      slideCenter.x >= slideshow.x + padding &&
      slideCenter.x <= slideshow.x + slideshowBounds.width - padding &&
      slideCenter.y >= slideshow.y + padding &&
      slideCenter.y <= slideshow.y + slideshowBounds.height - padding
    )
  }

  override onTranslateEnd = (shape: CCSlideShape) => {
    const pageAnchor = this.editor.getShapePageTransform(shape).applyToPoint({ x: shape.props.w / 2, y: shape.props.h / 2 })
    const targetSlideshow = this.getTargetSlideshow(shape, pageAnchor)
    const bindings = this.editor.getBindingsToShape<CCSlideLayoutBinding>(shape.id, 'cc-slide-layout')
    
    logger.debug('shape', '✅ onTranslateEnd', {
      shape,
      hasTargetSlideshow: !!targetSlideshow,
      targetSlideshowId: targetSlideshow?.id,
      bindings: bindings.map(b => ({
        id: b.id,
        fromId: b.fromId,
        placeholder: b.props.placeholder,
        isMovingWithParent: b.props.isMovingWithParent
      })),
      isInSlideshow: targetSlideshow ? this.isSlideInSlideshow(shape, targetSlideshow) : false
    })

    // If we have a target slideshow and the slide is inside it
    if (targetSlideshow && this.isSlideInSlideshow(shape, targetSlideshow)) {
      const index = this.getBindingIndexForPosition(shape, targetSlideshow, pageAnchor)
      
      // Instead of deleting and recreating, update existing binding if it exists
      const existingBinding = bindings[0]
      if (existingBinding && existingBinding.fromId === targetSlideshow.id) {
        logger.debug('shape', '✅ onTranslateEnd: Updating existing binding', {
          slideId: shape.id,
          slideshowId: targetSlideshow.id,
          bindingId: existingBinding.id,
          index
        })
        this.editor.updateBinding<CCSlideLayoutBinding>({
          id: existingBinding.id,
          type: existingBinding.type,
          fromId: existingBinding.fromId,
          toId: existingBinding.toId,
          props: {
            index,
            isMovingWithParent: true,
            placeholder: false,
          },
        })
      } else {
        logger.debug('shape', '✅ onTranslateEnd: Creating new binding', {
          slideId: shape.id,
          slideshowId: targetSlideshow.id,
          index
        })
        // If no existing binding or from different slideshow, delete and create new
        this.editor.deleteBindings(bindings)
        this.editor.createBinding<CCSlideLayoutBinding>({
          type: 'cc-slide-layout',
          fromId: targetSlideshow.id,
          toId: shape.id,
          props: {
            index,
            isMovingWithParent: true,
            placeholder: false,
          },
        })
      }
    } else {
      logger.debug('shape', '✅ onTranslateEnd: Removing bindings', {
        slideId: shape.id,
        bindings: bindings.map(b => b.id)
      })
      // Just delete bindings if we're not in a slideshow
      this.editor.deleteBindings(bindings)
    }
  }

  override renderContent = (shape: CCSlideShape) => {
    
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {shape.props.imageData && (
          <img 
            src={shape.props.imageData} 
            alt={shape.props.title}
            style={{
              width: '100%',
              height: `100%`,
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
      </div>
    )
  }
} 