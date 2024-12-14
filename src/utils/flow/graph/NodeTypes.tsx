import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface ExtendedNodeProps extends NodeProps {
  layoutDirection: 'TB' | 'LR';
}

const DefaultNode: React.FC<ExtendedNodeProps> = ({ data, layoutDirection }) => {
  const isHorizontal = layoutDirection === 'LR';
  return (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, backgroundColor: '#f0f0f0', minWidth: 150 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{data.label as string}</div>
      {data && Object.entries(data).map(([key, value]) => (
        key !== 'label' && <div key={key}><strong>{key}:</strong> {value as string}</div>
      ))}
      <Handle type="source" position={isHorizontal ? Position.Right : Position.Bottom} style={{ background: '#555' }} />
      <Handle type="target" position={isHorizontal ? Position.Left : Position.Top} style={{ background: '#555' }} />
    </div>
  );
};

const UserNode: React.FC<ExtendedNodeProps> = ({ data, layoutDirection }) => (
  <DefaultNode
    data={{
      label: data.user_name as string,
      'User ID': data.user_id as string,
      'User Email': data.user_email as string,
      'User Type': data.user_type as string,
      'User DB ID': data.worker_db_name as string,
    }}
    id={data.user_id as string}
    type='userNode'
    dragging={false}
    zIndex={1}
    layoutDirection={layoutDirection}
    isConnectable={false}
    positionAbsoluteX={0}
    positionAbsoluteY={0}
  />
);

const TeacherNode: React.FC<ExtendedNodeProps> = ({ data, layoutDirection }) => (
  <DefaultNode
    data={{
      label: data.teacher_name_formal,
      'Teacher ID': data.teacher_code,
      'Teacher Email': data.teacher_email,
    }}
    id={data.unique_id as string}
    type='userNode'
    dragging={false}
    zIndex={1}
    layoutDirection={layoutDirection}
    isConnectable={false}
    positionAbsoluteX={0}
    positionAbsoluteY={0}
  />
);

const TeacherTimetableNode: React.FC<ExtendedNodeProps> = ({ data, layoutDirection }) => (
  <DefaultNode
    data={{
      label: data.label,
    }}
    id={data.unique_id as string}
    type='userNode'
    dragging={false}
    zIndex={1}
    layoutDirection={layoutDirection}
    isConnectable={false}
    positionAbsoluteX={0}
    positionAbsoluteY={0}
  />
);

const SubjectClassNode: React.FC<ExtendedNodeProps> = ({ data, layoutDirection }) => (
  <DefaultNode
    data={{
      label: data.subject_class_code,
      'Year Group': data.year_group,
      'Subject': data.subject,
      'Subject Code': data.subject_code,
    }}
    id={data.unique_id as string}
    type='userNode'
    dragging={false}
    zIndex={1}
    layoutDirection={layoutDirection}
    isConnectable={false}
    positionAbsoluteX={0}
    positionAbsoluteY={0}
  />
);

export const nodeTypes = {
  default: DefaultNode,
  userNode: UserNode,
  teacherNode: TeacherNode,
  teacherTimetableNode: TeacherTimetableNode,
  subjectClassNode: SubjectClassNode,
};