import React from 'react'
import { useEditor, TldrawUiButton } from '@tldraw/tldraw'
import { BasePanel } from './BasePanel'
import { 
  useSlideShows, 
  useCurrentSlide, 
  moveToSlide, 
  getSlideLabel 
} from '../../../cc-base/cc-slideshow/useSlideShow'
import { CCSlideShape } from '../../../cc-base/cc-slideshow/CCSlideShapeUtil'
import { CCSlideShowShape } from '../../../cc-base/cc-slideshow/CCSlideShowShapeUtil'
import { useTLDraw } from '../../../../../contexts/TLDrawContext'
import { logger } from '../../../../../debugConfig'

interface CCSlidesProps {
  onPanelTypeChange: (type: string) => void
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export const CCSlidesPanel: React.FC<CCSlidesProps> = ({
  onPanelTypeChange,
  isExpanded,
  onExpandedChange,
}) => {
  const editor = useEditor()
  const slideshows = useSlideShows()
  const currentSlide = useCurrentSlide()
  const { presentationMode, togglePresentationMode } = useTLDraw()

  const handleSlideClick = (slide: CCSlideShape) => {
    logger.info('selection', '🖱️ Slide clicked in panel', {
      slideId: slide.id,
      timestamp: new Date().toISOString()
    })
    moveToSlide(editor, slide, presentationMode)
  }

  const handleTogglePresentation = () => {
    logger.info('presentation', '🔄 Toggling presentation mode from slides panel')
    togglePresentationMode(editor)
  }

  const renderSlideshow = (slideshow: CCSlideShowShape) => {
    return (
      <div key={slideshow.id} className="slideshow-container">
        <div className="slideshow-header">
          <h3>{slideshow.props.title || 'Untitled Slideshow'}</h3>
          <span className="slide-count">
            {slideshow.props.slides.length} slides
          </span>
        </div>
        <div className="slides-list">
          {slideshow.props.slides.map((slideId, index) => {
            const slide = editor.getShape(slideId) as CCSlideShape
            if (!slide) return null

            const isCurrentSlide = currentSlide?.id === slide.id
            return (
              <div
                key={slide.id}
                className={`slide-item ${isCurrentSlide ? 'selected' : ''}`}
                onClick={() => handleSlideClick(slide)}
              >
                <span className="slide-number">{index + 1}</span>
                <span className="slide-title">
                  {getSlideLabel(slide, index)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <BasePanel
      panelTypes={[
        { id: 'cc-shapes', label: 'Shapes' },
        { id: 'slides', label: 'Slides' },
      ]}
      currentPanelType="slides"
      onPanelTypeChange={onPanelTypeChange}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
    >
      <div className="slides-panel">
        <div className="slides-panel-tools">
          <TldrawUiButton 
            type="normal"
            className="slides-panel-button presentation-button"
            data-active={presentationMode}
            data-testid="toggle-presentation"
            onClick={handleTogglePresentation}
          >
            {presentationMode ? 'Exit Presentation' : 'Present'}
          </TldrawUiButton>
        </div>

        {slideshows.length === 0 ? (
          <div className="no-slides">
            <p>No slideshows yet</p>
            <p>Create a slideshow to get started</p>
          </div>
        ) : (
          slideshows.map(renderSlideshow)
        )}
      </div>

      <style>{`
        .slides-panel {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .slides-panel-tools {
          display: flex;
          justify-content: flex-start;
          padding: 0 0 8px 0;
          border-bottom: 1px solid var(--color-divider);
        }

        .presentation-button {
          width: 100%;
          justify-content: center;
          font-weight: 500;
        }

        .presentation-button[data-active="true"] {
          background-color: var(--color-selected);
          color: var(--color-selected-contrast);
        }

        .no-slides {
          text-align: center;
          color: var(--color-text-2);
          padding: 16px;
        }

        .slideshow-container {
          border: 1px solid var(--color-divider);
          border-radius: 4px;
          overflow: hidden;
        }

        .slideshow-header {
          background: var(--color-muted);
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slideshow-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .slide-count {
          font-size: 12px;
          color: var(--color-text-2);
        }

        .slides-list {
          display: flex;
          flex-direction: column;
        }

        .slide-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          cursor: pointer;
          border-bottom: 1px solid var(--color-divider);
          transition: background-color 0.2s;
        }

        .slide-item:hover {
          background-color: var(--color-hover);
        }

        .slide-item.selected {
          background-color: var(--color-selected);
        }

        .slide-number {
          font-size: 12px;
          color: var(--color-text-2);
          min-width: 24px;
        }

        .slide-title {
          font-size: 13px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </BasePanel>
  )
} 