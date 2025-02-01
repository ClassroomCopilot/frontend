import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCAcademicYearNodeProps } from './cc-graph-props'
import { CCAcademicYearNodeProps } from './cc-graph-types'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'

export interface CCAcademicYearNodeShape extends CCBaseShape {
  type: 'cc-academic-year-node'
  props: CCAcademicYearNodeProps
}

export class CCAcademicYearNodeShapeUtil extends CCBaseShapeUtil<CCAcademicYearNodeShape> {
  static type = 'cc-academic-year-node' as const
  static props = ccGraphShapeProps['cc-academic-year-node']

  getDefaultProps(): CCAcademicYearNodeShape['props'] {
    const defaultProps = getDefaultCCAcademicYearNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCAcademicYearNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCAcademicYearNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Academic Year"
          value={shape.props.year}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 