import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCPlannedLessonNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCPlannedLessonNodeProps } from './cc-graph-types'

export interface CCPlannedLessonNodeShape extends CCBaseShape {
  type: 'cc-planned-lesson-node'
  props: CCPlannedLessonNodeProps
}

export class CCPlannedLessonNodeShapeUtil extends CCBaseShapeUtil<CCPlannedLessonNodeShape> {
  static type = 'cc-planned-lesson-node' as const
  static props = ccGraphShapeProps['cc-planned-lesson-node']

  getDefaultProps(): CCPlannedLessonNodeShape['props'] {
    const defaultProps = getDefaultCCPlannedLessonNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCPlannedLessonNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCPlannedLessonNodeShape) => {
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
          value={shape.props.date}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Start Time"
          value={shape.props.start_time}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="End Time"
          value={shape.props.end_time}
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
          label="Teacher Code"
          value={shape.props.teacher_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Planning Status"
          value={shape.props.planning_status}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Topic Code"
          value={shape.props.topic_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Topic Name"
          value={shape.props.topic_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Lesson Code"
          value={shape.props.lesson_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Lesson Name"
          value={shape.props.lesson_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Learning Statement Codes"
          value={shape.props.learning_statement_codes}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Learning Statements"
          value={shape.props.learning_statements}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Learning Resource Codes"
          value={shape.props.learning_resource_codes}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Learning Resources"
          value={shape.props.learning_resources}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 