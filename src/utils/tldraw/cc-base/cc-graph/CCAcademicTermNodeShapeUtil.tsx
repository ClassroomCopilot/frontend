import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCAcademicTermNodeProps } from './cc-graph-props'
import { CCAcademicTermNodeProps } from './cc-graph-types'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'

export interface CCAcademicTermNodeShape extends CCBaseShape {
  type: 'cc-academic-term-node'
  props: CCAcademicTermNodeProps
}

export class CCAcademicTermNodeShapeUtil extends CCBaseShapeUtil<CCAcademicTermNodeShape> {
  static type = 'cc-academic-term-node' as const
  static props = ccGraphShapeProps['cc-academic-term-node']

  getDefaultProps(): CCAcademicTermNodeShape['props'] {
    const defaultProps = getDefaultCCAcademicTermNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCAcademicTermNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCAcademicTermNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Term Name"
          value={shape.props.term_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Term Number"
          value={shape.props.term_number}
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
          label="End Date"
          value={shape.props.end_date}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 