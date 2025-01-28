import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCCalendarNodeProps } from '../cc-graph-props'
import { CCCalendarNodeProps } from '../cc-graph-types'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'

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