import { useEditor, createShapeId, createShapeId as createParentId, IndexKey } from '@tldraw/tldraw'
import { useNeo4j } from '../../../../contexts/Neo4jContext'
import graphState from '../../graph/graphStateUtil';
import { ReactNode, useEffect } from 'react';
import { NODE_SHAPE_TYPES } from '../../graph/graph-shape-types';

export function ToolsToolbar({ children }: { children: (props: { 
  handlePutUserNode: () => void,
  handleAddCalendar: () => void
}) => ReactNode }) {
    const editor = useEditor();
    const { userNodes } = useNeo4j()
    useEffect(() => {
    }, [userNodes]);

    const handlePutUserNode = () => {
        if (!userNodes?.privateUserNode) {
            console.error("User node is not available");
            return;
        }
        const existingNode = graphState.getNode(userNodes.privateUserNode.unique_id);
        if (!existingNode) {
            console.log("Adding user node to graphState:", userNodes.privateUserNode);
            const newShapeId = createShapeId(userNodes.privateUserNode.unique_id);
            const centerX = editor.getViewportScreenCenter().x
            const centerY = editor.getViewportScreenCenter().y
            const newNode = {
                type: NODE_SHAPE_TYPES.USER,
                id: newShapeId,
                x: centerX,
                y: centerY,
                props: {
                    w: 200,
                    h: 200,
                    color: 'light-green' as const,
                    __primarylabel__: 'User',
                    unique_id: userNodes.privateUserNode.unique_id,
                    path: userNodes.privateUserNode.path,
                    created: userNodes.privateUserNode.created,
                    merged: userNodes.privateUserNode.merged,
                    user_id: userNodes.privateUserNode.user_id,
                    user_type: userNodes.privateUserNode.user_type,
                    user_name: userNodes.privateUserNode.user_name,
                    user_email: userNodes.privateUserNode.user_email,
                    worker_node_data: userNodes.privateUserNode.worker_node_data
                }
            };
            console.log("Creating user shape:", newNode);
            editor.createShape(newNode);
            console.log("User shape created:", newNode);
            console.log("Getting bounds for user shape:", newShapeId);
            const {bounds} = editor.getShapeGeometry(newShapeId);
            console.log("Updating shape with width:", bounds.w, "and height:", bounds.h);
            const shapeWithWidthAndHeight = {
                ...newNode,
                w: bounds.w,
                h: bounds.h,
                rotation: 0,
                index: 'a1' as IndexKey,
                parentId: createParentId('page:page'),
                isLocked: false,
                opacity: 1,
                meta: {},
                typeName: 'shape' as const
            }
            graphState.addNode(shapeWithWidthAndHeight);
            graphState.setEditor(editor);
            graphState.updateShapesWithDagre();
        } else {
            console.log(`Node with id ${userNodes.privateUserNode.unique_id} already exists on the canvas.`);
        }
    };

    const handleAddCalendar = () => {
        editor.setCurrentTool('calendar');
    };

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {children({ handlePutUserNode, handleAddCalendar })}
        </div>
    );
}
