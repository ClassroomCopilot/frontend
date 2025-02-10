import { Editor, TLShape, createShapeId, TLShapeId } from '@tldraw/tldraw';
import { logger } from '../../debugConfig';
import { NavigationNode } from '../../types/navigation';
import { getShapeType, CCNodeTypes, CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { UserNeoDBService } from '../../services/graph/userNeoDBService';
import { formatDate, DateValue } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-shared';

interface ShapeState {
  parentId: TLShapeId | null;
  isPageChild: boolean;
  hasChildren: boolean | null;
  bindings: Record<string, unknown> | null;
}

type NodeData = {
  [K in keyof CCUserNodeProps]: CCUserNodeProps[K];
} & {
  title: string;
  w: number;
  h: number;
  state: ShapeState | null;
  headerColor: string;
  backgroundColor: string;
  isLocked: boolean;
  __primarylabel__: string;
  unique_id: string;
  path: string;
  [key: string]: string | number | boolean | null | ShapeState | undefined;
}

export class NodeCanvasService {
  private static readonly CANVAS_PADDING = 100;
  private static readonly ANIMATION_DURATION = 500;
  private static currentAnimation: number | null = null;

  private static findAllNodeShapes(editor: Editor, nodeId: string): TLShape[] {
    const shapes = editor.getCurrentPageShapes();
    return shapes.filter((shape: TLShape) => shape.id.toString().includes(nodeId));
  }

  private static clearAllNodeShapes(editor: Editor): void {
    const shapes = editor.getCurrentPageShapes();
    const nodeShapes = shapes.filter((shape: TLShape) => 
      // Only clear shapes that are graph nodes (have a unique_id prop)
      shape.props && 'unique_id' in shape.props
    );
    if (nodeShapes.length > 0) {
      editor.deleteShapes(nodeShapes.map(shape => shape.id));
      logger.debug('node-canvas', '🧹 Cleared all node shapes from canvas', {
        count: nodeShapes.length
      });
    }
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

    // Log the animation parameters for debugging
    logger.debug('node-canvas', '🎯 Starting shape centering animation', {
      shape: {
        id: shape.id,
        bounds: {
          x: bounds.x,
          y: bounds.y,
          w: bounds.w,
          h: bounds.h,
          center: { x: shapeCenterX, y: shapeCenterY }
        }
      },
      viewport: {
        w: viewportBounds.w,
        h: viewportBounds.h,
        zoom: camera.z
      },
      camera: {
        start: { x: startX, y: startY, z: camera.z },
        target: { x: targetX, y: targetY }
      }
    });

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
        // Log completion with final state
        logger.debug('node-canvas', '✅ Shape centering animation complete', {
          finalPosition: { x, y, z: currentZoom },
          shapeCenterPoint: { x: shapeCenterX, y: shapeCenterY },
          finalViewport: editor.getViewportPageBounds(),
          finalCamera: editor.getCamera()
        });
      }
    };

    this.currentAnimation = requestAnimationFrame(animate);
  }

  static async centerCurrentNode(editor: Editor, node: NavigationNode): Promise<void> {
    try {
      // Cancel any existing animation before starting
      this.cancelCurrentAnimation();

      // First find if the target node shape already exists
      const shapes = this.findAllNodeShapes(editor, node.id);
      let targetShape: TLShape | null = null;

      if (shapes.length > 0) {
        // Use existing shape if found
        const existingShape = this.handleMultipleNodeInstances(editor, node.id, shapes);
        if (existingShape) {
          targetShape = existingShape;
          // Clear all other node shapes except this one
          const otherShapes = editor.getCurrentPageShapes().filter(shape => 
            shape.props && 
            'unique_id' in shape.props && 
            shape.id !== existingShape.id
          );
          if (otherShapes.length > 0) {
            editor.deleteShapes(otherShapes.map(shape => shape.id));
            logger.debug('node-canvas', '🧹 Cleared other node shapes', {
              keptNodeId: node.id,
              removedCount: otherShapes.length
            });
          }
        }
      } else {
        // If target shape not found, clear all node shapes before creating new one
        this.clearAllNodeShapes(editor);
        targetShape = await this.createNodeShape(editor, node);
      }

      // Center the shape if we have one
      if (targetShape) {
        this.animateViewToShape(editor, targetShape);
        logger.debug('node-canvas', '✨ Centered shape', { nodeId: node.id });
      } else {
        logger.warn('node-canvas', '⚠️ Could not find or create shape to center', { nodeId: node.id });
      }
    } catch (error) {
      this.cancelCurrentAnimation();
      logger.error('node-canvas', '❌ Failed to center node', { 
        nodeId: node.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private static async createNodeShape(editor: Editor, node: NavigationNode): Promise<TLShape | null> {
    try {
      const viewportBounds = editor.getViewportPageBounds();
      const centerX = viewportBounds.x + viewportBounds.w / 2;
      const centerY = viewportBounds.y + viewportBounds.h / 2;

      const dbName = UserNeoDBService.getNodeDatabaseName(node);
      const nodeData = await UserNeoDBService.fetchNodeData(node.id, dbName);
      
      if (!nodeData) {
        throw new Error('Failed to fetch node data');
      }

      logger.debug('node-canvas', '📄 Node data received', { nodeData });

      // Process the node data with proper date handling
      const nodeDataWithFormattedDates: NodeData = {
        ...nodeData.node_data,
        created: formatDate(nodeData.node_data.created as DateValue || ''),
        merged: formatDate(nodeData.node_data.merged as DateValue || ''),
        title: nodeData.node_data.title || node.label,
        w: 500,
        h: 350,
        state: {
          parentId: null,
          isPageChild: true,
          hasChildren: null,
          bindings: null
        }
      };

      // Convert all date/time fields to formatted strings
      const timeFields = ['date', 'start_time', 'end_time', 'start_date', 'end_date'];
      for (const field of timeFields) {
        const rawData = nodeData.node_data as unknown as Record<string, unknown>;
        const value = rawData[field];
        if (value) {
          nodeDataWithFormattedDates[field] = formatDate(value as DateValue);
        }
      }

      logger.debug('node-canvas', '📄 Processed node data', { nodeData: nodeDataWithFormattedDates });

      const shapeType = getShapeType(node.type as keyof CCNodeTypes);
      const shapeId = createShapeId(node.id);
      
      editor.createShape<TLShape>({
        id: shapeId,
        type: shapeType,
        x: centerX - (nodeDataWithFormattedDates.w / 2),
        y: centerY - (nodeDataWithFormattedDates.h / 2),
        props: nodeDataWithFormattedDates
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