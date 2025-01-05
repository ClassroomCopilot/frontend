import { CCBaseShape } from '../CCBaseShapeUtil'
import { TeacherTimetableEvent } from '../../../../services/graph/timetableNeoDBService'

export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' | 'listMonth' | 'listWeek' | 'listDay' | 'timeGridYear' | 'timeGridMonth'

export interface CCCalendarShape extends CCBaseShape {
  type: 'cc-calendar'
  props: CCBaseShape['props'] & {
    date: string
    selectedDate: string
    view: CalendarViewType
    events: TeacherTimetableEvent[]
  }
} 