import { TldrawOptions } from "@tldraw/tldraw";

export const multiplayerOptions: Partial<TldrawOptions> = {
	actionShortcutsLocation: "swap",
    adjacentShapeMargin: 10,
    animationMediumMs: 320,
    cameraMovingTimeoutMs: 64,
    cameraSlideFriction: 0.09,
    coarseDragDistanceSquared: 36,
    coarseHandleRadius: 20,
    coarsePointerWidth: 12,
    collaboratorCheckIntervalMs: 1200,
    collaboratorIdleTimeoutMs: 3000,
    collaboratorInactiveTimeoutMs: 60000,
    defaultSvgPadding: 32,
    doubleClickDurationMs: 450,
    dragDistanceSquared: 16,
    edgeScrollDelay: 200,
    edgeScrollDistance: 8,
    edgeScrollEaseDuration: 200,
    edgeScrollSpeed: 25,
    flattenImageBoundsExpand: 64,
    flattenImageBoundsPadding: 16,
    followChaseViewportSnap: 2,
    gridSteps: [
        { mid: 0.15, min: -1, step: 64 },
        { mid: 0.375, min: 0.05, step: 16 },
        { mid: 1, min: 0.15, step: 4 },
        { mid: 2.5, min: 0.7, step: 1 }
    ],
    handleRadius: 12,
    hitTestMargin: 8,
    laserDelayMs: 1200,
    longPressDurationMs: 500,
    maxExportDelayMs: 5000,
    maxFilesAtOnce: 100,
    maxPages: 1,
    maxPointsPerDrawShape: 500,
    maxShapesPerPage: 4000,
    multiClickDurationMs: 200,
    temporaryAssetPreviewLifetimeMs: 180000,
    textShadowLod: 0.35
}