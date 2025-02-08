import { T } from 'tldraw'
import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'

export interface CCBaseProps {
  title: string
  w: number
  h: number
  headerColor: string
  backgroundColor: string
  isLocked: boolean
}

// Create a constant for the base props validation
export const baseShapeProps = {
  title: T.string,
  w: T.number,
  h: T.number,
  headerColor: T.string,
  backgroundColor: T.string,
  isLocked: T.boolean,
}

export const ccShapeProps = {
  base: baseShapeProps,

  calendar: {
    ...baseShapeProps,
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
        path: T.string.optional()
      })
    })),
  },

  liveTranscription: {
    ...baseShapeProps,
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

  settings: {
    ...baseShapeProps,
    userEmail: T.string,
    userRole: T.string,
    isTeacher: T.boolean,
  },

  slideshow: {
    ...baseShapeProps,
    currentSlideIndex: T.number,
    slidePattern: T.string,
    numSlides: T.number,
    slides: T.arrayOf(T.object({
      imageData: T.string,
      meta: T.object({
        text: T.string,
        format: T.string,
      }),
    })).optional(),
  },

  slide: {
    ...baseShapeProps,
    imageData: T.string,
    meta: T.object({
      text: T.string,
      format: T.string,
    }),
  },

  'cc-youtube-embed': {
    ...baseShapeProps,
    video_url: T.string,
    transcript: T.arrayOf(T.object({
      start: T.number,
      duration: T.number,
      text: T.string,
    })),
    transcriptVisible: T.boolean,
  },
}

export const ccBindingProps = {
  'cc-slide-layout': {
    isMovingWithParent: T.boolean.optional(),
    placeholder: T.boolean.optional(),
    index: T.string
  },
}

export const getDefaultCCBaseProps = () => ({
  title: 'Base Shape',
  w: 100,
  h: 100,
  headerColor: '#3e6589',
  backgroundColor: '#ffffff',
  isLocked: false,
})

export const getDefaultCCCalendarProps = () => ({
  ...getDefaultCCBaseProps(),
  date: new Date().toISOString(),
  selectedDate: new Date().toISOString(),
  view: 'timeGridWeek',
  events: [],
})

export const getDefaultCCLiveTranscriptionProps = () => ({
  ...getDefaultCCBaseProps(),
  isRecording: false,
  segments: [],
  currentSegment: undefined,
  lastProcessedSegment: undefined,
})

export const getDefaultCCSettingsProps = () => ({
  ...getDefaultCCBaseProps(),
  userEmail: '',
  userRole: '',
  isTeacher: false,
})

export function getDefaultCCSlideShowProps() {
  // Base 16:9 ratio dimensions
  const baseWidth = 1280
  const baseHeight = 720
  // Add header height and spacing
  const totalHeight = baseHeight + 
  CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT + // Slideshow's own header
  CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 + // Top and bottom spacing
  CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING // Extra padding for content
  
  return {
    title: 'Slideshow',
    w: baseWidth,
    h: totalHeight,
    headerColor: '#3e6589',
    backgroundColor: '#0f0f0f',
    isLocked: false,
    currentSlideIndex: 0,
    slidePattern: 'horizontal',
    numSlides: 3,
    slides: [],
  }
}

export function getDefaultCCSlideProps() {
  // Base 16:9 ratio dimensions
  const baseWidth = 1280
  const baseHeight = 720
  // Add header height
  const totalHeight = baseHeight + CC_BASE_STYLE_CONSTANTS.HEADER.height
  
  return {
    title: 'Slide',
    w: baseWidth,
    h: totalHeight,
    headerColor: '#3e6589',
    backgroundColor: '#0f0f0f',
    isLocked: false,
    imageData: '',
    meta: {
      text: '',
      format: 'markdown'
    }
  }
}

export function getDefaultCCSlideLayoutBindingProps() {
  return {
    isMovingWithParent: false,
    placeholder: false,
    index: '0',
  }
}

export function getDefaultCCYoutubeEmbedProps() {
  const videoHeight = 450
  const totalHeight = videoHeight + CC_BASE_STYLE_CONSTANTS.HEADER.height + (CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2)
  
  return {
    ...getDefaultCCBaseProps(),
    title: 'YouTube Video',
    w: 800,
    h: totalHeight,
    headerColor: '#ff0000',
    backgroundColor: '#0f0f0f',
    isLocked: false,
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    transcript: [],
    transcriptVisible: false,
  }
}
