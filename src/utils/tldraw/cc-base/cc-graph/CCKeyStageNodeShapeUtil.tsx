import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCKeyStageNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCKeyStageNodeProps } from './cc-graph-types'

export interface CCKeyStageNodeShape extends CCBaseShape {
  type: 'cc-key-stage-node'
  props: CCKeyStageNodeProps
}

export class CCKeyStageNodeShapeUtil extends CCBaseShapeUtil<CCKeyStageNodeShape> {
  static type = 'cc-key-stage-node' as const
  static props = ccGraphShapeProps['cc-key-stage-node']

  getDefaultProps(): CCKeyStageNodeShape['props'] {
    const defaultProps = getDefaultCCKeyStageNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCKeyStageNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCKeyStageNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Key Stage"
          value={shape.props.key_stage}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Name"
          value={shape.props.key_stage_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 