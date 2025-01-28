import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCAcademicWeekNodeProps } from '../cc-graph-props'
import { CCAcademicWeekNodeProps } from '../cc-graph-types'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'

export interface CCAcademicWeekNodeShape extends CCBaseShape {
  type: 'cc-academic-week-node'
  props: CCAcademicWeekNodeProps
}

export class CCAcademicWeekNodeShapeUtil extends CCBaseShapeUtil<CCAcademicWeekNodeShape> {
  static type = 'cc-academic-week-node' as const
  static props = ccGraphShapeProps['cc-academic-week-node']

  getDefaultProps(): CCAcademicWeekNodeShape['props'] {
    const defaultProps = getDefaultCCAcademicWeekNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCAcademicWeekNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCAcademicWeekNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Academic Week Number"
          value={shape.props.academic_week_number}
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
          label="Week Type"
          value={shape.props.week_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 