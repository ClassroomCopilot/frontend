import { Editor, TLStoreEventInfo, createShapeId, TLShape } from '@tldraw/tldraw'
import { logger } from '../../debugConfig'
import { CCSlideShowShape } from '../../utils/tldraw/cc-base/cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShape } from '../../utils/tldraw/cc-base/cc-slideshow/CCSlideShapeUtil'

export class PresentationService {
    private editor: Editor
    private initialSlideshow: CCSlideShowShape | null = null
    private cameraProxyId = createShapeId('camera-proxy')
    private lastUserInteractionTime = 0
    private readonly USER_INTERACTION_DEBOUNCE = 1000 // 1 second

    constructor(editor: Editor) {
        this.editor = editor
        logger.debug('system', '🎥 PresentationService initialized')
    }

    private moveToShape(shape: CCSlideShape | CCSlideShowShape) {
        const bounds = this.editor.getShapePageBounds(shape.id)
        if (!bounds) {
            logger.warn('presentation', '⚠️ Could not get bounds for shape')
            return
        }

        // Stop any existing camera movement
        this.editor.stopCameraAnimation()

        try {
            // Update proxy shape to match shape bounds
            this.editor.updateShape({
                id: this.cameraProxyId,
                type: 'frame',
                x: bounds.minX,
                y: bounds.minY,
                props: {
                    w: bounds.width,
                    h: bounds.height,
                    name: 'camera-proxy',
                    opacity: 0
                }
            })

            // Get viewport and calculate optimal zoom
            const viewport = this.editor.getViewportPageBounds()
            const padding = 32
            const targetZoom = Math.min(
                (viewport.width - padding * 2) / bounds.width,
                (viewport.height - padding * 2) / bounds.height
            )

            // Move camera to new position
            this.editor.zoomToBounds(bounds, {
                animation: {
                    duration: 500,
                    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                },
                targetZoom,
                inset: padding
            })

        } catch (error) {
            logger.error('presentation', '❌ Error during shape transition', { error })
        }
    }

    startPresentationMode() {
        logger.info('presentation', '🎥 Starting presentation mode')
        
        // Find initial slideshow to track
        const slideshows = this.editor.getSortedChildIdsForParent(this.editor.getCurrentPageId())
            .map(id => this.editor.getShape(id))
            .filter(shape => shape?.type === 'cc-slideshow')

        if (slideshows.length === 0) {
            logger.warn('presentation', '⚠️ No slideshows found')
            return () => {}
        }

        this.initialSlideshow = slideshows[0] as CCSlideShowShape

        // Create camera proxy shape if it doesn't exist
        if (!this.editor.getShape(this.cameraProxyId)) {
            this.editor.createShape({
                id: this.cameraProxyId,
                type: 'frame',
                x: 0,
                y: 0,
                props: {
                    w: 1,
                    h: 1,
                    name: 'camera-proxy',
                }
            })
        }

        const handleStoreChange = (event: TLStoreEventInfo) => {
            // Debounce user interaction logs
            if (event.source === 'user') {
                const now = Date.now()
                if (now - this.lastUserInteractionTime > this.USER_INTERACTION_DEBOUNCE) {
                    logger.debug('presentation', '📝 User interaction received')
                    this.lastUserInteractionTime = now
                }
            }

            if (!event.changes.updated) return

            // Only process shape updates
            const shapeUpdates = Object.entries(event.changes.updated)
                .filter(([, [from, to]]) => 
                    from.typeName === 'shape' && 
                    to.typeName === 'shape' &&
                    (from as TLShape).type === 'cc-slideshow' &&
                    (to as TLShape).type === 'cc-slideshow'
                )

            if (shapeUpdates.length === 0) return

            for (const [, [from, to]] of shapeUpdates) {
                const fromShape = from as TLShape
                const toShape = to as TLShape

                if (!this.initialSlideshow || fromShape.id !== this.initialSlideshow.id) continue

                const fromShow = fromShape as CCSlideShowShape
                const toShow = toShape as CCSlideShowShape

                if (fromShow.props.currentSlideIndex === toShow.props.currentSlideIndex) continue

                logger.info('presentation', '🔄 Moving to new slide', {
                    from: fromShow.props.currentSlideIndex,
                    to: toShow.props.currentSlideIndex
                })

                const currentSlide = this.editor.getShape(
                    toShow.props.slides[toShow.props.currentSlideIndex]
                ) as CCSlideShape

                if (!currentSlide) {
                    logger.warn('presentation', '⚠️ Could not find target slide')
                    continue
                }

                this.moveToShape(currentSlide)
            }
        }

        // Set up store listener and get cleanup function
        const storeCleanup = this.editor.store.listen(handleStoreChange)

        // Return cleanup function
        return () => {
            logger.info('presentation', '🧹 Running presentation mode cleanup')
            storeCleanup()
            this.stopPresentationMode()
        }
    }

    stopPresentationMode() {
        if (this.editor.getShape(this.cameraProxyId)) {
            this.editor.deleteShape(this.cameraProxyId)
        }
    }

    // Public method to move to any shape (slide or slideshow)
    zoomToShape(shape: CCSlideShape | CCSlideShowShape) {
        this.moveToShape(shape)
    }
}
