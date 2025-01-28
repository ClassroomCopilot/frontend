import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from './cc-styles'
import { TLShapeId } from '@tldraw/tldraw'

export interface CCShapeConfig {
  width: number
  height: number
  xOffset: number
  yOffset: number
  defaultProps: {
    title: string
    headerColor: string
    backgroundColor: string
    isLocked: boolean
    [key: string]: string | number | boolean | Date | TLShapeId[] | undefined | null
  }
}

export const CC_SHAPE_CONFIGS: Record<string, CCShapeConfig> = {
  'cc-calendar': {
    width: 400,
    height: 600,
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'Calendar',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
      date: new Date().toISOString(),
      events: [],
      view: 'timeGridWeek',
    }
  },
  'cc-settings': {
    width: 400,
    height: 500,
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'User Settings',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
    }
  },
  'cc-live-transcription': {
    width: 300,
    height: 400,
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'Live Transcription',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
      isRecording: false,
      segments: [],
      currentSegment: undefined,
      lastProcessedSegment: undefined,
    }
  },
  'cc-slideshow': {
    width: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH * 3 + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 4,
    height: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + 
      CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT +
      CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 +
      CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING * 2,
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'Slideshow',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
      currentSlideIndex: 0,
      slidePattern: 'horizontal',
      numSlides: 3,
    }
  },
  'cc-slide': {
    width: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH,
    height: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT,
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'Slide',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
      imageData: '',
    }
  },
  'cc-youtube-embed': {
    width: 800,
    height: 450 + CC_BASE_STYLE_CONSTANTS.HEADER.height + (CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2),
    xOffset: 0,
    yOffset: 0,
    defaultProps: {
      title: 'YouTube Video',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
      isLocked: false,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      transcript: [],
      transcriptVisible: false,
    }
  }
}
