import { Editor, createShapeId, TLShapeId, IndexKey } from '@tldraw/tldraw'
import { ccGraphShapeProps, getDefaultCCUserNodeProps } from '../cc-graph/cc-graph-props'
import { NODE_THEMES, NODE_TYPE_THEMES } from '../cc-graph/cc-graph-styles'
import { GraphShapeType, CCUserNodeProps } from '../cc-graph/cc-graph-types'
import { logger } from '../../../../debugConfig'

// Create a graph shape on the canvas
export const createGraphShape = (
  editor: Editor,
  shapeType: GraphShapeType,
  point = { x: 0, y: 0 }
) => {
  if (!ccGraphShapeProps || !ccGraphShapeProps[shapeType]) {
    console.warn(`Invalid shape type: ${shapeType}`);
    return;
  }

  editor.createShape({
    id: createShapeId(),
    type: shapeType,
    x: point.x,
    y: point.y,
  });
}

export const createUserNodeFromProfile = (
  editor: Editor,
  userNode: CCUserNodeProps,
  x: number = 0,
  y: number = 0
): TLShapeId | null => {
  try {
    if (!userNode) {
      logger.error('graph-shape-user', '❌ Cannot create user node - no user data')
      return null
    }

    const id = createShapeId()
    const theme = NODE_THEMES[NODE_TYPE_THEMES['cc-user-node']]
    editor.createShape({
      id,
      type: 'cc-user-node' as const,
      x,
      y,
      rotation: 0,
      index: 'a1' as IndexKey,
      isLocked: false,
      opacity: 1,
      props: {
        ...getDefaultCCUserNodeProps(),
        headerColor: theme.headerColor,
        title: userNode.user_email,
        unique_id: userNode.unique_id,
        user_name: userNode.user_name,
        user_email: userNode.user_email,
        user_type: userNode.user_type,
        user_id: userNode.user_id,
        path: userNode.path,
        worker_node_data: userNode.worker_node_data,
        state: {
          parentId: null,
          isPageChild: true,
          hasChildren: null,
          bindings: null
        },
        defaultComponent: true
      }
    })
    
    logger.debug('graph-shape-user', '🔄 Creating user node', {
      userId: userNode.user_id,
      email: userNode.user_email,
      type: userNode.user_type
    })

    return id
  } catch (error) {
    logger.error('graph-shape-user', '❌ Failed to create user node', error)
    return null
  }
}
