import { CCBaseShapeUtil } from './CCBaseShapeUtil'
import { DefaultColorStyle, Rectangle2d, TLBaseShape } from '@tldraw/tldraw'
import { T } from '@tldraw/validate'
import { CCCalendarShape } from './cc-calendar/types'
import { CalendarComponent } from './cc-calendar/CalendarComponent'

export class CCCalendarShapeUtil extends CCBaseShapeUtil<CCCalendarShape> {
  static type = 'cc-calendar'
  type = 'cc-calendar'

  static props = {
    ...CCBaseShapeUtil.props,
    date: T.string,
    selectedDate: T.string,
    view: T.string,
    events: T.arrayOf(T.object({
      id: T.string,
      title: T.string,
      start: T.string,
      end: T.string,
      groupId: T.optional(T.string),
      extendedProps: T.object({
        subjectClass: T.string,
        color: T.string,
        periodCode: T.string,
        path: T.optional(T.string),
      })
    }))
  }

  getDefaultProps(): CCCalendarShape['props'] {
    const currentDate = new Date().toISOString()
    return {
      ...super.getDefaultProps(),
      title: 'Calendar',
      w: 400,
      h: 800, // Increased from 500 to better accommodate week view
      headerColor: DefaultColorStyle.defaultValue,
      date: currentDate,
      selectedDate: currentDate,
      view: 'timeGridWeek',
      events: [],
    }
  }

  onCreate = (shape: TLBaseShape<'cc-calendar', CCCalendarShape['props']>) => {
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

  renderContent = (shape: CCCalendarShape) => {
    return <CalendarComponent shape={shape} />
  }

  indicator = (shape: CCCalendarShape) => {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        fill="none"
        stroke="lightgray"
        strokeWidth={1}
      />
    )
  }

  getGeometry(shape: CCCalendarShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  isAspectRatioLocked = () => false
  canResize = () => true
  canBind = () => false

  onResize = (
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