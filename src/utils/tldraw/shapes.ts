// Custom tldraw utils
import { CCSlideShowShapeUtil } from './cc-base/cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShapeUtil } from './cc-base/cc-slideshow/CCSlideShapeUtil'
import { CCCalendarShapeUtil } from './cc-base/cc-calendar/CCCalendarShapeUtil'
import { CCSettingsShapeUtil } from './cc-base/cc-settings/CCSettingsShapeUtil'
import { CCLiveTranscriptionShapeUtil } from './cc-base/cc-transcription/CCLiveTranscriptionShapeUtil'

// Define all shape utils in a single object for easy maintenance
export const ShapeUtils = {
  CCSlideShow: CCSlideShowShapeUtil,
  CCSlide: CCSlideShapeUtil,
  CCCalendar: CCCalendarShapeUtil,
  CCSettings: CCSettingsShapeUtil,
  CCLiveTranscription: CCLiveTranscriptionShapeUtil,
}

export const allShapeUtils = Object.values(ShapeUtils)