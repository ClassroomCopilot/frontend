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
    isLocked: boolean
    [key: string]: string | number | boolean | Date | TLShapeId[] | undefined | null
  }
}

export const CC_SHAPE_CONFIGS: Record<string, CCShapeConfig> = {
  'cc-calendar': {
    width: 400,
    height: 600,
    xOffset: 200,
    yOffset: 300,
    defaultProps: {
      title: 'Calendar',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      isLocked: false,
      date: new Date().toISOString(),
      events: [],
      view: 'timeGridWeek',
    }
  },
  'cc-settings': {
    width: 400,
    height: 500,
    xOffset: 200,
    yOffset: 250,
    defaultProps: {
      title: 'User Settings',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      isLocked: false,
    }
  },
  'cc-live-transcription': {
    width: 300,
    height: 400,
    xOffset: 200,
    yOffset: 150,
    defaultProps: {
      title: 'Live Transcription',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      isLocked: false,
      isRecording: false,
      segments: [],
      currentSegment: undefined,
      lastProcessedSegment: '',
    }
  },
  'cc-slideshow': {
    width: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH * 3 + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 4,
    height: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2,
    xOffset: 400,
    yOffset: 300,
    defaultProps: {
      title: 'Slideshow',
      headerColor: CC_BASE_STYLE_CONSTANTS.COLORS.primary,
      isLocked: false,
      slides: [],
      currentSlideIndex: 0,
      slidePattern: 'horizontal',
      numSlides: 4,
    }
  },
  'cc-youtube-embed': {
    width: 800,
    height: 450 + CC_BASE_STYLE_CONSTANTS.HEADER.height + (CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2),
    xOffset: 400,
    yOffset: (450 + CC_BASE_STYLE_CONSTANTS.HEADER.height + (CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2)) / 2,
    defaultProps: {
      title: 'YouTube Video',
      headerColor: '#ff0000',
      isLocked: false,
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      transcript: [],
      transcriptVisible: false,
    }
  }
}
