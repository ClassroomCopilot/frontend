import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCSchoolTimetableNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCSchoolTimetableNodeProps } from '../cc-graph-types'

export interface CCSchoolTimetableNodeShape extends CCBaseShape {
  type: 'cc-school-timetable-node'
  props: CCSchoolTimetableNodeProps
}

export class CCSchoolTimetableNodeShapeUtil extends CCBaseShapeUtil<CCSchoolTimetableNodeShape> {
  static type = 'cc-school-timetable-node' as const
  static props = ccGraphShapeProps['cc-school-timetable-node']

  getDefaultProps(): CCSchoolTimetableNodeShape['props'] {
    const defaultProps = getDefaultCCSchoolTimetableNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCSchoolTimetableNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCSchoolTimetableNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
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