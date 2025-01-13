import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, TLParentId } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from '../cc-props'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'
import { CCSlideContentFrameShape } from './CCSlideContentFrameUtil'
import { logger } from '../../../../debugConfig'

type CCSlideShowShapeProps = CCSlideShowShape['props']

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

  onTranslate = (initial: CCSlideShape, current: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(current.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      logger.warn('system', '⚠️ No slide layout binding found during translation', { slideId: current.id })
      return current
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      logger.warn('system', '⚠️ No slideshow found during translation', { slideId: current.id })
      return current
    }

    logger.debug('system', '🔄 Translating slide', {
      slideId: current.id,
      from: { x: initial.x, y: initial.y },
      to: { x: current.x, y: current.y },
      pattern: slideshow.props.slidePattern
    })

    // Get constants
    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING;
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT;
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING;
    const verticalOffset = headerHeight + contentPadding;

    // Get all slides in their current order
    const slides = slideshow.props.slides
      .map(id => this.editor.getShape(id))
      .filter((s): s is CCSlideShape => s?.type === 'cc-slide')
      .map((slide, index) => ({ slide, index }));

    const currentIndex = slides.findIndex(s => s.slide.id === current.id);
    if (currentIndex === -1) return current;

    // Calculate slot dimensions
    const slotWidth = current.props.w + spacing;
    const slotHeight = current.props.h + spacing;

    // Note: We remove the content frame update here since it's handled by the binding
    // The binding system will automatically update child positions

    // Apply pattern-specific logic
    if (slideshow.props.slidePattern === 'vertical') {
      // Constrain movement to vertical only and centered horizontally
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      const constrainedX = (slideshowProps.w - current.props.w) / 2;
      const constrainedY = Math.max(
        verticalOffset + spacing,
        Math.min(slideshowProps.h - current.props.h - spacing, current.y)
      );

      // Calculate positions
      const getSlotPosition = (index: number) => verticalOffset + spacing + (index * slotHeight);
      
      // Find which slot we're closest to
      let nearestSlot = currentIndex;
      const movingDown = constrainedY > getSlotPosition(currentIndex);

      if (movingDown && currentIndex < slides.length - 1) {
        const nextSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex + 1)) / 2;
        if (constrainedY > nextSlotMidpoint) {
          nearestSlot = currentIndex + 1;
        }
      } else if (!movingDown && currentIndex > 0) {
        const prevSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex - 1)) / 2;
        if (constrainedY < prevSlotMidpoint) {
          nearestSlot = currentIndex - 1;
        }
      }

      const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
      
      if (clampedSlot !== currentIndex) {
        // Move the displaced slide to the current slide's original position
        const displacedSlide = slides.find(({ index }) => index === clampedSlot);
        if (displacedSlide) {
          this.editor.updateShape<CCSlideShape>({
            id: displacedSlide.slide.id,
            type: 'cc-slide',
            x: constrainedX,
            y: getSlotPosition(currentIndex)
          });
        }
      }

      logger.debug('system', '📏 Vertical translation metrics', {
        slideId: current.id,
        currentPosition: constrainedY,
        nearestSlot,
        movingDown
      })

      return {
        ...current,
        x: constrainedX,
        y: constrainedY
      };
    } else if (slideshow.props.slidePattern === 'horizontal') {
      // Horizontal pattern
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      const constrainedX = Math.max(
        spacing,
        Math.min(slideshowProps.w - current.props.w - spacing, current.x)
      );
      const constrainedY = initial.y;

      // Calculate positions
      const getSlotPosition = (index: number) => spacing + (index * slotWidth);
      
      // Find which slot we're closest to
      let nearestSlot = currentIndex;
      const movingRight = constrainedX > getSlotPosition(currentIndex);

      if (movingRight && currentIndex < slides.length - 1) {
        const nextSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex + 1)) / 2;
        if (constrainedX > nextSlotMidpoint) {
          nearestSlot = currentIndex + 1;
        }
      } else if (!movingRight && currentIndex > 0) {
        const prevSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex - 1)) / 2;
        if (constrainedX < prevSlotMidpoint) {
          nearestSlot = currentIndex - 1;
        }
      }

      const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
      
      if (clampedSlot !== currentIndex) {
        // Move the displaced slide to the current slide's original position
        const displacedSlide = slides.find(({ index }) => index === clampedSlot);
        if (displacedSlide) {
          this.editor.updateShape<CCSlideShape>({
            id: displacedSlide.slide.id,
            type: 'cc-slide',
            x: getSlotPosition(currentIndex),
            y: constrainedY
          });
        }
      }

      logger.debug('system', '📏 Horizontal translation metrics', {
        slideId: current.id,
        currentPosition: constrainedX,
        nearestSlot,
        movingRight
      })

      return {
        ...current,
        x: constrainedX,
        y: constrainedY
      };
    } else {
      // Grid pattern
      const slideshowProps = slideshow.props as CCSlideShowShapeProps;
      const constrainedX = Math.max(
        spacing,
        Math.min(slideshowProps.w - current.props.w - spacing, current.x)
      );
      const constrainedY = Math.max(
        verticalOffset + spacing,
        Math.min(slideshowProps.h - current.props.h - spacing, current.y)
      );

      // Calculate grid dimensions
      const gridColumns = Math.floor(((slideshow.props as CCSlideShowShape['props']).w - spacing) / slotWidth);
      const currentRow = Math.floor(currentIndex / gridColumns);
      const currentCol = currentIndex % gridColumns;

      // Calculate positions
      const getSlotPosition = (index: number) => {
        const row = Math.floor(index / gridColumns);
        const col = index % gridColumns;
        return {
          x: spacing + (col * slotWidth),
          y: verticalOffset + spacing + (row * slotHeight)
        };
      };

      // Find nearest grid position
      const currentPos = getSlotPosition(currentIndex);
      let nearestSlot = currentIndex;

      // Check if we've moved significantly in either direction
      const movedRight = constrainedX > currentPos.x + slotWidth / 2;
      const movedLeft = constrainedX < currentPos.x - slotWidth / 2;
      const movedDown = constrainedY > currentPos.y + slotHeight / 2;
      const movedUp = constrainedY < currentPos.y - slotHeight / 2;

      if (movedRight && currentCol < gridColumns - 1) {
        nearestSlot = currentIndex + 1;
      } else if (movedLeft && currentCol > 0) {
        nearestSlot = currentIndex - 1;
      } else if (movedDown && currentRow < Math.floor((slides.length - 1) / gridColumns)) {
        nearestSlot = currentIndex + gridColumns;
      } else if (movedUp && currentRow > 0) {
        nearestSlot = currentIndex - gridColumns;
      }

      const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
      
      if (clampedSlot !== currentIndex) {
        // Move the displaced slide to the current slide's original position
        const displacedSlide = slides.find(({ index }) => index === clampedSlot);
        if (displacedSlide) {
          const originalPos = getSlotPosition(currentIndex);
          this.editor.updateShape<CCSlideShape>({
            id: displacedSlide.slide.id,
            type: 'cc-slide',
            x: originalPos.x,
            y: originalPos.y
          });
        }
      }

      logger.debug('system', '📏 Grid translation metrics', {
        slideId: current.id,
        position: { x: constrainedX, y: constrainedY },
        nearestSlot,
        gridMetrics: {
          currentRow,
          currentCol,
          movedRight,
          movedLeft,
          movedDown,
          movedUp
        }
      })

      return {
        ...current,
        x: constrainedX,
        y: constrainedY
      };
    }
  }

  onTranslateEnd = (shape: CCSlideShape) => {
    logger.debug('system', '🎯 Slide translation ended', { slideId: shape.id })

    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      logger.warn('system', '⚠️ No slide layout binding found at translation end', { slideId: shape.id })
      return
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      logger.warn('system', '⚠️ No slideshow found at translation end', { slideId: shape.id })
      return
    }

    // Get constants
    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING;
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT;
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING;

    // Get all slides in their current order
    const slides = slideshow.props.slides
      .map(id => this.editor.getShape(id))
      .filter((s): s is CCSlideShape => s?.type === 'cc-slide')
      .map((slide, index) => ({ slide, index }));

    const currentIndex = slides.findIndex(s => s.slide.id === shape.id);
    if (currentIndex === -1) return;

    // Calculate slot dimensions
    const slotWidth = shape.props.w + spacing;
    const slotHeight = shape.props.h + spacing;

    // Store content frames and their parent slides before reordering
    const slideContentMap = new Map<string, string>(); // slideId -> contentFrameId
    slides.forEach(({ slide }) => {
      const contentFrame = this.editor.getSortedChildIdsForParent(slide.id)
        .map(id => this.editor.getShape(id))
        .find((s): s is CCSlideContentFrameShape => s?.type === 'cc-slide-content');
      if (contentFrame) {
        slideContentMap.set(slide.id, contentFrame.id);
      }
    });

    let nearestSlot = currentIndex;
    let getSlotPosition: (index: number) => { x: number; y: number };

    switch (slideshow.props.slidePattern) {
      case 'vertical': {
        getSlotPosition = (index) => ({
          x: (slideshow.props.w - shape.props.w) / 2,
          y: headerHeight + contentPadding + spacing + (index * slotHeight)
        });

        const currentPosition = shape.y;
        const movingDown = currentPosition > getSlotPosition(currentIndex).y;

        if (movingDown && currentIndex < slides.length - 1) {
          const nextSlotMidpoint = (getSlotPosition(currentIndex).y + getSlotPosition(currentIndex + 1).y) / 2;
          if (currentPosition > nextSlotMidpoint) {
            nearestSlot = currentIndex + 1;
          }
        } else if (!movingDown && currentIndex > 0) {
          const prevSlotMidpoint = (getSlotPosition(currentIndex).y + getSlotPosition(currentIndex - 1).y) / 2;
          if (currentPosition < prevSlotMidpoint) {
            nearestSlot = currentIndex - 1;
          }
        }
        break;
      }

      case 'grid': {
        const gridColumns = Math.floor((slideshow.props.w - spacing) / slotWidth);
        getSlotPosition = (index) => {
          const row = Math.floor(index / gridColumns);
          const col = index % gridColumns;
          return {
            x: spacing + (col * slotWidth),
            y: headerHeight + contentPadding + spacing + (row * slotHeight)
          };
        };

        const currentPos = getSlotPosition(currentIndex);
        const movedRight = shape.x > currentPos.x + slotWidth / 2;
        const movedLeft = shape.x < currentPos.x - slotWidth / 2;
        const movedDown = shape.y > currentPos.y + slotHeight / 2;
        const movedUp = shape.y < currentPos.y - slotHeight / 2;

        const currentRow = Math.floor(currentIndex / gridColumns);
        const currentCol = currentIndex % gridColumns;

        if (movedRight && currentCol < gridColumns - 1) {
          nearestSlot = currentIndex + 1;
        } else if (movedLeft && currentCol > 0) {
          nearestSlot = currentIndex - 1;
        } else if (movedDown && currentRow < Math.floor((slides.length - 1) / gridColumns)) {
          nearestSlot = currentIndex + gridColumns;
        } else if (movedUp && currentRow > 0) {
          nearestSlot = currentIndex - gridColumns;
        }
        break;
      }

      case 'radial': {
        const radius = Math.min(slideshow.props.w, slideshow.props.h - headerHeight - contentPadding * 2) / 3;
        getSlotPosition = (index) => {
          const angle = (2 * Math.PI * index) / slides.length;
          return {
            x: slideshow.props.w / 2 + radius * Math.cos(angle) - shape.props.w / 2,
            y: headerHeight + contentPadding + (slideshow.props.h - headerHeight - contentPadding * 2) / 2 + radius * Math.sin(angle) - shape.props.h / 2
          };
        };

        // Find nearest angle based on current position
        const centerX = slideshow.props.w / 2;
        const centerY = headerHeight + contentPadding + (slideshow.props.h - headerHeight - contentPadding * 2) / 2;
        const currentAngle = Math.atan2(shape.y + shape.props.h / 2 - centerY, shape.x + shape.props.w / 2 - centerX);
        const normalizedAngle = currentAngle < 0 ? currentAngle + 2 * Math.PI : currentAngle;
        nearestSlot = Math.round((normalizedAngle * slides.length) / (2 * Math.PI)) % slides.length;
        break;
      }

      case 'horizontal':
      default: {
        getSlotPosition = (index) => ({
          x: spacing + (index * slotWidth),
          y: headerHeight + contentPadding + spacing
        });

        const currentPosition = shape.x;
        const movingRight = currentPosition > getSlotPosition(currentIndex).x;

        if (movingRight && currentIndex < slides.length - 1) {
          const nextSlotMidpoint = (getSlotPosition(currentIndex).x + getSlotPosition(currentIndex + 1).x) / 2;
          if (currentPosition > nextSlotMidpoint) {
            nearestSlot = currentIndex + 1;
          }
        } else if (!movingRight && currentIndex > 0) {
          const prevSlotMidpoint = (getSlotPosition(currentIndex).x + getSlotPosition(currentIndex - 1).x) / 2;
          if (currentPosition < prevSlotMidpoint) {
            nearestSlot = currentIndex - 1;
          }
        }
      }
    }

    const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
    
    if (clampedSlot !== currentIndex) {
      logger.info('system', '🔄 Slide position swap detected', {
        slideId: shape.id,
        from: currentIndex,
        to: clampedSlot,
        pattern: slideshow.props.slidePattern
      })

      this.editor.batch(() => {
        // Update slide order
        const newSlides = [...slideshow.props.slides];
        const [movedSlide] = newSlides.splice(currentIndex, 1);
        newSlides.splice(clampedSlot, 0, movedSlide);
        
        this.editor.updateShape<CCSlideShowShape>({
          id: slideshow.id,
          type: 'cc-slideshow',
          props: {
            ...slideshow.props,
            slides: newSlides
          }
        });

        // Update positions based on new order
        newSlides.forEach((slideId, index) => {
          const slide = this.editor.getShape(slideId) as CCSlideShape;
          if (slide?.type === 'cc-slide') {
            const position = getSlotPosition(index);
            
            // Update slide position
            this.editor.updateShape<CCSlideShape>({
              id: slide.id,
              type: 'cc-slide',
              x: position.x,
              y: position.y
            });

            // Update content frame position
            const contentFrameId = slideContentMap.get(slide.id);
            if (contentFrameId) {
              const contentFrame = this.editor.getShape(contentFrameId as TLParentId);
              if (contentFrame) {
                this.editor.updateShape({
                  id: contentFrame.id,
                  type: contentFrame.type,
                  parentId: slide.id as TLParentId,
                  x: 0,
                  y: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
                });
              }
            }
          }
        });

        logger.debug('system', '✅ Slide reorder complete', {
          slideId: shape.id,
          newOrder: newSlides,
          contentFramesUpdated: slideContentMap.size
        })
      });
    }
  }

  getParentId = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout');
    return bindings[0]?.fromId;
  }
} 