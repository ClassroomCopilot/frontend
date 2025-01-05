import { CalendarOptions, EventContentArg, formatDate, DateSelectArg, ViewMountArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { TimetableNeoDBService } from '../../../../services/graph/timetableNeoDBService'
import { calendarEventStyle } from './styles'

// Calendar layout constants
export const CALENDAR_LAYOUT = {
  TOOLBAR_HEIGHT: 5,
  HEADER_PADDING: 5,
  CONTENT_PADDING: 5,
  FOOTER_HEIGHT: 0,
  // Function to calculate available content height
  getAvailableHeight: (totalHeight: number) => {
    return totalHeight - (
      CALENDAR_LAYOUT.TOOLBAR_HEIGHT +
      CALENDAR_LAYOUT.HEADER_PADDING * 2 +
      CALENDAR_LAYOUT.CONTENT_PADDING * 2 +
      CALENDAR_LAYOUT.FOOTER_HEIGHT
    );
  }
} as const;

// Re-export types that other files might need
export type { CalendarOptions, EventContentArg, DateSelectArg, ViewMountArg }

// Export plugins
export const getCalendarPlugins = () => [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
]

// Export event content renderer
export const renderEventContent = (arg: EventContentArg) => {
  const backgroundColor = TimetableNeoDBService.lightenColor(arg.event.extendedProps?.color || '#000000', 100);
  const textColor = TimetableNeoDBService.getContrastColor(backgroundColor);

  const formatEventTime = (date: Date | null) => {
    if (!date) {
      return '';
    }
    return formatDate(date, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'local'
    });
  };

  const formattedStartTime = formatEventTime(arg.event.start);  //DO NOT REMOVE THIS COMMENT
  const formattedEndTime = formatEventTime(arg.event.end);  //DO NOT REMOVE THIS COMMENT
  const timeAndPeriodCodeString = `${arg.event.extendedProps?.periodCode || ''}`; //DO NOT REMOVE THIS COMMENT

  return {
    html: `
      <div class="fc-event-main-frame" style="background-color: ${calendarEventStyle.mainFrame.backgroundColor}; color: ${textColor}; display: ${calendarEventStyle.mainFrame.display}; align-items: ${calendarEventStyle.mainFrame.alignItems}; justify-content: ${calendarEventStyle.mainFrame.justifyContent}; min-height: ${calendarEventStyle.mainFrame.minHeight}; padding: ${calendarEventStyle.mainFrame.padding}; border-radius: ${calendarEventStyle.mainFrame.borderRadius};">
        <div class="fc-event-title fc-sticky" style="color: ${textColor}; font-size: ${calendarEventStyle.title.fontSize}; font-weight: ${calendarEventStyle.title.fontWeight}; text-align: ${calendarEventStyle.title.textAlign}; overflow: ${calendarEventStyle.title.overflow}; text-overflow: ${calendarEventStyle.title.textOverflow}; white-space: ${calendarEventStyle.title.whiteSpace}; opacity: ${calendarEventStyle.title.opacity}; padding: ${calendarEventStyle.title.padding}; width: ${calendarEventStyle.title.width}; letter-spacing: ${calendarEventStyle.title.letterSpacing}; margin: ${calendarEventStyle.title.margin};">${arg.event.title}</div>
      </div>
    `
  };
}

// Export base calendar options
export const getBaseCalendarOptions = (): Partial<CalendarOptions> => ({
  aspectRatio: undefined,
  expandRows: true,
  stickyHeaderDates: true,
  stickyFooterScrollbar: false,
  dayHeaders: true,
  dayHeaderFormat(arg) {
    return formatDate(arg.date.marker, { weekday: 'long' });
  },
  titleFormat: (arg) => {
    return formatDate(arg.date.marker, { weekday: 'long' });
  },
  dayMaxEvents: 10,
  selectable: true,
  eventMinHeight: 10,
  navLinks: true,
  hiddenDays: [1],
  weekends: false,
  slotMinTime: '08:00:00',
  slotMaxTime: '16:00:00',
  slotDuration: '00:30:00',
  slotLabelInterval: '01:00',
  allDaySlot: false,
  slotEventOverlap: true,
  dayMaxEventRows: 1,
  eventMaxStack: 1,
  slotLabelFormat: [
    {
      formatMatcher: 'best fit',
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true,
      meridiem: 'narrow',
      hour12: false,
    }
  ],
  buttonText: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
  },
  buttonIcons: {
    prev: 'chevron-left',
    next: 'chevron-right',
    prevYear: 'chevrons-left',
    nextYear: 'chevrons-right',
  },
  themeSystem: 'standard',
  eventContent: renderEventContent,
  eventClassNames: (arg: { event: { extendedProps?: { subjectClass?: string; color?: string } } }) => {
    return [arg.event.extendedProps?.subjectClass || ''];
  },
  eventDidMount: (arg: { event: { extendedProps?: { color?: string }; id: string }; el: HTMLElement }) => {
    if (arg.event.extendedProps?.color) {
      const originalColor = arg.event.extendedProps.color;
      const lightenedColor = TimetableNeoDBService.lightenColor(originalColor, 100);
      arg.el.style.backgroundColor = lightenedColor;
      arg.el.style.borderColor = originalColor;
      arg.el.style.color = TimetableNeoDBService.getContrastColor(lightenedColor);
    }
  },
}) 