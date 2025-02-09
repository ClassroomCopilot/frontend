import { Editor } from '@tldraw/tldraw'
import { CCSearchShape } from '../cc-search/CCSearchShapeUtil'
import { SearchService } from '../../../../services/tldraw/searchService'

export const createSearchShape = async (
  editor: Editor,
  options?: {
    x?: number
    y?: number
    query?: string
  }
) => {
  const { width, height } = editor.getViewportPageBounds()
  const x = options?.x ?? width / 2 - 200
  const y = options?.y ?? height / 2 - 250

  const results = options?.query ? await SearchService.search(options.query).catch(() => []) : []

  return editor.createShape<CCSearchShape>({
    type: 'cc-search',
    x,
    y,
    props: {
      w: 400,
      h: 500,
      title: 'Search',
      headerColor: '#1a73e8',
      backgroundColor: '#ffffff',
      isLocked: false,
      query: options?.query ?? '',
      results,
      isSearching: false,
    },
  })
}
