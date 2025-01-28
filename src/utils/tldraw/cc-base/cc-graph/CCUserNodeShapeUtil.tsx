import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { 
  DefaultNodeComponent, 
  NodeErrorDisplay,
  checkShapeState,
  checkDefaultComponent
} from './shared'
import { ccGraphShapeProps, getDefaultCCUserNodeProps } from '../cc-graph-props'
import { CCUserNodeProps } from '../cc-graph-types'
import { getNodeStyles, NODE_THEMES, NODE_TYPE_THEMES } from './node-styles'

export interface CCUserNodeShape extends CCBaseShape {
  type: 'cc-user-node'
  props: CCUserNodeProps
}

export class CCUserNodeShapeUtil extends CCBaseShapeUtil<CCUserNodeShape> {
  static type = 'cc-user-node' as const
  static props = ccGraphShapeProps['cc-user-node']

  getDefaultProps(): CCUserNodeProps {
    const defaultProps = getDefaultCCUserNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCUserNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
      backgroundColor: theme.backgroundColor,
    }
  }

  renderContent = (shape: CCUserNodeShape) => {
    const { props } = shape
    const { state, defaultComponent } = props
    const styles = getNodeStyles(shape.type)

    // Check state and default component
    const stateError = checkShapeState(state)
    if (stateError.hasError) {
      return <NodeErrorDisplay message={stateError.error.message} details={stateError.error.details} />
    }

    const defaultComponentError = checkDefaultComponent(defaultComponent)
    if (defaultComponentError.hasError) {
      return <NodeErrorDisplay message={defaultComponentError.error.message} details={defaultComponentError.error.details} />
    }

    // Define properties to show based on view type
    const properties = defaultComponent ? [
      { label: 'User Name', value: props.user_name },
      { label: 'User Email', value: props.user_email },
      { label: 'User Type', value: props.user_type },
      { label: 'User ID', value: props.user_id },
      { label: 'Node Path', value: props.path },
      { label: 'Worker Node Data', value: props.worker_node_data }
    ] : [
      { label: 'User Name', value: props.user_name },
      { label: 'User Email', value: props.user_email }
    ]

    return (
      <div style={styles.container}>
        {defaultComponent && <DefaultNodeComponent path={props.path} />}
        {properties.map((prop, index) => (
          <div key={index} style={styles.property.wrapper}>
            <span style={styles.property.label}>{prop.label}:</span>
            <span style={styles.property.value}>{prop.value}</span>
          </div>
        ))}
      </div>
    )
  }
} 