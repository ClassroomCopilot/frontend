import { BindingUtil, TLBaseBinding, IndexKey, Vec, TLShapeId } from '@tldraw/tldraw'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideShape } from './CCSlideShapeUtil'
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { logger } from '../../../../debugConfig'

export interface CCSlideLayoutBinding extends TLBaseBinding<'cc-slide-layout', {
  index: IndexKey
  isMovingWithParent: boolean
  placeholder: boolean
}> {}

export class CCSlideLayoutBindingUtil extends BindingUtil<CCSlideLayoutBinding> {
  static type = 'cc-slide-layout' as const

  getDefaultProps(): CCSlideLayoutBinding['props'] {
    return {
      index: 'a1' as IndexKey,
      isMovingWithParent: false,
      placeholder: false
    }
  }

  private updateSlidePosition(binding: CCSlideLayoutBinding) {
    const { fromId: slideshowId, toId: slideId } = binding
    const slideshow = this.editor.getShape<CCSlideShowShape>(slideshowId)
    const slide = this.editor.getShape<CCSlideShape>(slideId)
    
    if (!slideshow || !slide) return

    // Get all bindings from the slideshow, sorted by index
    const bindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    // Find position in sorted bindings array
    const index = bindings.findIndex(b => b.id === binding.id)
    if (index === -1) return

    // Get all slides and their dimensions up to the current index
    const slidesBeforeCurrent = bindings
      .slice(0, index)
      .map(b => {
        const s = this.editor.getShape<CCSlideShape>(b.toId)
        return s ? { width: s.props.w, height: s.props.h } : null
      })
      .filter(s => s !== null) as { width: number, height: number }[]

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Calculate new position based on pattern
    let offset: Vec = new Vec(0, 0)
    if (slideshow.props.slidePattern === 'horizontal') {
      // Sum widths of all previous slides plus spacing
      const totalWidthBefore = slidesBeforeCurrent.reduce((sum, s) => sum + s.width + spacing, 0)
      offset = new Vec(
        spacing + totalWidthBefore,
        headerHeight + contentPadding + spacing
      )
    } else if (slideshow.props.slidePattern === 'vertical') {
      // Sum heights of all previous slides plus spacing
      const totalHeightBefore = slidesBeforeCurrent.reduce((sum, s) => sum + s.height + spacing, 0)
      offset = new Vec(
        spacing,
        headerHeight + contentPadding + spacing + totalHeightBefore
      )
    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(bindings.length))
      const row = Math.floor(index / cols)
      const col = index % cols

      // Get maximum dimensions for each column and row up to current position
      const colWidths = new Array(cols).fill(0)
      const rowHeights = new Array(Math.ceil(bindings.length / cols)).fill(0)

      bindings.forEach((b, i) => {
        const s = this.editor.getShape<CCSlideShape>(b.toId)
        if (!s) return
        const r = Math.floor(i / cols)
        const c = i % cols
        colWidths[c] = Math.max(colWidths[c], s.props.w)
        rowHeights[r] = Math.max(rowHeights[r], s.props.h)
      })

      // Calculate position based on accumulated column widths and row heights
      const xPos = spacing + colWidths.slice(0, col).reduce((sum, w) => sum + w + spacing, 0)
      const yPos = headerHeight + contentPadding + spacing + 
                  rowHeights.slice(0, row).reduce((sum, h) => sum + h + spacing, 0)

      offset = new Vec(xPos, yPos)
    } else if (slideshow.props.slidePattern === 'radial') {
      // For radial pattern, calculate position based on index and total slides
      const totalSlides = bindings.length
      const angle = (2 * Math.PI * index) / totalSlides
      
      // Find the largest slide dimension to determine radius
      const maxDimension = Math.max(
        ...bindings.map(b => {
          const s = this.editor.getShape<CCSlideShape>(b.toId)
          return s ? Math.max(s.props.w, s.props.h) : 0
        })
      )
      
      const radius = maxDimension * 0.75  // Adjust radius based on largest slide
      
      // Calculate position on the circle
      const x = spacing + radius + (radius * Math.cos(angle))
      const y = headerHeight + contentPadding + spacing + radius + (radius * Math.sin(angle))
      
      offset = new Vec(x, y)
    }

    const point = this.editor.getPointInParentSpace(
      slide,
      this.editor.getShapePageTransform(slideshow)!.applyToPoint(offset)
    )

    if (slide.x !== point.x || slide.y !== point.y) {
      this.editor.updateShape<CCSlideShape>({
        id: slideId,
        type: 'cc-slide',
        x: point.x,
        y: point.y,
      })
    }
  }

  private updateSlideshowSize(slideshowId: TLShapeId) {
    const slideshow = this.editor.getShape<CCSlideShowShape>(slideshowId)
    if (!slideshow) return

    // Get all bindings, including placeholders
    const bindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Default dimensions for empty slideshow
    const defaultWidth = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH + (spacing * 2)
    const defaultHeight = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + 
                         headerHeight + (contentPadding * 2) + (spacing * 2)

    // If no bindings, set to default size
    if (bindings.length === 0) {
      if (slideshow.props.w !== defaultWidth || slideshow.props.h !== defaultHeight) {
        this.editor.updateShape<CCSlideShowShape>({
          id: slideshow.id,
          type: 'cc-slideshow',
          props: { 
            ...slideshow.props,
            w: defaultWidth,
            h: defaultHeight
          }
        })
      }
      return
    }

    // Get all slides and their dimensions
    const slides = bindings.map(binding => {
      const slide = this.editor.getShape<CCSlideShape>(binding.toId)
      if (!slide) return null
      return {
        width: slide.props.w,
        height: slide.props.h
      }
    }).filter(slide => slide !== null) as { width: number, height: number }[]

    if (slides.length === 0) return

    // Calculate dimensions based on pattern
    let width = defaultWidth
    let height = defaultHeight

    if (slideshow.props.slidePattern === 'horizontal') {
      // Sum of all widths plus spacing between them
      width = Math.max(
        spacing + (slides.reduce((sum, slide) => sum + slide.width, 0) + 
        ((slides.length - 1) * spacing)) + spacing,
        slides[0].width + (spacing * 2)  // Minimum width is first slide plus spacing
      )
      // Maximum height of slides plus header and spacing
      height = headerHeight + contentPadding * 2 + spacing * 2 + 
               Math.max(...slides.map(slide => slide.height))
    } else if (slideshow.props.slidePattern === 'vertical') {
      // Maximum width of slides plus spacing
      width = Math.max(...slides.map(slide => slide.width)) + (spacing * 2)
      // Sum of all heights plus spacing between them
      height = Math.max(
        headerHeight + contentPadding * 2 + spacing + 
        (slides.reduce((sum, slide) => sum + slide.height, 0) + 
        ((slides.length - 1) * spacing)) + spacing,
        headerHeight + contentPadding * 2 + spacing * 2 + slides[0].height
      )
    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(slides.length))
      const rows = Math.ceil(slides.length / cols)
      
      // Find maximum width and height for grid cells
      const maxCellWidth = Math.max(...slides.map(slide => slide.width))
      const maxCellHeight = Math.max(...slides.map(slide => slide.height))
      
      width = Math.max(
        spacing + (cols * maxCellWidth + (cols - 1) * spacing) + spacing,
        maxCellWidth + (spacing * 2)
      )
      height = Math.max(
        headerHeight + contentPadding * 2 + spacing +
        (rows * maxCellHeight + (rows - 1) * spacing) + spacing,
        headerHeight + contentPadding * 2 + spacing * 2 + maxCellHeight
      )
    } else if (slideshow.props.slidePattern === 'radial') {
      // For radial pattern, use the largest slide dimensions to ensure proper spacing
      const maxSlideWidth = Math.max(...slides.map(slide => slide.width))
      const maxSlideHeight = Math.max(...slides.map(slide => slide.height))
      
      // Calculate dimensions to fit all slides in a circle
      const radius = Math.max(maxSlideWidth, maxSlideHeight) * 1.5  // 1.5x for spacing
      width = radius * 2 + (spacing * 2)
      height = headerHeight + contentPadding * 2 + radius * 2 + (spacing * 2)
    }

    if (width !== slideshow.props.w || height !== slideshow.props.h) {
      this.editor.updateShape<CCSlideShowShape>({
        id: slideshow.id,
        type: 'cc-slideshow',
        props: { 
          ...slideshow.props,
          w: width,
          h: height
        }
      })
    }

    // Update positions for all bindings
    bindings.forEach(binding => this.updateSlidePosition(binding))
  }

  private getDistance(a: Vec, b: Vec): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private getInsertPosition(
    slideshow: CCSlideShowShape,
    draggedSlide: CCSlideShape,
    point: Vec
  ): { index: number; offset: Vec } {
    const bindings = this.editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))

    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING
    const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT
    const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING

    // Get all existing slides with their dimensions
    const existingSlides = bindings.map(b => {
      const slide = this.editor.getShape<CCSlideShape>(b.toId)
      return slide ? {
        width: slide.props.w,
        height: slide.props.h,
        binding: b
      } : null
    }).filter(s => s !== null) as { width: number; height: number; binding: CCSlideLayoutBinding }[]

    if (slideshow.props.slidePattern === 'horizontal') {
      let currentX = spacing
      let insertIndex = 0

      // Calculate trigger points based on slide widths and the dragged slide
      for (const slide of existingSlides) {
        // Calculate the gap between slides based on the larger width
        const gapWidth = Math.max(slide.width, draggedSlide.props.w)
        const triggerPoint = currentX + (gapWidth / 2)
        if (point.x < triggerPoint) break
        currentX += slide.width + spacing
        insertIndex++
      }

      return {
        index: insertIndex,
        offset: new Vec(currentX, headerHeight + contentPadding + spacing)
      }

    } else if (slideshow.props.slidePattern === 'vertical') {
      let currentY = headerHeight + contentPadding + spacing
      let insertIndex = 0

      // Calculate trigger points based on slide heights and the dragged slide
      for (const slide of existingSlides) {
        // Calculate the gap between slides based on the larger height
        const gapHeight = Math.max(slide.height, draggedSlide.props.h)
        const triggerPoint = currentY + (gapHeight / 2)
        if (point.y < triggerPoint) break
        currentY += slide.height + spacing
        insertIndex++
      }

      return {
        index: insertIndex,
        offset: new Vec(spacing, currentY)
      }

    } else if (slideshow.props.slidePattern === 'grid') {
      const cols = Math.ceil(Math.sqrt(existingSlides.length + 1))  // +1 for the dragged slide
      const colWidths = new Array(cols).fill(draggedSlide.props.w)  // Initialize with dragged slide width
      const rowHeights = new Array(Math.ceil((existingSlides.length + 1) / cols)).fill(draggedSlide.props.h)  // Initialize with dragged slide height

      // Calculate maximum dimensions for each column and row, including dragged slide dimensions
      existingSlides.forEach((slide, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        colWidths[col] = Math.max(colWidths[col], slide.width)
        rowHeights[row] = Math.max(rowHeights[row], slide.height)
      })

      // Calculate grid cell positions with dynamic cell sizes
      let bestDistance = Infinity
      let bestIndex = 0
      let bestOffset = new Vec(0, 0)

      for (let i = 0; i <= existingSlides.length; i++) {
        const row = Math.floor(i / cols)
        const col = i % cols

        // Calculate cell position based on accumulated widths and heights
        const cellX = spacing + colWidths.slice(0, col).reduce((sum, w) => sum + w + spacing, 0)
        const cellY = headerHeight + contentPadding + spacing + 
                     rowHeights.slice(0, row).reduce((sum, h) => sum + h + spacing, 0)

        // Calculate distance to cell center
        const cellCenterX = cellX + (colWidths[col] / 2)
        const cellCenterY = cellY + (rowHeights[row] / 2)
        const dx = point.x - cellCenterX
        const dy = point.y - cellCenterY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < bestDistance) {
          bestDistance = distance
          bestIndex = i
          bestOffset = new Vec(cellX, cellY)
        }
      }

      return {
        index: bestIndex,
        offset: bestOffset
      }

    } else if (slideshow.props.slidePattern === 'radial') {
      // Find the largest slide dimension including the dragged slide
      const maxDimension = Math.max(
        draggedSlide.props.w,
        draggedSlide.props.h,
        ...existingSlides.map(s => Math.max(s.width, s.height))
      )
      
      const radius = maxDimension * 0.75
      const center = new Vec(
        spacing + radius,
        headerHeight + contentPadding + spacing + radius
      )

      // Calculate angle from center to drag point using manual vector calculation
      const dx = point.x - center.x
      const dy = point.y - center.y
      const angleToPoint = Math.atan2(dy, dx)

      // Normalize angle to 0-2π range
      const normalizedAngle = angleToPoint < 0 ? angleToPoint + 2 * Math.PI : angleToPoint
      
      // Calculate insert index based on angle
      const totalPositions = existingSlides.length + 1
      const insertIndex = Math.floor((normalizedAngle * totalPositions) / (2 * Math.PI))

      // Calculate position on circle for this index
      const angle = (2 * Math.PI * insertIndex) / totalPositions
      const x = center.x + (radius * Math.cos(angle))
      const y = center.y + (radius * Math.sin(angle))

      return {
        index: insertIndex,
        offset: new Vec(x, y)
      }
    }

    // Default to end of slideshow if pattern not recognized
    return {
      index: existingSlides.length,
      offset: new Vec(spacing, headerHeight + contentPadding + spacing)
    }
  }

  onTranslateBinding(binding: CCSlideLayoutBinding, draggedShape: CCSlideShape, point: Vec): boolean {
    const slideshow = this.editor.getShape<CCSlideShowShape>(binding.fromId)
    if (!slideshow) return false

    const { index } = this.getInsertPosition(slideshow, draggedShape, point)
    const newIndex = `a${String(index + 1).padStart(3, '0')}` as IndexKey

    this.editor.updateBinding({
      id: binding.id,
      type: 'cc-slide-layout',
      fromId: binding.fromId,
      toId: binding.toId,
      props: { index: newIndex }
    })

    return true
  }

  override onAfterCreate({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterCreate', { binding })
    this.updateSlidePosition(binding)
    this.updateSlideshowSize(binding.fromId)
  }

  override onAfterChange({ bindingAfter }: { bindingAfter: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterChange', { bindingAfter })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(bindingAfter.fromId)
    if (!slideshow) return

    this.updateSlidePosition(bindingAfter)
    this.updateSlideshowSize(bindingAfter.fromId)
  }

  override onAfterChangeFromShape({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterChangeFromShape', { binding })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(binding.fromId)
    if (!slideshow) return

    this.updateSlidePosition(binding)
    this.updateSlideshowSize(binding.fromId)
  }

  override onAfterDelete({ binding }: { binding: CCSlideLayoutBinding }): void {
    logger.debug('binding', '✅ onAfterDelete', { binding })
    // Check if the slideshow still exists
    const slideshow = this.editor.getShape<CCSlideShowShape>(binding.fromId)
    if (!slideshow) return

    this.updateSlideshowSize(binding.fromId)
  }
} 