import { SlideShapeTool, SlideShowShapeTool } from './slides/SlideShapeTool';
import MicrophoneStateTool from './transcription/MicrophoneStateTool';
import { CalendarShapeTool } from './calendar/CalendarShapeTool';
import { HeartStickerTool, SmileyStickerTool, StarStickerTool } from './tools/sticker-tool-util';

export const multiplayerTools = [
    MicrophoneStateTool,
    SlideShowShapeTool,
    SlideShapeTool, 
    CalendarShapeTool, 
    HeartStickerTool, 
    SmileyStickerTool, 
    StarStickerTool
] as const;