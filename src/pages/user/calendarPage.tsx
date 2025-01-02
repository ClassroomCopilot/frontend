import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Modal from 'react-modal'; // Make sure to install this package
import { EventContentArg, EventClickArg, CalendarOptions } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';  // Import the multiMonth plugin for year view
import listPlugin from '@fullcalendar/list';

import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { FaCheck, FaExternalLinkAlt, FaEllipsisV } from 'react-icons/fa';
import { logger } from '../../debugConfig';
import { TimetableNeoDBService } from '../../services/graph/timetableNeoDBService';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  groupId?: string;
  extendedProps?: {
    subjectClass: string;
    color: string;
    periodCode: string;
    path?: string;
  };
}

interface SubjectClassColor {
  [key: string]: string;
}

function lightenColor(color: string, amount: number): string {
  // Remove the '#' if it exists
  color = color.replace(/^#/, '');

  // Parse the color
  let r = parseInt(color.slice(0, 2), 16);
  let g = parseInt(color.slice(2, 4), 16);
  let b = parseInt(color.slice(4, 6), 16);

  // Convert to HSL
  const [h, s, l] = rgbToHsl(r, g, b);

  // Adjust the lightness based on the current lightness
  const newL = l < 0.5 ? l + (1 - l) * amount : l + (1 - l) * amount * 0.5;

  // Convert back to RGB
  [r, g, b] = hslToRgb(h, s, newL);

  // Convert to hex and return
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1/6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1/2) {
        return q;
      }
      if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
      }
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const ViewMenu: React.FC<{ onSelect: (view: string) => void; onClose: () => void }> = ({ onSelect, onClose }) => {
  const views = [
    { name: 'Year (Grid)', view: 'dayGridYear' },
    { name: 'Month', view: 'dayGridMonth' },
    { name: 'Week', view: 'timeGridWeek' },
    { name: 'Day', view: 'timeGridDay' },
    { name: 'List Year', view: 'listYear' },
    { name: 'List Month', view: 'listMonth' },
    { name: 'List Week', view: 'listWeek' },
    { name: 'List Day', view: 'listDay' },
  ];

  return (
    <div className="view-toggle-list">
      {views.map(({name, view}) => (
        <button key={view} onClick={() => onSelect(view)} className="view-toggle-button">
          {name}
        </button>
      ))}
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectClassColors, setSubjectClassColors] = useState<SubjectClassColor>({});
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [hiddenSubjectClassDivs, setHiddenSubjectClassDivs] = useState<string[]>([]);
  const [hiddenPeriodCodeDivs, setHiddenPeriodCodeDivs] = useState<string[]>([]);
  const [hiddenTimeDivs, setHiddenTimeDivs] = useState<string[]>([]);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [eventRange, setEventRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const { userNodes, isLoading, error } = useNeo4j();

  const getEventRange = useCallback((events: Event[]) => {
    if (events.length === 0) {
      return { start: null, end: null };
    }

    let start = new Date(events[0].start);
    let end = new Date(events[0].end);

    events.forEach(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      if (eventStart < start) {
        start = eventStart;
      }
      if (eventEnd > end) {
        end = eventEnd;
      }
    });

    // Adjust start to the beginning of its month and end to the end of its month
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);

    return { start, end };
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!user || isLoading || error || !userNodes?.connectedNodes.teacher) {
      if (error) {
        logger.error('calendar', 'Neo4j context error', { error });
      }
      return;
    }

    try {
      logger.debug('calendar', 'Fetching events', {
        unique_id: userNodes.connectedNodes.teacher.unique_id,
        worker_db_name: userNodes.connectedNodes.teacher.worker_db_name
      });

      const events = await TimetableNeoDBService.fetchTeacherTimetableEvents(
        userNodes.connectedNodes.teacher.unique_id,
        userNodes.connectedNodes.teacher.worker_db_name
      );

      setEvents(events);
      
      // Extract unique subject classes and their colors
      const classes: string[] = [];
      const colors: SubjectClassColor = {};
      events.forEach((event: Event) => {
        if (event.extendedProps?.subjectClass && !classes.includes(event.extendedProps.subjectClass)) {
          classes.push(event.extendedProps.subjectClass);
          colors[event.extendedProps.subjectClass] = event.extendedProps.color || '#000000';
        }
      });
      
      setSubjectClasses(classes);
      setSelectedClasses(classes);
      setSubjectClassColors(colors);

      const range = getEventRange(events);
      setEventRange(range);
      
    } catch (error) {
      logger.error('calendar', 'Error fetching events', { error });
    }
  }, [user, userNodes, isLoading, error, getEventRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Add this useEffect hook to set the app element when the component mounts
  useEffect(() => {
    const appElement = document.getElementById('root');
    if (appElement) {
      Modal.setAppElement(appElement);
    }
  }, []);

  const toggleClassFilterModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const handleClassToggle = (subjectClass: string) => {
    setSelectedClasses(prev => 
      prev.includes(subjectClass)
        ? prev.filter(c => c !== subjectClass)
        : [...prev, subjectClass]
    );
  };

  const filteredEvents = events.filter(event => 
    selectedClasses.includes(event.extendedProps?.subjectClass || '')
  );

  const handleResize = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const toggleDropdown = useCallback((eventId: string) => {
    setOpenDropdownId(openDropdownId === eventId ? null : eventId);
  }, [openDropdownId]);

  const toggleSubjectClassDivVisibility = useCallback((subjectClass: string) => {
    setHiddenSubjectClassDivs(prev => 
      prev.includes(subjectClass)
        ? prev.filter(c => c !== subjectClass)
        : [...prev, subjectClass]
    );
  }, []);

  const togglePeriodCodeDivVisibility = useCallback((subjectClass: string) => {
    setHiddenPeriodCodeDivs(prev => 
      prev.includes(subjectClass)
        ? prev.filter(c => c !== subjectClass)
        : [...prev, subjectClass]
    );
  }, []);

  const toggleTimeDivVisibility = useCallback((subjectClass: string) => {
    setHiddenTimeDivs(prev => 
      prev.includes(subjectClass)
        ? prev.filter(c => c !== subjectClass)
        : [...prev, subjectClass]
    );
  }, []);

  const hideSubjectClassFromView = useCallback((subjectClass: string) => {
    setSelectedClasses(prev => prev.filter(c => c !== subjectClass));
  }, []);

  const toggleAllDivs = useCallback((subjectClass: string, hide: boolean) => {
    const updateHiddenDivs = (prev: string[]) => 
      hide ? [...prev, subjectClass] : prev.filter(c => c !== subjectClass);

    setHiddenSubjectClassDivs(updateHiddenDivs);
    setHiddenPeriodCodeDivs(updateHiddenDivs);
    setHiddenTimeDivs(updateHiddenDivs);
  }, []);

  const areAllDivsHidden = useCallback((subjectClass: string) => {
    return hiddenSubjectClassDivs.includes(subjectClass) &&
           hiddenPeriodCodeDivs.includes(subjectClass) &&
           hiddenTimeDivs.includes(subjectClass);
  }, [hiddenSubjectClassDivs, hiddenPeriodCodeDivs, hiddenTimeDivs]);

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { event } = eventInfo;
    const subjectClass = event.extendedProps?.subjectClass || 'Subject Class';
    const originalColor = event.extendedProps?.color || '#ffffff';
    const lightenedColor = lightenColor(originalColor, 0.9);

    const eventStyle = {
      backgroundColor: lightenedColor,
      color: '#000',
      padding: '4px 6px',
      borderRadius: '6px',
      fontSize: '1.0em',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `2px solid ${originalColor}`,
      position: 'relative' as const,
    };

    const titleStyle = {
      fontWeight: 'bold' as const,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: '20px',
    };

    const contentStyle = {
      fontSize: '0.8em',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };

    const ellipsisStyle = {
      position: 'absolute' as const,
      top: '4px',
      right: '4px',
      cursor: 'pointer',
      zIndex: 10,
    };

    return (
      <div className={`custom-event-content ${openDropdownId === event.id ? 'event-with-dropdown' : ''}`} style={eventStyle}>
        <div style={titleStyle}>{event.title}</div>
        <div style={ellipsisStyle}>
          <FaEllipsisV onClick={(e) => {
            e.stopPropagation();
            toggleDropdown(event.id);
          }} />
        </div>
        {openDropdownId === event.id && (
          <div className="event-dropdown" style={{ position: 'absolute'}}>
            <div onClick={(e) => {
                e.stopPropagation();
                hideSubjectClassFromView(subjectClass);
                setOpenDropdownId(null);
            }}>
                Hide this class from view
            </div>
            <div onClick={(e) => {
              e.stopPropagation();
              toggleAllDivs(subjectClass, !areAllDivsHidden(subjectClass));
              setOpenDropdownId(null);
            }}>
              {areAllDivsHidden(subjectClass) ? 'Show' : 'Hide'} all divs
            </div>
            <div onClick={(e) => {
              e.stopPropagation();
              toggleSubjectClassDivVisibility(subjectClass);
              setOpenDropdownId(null);
            }}>
              {hiddenSubjectClassDivs.includes(subjectClass) ? 'Show' : 'Hide'} subject class
            </div>
            <div onClick={(e) => {
              e.stopPropagation();
              togglePeriodCodeDivVisibility(subjectClass);
              setOpenDropdownId(null);
            }}>
              {hiddenPeriodCodeDivs.includes(subjectClass) ? 'Show' : 'Hide'} period code
            </div>
            <div onClick={(e) => {
              e.stopPropagation();
              toggleTimeDivVisibility(subjectClass);
              setOpenDropdownId(null);
            }}>
              {hiddenTimeDivs.includes(subjectClass) ? 'Show' : 'Hide'} time
            </div>
          </div>
        )}
        {!hiddenSubjectClassDivs.includes(subjectClass) && (
          <div style={contentStyle} className="event-subject-class">{subjectClass}</div>
        )}
        {!hiddenPeriodCodeDivs.includes(subjectClass) && (
          <div style={contentStyle} className="event-period">{event.extendedProps?.periodCode || 'Period Code'}</div>
        )}
        {!hiddenTimeDivs.includes(subjectClass) && (
          <div style={contentStyle} className="event-time">
            {event.start?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            {event.end?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    );
  }, [openDropdownId, hiddenSubjectClassDivs, hiddenPeriodCodeDivs, hiddenTimeDivs, toggleDropdown, hideSubjectClassFromView, toggleAllDivs, areAllDivsHidden, toggleSubjectClassDivVisibility, togglePeriodCodeDivVisibility, toggleTimeDivVisibility]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    // Convert EventImpl to Event by extracting needed properties
    const eventData: Event = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      extendedProps: {
        subjectClass: clickInfo.event.extendedProps?.subjectClass || '',
        color: clickInfo.event.extendedProps?.color || '#000000',
        periodCode: clickInfo.event.extendedProps?.periodCode || '',
        path: clickInfo.event.extendedProps?.path
      }
    };
    setSelectedEvent(eventData);
    setIsEventModalOpen(true);
  }, []);

  const calendarOptions: CalendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin, listPlugin],
    initialView: "timeGridWeek",
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'viewToggle filterClassesButton'
    },
    customButtons: {
      filterClassesButton: {
        text: 'Filter Classes',
        click: toggleClassFilterModal
      },
      viewToggle: {
        text: 'Change View',
        click: () => setIsViewMenuOpen(true)
      }
    },
    views: {
      dayGridYear: {
        type: 'dayGrid',
        duration: { years: 1 },
        buttonText: 'Year Grid',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      dayGridMonth: {
        buttonText: 'Month',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      timeGridWeek: {
        buttonText: 'Week',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      timeGridDay: {
        buttonText: 'Day',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      listYear: {
        buttonText: 'List Year',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      listMonth: {
        buttonText: 'List Month',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      listWeek: {
        buttonText: 'List Week',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
      listDay: {
        buttonText: 'List Day',
        visibleRange: (currentDate: Date) => ({
          start: eventRange.start || currentDate,
          end: eventRange.end || currentDate
        }),
      },
    },
    validRange: eventRange.start && eventRange.end ? {
      start: eventRange.start,
      end: eventRange.end
    } : undefined,
    events: filteredEvents,
    height: "100%",
    slotMinTime: "08:00:00",
    slotMaxTime: "17:00:00",
    allDaySlot: false,
    expandRows: true,
    slotEventOverlap: false,
    slotDuration: "00:30:00",
    slotLabelInterval: "01:00",
    eventContent: renderEventContent,
    eventClassNames: (arg: { event: { extendedProps?: { subjectClass?: string } } }) => 
      [arg.event.extendedProps?.subjectClass || ''],
    eventDidMount: (arg: { event: { extendedProps?: { color?: string }; id: string }; el: HTMLElement }) => {
      if (arg.event.extendedProps?.color) {
        const originalColor = arg.event.extendedProps.color;
        const lightenedColor = lightenColor(originalColor, 0.4); // Increase lightening amount
        arg.el.style.backgroundColor = lightenedColor;
        arg.el.style.borderColor = originalColor;
      }
      
      const updateEventContent = () => {
        const height = arg.el.offsetHeight;
        const contentElements = arg.el.querySelectorAll('.custom-event-content > div:not(.event-dropdown)');
        
        contentElements.forEach((el, index) => {
          const element = el as HTMLElement;
          if (index === 0 || index === 1) {
            // Always show the title and ellipsis
            element.style.display = 'block';
          } else if (height >= 40 && index === 2) {
            // Show subject class if height is sufficient
            element.style.display = 'block';
          } else if (height >= 60 && index === 3) {
            // Show period code if height is sufficient
            element.style.display = 'block';
          } else if (height >= 80 && index === 4) {
            // Show time if height is sufficient
            element.style.display = 'block';
          } else {
            // Hide other elements
            element.style.display = 'none';
          }
        });

      };

      updateEventContent();
      
      // Create a ResizeObserver to watch for changes in the event's size
      const resizeObserver = new ResizeObserver(updateEventContent);
      resizeObserver.observe(arg.el);

      // Clean up the observer when the event is unmounted
      return () => resizeObserver.disconnect();
    },
    eventClick: handleEventClick,
  }), [toggleClassFilterModal, eventRange.start, eventRange.end, filteredEvents, renderEventContent, handleEventClick]);

  if (!user) {
    console.log('User not logged in');
    return <div>Please log in to view your calendar.</div>;
  }

  const toggleEventModal = () => {
    setIsEventModalOpen(!isEventModalOpen);
  };

  const handleOpenTldrawFile = (path: string) => {
    // Navigate to the multiplayerUser page with the path as a query parameter
    // We don't need to append the filename here, as it will be handled in multiplayerUser.tsx
    navigate(`/multiplayer?path=${encodeURIComponent(path)}`);
  };

  const renderClassFilterButton = (subjectClass: string) => {
    const isSelected = selectedClasses.includes(subjectClass);
    const color = subjectClassColors[subjectClass] || '#000000';
    const buttonStyle = {
      backgroundColor: isSelected ? color : '#ffffff',
      color: isSelected ? '#ffffff' : '#000000',
      border: `2px solid ${color}`,
    };

    return (
      <button
        key={subjectClass}
        className={`class-filter-button ${isSelected ? 'selected' : ''}`}
        style={buttonStyle}
        onClick={() => handleClassToggle(subjectClass)}
      >
        <div className="checkbox">
          {isSelected && <FaCheck />}
        </div>
        <span>{subjectClass}</span>
      </button>
    );
  };

  return (
    <div className="calendar-page">
      <div className="calendar-container" style={{ height: '100vh', position: 'relative' }}>
        <FullCalendar
          {...calendarOptions}
          ref={calendarRef}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleClassFilterModal}
        contentLabel="Filter Classes"
        className="class-filter-modal"
        overlayClassName="class-filter-modal-overlay"
        appElement={document.getElementById('root') as HTMLElement}
      >
        <h2>Filter Classes</h2>
        <div className="class-filter-list">
          {subjectClasses.map(renderClassFilterButton)}
        </div>
        <div className="close-button-container">
          <button className="close-button" onClick={toggleClassFilterModal}>Close</button>
        </div>
      </Modal>
      <Modal
        isOpen={isViewMenuOpen}
        onRequestClose={() => setIsViewMenuOpen(false)}
        contentLabel="Change View"
        className="view-toggle-modal"
        overlayClassName="view-toggle-modal-overlay"
        appElement={document.getElementById('root') as HTMLElement}
      >
        <h2>Select Calendar View</h2>
        <ViewMenu 
          onSelect={(view) => {
            calendarRef.current?.getApi().changeView(view);
            setIsViewMenuOpen(false);
          }}
          onClose={() => setIsViewMenuOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isEventModalOpen}
        onRequestClose={toggleEventModal}
        contentLabel="Event Details"
        className="event-details-modal"
        overlayClassName="event-details-modal-overlay"
        appElement={document.getElementById('root') as HTMLElement}
      >
        <h2>{selectedEvent?.title}</h2>
        <div className="event-details">
          <p><strong>Start Time:</strong> {selectedEvent?.start?.toLocaleString()}</p>
          <p><strong>End Time:</strong> {selectedEvent?.end?.toLocaleString()}</p>
          <p><strong>Class:</strong> {selectedEvent?.extendedProps?.subjectClass}</p>
          <p><strong>Period:</strong> {selectedEvent?.extendedProps?.periodCode}</p>
          {selectedEvent?.extendedProps?.path && (
            <button 
              className="open-tldraw-button"
              onClick={() => selectedEvent?.extendedProps?.path && handleOpenTldrawFile(selectedEvent.extendedProps.path)}
            >
              Open Tldraw File <FaExternalLinkAlt />
            </button>
          )}
        </div>
        <button className="close-button" onClick={toggleEventModal}>Close</button>
      </Modal>
    </div>
  );
};

export default CalendarPage;