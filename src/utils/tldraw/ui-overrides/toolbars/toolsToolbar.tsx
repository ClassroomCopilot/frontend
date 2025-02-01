import { ReactNode } from 'react';
import { useEditor } from '@tldraw/tldraw'
import { useNeo4j } from '../../../../contexts/Neo4jContext'
import { graphState } from '../../../../utils/tldraw/cc-base/cc-graph/graphStateUtil';
import { AllNodeShapes } from '../../../../utils/tldraw/cc-base/cc-graph/cc-graph-shapes';
import { createUserNodeFromProfile } from '../../../../utils/tldraw/cc-base/shape-helpers/graph-helpers';

export function ToolsToolbar({ children }: { children: (props: { 
  handlePutUserNode: () => void,
  handleAddCalendar: () => void
}) => ReactNode }) {
    const editor = useEditor();
    const { userNodes } = useNeo4j()

    const handlePutUserNode = () => {
        if (!userNodes?.privateUserNode) {
            console.error("User node is not available");
            return;
        }
        const existingNode = graphState.getNode(userNodes.privateUserNode.unique_id);
        if (!existingNode) {
            console.log("Adding user node to graphState:", userNodes.privateUserNode);
            const centerX = editor.getViewportScreenCenter().x
            const centerY = editor.getViewportScreenCenter().y

            // Create the user node using the helper function
            const newShapeId = createUserNodeFromProfile(
                editor,
                userNodes.privateUserNode,
                centerX,
                centerY
            );

            if (newShapeId) {
                // Get the shape's bounds
                const {bounds} = editor.getShapeGeometry(newShapeId);
                console.log("Getting bounds for user shape:", newShapeId);
                console.log("Updating shape with width:", bounds.w, "and height:", bounds.h);

                // Get the created shape
                const shape = editor.getShape(newShapeId);
                if (shape) {
                    // Add to graphState with the correct dimensions
                    graphState.addNode({
                        ...shape,
                        props: {
                            ...shape.props,
                            w: bounds.w,
                            h: bounds.h
                        }
                    } as AllNodeShapes);
                    graphState.setEditor(editor);
                    graphState.updateShapesWithDagre();
                }
            }
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
