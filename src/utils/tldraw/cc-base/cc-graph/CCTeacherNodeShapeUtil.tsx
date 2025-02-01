import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { 
  DefaultNodeComponent,
  NodeErrorDisplay,
  checkShapeState,
  checkDefaultComponent 
} from './cc-graph-shared'
import { ccGraphShapeProps, getDefaultCCTeacherNodeProps } from './cc-graph-props'
import { getNodeStyles, NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles'
import { CCTeacherNodeProps } from './cc-graph-types'

export interface CCTeacherNodeShape extends CCBaseShape {
  type: 'cc-teacher-node'
  props: CCTeacherNodeProps
}

export class CCTeacherNodeShapeUtil extends CCBaseShapeUtil<CCTeacherNodeShape> {
  static type = 'cc-teacher-node' as const
  static props = ccGraphShapeProps['cc-teacher-node']

  getDefaultProps(): CCTeacherNodeShape['props'] {
    const defaultProps = getDefaultCCTeacherNodeProps()
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCTeacherNodeShapeUtil.type]]
    return {
      ...defaultProps,
      headerColor: theme.headerColor
    }
  }

  renderContent = (shape: CCTeacherNodeShape) => {
    const { props } = shape
    const { state, defaultComponent } = props
    const styles = getNodeStyles(shape.type)
    const isPageChild = state?.isPageChild ?? true

    // Check state and default component
    const stateError = checkShapeState(state)
    if (stateError.hasError) {
      return <NodeErrorDisplay message={stateError.error.message} details={stateError.error.details} />
    }

    const defaultComponentError = checkDefaultComponent(defaultComponent)
    if (defaultComponentError.hasError) {
      return <NodeErrorDisplay message={defaultComponentError.error.message} details={defaultComponentError.error.details} />
    }

    if (isPageChild) {
      // Define properties to show for page-level view
      const properties = [
        { label: 'Teacher Name', value: props.teacher_name_formal },
        { label: 'Teacher Code', value: props.teacher_code },
        { label: 'Email', value: props.teacher_email },
        { label: 'Node Path', value: props.path }
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

    // Simplified view when child of another shape
    return (
      <div style={styles.container}>
        <div style={styles.property.wrapper}>
          <span style={styles.property.label}>Code:</span>
          <span style={styles.property.value}>{props.teacher_code}</span>
        </div>
      </div>
    )
  }
} 