import { useEditor, createShapeId } from '@tldraw/tldraw'
import { useNeo4j } from '../../../contexts/Neo4jContext'
import graphState from '../graph/graphStateUtil';
import { ReactNode, useEffect } from 'react';

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
                type: 'user_node',
                id: newShapeId,
                x: centerX,
                y: centerY,
                props: {
                    ...userNodes.privateUserNode
                }
            };
            console.log("Creating user shape:", newNode);
            editor.createShape(newNode);
            console.log("User shape created:", newNode);
            console.log("Getting bounds for user shape:", newShapeId);
            const bounds = editor.getShapeGeometry(newShapeId).bounds;
            console.log("Updating shape with width:", bounds.w, "and height:", bounds.h);
            newNode.props.w = bounds.w;
            newNode.props.h = bounds.h;
            console.log("Adding node to graphState:", newNode);
            const shapeWithWidthAndHeight = {
                ...newNode,
                w: bounds.w,
                h: bounds.h
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
