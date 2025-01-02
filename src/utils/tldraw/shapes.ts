// Custom tldraw utils
import { MicrophoneShapeUtil } from './transcription/MicrophoneShapeUtil';
import { TranscriptionTextShapeUtil } from './transcription/TranscriptionTextShapeUtil';
import { SlideShapeUtil, SlideShowShapeUtil } from './slides/SlideShapeUtil';
import { GraphShapeUtils } from './graph/graphShapeUtil';
import { CalendarShapeUtil } from './calendar/CalendarShapeUtil';
import { YoutubeEmbedShapeUtil } from './embeds/embedShapes';

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
    ...GraphShapeUtils
};

// Export arrays for different use cases
export const devShapeUtils = [ShapeUtils.YoutubeEmbed];

export const allShapeUtils = Object.values(ShapeUtils);