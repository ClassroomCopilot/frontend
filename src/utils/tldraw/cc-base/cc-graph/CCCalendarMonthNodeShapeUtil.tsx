import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCCalendarMonthNodeProps } from '../cc-graph-props'
import { CCCalendarMonthNodeProps } from '../cc-graph-types'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'

export interface CCCalendarMonthNodeShape extends CCBaseShape {
  type: 'cc-calendar-month-node'
  props: CCCalendarMonthNodeProps
}

export class CCCalendarMonthNodeShapeUtil extends CCBaseShapeUtil<CCCalendarMonthNodeShape> {
  static type = 'cc-calendar-month-node' as const
  static props = ccGraphShapeProps['cc-calendar-month-node']

  getDefaultProps(): CCCalendarMonthNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarMonthNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarMonthNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarMonthNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Year"
          value={shape.props.year}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Month"
          value={shape.props.month}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Month Name"
          value={shape.props.month_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 