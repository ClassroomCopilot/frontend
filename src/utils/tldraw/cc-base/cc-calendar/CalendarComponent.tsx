import React, { useCallback, useEffect, useState, useRef } from 'react'
import { HTMLContainer, useEditor } from '@tldraw/tldraw'
import FullCalendar from '@fullcalendar/react'
import { DateSelectArg, ViewMountArg } from '@fullcalendar/core'
import { useNeo4j } from '../../../../contexts/Neo4jContext'
import { LoadingState } from '../../../../services/tldraw/snapshotService'
import { TimetableNeoDBService, TeacherTimetableEvent } from '../../../../services/graph/timetableNeoDBService'
import { ClassFilterModal, ViewMenuModal, EventDetailsModal } from './CalendarModals'
import { useCalendarOptions } from './useCalendarOptions'
import { openTldrawFile } from './utils'
import { CC_BASE_STYLE_CONSTANTS } from '../cc-styles'
import { CCCalendarShape } from './CCCalendarShapeUtil'

export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' | 'listMonth' | 'listWeek' | 'listDay' | 'timeGridYear' | 'timeGridMonth'

interface CalendarComponentProps {
  shape: CCCalendarShape
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({ shape }) => {
  const editor = useEditor()
  const { userNodes, isLoading, error, workerDbName } = useNeo4j()
  const [events, setEvents] = useState<TeacherTimetableEvent[]>(shape.props.events)
  const calendarRef = useRef<FullCalendar>(null)
  const lastFetchRef = useRef<number>(0)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>()
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subjectClasses, setSubjectClasses] = useState<string[]>([])
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TeacherTimetableEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [fileLoadingState, setFileLoadingState] = useState<LoadingState>({
    status: 'ready',
    error: ''
  })

  const debouncedUpdateSize = useCallback(() => {
    clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 200);
  }, [calendarRef]);

  const loadEvents = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < 60000) {
      return;
    }
    lastFetchRef.current = now

    if ((events && events.length > 0) || isLoading || error || !userNodes?.connectedNodes.teacher) {
      if (isLoading || error || !userNodes?.connectedNodes.teacher) {
        console.error('Unable to fetch events: Neo4j context not ready');
      }
      return;
    }

    try {
      const fetchedEvents = await TimetableNeoDBService.fetchTeacherTimetableEvents(
        userNodes.connectedNodes.teacher.unique_id,
        userNodes.connectedNodes.teacher.worker_db_name
      );

      setEvents(fetchedEvents);
      
      const range = TimetableNeoDBService.getEventRange(fetchedEvents);
      if (calendarRef.current) {
        const api = calendarRef.current.getApi();
        if (range.start && range.end) {
          api.setOption('validRange', {
            start: range.start,
            end: range.end
          });
        } else {
          api.setOption('validRange', undefined);
        }
      }

      editor.updateShape({
        id: shape.id,
        type: 'cc-calendar',
        props: { ...shape.props, events: fetchedEvents }
      })
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    }
  }, [editor, userNodes, isLoading, error, events, shape.id, shape.props])

  useEffect(() => {
    debouncedUpdateSize();
  }, [debouncedUpdateSize]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDateSelect = useCallback((arg: DateSelectArg) => {
    editor.updateShape<CCCalendarShape>({
      id: shape.id,
      type: 'cc-calendar',
      props: { ...shape.props, selectedDate: arg.start.toISOString() }
    })
  }, [editor, shape.id, shape.props])

  const handleViewChange = useCallback((mountArg: ViewMountArg) => {
    const newView = mountArg.view.type as CCCalendarShape['props']['view']
    editor.updateShape<CCCalendarShape>({
      id: shape.id,
      type: 'cc-calendar',
      props: { ...shape.props, view: newView }
    })
  }, [editor, shape.id, shape.props])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation()
  }, [])

  const toggleClassFilterModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleClassToggle = (subjectClass: string) => {
    setSelectedClasses(prev => 
      prev.includes(subjectClass)
        ? prev.filter(c => c !== subjectClass)
        : [...prev, subjectClass]
    );
  };

  useEffect(() => {
    const classes = Array.from(new Set(events.map(event => event.extendedProps?.subjectClass || '')));
    setSubjectClasses(classes);
    setSelectedClasses(classes);
  }, [events]);

  const filteredEvents = events.filter(event => 
    selectedClasses.includes(event.extendedProps?.subjectClass || '')
  );

  // Calculate available height for calendar
  const getAvailableHeight = useCallback(() => {
    const totalPadding = CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2
    const availableHeight = shape.props.h - CC_BASE_STYLE_CONSTANTS.HEADER.height - totalPadding
    return Math.max(availableHeight, CC_BASE_STYLE_CONSTANTS.MIN_DIMENSIONS.height)
  }, [shape.props.h])

  // Calculate available width for calendar
  const getAvailableWidth = useCallback(() => {
    const totalPadding = CC_BASE_STYLE_CONSTANTS.CONTENT.padding * 2
    const availableWidth = shape.props.w - totalPadding
    return Math.max(availableWidth, CC_BASE_STYLE_CONSTANTS.MIN_DIMENSIONS.width)
  }, [shape.props.w])

  const calendarOptions = useCalendarOptions({
    shape: {
      ...shape,
      props: {
        ...shape.props,
        h: getAvailableHeight(),
      }
    },
    filteredEvents,
    handleDateSelect,
    handleViewChange,
    toggleClassFilterModal,
    setIsViewMenuOpen,
    setSelectedEvent,
    setIsEventModalOpen,
  });

  // Update calendar size when shape dimensions change
  useEffect(() => {
    if (calendarRef.current) {
      const calendar = calendarRef.current.getApi();
      calendar.updateSize();
    }
  }, [shape.props.w, shape.props.h]);

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        width: getAvailableWidth(),
        height: getAvailableHeight(),
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
        padding: CC_BASE_STYLE_CONSTANTS.CONTENT.padding,
        color: 'black',
        pointerEvents: 'all',
        display: 'flex',
        flexDirection: 'column',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
    >
      <div style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden'
      }}>
        <FullCalendar 
          ref={calendarRef} 
          {...calendarOptions}
        />
      </div>
      
      <ClassFilterModal
        isOpen={isModalOpen}
        onClose={toggleClassFilterModal}
        subjectClasses={subjectClasses}
        selectedClasses={selectedClasses}
        onClassToggle={handleClassToggle}
        events={events}
      />

      <ViewMenuModal
        isOpen={isViewMenuOpen}
        onClose={() => setIsViewMenuOpen(false)}
        onViewSelect={(view) => {
          calendarRef.current?.getApi().changeView(view);
          setIsViewMenuOpen(false);
        }}
      />

      <EventDetailsModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        selectedEvent={selectedEvent}
        fileLoadingState={fileLoadingState}
        editor={editor}
        workerDbName={workerDbName || undefined}
        onOpenFile={openTldrawFile}
        setFileLoadingState={setFileLoadingState}
      />
    </HTMLContainer>
  )
} 