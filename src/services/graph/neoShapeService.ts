import { NavigationNode } from '../../types/navigation';
import { getShapeType, CCNodeTypes } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { getThemeFromLabel } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-styles';
import { logger } from '../../debugConfig';
import { NodeData } from '../../types/graph-shape';

export class NeoShapeService {
    private static readonly DATE_TIME_FIELDS = [
        'merged', 'created', 'start_date', 'end_date', 'start_time', 'end_time'
    ] as const;

    private static processDateTimeFields(data: Record<string, unknown>): Record<string, unknown> {
        const processed = { ...data };
        for (const key of Object.keys(processed)) {
            if (this.DATE_TIME_FIELDS.includes(key as typeof this.DATE_TIME_FIELDS[number]) && 
                processed[key] && 
                typeof processed[key] === 'object') {
                processed[key] = processed[key].toString();
            }
        }
        return processed;
    }

    static getShapeConfig(node: NavigationNode, nodeData: NodeData, centerX: number, centerY: number) {
        try {
            // Get the shape type based on the node type
            const shapeType = getShapeType(node.type as keyof CCNodeTypes);
            
            // Get theme colors based on the node type
            const theme = getThemeFromLabel(node.type);

            // Default dimensions
            const width = 500;
            const height = 350;

            // Process the node data
            const processedProps = {
                ...this.processDateTimeFields(nodeData),
                title: nodeData.title || node.label,
                w: width,
                h: height,
                state: {
                    parentId: null,
                    isPageChild: true,
                    hasChildren: null,
                    bindings: null
                },
                headerColor: theme.headerColor,
                backgroundColor: theme.backgroundColor,
                isLocked: false,
                __primarylabel__: node.type,
                unique_id: node.id,
                path: node.path
            };

            logger.debug('neo-shape-service', '📄 Created shape configuration', {
                nodeId: node.id,
                shapeType,
                theme,
                props: processedProps
            });

            return {
                type: shapeType,
                x: centerX - (width / 2),
                y: centerY - (height / 2),
                props: processedProps
            };
        } catch (error) {
            logger.error('neo-shape-service', '❌ Failed to create shape configuration', {
                nodeId: node.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}

