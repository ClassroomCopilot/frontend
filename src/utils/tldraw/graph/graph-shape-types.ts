import { TLBaseShape, TLDefaultColorStyle, TLShape } from '@tldraw/tldraw'

export interface BaseNodeInterface {
    w: number;
    h: number;
    color: string;
    __primarylabel__: string;
    unique_id: string;
    path: string;
    created: string;
    merged: string;
}

// Users
export interface UserNodeInterface extends BaseNodeInterface
{
    user_id: string;
    user_type: string;
    user_name: string;
    user_email: string;
    worker_node_data: string;
}

export interface DeveloperNodeInterface extends BaseNodeInterface{
    user_id: string;
    user_type: string;
    user_name: string;
    user_email: string;
}

export interface TeacherNodeInterface extends BaseNodeInterface
{
    teacher_code: string;
    teacher_name_formal: string;
    teacher_email: string;
    worker_db_name: string;
}

export interface StudentNodeInterface extends BaseNodeInterface
{
    student_code: string;
    student_name_formal: string;
    student_email: string;
    worker_db_name: string;
}

export interface StandardUserNodeInterface extends BaseNodeInterface {
    user_id: string;
    user_type: string;
    user_name: string;
    user_email: string;
}

export interface SchoolAdminNodeInterface extends BaseNodeInterface {
    user_id: string;
    user_type: string;
    user_name: string;
    user_email: string;
}

// Calendar
export interface CalendarNodeInterface extends BaseNodeInterface {
    name: string;
    start_date: string;
    end_date: string;
}

export interface CalendarYearNodeInterface extends BaseNodeInterface {
    year: string;
}

export interface CalendarMonthNodeInterface extends BaseNodeInterface {
    year: string;
    month: string;
    month_name: string;
}

export interface CalendarWeekNodeInterface extends BaseNodeInterface {
    start_date: string;
    week_number: string;
    iso_week: string;
}

export interface CalendarDayNodeInterface extends BaseNodeInterface {
    date: string;
    day_of_week: string;
    iso_day: string;
}

export interface CalendarTimeChunkNodeInterface extends BaseNodeInterface {
    start_time: string;
    end_time: string;
}

// School
export interface SchoolNodeInterface extends BaseNodeInterface
{
    school_name: string;
    school_website: string;
    school_uuid: string;
}

export interface DepartmentNodeInterface extends BaseNodeInterface
{
    department_name: string;
}

export interface RoomNodeInterface extends BaseNodeInterface {
    room_code: string;
    room_name: string;
}

export interface SubjectClassNodeInterface extends BaseNodeInterface
{
    subject_class_code: string;
    year_group: string;
    subject: string;
    subject_code: string;
}

// Curriculum
export interface PastoralStructureNodeInterface extends BaseNodeInterface {
    // No additional properties
}

export interface YearGroupNodeInterface extends BaseNodeInterface {
    year_group: string;
    year_group_name: string;
}

export interface CurriculumStructureNodeInterface extends BaseNodeInterface {
}

export interface KeyStageNodeInterface extends BaseNodeInterface {
    key_stage_name: string;
    key_stage: string;
}

export interface KeyStageSyllabusNodeInterface extends BaseNodeInterface {
    ks_syllabus_id: string;
    ks_syllabus_name: string;
    ks_syllabus_key_stage: string;
    ks_syllabus_subject: string;
    ks_syllabus_subject_code: string;
}

export interface YearGroupSyllabusNodeInterface extends BaseNodeInterface {
    yr_syllabus_id: string;
    yr_syllabus_name: string;
    yr_syllabus_year_group: string;
    yr_syllabus_subject: string;
    yr_syllabus_subject_code: string;
}


export interface SubjectNodeInterface extends BaseNodeInterface {
    subject_code: string;
    subject_name: string;
}


export interface TopicNodeInterface extends BaseNodeInterface {
    topic_id: string;
    topic_title: string;
    total_number_of_lessons_for_topic: string;
    topic_type: string;
    topic_assessment_type: string;

}

export interface TopicLessonNodeInterface extends BaseNodeInterface {
    topic_lesson_id: string;
    topic_lesson_title: string;
    topic_lesson_type: string;
    topic_lesson_length: string;
    topic_lesson_suggested_activities: string;
    topic_lesson_skills_learned: string;
    topic_lesson_weblinks: string;
}


export interface LearningStatementNodeInterface extends BaseNodeInterface {
    lesson_learning_statement_id: string;
    lesson_learning_statement: string;
    lesson_learning_statement_type: string;
}

export interface ScienceLabNodeInterface extends BaseNodeInterface {
    science_lab_id: string;
    science_lab_title: string;
    science_lab_summary: string;
    science_lab_requirements: string;
    science_lab_procedure: string;
    science_lab_safety: string;
    science_lab_weblinks: string;
}


// School Timetable
export interface SchoolTimetableNodeInterface extends BaseNodeInterface {
    start_date: string;
    end_date: string;
}

export interface AcademicYearNodeInterface extends BaseNodeInterface {
    year: string;
}

export interface AcademicTermNodeInterface extends BaseNodeInterface {
    term_name: string;
    term_number: string;
    start_date: string;
    end_date: string;
}

export interface AcademicTermBreakNodeInterface extends BaseNodeInterface {
    term_break_name: string;
    start_date: string;
    end_date: string;
}

export interface AcademicWeekNodeInterface extends BaseNodeInterface {
    academic_week_number: string;
    start_date: string;
    week_type: string;
}

export interface HolidayWeekNodeInterface extends BaseNodeInterface {
    start_date: string;
}

export interface AcademicDayNodeInterface extends BaseNodeInterface {
    academic_day: string;
    date: string;
    day_of_week: string;
    day_type: string;
}

export interface OffTimetableDayNodeInterface extends BaseNodeInterface {
    date: string;
    day_of_week: string;
}

export interface StaffDayNodeInterface extends BaseNodeInterface {
    date: string;
    day_of_week: string;
}

export interface HolidayDayNodeInterface extends BaseNodeInterface {
    date: string;
    day_of_week: string;
}

export interface AcademicPeriodNodeInterface extends BaseNodeInterface {
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    period_code: string;
}

export interface RegistrationPeriodNodeInterface extends BaseNodeInterface {
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    period_code: string;
}

export interface BreakPeriodNodeInterface extends BaseNodeInterface {
    name: string;
    date: string;
    start_time: string;
    end_time: string;
}

export interface OffTimetablePeriodNodeInterface extends BaseNodeInterface {
    name: string;
    date: string;
    start_time: string;
    end_time: string;
}

// Teacher timetable
export interface TeacherTimetableNodeInterface extends BaseNodeInterface {
}

export interface TimetableLessonNodeInterface extends BaseNodeInterface {
    subject_class: string;
    date: string;
    start_time: string;
    end_time: string;
    period_code: string;
}

export interface PlannedLessonNodeInterface extends BaseNodeInterface {
    date: string;
    start_time: string;
    end_time: string;
    period_code: string;
    subject_class: string;
    year_group: string;
    subject: string;
    teacher_code: string;
    planning_status: string;
    topic_code?: string | null | undefined;
    topic_name?: string | null | undefined;
    lesson_code?: string | null | undefined;
    lesson_name?: string | null | undefined;
    learning_statement_codes?: string | null | undefined;
    learning_statements?: string | null | undefined;
    learning_resource_codes?: string | null | undefined;
    learning_resources?: string | null | undefined;
}

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

