// External imports
import { defaultShapeUtils, defaultBindingUtils, createTLSchemaFromUtils } from '@tldraw/tldraw'
// TLDraw utils
import { MicrophoneShapeUtil } from './transcription/MicrophoneShapeUtil';
import { TranscriptionTextShapeUtil } from './transcription/TranscriptionTextShapeUtil';
import { SlideShapeUtil, SlideShowShapeUtil } from './slides/SlideShapeUtil';
import { GraphShapeUtils } from './graph/graphShapeUtil';
import { CalendarShapeUtil } from './calendar/CalendarShapeUtil';
import { YoutubeEmbedShapeUtil } from './embeds/embedShapes';
import { SlideLayoutBindingUtil } from './slides/SlideLayoutBindingUtil';

const devShapeUtils = [
    YoutubeEmbedShapeUtil,
];

const calendarShapeUtils = [
    CalendarShapeUtil,
];

const transcriptionShapeUtils = [
    MicrophoneShapeUtil,
    TranscriptionTextShapeUtil,
];

const slideShapeUtils = [
    SlideShowShapeUtil,
    SlideShapeUtil,
];

const graphShapeUtils = [
    GraphShapeUtils.UserNodeShapeUtil,
    GraphShapeUtils.DeveloperNodeShapeUtil,
    GraphShapeUtils.TeacherNodeShapeUtil,
    GraphShapeUtils.CalendarNodeShapeUtil,
    GraphShapeUtils.CalendarYearNodeShapeUtil,
    GraphShapeUtils.CalendarMonthNodeShapeUtil,
    GraphShapeUtils.CalendarWeekNodeShapeUtil,
    GraphShapeUtils.CalendarDayNodeShapeUtil,
    GraphShapeUtils.CalendarTimeChunkNodeShapeUtil,
    GraphShapeUtils.TeacherTimetableNodeShapeUtil,
    GraphShapeUtils.TimetableLessonNodeShapeUtil,
    GraphShapeUtils.PlannedLessonNodeShapeUtil,
    GraphShapeUtils.SchoolNodeShapeUtil,
    GraphShapeUtils.DepartmentNodeShapeUtil,
    GraphShapeUtils.RoomNodeShapeUtil,
    GraphShapeUtils.PastoralStructureNodeShapeUtil,
    GraphShapeUtils.YearGroupNodeShapeUtil,
    GraphShapeUtils.CurriculumStructureNodeShapeUtil,
    GraphShapeUtils.KeyStageNodeShapeUtil,
    GraphShapeUtils.KeyStageSyllabusNodeShapeUtil,
    GraphShapeUtils.YearGroupSyllabusNodeShapeUtil,
    GraphShapeUtils.SubjectNodeShapeUtil,
    GraphShapeUtils.TopicNodeShapeUtil,
    GraphShapeUtils.TopicLessonNodeShapeUtil,
    GraphShapeUtils.LearningStatementNodeShapeUtil,
    GraphShapeUtils.ScienceLabNodeShapeUtil,
    GraphShapeUtils.SchoolTimetableNodeShapeUtil,
    GraphShapeUtils.AcademicYearNodeShapeUtil,
    GraphShapeUtils.AcademicTermNodeShapeUtil,
    GraphShapeUtils.AcademicWeekNodeShapeUtil,
    GraphShapeUtils.AcademicDayNodeShapeUtil,
    GraphShapeUtils.AcademicPeriodNodeShapeUtil,
    GraphShapeUtils.RegistrationPeriodNodeShapeUtil,
    GraphShapeUtils.SubjectClassNodeShapeUtil,
    GraphShapeUtils.GeneralRelationshipShapeUtil,
];

export const customSchema = createTLSchemaFromUtils({
    shapeUtils: [
        ...defaultShapeUtils,
        ...transcriptionShapeUtils,
        ...slideShapeUtils,
        ...graphShapeUtils,
        ...calendarShapeUtils,
        ...devShapeUtils,
    ],
    bindingUtils: [
        ...defaultBindingUtils,
        SlideLayoutBindingUtil,
    ],
});