import { T } from '@tldraw/validate'
import { DefaultColorStyle } from 'tldraw'
import { CC_BASE_STYLE_CONSTANTS } from './cc-styles'

const baseProps = {
    w: T.number,
    h: T.number,
    title: T.string,
    headerColor: T.string,
    isLocked: T.boolean,
  }
  
export const ccShapeProps = {
    base: baseProps,
  
    liveTranscription: {
      ...baseProps,
      isRecording: T.boolean,
      segments: T.arrayOf(T.object({
        id: T.string,
        text: T.string,
        completed: T.boolean,
        start: T.string,
        end: T.string,
      })),
      currentSegment: T.object({
        id: T.string,
        text: T.string,
        completed: T.boolean,
        start: T.string,
        end: T.string,
      }).optional(),
      lastProcessedSegment: T.string.optional(),
    },
  
    calendar: {
      ...baseProps,
      date: T.string,
      selectedDate: T.string,
      view: T.string,
      events: T.arrayOf(T.object({
        id: T.string,
        title: T.string,
        start: T.string,
        end: T.string,
        groupId: T.string.optional(),
        extendedProps: T.object({
          subjectClass: T.string,
          color: T.string,
          periodCode: T.string,
          path: T.string.optional(),
        }),
      })),
    },
  
    settings: {
      ...baseProps,
      userEmail: T.string,
      userRole: T.string,
      isTeacher: T.boolean,
    },
  } 

// Default props for base shape
export const getDefaultCCBaseProps = () => ({
  title: 'Untitled',
  w: CC_BASE_STYLE_CONSTANTS.MIN_DIMENSIONS.width,
  h: CC_BASE_STYLE_CONSTANTS.MIN_DIMENSIONS.height,
  headerColor: DefaultColorStyle.defaultValue,
  isLocked: false,
})


export const getDefaultCCLiveTranscriptionProps = () => ({
  ...getDefaultCCBaseProps(),
  title: 'Live Transcription',
  headerColor: '#3e6589',
  isRecording: false,
  segments: [],
  currentSegment: undefined,
  lastProcessedSegment: undefined,
})


export const getDefaultCCCalendarProps = () => {
  const currentDate = new Date().toISOString()
  return {
    ...getDefaultCCBaseProps(),
    title: 'Calendar',
    w: 400,
    h: 800,
    headerColor: DefaultColorStyle.defaultValue,
    date: currentDate,
    selectedDate: currentDate,
    view: 'timeGridWeek',
    events: [],
  }
}

export const getDefaultCCSettingsProps = () => ({
  ...getDefaultCCBaseProps(),
  title: 'User Settings',
  w: 400,
  h: 500,
  headerColor: DefaultColorStyle.defaultValue,
  userEmail: '',
  userRole: '',
  isTeacher: false,
}) 