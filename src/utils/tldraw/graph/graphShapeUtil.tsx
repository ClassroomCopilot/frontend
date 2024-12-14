import { BaseNodeShapeUtil, BaseRelationshipShapeUtil } from './baseNodeShapeUtil'
import {
    UserNodeShape,
    DeveloperNodeShape,
    TeacherNodeShape,
    StudentNodeShape,
    CalendarNodeShape,
    CalendarYearNodeShape,
    CalendarMonthNodeShape,
    CalendarWeekNodeShape,
    CalendarDayNodeShape,
    CalendarTimeChunkNodeShape,
    ScienceLabNodeShape,
    KeyStageSyllabusNodeShape,
    YearGroupNodeShape,
    YearGroupSyllabusNodeShape,
    CurriculumStructureNodeShape,
    TopicNodeShape,
    TopicLessonNodeShape,
    LearningStatementNodeShape,
    SchoolNodeShape,
    TeacherTimetableNodeShape,
    TimetableLessonNodeShape,
    PlannedLessonNodeShape,
    SchoolTimetableNodeShape,
    SubjectClassNodeShape,
    SubjectNodeShape,
    AcademicDayNodeShape,
    AcademicWeekNodeShape,
    AcademicYearNodeShape,
    AcademicTermNodeShape,
    AcademicPeriodNodeShape,
    RegistrationPeriodNodeShape,
    PastoralStructureNodeShape,
    KeyStageNodeShape,
    RoomNodeShape,
    DepartmentNodeShape,
} from './graph-shape-types'
import {
    userNodeShapeProps,
    developerNodeShapeProps,
    teacherNodeShapeProps,
    studentNodeShapeProps,
    calendarNodeShapeProps,
    calendarYearNodeShapeProps,
    calendarMonthNodeShapeProps,
    calendarWeekNodeShapeProps,
    calendarDayNodeShapeProps,
    calendarTimeChunkNodeShapeProps,
    scienceLabNodeShapeProps,
    keyStageSyllabusNodeShapeProps,
    yearGroupNodeShapeProps,
    yearGroupSyllabusNodeShapeProps,
    curriculumStructureNodeShapeProps,
    topicNodeShapeProps,
    topicLessonNodeShapeProps,
    learningStatementNodeShapeProps,
    schoolNodeShapeProps,
    teacherTimetableNodeShapeProps,
    timetableLessonNodeShapeProps,
    plannedLessonNodeShapeProps,
    schoolTimetableNodeShapeProps,
    subjectClassNodeShapeProps,
    subjectNodeShapeProps,
    academicDayNodeShapeProps,
    academicWeekNodeShapeProps,
    academicYearNodeShapeProps,
    academicTermNodeShapeProps,
    academicPeriodNodeShapeProps,
    registrationPeriodNodeShapeProps,
    pastoralStructureNodeShapeProps,
    keyStageNodeShapeProps,
    departmentNodeShapeProps,
    roomNodeShapeProps
} from './graph-shape-props'
import {
    userNodeShapeMigrations,
    developerNodeShapeMigrations,
    teacherNodeShapeMigrations,
    studentNodeShapeMigrations,
    calendarNodeShapeMigrations,
    yearNodeShapeMigrations,
    monthNodeShapeMigrations,
    weekNodeShapeMigrations,
    dayNodeShapeMigrations,
    timeChunkNodeShapeMigrations,
    keyStageSyllabusNodeShapeMigrations,
    yearGroupNodeShapeMigrations,
    yearGroupSyllabusNodeShapeMigrations,
    curriculumStructureNodeShapeMigrations,
    topicNodeShapeMigrations,
    topicLessonNodeShapeMigrations,
    learningStatementNodeShapeMigrations,
    scienceLabNodeShapeMigrations,
    schoolNodeShapeMigrations,
    teacherTimetableNodeShapeMigrations,
    timetableLessonNodeShapeMigrations,
    plannedLessonNodeShapeMigrations,
    schoolTimetableNodeShapeMigrations,
    subjectClassNodeShapeMigrations,
    subjectNodeShapeMigrations,
    academicDayNodeShapeMigrations,
    academicWeekNodeShapeMigrations,
    academicYearNodeShapeMigrations,
    academicTermNodeShapeMigrations,
    academicPeriodNodeShapeMigrations,
    registrationPeriodNodeShapeMigrations,
    pastoralStructureNodeShapeMigrations,
    roomNodeShapeMigrations,
    departmentNodeShapeMigrations,
    keyStageNodeShapeMigrations,
} from './graph-shape-migrations'
import { GeneralRelationshipShape } from './graph-relationship-types'
import { generalRelationshipShapeProps } from './graph-relationship-props'
import { generalRelationshipShapeMigrations } from './graph-relationship-migrations'

// User Nodes
export class UserNodeShapeUtil extends BaseNodeShapeUtil<UserNodeShape> {
    static override type = 'user_node' as const
    static override props = userNodeShapeProps
    static override migrations = userNodeShapeMigrations

    getDefaultProps(): UserNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'blue',
            __primarylabel__: 'User',
            unique_id: '',
            user_name: '',
            user_email: '',
            user_type: '',
            user_id: '',
            worker_node_data: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class DeveloperNodeShapeUtil extends BaseNodeShapeUtil<DeveloperNodeShape> {
    static override type = 'developer_node' as const
    static override props = developerNodeShapeProps
    static override migrations = developerNodeShapeMigrations

    getDefaultProps(): DeveloperNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Developer',
            unique_id: '',
            user_name: '',
            user_email: '',
            user_type: '',
            user_id: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class TeacherNodeShapeUtil extends BaseNodeShapeUtil<TeacherNodeShape> {
    static override type = 'teacher_node' as const
    static override props = teacherNodeShapeProps
    static override migrations = teacherNodeShapeMigrations

    getDefaultProps(): TeacherNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Teacher',
            unique_id: '',
            teacher_code: '',
            teacher_name_formal: '',
            teacher_email: '',
            worker_db_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class StudentNodeShapeUtil extends BaseNodeShapeUtil<StudentNodeShape> {
    static override type = 'student_node' as const
    static override props = studentNodeShapeProps
    static override migrations = studentNodeShapeMigrations

    getDefaultProps(): StudentNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Student',
            unique_id: '',
            student_code: '',
            student_name_formal: '',
            student_email: '',
            worker_db_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

// Calendar Nodes
export class CalendarNodeShapeUtil extends BaseNodeShapeUtil<CalendarNodeShape> {
    static override type = 'calendar_node' as const
    static override props = calendarNodeShapeProps
    static override migrations = calendarNodeShapeMigrations

    getDefaultProps(): CalendarNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar',
            unique_id: '',
            name: '',
            start_date: '',
            end_date: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class CalendarYearNodeShapeUtil extends BaseNodeShapeUtil<CalendarYearNodeShape> {
    static override type = 'calendar_year_node' as const
    static override props = calendarYearNodeShapeProps
    static override migrations = yearNodeShapeMigrations

    getDefaultProps(): CalendarYearNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar Year',
            unique_id: '',
            year: '',
            path: '',
            created: '',
            merged: ''
        }
    }
}

export class CalendarMonthNodeShapeUtil extends BaseNodeShapeUtil<CalendarMonthNodeShape> {
    static override type = 'calendar_month_node' as const
    static override props = calendarMonthNodeShapeProps
    static override migrations = monthNodeShapeMigrations

    getDefaultProps(): CalendarMonthNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar Month',
            unique_id: '',
            year: '',
            month: '',
            month_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class CalendarWeekNodeShapeUtil extends BaseNodeShapeUtil<CalendarWeekNodeShape> {
    static override type = 'calendar_week_node' as const
    static override props = calendarWeekNodeShapeProps
    static override migrations = weekNodeShapeMigrations

    getDefaultProps(): CalendarWeekNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar Week',
            unique_id: '',
            start_date: '',
            week_number: '',
            iso_week: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class CalendarDayNodeShapeUtil extends BaseNodeShapeUtil<CalendarDayNodeShape> {
    static override type = 'calendar_day_node' as const
    static override props = calendarDayNodeShapeProps
    static override migrations = dayNodeShapeMigrations

    getDefaultProps(): CalendarDayNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar Day',
            unique_id: '',
            date: '',
            day_of_week: '',
            iso_day: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class CalendarTimeChunkNodeShapeUtil extends BaseNodeShapeUtil<CalendarTimeChunkNodeShape> {
    static override type = 'calendar_time_chunk_node' as const
    static override props = calendarTimeChunkNodeShapeProps
    static override migrations = timeChunkNodeShapeMigrations

    getDefaultProps(): CalendarTimeChunkNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Calendar Time Chunk',
            unique_id: '',
            start_time: '',
            end_time: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

// School Nodes
export class SubjectClassNodeShapeUtil extends BaseNodeShapeUtil<SubjectClassNodeShape> {
    static override type = 'subject_class_node' as const
    static override props = subjectClassNodeShapeProps
    static override migrations = subjectClassNodeShapeMigrations

    getDefaultProps(): SubjectClassNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Subject Class',
            unique_id: '',
            subject_class_code: '',
            year_group: '',
            subject: '',
            subject_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class SchoolNodeShapeUtil extends BaseNodeShapeUtil<SchoolNodeShape> {
    static override type = 'school_node' as const
    static override props = schoolNodeShapeProps
    static override migrations = schoolNodeShapeMigrations

    getDefaultProps(): SchoolNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'School',
            unique_id: '',
            school_uuid: '',
            school_name: '',
            school_website: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class DepartmentNodeShapeUtil extends BaseNodeShapeUtil<DepartmentNodeShape> {
    static override type = 'department_node' as const
    static override props = departmentNodeShapeProps
    static override migrations = departmentNodeShapeMigrations

    getDefaultProps(): DepartmentNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Department',
            unique_id: '',
            department_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class RoomNodeShapeUtil extends BaseNodeShapeUtil<RoomNodeShape> {
    static override type = 'room_node' as const
    static override props = roomNodeShapeProps
    static override migrations = roomNodeShapeMigrations

    getDefaultProps(): RoomNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Room',
            unique_id: '',
            room_name: '',
            room_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}


// Curriculum Nodes
export class PastoralStructureNodeShapeUtil extends BaseNodeShapeUtil<PastoralStructureNodeShape> {
    static override type = 'pastoral_structure_node' as const
    static override props = pastoralStructureNodeShapeProps
    static override migrations = pastoralStructureNodeShapeMigrations

    getDefaultProps(): PastoralStructureNodeShape['props'] {
        return {    
            w: 200,
            h: 130,
            color: 'white',
            __primarylabel__: 'Pastoral Structure',
            unique_id: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class YearGroupNodeShapeUtil extends BaseNodeShapeUtil<YearGroupNodeShape> {
    static override type = 'year_group_node' as const
    static override props = yearGroupNodeShapeProps
    static override migrations = yearGroupNodeShapeMigrations

    getDefaultProps(): YearGroupNodeShape['props'] {
        return {    
            w: 200,
            h: 150,
            color: 'white',
            __primarylabel__: 'Year Group',
            unique_id: '',
            year_group: '',
            year_group_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class CurriculumStructureNodeShapeUtil extends BaseNodeShapeUtil<CurriculumStructureNodeShape> {
    static override type = 'curriculum_structure_node' as const
    static override props = curriculumStructureNodeShapeProps
    static override migrations = curriculumStructureNodeShapeMigrations

    getDefaultProps(): CurriculumStructureNodeShape['props'] {
        return {    
            w: 200,
            h: 130,
            color: 'white',
            __primarylabel__: 'Curriculum Structure',
            unique_id: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class KeyStageNodeShapeUtil extends BaseNodeShapeUtil<KeyStageNodeShape> {
    static override type = 'key_stage_node' as const
    static override props = keyStageNodeShapeProps
    static override migrations = keyStageNodeShapeMigrations

    getDefaultProps(): KeyStageNodeShape['props'] {
        return {    
            w: 200,
            h: 150,
            color: 'white',
            __primarylabel__: 'Key Stage',
            unique_id: '',
            key_stage_name: '',
            key_stage: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class KeyStageSyllabusNodeShapeUtil extends BaseNodeShapeUtil<KeyStageSyllabusNodeShape> {
    static override type = 'key_stage_syllabus_node' as const
    static override props = keyStageSyllabusNodeShapeProps
    static override migrations = keyStageSyllabusNodeShapeMigrations

    getDefaultProps(): KeyStageSyllabusNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Key Stage Syllabus',
            unique_id: '',
            ks_syllabus_id: '',
            ks_syllabus_name: '',
            ks_syllabus_key_stage: '',
            ks_syllabus_subject: '',
            ks_syllabus_subject_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class YearGroupSyllabusNodeShapeUtil extends BaseNodeShapeUtil<YearGroupSyllabusNodeShape> {
    static override type = 'year_group_syllabus_node' as const
    static override props = yearGroupSyllabusNodeShapeProps
    static override migrations = yearGroupSyllabusNodeShapeMigrations

    getDefaultProps(): YearGroupSyllabusNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Year Group Syllabus',
            unique_id: '',
            yr_syllabus_id: '',
            yr_syllabus_name: '',
            yr_syllabus_year_group: '',
            yr_syllabus_subject: '',
            yr_syllabus_subject_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class SubjectNodeShapeUtil extends BaseNodeShapeUtil<SubjectNodeShape> {
    static override type = 'subject_node' as const
    static override props = subjectNodeShapeProps
    static override migrations = subjectNodeShapeMigrations

    getDefaultProps(): SubjectNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Subject',
            unique_id: '',
            subject_code: '',
            subject_name: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class TopicNodeShapeUtil extends BaseNodeShapeUtil<TopicNodeShape> {
    static override type = 'topic_node' as const
    static override props = topicNodeShapeProps
    static override migrations = topicNodeShapeMigrations

    getDefaultProps(): TopicNodeShape['props'] {
        return {    
            w: 300,
            h: 400,
            color: 'white',
            __primarylabel__: 'Topic',
            unique_id: '',
            topic_id: '',
            topic_title: '',
            total_number_of_lessons_for_topic: '',
            topic_type: '',
            topic_assessment_type: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class TopicLessonNodeShapeUtil extends BaseNodeShapeUtil<TopicLessonNodeShape> {
    static override type = 'topic_lesson_node' as const
    static override props = topicLessonNodeShapeProps
    static override migrations = topicLessonNodeShapeMigrations

    getDefaultProps(): TopicLessonNodeShape['props'] {
        return {    
            w: 300,
            h: 500,
            color: 'white',
            __primarylabel__: 'Topic Lesson',
            unique_id: '',
            topic_lesson_id: '',
            topic_lesson_title: '',
            topic_lesson_type: '',
            topic_lesson_length: '',
            topic_lesson_skills_learned: '',
            topic_lesson_suggested_activities: '',
            topic_lesson_weblinks: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class LearningStatementNodeShapeUtil extends BaseNodeShapeUtil<LearningStatementNodeShape> {
    static override type = 'learning_statement_node' as const
    static override props = learningStatementNodeShapeProps
    static override migrations = learningStatementNodeShapeMigrations

    getDefaultProps(): LearningStatementNodeShape['props'] {
        return {    
            w: 180,
            h: 300,
            color: 'light-blue',
            __primarylabel__: 'Learning Statement',
            unique_id: '',
            lesson_learning_statement_id: '',
            lesson_learning_statement: '',
            lesson_learning_statement_type: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class ScienceLabNodeShapeUtil extends BaseNodeShapeUtil<ScienceLabNodeShape> {
    static override type = 'science_lab_node' as const
    static override props = scienceLabNodeShapeProps
    static override migrations = scienceLabNodeShapeMigrations

    getDefaultProps(): ScienceLabNodeShape['props'] {
        return {    
            w: 300,
            h: 400,
            color: 'white',
            __primarylabel__: 'Science Lab',
            unique_id: '',
            science_lab_id: '',
            science_lab_title: '',
            science_lab_summary: '',
            science_lab_requirements: '',
            science_lab_procedure: '',
            science_lab_safety: '',
            science_lab_weblinks: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

// School Timetable Nodes
export class SchoolTimetableNodeShapeUtil extends BaseNodeShapeUtil<SchoolTimetableNodeShape> {
    static override type = 'school_timetable_node' as const

    static override props = schoolTimetableNodeShapeProps
    static override migrations = schoolTimetableNodeShapeMigrations

    getDefaultProps(): SchoolTimetableNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'School Timetable',
            unique_id: '',
            start_date: '',
            end_date: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class AcademicYearNodeShapeUtil extends BaseNodeShapeUtil<AcademicYearNodeShape> {
    static override type = 'academic_year_node' as const
    static override props = academicYearNodeShapeProps
    static override migrations = academicYearNodeShapeMigrations

    getDefaultProps(): AcademicYearNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Academic Year',
            unique_id: '',
            year: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class AcademicTermNodeShapeUtil extends BaseNodeShapeUtil<AcademicTermNodeShape> {
    static override type = 'academic_term_node' as const
    static override props = academicTermNodeShapeProps
    static override migrations = academicTermNodeShapeMigrations

    getDefaultProps(): AcademicTermNodeShape['props'] {
        return {    
            w: 300,
            h: 200,
            color: 'white',
            __primarylabel__: 'Academic Term',
            unique_id: '',
            term_name: '',
            term_number: '',
            start_date: '',
            end_date: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class AcademicWeekNodeShapeUtil extends BaseNodeShapeUtil<AcademicWeekNodeShape> {
    static override type = 'academic_week_node' as const
    static override props = academicWeekNodeShapeProps
    static override migrations = academicWeekNodeShapeMigrations

    getDefaultProps(): AcademicWeekNodeShape['props'] {
        return {    
            w: 300,
            h: 200,
            color: 'white',
            __primarylabel__: 'Academic Week',
            unique_id: '',
            start_date: '',
            week_type: '',
            academic_week_number: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class AcademicDayNodeShapeUtil extends BaseNodeShapeUtil<AcademicDayNodeShape> {
    static override type = 'academic_day_node' as const
    static override props = academicDayNodeShapeProps
    static override migrations = academicDayNodeShapeMigrations

    getDefaultProps(): AcademicDayNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Academic Day',
            unique_id: '',
            academic_day: '',
            date: '',
            day_of_week: '',
            day_type: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class AcademicPeriodNodeShapeUtil extends BaseNodeShapeUtil<AcademicPeriodNodeShape> {
    static override type = 'academic_period_node' as const
    static override props = academicPeriodNodeShapeProps
    static override migrations = academicPeriodNodeShapeMigrations

    getDefaultProps(): AcademicPeriodNodeShape['props'] {
        return {    
            w: 200,
            h: 300,
            color: 'white',
            __primarylabel__: 'Academic Period',
            unique_id: '',
            name: '',
            date: '',
            start_time: '',
            end_time: '',
            period_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class RegistrationPeriodNodeShapeUtil extends BaseNodeShapeUtil<RegistrationPeriodNodeShape> {
    static override type = 'registration_period_node' as const
    static override props = registrationPeriodNodeShapeProps
    static override migrations = registrationPeriodNodeShapeMigrations

    getDefaultProps(): RegistrationPeriodNodeShape['props'] {
        return {    
            w: 200,
            h: 200,
            color: 'white',
            __primarylabel__: 'Registration Period',
            unique_id: '',
            name: '',
            date: '',
            start_time: '',
            end_time: '',
            period_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

// Teacher Timetable Nodes
export class TeacherTimetableNodeShapeUtil extends BaseNodeShapeUtil<TeacherTimetableNodeShape> {
    static override type = 'teacher_timetable_node' as const
    static override props = teacherTimetableNodeShapeProps
    static override migrations = teacherTimetableNodeShapeMigrations

    getDefaultProps(): TeacherTimetableNodeShape['props'] {
        return {    
            w: 200,
            h: 130,
            color: 'white',
            __primarylabel__: 'Teacher Timetable',
            unique_id: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class TimetableLessonNodeShapeUtil extends BaseNodeShapeUtil<TimetableLessonNodeShape> {
    static override type = 'timetable_lesson_node' as const
    static override props = timetableLessonNodeShapeProps
    static override migrations = timetableLessonNodeShapeMigrations

    getDefaultProps(): TimetableLessonNodeShape['props'] {
        return {    
            w: 200,
            h: 250,
            color: 'white',
            __primarylabel__: 'Timetable Lesson',
            unique_id: '',
            subject_class: '',
            date: '',
            start_time: '',
            end_time: '',
            period_code: '',
            path: '',
            created: '',
            merged: '',
        }
    }
}

export class PlannedLessonNodeShapeUtil extends BaseNodeShapeUtil<PlannedLessonNodeShape> {
    static override type = 'planned_lesson_node' as const
    static override props = plannedLessonNodeShapeProps
    static override migrations = plannedLessonNodeShapeMigrations

    getDefaultProps(): PlannedLessonNodeShape['props'] {
        return {    
            w: 200,
            h: 250,
            color: 'white',
            __primarylabel__: 'Planned Lesson',
            unique_id: '',
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
            path: '',
            created: '',
            merged: '',
        }
    }
}

// Relationships
export class GeneralRelationshipShapeUtil extends BaseRelationshipShapeUtil<GeneralRelationshipShape> {
    static override type = 'general_relationship' as const
    static override props = generalRelationshipShapeProps
    static override migrations = generalRelationshipShapeMigrations

    getDefaultProps(): GeneralRelationshipShape['props'] {
        return {
            w: 200,
            h: 250,
            color: 'black',
            __relationshiptype__: '',
            source: '',
            target: '',
            created: '',
            merged: '',
        }
    }
}

export const GraphShapeUtils = {
    UserNodeShapeUtil,
    DeveloperNodeShapeUtil,
    StudentNodeShapeUtil,
    TeacherNodeShapeUtil,
    CalendarNodeShapeUtil,
    CalendarYearNodeShapeUtil,
    CalendarMonthNodeShapeUtil,
    CalendarWeekNodeShapeUtil,
    CalendarDayNodeShapeUtil,
    CalendarTimeChunkNodeShapeUtil,
    TeacherTimetableNodeShapeUtil,
    TimetableLessonNodeShapeUtil,
    PlannedLessonNodeShapeUtil,
    PastoralStructureNodeShapeUtil,
    YearGroupNodeShapeUtil,
    CurriculumStructureNodeShapeUtil,
    KeyStageNodeShapeUtil,
    KeyStageSyllabusNodeShapeUtil,
    YearGroupSyllabusNodeShapeUtil,
    SubjectNodeShapeUtil,
    TopicNodeShapeUtil,
    TopicLessonNodeShapeUtil,
    LearningStatementNodeShapeUtil,
    ScienceLabNodeShapeUtil,
    SchoolTimetableNodeShapeUtil,
    AcademicYearNodeShapeUtil,
    AcademicTermNodeShapeUtil,
    AcademicWeekNodeShapeUtil,
    AcademicDayNodeShapeUtil,
    AcademicPeriodNodeShapeUtil,
    RegistrationPeriodNodeShapeUtil,
    SchoolNodeShapeUtil,
    DepartmentNodeShapeUtil,
    RoomNodeShapeUtil,
    SubjectClassNodeShapeUtil,
    GeneralRelationshipShapeUtil
};