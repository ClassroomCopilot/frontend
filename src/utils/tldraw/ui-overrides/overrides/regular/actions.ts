import { TLUiOverrides, computed } from '@tldraw/tldraw'
import { getSlidesFromPage, moveToSlide, $currentSlide, $currentSlideShow, getSlideShowsFromPage, moveToSlideShow } from '../../../slides/useSlides'
import { SlideShape, SlideShowShape } from '../../../slides/SlideShapeUtil'
import { logger } from '../../../../../debugConfig'

export const actionsRegularUiOverrides: TLUiOverrides = {
    actions(editor, actions) {
        // Add debug mode toggle
        actions['toggle-debug-mode'] = {
            id: 'toggle-debug-mode',
            label: 'Toggle Debug Mode',
            kbd: 'ctrl+shift+d',
            readonlyOk: true,
            onSelect() {
                editor.updateInstanceState({ isDebugMode: !editor.getInstanceState().isDebugMode })
            },
        }

        const $slides = computed('slides', () => getSlidesFromPage(editor));
        actions['next-slide'] = {
            id: 'next-slide',
            label: 'Next slide',
            kbd: 'right',
            onSelect() {
                const currentShow = $currentSlideShow.get()
                if (!currentShow) {
                    logger.warn('navigation', '⚠️ No current slideshow found for next-slide action')
                    return
                }

                const nextIndex = (currentShow.props.currentSlideIndex + 1) % currentShow.props.slides.length
                const nextSlide = editor.getShape(currentShow.props.slides[nextIndex]) as SlideShape
                
                if (nextSlide) {
                    logger.info('navigation', '⌨️ Next slide shortcut', {
                        fromIndex: currentShow.props.currentSlideIndex,
                        toIndex: nextIndex,
                        slideId: nextSlide.id,
                        slideshowId: currentShow.id,
                        timestamp: new Date().toISOString()
                    })
                    moveToSlide(editor, nextSlide, true)
                }
            },
        };
        actions['previous-slide'] = {
            id: 'previous-slide',
            label: 'Previous slide',
            kbd: 'left',
            onSelect() {
                const currentShow = $currentSlideShow.get()
                if (!currentShow) {
                    logger.warn('navigation', '⚠️ No current slideshow found for previous-slide action')
                    return
                }

                const prevIndex = (currentShow.props.currentSlideIndex - 1 + currentShow.props.slides.length) % currentShow.props.slides.length
                const prevSlide = editor.getShape(currentShow.props.slides[prevIndex]) as SlideShape
                
                if (prevSlide) {
                    logger.info('navigation', '⌨️ Previous slide shortcut', {
                        fromIndex: currentShow.props.currentSlideIndex,
                        toIndex: prevIndex,
                        slideId: prevSlide.id,
                        slideshowId: currentShow.id,
                        timestamp: new Date().toISOString()
                    })
                    moveToSlide(editor, prevSlide, true)
                }
            },
        };
        const $slideshows = computed('slideshows', () => getSlideShowsFromPage(editor));
        actions['next-slideshow'] = {
            id: 'next-slideshow',
            label: 'Next slide',
            kbd: 'ctrl+right',
            onSelect() {
                console.log('next-slideshow')
                const slideshows = $slideshows.get();
                const currentSlideshow = $currentSlideShow.get();
                const index = slideshows.findIndex((s) => s.id === currentSlideshow?.id);
                const nextSlideshow = slideshows[index + 1] ?? currentSlideshow ?? slideshows[0];
                if (nextSlideshow) {
                    editor.stopCameraAnimation();
                    moveToSlideShow(editor, nextSlideshow);
                }
            },
        };
        actions['previous-slideshow'] = {
            id: 'previous-slideshow',
            label: 'Previous slideshow',
            kbd: 'ctrl+left',
            onSelect() {
                console.log('previous-slideshow')
                const slideshows = $slideshows.get();
                const currentSlideshow = $currentSlideShow.get();
                const index = slideshows.findIndex((s) => s.id === currentSlideshow?.id);
                const previousSlideshow = slideshows[index - 1] ?? currentSlideshow ?? slideshows[slideshows.length - 1];
                if (previousSlideshow) {
                    editor.stopCameraAnimation();
                    moveToSlideShow(editor, previousSlideshow);
                }
            },
        };
        return actions;
    }
};