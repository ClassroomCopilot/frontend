import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Tldraw,
    Editor,
    defaultShapeUtils,
    defaultBindingUtils,
    TldrawOptions,
    TLUiEventHandler,
    DefaultSpinner,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
} from '@tldraw/tldraw';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
import { createTldrawUser } from '../../services/tldraw/tldrawService';
import { loadUserNodeTldrawFile } from '../../services/tldraw/snapshotService';
import { localStoreService } from '../../services/tldraw/localStoreService';
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssetUrls } from '../../utils/tldraw/assetUrls';
import { createSharedStore } from '../../services/tldraw/sharedStoreService';
import { MicrophoneShapeUtil } from '../../utils/tldraw/transcription/MicrophoneShapeUtil';
import MicrophoneStateTool from '../../utils/tldraw/transcription/MicrophoneStateTool';
import { TranscriptionTextShapeUtil } from '../../utils/tldraw/transcription/TranscriptionTextShapeUtil';
import { SlideShapeUtil, SlideShowShapeUtil } from '../../utils/tldraw/slides/SlideShapeUtil';
import { SlideShapeTool, SlideShowShapeTool } from '../../utils/tldraw/slides/SlideShapeTool';
import { CalendarShapeUtil } from '../../utils/tldraw/calendar/CalendarShapeUtil';
import { CalendarShapeTool } from '../../utils/tldraw/calendar/CalendarShapeTool';
import { GraphShapeUtils } from '../../utils/tldraw/graph/graphShapeUtil';
import { defaultEmbedsToKeep, customEmbeds } from '../../utils/tldraw/embeds/embedSetup';
import { YoutubeEmbedShapeUtil } from '../../utils/tldraw/embeds/embedShapes';
import '../../utils/tldraw/tldraw.css';
import { logger } from '../../debugConfig';

const devShapeUtils = [
    YoutubeEmbedShapeUtil,
];

const calendarShapeUtils = [
    CalendarShapeUtil,
];

const transcriptionShapeUtils = [
    MicrophoneShapeUtil,
    TranscriptionTextShapeUtil,
];

const slideShapeUtils = [
    SlideShapeUtil,
    SlideShowShapeUtil,
];

const graphShapeUtils = [
    GraphShapeUtils.UserNodeShapeUtil,
    GraphShapeUtils.DeveloperNodeShapeUtil,
    GraphShapeUtils.TeacherNodeShapeUtil,
    GraphShapeUtils.CalendarNodeShapeUtil,
    GraphShapeUtils.CalendarYearNodeShapeUtil,
    GraphShapeUtils.CalendarMonthNodeShapeUtil,
    GraphShapeUtils.CalendarWeekNodeShapeUtil,
    GraphShapeUtils.CalendarDayNodeShapeUtil,
    GraphShapeUtils.CalendarTimeChunkNodeShapeUtil,
    GraphShapeUtils.TeacherTimetableNodeShapeUtil,
    GraphShapeUtils.TimetableLessonNodeShapeUtil,
    GraphShapeUtils.PlannedLessonNodeShapeUtil,
    GraphShapeUtils.SchoolNodeShapeUtil,
    GraphShapeUtils.DepartmentNodeShapeUtil,
    GraphShapeUtils.RoomNodeShapeUtil,
    GraphShapeUtils.PastoralStructureNodeShapeUtil,
    GraphShapeUtils.YearGroupNodeShapeUtil,
    GraphShapeUtils.CurriculumStructureNodeShapeUtil,
    GraphShapeUtils.KeyStageNodeShapeUtil,
    GraphShapeUtils.KeyStageSyllabusNodeShapeUtil,
    GraphShapeUtils.YearGroupSyllabusNodeShapeUtil,
    GraphShapeUtils.SubjectNodeShapeUtil,
    GraphShapeUtils.TopicNodeShapeUtil,
    GraphShapeUtils.TopicLessonNodeShapeUtil,
    GraphShapeUtils.LearningStatementNodeShapeUtil,
    GraphShapeUtils.ScienceLabNodeShapeUtil,
    GraphShapeUtils.SchoolTimetableNodeShapeUtil,
    GraphShapeUtils.AcademicYearNodeShapeUtil,
    GraphShapeUtils.AcademicTermNodeShapeUtil,
    GraphShapeUtils.AcademicWeekNodeShapeUtil,
    GraphShapeUtils.AcademicDayNodeShapeUtil,
    GraphShapeUtils.AcademicPeriodNodeShapeUtil,
    GraphShapeUtils.RegistrationPeriodNodeShapeUtil,
    GraphShapeUtils.SubjectClassNodeShapeUtil,
    GraphShapeUtils.GeneralRelationshipShapeUtil,
];

const customTools = [MicrophoneStateTool, SlideShapeTool, SlideShowShapeTool, CalendarShapeTool];

const options: Partial<TldrawOptions> = {
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

interface EventFilter {
  type: 'all' | 'ui' | 'store' | 'canvas';
  subType?: string;
  enabled: boolean;
}

interface EventFilters {
  mode: 'all' | 'specific';
  filters: {
    [key: string]: EventFilter;
  };
}

const EventMonitoringControls: React.FC<{
  filters: EventFilters;
  setFilters: (filters: EventFilters) => void;
}> = ({ filters, setFilters }) => {
  const handleModeChange = (mode: 'all' | 'specific') => {
    setFilters({ ...filters, mode });
  };

  const handleFilterChange = (key: string, enabled: boolean) => {
    setFilters({
      ...filters,
      filters: {
        ...filters.filters,
        [key]: { ...filters.filters[key], enabled }
      }
    });
  };

  return (
    <div className="event-monitor-controls">
      <div className="mode-selector">
        <label>
          <input
            type="radio"
            checked={filters.mode === 'all'}
            onChange={() => handleModeChange('all')}
          />
          Monitor All Events
        </label>
        <label>
          <input
            type="radio"
            checked={filters.mode === 'specific'}
            onChange={() => handleModeChange('specific')}
          />
          Monitor Specific Events
        </label>
      </div>
      
      {filters.mode === 'specific' && (
        <div className="specific-filters">
          <select 
            onChange={(e) => handleFilterChange(e.target.value, true)}
            value=""
          >
            <option value="" disabled>Add Event Filter</option>
            <optgroup label="UI Events">
              <option value="ui-selection">Selection Changes</option>
              <option value="ui-tool">Tool Changes</option>
              <option value="ui-viewport">Viewport Changes</option>
            </optgroup>
            <optgroup label="Store Events">
              <option value="store-shapes">Shape Updates</option>
              <option value="store-bindings">Binding Updates</option>
              <option value="store-assets">Asset Updates</option>
            </optgroup>
            <optgroup label="Canvas Events">
              <option value="canvas-pointer">Pointer Events</option>
              <option value="canvas-camera">Camera Events</option>
              <option value="canvas-selection">Selection Events</option>
            </optgroup>
          </select>

          <div className="active-filters">
            {Object.entries(filters.filters)
              .filter(([, filter]) => filter.enabled)
              .map(([key]) => (
                <div key={key} className="filter-tag">
                  {key}
                  <button onClick={() => handleFilterChange(key, false)}>×</button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EventDisplay: React.FC<{ events: Array<{ type: string; data: string; timestamp: string }> }> = 
  ({ events }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      ref={scrollContainerRef}
      className="event-display"
      style={{
        flex: 1,
        padding: 8,
        background: '#ddd',
        borderLeft: 'solid 2px #333',
        fontFamily: 'monospace',
        fontSize: 12,
        overflow: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      {events.map((event, i) => (
        <pre
          key={i}
          style={{
            borderBottom: '1px solid #000',
            marginBottom: 0,
            paddingBottom: '12px',
            backgroundColor: getEventTypeColor(event.type),
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          <span className="event-timestamp">{event.timestamp}</span>
          <span className="event-type">[{event.type}]</span>
          {event.data}
        </pre>
      ))}
    </div>
  );
};

const getEventTypeColor = (type: string): string => {
  switch (type) {
    case 'ui':
      return '#e8f0fe';  // Light blue
    case 'store':
      return '#fef3e8';  // Light orange
    case 'canvas':
      return '#f0fee8';  // Light green
    default:
      return 'transparent';
  }
};

type LoadingState = {
    status: 'loading' | 'ready' | 'error';
    error?: string;
};

export default function DevPage() {
    const { user } = useAuth();
    const { userNodes } = useNeo4j();
    const { tldrawPreferences } = useTLDraw();
    const navigate = useNavigate();
    const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'loading' });
    const [events, setEvents] = useState<Array<{ type: 'ui' | 'store' | 'canvas'; data: string; timestamp: string; }>>([]);
    const [eventFilters, setEventFilters] = useState<EventFilters>({ mode: 'all', filters: {} });
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const tldrawUser = useMemo(() => 
        createTldrawUser(user?.id || 'anonymous', tldrawPreferences),
        [user?.id, tldrawPreferences]
    );

    const store = useMemo(() => localStoreService.getStore({
        shapeUtils: [
            ...defaultShapeUtils,
            ...transcriptionShapeUtils,
            ...slideShapeUtils,
            ...graphShapeUtils,
            ...calendarShapeUtils,
            ...devShapeUtils
        ],
        bindingUtils: [...defaultBindingUtils]
    }), []);

    const sharedStore = useMemo(() => createSharedStore(store), [store]);

    const shouldCaptureEvent = useCallback((type: 'ui' | 'store' | 'canvas', data: string) => {
        if (eventFilters.mode === 'all') return true;

        // Check specific filters
        return Object.entries(eventFilters.filters)
            .some(([key, filter]) => {
                if (!filter.enabled) return false;
                
                const [filterType, filterSubType] = key.split('-');
                if (filterType !== type) return false;

                // Match specific event subtypes
                switch (filterType) {
                    case 'ui':
                        return data.includes(filterSubType);
                    case 'store':
                        return data.includes(`"type":"${filterSubType}"`);
                    case 'canvas':
                        return data.includes(`Canvas Event: ${filterSubType}`);
                    default:
                        return false;
                }
            });
    }, [eventFilters]);

    const addEvent = useCallback((type: 'ui' | 'store' | 'canvas', data: string) => {
        if (!shouldCaptureEvent(type, data)) return;
        
        setEvents(prevEvents => {
            const newEvents = [...prevEvents, {
                type,
                data,
                timestamp: new Date().toISOString()
            }];
            return newEvents.slice(-1000);
        });
    }, [shouldCaptureEvent]);

    const handleUiEvent = useCallback<TLUiEventHandler>((name, data) => {
        const eventString = `UI Event: ${name} ${JSON.stringify(data)}`;
        addEvent('ui', eventString);
        console.log(eventString);
    }, [addEvent]);

    const handleCanvasEvent = useCallback((editor: Editor) => {
        logger.trace('dev-page', '🎨 Canvas editor mounted');
        
        editor.on('change', () => {
            const camera = editor.getCamera();
            logger.trace('dev-page', '🎥 Camera changed', { camera });
            addEvent('canvas', `Canvas Event: camera ${JSON.stringify(camera)}`);
        });
    
        editor.on('change', () => {
            const selectedIds = editor.getSelectedShapeIds();
            if (selectedIds.length > 0) {
                logger.trace('dev-page', '🔍 Selection changed', { selectedIds });
                addEvent('canvas', `Canvas Event: selection ${JSON.stringify(selectedIds)}`);
            }
        });
    
        editor.on('event', (info) => {
            if (info.type === 'pointer') {
                const point = editor.inputs.currentPagePoint;
                logger.trace('dev-page', '👆 Pointer event', { point });
                addEvent('canvas', `Canvas Event: pointer ${JSON.stringify(point)}`);
            }
        });
    }, [addEvent]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [events]);

    useEffect(() => {
        if (!sharedStore) return;
        sharedStore.startAutoSave(setLoadingState);
        return () => sharedStore.stopAutoSave();
    }, [sharedStore]);

    useEffect(() => {
        if (!user || !userNodes?.privateUserNode || !tldrawUser || !sharedStore) return;
        loadUserNodeTldrawFile(userNodes?.privateUserNode, store, sharedStore);
        return () => {
            if (sharedStore) {
                sharedStore.stopAutoSave();
            }
        };
    }, [user, userNodes?.privateUserNode, tldrawUser, sharedStore, store]);

    useEffect(() => {
        if (store) {
            const cleanupFn = store.listen((info) => {
                const eventString = `Store Event: ${info.source} ${JSON.stringify(info.changes)}`;
                addEvent('store', eventString);
                console.log(eventString);
            });
            return () => cleanupFn();
        }
    }, [store, addEvent]);

    if (!user) {
        logger.info('dev-page', '🚫 Rendering null - no user');
        return null;
    }

    if (loadingState.status === 'loading') {
        logger.debug('dev-page', '⏳ Rendering loading state');
        return <div><DefaultSpinner /></div>;
    } else if (loadingState.status === 'error') {
        logger.error('dev-page', '❌ Rendering error state', { error: loadingState.error });
        return <div>Error: {loadingState.error}</div>;
    }

    const uiOverrides = getUiOverrides(false);
    const uiComponents = getUiComponents(false);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'fixed' }}>
            <div style={{ width: '70%', height: '100%', position: "absolute", inset: 0 }}>
                <Tldraw
                    user={tldrawUser}
                    store={store}
                    onMount={(editor) => {
                        handleCanvasEvent(editor);
                    }}
                    onUiEvent={handleUiEvent}
                    options={options}
                    embeds={[...defaultEmbedsToKeep, ...customEmbeds]}
                    tools={customTools}
                    shapeUtils={[...transcriptionShapeUtils, ...slideShapeUtils, ...graphShapeUtils, ...calendarShapeUtils, ...devShapeUtils]}
                    initialState="select"
                    overrides={uiOverrides}
                    components={uiComponents}
                    assetUrls={customAssetUrls}
                    hideUi={false}
                    inferDarkMode={false}
                    acceptedImageMimeTypes={DEFAULT_SUPPORTED_IMAGE_TYPES}
                    acceptedVideoMimeTypes={DEFAULT_SUPPORT_VIDEO_TYPES}
                    maxImageDimension={Infinity}
                    maxAssetSize={100 * 1024 * 1024}
                    renderDebugMenuItems={() => []}
                />
            </div>
            <div
                style={{
                    width: '30%',
                    height: '100%',
                    position: 'absolute',
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <EventMonitoringControls filters={eventFilters} setFilters={setEventFilters} />
                <EventDisplay events={events} />
            </div>
        </div>
    );
}
