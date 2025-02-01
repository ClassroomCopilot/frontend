import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCRoomNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCRoomNodeProps } from './cc-graph-types'

export interface CCRoomNodeShape extends CCBaseShape {
  type: 'cc-room-node'
  props: CCRoomNodeProps
}

export class CCRoomNodeShapeUtil extends CCBaseShapeUtil<CCRoomNodeShape> {
  static type = 'cc-room-node' as const
  static props = ccGraphShapeProps['cc-room-node']

  getDefaultProps(): CCRoomNodeShape['props'] {
    const defaultProps = getDefaultCCRoomNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCRoomNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCRoomNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Room Name"
          value={shape.props.room_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Room Code"
          value={shape.props.room_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
}