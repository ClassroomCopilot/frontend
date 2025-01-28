import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './shared'
import { ccGraphShapeProps, getDefaultCCTopicLessonNodeProps } from '../cc-graph-props'
import { getNodeStyles } from './node-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'
import { CCTopicLessonNodeProps } from '../cc-graph-types'

export interface CCTopicLessonNodeShape extends CCBaseShape {
  type: 'cc-topic-lesson-node'
  props: CCTopicLessonNodeProps
}

export class CCTopicLessonNodeShapeUtil extends CCBaseShapeUtil<CCTopicLessonNodeShape> {
  static type = 'cc-topic-lesson-node' as const
  static props = ccGraphShapeProps['cc-topic-lesson-node']

  getDefaultProps(): CCTopicLessonNodeShape['props'] {
    const defaultProps = getDefaultCCTopicLessonNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCTopicLessonNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCTopicLessonNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Lesson Title"
          value={shape.props.topic_lesson_title}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Lesson Type"
          value={shape.props.topic_lesson_type}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Length"
          value={shape.props.topic_lesson_length}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Skills Learned"
          value={shape.props.topic_lesson_skills_learned}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Suggested Activities"
          value={shape.props.topic_lesson_suggested_activities}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Web Links"
          value={shape.props.topic_lesson_weblinks}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Lesson ID"
          value={shape.props.topic_lesson_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 