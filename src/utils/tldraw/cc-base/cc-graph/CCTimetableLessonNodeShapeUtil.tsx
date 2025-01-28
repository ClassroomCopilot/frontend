import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCTimetableLessonNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCTimetableLessonNodeProps } from '../cc-graph-types'

export interface CCTimetableLessonNodeShape extends CCBaseShape {
  type: 'cc-timetable-lesson-node'
  props: CCTimetableLessonNodeProps
}

export class CCTimetableLessonNodeShapeUtil extends CCBaseShapeUtil<CCTimetableLessonNodeShape> {
  static type = 'cc-timetable-lesson-node' as const
  static props = ccGraphShapeProps['cc-timetable-lesson-node']

  getDefaultProps(): CCTimetableLessonNodeShape['props'] {
    const defaultProps = getDefaultCCTimetableLessonNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCTimetableLessonNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCTimetableLessonNodeShape) => {
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
      </div>
    )
  }
} 