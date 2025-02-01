import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCKeyStageSyllabusNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCKeyStageSyllabusNodeProps } from './cc-graph-types'

export interface CCKeyStageSyllabusNodeShape extends CCBaseShape {
  type: 'cc-key-stage-syllabus-node'
  props: CCKeyStageSyllabusNodeProps
}

export class CCKeyStageSyllabusNodeShapeUtil extends CCBaseShapeUtil<CCKeyStageSyllabusNodeShape> {
  static type = 'cc-key-stage-syllabus-node' as const
  static props = ccGraphShapeProps['cc-key-stage-syllabus-node']

  getDefaultProps(): CCKeyStageSyllabusNodeShape['props'] {
    const defaultProps = getDefaultCCKeyStageSyllabusNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCKeyStageSyllabusNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCKeyStageSyllabusNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Syllabus Name"
          value={shape.props.ks_syllabus_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Key Stage"
          value={shape.props.ks_syllabus_key_stage}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject"
          value={shape.props.ks_syllabus_subject}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject Code"
          value={shape.props.ks_syllabus_subject_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 