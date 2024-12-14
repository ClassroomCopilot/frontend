import { T } from '@tldraw/tldraw'

export const calendarShapeProps = {
  w: T.number,
  h: T.number,
  view: T.string,
  selectedDate: T.string,
  events: T.arrayOf(T.object({
    id: T.string,
    title: T.string,
    start: T.string,
    end: T.string,
    extendedProps: T.object({
      subjectClass: T.string,
      color: T.string,
      periodCode: T.string,
      path: T.optional(T.string),
    }),
  })),
}
