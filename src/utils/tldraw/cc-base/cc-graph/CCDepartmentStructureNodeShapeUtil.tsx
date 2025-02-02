import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCDepartmentStructureNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCDepartmentStructureNodeProps } from './cc-graph-types'

export interface CCDepartmentStructureNodeShape extends CCBaseShape {
  type: 'cc-department-structure-node'
  props: CCDepartmentStructureNodeProps
}

export class CCDepartmentStructureNodeShapeUtil extends CCBaseShapeUtil<CCDepartmentStructureNodeShape> {
  static type = 'cc-department-structure-node' as const
  static props = ccGraphShapeProps['cc-department-structure-node']

  getDefaultProps(): CCDepartmentStructureNodeShape['props'] {
    const defaultProps = getDefaultCCDepartmentStructureNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCDepartmentStructureNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCDepartmentStructureNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Structure Type"
          value={shape.props.department_structure_type || "Department"}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 