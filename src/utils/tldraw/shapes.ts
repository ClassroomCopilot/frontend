// Custom tldraw utils
import { CCSlideShowShapeUtil } from './cc-base/CCSlideShowShapeUtil'
import { CCSlideShapeUtil } from './cc-base/CCSlideShapeUtil'
import { CCCalendarShapeUtil } from './cc-base/CCCalendarShapeUtil'
import { CCSettingsShapeUtil } from './cc-base/CCSettingsShapeUtil'
import { CCLiveTranscriptionShapeUtil } from './cc-base/CCLiveTranscriptionShapeUtil'

// Define all shape utils in a single object for easy maintenance
export const ShapeUtils = {
  CCSlideShow: CCSlideShowShapeUtil,
  CCSlide: CCSlideShapeUtil,
  CCCalendar: CCCalendarShapeUtil,
  CCSettings: CCSettingsShapeUtil,
  CCLiveTranscription: CCLiveTranscriptionShapeUtil,
}

export const allShapeUtils = Object.values(ShapeUtils)