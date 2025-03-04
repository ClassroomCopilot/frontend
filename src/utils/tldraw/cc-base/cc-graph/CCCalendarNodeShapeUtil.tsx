import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty, formatDate } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCCalendarNodeProps } from './cc-graph-props'
import { CCCalendarNodeProps } from './cc-graph-types'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'

export interface CCCalendarNodeShape extends CCBaseShape {
  type: 'cc-calendar-node'
  props: CCCalendarNodeProps
}

export class CCCalendarNodeShapeUtil extends CCBaseShapeUtil<CCCalendarNodeShape> {
  static type = 'cc-calendar-node' as const
  static props = ccGraphShapeProps['cc-calendar-node']

  getDefaultProps(): CCCalendarNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Calendar Name"
          value={shape.props.calendar_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Calendar Type"
          value={shape.props.calendar_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Start Date"
          value={formatDate(shape.props.start_date)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="End Date"
          value={formatDate(shape.props.end_date)}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 