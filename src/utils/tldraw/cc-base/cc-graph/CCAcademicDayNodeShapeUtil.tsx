import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { ccGraphShapeProps, getDefaultCCAcademicDayNodeProps } from './cc-graph-props'
import { CCAcademicDayNodeProps } from './cc-graph-types'
import { NodeProperty } from './cc-graph-shared'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCBaseShape } from '../cc-types'

export interface CCAcademicDayNodeShape extends CCBaseShape {
  type: 'cc-academic-day-node'
  props: CCAcademicDayNodeProps
}

export class CCAcademicDayNodeShapeUtil extends CCBaseShapeUtil<CCAcademicDayNodeShape> {
  static type = 'cc-academic-day-node' as const
  static props = ccGraphShapeProps['cc-academic-day-node']

  getDefaultProps(): CCAcademicDayNodeShape['props'] {
    const defaultProps = getDefaultCCAcademicDayNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCAcademicDayNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCAcademicDayNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Academic Day"
          value={shape.props.academic_day}
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
          label="Day of Week"
          value={shape.props.day_of_week}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Day Type"
          value={shape.props.day_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 