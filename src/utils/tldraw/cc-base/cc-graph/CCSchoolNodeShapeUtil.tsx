import { CCBaseShapeUtil } from '../CCBaseShapeUtil';
import { CCBaseShape } from '../cc-types';
import { NodeProperty } from './cc-graph-shared';
import { ccGraphShapeProps, getDefaultCCSchoolNodeProps } from './cc-graph-props';
import { getNodeStyles } from './cc-graph-styles';
import { NODE_THEMES, NODE_TYPE_THEMES } from './cc-graph-styles';
import { CCSchoolNodeProps } from './cc-graph-types';

export interface CCSchoolNodeShape extends CCBaseShape {
  type: 'cc-school-node';
  props: CCSchoolNodeProps;
}

export class CCSchoolNodeShapeUtil extends CCBaseShapeUtil<CCSchoolNodeShape> {
  static type = 'cc-school-node' as const;
  static props = ccGraphShapeProps['cc-school-node'];

  getDefaultProps(): CCSchoolNodeShape['props'] {
    const defaultProps = getDefaultCCSchoolNodeProps();
    const theme = NODE_THEMES[NODE_TYPE_THEMES[CCSchoolNodeShapeUtil.type]];
    return {
      ...defaultProps,
      headerColor: theme.headerColor,
    };
  }

  DefaultComponent = () => null;

  renderContent = (shape: CCSchoolNodeShape) => {
    const styles = getNodeStyles(shape.type);
    return (
      <div style={styles.container}>
        <NodeProperty 
          label="School Name"
          value={shape.props.school_name}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="School Website"
          value={shape.props.school_website}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
        <NodeProperty 
          label="School UUID"
          value={shape.props.school_uuid}
          labelStyle={styles.property.label}
          valueStyle={styles.property.value}
        />
      </div>
    );
  };
} 