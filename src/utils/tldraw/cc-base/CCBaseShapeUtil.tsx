import React from 'react';
import {
  BaseBoxShapeUtil,
  TLBaseShape,
  TLHandle,
  Vec,
  toDomPrecision,
  Box,
  TLHandleType,
  IndexKey,
  DefaultColorStyle,
} from '@tldraw/tldraw'

// Base shape interface that all CC shapes will extend
export interface CCBaseShape extends TLBaseShape<string, { h: number; w: number; }> {
  type: string
  props: {
    title: string
    w: number
    h: number
    color: string
    isLocked: boolean
  }
}

// Constants for the shape
export const HEADER_HEIGHT = 32
export const HANDLE_WIDTH = 8
export const MIN_DIMENSIONS = {
  width: 100,
  height: 100,
}

export abstract class CCBaseShapeUtil<T extends CCBaseShape> extends BaseBoxShapeUtil<T> {
  static type = 'cc-base'

  static styleProps = {
    color: DefaultColorStyle,
    opacity: { type: 'number', default: 1 }
  }

  // Override to provide shape-specific handles
  getHandles(shape: T): TLHandle[] {
    const handles: TLHandle[] = []
    
    // Add default binding handles on each side
    const sides = [
      { x: 0.5, y: 0 },    // top
      { x: 1, y: 0.5 },    // right
      { x: 0.5, y: 1 },    // bottom
      { x: 0, y: 0.5 },    // left
    ]

    sides.forEach(({ x, y }, i) => {
      handles.push({
        id: `${i}`,
        type: 'binding' as TLHandleType,
        x: x * shape.props.w,
        y: y * shape.props.h,
        index: 'start' as IndexKey,
      })
    })

    return handles
  }

  // Get the shape's bounds
  getBounds(shape: T): Box {
    return new Box(0, 0, shape.props.w, shape.props.h)
  }

  // Get the shape's outlines for selection
  getOutlineSegments(shape: T): Vec[][] {
    const {
      props: { w, h },
    } = shape

    return [
      [Vec.From({ x: 0, y: 0 }), Vec.From({ x: w, y: 0 })],
      [Vec.From({ x: w, y: 0 }), Vec.From({ x: w, y: h })],
      [Vec.From({ x: w, y: h }), Vec.From({ x: 0, y: h })],
      [Vec.From({ x: 0, y: h }), Vec.From({ x: 0, y: 0 })],
    ]
  }

  // Default component that renders the shape's container and title
  component = (shape: T) => {
    const {
      props: { w, h, title, color, isLocked },
    } = shape

    const headerStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: HEADER_HEIGHT,
      backgroundColor: color,
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: isLocked ? 'not-allowed' : 'move',
    }

    const containerStyle: React.CSSProperties = {
      width: toDomPrecision(w),
      height: toDomPrecision(h),
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      position: 'relative',
    }

    const contentStyle: React.CSSProperties = {
      position: 'absolute',
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      padding: '8px',
    }

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>{title}</span>
          {isLocked && (
            <span style={{ color: 'white' }}>🔒</span>
          )}
        </div>
        <div style={contentStyle}>
          {this.renderContent(shape)}
        </div>
      </div>
    )
  }

  // Abstract method that each shape must implement to render its content
  abstract renderContent(shape: T): React.ReactNode

  // Default indicator for the shape
  indicator = (shape: T) => {
    const {
      props: { w, h },
    } = shape
    
    return (
      <rect
        width={toDomPrecision(w)}
        height={toDomPrecision(h)}
        fill="none"
        rx={4}
        ry={4}
      />
    )
  }

  // Create default shape properties
  getDefaultProps(): T['props'] {
    return {
      title: 'Untitled',
      w: MIN_DIMENSIONS.width,
      h: MIN_DIMENSIONS.height,
      color: '#2D70F6',
      isLocked: false,
    } as T['props']
  }

  getStyleProps()
  {
    return CCBaseShapeUtil.styleProps
  }
} 