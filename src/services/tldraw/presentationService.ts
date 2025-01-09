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
    private zoomLevels = new Map<string, number>() // Track zoom levels by shape dimensions
    private isMoving = false

    constructor(editor: Editor) {
        this.editor = editor
        logger.debug('system', '🎥 PresentationService initialized')
    }

    private getShapeDimensionKey(width: number, height: number): string {
        return `${Math.round(width)}_${Math.round(height)}`
    }

    private async moveToShape(shape: CCSlideShape | CCSlideShowShape): Promise<void> {
        if (this.isMoving) {
            logger.debug('presentation', '⏳ Movement in progress, queueing next movement')
            // Wait for current movement to complete
            await new Promise(resolve => setTimeout(resolve, 100))
            return this.moveToShape(shape)
        }

        this.isMoving = true
        const bounds = this.editor.getShapePageBounds(shape.id)
        if (!bounds) {
            logger.warn('presentation', '⚠️ Could not get bounds for shape')
            this.isMoving = false
            return
        }

        try {
            // Phase 1: Update proxy shape instantly
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

            // Wait for a frame to ensure bounds are updated
            await new Promise(resolve => requestAnimationFrame(resolve))

            // Phase 2: Calculate and apply camera movement
            const viewport = this.editor.getViewportPageBounds()
            const padding = 32
            const dimensionKey = this.getShapeDimensionKey(bounds.width, bounds.height)
            
            // Get existing zoom level for this shape size or calculate new one
            let targetZoom = this.zoomLevels.get(dimensionKey)
            if (!targetZoom) {
                targetZoom = Math.min(
                    (viewport.width - padding * 2) / bounds.width,
                    (viewport.height - padding * 2) / bounds.height
                )
                this.zoomLevels.set(dimensionKey, targetZoom)
                logger.debug('presentation', '📏 New zoom level calculated', { 
                    dimensions: dimensionKey, 
                    zoom: targetZoom 
                })
            }

            // Stop any existing camera movement
            this.editor.stopCameraAnimation()

            // Move camera to new position
            this.editor.zoomToBounds(bounds, {
                animation: {
                    duration: 500,
                    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                },
                targetZoom,
                inset: padding
            })

            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error) {
            logger.error('presentation', '❌ Error during shape transition', { error })
        } finally {
            this.isMoving = false
        }
    }

    startPresentationMode() {
        logger.info('presentation', '🎥 Starting presentation mode')
        
        // Reset zoom levels on start
        this.zoomLevels.clear()
        
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

                void this.moveToShape(currentSlide)
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
        this.zoomLevels.clear()
        this.isMoving = false
        if (this.editor.getShape(this.cameraProxyId)) {
            this.editor.deleteShape(this.cameraProxyId)
        }
    }

    // Public method to move to any shape (slide or slideshow)
    zoomToShape(shape: CCSlideShape | CCSlideShowShape) {
        void this.moveToShape(shape)
    }
}
