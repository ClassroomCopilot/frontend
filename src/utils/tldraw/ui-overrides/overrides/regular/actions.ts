import { TLUiOverrides, computed } from '@tldraw/tldraw'
import { 
    moveToSlide, 
    $currentSlideShow, 
    getSlideShowsFromPage, 
    moveToSlideShow 
} from '../../../cc-base/cc-slideshow/useSlideShow'
import { CCSlideShape } from '../../../cc-base/cc-slideshow/CCSlideShapeUtil'
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

        // Navigation actions
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
                const nextSlide = editor.getShape(currentShow.props.slides[nextIndex]) as CCSlideShape
                
                if (nextSlide) {
                    logger.info('navigation', '⌨️ Next slide shortcut', {
                        fromIndex: currentShow.props.currentSlideIndex,
                        toIndex: nextIndex,
                        slideId: nextSlide.id,
                        slideshowId: currentShow.id,
                        timestamp: new Date().toISOString()
                    })
                    moveToSlide(editor, nextSlide)
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
                const prevSlide = editor.getShape(currentShow.props.slides[prevIndex]) as CCSlideShape
                
                if (prevSlide) {
                    logger.info('navigation', '⌨️ Previous slide shortcut', {
                        fromIndex: currentShow.props.currentSlideIndex,
                        toIndex: prevIndex,
                        slideId: prevSlide.id,
                        slideshowId: currentShow.id,
                        timestamp: new Date().toISOString()
                    })
                    moveToSlide(editor, prevSlide)
                }
            },
        };

        const $slideshows = computed('slideshows', () => getSlideShowsFromPage(editor));
        
        actions['next-slideshow'] = {
            id: 'next-slideshow',
            label: 'Next slideshow',
            kbd: 'ctrl+right',
            onSelect() {
                const slideshows = $slideshows.get();
                const currentSlideshow = $currentSlideShow.get();
                const index = slideshows.findIndex((show) => show.id === currentSlideshow?.id);
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
                const slideshows = $slideshows.get();
                const currentSlideshow = $currentSlideShow.get();
                const index = slideshows.findIndex((show) => show.id === currentSlideshow?.id);
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