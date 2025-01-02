import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Tldraw,
    Editor,
    useTldrawUser,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
} from '@tldraw/tldraw';
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
// Tldraw services
import { localStoreService } from '../../services/tldraw/localStoreService';
// Tldraw utils
import { customAssets } from '../../utils/tldraw/assets';
import { devEmbeds } from '../../utils/tldraw/embeds';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { devTools } from '../../utils/tldraw/tools';
import { customSchema } from '../../utils/tldraw/schemas';
// Layout
import { HEADER_HEIGHT } from '../Layout';
// Styles
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';
// App debug
import { logger } from '../../debugConfig';

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

const MAX_EVENTS = 100; // Limit visible events to last 100

const EventDisplay: React.FC<{ events: Array<{ type: string; data: string; timestamp: string }> }> = 
  ({ events }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [events]);

  // Only show the last MAX_EVENTS events
  const visibleEvents = useMemo(() => 
    events.slice(-MAX_EVENTS),
    [events]
  );

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
      {visibleEvents.length === MAX_EVENTS && (
        <div style={{
          padding: '4px 8px',
          marginBottom: 8,
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: 4,
          fontSize: 11,
        }}>
          Showing last {MAX_EVENTS} events only
        </div>
      )}
      {visibleEvents.map((event, i) => (
        <pre
          key={event.timestamp + i}
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

export default function DevPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { tldrawPreferences, initializePreferences, setTldrawPreferences } = useTLDraw();
    const [events, setEvents] = useState<Array<{ type: 'ui' | 'store' | 'canvas'; data: string; timestamp: string; }>>([]);
    const [eventFilters, setEventFilters] = useState<EventFilters>({ mode: 'all', filters: {} });
    const [logPanelWidth, setLogPanelWidth] = useState(30); // Width in percentage
    const editorRef = useRef<Editor | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.body.style.cursor = 'col-resize';
        
        const handleDragMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            
            const windowWidth = window.innerWidth;
            const newWidth = (e.clientX / windowWidth) * 100;
            
            // Limit the range to between 20% and 80%
            const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
            setLogPanelWidth(100 - clampedWidth);
        };

        const handleDragUp = () => {
            isDraggingRef.current = false;
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragUp);
        };

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragUp);
    }, []);

    // Create tldraw user
    const tldrawUser = useTldrawUser({
        userPreferences: {
            id: user?.id ?? 'dev-user',
            name: user?.displayName ?? 'Dev User',
            color: tldrawPreferences?.color,
            locale: tldrawPreferences?.locale,
            colorScheme: tldrawPreferences?.colorScheme,
            animationSpeed: tldrawPreferences?.animationSpeed,
            isSnapMode: tldrawPreferences?.isSnapMode
        },
        setUserPreferences: setTldrawPreferences
    });

    // Create store
    const store = useMemo(() => localStoreService.getStore({
        schema: customSchema,
        shapeUtils: allShapeUtils,
        bindingUtils: allBindingUtils
    }), []);

    // Initialize preferences when user is available
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            logger.debug('dev-page', '🔄 Initializing preferences for user', { userId: user.id });
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    // Redirect if no user
    useEffect(() => {
        if (!user) {
            logger.info('dev-page', '🚪 Redirecting to home - no user logged in');
            navigate('/');
        }
    }, [user, navigate]);

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
            // Keep last 2 * MAX_EVENTS in state to allow some scrollback
            return newEvents.slice(-(MAX_EVENTS * 2));
        });
    }, [shouldCaptureEvent]);

    const handleUiEvent = useCallback((name: string, data: unknown) => {
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
        if (store) {
            const cleanupFn = store.listen((info) => {
                const eventString = `Store Event: ${info.source} ${JSON.stringify(info.changes)}`;
                addEvent('store', eventString);
                console.log(eventString);
            });
            return () => cleanupFn();
        }
    }, [store, addEvent]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [events]);

    if (!user) {
        logger.info('dev-page', '🚫 Rendering null - no user');
        return null;
    }

    return (
        <div style={{ 
            display: 'flex', 
            width: '100%', 
            height: `calc(100vh - ${HEADER_HEIGHT}px)`, 
            position: 'fixed',
            top: `${HEADER_HEIGHT}px`
        }}>
            <div style={{ 
                width: `${100 - logPanelWidth}%`, 
                height: '100%', 
                position: "absolute", 
                left: 0,
                overflow: 'hidden'
            }}>
                <Tldraw
                    user={tldrawUser}
                    store={store}
                    onMount={(editor) => {
                        editorRef.current = editor;
                        handleCanvasEvent(editor);
                        logger.info('system', '🎨 Tldraw mounted', {
                            editorId: editor.store.id
                        });
                    }}
                    onUiEvent={handleUiEvent}
                    tools={devTools}
                    shapeUtils={allShapeUtils}
                    bindingUtils={allBindingUtils}
                    embeds={devEmbeds}
                    assetUrls={customAssets}
                    autoFocus={true}
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
                    width: '5px',
                    height: '100%',
                    position: 'absolute',
                    left: `${100 - logPanelWidth}%`,
                    transform: 'translateX(-50%)',
                    cursor: 'col-resize',
                    backgroundColor: 'transparent',
                    zIndex: 1000,
                }}
                onMouseDown={handleDragStart}
            >
                <div style={{
                    width: '1px',
                    height: '100%',
                    backgroundColor: '#333',
                    margin: '0 auto',
                }} />
            </div>
            <div
                style={{
                    width: `${logPanelWidth}%`,
                    height: '100%',
                    position: 'absolute',
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <EventMonitoringControls filters={eventFilters} setFilters={setEventFilters} />
                <EventDisplay events={events} />
            </div>
        </div>
    );
}
