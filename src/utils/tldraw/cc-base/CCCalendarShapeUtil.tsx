import { CCBaseShape, CCBaseShapeUtil } from './CCBaseShapeUtil'
import { CalendarShapeUtil } from '../calendar/CalendarShapeUtil'
import { Editor, IndexKey } from '@tldraw/tldraw'

export interface CCCalendarShape extends CCBaseShape {
  type: 'cc-calendar'
  props: CCBaseShape['props'] & {
    date: string
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
}

export class CCCalendarShapeUtil extends CCBaseShapeUtil<CCCalendarShape> {
  static type = 'cc-calendar'
  type = 'cc-calendar'

  // Create an instance of the original calendar shape util to reuse its rendering logic
  private calendarUtil: CalendarShapeUtil

  constructor(editor: Editor) {
    super(editor)
    this.calendarUtil = new CalendarShapeUtil(editor)
  }

  getDefaultProps(): CCCalendarShape['props'] {
    return {
      ...super.getDefaultProps(),
      title: 'Calendar',
      w: 400,
      h: 500,
      date: new Date().toISOString(),
      events: [],
    }
  }

  renderContent = (shape: CCCalendarShape) => {
    return this.calendarUtil.component({
      id: shape.id,
      type: 'calendar',
      x: 0,
      y: 0,
      rotation: 0,
      isLocked: shape.props.isLocked,
      index: 'start' as IndexKey,
      parentId: shape.parentId,
      typeName: 'shape',
      opacity: 1,
      meta: {},
      props: {
        w: shape.props.w,
        h: shape.props.h - 40,
        view: 'dayGridMonth',
        selectedDate: shape.props.date,
        events: shape.props.events,
      }
    })
  }
} 