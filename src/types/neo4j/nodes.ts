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
