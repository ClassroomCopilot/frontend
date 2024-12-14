import { Editor, createShapeId } from '@tldraw/tldraw';
import { nodeTypeConfig } from './baseNodeShapeUtil';
import { AllNodeShapes, NodeShapeType } from './graph-shape-types';
import { logger } from '../../../debugConfig';

export const GRID_CELL_SIZE = 250;
export const GRID_PADDING = 50;
export const GRID_MAX_COLUMNS = 8;

const graphState = {
    nodeData: new Map<string, AllNodeShapes>(),
    shapeIds: new Set<string>(),
    editor: null as Editor | null,

    arrangeNodesInGrid: () => {
        if (!graphState.editor) {
            logger.error('graphStateUtil', '❌ Editor not initialized');
            return;
        }

        const nodes = Array.from(graphState.nodeData.values());
        if (nodes.length === 0) return;

        logger.debug('graphStateUtil', '📊 Arranging nodes in grid', { 
            nodeCount: nodes.length,
            currentNodes: nodes 
        });

        // Get viewport bounds
        const viewportBounds = graphState.editor.getViewportPageBounds();
        
        // Calculate available space
        const availableWidth = viewportBounds.width;
        
        // Calculate number of columns based on available space
        const columnsFromSpace = Math.floor(availableWidth / (GRID_CELL_SIZE + GRID_PADDING));
        const gridColumns = Math.min(
            Math.max(1, Math.min(columnsFromSpace, GRID_MAX_COLUMNS)),
            Math.ceil(Math.sqrt(nodes.length * 2)) // Allow grid to grow with more nodes
        );

        // Calculate total grid dimensions
        const rowCount = Math.ceil(nodes.length / gridColumns);
        const totalWidth = gridColumns * (GRID_CELL_SIZE + GRID_PADDING);
        const totalHeight = rowCount * (GRID_CELL_SIZE + GRID_PADDING);

        // Calculate starting position to center the grid
        const startX = viewportBounds.minX + (viewportBounds.width - totalWidth) / 2;
        const startY = viewportBounds.minY + (viewportBounds.height - totalHeight) / 2;

        // Track created/updated shapes for viewport adjustment
        const updatedShapeIds: string[] = [];

        nodes.forEach((node, index) => {
            if (!node.props?.unique_id) return;

            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;
            
            const x = startX + (col * (GRID_CELL_SIZE + GRID_PADDING));
            const y = startY + (row * (GRID_CELL_SIZE + GRID_PADDING));
            
            const shapeId = createShapeId(node.props.unique_id);
            updatedShapeIds.push(shapeId.toString());

            // Update both our internal state and the editor
            node.x = x;
            node.y = y;
            graphState.nodeData.set(node.props.unique_id, node);

            // Only create if the shape doesn't exist in our tracking
            if (!graphState.shapeIds.has(shapeId.toString())) {
                graphState.editor!.createShape({
                    id: shapeId,
                    type: node.type,
                    x: x,
                    y: y,
                    props: node.props
                });
                graphState.shapeIds.add(shapeId.toString());
                
                logger.debug('graphStateUtil', '➕ Created new shape', { 
                    id: shapeId.toString(),
                    position: { x, y } 
                });
            } else {
                graphState.editor!.updateShape({
                    id: shapeId,
                    type: node.type,
                    x: x,
                    y: y,
                });
                
                logger.debug('graphStateUtil', '🔄 Updated existing shape', { 
                    id: shapeId.toString(),
                    position: { x, y } 
                });
            }
        });

        // Only attempt to adjust view if we have shapes
        if (updatedShapeIds.length > 0) {
            const shapeIds = updatedShapeIds.map(id => createShapeId(id));
            graphState.editor.select(...shapeIds);
            graphState.editor.zoomToSelection();
            graphState.editor.deselect();
            
            logger.debug('graphStateUtil', '🔍 Adjusted viewport for shapes', { 
                shapeCount: updatedShapeIds.length 
            });
        }
    },

    updateShapesWithDagre: () => {
        if (!graphState.editor) {
            logger.error('graphStateUtil', '❌ Editor not initialized');
            return;
        }

        graphState.arrangeNodesInGrid();
    },

    addNode: (shape: AllNodeShapes) => {
        logger.debug('graphStateUtil', '🔍 Adding shape to graphState:', { shape });
        
        if (!shape.props?.unique_id || !shape.type) {
            logger.error('graphStateUtil', '❌ Invalid shape data', { shape });
            return;
        }

        const id = shape.props.unique_id;
        const shapeId = createShapeId(id).toString();
        
        // Track the shape ID
        graphState.shapeIds.add(shapeId);
        
        const nodeType = shape.props.__primarylabel__ as keyof typeof nodeTypeConfig;
        if (!nodeTypeConfig[nodeType]) {
            logger.error('graphStateUtil', '❌ Unknown node type', { 
                type: nodeType, 
                shape 
            });
            return;
        }

        const shapeType = nodeTypeConfig[nodeType].shapeType as NodeShapeType;
        graphState.nodeData.set(id, {
            ...shape,
            type: shapeType
        } as AllNodeShapes);

        // Only rearrange if we have an editor
        if (graphState.editor) {
            graphState.arrangeNodesInGrid();
        }
    },

    getNode: (id: string) => {
        return graphState.nodeData.get(id);
    },

    getAllNodes: () => {
        return Array.from(graphState.nodeData.values()).filter(item => {
            // Check if the item has a type property and it's not an edge type
            logger.debug('graphStateUtil', '🔍 Checking if item has a type property and it\'s not an edge type:', { item });
            return item.type && !item.type.includes('relationship');
        });
    },

    setEditor: (editor: Editor) => {
        graphState.editor = editor;
        graphState.shapeIds.clear();
    },

    updateNodePosition: (nodeId: string, newPos: { x: number, y: number }) => {
        const node = graphState.nodeData.get(nodeId);
        if (node) {
            node.x = newPos.x;
            node.y = newPos.y;
            graphState.nodeData.set(nodeId, node);

            // If we have an editor reference, update the shape
            if (graphState.editor) {
                const shapeId = createShapeId(nodeId);
                logger.debug('graphStateUtil', '🎯 Updating shape position', {
                    id: shapeId,
                    position: { x: newPos.x, y: newPos.y }
                });
                graphState.editor.updateShape({
                    id: shapeId,
                    type: node.type,
                    x: newPos.x,
                    y: newPos.y,
                });
            }

            logger.debug('graphStateUtil', '📍 Updated node position', {
                nodeId,
                newPos,
                node
            });
        }
    },

    hasNode: (uniqueId: string): boolean => {
        return graphState.nodeData.has(uniqueId);
    },

    getShapeByUniqueId: (uniqueId: string) => {
        return Array.from(graphState.nodeData.values()).find(
            shape => shape.props?.unique_id === uniqueId
        );
    },

    hasShape: (shapeId: string): boolean => {
        return graphState.shapeIds.has(shapeId);
    },
};

export default graphState;