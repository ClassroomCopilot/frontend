import { CCSlideShowShapeTool, CCSlideShapeTool } from './cc-base/cc-slideshow/CCSlideShapeTool';
import { HeartStickerTool, SmileyStickerTool, StarStickerTool } from './tools/sticker-tool';

// Base tools that are common across all modes
export const baseTools = [
    CCSlideShowShapeTool,
    CCSlideShapeTool,
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