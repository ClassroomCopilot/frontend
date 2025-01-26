import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { ccShapeProps, getDefaultCCCalendarProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { Rectangle2d } from 'tldraw'
import { CalendarComponent, CalendarViewType } from './CalendarComponent'
import { TeacherTimetableEvent } from '../../../../services/graph/timetableNeoDBService'

export interface CCCalendarShape extends CCBaseShape {
  type: 'cc-calendar'
  props: CCBaseShape['props'] & {
    date: string
    selectedDate: string
    view: CalendarViewType
    events: TeacherTimetableEvent[]
  }
}

export class CCCalendarShapeUtil extends CCBaseShapeUtil<CCCalendarShape> {
  static override type = 'cc-calendar' as const;
  static override props = ccShapeProps.calendar;
  static override migrations = ccShapeMigrations.calendar;

  override getDefaultProps(): CCCalendarShape['props'] {
    return getDefaultCCCalendarProps() as CCCalendarShape['props'];
  }

  override isAspectRatioLocked = () => true
  override canResize = () => true
  override canBind = () => false

  onCreate = (shape: CCCalendarShape) => {
    // Force a resize after creation to ensure calendar renders correctly
    setTimeout(() => {
      const element = document.getElementById(shape.id)
      if (element) {
        const calendar = element.querySelector('.fc') as HTMLElement
        if (calendar) {
          calendar.style.height = `${shape.props.h}px`
        }
      }
    }, 0)
    
    return {
      ...shape,
      props: this.getDefaultProps(),
    }
  }

  override renderContent = (shape: CCCalendarShape) => {
    return <CalendarComponent shape={shape} />
  }

  override getGeometry(shape: CCCalendarShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize = (
    shape: CCCalendarShape,
    info: { initialShape: CCCalendarShape; scaleX: number; scaleY: number }
  ) => {
    const { initialShape, scaleX, scaleY } = info
    const newW = Math.max(300, Math.round(initialShape.props.w * scaleX))
    const newH = Math.max(200, Math.round(initialShape.props.h * scaleY))

    return {
      props: {
        ...shape.props,
        w: newW,
        h: newH,
      },
    }
  }
} 