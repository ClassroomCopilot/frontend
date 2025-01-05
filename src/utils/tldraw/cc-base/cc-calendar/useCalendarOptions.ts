import { TeacherTimetableEvent } from '../../../../services/graph/timetableNeoDBService'
import { getBaseCalendarOptions, getCalendarPlugins, CalendarOptions, DateSelectArg, ViewMountArg, CALENDAR_LAYOUT } from './calendarOptions'

interface UseCalendarOptionsProps {
  shape: {
    props: {
      view: string
      h: number
    }
  }
  filteredEvents: TeacherTimetableEvent[]
  handleDateSelect: (arg: DateSelectArg) => void
  handleViewChange: (arg: ViewMountArg) => void
  toggleClassFilterModal: () => void
  setIsViewMenuOpen: (isOpen: boolean) => void
  setSelectedEvent: (event: TeacherTimetableEvent | null) => void
  setIsEventModalOpen: (isOpen: boolean) => void
}

export const useCalendarOptions = ({
  shape,
  filteredEvents,
  handleDateSelect,
  handleViewChange,
  toggleClassFilterModal,
  setIsViewMenuOpen,
  setSelectedEvent,
  setIsEventModalOpen,
}: UseCalendarOptionsProps): CalendarOptions => {
  const availableHeight = CALENDAR_LAYOUT.getAvailableHeight(shape.props.h);

  return {
    ...getBaseCalendarOptions(),
    plugins: getCalendarPlugins(),
    initialView: shape.props.view,
    events: filteredEvents,
    select: handleDateSelect,
    viewDidMount: handleViewChange,
    height: availableHeight,
    contentHeight: availableHeight,
    headerToolbar: {
      left: 'prev,next today viewToggle',
      center: 'title',
      right: 'filterClasses'
    },
    customButtons: {
      filterClasses: {
        text: 'Classes',
        click: toggleClassFilterModal,
      },
      viewToggle: {
        text: 'View',
        click: () => setIsViewMenuOpen(true),
      },
    },
    eventClick: (arg) => {
      const eventData = arg.event.toPlainObject();
      setSelectedEvent(eventData as unknown as TeacherTimetableEvent);
      setIsEventModalOpen(true);
    },
  };
}; 