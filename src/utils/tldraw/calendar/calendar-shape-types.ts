import { TLBaseShape } from '@tldraw/tldraw'

export type CalendarShape = TLBaseShape<
  'calendar',
  {
    w: number
    h: number
    view: 'dayGridYear' | 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' | 'listMonth' | 'listWeek' | 'listDay' | 'timeGridYear' | 'timeGridMonth' 
    selectedDate: string
    events: Array<{
      id: string
      title: string
      start: string
      end: string
      extendedProps: {
        subjectClass: string
        color: string
        periodCode: string
        path?: string
      }
    }>
  }
>