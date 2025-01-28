import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCCalendarDayNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCCalendarDayNodeProps } from '../cc-graph-types'

export interface CCCalendarDayNodeShape extends CCBaseShape {
  type: 'cc-calendar-day-node'
  props: CCCalendarDayNodeProps
}

export class CCCalendarDayNodeShapeUtil extends CCBaseShapeUtil<CCCalendarDayNodeShape> {
  static type = 'cc-calendar-day-node' as const
  static props = ccGraphShapeProps['cc-calendar-day-node']

  getDefaultProps(): CCCalendarDayNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarDayNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarDayNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarDayNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Date"
          value={shape.props.date}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Day of Week"
          value={shape.props.day_of_week}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="ISO Day"
          value={shape.props.iso_day}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 