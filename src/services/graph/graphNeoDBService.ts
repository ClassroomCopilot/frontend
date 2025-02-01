import { Editor, createShapeId, IndexKey } from '@tldraw/tldraw';
import axios from '../../axiosConfig';
import { getShapeType, isValidNodeType } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { AllNodeShapes, NodeShapeType, ShapeUtils } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-shapes';
import { graphState } from '../../utils/tldraw/cc-base/cc-graph/graphStateUtil';
import { logger } from '../../debugConfig';

interface NodeResponse {
    __primarylabel__: string;
    unique_id: string;
    [key: string]: unknown;
}

interface ConnectedNodeResponse {
    node_type: string;
    node_data: NodeResponse;
    relationship_type: string;
    relationship_properties: {
        [key: string]: unknown;
    };
}

interface RelationshipData {
    start_node: NodeResponse;
    end_node: NodeResponse;
    relationship_type: string;
    relationship_properties: {
        [key: string]: unknown;
    };
}

interface ConnectedNodesResponse {
    status: string;
    main_node: NodeResponse;
    connected_nodes: ConnectedNodeResponse[];
    relationships: RelationshipData[];
}

export class GraphNeoDBService {
    static async fetchConnectedNodesAndEdges(
        unique_id: string,
        db_name: string,
        editor: Editor
    ) {
        try {
            logger.debug('graph-service', '📤 Fetching connected nodes', { 
                unique_id,
                db_name 
            });

            const response = await axios.get<ConnectedNodesResponse>(
                '/api/database/tools/get-connected-nodes-and-edges', {
                    params: { 
                        unique_id,
                        db_name
                    }
                }
            );

            if (response.data.status === "success") {
                // Make sure editor is set in graphState
                graphState.setEditor(editor);
                await this.processConnectedNodesResponse(response.data);
                return true;
            }
            
            throw new Error('Failed to fetch connected nodes');
        } catch (error) {
            logger.error('graph-service', '❌ Failed to fetch connected nodes', { error });
            throw error;
        }
    }

    private static async processConnectedNodesResponse(
        data: ConnectedNodesResponse
    ) {
        try {
            // Log the incoming data
            logger.debug('graph-service', '📥 Processing nodes response', {
                mainNode: data.main_node,
                connectedNodesCount: data.connected_nodes?.length,
                relationshipsCount: data.relationships?.length
            });

            // Create a batch of nodes to process
            const nodesToProcess: NodeResponse[] = [];

            // Add connected nodes first
            if (data.connected_nodes) {
                data.connected_nodes.forEach(connectedNode => {
                    nodesToProcess.push(connectedNode.node_data);
                });
            }

            // Add main node last (if it exists) to ensure it's processed after connected nodes
            if (data.main_node) {
                nodesToProcess.push(data.main_node);
            }

            // Process all nodes in batch
            for (const nodeData of nodesToProcess) {
                await this.createOrUpdateNode(nodeData);
                logger.debug('graph-service', '📝 Processed node', { 
                    nodeId: nodeData.unique_id,
                    nodeType: nodeData.__primarylabel__
                });
            }

            // After all nodes are processed, arrange them in grid
            graphState.arrangeNodesInGrid();

            logger.debug('graph-service', '✅ Processed nodes batch', { 
                processedCount: nodesToProcess.length,
                totalNodes: graphState.getAllNodes().length,
                nodesInState: Array.from(graphState.nodeData.keys())
            });

        } catch (error) {
            logger.error('graph-service', '❌ Failed to process connected nodes response', { error });
            throw error;
        }
    }

    private static async createOrUpdateNode(
        nodeData: NodeResponse
    ) {
        const uniqueId = nodeData.unique_id;
        const nodeType = nodeData.__primarylabel__;

        if (!isValidNodeType(nodeType)) {
            logger.warn('graph-service', '⚠️ Unknown node type', { data: nodeData });
            return;
        }

        const shapeType = getShapeType(nodeType) as NodeShapeType;
        
        // Get the shape util for this node type
        const shapeUtil = ShapeUtils[shapeType];
        if (!shapeUtil) {
            logger.warn('graph-service', '⚠️ No shape util found for type', { type: shapeType });
            return;
        }

        // Get default props from the shape util's prototype
        const defaultProps = shapeUtil.prototype.getDefaultProps();

        // Create the shape with proper typing based on the node type
        const shape = {
            id: createShapeId(uniqueId),
            type: shapeType,
            x: 0,
            y: 0,
            rotation: 0,
            index: 'a1' as IndexKey,
            parentId: createShapeId('page:page'),
            isLocked: false,
            opacity: 1,
            meta: {},
            props: {
                ...defaultProps,
                ...nodeData,
                __primarylabel__: nodeData.__primarylabel__,
                unique_id: nodeData.unique_id,
                path: nodeData.path as string || '',
            }
        };

        // Add to graphState
        graphState.addNode(shape as AllNodeShapes);

        logger.debug('graph-service', '📝 Node processed', { 
            uniqueId,
            nodeType,
            shapeId: shape.id,
            shapeType: shape.type
        });
    }
}
