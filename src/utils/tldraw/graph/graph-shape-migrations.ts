import { createShapePropsMigrationIds, createShapePropsMigrationSequence, RecordProps } from '@tldraw/tldraw'
import { CalendarDayNodeShape, CalendarMonthNodeShape, CalendarNodeShape, CalendarTimeChunkNodeShape, CalendarWeekNodeShape, CalendarYearNodeShape, CurriculumStructureNodeShape, DepartmentNodeShape, DeveloperNodeShape, KeyStageNodeShape, KeyStageSyllabusNodeShape, PastoralStructureNodeShape, RoomNodeShape, SchoolNodeShape, StudentNodeShape, SubjectClassNodeShape, SubjectNodeShape, TeacherNodeShape, UserNodeShape, YearGroupNodeShape, YearGroupSyllabusNodeShape, TopicNodeShape, TopicLessonNodeShape, LearningStatementNodeShape, ScienceLabNodeShape, SchoolTimetableNodeShape, AcademicYearNodeShape, AcademicTermNodeShape, AcademicWeekNodeShape, AcademicDayNodeShape, TeacherTimetableNodeShape, TimetableLessonNodeShape, PlannedLessonNodeShape, RegistrationPeriodNodeShape, AcademicPeriodNodeShape } from './graph-shape-types';

// Ensure each node type and its migrations are added separately
const userNodeVersions = createShapePropsMigrationIds(
    'user_node',
    {
        AddSomeProperty: 1,
    }
)

const developerNodeVersions = createShapePropsMigrationIds(
    'developer_node',
    {
        AddSomeProperty: 1,
    }
);

const teacherNodeVersions = createShapePropsMigrationIds(
    'teacher_node',
    {
        AddSomeProperty: 1,
    }
);

const studentNodeVersions = createShapePropsMigrationIds(
    'student_node',
    {
        AddSomeProperty: 1,
    }
);

export const userNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: userNodeVersions.AddSomeProperty,
            up(props: RecordProps<UserNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<UserNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const developerNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: developerNodeVersions.AddSomeProperty,
            up(props: RecordProps<DeveloperNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<DeveloperNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const teacherNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: teacherNodeVersions.AddSomeProperty,
            up(props: RecordProps<TeacherNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<TeacherNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const studentNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: studentNodeVersions.AddSomeProperty,
            up(props: RecordProps<StudentNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<StudentNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

// Calendar node shape migrations

const calendarNodeVersions = createShapePropsMigrationIds(
    'calendar_node',
    {
        AddSomeProperty: 1,
    }
)

const yearNodeVersions = createShapePropsMigrationIds(
    'calendar_year_node',
    {
        AddSomeProperty: 1,
    }
);

const monthNodeVersions = createShapePropsMigrationIds(
    'calendar_month_node',
    {
        AddSomeProperty: 1,
    }
);

const weekNodeVersions = createShapePropsMigrationIds(
    'calendar_week_node',
    {
        AddSomeProperty: 1,
    }
);

const dayNodeVersions = createShapePropsMigrationIds(
    'calendar_day_node',
    {
        AddSomeProperty: 1,
    }
);

const timeChunkNodeVersions = createShapePropsMigrationIds(
    'calendar_time_chunk_node',
    {
        AddSomeProperty: 1,
    }
);


export const calendarNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: calendarNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const yearNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: yearNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarYearNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarYearNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const monthNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: monthNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarMonthNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarMonthNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const weekNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: weekNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarWeekNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarWeekNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const dayNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: dayNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarDayNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarDayNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const timeChunkNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: timeChunkNodeVersions.AddSomeProperty,
            up(props: RecordProps<CalendarTimeChunkNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CalendarTimeChunkNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})


const schoolNodeVersions = createShapePropsMigrationIds(
    'school_node',
    {
        AddSomeProperty: 1,
    }
)

const departmentNodeVersions = createShapePropsMigrationIds(
    'department_node',
    {
        AddSomeProperty: 1,
    }
);

const roomNodeVersions = createShapePropsMigrationIds(
    'room_node',
    {
        AddSomeProperty: 1,
    }
);

const subjectClassNodeVersions = createShapePropsMigrationIds(
    'subject_class_node',
    {
        AddSomeProperty: 1,
    }
);

export const schoolNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: schoolNodeVersions.AddSomeProperty,
            up(props: RecordProps<SchoolNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<SchoolNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const departmentNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: departmentNodeVersions.AddSomeProperty,
            up(props: RecordProps<DepartmentNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<DepartmentNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const roomNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: roomNodeVersions.AddSomeProperty,
            up(props: RecordProps<RoomNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<RoomNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const subjectClassNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: subjectClassNodeVersions.AddSomeProperty,
            up(props: RecordProps<SubjectClassNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<SubjectClassNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})


const pastoralStructureNodeVersions = createShapePropsMigrationIds(
    'pastoral_structure_node',
    {
        AddSomeProperty: 1,
    }
)

const yearGroupNodeVersions = createShapePropsMigrationIds(
    'year_group_node',
    {
        AddSomeProperty: 1,
    }
);

const curriculumStructureNodeVersions = createShapePropsMigrationIds(
    'curriculum_structure_node',
    {
        AddSomeProperty: 1,
    }
);

const keyStageNodeVersions = createShapePropsMigrationIds(
    'key_stage_node',
    {
        AddSomeProperty: 1,
    }
);

const keyStageSyllabusNodeVersions = createShapePropsMigrationIds(
    'key_stage_syllabus_node',
    {
        AddSomeProperty: 1,
    }
);

const yearGroupSyllabusNodeVersions = createShapePropsMigrationIds(
    'year_group_syllabus_node',
    {
        AddSomeProperty: 1,
    }
);

const subjectNodeVersions = createShapePropsMigrationIds(
    'subject_node',
    {
        AddSomeProperty: 1,
    }
);

const topicNodeVersions = createShapePropsMigrationIds(
    'topic_node',
    {
        AddSomeProperty: 1,
    }
);

const topicLessonNodeVersions = createShapePropsMigrationIds(
    'topic_lesson_node',
    {
        AddSomeProperty: 1,
    }
);

const learningStatementNodeVersions = createShapePropsMigrationIds(
    'learning_statement_node',
    {
        AddSomeProperty: 1,
    }
);

const scienceLabNodeVersions = createShapePropsMigrationIds(
    'science_lab_node',
    {
        AddSomeProperty: 1,
    }
);

export const pastoralStructureNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: pastoralStructureNodeVersions.AddSomeProperty,
            up(props: RecordProps<PastoralStructureNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<PastoralStructureNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const yearGroupNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: yearGroupNodeVersions.AddSomeProperty,
            up(props: RecordProps<YearGroupNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<YearGroupNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const curriculumStructureNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: curriculumStructureNodeVersions.AddSomeProperty,
            up(props: RecordProps<CurriculumStructureNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<CurriculumStructureNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const keyStageNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: keyStageNodeVersions.AddSomeProperty,
            up(props: RecordProps<KeyStageNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<KeyStageNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const keyStageSyllabusNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: keyStageSyllabusNodeVersions.AddSomeProperty,
            up(props: RecordProps<KeyStageSyllabusNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<KeyStageSyllabusNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const yearGroupSyllabusNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: yearGroupSyllabusNodeVersions.AddSomeProperty,
            up(props: RecordProps<YearGroupSyllabusNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<YearGroupSyllabusNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const subjectNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: subjectNodeVersions.AddSomeProperty,
            up(props: RecordProps<SubjectNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<SubjectNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const topicNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: topicNodeVersions.AddSomeProperty,
            up(props: RecordProps<TopicNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<TopicNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const topicLessonNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: topicLessonNodeVersions.AddSomeProperty,
            up(props: RecordProps<TopicLessonNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<TopicLessonNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const learningStatementNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: learningStatementNodeVersions.AddSomeProperty,
            up(props: RecordProps<LearningStatementNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<LearningStatementNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const scienceLabNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: scienceLabNodeVersions.AddSomeProperty,
            up(props: RecordProps<ScienceLabNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<ScienceLabNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

const schoolTimetableNodeVersions = createShapePropsMigrationIds(
    'school_timetable_node',
    {
        AddSomeProperty: 1,
    }
)

const academicYearNodeVersions = createShapePropsMigrationIds(
    'academic_year_node',
    {
        AddSomeProperty: 1,
    }
);

const academicTermNodeVersions = createShapePropsMigrationIds(
    'academic_term_node',
    {
        AddSomeProperty: 1,
    }
);

const academicWeekNodeVersions = createShapePropsMigrationIds(
    'academic_week_node',
    {
        AddSomeProperty: 1,
    }
);

const academicDayNodeVersions = createShapePropsMigrationIds(
    'academic_day_node',
    {
        AddSomeProperty: 1,
    }
);

const academicPeriodNodeVersions = createShapePropsMigrationIds(
    'academic_period_node',
    {
        AddSomeProperty: 1,
    }
);

const registrationPeriodNodeVersions = createShapePropsMigrationIds(
    'registration_period_node',
    {
        AddSomeProperty: 1,
    }
);

export const schoolTimetableNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: schoolTimetableNodeVersions.AddSomeProperty,
            up(props: RecordProps<SchoolTimetableNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<SchoolTimetableNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const academicYearNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: academicYearNodeVersions.AddSomeProperty,
            up(props: RecordProps<AcademicYearNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<AcademicYearNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const academicTermNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: academicTermNodeVersions.AddSomeProperty,
            up(props: RecordProps<AcademicTermNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<AcademicTermNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const academicWeekNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: academicWeekNodeVersions.AddSomeProperty,
            up(props: RecordProps<AcademicWeekNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<AcademicWeekNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const academicDayNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: academicDayNodeVersions.AddSomeProperty,
            up(props: RecordProps<AcademicDayNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<AcademicDayNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const academicPeriodNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: academicPeriodNodeVersions.AddSomeProperty,
            up(props: RecordProps<AcademicPeriodNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<AcademicPeriodNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const registrationPeriodNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: registrationPeriodNodeVersions.AddSomeProperty,
            up(props: RecordProps<RegistrationPeriodNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<RegistrationPeriodNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

const teacherTimetableNodeVersions = createShapePropsMigrationIds(
    'teacher_timetable_node',
    {
        AddSomeProperty: 1,
    }
)

const timetableLessonNodeVersions = createShapePropsMigrationIds(
    'timetable_lesson_node',
    {
        AddSomeProperty: 1,
    }
);

const plannedLessonNodeVersions = createShapePropsMigrationIds(
    'planned_lesson_node',
    {
        AddSomeProperty: 1,
    }
);

export const teacherTimetableNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: teacherTimetableNodeVersions.AddSomeProperty,
            up(props: RecordProps<TeacherTimetableNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<TeacherTimetableNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const timetableLessonNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: timetableLessonNodeVersions.AddSomeProperty,
            up(props: RecordProps<TimetableLessonNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<TimetableLessonNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})

export const plannedLessonNodeShapeMigrations = createShapePropsMigrationSequence({
    sequence: [
        {
            id: plannedLessonNodeVersions.AddSomeProperty,
            up(props: RecordProps<PlannedLessonNodeShape>) {
                props.unique_id = 'some value'
            },
            down(props: RecordProps<PlannedLessonNodeShape>) {
                delete props.unique_id
            },
        }
    ],
})