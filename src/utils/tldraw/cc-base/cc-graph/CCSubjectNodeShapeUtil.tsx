import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCSubjectNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCSubjectNodeProps } from './cc-graph-types'

export interface CCSubjectNodeShape extends CCBaseShape {
  type: 'cc-subject-node'
  props: CCSubjectNodeProps
}

export class CCSubjectNodeShapeUtil extends CCBaseShapeUtil<CCSubjectNodeShape> {
  static type = 'cc-subject-node' as const
  static props = ccGraphShapeProps['cc-subject-node']

  getDefaultProps(): CCSubjectNodeShape['props'] {
    const defaultProps = getDefaultCCSubjectNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCSubjectNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCSubjectNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Subject Name"
          value={shape.props.subject_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject Code"
          value={shape.props.subject_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 