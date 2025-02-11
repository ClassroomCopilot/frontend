import { Editor, TLShape, createShapeId } from '@tldraw/tldraw';
import { logger } from '../../debugConfig';
import { NavigationNode } from '../../types/navigation';
import { NeoShapeService } from '../graph/neoShapeService';
import { NodeData } from '../../types/graph-shape';

export class NodeCanvasService {
    private static readonly CANVAS_PADDING = 100;
    private static readonly ANIMATION_DURATION = 500;
    private static currentAnimation: number | null = null;

    private static findAllNodeShapes(editor: Editor, nodeId: string): TLShape[] {
        const shapes = editor.getCurrentPageShapes();
        return shapes.filter((shape: TLShape) => shape.id.toString().includes(nodeId));
    }

    private static handleMultipleNodeInstances(editor: Editor, nodeId: string, shapes: TLShape[]): TLShape | undefined {
        if (shapes.length > 1) {
            logger.warn('node-canvas', '⚠️ Multiple instances of node found', { 
                nodeId, 
                count: shapes.length,
                shapes: shapes.map(s => s.id)
            });
            // Return the first instance but log a warning for the user
            return shapes[0];
        }
        return shapes[0];
    }

    private static cancelCurrentAnimation(): void {
        if (this.currentAnimation !== null) {
            cancelAnimationFrame(this.currentAnimation);
            this.currentAnimation = null;
        }
    }

    private static animateViewToShape(editor: Editor, shape: TLShape): void {
        // Cancel any existing animation
        this.cancelCurrentAnimation();

        const bounds = editor.getShapePageBounds(shape);
        if (!bounds) {
            logger.warn('node-canvas', '⚠️ Could not get shape bounds', { shapeId: shape.id });
            return;
        }

        // Get the current viewport and camera state
        const viewportBounds = editor.getViewportPageBounds();
        const camera = editor.getCamera();
        const currentPage = editor.getCurrentPage();

        // Calculate the center point of the shape in page coordinates
        const shapeCenterX = bounds.x + bounds.w / 2;
        const shapeCenterY = bounds.y + bounds.h / 2;

        // Calculate where the shape currently appears in the viewport
        const currentViewportCenterX = viewportBounds.x + viewportBounds.w / 2;
        const currentViewportCenterY = viewportBounds.y + viewportBounds.h / 2;

        // Check if the shape is already reasonably centered
        const tolerance = 50; // pixels
        const isAlreadyCentered = 
            Math.abs(shapeCenterX - currentViewportCenterX) < tolerance &&
            Math.abs(shapeCenterY - currentViewportCenterY) < tolerance;

        // Log the current state for debugging
        logger.debug('node-canvas', '📊 Current canvas state', {
            page: {
                id: currentPage.id,
                name: currentPage.name,
                shapes: editor.getCurrentPageShapes().length
            },
            camera: {
                current: camera,
                viewport: viewportBounds
            },
            shape: {
                id: shape.id,
                bounds,
                center: { x: shapeCenterX, y: shapeCenterY },
                currentViewportCenter: { x: currentViewportCenterX, y: currentViewportCenterY },
                isAlreadyCentered
            }
        });

        // If the shape is already centered, don't animate
        if (isAlreadyCentered) {
            logger.debug('node-canvas', '✨ Shape is already centered, skipping animation');
            return;
        }

        // Calculate the target camera position to center the shape
        const targetX = camera.x + (currentViewportCenterX - shapeCenterX);
        const targetY = camera.y + (currentViewportCenterY - shapeCenterY);

        const startX = camera.x;
        const startY = camera.y;

        // Force the camera to maintain its current zoom level
        const currentZoom = camera.z;

        // Animate the camera position
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.ANIMATION_DURATION, 1);
            
            // Use easeInOutCubic for smooth animation
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const x = startX + (targetX - startX) * eased;
            const y = startY + (targetY - startY) * eased;

            editor.setCamera({
                ...camera,
                x,
                y,
                z: currentZoom // Maintain zoom level
            });

            if (progress < 1) {
                this.currentAnimation = requestAnimationFrame(animate);
            } else {
                this.currentAnimation = null;
                logger.debug('node-canvas', '✅ Shape centering animation complete', {
                    finalPosition: { x, y, z: currentZoom },
                    shapeCenterPoint: { x: shapeCenterX, y: shapeCenterY }
                });
            }
        };

        this.currentAnimation = requestAnimationFrame(animate);
    }

    static async centerCurrentNode(editor: Editor, node: NavigationNode, nodeData: NodeData): Promise<void> {
        try {
            // Cancel any existing animation before starting
            this.cancelCurrentAnimation();

            const shapes = this.findAllNodeShapes(editor, node.id);
            
            if (shapes.length > 0) {
                const existingShape = this.handleMultipleNodeInstances(editor, node.id, shapes);
                if (existingShape) {
                    // Ensure the shape is actually on the canvas
                    const bounds = editor.getShapePageBounds(existingShape);
                    if (!bounds) {
                        logger.warn('node-canvas', '⚠️ Shape exists but has no bounds', { 
                            nodeId: node.id,
                            shapeId: existingShape.id
                        });
                        return;
                    }

                    this.animateViewToShape(editor, existingShape);
                    logger.debug('node-canvas', '🎯 Centered view on existing shape', { 
                        nodeId: node.id,
                        shapeBounds: bounds
                    });
                }
            } else {
                // Create new shape for the node
                const newShape = await this.createNodeShape(editor, node, nodeData);
                if (newShape) {
                    this.animateViewToShape(editor, newShape);
                    logger.debug('node-canvas', '✨ Created and centered new shape', { nodeId: node.id });
                } else {
                    logger.warn('node-canvas', '⚠️ Could not create or center node shape', { nodeId: node.id });
                }
            }
        } catch (error) {
            this.cancelCurrentAnimation();
            logger.error('node-canvas', '❌ Failed to center node', { 
                nodeId: node.id, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    private static async createNodeShape(editor: Editor, node: NavigationNode, nodeData: NodeData): Promise<TLShape | null> {
        try {
            const viewportBounds = editor.getViewportPageBounds();
            const centerX = viewportBounds.x + viewportBounds.w / 2;
            const centerY = viewportBounds.y + viewportBounds.h / 2;

            // Get shape configuration from NeoShapeService
            const shapeConfig = NeoShapeService.getShapeConfig(node, nodeData, centerX, centerY);
            const shapeId = createShapeId(node.id);

            // Create the shape with the configuration
            editor.createShape<TLShape>({
                id: shapeId,
                ...shapeConfig
            });

            return editor.getShape(shapeId) || null;
        } catch (error) {
            logger.error('node-canvas', '❌ Failed to create node shape', { 
                nodeId: node.id, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
            return null;
        }
    }
} 