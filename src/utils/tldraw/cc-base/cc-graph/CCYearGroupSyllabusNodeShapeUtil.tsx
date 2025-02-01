import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCYearGroupSyllabusNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCYearGroupSyllabusNodeProps } from './cc-graph-types'

export interface CCYearGroupSyllabusNodeShape extends CCBaseShape {
  type: 'cc-year-group-syllabus-node'
  props: CCYearGroupSyllabusNodeProps
}

export class CCYearGroupSyllabusNodeShapeUtil extends CCBaseShapeUtil<CCYearGroupSyllabusNodeShape> {
  static type = 'cc-year-group-syllabus-node' as const
  static props = ccGraphShapeProps['cc-year-group-syllabus-node']

  getDefaultProps(): CCYearGroupSyllabusNodeShape['props'] {
    const defaultProps = getDefaultCCYearGroupSyllabusNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCYearGroupSyllabusNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCYearGroupSyllabusNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Syllabus Name"
          value={shape.props.yr_syllabus_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Year Group"
          value={shape.props.yr_syllabus_year_group}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject"
          value={shape.props.yr_syllabus_subject}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Subject Code"
          value={shape.props.yr_syllabus_subject_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Syllabus ID"
          value={shape.props.yr_syllabus_id}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 