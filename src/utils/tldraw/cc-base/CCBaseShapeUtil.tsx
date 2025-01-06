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
  HTMLContainer,
} from 'tldraw'
import { ccShapeProps, getDefaultCCBaseProps } from './cc-props'
import { ccShapeMigrations } from './cc-migrations'
import { CC_BASE_STYLE_CONSTANTS } from './cc-styles'

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

export abstract class CCBaseShapeUtil<T extends CCBaseShape> extends BaseBoxShapeUtil<T> {
  static override type = 'cc-base'
  static override props = ccShapeProps.base
  static override migrations = ccShapeMigrations.base

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
          borderRadius: CC_BASE_STYLE_CONSTANTS.CONTAINER.borderRadius,
          boxShadow: CC_BASE_STYLE_CONSTANTS.CONTAINER.boxShadow,
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
            height: CC_BASE_STYLE_CONSTANTS.BASE_HEADER_HEIGHT,
            backgroundColor: headerColor,
            borderTopLeftRadius: CC_BASE_STYLE_CONSTANTS.HEADER.borderTopLeftRadius,
            borderTopRightRadius: CC_BASE_STYLE_CONSTANTS.HEADER.borderTopRightRadius,
            padding: CC_BASE_STYLE_CONSTANTS.HEADER_PADDING,
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
            top: CC_BASE_STYLE_CONSTANTS.BASE_HEADER_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            padding: CC_BASE_STYLE_CONSTANTS.CONTENT_PADDING,
            backgroundColor: CC_BASE_STYLE_CONSTANTS.CONTENT.backgroundColor,
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
  override getHandles(shape: T): TLHandle[] {
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
        rx={CC_BASE_STYLE_CONSTANTS.BORDER_RADIUS}
        ry={CC_BASE_STYLE_CONSTANTS.BORDER_RADIUS}
      />
    )
  }

  // Create default shape properties
  override getDefaultProps(): T['props'] {
    return getDefaultCCBaseProps() as T['props']
  }
} 