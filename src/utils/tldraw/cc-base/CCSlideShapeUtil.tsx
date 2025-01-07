import { ShapeUtil, TLBaseShape, HTMLContainer, DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle, Rectangle2d } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from './cc-props'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'
import { ccShapeProps } from './cc-props'
import { ccShapeMigrations } from './cc-migrations'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'

type CCSlideShowShapeProps = {
  w: number
  h: number
  slides: string[]
  slidePattern: 'vertical' | 'horizontal' | 'grid'
}

export type CCSlideShape = TLBaseShape<'cc-slide', {
  title: string
  w: number
  h: number
  headerColor: string
  isLocked: boolean
}>

export class CCSlideShapeUtil extends ShapeUtil<CCSlideShape> {
  static type = 'cc-slide' as const
  static props = ccShapeProps.slide
  static migrations = ccShapeMigrations.slide

  static styles = {
    color: DefaultColorStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
  }

  getDefaultProps() {
    return getDefaultCCSlideProps()
  }

  getGeometry(shape: CCSlideShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  component(shape: CCSlideShape) {
    const { title, headerColor } = shape.props
    const { SLIDE_COLORS } = CC_SLIDESHOW_STYLE_CONSTANTS

    return (
      <HTMLContainer
        id={shape.id}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: SLIDE_COLORS.background,
            borderRadius: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_BORDER_RADIUS,
            border: `${CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_BORDER_WIDTH}px solid ${SLIDE_COLORS.border}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT,
              padding: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_PADDING,
              backgroundColor: headerColor,
              color: SLIDE_COLORS.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <span>{title}</span>
          </div>
          <div
            style={{
              flex: 1,
              padding: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING,
              display: 'flex',
              flexDirection: 'column',
              gap: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING,
              overflow: 'auto',
            }}
          />
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: CCSlideShape) {
    const isHovered = this.editor.getHoveredShapeId() === shape.id;

    return (
      <>
        <rect 
          width={shape.props.w} 
          height={CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT}
          fill="none"
          stroke={isHovered ? "var(--color-selected)" : "none"}
          strokeWidth={2}
        />
        <rect 
          width={shape.props.w} 
          height={shape.props.h}
          fill="none"
          stroke={isHovered ? "var(--color-selected)" : "none"}
          strokeWidth={2}
        />
      </>
    )
  }

  onPointerEnter = () => {
    this.editor.setCursor({ type: 'pointer' });
  }

  onPointerLeave = () => {
    this.editor.setCursor({ type: 'default' });
  }

  canEdit = () => true
  hideResizeHandles = () => false
  hideRotateHandle = () => true
  hideSelectionBoundsFg = () => false
  hideSelectionBoundsBg = () => false
  canUnmount = () => true

  onBeforeCreate(shape: CCSlideShape): CCSlideShape {
    return shape
  }

  override canBind({ fromShapeType, toShapeType, bindingType }: {
    fromShapeType: string
    toShapeType: string
    bindingType: string
  }) {
    return fromShapeType === 'cc-slideshow' && toShapeType === 'cc-slide' && bindingType === 'cc-slide-layout'
  }

  override onTranslate = (initial: CCSlideShape, current: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(current.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      return current
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      return current
    }

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

    return {
      ...current,
        x: constrainedX,
        y: constrainedY
      };
    }
  }

  override onTranslateEnd = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout')
    const slideBinding = bindings[0] as CCSlideLayoutBinding | undefined

    if (!slideBinding) {
      return
    }

    const slideshow = this.editor.getShape(slideBinding.fromId) as CCSlideShowShape
    if (!slideshow) {
      return
    }

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

    const currentIndex = slides.findIndex(s => s.slide.id === shape.id);
    if (currentIndex === -1) return;

    // Calculate slot dimensions
    const slotWidth = shape.props.w + spacing;
    const slotHeight = shape.props.h + spacing;

    if (slideshow.props.slidePattern === 'vertical') {
      // Calculate positions
      const getSlotPosition = (index: number) => verticalOffset + spacing + (index * slotHeight);
      
      // Find nearest slot based on current position
      const currentPosition = shape.y;
      let nearestSlot = currentIndex;
      
      // Find which slot we're closest to
      const movingDown = currentPosition > getSlotPosition(currentIndex);

      if (movingDown && currentIndex < slides.length - 1) {
        const nextSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex + 1)) / 2;
        if (currentPosition > nextSlotMidpoint) {
          nearestSlot = currentIndex + 1;
        }
      } else if (!movingDown && currentIndex > 0) {
        const prevSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex - 1)) / 2;
        if (currentPosition < prevSlotMidpoint) {
          nearestSlot = currentIndex - 1;
        }
      }

      const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
      
      if (clampedSlot !== currentIndex) {
        this.editor.batch(() => {
          // Update slide order first
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

          // Then update positions based on new order
          newSlides.forEach((id, index) => {
            const slide = this.editor.getShape(id) as CCSlideShape | undefined;
            if (slide?.type === 'cc-slide') {
              const slideshowProps = slideshow.props as CCSlideShowShape['props'];
              this.editor.updateShape<CCSlideShape>({
                id: slide.id,
                type: 'cc-slide',
                x: (slideshowProps.w - slide.props.w) / 2,
                y: getSlotPosition(index)
              });
            }
          });
        });
      }
    } else {
      // Horizontal pattern
      const getSlotPosition = (index: number) => spacing + (index * slotWidth);
      
      // Find nearest slot based on current position
      const currentPosition = shape.x;
      let nearestSlot = currentIndex;
      
      // Find which slot we're closest to
      const movingRight = currentPosition > getSlotPosition(currentIndex);

      if (movingRight && currentIndex < slides.length - 1) {
        const nextSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex + 1)) / 2;
        if (currentPosition > nextSlotMidpoint) {
          nearestSlot = currentIndex + 1;
        }
      } else if (!movingRight && currentIndex > 0) {
        const prevSlotMidpoint = (getSlotPosition(currentIndex) + getSlotPosition(currentIndex - 1)) / 2;
        if (currentPosition < prevSlotMidpoint) {
          nearestSlot = currentIndex - 1;
        }
      }

      const clampedSlot = Math.max(0, Math.min(slides.length - 1, nearestSlot));
      
      if (clampedSlot !== currentIndex) {
        this.editor.batch(() => {
          // Update slide order first
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

          // Then update positions based on new order
          newSlides.forEach((id, index) => {
            const slide = this.editor.getShape(id) as CCSlideShape | undefined;
            if (slide?.type === 'cc-slide') {
              this.editor.updateShape<CCSlideShape>({
                id: slide.id,
                type: 'cc-slide',
                x: getSlotPosition(index),
                y: shape.y
              });
            }
          });
        });
      }
    }
  }

  onPointerDown = (shape: CCSlideShape, event: { x: number; y: number }) => {
    const { y } = event;
    
    // If clicking on header, ensure this slide is selected
    if (y <= CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT) {
      // First deselect everything
      this.editor.selectNone();
      // Then select only this slide
      this.editor.select(shape.id);
      return true;  // Indicate we've handled the event
    }

    return false;  // Let other handlers process the event
  }

  isPointInShape(shape: CCSlideShape, point: { x: number; y: number }, margin?: number) {
    const { y } = point;
    
    // Give highest priority to header area for dragging
    if (y <= CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT) {
      return {
        isHit: true,
        priority: 2  // Higher priority than slideshow
      };
    }

    // For the rest of the shape, use default hit testing with lower priority
    return {
      isHit: this.getGeometry(shape).bounds.containsPoint(point, margin ?? 0),
      priority: 1
    };
  }

  hitTestPoint(shape: CCSlideShape, point: { x: number; y: number }, margin?: number) {
    const { y } = point;
    
    // Give highest priority to header area for dragging
    if (y <= CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT) {
      return {
        isHit: true,
        priority: 2  // Higher priority than slideshow
      };
    }

    // For the rest of the shape, use default hit testing with lower priority
    return {
      isHit: this.getGeometry(shape).bounds.containsPoint(point, margin ?? 0),
      priority: 1
    };
  }

  shouldRenderIndicator = () => {
    return true;  // Always show indicator to help with dragging
  }

  canDrag = () => {
    return true;  // Always allow dragging
  }

  getParentId = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout');
    return bindings[0]?.fromId;
  }
} 