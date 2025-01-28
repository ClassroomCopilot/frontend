import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCTeacherTimetableNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCTeacherTimetableNodeProps } from '../cc-graph-types'
export interface CCTeacherTimetableNodeShape extends CCBaseShape {
  type: 'cc-teacher-timetable-node'
  props: CCTeacherTimetableNodeProps
}

export class CCTeacherTimetableNodeShapeUtil extends CCBaseShapeUtil<CCTeacherTimetableNodeShape> {
  static type = 'cc-teacher-timetable-node' as const
  static props = ccGraphShapeProps['cc-teacher-timetable-node']

  getDefaultProps(): CCTeacherTimetableNodeShape['props'] {
    const defaultProps = getDefaultCCTeacherTimetableNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCTeacherTimetableNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCTeacherTimetableNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Teacher ID"
          value={shape.props.teacher_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Start Date"
          value={shape.props.start_date}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="End Date"
          value={shape.props.end_date}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 