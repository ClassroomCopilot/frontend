import { T, TLBinding, TLShapeId } from '@tldraw/tldraw'
import { baseShapeProps } from '../cc-props'
import { ShapeState } from './cc-graph-types'

// State props validation
const stateProps = T.object({
  parentId: T.optional(T.string.nullable()),
  isPageChild: T.optional(T.boolean.nullable()),
  hasChildren: T.optional(T.boolean.nullable()),
  bindings: T.optional(T.arrayOf(T.object({})).nullable())
})

// Base props for all nodes
const graphBaseProps = {
  ...baseShapeProps,
  __primarylabel__: T.string,
  unique_id: T.string,
  path: T.string,
  created: T.string,
  merged: T.string,
  state: T.optional(stateProps.nullable()),
  defaultComponent: T.optional(T.boolean.nullable())
}

// Props for specific node types
export const ccGraphShapeProps = {
  'cc-user-node': {
    ...graphBaseProps,
    user_name: T.string,
    user_email: T.string,
    user_type: T.string,
    user_id: T.string,
    worker_node_data: T.string,
  },
  'cc-teacher-node': {
    ...graphBaseProps,
    teacher_code: T.string,
    teacher_name_formal: T.string,
    teacher_email: T.string,
    user_db_name: T.string,
    worker_db_name: T.string,
  },
  'cc-student-node': {
    ...graphBaseProps,
    student_code: T.string,
    student_name_formal: T.string,
    student_email: T.string,
    worker_db_name: T.string,
  },
  'cc-calendar-node': {
    ...graphBaseProps,
    name: T.string,
    calendar_type: T.string,
    calendar_name: T.string,
    start_date: T.string,
    end_date: T.string,
  },
  'cc-calendar-year-node': {
    ...graphBaseProps,
    year: T.string,
  },
  'cc-calendar-month-node': {
    ...graphBaseProps,
    year: T.string,
    month: T.string,
    month_name: T.string,
  },
  'cc-calendar-week-node': {
    ...graphBaseProps,
    start_date: T.string,
    week_number: T.string,
    iso_week: T.string,
  },
  'cc-calendar-day-node': {
    ...graphBaseProps,
    date: T.string,
    day_of_week: T.string,
    iso_day: T.string,
  },
  'cc-calendar-time-chunk-node': {
    ...graphBaseProps,
    start_time: T.string,
    end_time: T.string,
  },
  'cc-school-node': {
    ...graphBaseProps,
    school_uuid: T.string,
    school_name: T.string,
    school_website: T.string,
  },
  'cc-department-node': {
    ...graphBaseProps,
    department_name: T.string,
  },
  'cc-room-node': {
    ...graphBaseProps,
    room_code: T.string,
    room_name: T.string,
  },
  'cc-subject-class-node': {
    ...graphBaseProps,
    subject_class_code: T.string,
    year_group: T.string,
    subject: T.string,
    subject_code: T.string,
  },
  'cc-pastoral-structure-node': {
    ...graphBaseProps,
  },
  'cc-year-group-node': {
    ...graphBaseProps,
    year_group: T.string,
    year_group_name: T.string,
  },
  'cc-curriculum-structure-node': {
    ...graphBaseProps,
  },
  'cc-key-stage-node': {
    ...graphBaseProps,
    key_stage_name: T.string,
    key_stage: T.string,
  },
  'cc-key-stage-syllabus-node': {
    ...graphBaseProps,
    ks_syllabus_id: T.string,
    ks_syllabus_name: T.string,
    ks_syllabus_key_stage: T.string,
    ks_syllabus_subject: T.string,
    ks_syllabus_subject_code: T.string,
  },
  'cc-year-group-syllabus-node': {
    ...graphBaseProps,
    yr_syllabus_id: T.string,
    yr_syllabus_name: T.string,
    yr_syllabus_year_group: T.string,
    yr_syllabus_subject: T.string,
    yr_syllabus_subject_code: T.string,
  },
  'cc-subject-node': {
    ...graphBaseProps,
    subject_code: T.string,
    subject_name: T.string,
  },
  'cc-topic-node': {
    ...graphBaseProps,
    topic_id: T.string,
    topic_title: T.string,
    total_number_of_lessons_for_topic: T.string,
    topic_type: T.string,
    topic_assessment_type: T.string,
  },
  'cc-topic-lesson-node': {
    ...graphBaseProps,
    topic_lesson_id: T.string,
    topic_lesson_title: T.string,
    topic_lesson_type: T.string,
    topic_lesson_length: T.string,
    topic_lesson_skills_learned: T.string,
    topic_lesson_suggested_activities: T.string,
    topic_lesson_weblinks: T.string,
  },
  'cc-learning-statement-node': {
    ...graphBaseProps,
    lesson_learning_statement_id: T.string,
    lesson_learning_statement: T.string,
    lesson_learning_statement_type: T.string,
  },
  'cc-science-lab-node': {
    ...graphBaseProps,
    science_lab_id: T.string,
    science_lab_title: T.string,
    science_lab_summary: T.string,
    science_lab_requirements: T.string,
    science_lab_procedure: T.string,
    science_lab_safety: T.string,
    science_lab_weblinks: T.string,
  },
  'cc-teacher-timetable-node': {
    ...graphBaseProps,
    teacher_id: T.string,
    start_date: T.string,
    end_date: T.string,
  },
  'cc-timetable-lesson-node': {
    ...graphBaseProps,
    subject_class: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
  },
  'cc-planned-lesson-node': {
    ...graphBaseProps,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
    subject_class: T.string,
    year_group: T.string,
    subject: T.string,
    teacher_code: T.string,
    planning_status: T.string,
    topic_code: T.string,
    topic_name: T.string,
    lesson_code: T.string,
    lesson_name: T.string,
    learning_statement_codes: T.string,
    learning_statements: T.string,
    learning_resource_codes: T.string,
    learning_resources: T.string,
  },
  'cc-school-timetable-node': {
    ...graphBaseProps,
    start_date: T.string,
    end_date: T.string,
  },
  'cc-academic-year-node': {
    ...graphBaseProps,
    year: T.string,
  },
  'cc-academic-term-node': {
    ...graphBaseProps,
    term_name: T.string,
    term_number: T.string,
    start_date: T.string,
    end_date: T.string,
  },
  'cc-academic-week-node': {
    ...graphBaseProps,
    academic_week_number: T.string,
    start_date: T.string,
    week_type: T.string,
  },
  'cc-academic-day-node': {
    ...graphBaseProps,
    academic_day: T.string,
    date: T.string,
    day_of_week: T.string,
    day_type: T.string,
  },
  'cc-academic-period-node': {
    ...graphBaseProps,
    name: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
  },
  'cc-registration-period-node': {
    ...graphBaseProps,
    name: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
  },
  'cc-department-structure-node': {
    ...graphBaseProps,
    department_structure_type: T.string,
  },
  'cc-user-teacher-timetable-node': {
    ...graphBaseProps,
    school_db_name: T.string,
    school_timetable_id: T.string,
  },
  'cc-user-timetable-lesson-node': {
    ...graphBaseProps,
    subject_class: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
    school_db_name: T.string,
    school_period_id: T.string,
  },
} as const

// Default props getters
export const getDefaultBaseProps = () => ({
  w: 200 as number,
  h: 200 as number,
  headerColor: '#3e6589' as string,
  backgroundColor: '#f0f0f0' as string,
  title: 'Untitled' as string,
  isLocked: false as boolean,
  unique_id: '' as string,
  path: '' as string,
  created: '' as string,
  merged: '' as string,
  state: {
    parentId: null as TLShapeId | null,
    isPageChild: true as boolean | null,
    hasChildren: null as boolean | null,
    bindings: null as TLBinding[] | null
  } as ShapeState | null,
  defaultComponent: true as boolean | null
})

export const getDefaultCCUserNodeProps = () => ({
  ...getDefaultBaseProps(),
  __primarylabel__: 'User',
  user_name: '',
  user_email: '',
  user_type: '',
  user_id: '',
  worker_node_data: ''
})

export const getDefaultCCTeacherNodeProps = () => ({
  ...getDefaultBaseProps(),
  __primarylabel__: 'Teacher',
  teacher_code: '',
  teacher_name_formal: '',
  teacher_email: '',
  user_db_name: '',
  worker_db_name: '',
})

export const getDefaultCCStudentNodeProps = () => ({
  ...getDefaultBaseProps(),
  __primarylabel__: 'Student',
  student_code: '',
  student_name_formal: '',
  student_email: '',
  worker_db_name: '',
})

export const getDefaultCCCalendarNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar',
  __primarylabel__: 'Calendar',
  name: '',
  calendar_type: '',
  calendar_name: '',
  start_date: '',
  end_date: '',
})

export const getDefaultCCCalendarYearNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar Year',
  __primarylabel__: 'Calendar Year',
  year: '',
})

export const getDefaultCCCalendarMonthNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar Month',
  __primarylabel__: 'Calendar Month',
  year: '',
  month: '',
  month_name: '',
})

export const getDefaultCCCalendarWeekNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar Week',
  __primarylabel__: 'Calendar Week',
  start_date: '',
  week_number: '',
  iso_week: '',
})

export const getDefaultCCCalendarDayNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar Day',
  __primarylabel__: 'Calendar Day',
  date: '',
  day_of_week: '',
  iso_day: '',
})

export const getDefaultCCCalendarTimeChunkNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Calendar Time Chunk',
  __primarylabel__: 'Calendar Time Chunk',
  start_time: '',
  end_time: '',
})

export const getDefaultCCSchoolNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'School',
  __primarylabel__: 'School',
  school_uuid: '',
  school_name: '',
  school_website: '',
})

export const getDefaultCCDepartmentNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Department',
  __primarylabel__: 'Department',
  department_name: '',
})

export const getDefaultCCRoomNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Room',
  __primarylabel__: 'Room',
  room_code: '',
  room_name: '',
})

export const getDefaultCCSubjectClassNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Subject Class',
  __primarylabel__: 'Subject Class',
  subject_class_code: '',
  year_group: '',
  subject: '',
  subject_code: '',
})

export const getDefaultCCPastoralStructureNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Pastoral Structure',
  __primarylabel__: 'Pastoral Structure',
  pastoral_structure_type: '',
})

export const getDefaultCCYearGroupNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Year Group',
  __primarylabel__: 'Year Group',
  year_group: '',
  year_group_name: '',
})

export const getDefaultCCCurriculumStructureNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Curriculum Structure',
  __primarylabel__: 'Curriculum Structure',
  curriculum_structure_type: '',
})

export const getDefaultCCKeyStageNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Key Stage',
  __primarylabel__: 'Key Stage',
  key_stage_name: '',
  key_stage: '',
})

export const getDefaultCCKeyStageSyllabusNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Key Stage Syllabus',
  __primarylabel__: 'Key Stage Syllabus',
  ks_syllabus_id: '',
  ks_syllabus_name: '',
  ks_syllabus_key_stage: '',
  ks_syllabus_subject: '',
  ks_syllabus_subject_code: '',
})

export const getDefaultCCYearGroupSyllabusNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Year Group Syllabus',
  __primarylabel__: 'Year Group Syllabus',
  yr_syllabus_id: '',
  yr_syllabus_name: '',
  yr_syllabus_year_group: '',
  yr_syllabus_subject: '',
  yr_syllabus_subject_code: '',
})

export const getDefaultCCSubjectNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Subject',
  __primarylabel__: 'Subject',
  subject_code: '',
  subject_name: '',
})

export const getDefaultCCTopicNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Topic',
  __primarylabel__: 'Topic',
  topic_id: '',
  topic_title: '',
  total_number_of_lessons_for_topic: '',
  topic_type: '',
  topic_assessment_type: '',
})

export const getDefaultCCTopicLessonNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Topic Lesson',
  __primarylabel__: 'Topic Lesson',
  topic_lesson_id: '',
  topic_lesson_title: '',
  topic_lesson_type: '',
  topic_lesson_length: '',
  topic_lesson_skills_learned: '',
  topic_lesson_suggested_activities: '',
  topic_lesson_weblinks: '',
})

export const getDefaultCCLearningStatementNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Learning Statement',
  __primarylabel__: 'Learning Statement',
  lesson_learning_statement_id: '',
  lesson_learning_statement: '',
  lesson_learning_statement_type: '',
})

export const getDefaultCCScienceLabNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Science Lab',
  __primarylabel__: 'Science Lab',
  science_lab_id: '',
  science_lab_title: '',
  science_lab_summary: '',
  science_lab_requirements: '',
  science_lab_procedure: '',
  science_lab_safety: '',
  science_lab_weblinks: '',
})

export const getDefaultCCTeacherTimetableNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Teacher Timetable',
  __primarylabel__: 'Teacher Timetable',
  teacher_id: '',
  start_date: '',
  end_date: '',
})

export const getDefaultCCTimetableLessonNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Timetable Lesson',
  __primarylabel__: 'Timetable Lesson',
  subject_class: '',
  date: '',
  start_time: '',
  end_time: '',
  period_code: '',
})

export const getDefaultCCPlannedLessonNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Planned Lesson',
  __primarylabel__: 'Planned Lesson',
  date: '',
  start_time: '',
  end_time: '',
  period_code: '',
  subject_class: '',
  year_group: '',
  subject: '',
  teacher_code: '',
  planning_status: '',
  topic_code: '',
  topic_name: '',
  lesson_code: '',
  lesson_name: '',
  learning_statement_codes: '',
  learning_statements: '',
  learning_resource_codes: '',
  learning_resources: '',
})

export const getDefaultCCSchoolTimetableNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'School Timetable',
  __primarylabel__: 'School Timetable',
  start_date: '',
  end_date: '',
})

export const getDefaultCCAcademicYearNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Academic Year',
  __primarylabel__: 'Academic Year',
  year: '',
})

export const getDefaultCCAcademicTermNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Academic Term',
  __primarylabel__: 'Academic Term',
  term_name: '',
  term_number: '',
  start_date: '',
  end_date: '',
})

export const getDefaultCCAcademicWeekNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Academic Week',
  __primarylabel__: 'Academic Week',
  academic_week_number: '',
  start_date: '',
  week_type: '',
})

export const getDefaultCCAcademicDayNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Academic Day',
  __primarylabel__: 'Academic Day',
  academic_day: '',
  date: '',
  day_of_week: '',
  day_type: '',
})

export const getDefaultCCAcademicPeriodNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Academic Period',
  __primarylabel__: 'Academic Period',
  name: '',
  date: '',
  start_time: '',
  end_time: '',
  period_code: '',
})

export const getDefaultCCRegistrationPeriodNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Registration Period',
  __primarylabel__: 'Registration Period',
  name: '',
  date: '',
  start_time: '',
  end_time: '',
  period_code: '',
})

export const getDefaultCCDepartmentStructureNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'Department Structure',
  __primarylabel__: 'DepartmentStructure',
  department_structure_type: '',
})

export const getDefaultCCUserTeacherTimetableNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'User Teacher Timetable',
  __primarylabel__: 'UserTeacherTimetable',
  school_db_name: '',
  school_timetable_id: '',
})

export const getDefaultCCUserTimetableLessonNodeProps = () => ({
  ...getDefaultBaseProps(),
  title: 'User Timetable Lesson',
  __primarylabel__: 'UserTimetableLesson',
  subject_class: '',
  date: '',
  start_time: '',
  end_time: '',
  period_code: '',
  school_db_name: '',
  school_period_id: '',
})
