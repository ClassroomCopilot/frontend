import { BaseBoxShapeUtil, HTMLContainer, toDomPrecision, useEditor, Editor, createShapeId, TLResizeInfo } from '@tldraw/tldraw'
import { CustomEmbedShape } from './embedUtils'
import { useCallback, useState } from 'react'

export class CustomEmbedShapeUtil extends BaseBoxShapeUtil<CustomEmbedShape> {
  static type = 'custom-embed' as const

  getDefaultProps(): CustomEmbedShape['props'] {
    return {
      url: '',
      embedType: '',
      w: 200,
      h: 200,
    }
  }

  component(shape: CustomEmbedShape) {
    const { id, props } = shape
    const { url, embedType, w, h } = props

    const [isEditing, setIsEditing] = useState(false)
    const [inputUrl, setInputUrl] = useState(url)
    const editor = useEditor()

    const handleDoubleClick = useCallback(() => {
      setIsEditing(true)
    }, [])

    const handleBlur = useCallback(() => {
      setIsEditing(false)
      editor.updateShape<CustomEmbedShape>({
        id,
        type: 'custom-embed',
        props: { ...props, url: inputUrl },
      })
    }, [editor, id, inputUrl, props])

    return (
      <HTMLContainer id={id}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {isEditing ? (
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              style={{ width: '100%', padding: '4px' }}
            />
          ) : (
            <div onDoubleClick={handleDoubleClick} style={{ padding: '4px', cursor: 'text' }}>
              {url || 'Double-click to enter URL'}
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {url ? (
              <iframe src={url} width={toDomPrecision(w)} height={toDomPrecision(h - 30)} frameBorder="0" />
            ) : (
              <div>Enter a URL to see the embed</div>
            )}
          </div>
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: CustomEmbedShape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }

  onResize(shape: CustomEmbedShape, info: TLResizeInfo<CustomEmbedShape>) {
    return {
      props: {
        ...shape.props,
        w: shape.props.w,
        h: shape.props.h,
      },
    }
  }

  onEditEnd(shape: CustomEmbedShape) {
    const { id, props } = shape
    if (props.url) {
      this.editor.updateShape<CustomEmbedShape>({
        id,
        type: 'custom-embed',
        props: { ...props, url: props.url.trim() },
      })
    }
  }

  static onCreate(editor: Editor, embedType: string) {
    const id = createShapeId()
    const shape: CustomEmbedShape = {
      id,
      type: 'custom-embed',
      x: 0,
      y: 0,
      rotation: 0,
      index: editor.getPageShapeIds(editor.getCurrentPageId()).size,
      parentId: editor.getCurrentPageId(),
      isLocked: false,
      opacity: 1,
      props: {
        url: '',
        embedType,
        w: 320,
        h: 240,
      },
      meta: {},
      typeName: 'shape'
    }
    editor.createShapes([shape])
    editor.select(id)
  }
}
