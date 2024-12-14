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

const SLIDE_GAP = defaultPresentationProps.SLIDE_GAP

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
      slideCount: slideshow.props.slides.length
    })

    this.editor.batch(() => {
      slideshow.props.slides.forEach((slideId: TLShapeId, index: number) => {
        const maybeSlide = this.editor.getShape(slideId)
        if (!maybeSlide || maybeSlide.type !== 'slide') {
          logger.warn('binding', '⚠️ Invalid slide shape', {
            slideId,
            shapeType: maybeSlide?.type
          })
          return
        }
        const slide = maybeSlide as SlideShape

        logger.trace('binding', '🔄 Updating slide position', {
          slideId: slide.id,
          index,
          currentPosition: { x: slide.x, y: slide.y },
          newPosition: {
            x: slideshow.x + SLIDE_GAP + index * (slide.props.w + SLIDE_GAP),
            y: slideshow.y + SLIDE_GAP
          }
        })

        this.editor.updateShape({
          id: slideId,
          type: 'slide',
          x: slideshow.x + SLIDE_GAP + index * (slide.props.w + SLIDE_GAP),
          y: slideshow.y + SLIDE_GAP
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
    if (!maybeSlideshow || maybeSlideshow.type !== 'slideshow') return
    const slideshow = maybeSlideshow as SlideShowShape
    
    // Remove the slide from the slideshow's slides array
    const newSlides = slideshow.props.slides.filter((id: TLShapeId) => id !== binding.toId)
    
    this.editor.updateShape<SlideShowShape>({
      id: slideshow.id,
      type: 'slideshow',
      props: {
        ...slideshow.props,
        slides: newSlides
      }
    })
  }
} 