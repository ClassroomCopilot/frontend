import { TLBaseShape, TLDefaultColorStyle, TLShape } from '@tldraw/tldraw'
import {
    UserNodeInterface,
    DeveloperNodeInterface,
    TeacherNodeInterface,
    CalendarNodeInterface,
    CalendarYearNodeInterface,
    CalendarMonthNodeInterface,
    CalendarWeekNodeInterface,
    CalendarDayNodeInterface,
    CalendarTimeChunkNodeInterface,
    SchoolNodeInterface,
    DepartmentNodeInterface,
    RoomNodeInterface,
    SubjectClassNodeInterface,
    PastoralStructureNodeInterface,
    YearGroupNodeInterface,
    CurriculumStructureNodeInterface,
    KeyStageNodeInterface,
    KeyStageSyllabusNodeInterface,
    YearGroupSyllabusNodeInterface,
    SubjectNodeInterface,
    TopicNodeInterface,
    TopicLessonNodeInterface,
    LearningStatementNodeInterface,
    ScienceLabNodeInterface,
    SchoolTimetableNodeInterface,
    AcademicYearNodeInterface,
    AcademicTermNodeInterface,
    AcademicWeekNodeInterface,
    AcademicDayNodeInterface,
    AcademicPeriodNodeInterface,
    RegistrationPeriodNodeInterface,
    TeacherTimetableNodeInterface,
    TimetableLessonNodeInterface,
    PlannedLessonNodeInterface,
    StudentNodeInterface
} from '../../../types/neo4j/nodes';

// First, let's create a base type for common shape properties
export interface BaseNodeProps {
    w: number
    h: number
    color: TLDefaultColorStyle
}

// Create a const object with all node types
export const NODE_SHAPE_TYPES = {
    USER: 'user_node',
    DEVELOPER: 'developer_node',
    TEACHER: 'teacher_node',
    STUDENT: 'student_node',
    CALENDAR: 'calendar_node',
    TEACHER_TIMETABLE: 'teacher_timetable_node',
    TIMETABLE_LESSON: 'timetable_lesson_node',
    PLANNED_LESSON: 'planned_lesson_node',
    SCHOOL: 'school_node',
    CALENDAR_YEAR: 'calendar_year_node',
    CALENDAR_MONTH: 'calendar_month_node',
    CALENDAR_WEEK: 'calendar_week_node',
    CALENDAR_DAY: 'calendar_day_node',
    CALENDAR_TIME_CHUNK: 'calendar_time_chunk_node',
    SCIENCE_LAB: 'science_lab_node',
    KEY_STAGE_SYLLABUS: 'key_stage_syllabus_node',
    YEAR_GROUP: 'year_group_node',
    YEAR_GROUP_SYLLABUS: 'year_group_syllabus_node',
    CURRICULUM_STRUCTURE: 'curriculum_structure_node',
    TOPIC: 'topic_node',
    TOPIC_LESSON: 'topic_lesson_node',
    LEARNING_STATEMENT: 'learning_statement_node',
    SCHOOL_TIMETABLE: 'school_timetable_node',
    SUBJECT_CLASS: 'subject_class_node',
    SUBJECT: 'subject_node',
    ACADEMIC_DAY: 'academic_day_node',
    ACADEMIC_WEEK: 'academic_week_node',
    ACADEMIC_YEAR: 'academic_year_node',
    ACADEMIC_TERM: 'academic_term_node',
    ACADEMIC_PERIOD: 'academic_period_node',
    REGISTRATION_PERIOD: 'registration_period_node',
    PASTORAL_STRUCTURE: 'pastoral_structure_node',
    KEY_STAGE: 'key_stage_node',
    ROOM: 'room_node',
    DEPARTMENT: 'department_node'
} as const;

// Create the type from the const object's values
export type NodeShapeType = typeof NODE_SHAPE_TYPES[keyof typeof NODE_SHAPE_TYPES];

// Modify BaseNodeShape to be more specific
export type BaseNodeShape<T extends NodeShapeType, U> = TLBaseShape<T, BaseNodeProps & U>;

// Define individual shape types with their specific type literal
export type UserNodeShape = BaseNodeShape<'user_node', UserNodeInterface>;
export type DeveloperNodeShape = BaseNodeShape<'developer_node', DeveloperNodeInterface>;
export type TeacherNodeShape = BaseNodeShape<'teacher_node', TeacherNodeInterface>;
export type StudentNodeShape = BaseNodeShape<'student_node', StudentNodeInterface>;
export type CalendarNodeShape = BaseNodeShape<'calendar_node', CalendarNodeInterface>;
export type CalendarYearNodeShape = BaseNodeShape<'calendar_year_node', CalendarYearNodeInterface>;
export type CalendarMonthNodeShape = BaseNodeShape<'calendar_month_node', CalendarMonthNodeInterface>;
export type CalendarWeekNodeShape = BaseNodeShape<'calendar_week_node', CalendarWeekNodeInterface>;
export type CalendarDayNodeShape = BaseNodeShape<'calendar_day_node', CalendarDayNodeInterface>;
export type CalendarTimeChunkNodeShape = BaseNodeShape<'calendar_time_chunk_node', CalendarTimeChunkNodeInterface>;
export type SchoolNodeShape = BaseNodeShape<'school_node', SchoolNodeInterface>;
export type DepartmentNodeShape = BaseNodeShape<'department_node', DepartmentNodeInterface>;
export type RoomNodeShape = BaseNodeShape<'room_node', RoomNodeInterface>;
export type SubjectClassNodeShape = BaseNodeShape<'subject_class_node', SubjectClassNodeInterface>;
export type PastoralStructureNodeShape = BaseNodeShape<'pastoral_structure_node', PastoralStructureNodeInterface>;
export type YearGroupNodeShape = BaseNodeShape<'year_group_node', YearGroupNodeInterface>;
export type CurriculumStructureNodeShape = BaseNodeShape<'curriculum_structure_node', CurriculumStructureNodeInterface>;
export type KeyStageNodeShape = BaseNodeShape<'key_stage_node', KeyStageNodeInterface>;
export type KeyStageSyllabusNodeShape = BaseNodeShape<'key_stage_syllabus_node', KeyStageSyllabusNodeInterface>;
export type YearGroupSyllabusNodeShape = BaseNodeShape<'year_group_syllabus_node', YearGroupSyllabusNodeInterface>;
export type SubjectNodeShape = BaseNodeShape<'subject_node', SubjectNodeInterface>;
export type TopicNodeShape = BaseNodeShape<'topic_node', TopicNodeInterface>;
export type TopicLessonNodeShape = BaseNodeShape<'topic_lesson_node', TopicLessonNodeInterface>;
export type LearningStatementNodeShape = BaseNodeShape<'learning_statement_node', LearningStatementNodeInterface>;
export type ScienceLabNodeShape = BaseNodeShape<'science_lab_node', ScienceLabNodeInterface>;
export type SchoolTimetableNodeShape = BaseNodeShape<'school_timetable_node', SchoolTimetableNodeInterface>;
export type AcademicYearNodeShape = BaseNodeShape<'academic_year_node', AcademicYearNodeInterface>;
export type AcademicTermNodeShape = BaseNodeShape<'academic_term_node', AcademicTermNodeInterface>;
export type AcademicWeekNodeShape = BaseNodeShape<'academic_week_node', AcademicWeekNodeInterface>;
export type AcademicDayNodeShape = BaseNodeShape<'academic_day_node', AcademicDayNodeInterface>;
export type AcademicPeriodNodeShape = BaseNodeShape<'academic_period_node', AcademicPeriodNodeInterface>;
export type RegistrationPeriodNodeShape = BaseNodeShape<'registration_period_node', RegistrationPeriodNodeInterface>;
export type TeacherTimetableNodeShape = BaseNodeShape<'teacher_timetable_node', TeacherTimetableNodeInterface>;
export type TimetableLessonNodeShape = BaseNodeShape<'timetable_lesson_node', TimetableLessonNodeInterface>;
export type PlannedLessonNodeShape = BaseNodeShape<'planned_lesson_node', PlannedLessonNodeInterface>;

// Define AllNodeShapes as a union type
export type AllNodeShapes = 
    | UserNodeShape 
    | DeveloperNodeShape 
    | TeacherNodeShape 
    | StudentNodeShape 
    | CalendarNodeShape 
    | CalendarYearNodeShape 
    | CalendarMonthNodeShape 
    | CalendarWeekNodeShape 
    | CalendarDayNodeShape 
    | CalendarTimeChunkNodeShape 
    | ScienceLabNodeShape 
    | KeyStageSyllabusNodeShape 
    | YearGroupNodeShape 
    | YearGroupSyllabusNodeShape 
    | CurriculumStructureNodeShape 
    | TopicNodeShape 
    | TopicLessonNodeShape 
    | LearningStatementNodeShape 
    | SchoolNodeShape 
    | TeacherTimetableNodeShape 
    | TimetableLessonNodeShape 
    | PlannedLessonNodeShape 
    | SchoolTimetableNodeShape 
    | SubjectClassNodeShape 
    | SubjectNodeShape 
    | AcademicDayNodeShape 
    | AcademicWeekNodeShape 
    | AcademicYearNodeShape 
    | AcademicTermNodeShape 
    | AcademicPeriodNodeShape 
    | RegistrationPeriodNodeShape 
    | PastoralStructureNodeShape 
    | KeyStageNodeShape 
    | RoomNodeShape 
    | DepartmentNodeShape;

// Add a type guard to check if a shape is a valid node shape
export const isValidNodeShape = (shape: TLShape): shape is AllNodeShapes => {
    return shape && 
           typeof shape.type === 'string' && 
           Object.values(NODE_SHAPE_TYPES).includes(shape.type as NodeShapeType);
};

