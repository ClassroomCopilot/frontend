import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from '../cc-props'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'
import { logger } from '../../../../debugConfig'
import { SlideValidationUtil } from './utils/SlideValidationUtil'
import { SlidePositionUtil } from './utils/SlidePositionUtil'

export interface CCSlideShape extends CCBaseShape {
  type: 'cc-slide'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
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

  canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    return args.fromShapeType === 'cc-slideshow' && args.toShapeType === 'cc-slide' && args.bindingType === 'cc-slide-layout'
  }

  isLocked = (shape: CCSlideShape) => {
    logger.debug('system', '🔒 Checking if slide is locked', { 
      slideId: shape.id,
      isLocked: shape.props.isLocked
    })
    return shape.props.isLocked
  }

  isDraggable = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined
    const canDrag = !!slideBinding && !shape.props.isLocked

    logger.debug('system', '🖱️ Checking if slide is draggable', { 
      slideId: shape.id,
      hasBinding: !!slideBinding,
      isLocked: shape.props.isLocked,
      canDrag
    })
    return canDrag
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderContent = (shape: CCSlideShape) => {
    return <div />
  }

  onBeforeCreate(shape: CCSlideShape): CCSlideShape {
    return shape
  }

  onTranslateStart = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined
    const slideshow = slideBinding ? this.editor.getShape(slideBinding.fromId) as CCSlideShowShape : undefined

    // Get all slides in the slideshow
    const allSlides = slideshow?.props.slides.map(id => ({
      id,
      shape: this.editor.getShape(id) as CCSlideShape,
      position: this.editor.getShape(id)?.x
    })) ?? []

    logger.debug('system', '🎯 Slide translation started', { 
      slideId: shape.id,
      slideProps: shape.props,
      slidePosition: { x: shape.x, y: shape.y },
      binding: slideBinding ? {
        id: slideBinding.id,
        props: slideBinding.props,
        fromId: slideBinding.fromId,
        toId: slideBinding.toId
      } : undefined,
      slideshow: slideshow ? {
        id: slideshow.id,
        pattern: slideshow.props.slidePattern,
        currentOrder: slideshow.props.slides,
        dimensions: {
          width: slideshow.props.w,
          height: slideshow.props.h
        }
      } : undefined,
      allSlides: allSlides.map(s => ({
        id: s.id,
        position: s.position,
        isLocked: s.shape?.props.isLocked
      }))
    })

    // Mark the binding as moving
    if (slideBinding && !slideBinding.props.placeholder) {
      this.editor.updateBinding({
        id: slideBinding.id,
        type: slideBinding.type,
        fromId: slideBinding.fromId,
        toId: slideBinding.toId,
        props: {
          ...slideBinding.props,
          isMovingWithParent: true,
          lastKnownSlot: slideshow?.props.slides.indexOf(shape.id) ?? 0
        }
      })
    }
  }

  onTranslate = (initial: CCSlideShape, current: CCSlideShape) => {
    const validated = SlideValidationUtil.validateSlideMovement(this.editor, current)
    if (!validated) return current

    const { slideshow } = validated

    // Apply pattern-specific constraints
    const constrainedPosition = SlidePositionUtil.getConstrainedPosition(
      slideshow.props.slidePattern,
      current,
      initial,
      slideshow
    )

    return {
      ...current,
      x: constrainedPosition.x,
      y: constrainedPosition.y
    }
  }

  onTranslateEnd = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined
    const slideshow = slideBinding ? this.editor.getShape(slideBinding.fromId) as CCSlideShowShape : undefined

    // Get all slides and their current positions
    const allSlides = slideshow?.props.slides.map(id => ({
      id,
      shape: this.editor.getShape(id) as CCSlideShape,
      position: this.editor.getShape(id)?.x,
      binding: this.editor.getBindingsToShape(id, 'cc-slide-layout')[0] as CCSlideLayoutBinding
    })) ?? []

    logger.debug('system', '🎯 Slide translation ended', {
      slideId: shape.id,
      finalPosition: { x: shape.x, y: shape.y },
      binding: slideBinding ? {
        id: slideBinding.id,
        props: slideBinding.props,
        lastKnownSlot: slideBinding.props.lastKnownSlot,
        isMovingWithParent: slideBinding.props.isMovingWithParent
      } : undefined,
      slideshow: slideshow ? {
        id: slideshow.id,
        pattern: slideshow.props.slidePattern,
        finalOrder: slideshow.props.slides,
        dimensions: {
          width: slideshow.props.w,
          height: slideshow.props.h
        }
      } : undefined,
      allSlides: allSlides.map(s => ({
        id: s.id,
        position: s.position,
        isLocked: s.shape?.props.isLocked,
        binding: s.binding ? {
          lastKnownSlot: s.binding.props.lastKnownSlot,
          isMovingWithParent: s.binding.props.isMovingWithParent
        } : undefined
      }))
    })

    if (!slideBinding) {
      logger.warn('system', '⚠️ No slide layout binding found at translation end', { slideId: shape.id })
      return
    }

    if (!slideshow) {
      logger.warn('system', '⚠️ No slideshow found at translation end', { slideId: shape.id })
      return
    }
  }

  getParentId = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout');
    return bindings[0]?.fromId;
  }
} 