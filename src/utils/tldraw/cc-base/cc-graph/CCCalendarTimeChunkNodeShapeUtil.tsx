import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { NodeProperty } from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCCalendarTimeChunkNodeProps } from './cc-graph-props'
import { getNodeStyles } from './cc-graph-styles'
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCCalendarTimeChunkNodeProps } from './cc-graph-types'

export interface CCCalendarTimeChunkNodeShape extends CCBaseShape {
  type: 'cc-calendar-time-chunk-node'
  props: CCCalendarTimeChunkNodeProps
}

export class CCCalendarTimeChunkNodeShapeUtil extends CCBaseShapeUtil<CCCalendarTimeChunkNodeShape> {
  static type = 'cc-calendar-time-chunk-node' as const
  static props = ccGraphShapeProps['cc-calendar-time-chunk-node']

  getDefaultProps(): CCCalendarTimeChunkNodeShape['props'] {
    const defaultProps = getDefaultCCCalendarTimeChunkNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCCalendarTimeChunkNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    }
  }

  // Override to nullify the default node component
  DefaultComponent = () => null

  renderContent = (shape: CCCalendarTimeChunkNodeShape) => {
    const styles = getNodeStyles(shape.type)
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Start Time"
          value={shape.props.start_time}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="End Time"
          value={shape.props.end_time}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    )
  }
} 