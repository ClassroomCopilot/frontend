import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCLearningStatementNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCLearningStatementNodeProps } from './cc-graph-types'

export interface CCLearningStatementNodeShape extends CCBaseShape {
  type: 'cc-learning-statement-node'
  props: CCLearningStatementNodeProps
}

export class CCLearningStatementNodeShapeUtil extends CCBaseShapeUtil<CCLearningStatementNodeShape> {
  static type = 'cc-learning-statement-node' as const
  static props = ccGraphShapeProps['cc-learning-statement-node']

  getDefaultProps(): CCLearningStatementNodeShape['props'] {
    const defaultProps = getDefaultCCLearningStatementNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCLearningStatementNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCLearningStatementNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Learning Statement"
          value={shape.props.lesson_learning_statement}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Statement Type"
          value={shape.props.lesson_learning_statement_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Statement ID"
          value={shape.props.lesson_learning_statement_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 