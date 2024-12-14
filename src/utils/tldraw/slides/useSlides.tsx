// External imports
import { Editor, atom, useEditor, useValue, createShapeId, TLShapeId, IndexKey, createBindingId } from '@tldraw/tldraw'
// Local imports
import { SlideShape, SlideShowShape, defaultPresentationProps } from './SlideShapeUtil'
import { logger } from '../../../debugConfig'

export const $currentSlideShow = atom<SlideShowShape | null>('current slideshow', null)
export const $currentSlide = atom<SlideShape | null>('current slide', null)

export function arrangeSlides(editor: Editor, slideshow: SlideShowShape) {
	const { slides, slidePattern } = slideshow.props
	const slideShapes = slides
		.map(id => editor.getShape(id as TLShapeId))
		.filter((shape): shape is SlideShape => shape?.type === 'slide')
	
	const gap = 50
	switch (slidePattern) {
		case 'horizontal':
			slideShapes.forEach((slide, i) => {
				editor.updateShape<SlideShape>({
					id: slide.id,
					type: 'slide',
					x: i * (slide.props.w + gap),
					y: 0,
				})
			})
			break
		case 'vertical':
			slideShapes.forEach((slide, i) => {
				editor.updateShape<SlideShape>({
					id: slide.id,
					type: 'slide',
					x: 0,
					y: i * (slide.props.h + gap),
				})
			})
			break
		case 'grid':
			const cols = Math.ceil(Math.sqrt(slideShapes.length))
			slideShapes.forEach((slide, i) => {
				const row = Math.floor(i / cols)
				const col = i % cols
				editor.updateShape<SlideShape>({
					id: slide.id,
					type: 'slide',
					x: col * (slide.props.w + gap),
					y: row * (slide.props.h + gap),
				})
			})
			break
		case 'radial':
			const baseRadius = 200
			const radius = baseRadius + (slideShapes.length - 1) * 20
			const angleStep = (2 * Math.PI) / slideShapes.length
			slideShapes.forEach((slide, i) => {
				const angle = angleStep * i
				editor.updateShape<SlideShape>({
					id: slide.id,
					type: 'slide',
					x: radius * Math.cos(angle),
					y: radius * Math.sin(angle),
				})
			})
			break
	}
}

export function useSlideShows() {
	const editor = useEditor()
	return useValue<SlideShowShape[]>('slideshow shapes', () => getSlideShowsFromPage(editor), [editor])
}

export function useSlides() {
	const editor = useEditor()
	return useValue<SlideShape[]>('slide shapes', () => getSlidesFromPage(editor), [editor])
}

export function useCurrentSlide() {
	return useValue($currentSlide)
}

export function getCurrentSlideId(editor: Editor): string | undefined {
	const slides = getSlidesFromPage(editor)
	const currentSlide = slides.find(s => s.props.isCurrentSlide)
	if (currentSlide) {
		return currentSlide.id
	}
	return undefined
}

// Add helper functions for labels
export function getSlideLabel(slide: SlideShape, index: number) {
    return `Slide ${index + 1} (${slide.id})`
}

export function getSlidesFromPage(editor: Editor) {
	return editor
		.getSortedChildIdsForParent(editor.getCurrentPageId())
		.map((id) => editor.getShape(id))
		.filter((s) => s?.type === 'slide') as SlideShape[]
}

export function moveToSlide(editor: Editor, slide: SlideShape, isPresentation: boolean = false) {
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
        editor.updateShape<SlideShowShape>({
            id: parentSlideshow.id,
            type: 'slideshow',
            props: {
                ...parentSlideshow.props,
                currentSlideIndex: slideIndex
            }
        })

        // Only update UI atoms if not in presentation mode
        if (!isPresentation) {
            logger.debug('selection', '🔄 Updating UI state atoms', {
                previousSlide: $currentSlide.get()?.id,
                newSlide: slide.id,
                previousSlideshow: $currentSlideShow.get()?.id,
                newSlideshow: parentSlideshow.id
            })
            
            $currentSlide.set(slide)
            $currentSlideShow.set(parentSlideshow)

            // Move camera for non-presentation mode
            const bounds = editor.getShapePageBounds(slide.id)
            if (bounds) {
                logger.debug('camera', '🎥 Moving camera (non-presentation)', {
                    slideId: slide.id,
                    bounds
                })
                
                editor.zoomToBounds(bounds, { 
                    animation: { duration: 500 }, 
                    inset: 0,
                    targetZoom: 1
                })
            }
        }
    })
    logger.info('navigation', '✅ Slide transition complete', {
        slideId: slide.id,
        slideIndex,
        slideshowId: parentSlideshow.id
    })
}

export function createSlideShowFromTemplate(
	editor: Editor, 
	pattern: SlideShowShape['props']['slidePattern'],
	defaults: {
		slideCount: number | undefined,
		slideWidth: number | undefined,
		slideHeight: number | undefined,
	}
) {
	console.log('Creating slideshow with pattern:', pattern);
	const slideshowId = createShapeId()
	const slideCount = defaults.slideCount || defaultPresentationProps.slideCount
	const slideWidth = defaults.slideWidth || defaultPresentationProps.slideWidth
	const slideHeight = defaults.slideHeight || defaultPresentationProps.slideHeight
	const gap = defaultPresentationProps.SLIDE_GAP

	// Calculate initial slideshow dimensions based on pattern
	let slideshowWidth = 0
	let slideshowHeight = 0
	
	switch(pattern) {
		case 'horizontal':
			slideshowWidth = (slideWidth * slideCount) + (gap * (slideCount - 1)) + (gap * 2)
			slideshowHeight = slideHeight + (gap * 2)
			break
		case 'vertical':
			slideshowWidth = slideWidth + (gap * 2)
			slideshowHeight = (slideHeight * slideCount) + (gap * (slideCount - 1)) + (gap * 2)
			break
		// Other patterns...
	}

	// Create all slides first and collect their IDs
	const slideIds: TLShapeId[] = Array.from({ length: slideCount }, (_, i) => {
		const slideId = createShapeId()
		
		// Calculate initial position based on pattern
		let x = gap
		let y = gap
		
		switch(pattern) {
			case 'horizontal':
				x += i * (slideWidth + gap)
				break
			case 'vertical':
				y += i * (slideHeight + gap)
				break
			// Other patterns...
		}

		// Create slide
		editor.createShape<SlideShape>({
			id: slideId,
			type: 'slide',
			x,
			y,
			props: {
				w: slideWidth,
				h: slideHeight,
				isCurrentSlide: i === 0,
				parentId: slideshowId,
				slideIndex: i,
			},
		})

		return slideId
	})

	// Create slideshow with collected slide IDs
	editor.createShape<SlideShowShape>({
		id: slideshowId,
		type: 'slideshow',
		x: 0,
		y: 0,
		props: {
			w: slideshowWidth,
			h: slideshowHeight,
			slidePattern: pattern,
			slideCount,
			slides: slideIds, // Use the complete array of slide IDs
			isCurrentSlideshow: false,
			autoAdvance: false,
			advanceInterval: 5000,
			slideShowIndex: getSlideShowsFromPage(editor).length + 1,
		},
	})

	// Create bindings after both slideshow and slides exist
	slideIds.forEach((slideId, i) => {
		editor.createBinding({
			id: createBindingId(),
			type: 'slide-layout',
			fromId: slideshowId,
			toId: slideId,
			props: {
				index: `a${i}` as IndexKey,
				placeholder: false,
			},
		})
	})

	// Move camera to show the new slideshow
	const bounds = editor.getShapePageBounds(slideshowId)
	if (bounds) {
		editor.zoomToBounds(bounds, {
			animation: { duration: 400 },
			inset: 50,
		})
	}

	return slideshowId
}

export function useCurrentSlideShow() {
	return useValue($currentSlideShow)
}

export function getCurrentSlideShowId(editor: Editor): string | undefined {
	const slideshows = getSlideShowsFromPage(editor)
	const currentSlideshow = slideshows.find(s => s.props.isCurrentSlideshow)
	if (currentSlideshow) {
		return currentSlideshow.id
	}
	console.log('No current slideshow found')
	return undefined
}

export function getSlideShowLabel(slideshow: SlideShowShape, index: number) {
    return `Slide Show ${index + 1} (${slideshow.id})`
}

export function getSlideShowsFromPage(editor: Editor) {
	return editor
		.getSortedChildIdsForParent(editor.getCurrentPageId())
		.map((id) => editor.getShape(id))
		.filter((s) => s?.type === 'slideshow') as SlideShowShape[]
}

export function moveToSlideShow(editor: Editor, slideshow: SlideShowShape) {
	console.log('Moving to slideshow:', slideshow.id)
	const bounds = editor.getShapePageBounds(slideshow.id)
	if (!bounds) {
		return
	}

	// Update the current slideshow atom
	$currentSlideShow.set(slideshow)

	// Update all slideshows' isCurrentSlideshow property
	const allSlideshows = getSlideShowsFromPage(editor)
	editor.run(() => {
		allSlideshows.forEach((s) => {
			editor.updateShape<SlideShowShape>({
				id: s.id,
				type: 'slideshow',
				props: {
					...s.props,
					isCurrentSlideshow: s.id === slideshow.id
				}
			})
		})
	})

	// Camera animation using zoomToBounds
	editor.zoomToBounds(bounds, { 
		animation: { duration: 400 }, 
		inset: 0,
		targetZoom: 1
	})
}
