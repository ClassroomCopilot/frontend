import { DefaultColorStyle, DefaultDashStyle, DefaultSizeStyle } from '@tldraw/tldraw'
import { getDefaultCCSlideProps } from '../cc-props'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { ccShapeProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideLayoutBinding } from './CCSlideLayoutBindingUtil'

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

  override canBind(args: { fromShapeType: string; toShapeType: string; bindingType: string }): boolean {
    return args.fromShapeType === 'cc-slideshow' && args.toShapeType === 'cc-slide' && args.bindingType === 'cc-slide-layout'
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

  onTranslateEnd = (shape: CCSlideShape) => {
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

  getParentId = (shape: CCSlideShape) => {
    const bindings = this.editor.getBindingsToShape(shape.id, 'cc-slide-layout');
    return bindings[0]?.fromId;
  }
} 