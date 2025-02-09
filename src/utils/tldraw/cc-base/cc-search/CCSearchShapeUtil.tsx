import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { ccShapeProps, getDefaultCCSearchProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { Rectangle2d, Vec } from 'tldraw'
import { SearchComponent } from './SearchComponent'
import { SearchResult } from '../../../../services/tldraw/searchService'
export interface CCSearchShape extends CCBaseShape {
  type: 'cc-search'
  props: CCBaseShape['props'] & {
    query: string
    results: SearchResult[]
    isSearching: boolean
  }
}

export class CCSearchShapeUtil extends CCBaseShapeUtil<CCSearchShape> {
  static override type = 'cc-search' as const;
  static override props = ccShapeProps.search;
  static override migrations = ccShapeMigrations.search;

  override getDefaultProps(): CCSearchShape['props'] {
    return getDefaultCCSearchProps() as CCSearchShape['props'];
  }

  override isAspectRatioLocked = () => false
  override canResize = () => true
  override canBind = () => false
  override hideResizeHandles = () => false
  override hideRotateHandle = () => false
  override canEdit = () => false

  override renderContent = (shape: CCSearchShape) => {
    return (
      <div style={{ width: '100%', height: '100%', pointerEvents: 'all' }}>
        <SearchComponent shape={shape} />
      </div>
    )
  }

  override getGeometry(shape: CCSearchShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize = (
    shape: CCSearchShape,
    info: { initialShape: CCSearchShape; scaleX: number; scaleY: number }
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

  hitTestPoint = (shape: CCSearchShape, point: Vec) => {
    const geometry = this.getGeometry(shape)
    return geometry.hitTestPoint(point)
  }

  hitTestLineSegment = (shape: CCSearchShape, start: Vec, end: Vec) => {
    const geometry = this.getGeometry(shape)
    return geometry.hitTestLineSegment(start, end)
  }

  shouldRender = (prev: CCSearchShape, next: CCSearchShape) => {
    return (
      prev.props.w !== next.props.w ||
      prev.props.h !== next.props.h ||
      prev.props.query !== next.props.query ||
      prev.props.results !== next.props.results ||
      prev.props.isSearching !== next.props.isSearching
    )
  }
} 