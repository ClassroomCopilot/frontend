import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCDepartmentNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCDepartmentNodeProps } from './cc-graph-types'

export interface CCDepartmentNodeShape extends CCBaseShape {
  type: 'cc-department-node'
  props: CCDepartmentNodeProps
}

export class CCDepartmentNodeShapeUtil extends CCBaseShapeUtil<CCDepartmentNodeShape> {
  static type = 'cc-department-node' as const
  static props = ccGraphShapeProps['cc-department-node']

  getDefaultProps(): CCDepartmentNodeShape['props'] {
    const defaultProps = getDefaultCCDepartmentNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCDepartmentNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCDepartmentNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Department Name"
          value={shape.props.department_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 