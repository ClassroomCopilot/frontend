import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty, formatDate } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCUserTimetableLessonNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCUserTimetableLessonNodeProps } from './cc-graph-types'

export interface CCUserTimetableLessonNodeShape extends CCBaseShape {
  type: 'cc-user-timetable-lesson-node'
  props: CCUserTimetableLessonNodeProps
}

export class CCUserTimetableLessonNodeShapeUtil extends CCBaseShapeUtil<CCUserTimetableLessonNodeShape> {
  static type = 'cc-user-timetable-lesson-node' as const
  static props = ccGraphShapeProps['cc-user-timetable-lesson-node']

  getDefaultProps(): CCUserTimetableLessonNodeShape['props'] {
    const defaultProps = getDefaultCCUserTimetableLessonNodeProps() as CCUserTimetableLessonNodeShape['props']
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCUserTimetableLessonNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCUserTimetableLessonNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Subject Class"
          value={shape.props.subject_class}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Date"
          value={formatDate(shape.props.date)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Start Time"
          value={formatDate(shape.props.start_time)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="End Time"
          value={formatDate(shape.props.end_time)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Period Code"
          value={shape.props.period_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="School DB"
          value={shape.props.school_db_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="School Period ID"
          value={shape.props.school_period_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 