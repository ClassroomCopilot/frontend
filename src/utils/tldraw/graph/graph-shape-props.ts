import { DefaultColorStyle, RecordProps, T } from '@tldraw/tldraw'
import {
    UserNodeShape,
    DeveloperNodeShape,
    TeacherNodeShape,
    CalendarNodeShape,
    CalendarYearNodeShape,
    CalendarMonthNodeShape,
    CalendarWeekNodeShape,
    CalendarDayNodeShape,
    CalendarTimeChunkNodeShape,
    SchoolNodeShape,
    DepartmentNodeShape,
    RoomNodeShape,
    SubjectClassNodeShape,
    PastoralStructureNodeShape,
    YearGroupNodeShape,
    CurriculumStructureNodeShape,
    KeyStageNodeShape,
    KeyStageSyllabusNodeShape,
    YearGroupSyllabusNodeShape,
    SubjectNodeShape,
    TopicNodeShape,
    TopicLessonNodeShape,
    LearningStatementNodeShape,
    ScienceLabNodeShape,
    SchoolTimetableNodeShape,
    AcademicYearNodeShape,
    AcademicTermNodeShape,
    AcademicWeekNodeShape,
    AcademicDayNodeShape,
    AcademicPeriodNodeShape,
    RegistrationPeriodNodeShape,
    TeacherTimetableNodeShape,
    TimetableLessonNodeShape,
    PlannedLessonNodeShape,
    StudentNodeShape,
} from './graph-shape-types'

// Base node shape props
const baseNodeShapeProps = {
    w: T.number,
    h: T.number,
    color: DefaultColorStyle,
    __primarylabel__: T.string,
    unique_id: T.string,
    path: T.string,
    created: T.string,
    merged: T.string,
}

export const userNodeShapeProps: RecordProps<UserNodeShape> = {
    ...baseNodeShapeProps,
    user_id: T.string,
    user_name: T.string,
    user_email: T.string,
    worker_node_data: T.string,
    user_type: T.string,
}

export const developerNodeShapeProps: RecordProps<DeveloperNodeShape> = {
    ...baseNodeShapeProps,
    user_id: T.string,
    user_name: T.string,
    user_email: T.string,
    user_type: T.string,
}

export const teacherNodeShapeProps: RecordProps<TeacherNodeShape> = {
    ...baseNodeShapeProps,
    teacher_code: T.string,
    teacher_name_formal: T.string,
    teacher_email: T.string,
    worker_db_name: T.string,
}

export const studentNodeShapeProps: RecordProps<StudentNodeShape> = {
    ...baseNodeShapeProps,
    student_code: T.string,
    student_name_formal: T.string,
    student_email: T.string,
    worker_db_name: T.string,
}

// Calendar node shape props
export const calendarNodeShapeProps: RecordProps<CalendarNodeShape> = {
    ...baseNodeShapeProps,
    name: T.string,
    start_date: T.string,
    end_date: T.string,
}

export const calendarYearNodeShapeProps: RecordProps<CalendarYearNodeShape> = {
    ...baseNodeShapeProps,
    year: T.string,
}

export const calendarMonthNodeShapeProps: RecordProps<CalendarMonthNodeShape> = {
    ...baseNodeShapeProps,
    year: T.string,
    month: T.string,
    month_name: T.string,
}

export const calendarWeekNodeShapeProps: RecordProps<CalendarWeekNodeShape> = {
    ...baseNodeShapeProps,
    start_date: T.string,
    week_number: T.string,
    iso_week: T.string,
}

export const calendarDayNodeShapeProps: RecordProps<CalendarDayNodeShape> = {
    ...baseNodeShapeProps,
    date: T.string,
    day_of_week: T.string,
    iso_day: T.string,
}

export const calendarTimeChunkNodeShapeProps: RecordProps<CalendarTimeChunkNodeShape> = {
    ...baseNodeShapeProps,
    start_time: T.string,
    end_time: T.string,
}


// School
export const schoolNodeShapeProps: RecordProps<SchoolNodeShape> = {
    ...baseNodeShapeProps,
    school_name: T.string,
    school_website: T.string,
    school_uuid: T.string,
}

export const departmentNodeShapeProps: RecordProps<DepartmentNodeShape> = {
    ...baseNodeShapeProps,
    department_name: T.string,
}

export const roomNodeShapeProps: RecordProps<RoomNodeShape> = {
    ...baseNodeShapeProps,
    room_code: T.string,
    room_name: T.string,
}

export const subjectClassNodeShapeProps: RecordProps<SubjectClassNodeShape> = {
    ...baseNodeShapeProps,
    subject_class_code: T.string,
    year_group: T.string,
    subject: T.string,
    subject_code: T.string,
}

// Curriculum
export const pastoralStructureNodeShapeProps: RecordProps<PastoralStructureNodeShape> = {
    ...baseNodeShapeProps,
}

export const yearGroupNodeShapeProps: RecordProps<YearGroupNodeShape> = {
    ...baseNodeShapeProps,
    year_group: T.string,
    year_group_name: T.string,
}


export const curriculumStructureNodeShapeProps: RecordProps<CurriculumStructureNodeShape> = {
    ...baseNodeShapeProps,
}

export const keyStageNodeShapeProps: RecordProps<KeyStageNodeShape> = {
    ...baseNodeShapeProps,
    key_stage_name: T.string,
    key_stage: T.string,
}


export const keyStageSyllabusNodeShapeProps: RecordProps<KeyStageSyllabusNodeShape> = {
    ...baseNodeShapeProps,
    ks_syllabus_id: T.string,
    ks_syllabus_name: T.string,
    ks_syllabus_key_stage: T.string,
    ks_syllabus_subject: T.string,
    ks_syllabus_subject_code: T.string,
}


export const yearGroupSyllabusNodeShapeProps: RecordProps<YearGroupSyllabusNodeShape> = {
    ...baseNodeShapeProps,
    yr_syllabus_id: T.string,
    yr_syllabus_name: T.string,
    yr_syllabus_year_group: T.string,
    yr_syllabus_subject: T.string,
    yr_syllabus_subject_code: T.string,
}


export const subjectNodeShapeProps: RecordProps<SubjectNodeShape> = {
    ...baseNodeShapeProps,
    subject_code: T.string,
    subject_name: T.string,
}

export const topicNodeShapeProps: RecordProps<TopicNodeShape> = {
    ...baseNodeShapeProps,
    topic_id: T.string,
    topic_title: T.string,
    total_number_of_lessons_for_topic: T.string,
    topic_type: T.string,
    topic_assessment_type: T.string,
}

export const topicLessonNodeShapeProps: RecordProps<TopicLessonNodeShape> = {
    ...baseNodeShapeProps,
    topic_lesson_id: T.string,
    topic_lesson_title: T.string,
    topic_lesson_type: T.string,
    topic_lesson_length: T.string,
    topic_lesson_suggested_activities: T.string,
    topic_lesson_skills_learned: T.string,
    topic_lesson_weblinks: T.string,

}

export const learningStatementNodeShapeProps: RecordProps<LearningStatementNodeShape> = {
    ...baseNodeShapeProps,
    lesson_learning_statement_id: T.string,
    lesson_learning_statement: T.string,
    lesson_learning_statement_type: T.string,
}


export const scienceLabNodeShapeProps: RecordProps<ScienceLabNodeShape> = {
    ...baseNodeShapeProps,
    science_lab_id: T.string,
    science_lab_title: T.string,
    science_lab_summary: T.string,
    science_lab_requirements: T.string,
    science_lab_procedure: T.string,
    science_lab_safety: T.string,
    science_lab_weblinks: T.string,
}

// School Timetable
export const schoolTimetableNodeShapeProps: RecordProps<SchoolTimetableNodeShape> = {
    ...baseNodeShapeProps,
    start_date: T.string,
    end_date: T.string,
}


export const academicYearNodeShapeProps: RecordProps<AcademicYearNodeShape> = {
    ...baseNodeShapeProps,
    year: T.string,
}


export const academicTermNodeShapeProps: RecordProps<AcademicTermNodeShape> = {
    ...baseNodeShapeProps,
    term_name: T.string,
    term_number: T.string,
    start_date: T.string,
    end_date: T.string,
}

export const academicWeekNodeShapeProps: RecordProps<AcademicWeekNodeShape> = {
    ...baseNodeShapeProps,
    academic_week_number: T.string,
    start_date: T.string,
    week_type: T.string,
}

export const academicDayNodeShapeProps: RecordProps<AcademicDayNodeShape> = {
    ...baseNodeShapeProps,
    academic_day: T.string,
    date: T.string,
    day_of_week: T.string,
    day_type: T.string,
}

export const academicPeriodNodeShapeProps: RecordProps<AcademicPeriodNodeShape> = {
    ...baseNodeShapeProps,
    name: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
}

export const registrationPeriodNodeShapeProps: RecordProps<RegistrationPeriodNodeShape> = {
    ...baseNodeShapeProps,
    name: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
}



// Teacher Timetable
export const teacherTimetableNodeShapeProps: RecordProps<TeacherTimetableNodeShape> = {
    ...baseNodeShapeProps,
}

export const timetableLessonNodeShapeProps: RecordProps<TimetableLessonNodeShape> = {
    ...baseNodeShapeProps,
    subject_class: T.string,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
}

export const plannedLessonNodeShapeProps: RecordProps<PlannedLessonNodeShape> = {
    ...baseNodeShapeProps,
    date: T.string,
    start_time: T.string,
    end_time: T.string,
    period_code: T.string,
    subject_class: T.string,
    year_group: T.string,
    subject: T.string,
    teacher_code: T.string,
    planning_status: T.string,
    topic_code: T.string.optional().nullable(),
    topic_name: T.string.optional().nullable(),
    lesson_code: T.string.optional().nullable(),
    lesson_name: T.string.optional().nullable(),
    learning_statement_codes: T.string.optional().nullable(),
    learning_statements: T.string.optional().nullable(),
    learning_resource_codes: T.string.optional().nullable(),
    learning_resources: T.string.optional().nullable(),
}
