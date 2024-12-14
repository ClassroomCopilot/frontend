import { BaseBoxShapeTool, TLClickEvent, createShapeId, IndexKey } from '@tldraw/tldraw'
import { CalendarShape } from './calendar-shape-types'

export class CalendarShapeTool extends BaseBoxShapeTool {
  static id = 'calendar'
  static initial = 'idle'
  
  shapeType = 'calendar' as const

  override onDoubleClick: TLClickEvent = (info) => {
    const currentPage = this.editor.getCurrentPage()

    const id = createShapeId()
    const shape: CalendarShape = {
      id,
      typeName: 'shape',
      type: 'calendar',
      x: info.point.x,
      y: info.point.y,
      rotation: 0,
      index: 'a1' as IndexKey,
      parentId: currentPage.id,
      isLocked: false,
      opacity: 1,
      props: {
        w: 600,
        h: 400,
        view: 'timeGridWeek',
        selectedDate: new Date().toISOString(),
        events: []
      },
      meta: {},
    }

    this.editor.createShapes([shape])
    this.editor.select(id)
  }
}
