// Custom tldraw utils
import { MicrophoneShapeUtil } from './transcription/MicrophoneShapeUtil';
import { TranscriptionTextShapeUtil } from './transcription/TranscriptionTextShapeUtil';
import { SlideShapeUtil, SlideShowShapeUtil } from './slides/SlideShapeUtil';
import { GraphShapeUtils } from './graph/graphShapeUtil';
import { CalendarShapeUtil } from './calendar/CalendarShapeUtil';
import { YoutubeEmbedShapeUtil } from './embeds/embedShapes';
import { CCSettingsShapeUtil } from './cc-base/CCSettingsShapeUtil'
import { CCCalendarShapeUtil } from './cc-base/cc-calendar/CCCalendarShapeUtil'

// Define all shape utils in a single object for easy maintenance
export const ShapeUtils = {
    // Development shapes
    YoutubeEmbed: YoutubeEmbedShapeUtil,
    
    // Calendar shapes
    Calendar: CalendarShapeUtil,
    
    // Transcription shapes
    Microphone: MicrophoneShapeUtil,
    TranscriptionText: TranscriptionTextShapeUtil,
    
    // Slide shapes
    Slide: SlideShapeUtil,
    SlideShow: SlideShowShapeUtil,
    
    // Graph shapes
    ...GraphShapeUtils,

    // CC shapes
    CCSettings: CCSettingsShapeUtil,
    CCCalendar: CCCalendarShapeUtil,
};

// Export arrays for different use cases
export const devShapeUtils = [
    ShapeUtils.CCSettings,
    ShapeUtils.CCCalendar,
    ShapeUtils.YoutubeEmbed
];

export const allShapeUtils = Object.values(ShapeUtils);