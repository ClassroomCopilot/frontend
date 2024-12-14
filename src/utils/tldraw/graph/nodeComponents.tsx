import React from 'react';
import { AllNodeShapes } from './graph-shape-types';
import { TLDefaultColorTheme } from '@tldraw/tldraw';

interface NodeComponentProps<T extends AllNodeShapes = AllNodeShapes> {
  shape: T;
  theme: TLDefaultColorTheme;
}

interface BaseNodeProps {
  __primarylabel__: string;
  unique_id: string;
}

interface TeacherNodeProps extends BaseNodeProps {
  teacher_name_formal: string;
  teacher_code: string;
  teacher_email: string;
  worker_db_name: string;
}
interface StudentNodeProps extends BaseNodeProps {
  student_name_formal: string;
  student_code: string;
  student_email: string;
  worker_db_name: string;
}

interface UserNodeProps extends BaseNodeProps {
  user_name: string;
  user_email: string;
  user_type: string;
}

interface CalendarNodeProps extends BaseNodeProps {
  name: string;
  start_date: string;
  end_date: string;
}

interface CalendarYearNodeProps extends BaseNodeProps {
  year: string;
}

interface CalendarMonthNodeProps extends BaseNodeProps {
  month_name: string;
  year: string;
}

interface CalendarWeekNodeProps extends BaseNodeProps {
  start_date: string;
  iso_week: string;
}

interface CalendarDayNodeProps extends BaseNodeProps {
  day_of_week: string;
  date: string;
}

interface CalendarTimeChunkNodeProps extends BaseNodeProps {
  start_time: string;
  end_time: string;
}

interface SchoolNodeProps extends BaseNodeProps {
  school_name: string;
  school_website: string;
}

interface DepartmentNodeProps extends BaseNodeProps {
  department_name: string;
}

interface RoomNodeProps extends BaseNodeProps {
  room_name: string;
  room_code: string;
}

interface SubjectClassNodeProps extends BaseNodeProps {
  subject_class_code: string;
  year_group: string;
  subject: string;
}

interface YearGroupNodeProps extends BaseNodeProps {
  year_group: string;
}

interface KeyStageNodeProps extends BaseNodeProps {
  key_stage: string;
}

interface KeyStageSyllabusNodeProps extends BaseNodeProps {
  ks_syllabus_id: string;
  ks_syllabus_subject: string;
}

interface YearGroupSyllabusNodeProps extends BaseNodeProps {
  yr_syllabus_id: string;
  yr_syllabus_subject: string;
}

interface SubjectNodeProps extends BaseNodeProps {
  subject_name: string;
  subject_code: string;
}

interface TopicNodeProps extends BaseNodeProps {
  topic_title: string;
  topic_id: string;
  total_number_of_lessons_for_topic: string;
  topic_type: string;
  topic_assessment_type: string;
}

interface TopicLessonNodeProps extends BaseNodeProps {
  topic_lesson_title: string;
  topic_lesson_id: string;
  topic_lesson_type: string;
  topic_lesson_length: string;
  topic_lesson_suggested_activities: string;
  topic_lesson_skills_learned: string;
  topic_lesson_weblinks: string;
}

interface LearningStatementNodeProps extends BaseNodeProps {
  lesson_learning_statement: string;
  lesson_learning_statement_id: string;
  lesson_learning_statement_type: string;
}

interface ScienceLabNodeProps extends BaseNodeProps {
  science_lab_title: string;
  science_lab_id: string;
  science_lab_summary: string;
  science_lab_requirements: string;
  science_lab_procedure: string;
  science_lab_safety: string;
  science_lab_weblinks: string;
}

interface SchoolTimetableNodeProps extends BaseNodeProps {
  start_date: string;
  end_date: string;
}

interface AcademicYearNodeProps extends BaseNodeProps {
  year: string;
}

interface AcademicTermNodeProps extends BaseNodeProps {
  term_name: string;
  term_number: string;
  start_date: string;
  end_date: string;
}

interface AcademicWeekNodeProps extends BaseNodeProps {
  start_date: string;
  week_type: string;
  academic_week_number: string;
}

interface AcademicDayNodeProps extends BaseNodeProps {
  day_of_week: string;
  day_type: string;
  date: string;
}

interface AcademicPeriodNodeProps extends BaseNodeProps {
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  period_code: string;
}

interface RegistrationPeriodNodeProps extends BaseNodeProps {
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  period_code: string;
}

interface TimetableLessonNodeProps extends BaseNodeProps {
  subject_class: string;
  date: string;
  period_code: string;
}

interface PlannedLessonNodeProps extends BaseNodeProps {
  subject_class: string;
  date: string;
  period_code: string;
  planning_status: string;
  teacher_code: string;
  year_group: string;
  subject: string;
}

const DefaultNodeComponent: React.FC<NodeComponentProps> = ({ shape }) => (
  <>
    <div className="w-full flex justify-center" style={{ marginBottom: '5px' }}>
      <div
        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
        style={{ color: 'white', fontWeight: 'bold' }}
      >
        {(shape.props.__primarylabel__).toUpperCase()}
      </div>
    </div>
  </>
);

// Users
const UserNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as UserNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>User Name: {props.user_name}</div>
      <div>User Email: {props.user_email}</div>
    </>
  );
};

const DeveloperNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as UserNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>User Name: {props.user_name}</div>
      <div>Use Email: {props.user_email}</div>
    </>
  );
};

const TeacherNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as TeacherNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Teacher Name: {props.teacher_name_formal}</div>
      <div>Teacher Code: {props.teacher_code}</div>
      <div>Email: {props.teacher_email}</div>
    </>
  );
};

const StudentNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as StudentNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Student Name: {props.student_name_formal}</div>
      <div>Student Code: {props.student_code}</div>
      <div>Email: {props.student_email}</div>
    </>
  );
};

// Calendar
const CalendarNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Calendar Name: {props.name}</div>
      <div>Start Date: {props.start_date}</div>
      <div>End Date: {props.end_date}</div>
    </>
  );
};

const CalendarYearNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarYearNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Year: {props.year}</div>
    </>
  );
};

const CalendarMonthNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarMonthNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Month: {props.month_name}</div>
      <div>Year: {props.year}</div>
    </>
  );
};

const CalendarWeekNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarWeekNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Week Start Date: {props.start_date}</div>
      <div>ISO Week: {props.iso_week}</div>
    </>
  );
};

const CalendarDayNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarDayNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Day of Week: {props.day_of_week}</div>
      <div>Date: {props.date}</div>
    </>
  );
};

const CalendarTimeChunkNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as CalendarTimeChunkNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Start Time: {props.start_time}</div>
      <div>End Time: {props.end_time}</div>
    </>
  );
};

// Schools
const SchoolNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as SchoolNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>School Name: {props.school_name}</div>
      <div>School Website: {props.school_website}</div>
    </>
  );
};

const DepartmentNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as DepartmentNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Department Name: {props.department_name}</div>
    </>
  );
};

const RoomNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as RoomNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Room Name: {props.room_name}</div>
      <div>Room Code: {props.room_code}</div>
    </>
  );
};

const SubjectClassNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as SubjectClassNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
    <div>Subject Class: {props.subject_class_code}</div>
    <div>Year Group: {props.year_group}</div>
    <div>Subject: {props.subject}</div>
    </>
  );
};

// Curriculum
const PastoralStructureNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
    </>
  );
};

const YearGroupNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as YearGroupNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Year Group: {props.year_group}</div>
    </>
  );
};

const CurriculumStructureNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
  </>
  );
};

const KeyStageNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as KeyStageNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Key Stage: {props.key_stage}</div>
    </>
  );
};

const KeyStageSyllabusNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as KeyStageSyllabusNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Syllabus ID: {props.ks_syllabus_id}</div>
      <div>Subject: {props.ks_syllabus_subject}</div>
    </>
  );
};

const YearGroupSyllabusNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as YearGroupSyllabusNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Syllabus ID: {props.yr_syllabus_id}</div>
      <div>Subject: {props.yr_syllabus_subject}</div>
    </>
  );
};

const SubjectNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as SubjectNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Subject: {props.subject_name}</div>
      <div>Code: {props.subject_code}</div>
    </>
  );
};

const TopicNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as TopicNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Title: {props.topic_title}</div>
      <div>ID: {props.topic_id}</div>
      <div>Lessons: {props.total_number_of_lessons_for_topic}</div>
      <div>Type: {props.topic_type}</div>
      <div>Assessment Type: {props.topic_assessment_type}</div>
    </>
  );
};

const TopicLessonNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as TopicLessonNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Title: {props.topic_lesson_title}</div>
      <div>ID: {props.topic_lesson_id}</div>
      <div>Type: {props.topic_lesson_type}</div>
      <div>Length: {props.topic_lesson_length}</div>
      <div>Suggested Activities: {props.topic_lesson_suggested_activities}</div>
      <div>Skills Learned: {props.topic_lesson_skills_learned}</div>
      <div>Web Links: {props.topic_lesson_weblinks}</div>
    </>
  );
};

const LearningStatementNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as LearningStatementNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Learning Statement: {props.lesson_learning_statement}</div>
      <div>ID: {props.lesson_learning_statement_id}</div>
      <div>Type: {props.lesson_learning_statement_type}</div>
    </>
  );
};


const ScienceLabNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as ScienceLabNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Title: {props.science_lab_title}</div>
      <div>ID: {props.science_lab_id}</div>
      <div>Summary: {props.science_lab_summary}</div>
      <div>Requirements: {props.science_lab_requirements}</div>
      <div>Procedure: {props.science_lab_procedure}</div>
      <div>Safety: {props.science_lab_safety}</div>
      <div>Web Links: {props.science_lab_weblinks}</div>
    </>
  );
};

// School Timetable
const SchoolTimetableNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as SchoolTimetableNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Start Date: {props.start_date}</div>
      <div>End Date: {props.end_date}</div>
    </>
  );
};

const AcademicYearNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as AcademicYearNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Year: {props.year}</div>
    </>
  );
};

const AcademicTermNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as AcademicTermNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Term Name: {props.term_name}</div>
      <div>Term Number: {props.term_number}</div>
      <div>Start Date: {props.start_date}</div>
      <div>End Date: {props.end_date}</div>
    </>
  );
};

const AcademicWeekNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as AcademicWeekNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Start Date: {props.start_date}</div>
      <div>Week Type: {props.week_type}</div>
      <div>Academic Week Number: {props.academic_week_number}</div>
    </>
  );
};

const AcademicDayNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as AcademicDayNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Day of Week: {props.day_of_week}</div>
      <div>Day Type: {props.day_type}</div>
      <div>Date: {props.date}</div>
    </>
  );
};

const AcademicPeriodNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as AcademicPeriodNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Name: {props.name}</div>
      <div>Date: {props.date}</div>
      <div>Start Time: {props.start_time}</div>
      <div>End Time: {props.end_time}</div>
      <div>Period Code: {props.period_code}</div>
    </>
  );
};


const RegistrationPeriodNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as RegistrationPeriodNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Name: {props.name}</div>
      <div>Date: {props.date}</div>
      <div>Start Time: {props.start_time}</div>
      <div>End Time: {props.end_time}</div>
      <div>Period Code: {props.period_code}</div>
    </>
  );
};

// Teacher Timetable
const TeacherTimetableNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
    </>
  );
};

const TimetableLessonNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as TimetableLessonNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Subject Class: {props.subject_class}</div>
      <div>Date: {props.date}</div>
      <div>Period Code: {props.period_code}</div>
    </>
  );
};

const PlannedLessonNodeComponent: React.FC<NodeComponentProps> = ({ shape, theme }) => {
  const props = shape.props as PlannedLessonNodeProps;
  return (
    <>
      <DefaultNodeComponent shape={shape} theme={theme} />
      <div>Subject Class: {props.subject_class}</div>
      <div>Year Group: {props.year_group}</div>
      <div>Subject: {props.subject}</div>
      <div>Teacher Code: {props.teacher_code}</div>
      <div>Planning Status: {props.planning_status}</div>
    </>
  );
};

const nodeComponents: { [key: string]: React.FC<NodeComponentProps> } = {
  user_node: UserNodeComponent,
  teacher_node: TeacherNodeComponent,
  student_node: StudentNodeComponent,
  timetable_lesson_node: TimetableLessonNodeComponent,
  developer_node: DeveloperNodeComponent,
  school_node: SchoolNodeComponent,
  department_node: DepartmentNodeComponent,
  planned_lesson_node: PlannedLessonNodeComponent,
  registration_period_node: RegistrationPeriodNodeComponent,
  teacher_timetable_node: TeacherTimetableNodeComponent,
  academic_year_node: AcademicYearNodeComponent,
  academic_term_node: AcademicTermNodeComponent,
  academic_week_node: AcademicWeekNodeComponent,
  academic_day_node: AcademicDayNodeComponent,
  academic_period_node: AcademicPeriodNodeComponent,
  key_stage_node: KeyStageNodeComponent,
  key_stage_syllabus_node: KeyStageSyllabusNodeComponent,
  year_group_syllabus_node: YearGroupSyllabusNodeComponent,
  subject_node: SubjectNodeComponent,
  topic_node: TopicNodeComponent,
  topic_lesson_node: TopicLessonNodeComponent,
  learning_statement_node: LearningStatementNodeComponent,
  science_lab_node: ScienceLabNodeComponent,
  school_timetable_node: SchoolTimetableNodeComponent,
  calendar_node: CalendarNodeComponent,
  calendar_year_node: CalendarYearNodeComponent,
  calendar_month_node: CalendarMonthNodeComponent,
  calendar_week_node: CalendarWeekNodeComponent,
  calendar_day_node: CalendarDayNodeComponent,
  calendar_time_chunk_node: CalendarTimeChunkNodeComponent,
  year_group_node: YearGroupNodeComponent,
  pastoral_structure_node: PastoralStructureNodeComponent,
  curriculum_structure_node: CurriculumStructureNodeComponent,
  room_node: RoomNodeComponent,
  subject_class_node: SubjectClassNodeComponent,
};

export const getNodeComponent = (shape: AllNodeShapes, theme: TLDefaultColorTheme) => {
  const Component = nodeComponents[shape.type] || DefaultNodeComponent;
  return <Component shape={shape} theme={theme} />;
};