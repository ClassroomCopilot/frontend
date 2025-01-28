import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCAcademicPeriodNodeProps } from '../cc-graph-props'
import { CCAcademicPeriodNodeProps } from '../cc-graph-types'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'

export interface CCAcademicPeriodNodeShape extends CCBaseShape {
  type: 'cc-academic-period-node'
  props: CCAcademicPeriodNodeProps
}

export class CCAcademicPeriodNodeShapeUtil extends CCBaseShapeUtil<CCAcademicPeriodNodeShape> {
  static type = 'cc-academic-period-node' as const
  static props = ccGraphShapeProps['cc-academic-period-node']

  getDefaultProps(): CCAcademicPeriodNodeShape['props'] {
    const defaultProps = getDefaultCCAcademicPeriodNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCAcademicPeriodNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCAcademicPeriodNodeShape) => {
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