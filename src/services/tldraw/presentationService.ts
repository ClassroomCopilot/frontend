import { Editor, TLStoreEventInfo, createShapeId, TLShape } from '@tldraw/tldraw'
import { logger } from '../../debugConfig'
import { SlideShape, SlideShowShape } from '../../utils/tldraw/slides/SlideShapeUtil'

export class PresentationService {
    private editor: Editor
    private initialSlideshow: SlideShowShape | null = null
    private cameraProxyId = createShapeId('camera-proxy')

    constructor(editor: Editor) {
        this.editor = editor
        logger.debug('system', '🎥 PresentationService initialized', { 
            editorId: editor.store.id,
            storeExists: !!editor.store
        })
    }

    startPresentationMode() {
        logger.info('presentation', '🎥 Starting presentation mode', {
            editorId: this.editor.store.id,
            currentPage: this.editor.getCurrentPageId()
        })
        
        // Find initial slideshow to track
        const slideshows = this.editor.getSortedChildIdsForParent(this.editor.getCurrentPageId())
            .map(id => this.editor.getShape(id))
            .filter(shape => shape?.type === 'cc-slideshow')

        logger.debug('presentation', '🔍 Found slideshows', {
            count: slideshows.length,
            ids: slideshows.map(s => s?.id)
        })

        if (slideshows.length === 0) {
            logger.warn('presentation', '⚠️ No slideshows found')
            return () => {}
        }

        this.initialSlideshow = slideshows[0] as SlideShowShape
        logger.info('presentation', '🎯 Tracking slideshow', { 
            slideshowId: this.initialSlideshow.id,
            currentIndex: this.initialSlideshow.props.currentSlideIndex,
            slideCount: this.initialSlideshow.props.slides.length
        })

        // Create camera proxy shape if it doesn't exist
        if (!this.editor.getShape(this.cameraProxyId)) {
            logger.debug('camera', '🎥 Creating camera proxy shape')
            this.editor.createShape({
                id: this.cameraProxyId,
                type: 'frame',
                x: 0,
                y: 0,
                props: {
                    w: 1,
                    h: 1,
                    name: 'camera-proxy'
                }
            })
        }

        const handleStoreChange = (event: TLStoreEventInfo) => {
            logger.debug('presentation', '📝 Store change received', {
                source: event.source,
                changesExist: !!event.changes,
                updatesExist: !!event.changes.updated,
                changeTypes: Object.keys(event.changes),
                isRemote: event.source === 'remote',
                isUser: event.source === 'user'
            })

            if (!event.changes.updated) {
                logger.debug('presentation', '⏭️ No updates in change event')
                return
            }

            // Log all changes for debugging
            for (const [from, to] of Object.values(event.changes.updated)) {
                logger.debug('presentation', '🔄 Examining change', {
                    fromType: from.typeName,
                    toType: to.typeName,
                    fromShapeType: (from as TLShape).type,
                    toShapeType: (to as TLShape).type
                })

                // Check if it's a shape first
                if (from.typeName !== 'shape' || to.typeName !== 'shape') {
                    logger.debug('presentation', '⏭️ Not a shape change')
                    continue
                }

                const fromShape = from as TLShape
                const toShape = to as TLShape

                // Check if it's our slideshow
                if (fromShape.type !== 'slideshow' || toShape.type !== 'slideshow') {
                    logger.debug('presentation', '⏭️ Not a slideshow change')
                    continue
                }

                if (!this.initialSlideshow || fromShape.id !== this.initialSlideshow.id) {
                    logger.debug('presentation', '⏭️ Not our tracked slideshow', {
                        changeId: fromShape.id,
                        trackedId: this.initialSlideshow?.id
                    })
                    continue
                }

                const fromShow = fromShape as SlideShowShape
                const toShow = toShape as SlideShowShape

                logger.debug('presentation', '🔍 Examining slideshow change', {
                    fromIndex: fromShow.props.currentSlideIndex,
                    toIndex: toShow.props.currentSlideIndex,
                    slidesCount: toShow.props.slides.length
                })

                // Check if currentSlideIndex changed
                if (fromShow.props.currentSlideIndex !== toShow.props.currentSlideIndex) {
                    logger.info('presentation', '🔄 Slideshow index changed', {
                        from: fromShow.props.currentSlideIndex,
                        to: toShow.props.currentSlideIndex,
                        slideshowId: toShow.id,
                        isRemote: event.source === 'remote',
                        currentCamera: {
                            x: this.editor.getCamera().x,
                            y: this.editor.getCamera().y,
                            z: this.editor.getCamera().z
                        }
                    })

                    const currentSlide = this.editor.getShape(
                        toShow.props.slides[toShow.props.currentSlideIndex]
                    ) as SlideShape

                    if (currentSlide) {
                        const bounds = this.editor.getShapePageBounds(currentSlide.id)
                        if (bounds) {
                            logger.info('camera', '🎥 Moving camera to slide', {
                                slideId: currentSlide.id,
                                bounds,
                                currentZoom: this.editor.getZoomLevel(),
                                currentCamera: this.editor.getCamera(),
                                slidePosition: {
                                    x: currentSlide.x,
                                    y: currentSlide.y
                                }
                            })

                            // Stop any existing camera movement
                            this.editor.stopCameraAnimation()
                            logger.debug('camera', '⏹️ Stopped existing camera animation')

                            try {
                                // First try to animate the proxy shape
                                logger.debug('camera', '🎯 Animating proxy shape', {
                                    proxyId: this.cameraProxyId,
                                    targetX: bounds.center.x,
                                    targetY: bounds.center.y
                                })

                                this.editor.animateShape(
                                    {
                                        id: this.cameraProxyId,
                                        type: 'frame',
                                        x: bounds.center.x,
                                        y: bounds.center.y,
                                    },
                                    {
                                        animation: {
                                            duration: 500,
                                            easing: (t) => {
                                                return t < 0.5 
                                                    ? 4 * t * t * t 
                                                    : 1 - Math.pow(-2 * t + 2, 3) / 2
                                            }
                                        }
                                    }
                                )

                                // Then try to move the camera
                                logger.debug('camera', '🎥 Attempting camera movement', {
                                    targetBounds: bounds,
                                    targetZoom: 1
                                })

                                this.editor.zoomToBounds(bounds, {
                                    animation: { duration: 500 },
                                    targetZoom: 1,
                                    inset: 0,
                                    force: true,
                                    immediate: true
                                })

                                logger.info('camera', '✅ Camera movement completed')

                            } catch (error) {
                                logger.error('camera', '❌ Error during camera movement', {
                                    error,
                                    slideId: currentSlide.id,
                                    bounds
                                })
                            }

                            // Verify final camera position
                            setTimeout(() => {
                                const finalCamera = this.editor.getCamera()
                                logger.debug('camera', '📍 Final camera position', {
                                    camera: finalCamera,
                                    expectedCenter: bounds.center,
                                    actualZoom: this.editor.getZoomLevel()
                                })
                            }, 600)

                        } else {
                            logger.warn('camera', '⚠️ Could not get bounds for slide', {
                                slideId: currentSlide.id,
                                slideExists: !!currentSlide,
                                slideProps: currentSlide.props
                            })
                        }
                    } else {
                        logger.warn('presentation', '⚠️ Could not find slide at index', {
                            index: toShow.props.currentSlideIndex,
                            availableSlides: toShow.props.slides,
                            slideshowId: toShow.id
                        })
                    }
                }
            }
        }

        const cleanup = () => {
            logger.info('presentation', '🧹 Running presentation mode cleanup')
            
            // Remove store listener
            storeCleanup()

            // Clean up proxy shape
            if (this.editor.getShape(this.cameraProxyId)) {
                logger.debug('camera', '🗑️ Removing camera proxy shape')
                this.editor.deleteShape(this.cameraProxyId)
            }

            // Log final state
            logger.debug('presentation', '📊 Final presentation state', {
                camera: this.editor.getCamera(),
                zoom: this.editor.getZoomLevel(),
                currentSlideshow: this.initialSlideshow?.id
            })
        }

        const storeCleanup = this.editor.store.listen(handleStoreChange, { 
            source: 'all',
            scope: 'document'
        })

        // Move to initial slide
        const currentSlide = this.editor.getShape(
            this.initialSlideshow.props.slides[this.initialSlideshow.props.currentSlideIndex]
        ) as SlideShape

        if (currentSlide) {
            logger.info('presentation', '📍 Moving to initial slide', {
                slideId: currentSlide.id,
                index: this.initialSlideshow.props.currentSlideIndex
            })

            const bounds = this.editor.getShapePageBounds(currentSlide.id)
            if (bounds) {
                this.editor.zoomToBounds(bounds, {
                    animation: { duration: 500 },
                    inset: 0,
                    targetZoom: 1
                })
            }
        }

        return cleanup
    }

    stopPresentationMode() {
        logger.info('system', '⏹️ Stopping presentation mode', {
            editorId: this.editor.store.id
        })
        
        // Clean up camera proxy
        if (this.editor.getShape(this.cameraProxyId)) {
            this.editor.deleteShape(this.cameraProxyId)
        }
        
        this.initialSlideshow = null
    }
}
