import React from 'react'
import { BaseBoxShapeUtil, HTMLContainer, toDomPrecision } from '@tldraw/tldraw'
import { CCBaseShape } from './cc-types'
import { CC_BASE_STYLE_CONSTANTS } from './cc-styles'
import { logger } from '../../../debugConfig'

export interface ToolbarItem {
  id: string
  icon: string | React.ReactNode
  label: string
  onClick: (e: React.MouseEvent, shape: CCBaseShape) => void
  isActive?: boolean
}

export abstract class CCBaseShapeUtil<T extends CCBaseShape> extends BaseBoxShapeUtil<T> {
  abstract renderContent: (shape: T) => React.ReactElement

  indicator(shape: T) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        fill="none"
        rx={CC_BASE_STYLE_CONSTANTS.CONTAINER.borderRadius}
        stroke={CC_BASE_STYLE_CONSTANTS.COLORS.border}
        strokeWidth={CC_BASE_STYLE_CONSTANTS.CONTAINER.borderWidth}
      />
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getToolbarItems(shape: T): ToolbarItem[] {
    return []
  }

  onAfterCreate(shape: T) {
    logger.info('cc-base-shape-util', 'onAfterCreate', shape)
    return shape
  }

  component(shape: T) {
    const {
      props: { w, h, isLocked },
    } = shape
    const toolbarItems = this.getToolbarItems(shape)
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: toDomPrecision(w),
          height: toDomPrecision(h),
          backgroundColor: shape.props.headerColor,
          borderRadius: CC_BASE_STYLE_CONSTANTS.CONTAINER.borderRadius,
          boxShadow: CC_BASE_STYLE_CONSTANTS.CONTAINER.boxShadow,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: shape.props.headerColor,
            padding: CC_BASE_STYLE_CONSTANTS.HEADER.padding,
            height: CC_BASE_STYLE_CONSTANTS.HEADER.height,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isLocked ? 'not-allowed' : 'move',
            pointerEvents: 'all',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span style={{ color: 'white', fontWeight: 'bold' }}>{shape.props.title}</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', pointerEvents: 'all' }}>
            {toolbarItems.map((item) => (
              <button
                key={item.id}
                title={item.label}
                onClick={(e) => {
                  logger.info('cc-base-shape-util', 'toolbar item clicked', item.id)
                  e.preventDefault()
                  e.stopPropagation()
                  item.onClick(e, shape)
                }}
                onPointerDown={(e) => {
                  logger.info('cc-base-shape-util', 'toolbar item pointer down', item.id)
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'white',
                  opacity: item.isActive ? 1 : 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'all',
                  fontSize: '16px',
                  width: '24px',
                  height: '24px',
                  zIndex: 100,
                  userSelect: 'none',
                  position: 'relative',
                  touchAction: 'none',
                }}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {item.icon}
                </div>
              </button>
            ))}
            {isLocked && <span style={{ color: 'white' }}>🔒</span>}
          </div>
        </div>
        {/* Content */}
        <div 
          style={{
            position: 'absolute',
            top: CC_BASE_STYLE_CONSTANTS.HEADER.height,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            padding: CC_BASE_STYLE_CONSTANTS.CONTENT.padding,
            backgroundColor: shape.props.backgroundColor,
          }}
        >
          {this.renderContent(shape)}
        </div>
      </HTMLContainer>
    )
  }
} 