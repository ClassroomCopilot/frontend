import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCYearGroupNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCYearGroupNodeProps } from '../cc-graph-types'

export interface CCYearGroupNodeShape extends CCBaseShape {
  type: 'cc-year-group-node'
  props: CCYearGroupNodeProps
}

export class CCYearGroupNodeShapeUtil extends CCBaseShapeUtil<CCYearGroupNodeShape> {
  static type = 'cc-year-group-node' as const
  static props = ccGraphShapeProps['cc-year-group-node']

  getDefaultProps(): CCYearGroupNodeShape['props'] {
    const defaultProps = getDefaultCCYearGroupNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCYearGroupNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCYearGroupNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Year Group"
          value={shape.props.year_group}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Year Group Name"
          value={shape.props.year_group_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 