import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty, formatDate, DateValue } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCCalendarWeekNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCCalendarWeekNodeProps } from './cc-graph-types'

export interface CCCalendarWeekNodeShape extends CCBaseShape {
  type: 'cc-calendar-week-node'
  props: CCCalendarWeekNodeProps
}

export class CCCalendarWeekNodeShapeUtil extends CCBaseShapeUtil<CCCalendarWeekNodeShape> {
  static type = 'cc-calendar-week-node' as const
  static props = ccGraphShapeProps['cc-calendar-week-node']

  getDefaultProps(): CCCalendarWeekNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarWeekNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarWeekNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarWeekNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Start Date"
          value={formatDate(shape.props.start_date as DateValue)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Week Number"
          value={shape.props.week_number}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="ISO Week"
          value={shape.props.iso_week}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 