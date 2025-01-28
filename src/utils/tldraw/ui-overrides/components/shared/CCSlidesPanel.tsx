import React from 'react'
import { useEditor, TldrawUiButton } from '@tldraw/tldraw'
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
import { CCSlideLayoutBinding } from '../../../cc-base/cc-slideshow/CCSlideLayoutBindingUtil'
import './panel.css'

export const CCSlidesPanel: React.FC = () => {
  const editor = useEditor()
  const slideshows = useSlideShows()
  const currentSlide = useCurrentSlide()
  const { presentationMode, togglePresentationMode, presentationService } = useTLDraw()

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

  const handleZoomToSlideshow = (slideshow: CCSlideShowShape) => {
    if (presentationMode && presentationService) {
      presentationService.zoomToShape(slideshow)
    }
  }

  const renderSlideshow = (slideshow: CCSlideShowShape) => {
    const bindings = editor
      .getBindingsFromShape<CCSlideLayoutBinding>(slideshow, 'cc-slide-layout')
      .filter(b => !b.props.placeholder)
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1))
    
    return (
      <div key={slideshow.id} className="slideshow-container">
        <div className="slideshow-header">
          <div className="slideshow-title">
            <h3>{slideshow.props.title || 'Untitled Slideshow'}</h3>
            <span className="slide-count">
              {bindings.length} slides
            </span>
          </div>
          {presentationMode && (
            <TldrawUiButton
              type="icon"
              className="zoom-button"
              data-testid="zoom-to-slideshow"
              onClick={() => handleZoomToSlideshow(slideshow)}
              title="Zoom to slideshow"
            >
              🔍
            </TldrawUiButton>
          )}
        </div>
        <div className="slides-list">
          {bindings.map((binding, index) => {
            const slide = editor.getShape(binding.toId) as CCSlideShape
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
    <div className="panel-container">
      <div className="slides-panel-tools">
        <TldrawUiButton 
          type="normal"
          className="shape-button"
          data-active={presentationMode}
          data-testid="toggle-presentation"
          onClick={handleTogglePresentation}
        >
          {presentationMode ? 'Exit Presentation' : 'Present'}
        </TldrawUiButton>
      </div>

      {slideshows.length === 0 ? (
        <div className="panel-empty-state">
          <p>No slideshows yet</p>
          <p>Create a slideshow to get started</p>
        </div>
      ) : (
        slideshows.map(renderSlideshow)
      )}
    </div>
  )
} 