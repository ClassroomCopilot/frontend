import { CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { CCBaseShape } from '../cc-types'
import { ccShapeProps, getDefaultCCWebBrowserProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { Rectangle2d } from 'tldraw'
import { WebBrowserComponent } from './WebBrowserComponent'
import { customEmbeds } from '../../embeds'

export interface CCWebBrowserShape extends CCBaseShape {
  type: 'cc-web-browser'
  props: CCBaseShape['props'] & {
    url: string
    history: string[]
    currentHistoryIndex: number
    isLoading: boolean
  }
}

export class CCWebBrowserShapeUtil extends CCBaseShapeUtil<CCWebBrowserShape> {
  static override type = 'cc-web-browser' as const;
  static override props = ccShapeProps.webBrowser;
  static override migrations = ccShapeMigrations.webBrowser;

  override getDefaultProps(): CCWebBrowserShape['props'] {
    return getDefaultCCWebBrowserProps() as CCWebBrowserShape['props'];
  }

  override isAspectRatioLocked = () => false
  override canResize = () => true
  override canBind = () => false
  override hideResizeHandles = () => false
  override hideRotateHandle = () => false
  override canEdit = () => false

  override renderContent = (shape: CCWebBrowserShape) => {
    return (
      <div style={{ width: '100%', height: '100%', pointerEvents: 'all' }}>
        <WebBrowserComponent shape={shape} />
      </div>
    )
  }

  override getGeometry(shape: CCWebBrowserShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize = (
    shape: CCWebBrowserShape,
    info: { initialShape: CCWebBrowserShape; scaleX: number; scaleY: number }
  ) => {
    const { initialShape, scaleX, scaleY } = info
    const newW = Math.max(400, Math.round(initialShape.props.w * scaleX))
    const newH = Math.max(300, Math.round(initialShape.props.h * scaleY))

    return {
      props: {
        ...shape.props,
        w: newW,
        h: newH,
      },
    }
  }

  shouldRender = (prev: CCWebBrowserShape, next: CCWebBrowserShape) => {
    return (
      prev.props.w !== next.props.w ||
      prev.props.h !== next.props.h ||
      prev.props.url !== next.props.url ||
      prev.props.isLoading !== next.props.isLoading ||
      prev.props.currentHistoryIndex !== next.props.currentHistoryIndex ||
      prev.props.history.length !== next.props.history.length
    )
  }

  static isEmbeddableUrl(url: string): { isEmbeddable: boolean; embedType?: string } {
    try {
      const urlObj = new URL(url);
      
      // Check against our custom embeds
      for (const embed of customEmbeds) {
        if (embed.hostnames.some(hostname => 
          urlObj.hostname === hostname || 
          urlObj.hostname.endsWith(`.${hostname}`)
        )) {
          return { isEmbeddable: true, embedType: embed.type };
        }
      }
      
      return { isEmbeddable: false };
    } catch (e) {
      return { isEmbeddable: false };
    }
  }
}
