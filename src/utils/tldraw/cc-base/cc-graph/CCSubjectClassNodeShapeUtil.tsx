import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCSubjectClassNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCSubjectClassNodeProps } from '../cc-graph-types'

export interface CCSubjectClassNodeShape extends CCBaseShape {
  type: 'cc-subject-class-node'
  props: CCSubjectClassNodeProps
}

export class CCSubjectClassNodeShapeUtil extends CCBaseShapeUtil<CCSubjectClassNodeShape> {
  static type = 'cc-subject-class-node' as const
  static props = ccGraphShapeProps['cc-subject-class-node']

  getDefaultProps(): CCSubjectClassNodeShape['props'] {
    const defaultProps = getDefaultCCSubjectClassNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCSubjectClassNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCSubjectClassNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Class Code"
          value={shape.props.subject_class_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Year Group"
          value={shape.props.year_group}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject"
          value={shape.props.subject}
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