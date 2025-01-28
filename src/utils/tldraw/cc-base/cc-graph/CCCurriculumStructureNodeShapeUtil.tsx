import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCCurriculumStructureNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCCurriculumStructureNodeProps } from '../cc-graph-types'

export interface CCCurriculumStructureNodeShape extends CCBaseShape {
  type: 'cc-curriculum-structure-node'
  props: CCCurriculumStructureNodeProps
}

export class CCCurriculumStructureNodeShapeUtil extends CCBaseShapeUtil<CCCurriculumStructureNodeShape> {
  static type = 'cc-curriculum-structure-node' as const
  static props = ccGraphShapeProps['cc-curriculum-structure-node']

  getDefaultProps(): CCCurriculumStructureNodeShape['props'] {
    const defaultProps = getDefaultCCCurriculumStructureNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCurriculumStructureNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCurriculumStructureNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Structure Type"
          value="Curriculum"
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 