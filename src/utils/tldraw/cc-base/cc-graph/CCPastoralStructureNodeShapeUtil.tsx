import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCPastoralStructureNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCPastoralStructureNodeProps } from '../cc-graph-types'


export interface CCPastoralStructureNodeShape extends CCBaseShape {
  type: 'cc-pastoral-structure-node'
  props: CCPastoralStructureNodeProps
}

export class CCPastoralStructureNodeShapeUtil extends CCBaseShapeUtil<CCPastoralStructureNodeShape> {
  static type = 'cc-pastoral-structure-node' as const
  static props = ccGraphShapeProps['cc-pastoral-structure-node']

  getDefaultProps(): CCPastoralStructureNodeShape['props'] {
    const defaultProps = getDefaultCCPastoralStructureNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCPastoralStructureNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCPastoralStructureNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Structure Type"
          value="Pastoral"
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 