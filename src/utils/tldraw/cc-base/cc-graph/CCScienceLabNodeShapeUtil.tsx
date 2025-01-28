import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCScienceLabNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCScienceLabNodeProps } from '../cc-graph-types'

export interface CCScienceLabNodeShape extends CCBaseShape {
  type: 'cc-science-lab-node'
  props: CCScienceLabNodeProps
}

export class CCScienceLabNodeShapeUtil extends CCBaseShapeUtil<CCScienceLabNodeShape> {
  static type = 'cc-science-lab-node' as const
  static props = ccGraphShapeProps['cc-science-lab-node']

  getDefaultProps(): CCScienceLabNodeShape['props'] {
    const defaultProps = getDefaultCCScienceLabNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCScienceLabNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCScienceLabNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Lab Title"
          value={shape.props.science_lab_title}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Summary"
          value={shape.props.science_lab_summary}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Requirements"
          value={shape.props.science_lab_requirements}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Procedure"
          value={shape.props.science_lab_procedure}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Safety"
          value={shape.props.science_lab_safety}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Web Links"
          value={shape.props.science_lab_weblinks}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Lab ID"
          value={shape.props.science_lab_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 