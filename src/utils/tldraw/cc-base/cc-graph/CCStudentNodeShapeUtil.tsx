import { CCBaseShapeUtil } from '../CCBaseShapeUtil';
import { CCBaseShape } from '../cc-types';
import { NodeProperty } from './cc-graph-shared';
import { ccGraphShapeProps, getDefaultCCStudentNodeProps } from './cc-graph-props';
import { getNodeStyles } from './cc-graph-styles';
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles';
import { CCStudentNodeProps } from './cc-graph-types';

export interface CCStudentNodeShape extends CCBaseShape {
  type: 'cc-student-node';
  props: CCStudentNodeProps;
}

export class CCStudentNodeShapeUtil extends CCBaseShapeUtil<CCStudentNodeShape> {
  static type = 'cc-student-node' as const;
  static props = ccGraphShapeProps['cc-student-node'];

  getDefaultProps(): CCStudentNodeShape['props'] {
    const defaultProps = getDefaultCCStudentNodeProps();
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCStudentNodeShapeUtil.type]];
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    };
  }

  // Override to nullify the default node component
  DefaultComponent = () => null;

  renderContent = (shape: CCStudentNodeShape) => {
    const styles = getNodeStyles(shape.type);
    
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="Student Name"
          value={shape.props.student_name_formal}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Student Code"
          value={shape.props.student_code}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="Email"
          value={shape.props.student_email}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    );
  };
} 