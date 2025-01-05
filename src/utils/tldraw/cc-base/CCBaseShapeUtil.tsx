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
  HTMLContainer,
} from '@tldraw/tldraw'
import { T } from '@tldraw/validate'

// Base shape interface that all CC shapes will extend
export interface CCBaseShape extends TLBaseShape<string, { h: number; w: number; }> {
  type: string
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
  }
}

// Style constants
export const STYLE_CONSTANTS = {
  // Dimensions
  BASE_HEADER_HEIGHT: 32,
  HANDLE_WIDTH: 8,
  CONTENT_PADDING: 8,
  HEADER_PADDING: '4px 8px',
  BORDER_RADIUS: 4,
  
  // Minimum dimensions
  MIN_DIMENSIONS: {
    width: 100,
    height: 100,
  },

  // Container styles
  CONTAINER: {
    borderRadius: '4px',
    boxShadow: '0 2px 4px var(--color-muted-1)',
  },

  // Header styles
  HEADER: {
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },

  // Content styles
  CONTENT: {
    backgroundColor: 'white',
  }
} as const

export abstract class CCBaseShapeUtil<T extends CCBaseShape> extends BaseBoxShapeUtil<T> {
  static type = 'cc-base'

  static props = {
    w: T.number,
    h: T.number,
    title: T.string,
    headerColor: T.string,
    isLocked: T.boolean,
  }

  // Default component that renders the shape's container and title
  component = (shape: T) => {
    const {
      props: { w, h, title, headerColor, isLocked },
    } = shape

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: toDomPrecision(w),
          height: toDomPrecision(h),
          backgroundColor: headerColor,
          borderRadius: STYLE_CONSTANTS.CONTAINER.borderRadius,
          boxShadow: STYLE_CONSTANTS.CONTAINER.boxShadow,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: STYLE_CONSTANTS.BASE_HEADER_HEIGHT,
            backgroundColor: headerColor,
            borderTopLeftRadius: STYLE_CONSTANTS.HEADER.borderTopLeftRadius,
            borderTopRightRadius: STYLE_CONSTANTS.HEADER.borderTopRightRadius,
            padding: STYLE_CONSTANTS.HEADER_PADDING,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isLocked ? 'not-allowed' : 'move',
          }}
        >
          <span style={{ fontWeight: 'bold', color: "white" }}>{title}</span>
          {isLocked && <span style={{ color: 'white' }}>🔒</span>}
        </div>
        <div
          style={{
            position: 'absolute',
            top: STYLE_CONSTANTS.BASE_HEADER_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            padding: STYLE_CONSTANTS.CONTENT_PADDING,
            backgroundColor: STYLE_CONSTANTS.CONTENT.backgroundColor,
          }}
        >
          {this.renderContent(shape)}
        </div>
      </HTMLContainer>
    )
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
        rx={STYLE_CONSTANTS.BORDER_RADIUS}
        ry={STYLE_CONSTANTS.BORDER_RADIUS}
      />
    )
  }

  // Create default shape properties
  getDefaultProps(): T['props'] {
    return {
      title: 'Untitled',
      w: STYLE_CONSTANTS.MIN_DIMENSIONS.width,
      h: STYLE_CONSTANTS.MIN_DIMENSIONS.height,
      headerColor: DefaultColorStyle.defaultValue,
      isLocked: false,
    } as T['props']
  }
} 