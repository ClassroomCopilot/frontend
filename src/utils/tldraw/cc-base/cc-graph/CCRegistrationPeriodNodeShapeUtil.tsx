import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCRegistrationPeriodNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCRegistrationPeriodNodeProps } from './cc-graph-types'

export interface CCRegistrationPeriodNodeShape extends CCBaseShape {
  type: 'cc-registration-period-node'
  props: CCRegistrationPeriodNodeProps
}

export class CCRegistrationPeriodNodeShapeUtil extends CCBaseShapeUtil<CCRegistrationPeriodNodeShape> {
  static type = 'cc-registration-period-node' as const
  static props = ccGraphShapeProps['cc-registration-period-node']

  getDefaultProps(): CCRegistrationPeriodNodeShape['props'] {
    const defaultProps = getDefaultCCRegistrationPeriodNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCRegistrationPeriodNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCRegistrationPeriodNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Name"
          value={shape.props.name}
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