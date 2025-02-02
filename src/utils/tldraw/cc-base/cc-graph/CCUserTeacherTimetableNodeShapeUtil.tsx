import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCUserTeacherTimetableNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCUserTeacherTimetableNodeProps } from './cc-graph-types'

export interface CCUserTeacherTimetableNodeShape extends CCBaseShape {
  type: 'cc-user-teacher-timetable-node'
  props: CCUserTeacherTimetableNodeProps
}

export class CCUserTeacherTimetableNodeShapeUtil extends CCBaseShapeUtil<CCUserTeacherTimetableNodeShape> {
  static type = 'cc-user-teacher-timetable-node' as const
  static props = ccGraphShapeProps['cc-user-teacher-timetable-node']

  getDefaultProps(): CCUserTeacherTimetableNodeShape['props'] {
    const defaultProps = getDefaultCCUserTeacherTimetableNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCUserTeacherTimetableNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCUserTeacherTimetableNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="School DB"
          value={shape.props.school_db_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="School Timetable ID"
          value={shape.props.school_timetable_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 