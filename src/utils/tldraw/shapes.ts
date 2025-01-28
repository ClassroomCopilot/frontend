// Custom tldraw utils
import { CCSlideShowShapeUtil } from './cc-base/cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShapeUtil } from './cc-base/cc-slideshow/CCSlideShapeUtil'
import { CCCalendarShapeUtil } from './cc-base/cc-calendar/CCCalendarShapeUtil'
import { CCSettingsShapeUtil } from './cc-base/cc-settings/CCSettingsShapeUtil'
import { CCLiveTranscriptionShapeUtil } from './cc-base/cc-transcription/CCLiveTranscriptionShapeUtil'
import { CCYoutubeEmbedShapeUtil } from './cc-base/cc-youtube-embed/CCYoutubeEmbedShapeUtil'
import { CCUserNodeShapeUtil } from './cc-base/cc-graph/CCUserNodeShapeUtil'
import { CCTeacherNodeShapeUtil } from './cc-base/cc-graph/CCTeacherNodeShapeUtil'
import { CCStudentNodeShapeUtil } from './cc-base/cc-graph/CCStudentNodeShapeUtil'
import { CCCalendarNodeShapeUtil } from './cc-base/cc-graph/CCCalendarNodeShapeUtil'
import { CCCalendarYearNodeShapeUtil } from './cc-base/cc-graph/CCCalendarYearNodeShapeUtil'
import { CCCalendarMonthNodeShapeUtil } from './cc-base/cc-graph/CCCalendarMonthNodeShapeUtil'
import { CCCalendarWeekNodeShapeUtil } from './cc-base/cc-graph/CCCalendarWeekNodeShapeUtil'
import { CCCalendarDayNodeShapeUtil } from './cc-base/cc-graph/CCCalendarDayNodeShapeUtil'
import { CCCalendarTimeChunkNodeShapeUtil } from './cc-base/cc-graph/CCCalendarTimeChunkNodeShapeUtil'
import { CCSchoolNodeShapeUtil } from './cc-base/cc-graph/CCSchoolNodeShapeUtil'
import { CCDepartmentNodeShapeUtil } from './cc-base/cc-graph/CCDepartmentNodeShapeUtil'
import { CCRoomNodeShapeUtil } from './cc-base/cc-graph/CCRoomNodeShapeUtil'
import { CCSubjectClassNodeShapeUtil } from './cc-base/cc-graph/CCSubjectClassNodeShapeUtil'
import { CCPastoralStructureNodeShapeUtil } from './cc-base/cc-graph/CCPastoralStructureNodeShapeUtil'
import { CCYearGroupNodeShapeUtil } from './cc-base/cc-graph/CCYearGroupNodeShapeUtil'
import { CCCurriculumStructureNodeShapeUtil } from './cc-base/cc-graph/CCCurriculumStructureNodeShapeUtil'
import { CCKeyStageNodeShapeUtil } from './cc-base/cc-graph/CCKeyStageNodeShapeUtil'
import { CCKeyStageSyllabusNodeShapeUtil } from './cc-base/cc-graph/CCKeyStageSyllabusNodeShapeUtil'
import { CCYearGroupSyllabusNodeShapeUtil } from './cc-base/cc-graph/CCYearGroupSyllabusNodeShapeUtil'
import { CCSubjectNodeShapeUtil } from './cc-base/cc-graph/CCSubjectNodeShapeUtil'
import { CCTopicNodeShapeUtil } from './cc-base/cc-graph/CCTopicNodeShapeUtil'
import { CCTopicLessonNodeShapeUtil } from './cc-base/cc-graph/CCTopicLessonNodeShapeUtil'
import { CCLearningStatementNodeShapeUtil } from './cc-base/cc-graph/CCLearningStatementNodeShapeUtil'
import { CCScienceLabNodeShapeUtil } from './cc-base/cc-graph/CCScienceLabNodeShapeUtil'
import { CCTeacherTimetableNodeShapeUtil } from './cc-base/cc-graph/CCTeacherTimetableNodeShapeUtil'
import { CCTimetableLessonNodeShapeUtil } from './cc-base/cc-graph/CCTimetableLessonNodeShapeUtil'
import { CCPlannedLessonNodeShapeUtil } from './cc-base/cc-graph/CCPlannedLessonNodeShapeUtil'
import { CCSchoolTimetableNodeShapeUtil } from './cc-base/cc-graph/CCSchoolTimetableNodeShapeUtil'
import { CCAcademicYearNodeShapeUtil } from './cc-base/cc-graph/CCAcademicYearNodeShapeUtil'
import { CCAcademicTermNodeShapeUtil } from './cc-base/cc-graph/CCAcademicTermNodeShapeUtil'
import { CCAcademicWeekNodeShapeUtil } from './cc-base/cc-graph/CCAcademicWeekNodeShapeUtil'
import { CCAcademicDayNodeShapeUtil } from './cc-base/cc-graph/CCAcademicDayNodeShapeUtil'
import { CCAcademicPeriodNodeShapeUtil } from './cc-base/cc-graph/CCAcademicPeriodNodeShapeUtil'
import { CCRegistrationPeriodNodeShapeUtil } from './cc-base/cc-graph/CCRegistrationPeriodNodeShapeUtil'

// Define all shape utils in a single object for easy maintenance
export const ShapeUtils = {
  CCSlideShow: CCSlideShowShapeUtil,
  CCSlide: CCSlideShapeUtil,
  CCCalendar: CCCalendarShapeUtil,
  CCSettings: CCSettingsShapeUtil,
  CCLiveTranscription: CCLiveTranscriptionShapeUtil,
  CCYoutubeEmbed: CCYoutubeEmbedShapeUtil,
  CCUserNode: CCUserNodeShapeUtil,
  CCTeacherNode: CCTeacherNodeShapeUtil,
  CCStudentNode: CCStudentNodeShapeUtil,
  CCCalendarNode: CCCalendarNodeShapeUtil,
  CCCalendarYearNode: CCCalendarYearNodeShapeUtil,
  CCCalendarMonthNode: CCCalendarMonthNodeShapeUtil,
  CCCalendarWeekNode: CCCalendarWeekNodeShapeUtil,
  CCCalendarDayNode: CCCalendarDayNodeShapeUtil,
  CCCalendarTimeChunkNode: CCCalendarTimeChunkNodeShapeUtil,
  CCSchoolNode: CCSchoolNodeShapeUtil,
  CCDepartmentNode: CCDepartmentNodeShapeUtil,
  CCRoomNode: CCRoomNodeShapeUtil,
  CCSubjectClassNode: CCSubjectClassNodeShapeUtil,
  CCPastoralStructureNode: CCPastoralStructureNodeShapeUtil,
  CCYearGroupNode: CCYearGroupNodeShapeUtil,
  CCCurriculumStructureNode: CCCurriculumStructureNodeShapeUtil,
  CCKeyStageNode: CCKeyStageNodeShapeUtil,
  CCKeyStageSyllabusNode: CCKeyStageSyllabusNodeShapeUtil,
  CCYearGroupSyllabusNode: CCYearGroupSyllabusNodeShapeUtil,
  CCSubjectNode: CCSubjectNodeShapeUtil,
  CCTopicNode: CCTopicNodeShapeUtil,
  CCTopicLessonNode: CCTopicLessonNodeShapeUtil,
  CCLearningStatementNode: CCLearningStatementNodeShapeUtil,
  CCScienceLabNode: CCScienceLabNodeShapeUtil,
  CCTeacherTimetableNode: CCTeacherTimetableNodeShapeUtil,
  CCTimetableLessonNode: CCTimetableLessonNodeShapeUtil,
  CCPlannedLessonNode: CCPlannedLessonNodeShapeUtil,
  CCSchoolTimetableNode: CCSchoolTimetableNodeShapeUtil,
  CCAcademicYearNode: CCAcademicYearNodeShapeUtil,
  CCAcademicTermNode: CCAcademicTermNodeShapeUtil,
  CCAcademicWeekNode: CCAcademicWeekNodeShapeUtil,
  CCAcademicDayNode: CCAcademicDayNodeShapeUtil,
  CCAcademicPeriodNode: CCAcademicPeriodNodeShapeUtil,
  CCRegistrationPeriodNode: CCRegistrationPeriodNodeShapeUtil,
}

export const allShapeUtils = Object.values(ShapeUtils)