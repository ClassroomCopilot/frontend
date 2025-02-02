import { TLShape } from '@tldraw/tldraw'
import { CCUserNodeShape, CCUserNodeShapeUtil } from './CCUserNodeShapeUtil'
import { CCTeacherNodeShape, CCTeacherNodeShapeUtil } from './CCTeacherNodeShapeUtil'
import { CCStudentNodeShape, CCStudentNodeShapeUtil } from './CCStudentNodeShapeUtil'
import { CCCalendarNodeShape, CCCalendarNodeShapeUtil } from './CCCalendarNodeShapeUtil'
import { CCCalendarYearNodeShape, CCCalendarYearNodeShapeUtil } from './CCCalendarYearNodeShapeUtil'
import { CCCalendarMonthNodeShape, CCCalendarMonthNodeShapeUtil } from './CCCalendarMonthNodeShapeUtil'
import { CCCalendarWeekNodeShape, CCCalendarWeekNodeShapeUtil } from './CCCalendarWeekNodeShapeUtil'
import { CCCalendarDayNodeShape, CCCalendarDayNodeShapeUtil } from './CCCalendarDayNodeShapeUtil'
import { CCCalendarTimeChunkNodeShape, CCCalendarTimeChunkNodeShapeUtil } from './CCCalendarTimeChunkNodeShapeUtil'
import { CCSchoolNodeShape, CCSchoolNodeShapeUtil } from './CCSchoolNodeShapeUtil'
import { CCDepartmentNodeShape, CCDepartmentNodeShapeUtil } from './CCDepartmentNodeShapeUtil'
import { CCRoomNodeShape, CCRoomNodeShapeUtil } from './CCRoomNodeShapeUtil'
import { CCSubjectClassNodeShape, CCSubjectClassNodeShapeUtil } from './CCSubjectClassNodeShapeUtil'
import { CCPastoralStructureNodeShape, CCPastoralStructureNodeShapeUtil } from './CCPastoralStructureNodeShapeUtil'
import { CCYearGroupNodeShape, CCYearGroupNodeShapeUtil } from './CCYearGroupNodeShapeUtil'
import { CCCurriculumStructureNodeShape, CCCurriculumStructureNodeShapeUtil } from './CCCurriculumStructureNodeShapeUtil'
import { CCKeyStageNodeShape, CCKeyStageNodeShapeUtil } from './CCKeyStageNodeShapeUtil'
import { CCKeyStageSyllabusNodeShape, CCKeyStageSyllabusNodeShapeUtil } from './CCKeyStageSyllabusNodeShapeUtil'
import { CCYearGroupSyllabusNodeShape, CCYearGroupSyllabusNodeShapeUtil } from './CCYearGroupSyllabusNodeShapeUtil'
import { CCSubjectNodeShape, CCSubjectNodeShapeUtil } from './CCSubjectNodeShapeUtil'
import { CCTopicNodeShape, CCTopicNodeShapeUtil } from './CCTopicNodeShapeUtil'
import { CCTopicLessonNodeShape, CCTopicLessonNodeShapeUtil } from './CCTopicLessonNodeShapeUtil'
import { CCLearningStatementNodeShape, CCLearningStatementNodeShapeUtil } from './CCLearningStatementNodeShapeUtil'
import { CCScienceLabNodeShape, CCScienceLabNodeShapeUtil } from './CCScienceLabNodeShapeUtil'
import { CCSchoolTimetableNodeShape, CCSchoolTimetableNodeShapeUtil } from './CCSchoolTimetableNodeShapeUtil'
import { CCAcademicYearNodeShape, CCAcademicYearNodeShapeUtil } from './CCAcademicYearNodeShapeUtil'
import { CCAcademicTermNodeShape, CCAcademicTermNodeShapeUtil } from './CCAcademicTermNodeShapeUtil'
import { CCAcademicWeekNodeShape, CCAcademicWeekNodeShapeUtil } from './CCAcademicWeekNodeShapeUtil'
import { CCAcademicDayNodeShape, CCAcademicDayNodeShapeUtil } from './CCAcademicDayNodeShapeUtil'
import { CCAcademicPeriodNodeShape, CCAcademicPeriodNodeShapeUtil } from './CCAcademicPeriodNodeShapeUtil'
import { CCRegistrationPeriodNodeShape, CCRegistrationPeriodNodeShapeUtil } from './CCRegistrationPeriodNodeShapeUtil'
import { CCTeacherTimetableNodeShape, CCTeacherTimetableNodeShapeUtil } from './CCTeacherTimetableNodeShapeUtil'
import { CCTimetableLessonNodeShape, CCTimetableLessonNodeShapeUtil } from './CCTimetableLessonNodeShapeUtil'
import { CCPlannedLessonNodeShape, CCPlannedLessonNodeShapeUtil } from './CCPlannedLessonNodeShapeUtil'
import { CCDepartmentStructureNodeShape, CCDepartmentStructureNodeShapeUtil } from './CCDepartmentStructureNodeShapeUtil'
import { CCUserTeacherTimetableNodeShape, CCUserTeacherTimetableNodeShapeUtil } from './CCUserTeacherTimetableNodeShapeUtil'
import { CCUserTimetableLessonNodeShape, CCUserTimetableLessonNodeShapeUtil } from './CCUserTimetableLessonNodeShapeUtil'

// Create a const object with all node types
export const NODE_SHAPE_TYPES = {
    USER: CCUserNodeShapeUtil.type,
    TEACHER: CCTeacherNodeShapeUtil.type,
    STUDENT: CCStudentNodeShapeUtil.type,
    CALENDAR: CCCalendarNodeShapeUtil.type,
    CALENDAR_YEAR: CCCalendarYearNodeShapeUtil.type,
    CALENDAR_MONTH: CCCalendarMonthNodeShapeUtil.type,
    CALENDAR_WEEK: CCCalendarWeekNodeShapeUtil.type,
    CALENDAR_DAY: CCCalendarDayNodeShapeUtil.type,
    CALENDAR_TIME_CHUNK: CCCalendarTimeChunkNodeShapeUtil.type,
    SCHOOL: CCSchoolNodeShapeUtil.type,
    DEPARTMENT: CCDepartmentNodeShapeUtil.type,
    ROOM: CCRoomNodeShapeUtil.type,
    SUBJECT_CLASS: CCSubjectClassNodeShapeUtil.type,
    PASTORAL_STRUCTURE: CCPastoralStructureNodeShapeUtil.type,
    YEAR_GROUP: CCYearGroupNodeShapeUtil.type,
    CURRICULUM_STRUCTURE: CCCurriculumStructureNodeShapeUtil.type,
    KEY_STAGE: CCKeyStageNodeShapeUtil.type,
    KEY_STAGE_SYLLABUS: CCKeyStageSyllabusNodeShapeUtil.type,
    YEAR_GROUP_SYLLABUS: CCYearGroupSyllabusNodeShapeUtil.type,
    SUBJECT: CCSubjectNodeShapeUtil.type,
    TOPIC: CCTopicNodeShapeUtil.type,
    TOPIC_LESSON: CCTopicLessonNodeShapeUtil.type,
    LEARNING_STATEMENT: CCLearningStatementNodeShapeUtil.type,
    SCIENCE_LAB: CCScienceLabNodeShapeUtil.type,
    SCHOOL_TIMETABLE: CCSchoolTimetableNodeShapeUtil.type,
    ACADEMIC_YEAR: CCAcademicYearNodeShapeUtil.type,
    ACADEMIC_TERM: CCAcademicTermNodeShapeUtil.type,
    ACADEMIC_WEEK: CCAcademicWeekNodeShapeUtil.type,
    ACADEMIC_DAY: CCAcademicDayNodeShapeUtil.type,
    ACADEMIC_PERIOD: CCAcademicPeriodNodeShapeUtil.type,
    REGISTRATION_PERIOD: CCRegistrationPeriodNodeShapeUtil.type,
    TEACHER_TIMETABLE: CCTeacherTimetableNodeShapeUtil.type,
    TIMETABLE_LESSON: CCTimetableLessonNodeShapeUtil.type,
    PLANNED_LESSON: CCPlannedLessonNodeShapeUtil.type,
    DEPARTMENT_STRUCTURE: CCDepartmentStructureNodeShapeUtil.type,
    USER_TEACHER_TIMETABLE: CCUserTeacherTimetableNodeShapeUtil.type,
    USER_TIMETABLE_LESSON: CCUserTimetableLessonNodeShapeUtil.type,
} as const;

// Create the type from the const object's values
export type NodeShapeType = typeof NODE_SHAPE_TYPES[keyof typeof NODE_SHAPE_TYPES];

// Define AllNodeShapes as a union type of all shape types
export type AllNodeShapes = 
    | CCUserNodeShape
    | CCTeacherNodeShape
    | CCStudentNodeShape
    | CCCalendarNodeShape
    | CCCalendarYearNodeShape
    | CCCalendarMonthNodeShape
    | CCCalendarWeekNodeShape
    | CCCalendarDayNodeShape
    | CCCalendarTimeChunkNodeShape
    | CCSchoolNodeShape
    | CCDepartmentNodeShape
    | CCRoomNodeShape
    | CCSubjectClassNodeShape
    | CCPastoralStructureNodeShape
    | CCYearGroupNodeShape
    | CCCurriculumStructureNodeShape
    | CCKeyStageNodeShape
    | CCKeyStageSyllabusNodeShape
    | CCYearGroupSyllabusNodeShape
    | CCSubjectNodeShape
    | CCTopicNodeShape
    | CCTopicLessonNodeShape
    | CCLearningStatementNodeShape
    | CCScienceLabNodeShape
    | CCSchoolTimetableNodeShape
    | CCAcademicYearNodeShape
    | CCAcademicTermNodeShape
    | CCAcademicWeekNodeShape
    | CCAcademicDayNodeShape
    | CCAcademicPeriodNodeShape
    | CCRegistrationPeriodNodeShape
    | CCTeacherTimetableNodeShape
    | CCTimetableLessonNodeShape
    | CCPlannedLessonNodeShape
    | CCDepartmentStructureNodeShape
    | CCUserTeacherTimetableNodeShape
    | CCUserTimetableLessonNodeShape;

// Export all shape utils in an object for easy access
export const ShapeUtils = {
    [CCUserNodeShapeUtil.type]: CCUserNodeShapeUtil,
    [CCTeacherNodeShapeUtil.type]: CCTeacherNodeShapeUtil,
    [CCStudentNodeShapeUtil.type]: CCStudentNodeShapeUtil,
    [CCCalendarNodeShapeUtil.type]: CCCalendarNodeShapeUtil,
    [CCCalendarYearNodeShapeUtil.type]: CCCalendarYearNodeShapeUtil,
    [CCCalendarMonthNodeShapeUtil.type]: CCCalendarMonthNodeShapeUtil,
    [CCCalendarWeekNodeShapeUtil.type]: CCCalendarWeekNodeShapeUtil,
    [CCCalendarDayNodeShapeUtil.type]: CCCalendarDayNodeShapeUtil,
    [CCCalendarTimeChunkNodeShapeUtil.type]: CCCalendarTimeChunkNodeShapeUtil,
    [CCSchoolNodeShapeUtil.type]: CCSchoolNodeShapeUtil,
    [CCDepartmentNodeShapeUtil.type]: CCDepartmentNodeShapeUtil,
    [CCRoomNodeShapeUtil.type]: CCRoomNodeShapeUtil,
    [CCSubjectClassNodeShapeUtil.type]: CCSubjectClassNodeShapeUtil,
    [CCPastoralStructureNodeShapeUtil.type]: CCPastoralStructureNodeShapeUtil,
    [CCYearGroupNodeShapeUtil.type]: CCYearGroupNodeShapeUtil,
    [CCCurriculumStructureNodeShapeUtil.type]: CCCurriculumStructureNodeShapeUtil,
    [CCKeyStageNodeShapeUtil.type]: CCKeyStageNodeShapeUtil,
    [CCKeyStageSyllabusNodeShapeUtil.type]: CCKeyStageSyllabusNodeShapeUtil,
    [CCYearGroupSyllabusNodeShapeUtil.type]: CCYearGroupSyllabusNodeShapeUtil,
    [CCSubjectNodeShapeUtil.type]: CCSubjectNodeShapeUtil,
    [CCTopicNodeShapeUtil.type]: CCTopicNodeShapeUtil,
    [CCTopicLessonNodeShapeUtil.type]: CCTopicLessonNodeShapeUtil,
    [CCLearningStatementNodeShapeUtil.type]: CCLearningStatementNodeShapeUtil,
    [CCScienceLabNodeShapeUtil.type]: CCScienceLabNodeShapeUtil,
    [CCSchoolTimetableNodeShapeUtil.type]: CCSchoolTimetableNodeShapeUtil,
    [CCAcademicYearNodeShapeUtil.type]: CCAcademicYearNodeShapeUtil,
    [CCAcademicTermNodeShapeUtil.type]: CCAcademicTermNodeShapeUtil,
    [CCAcademicWeekNodeShapeUtil.type]: CCAcademicWeekNodeShapeUtil,
    [CCAcademicDayNodeShapeUtil.type]: CCAcademicDayNodeShapeUtil,
    [CCAcademicPeriodNodeShapeUtil.type]: CCAcademicPeriodNodeShapeUtil,
    [CCRegistrationPeriodNodeShapeUtil.type]: CCRegistrationPeriodNodeShapeUtil,
    [CCTeacherTimetableNodeShapeUtil.type]: CCTeacherTimetableNodeShapeUtil,
    [CCTimetableLessonNodeShapeUtil.type]: CCTimetableLessonNodeShapeUtil,
    [CCPlannedLessonNodeShapeUtil.type]: CCPlannedLessonNodeShapeUtil,
    [CCDepartmentStructureNodeShapeUtil.type]: CCDepartmentStructureNodeShapeUtil,
    [CCUserTeacherTimetableNodeShapeUtil.type]: CCUserTeacherTimetableNodeShapeUtil,
    [CCUserTimetableLessonNodeShapeUtil.type]: CCUserTimetableLessonNodeShapeUtil,
} as const;

// Add a type guard to check if a shape is a valid node shape
export const isValidNodeShape = (shape: TLShape): shape is AllNodeShapes => {
    return shape && 
           typeof shape.type === 'string' && 
           Object.values(NODE_SHAPE_TYPES).includes(shape.type as NodeShapeType);
};

// Add a type guard to check if a type string is a valid node type
export const isValidNodeType = (type: string): type is NodeShapeType => {
    return Object.values(NODE_SHAPE_TYPES).includes(type as NodeShapeType);
}; 