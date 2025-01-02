import { SlideShapeTool, SlideShowShapeTool } from './slides/SlideShapeTool';
import MicrophoneStateTool from './transcription/MicrophoneStateTool';
import { CalendarShapeTool } from './calendar/CalendarShapeTool';
import { HeartStickerTool, SmileyStickerTool, StarStickerTool } from './tools/sticker-tool';

// Base tools that are common across all modes
export const baseTools = [
    MicrophoneStateTool,
    SlideShowShapeTool,
    SlideShapeTool,
    CalendarShapeTool,
] as const;

// Sticker tools that can be added to any mode
export const stickerTools = [
    HeartStickerTool,
    SmileyStickerTool,
    StarStickerTool,
] as const;

// Specific tool sets for different modes
export const multiplayerTools = [
    ...baseTools,
    ...stickerTools,
] as const;

export const singlePlayerTools = [
    ...baseTools,
    ...stickerTools,
] as const;

export const devTools = [
    ...baseTools,
    ...stickerTools,
] as const;