import { Editor, atom, useEditor, useValue } from '@tldraw/tldraw'
import { CCSlideShowShape } from './CCSlideShowShapeUtil'
import { CCSlideShape } from './CCSlideShapeUtil'
import { logger } from '../../../../debugConfig'

// Atoms for tracking current slideshow and slide
export const $currentSlideShow = atom<CCSlideShowShape | null>('current slideshow', null)
export const $currentSlide = atom<CCSlideShape | null>('current slide', null)

// Helper functions for getting slides and slideshows
export function getSlidesFromPage(editor: Editor) {
  return editor
    .getSortedChildIdsForParent(editor.getCurrentPageId())
    .map((id) => editor.getShape(id))
    .filter((s): s is CCSlideShape => s?.type === 'cc-slide')
}

export function getSlideShowsFromPage(editor: Editor) {
  return editor
    .getSortedChildIdsForParent(editor.getCurrentPageId())
    .map((id) => editor.getShape(id))
    .filter((s): s is CCSlideShowShape => s?.type === 'cc-slideshow')
}

// Hooks for accessing slides and slideshows
export function useSlideShows() {
  const editor = useEditor()
  return useValue<CCSlideShowShape[]>('slideshow shapes', () => getSlideShowsFromPage(editor), [editor])
}

export function useSlides() {
  const editor = useEditor()
  return useValue<CCSlideShape[]>('slide shapes', () => getSlidesFromPage(editor), [editor])
}

export function useCurrentSlide() {
  return useValue($currentSlide)
}

export function useCurrentSlideShow() {
  return useValue($currentSlideShow)
}

// Navigation functions
export function moveToSlide(editor: Editor, slide: CCSlideShape, isPresentation: boolean = false) {
  logger.info('navigation', '🎯 Moving to slide', {
    slideId: slide.id,
    currentProps: slide.props,
    isPresentation,
    timestamp: new Date().toISOString()
  })

  // Find the parent slideshow
  const slideshows = getSlideShowsFromPage(editor)
  const parentSlideshow = slideshows.find(show => 
    show.props.slides.includes(slide.id)
  )

  if (!parentSlideshow) {
    logger.warn('navigation', '⚠️ No parent slideshow found for slide', { slideId: slide.id })
    return
  }

  // Get the index of this slide in the slideshow
  const slideIndex = parentSlideshow.props.slides.indexOf(slide.id)
  logger.debug('selection', '📍 Current slide position', {
    slideId: slide.id,
    slideIndex,
    slideshowId: parentSlideshow.id,
    totalSlides: parentSlideshow.props.slides.length
  })
  
  editor.batch(() => {
    logger.debug('navigation', '🔄 Starting slide transition', {
      from: parentSlideshow.props.currentSlideIndex,
      to: slideIndex
    })

    // Update the slideshow's currentSlideIndex
    // This will trigger PresentationService's store listener which handles camera updates
    editor.updateShape<CCSlideShowShape>({
      id: parentSlideshow.id,
      type: 'cc-slideshow',
      props: {
        ...parentSlideshow.props,
        currentSlideIndex: slideIndex
      }
    })

    // Update UI atoms for state tracking
    $currentSlide.set(slide)
    $currentSlideShow.set(parentSlideshow)
  })

  logger.info('navigation', '✅ Slide transition complete', {
    slideId: slide.id,
    slideIndex,
    slideshowId: parentSlideshow.id
  })
}

export function moveToSlideShow(editor: Editor, slideshow: CCSlideShowShape, isPresentation: boolean = false) {
  logger.info('navigation', '🎯 Moving to slideshow', {
    slideshowId: slideshow.id,
    currentIndex: slideshow.props.currentSlideIndex,
    isPresentation,
    timestamp: new Date().toISOString()
  })

  // Update current slideshow state
  $currentSlideShow.set(slideshow)
  
  // Move to the current slide in the slideshow
  const currentSlideId = slideshow.props.slides[slideshow.props.currentSlideIndex]
  const currentSlide = editor.getShape(currentSlideId) as CCSlideShape | undefined
  
  if (currentSlide) {
    moveToSlide(editor, currentSlide, isPresentation)
  } else {
    logger.warn('navigation', '⚠️ Could not find current slide in slideshow', {
      slideshowId: slideshow.id,
      currentSlideId,
      currentIndex: slideshow.props.currentSlideIndex
    })
  }
}

// Helper functions for labels
export function getSlideLabel(slide: CCSlideShape, index: number) {
  return `Slide ${index + 1} (${slide.id})`
}

export function getSlideShowLabel(slideshow: CCSlideShowShape, index: number) {
  return `Slideshow ${index + 1} (${slideshow.id})`
}

// Current ID getters
export function getCurrentSlideId(): string | undefined {
  const currentSlide = $currentSlide.get()
  return currentSlide?.id
}

export function getCurrentSlideShowId(): string | undefined {
  const currentSlideShow = $currentSlideShow.get()
  return currentSlideShow?.id
}
