import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCCalendarYearNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCCalendarYearNodeProps } from '../cc-graph-types'

export interface CCCalendarYearNodeShape extends CCBaseShape {
  type: 'cc-calendar-year-node'
  props: CCCalendarYearNodeProps
}

export class CCCalendarYearNodeShapeUtil extends CCBaseShapeUtil<CCCalendarYearNodeShape> {
  static type = 'cc-calendar-year-node' as const
  static props = ccGraphShapeProps['cc-calendar-year-node']

  getDefaultProps(): CCCalendarYearNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarYearNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarYearNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarYearNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Year"
          value={shape.props.year}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 