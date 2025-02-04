import { Editor, TLShape, createShapeId } from '@tldraw/tldraw';
import { logger } from '../../debugConfig';
import { NavigationNode } from '../../types/navigation';
import { getShapeType, CCNodeTypes } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { UserNeoDBService } from '../../services/graph/userNeoDBService';

export class NodeCanvasService {
  private static readonly CANVAS_PADDING = 100;

  static async centerCurrentNode(editor: Editor, node: NavigationNode) {
    try {
      // Check if a shape for this node already exists
      const existingShape = this.findNodeShape(editor, node.id);
      
      if (existingShape) {
        // If shape exists, just center the view on it
        this.centerViewOnShape(editor, existingShape);
        logger.debug('node-canvas', '🎯 Centered view on existing shape', { nodeId: node.id });
      } else {
        // Create new shape for the node
        const newShape = await this.createNodeShape(editor, node);
        if (newShape) {
          this.centerViewOnShape(editor, newShape);
          logger.debug('node-canvas', '✨ Created and centered new shape', { nodeId: node.id });
        }
      }
    } catch (error) {
      logger.error('node-canvas', '❌ Failed to center node', { 
        nodeId: node.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private static findNodeShape(editor: Editor, nodeId: string): TLShape | undefined {
    const shapeId = createShapeId(nodeId);
    const shapes = editor.getCurrentPageShapes();
    return shapes.find((shape: TLShape) => shape.id === shapeId);
  }

  private static centerViewOnShape(editor: Editor, shape: TLShape) {
    const bounds = editor.getShapePageBounds(shape);
    if (!bounds) return;

    const viewportBounds = editor.getViewportPageBounds();
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;

    // Use the correct camera API
    const camera = editor.getCamera();
    editor.setCamera({
      ...camera,
      x: centerX - viewportBounds.w / 2,
      y: centerY - viewportBounds.h / 2
    });
  }

  private static async createNodeShape(editor: Editor, node: NavigationNode): Promise<TLShape | null> {
    try {
      // Get the viewport center
      const viewportBounds = editor.getViewportPageBounds();
      const centerX = viewportBounds.x + viewportBounds.w / 2;
      const centerY = viewportBounds.y + viewportBounds.h / 2;

      // Get the full node data from the database
      const dbName = UserNeoDBService.getNodeDatabaseName(node);
      const nodeData = await UserNeoDBService.fetchNodeData(node.id, dbName);
      
      if (!nodeData) {
        throw new Error('Failed to fetch node data');
      }

      logger.debug('node-canvas', '📄 Node data received', { 
        nodeData,
        created: typeof nodeData.node_data.created,
        merged: typeof nodeData.node_data.merged
      });

      // Ensure created and merged are strings, and handle any date fields
      const nodeDataWithStringDates: Record<string, string | number | boolean | null | undefined> = {
        ...nodeData.node_data,
        created: String(nodeData.node_data.created || ''),
        merged: String(nodeData.node_data.merged || '')
      };

      // Convert all date/time fields to strings
      const timeFields = ['date', 'start_time', 'end_time', 'start_date', 'end_date'];
      for (const field of timeFields) {
        if (field in nodeData.node_data && nodeData.node_data[field]) {
          nodeDataWithStringDates[field] = String(nodeData.node_data[field]);
        }
      }

      logger.debug('node-canvas', '📄 Processed node data', { 
        originalData: nodeData.node_data,
        processedData: nodeDataWithStringDates,
        timeFields: timeFields.reduce((acc, field) => ({
          ...acc,
          [field]: field in nodeData.node_data ? typeof nodeData.node_data[field] : 'not present'
        }), {})
      });

      // Create the shape with proper type casting
      const shapeType = getShapeType(node.type as keyof CCNodeTypes);
      const shapeId = createShapeId(node.id);
      
      // Define shape dimensions
      const shapeWidth = 500;
      const shapeHeight = 350;
      
      // Create shape with size in props, properly centered
      editor.createShape<TLShape>({
        id: shapeId,
        type: shapeType,
        x: centerX - (shapeWidth / 2),  // Center horizontally
        y: centerY - (shapeHeight / 2),  // Center vertically
        props: {
          ...nodeDataWithStringDates,
          title: nodeDataWithStringDates.title || node.label,
          w: shapeWidth,
          h: shapeHeight,
          state: {
            parentId: null,
            isPageChild: true,
            hasChildren: null,
            bindings: null
          },
          defaultComponent: true
        }
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