import { 
  BindingUtil,
  TLBaseBinding,
  IndexKey,
  BindingOnCreateOptions,
  BindingOnChangeOptions,
  BindingOnShapeChangeOptions,
  BindingOnDeleteOptions,
  TLShapeId,
} from '@tldraw/tldraw'
import { SlideShowShape, SlideShape, defaultPresentationProps } from './SlideShapeUtil'
import { logger } from '../../../debugConfig'

const { SLIDE_GAP } = defaultPresentationProps

export type SlideLayoutBinding = TLBaseBinding<
  'slide-layout',
  {
    index: IndexKey
    placeholder: boolean
  }
>

export class SlideLayoutBindingUtil extends BindingUtil<SlideLayoutBinding> {
  static type = 'slide-layout' as const
  
  private updateSlidesForSlideShow(binding: SlideLayoutBinding) {
    if (binding.props.placeholder) {
      logger.debug('binding', '⏭️ Skipping update for placeholder binding')
      return
    }

    const maybeSlideshow = this.editor.getShape(binding.fromId)
    if (!maybeSlideshow || maybeSlideshow.type !== 'slideshow') {
      logger.warn('binding', '⚠️ Invalid slideshow shape', {
        shapeId: binding.fromId,
        shapeType: maybeSlideshow?.type
      })
      return
    }
    const slideshow = maybeSlideshow as SlideShowShape

    logger.info('binding', '📊 Updating slides for slideshow', {
      slideshowId: slideshow.id,
      slideOrder: slideshow.props.slides,
      slideCount: slideshow.props.slides.length,
      pattern: slideshow.props.slidePattern
    })

    this.editor.batch(() => {
      const {slides, slidePattern} = slideshow.props
      const slideCount = slides.length
      
      // Get dimensions of first slide to use as reference
      const firstSlide = this.editor.getShape(slides[0]) as SlideShape
      if (!firstSlide) {
        return
      }
      
      const slideWidth = firstSlide.props.w
      const slideHeight = firstSlide.props.h

      // Calculate new slideshow dimensions based on pattern
      let newWidth = slideshow.props.w
      let newHeight = slideshow.props.h

      switch (slidePattern) {
        case 'horizontal':
          newWidth = SLIDE_GAP + (slideWidth + SLIDE_GAP) * slideCount
          newHeight = SLIDE_GAP * 2 + slideHeight
          break

        case 'vertical':
          newWidth = SLIDE_GAP * 2 + slideWidth
          newHeight = SLIDE_GAP + (slideHeight + SLIDE_GAP) * slideCount
          break

        case 'grid': {
          const cols = Math.ceil(Math.sqrt(slideCount))
          const rows = Math.ceil(slideCount / cols)
          newWidth = SLIDE_GAP + (slideWidth + SLIDE_GAP) * cols
          newHeight = SLIDE_GAP + (slideHeight + SLIDE_GAP) * rows
          break
        }

        case 'radial': {
          const radius = Math.max(slideWidth, slideHeight) * 1.5
          // Make the slideshow large enough to contain the circle
          newWidth = radius * 4
          newHeight = radius * 4
          break
        }
      }

      // Update slideshow dimensions first
      if (slidePattern !== 'freeform') {
        this.editor.updateShape<SlideShowShape>({
          id: slideshow.id,
          type: 'frame',
          props: {
            ...slideshow.props,
            w: newWidth,
            h: newHeight
          }
        })
      }

      // Then update slide positions
      slides.forEach((slideId: TLShapeId, index: number) => {
        const maybeSlide = this.editor.getShape(slideId)
        if (!maybeSlide || maybeSlide.type !== 'slide') {
          logger.warn('binding', '⚠️ Invalid slide shape', {
            slideId,
            shapeType: maybeSlide?.type
          })
          return
        }
        const slide = maybeSlide as SlideShape

        // Calculate position based on pattern
        let newPosition: { x: number; y: number }

        switch (slidePattern) {
          case 'horizontal':
            newPosition = {
              x: slideshow.x + SLIDE_GAP + index * (slide.props.w + SLIDE_GAP),
              y: slideshow.y + SLIDE_GAP
            }
            break

          case 'vertical':
            newPosition = {
              x: slideshow.x + SLIDE_GAP,
              y: slideshow.y + SLIDE_GAP + index * (slide.props.h + SLIDE_GAP)
            }
            break

          case 'grid': {
            const cols = Math.ceil(Math.sqrt(slideCount))
            const row = Math.floor(index / cols)
            const col = index % cols
            newPosition = {
              x: slideshow.x + SLIDE_GAP + col * (slide.props.w + SLIDE_GAP),
              y: slideshow.y + SLIDE_GAP + row * (slide.props.h + SLIDE_GAP)
            }
            break
          }

          case 'radial': {
            const radius = Math.max(slide.props.w, slide.props.h) * 1.5
            const angleStep = (2 * Math.PI) / slideCount
            const angle = index * angleStep - Math.PI / 2 // Start from top
            newPosition = {
              x: slideshow.x + newWidth/2 + radius * Math.cos(angle),
              y: slideshow.y + newHeight/2 + radius * Math.sin(angle)
            }
            break
          }

          default: // freeform
            return // Don't update position for freeform arrangement
        }

        logger.trace('binding', '🔄 Updating slide position', {
          slideId: slide.id,
          index,
          currentPosition: { x: slide.x, y: slide.y },
          newPosition,
          slideshowDimensions: { w: newWidth, h: newHeight }
        })

        this.editor.updateShape({
          id: slideId,
          type: 'slide',
          x: newPosition.x,
          y: newPosition.y,
          props: {
            ...slide.props,
            slideIndex: index
          }
        })
      })
    })
  }

  getDefaultProps() {
    return {
      index: 'a1' as IndexKey,
      placeholder: true,
    }
  }

  onAfterCreate({ binding }: BindingOnCreateOptions<SlideLayoutBinding>): void {
    logger.info('binding', '🆕 BINDING CREATED', {
      bindingId: binding.id,
      fromId: binding.fromId,
      toId: binding.toId
    })
    this.updateSlidesForSlideShow(binding)
  }

  onAfterChange({ bindingAfter }: BindingOnChangeOptions<SlideLayoutBinding>): void {
    logger.info('binding', '♻️ BINDING CHANGED', {
      bindingId: bindingAfter.id,
      fromId: bindingAfter.fromId,
      toId: bindingAfter.toId,
      props: bindingAfter.props
    })
    this.updateSlidesForSlideShow(bindingAfter)
  }

  onAfterChangeFromShape({ binding }: BindingOnShapeChangeOptions<SlideLayoutBinding>): void {
    logger.info('binding', '🔄 BINDING SHAPE CHANGED', {
      bindingId: binding.id,
      fromId: binding.fromId,
      toId: binding.toId
    })
    this.updateSlidesForSlideShow(binding)
  }

  onAfterDelete({ binding }: BindingOnDeleteOptions<SlideLayoutBinding>): void {
    logger.info('binding', '❌ BINDING DELETED', binding)
    const maybeSlideshow = this.editor.getShape(binding.fromId)
    if (!maybeSlideshow || maybeSlideshow.type !== 'slideshow') {
      return
    }
    const slideshow = maybeSlideshow as SlideShowShape
    
    // Remove the slide from the slideshow's slides array
    const newSlides = slideshow.props.slides.filter((id: TLShapeId) => id !== binding.toId)
    
    this.editor.updateShape<SlideShowShape>({
      id: slideshow.id,
      type: 'frame',
      props: {
        ...slideshow.props,
        slides: newSlides
      }
    })

    // Update remaining slides' positions
    this.updateSlidesForSlideShow({
      ...binding,
      props: { ...binding.props, placeholder: false }
    })
  }
} 