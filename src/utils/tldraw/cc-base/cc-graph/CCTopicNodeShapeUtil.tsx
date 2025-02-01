import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCTopicNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCTopicNodeProps } from './cc-graph-types'

export interface CCTopicNodeShape extends CCBaseShape {
  type: 'cc-topic-node'
  props: CCTopicNodeProps
}

export class CCTopicNodeShapeUtil extends CCBaseShapeUtil<CCTopicNodeShape> {
  static type = 'cc-topic-node' as const
  static props = ccGraphShapeProps['cc-topic-node']

  getDefaultProps(): CCTopicNodeShape['props'] {
    const defaultProps = getDefaultCCTopicNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCTopicNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCTopicNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Topic Title"
          value={shape.props.topic_title}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Total Lessons"
          value={shape.props.total_number_of_lessons_for_topic}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Topic Type"
          value={shape.props.topic_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Assessment Type"
          value={shape.props.topic_assessment_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Topic ID"
          value={shape.props.topic_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 