import React, { useState, useEffect } from 'react';
import { useEditor, useValue, TLUiMenuItemProps, TLShapeId, TldrawUiButton, TldrawUiDropdownMenuRoot, TldrawUiDropdownMenuTrigger, TldrawUiDropdownMenuContent, TldrawUiDropdownMenuItem, TldrawUiDropdownMenuGroup, stopEventPropagation } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';
import { moveToSlide, useCurrentSlide, useSlideShows, useCurrentSlideShow, arrangeSlides, createSlideShowFromTemplate } from '../../../slides/useSlides';
import { useTLDraw } from '../../../../../contexts/TLDrawContext';
import { SlideShowShape, SlideShape } from '../../../slides/SlideShapeUtil';
import { logger } from '../../../../../debugConfig';
import { BUTTON_STYLES } from './panel-styles';
import '../../../slides/slides.css';

interface CCSlidesProps {
  onPanelTypeChange: (type: string) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const SLIDESHOW_PATTERNS = [
  { id: 'horizontal', label: 'Horizontal Slideshow' },
  { id: 'vertical', label: 'Vertical Slideshow' },
  { id: 'grid', label: 'Grid Slideshow' },
  { id: 'radial', label: 'Radial Slideshow' },
] as const;

export const CCSlidesPanel: React.FC<CCSlidesProps> = ({ 
  onPanelTypeChange,
  isExpanded,
  onExpandedChange
}) => {
  const { presentationMode, togglePresentationMode } = useTLDraw();
  const editor = useEditor();
  const slideshows = useSlideShows();
  const currentSlide = useCurrentSlide();
  const currentSlideShow = useCurrentSlideShow();
  const selectedShapes = useValue('selected shapes', () => editor.getSelectedShapes(), [editor]);
  
  // Track expanded state for each slideshow
  const [expandedSlideshows, setExpandedSlideshows] = useState<Set<string>>(new Set());

  const toggleSlideshow = (slideshowId: string) => {
    setExpandedSlideshows(prev => {
      const next = new Set(prev);
      if (next.has(slideshowId)) {
        next.delete(slideshowId);
      } else {
        // Clear other expanded slideshows
        next.clear();
        next.add(slideshowId);
      }
      return next;
    });
  };

  // When current slideshow changes, ensure it's expanded
  useEffect(() => {
    if (currentSlideShow) {
      setExpandedSlideshows(new Set([currentSlideShow.id]));
    }
  }, [currentSlideShow]);

  const handleCreateSlideShowFromTemplate = (
    pattern: SlideShowShape['props']['slidePattern']
  ) => {
    console.log('Handling create slideshow...');
    const newShapeId = createSlideShowFromTemplate(editor, pattern, {
      slideCount: undefined,
      slideWidth: undefined,
      slideHeight: undefined,
    });
    if (newShapeId) {
      console.log('New SlideShowShape ID:', newShapeId);
      editor.select(newShapeId);
      editor.setCurrentTool('select');
    }
  };

  const handleArrangeSlides = (slideshow: SlideShowShape, pattern: SlideShowShape['props']['slidePattern']) => {
    console.log('Arranging slides with pattern:', pattern, ". Updating shape");
    editor.updateShape<SlideShowShape>({
      id: slideshow.id,
      type: 'frame',
      props: {
        ...slideshow.props,
        slidePattern: pattern,
      },
    });
    console.log('Arranging slides with pattern:', pattern, ". Arranging slides");
    arrangeSlides(editor, slideshow);
  };

  const handleToggle = () => {
    logger.info('slides-panel', '🔄 Toggling presentation mode');
    togglePresentationMode();
  };

  const handleToolSelect = (toolId: string) => {
    console.log('Setting current tool to:', toolId);
    editor.setCurrentTool(toolId);
  };

  const arrangePatterns: Array<TLUiMenuItemProps & { label: string }> = [
    {
      id: 'horizontal',
      label: 'Horizontal',
      onSelect: () => {
        console.log('Arranging slides with pattern:', 'horizontal');
        if (currentSlideShow) {
          handleArrangeSlides(currentSlideShow, 'horizontal');
        }
        return Promise.resolve();
      },
    },
    {
      id: 'vertical',
      label: 'Vertical',
      onSelect: () => {
        console.log('Arranging slides with pattern:', 'vertical');
        if (currentSlideShow) {
          handleArrangeSlides(currentSlideShow, 'vertical');
        }
        return Promise.resolve();
      },
    },
    {
      id: 'grid',
      label: 'Grid',
      onSelect: () => {
        console.log('Arranging slides with pattern:', 'grid');
        if (currentSlideShow) {
          handleArrangeSlides(currentSlideShow, 'grid');
        }
        return Promise.resolve();
      },
    },
    {
      id: 'radial',
      label: 'Radial',
      onSelect: () => {
        console.log('Arranging slides with pattern:', 'radial');
        if (currentSlideShow) {
          handleArrangeSlides(currentSlideShow, 'radial');
        }
        return Promise.resolve();
      },
    },
  ];

  const slidesContent = (
    <div className="slides-panel scroll-light" onPointerDown={stopEventPropagation}>
      <div className="slides-panel-tools">
        <div className="slides-panel-tools-group">
          <TldrawUiButton 
            type="normal"
            className="slides-panel-button presentation-button"
            data-active={presentationMode}
            data-testid="toggle-presentation"
            onClick={handleToggle}
          >
            {presentationMode ? 'Exit Presentation' : 'Present'}
          </TldrawUiButton>
        </div>

        {!presentationMode && (
          <div className="slides-panel-tools-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SLIDESHOW_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handleCreateSlideShowFromTemplate(pattern.id as SlideShowShape['props']['slidePattern'])}
                style={BUTTON_STYLES.SHAPE_BUTTON}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
                }}
                onMouseOut={(e) => {
                  Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
                }}
              >
                {pattern.label}
              </button>
            ))}
          </div>
        )}

        {currentSlideShow && (
          <div className="slides-panel-tools-group">
            <TldrawUiDropdownMenuRoot id="arrange-slides-menu">
              <TldrawUiDropdownMenuTrigger>
                <TldrawUiButton
                  type="normal"
                  className="slides-panel-button menu-button"
                  data-testid="arrange-slides"
                >
                  Arrange
                </TldrawUiButton>
              </TldrawUiDropdownMenuTrigger>
              <TldrawUiDropdownMenuContent side="bottom" align="start">
                <TldrawUiDropdownMenuGroup>
                  {arrangePatterns.map((pattern) => (
                    <TldrawUiDropdownMenuItem key={pattern.id}>
                      <div onClick={() => pattern.onSelect('menu')}>
                        {pattern.label}
                      </div>
                    </TldrawUiDropdownMenuItem>
                  ))}
                </TldrawUiDropdownMenuGroup>
              </TldrawUiDropdownMenuContent>
            </TldrawUiDropdownMenuRoot>
          </div>
        )}
      </div>

      {/* Show slideshows only when not in presentation mode */}
      {!presentationMode && (
        <div className="slideshows-list">
          {slideshows.map((slideshow) => {
            const isCurrentSlideshow = currentSlideShow?.id === slideshow.id;
            const isExpanded = expandedSlideshows.has(slideshow.id);
            const shouldShowSlides = isExpanded || isCurrentSlideshow;

            return (
              <div 
                key={slideshow.id} 
                className={`slideshow-container ${isCurrentSlideshow ? 'current' : ''}`}
              >
                <div className="slideshow-header">
                  <TldrawUiButton
                    type="normal"
                    className="slideshow-header-button"
                    data-active={isCurrentSlideshow}
                    data-selected={selectedShapes.includes(slideshow)}
                    onClick={() => {
                      logger.info('system', '🖱️ Slideshow button clicked', {
                        slideshowId: slideshow.id,
                        currentSlideIndex: slideshow.props.currentSlideIndex
                      });
                      handleToolSelect('select');
                      editor.setSelectedShapes([slideshow.id]);
                      
                      // Also move to current slide if one exists
                      const currentSlide = editor.getShape(
                        slideshow.props.slides[slideshow.props.currentSlideIndex]
                      ) as SlideShape;
                      if (currentSlide) {
                        moveToSlide(editor, currentSlide);
                      }
                    }}
                  >
                    {`Show:${slideshow.id.slice(-8)}`}
                  </TldrawUiButton>
                  <TldrawUiButton
                    type="icon"
                    className="slideshow-collapse-button"
                    onClick={() => toggleSlideshow(slideshow.id)}
                  >
                    {isExpanded ? '⌄' : '›'}
                  </TldrawUiButton>
                </div>
                
                {shouldShowSlides && (
                  <div className="slideshow-slides">
                    {slideshow.props.slides.map((slideId) => {
                      const shapeId = slideId as TLShapeId;
                      const maybeShape = editor.getShape(shapeId);
                      if (!maybeShape || maybeShape.type !== 'slide') return null;
                      
                      const slide = maybeShape as SlideShape;
                      const isSelected = selectedShapes.includes(slide);
                      
                      return (
                        <TldrawUiButton
                          key={slideId}
                          type="normal"
                          className="slides-panel-button slide-button"
                          data-active={currentSlide?.id === slide.id}
                          data-selected={isSelected}
                          onClick={() => {
                            logger.info('system', '🖱️ Slide button clicked', {
                              slideId: slide.id,
                              parentSlideshow: slideshow.id
                            });
                            handleToolSelect('select');
                            moveToSlide(editor, slide, true);
                          }}
                        >
                          {`Slide:${slide.id.slice(-8)}`}
                        </TldrawUiButton>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <BasePanel
      panelTypes={[
        { id: 'cc-shapes', label: 'CC Shapes' },
        { id: 'slides', label: 'Slides' }
      ]}
      currentPanelType="slides"
      onPanelTypeChange={onPanelTypeChange}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
    >
      {slidesContent}
    </BasePanel>
  );
}; 