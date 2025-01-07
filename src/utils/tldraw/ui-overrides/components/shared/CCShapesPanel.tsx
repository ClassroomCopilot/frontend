import React, { useEffect } from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { BasePanel } from './BasePanel';
import { CCSlidesPanel } from './CCSlidesPanel';
import { BUTTON_STYLES } from './panel-styles';
import { CC_SLIDESHOW_STYLE_CONSTANTS } from '../../../cc-base/cc-styles';

const PANEL_TYPES = [
  { id: 'cc-shapes', label: 'Shapes' },
  { id: 'slides', label: 'Slides' },
];

const SHAPE_CONFIGS = {
  'cc-calendar': {
    width: 400,
    height: 600,
    xOffset: 200,
    yOffset: 300,
    defaultProps: {
      title: 'Calendar',
      headerColor: '#3e6589',
      isLocked: false,
      date: new Date().toISOString(),
      events: [],
      view: 'timeGridWeek',
    }
  },
  'cc-settings': {
    width: 400,
    height: 500,
    xOffset: 200,
    yOffset: 250,
    defaultProps: {
      title: 'User Settings',
      headerColor: '#3e6589',
      isLocked: false,
    }
  },
  'cc-live-transcription': {
    width: 300,
    height: 400,
    xOffset: 200,
    yOffset: 150,
    defaultProps: {
      title: 'Live Transcription',
      headerColor: '#3e6589',
      isLocked: false,
      isRecording: false,
      text: '',
      isConfirmed: false,
    }
  },
  'cc-slideshow': {
    width: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH * 3 + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 4,
    height: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2,
    xOffset: 400,
    yOffset: 300,
    defaultProps: {
      title: 'Slideshow',
      headerColor: '#3e6589',
      isLocked: false,
      slides: [],
      currentSlideIndex: 0,
      slidePattern: 'horizontal',
    }
  }
} as const;

export const CCShapesPanel: React.FC = () => {
  const editor = useEditor();
  const [currentPanelType, setCurrentPanelType] = React.useState('cc-shapes');
  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleOutsideInteraction = (e: PointerEvent) => {
      if (!isExpanded) {
        return;
      }

      const target = e.target as HTMLElement;
      const isOutsidePanel = !target.closest('.base-panel') && !target.closest('.panel-handle');

      if (isOutsidePanel) {
        e.preventDefault();
        e.stopPropagation();
        requestAnimationFrame(() => {
          setIsExpanded(false);
        });
      }
    };

    const container = editor.getContainer();
    container.addEventListener('pointerdown', handleOutsideInteraction, { capture: true });
    
    return () => {
      container.removeEventListener('pointerdown', handleOutsideInteraction, { capture: true });
    };
  }, [editor, isExpanded]);

  const handleCreateShape = (shapeType: keyof typeof SHAPE_CONFIGS, slidePattern?: string) => {
    if (!editor) {
      return;
    }

    const { x, y } = editor.getViewportScreenCenter();
    const config = SHAPE_CONFIGS[shapeType];
    const shapeId = createShapeId();
    
    const baseProps = {
      id: shapeId,
      type: shapeType,
      x: x - config.xOffset,
      y: y - config.yOffset,
      rotation: 0,
      isLocked: false,
    };

    // Pre-define variables for slideshow case
    const slideWidth = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_WIDTH;
    const slideHeight = CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT;
    const spacing = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING;
    const numSlides = 3; // Default number of slides to create

    // Pre-calculate variables for slide positioning
    const cols = Math.ceil(Math.sqrt(numSlides));
    const radius = Math.min(config.width || 0, config.height || 0) / 3;

    switch (shapeType) {
      case 'cc-calendar':
        editor.createShape({
          ...baseProps,
          props: {
            ...config.defaultProps,
            w: config.width,
            h: config.height,
          },
        });
        break;
        case 'cc-live-transcription':
          editor.createShape({
            ...baseProps,
            props: {
              title: 'Live Transcription',
              w: config.width,
              h: config.height,
              headerColor: '#3e6589',
              isLocked: false,
              isRecording: false,
              segments: [],
              currentSegment: undefined,
              lastProcessedSegment: '',
            },
          });
          break;
      case 'cc-settings':
        editor.createShape({
          ...baseProps,
          props: {
            ...config.defaultProps,
            w: config.width,
            h: config.height,
          },
        });
        break;
      case 'cc-slideshow':
        // Create slideshow shape
        editor.batch(() => {
          // Create slides first
          const slideIds = [];
          for (let i = 0; i < numSlides; i++) {
            const slideId = createShapeId();
            slideIds.push(slideId);
          }

          // Calculate slideshow dimensions based on pattern
          const headerHeight = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT;
          const contentPadding = CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING;
          let slideshowWidth = slideWidth * 3 + spacing * 4;  // Default horizontal
          let slideshowHeight = headerHeight + (slideHeight + spacing * 2) + contentPadding * 2;

          switch (slidePattern) {
            case 'vertical':
              slideshowWidth = slideWidth + spacing * 2;
              slideshowHeight = headerHeight + (slideHeight * 3 + spacing * 4) + contentPadding * 2;
              break;
            case 'grid': {
              const cols = Math.ceil(Math.sqrt(numSlides));
              const rows = Math.ceil(numSlides / cols);
              slideshowWidth = slideWidth * cols + spacing * (cols + 1);
              slideshowHeight = headerHeight + (slideHeight * rows + spacing * (rows + 1)) + contentPadding * 2;
              break;
            }
            // Add other patterns as needed
          }

          // Create the slideshow with calculated dimensions
          editor.createShape({
            ...baseProps,
            type: 'cc-slideshow',
            props: {
              ...config.defaultProps,
              w: slideshowWidth,
              h: slideshowHeight,
              slidePattern: slidePattern || 'horizontal',
              slides: slideIds,
              currentSlideIndex: 0,
            },
          });

          // Create slides and bind them to the slideshow
          for (let i = 0; i < numSlides; i++) {
            // Calculate position based on pattern, accounting for header
            let slideX = spacing;
            let slideY = headerHeight + contentPadding + spacing;
            const angle = (2 * Math.PI * i) / numSlides;
            const contentHeight = slideshowHeight - headerHeight - contentPadding * 2;

            switch (slidePattern) {
              case 'horizontal':
                slideX = spacing + i * (slideWidth + spacing);
                break;
              case 'vertical':
                slideX = (slideshowWidth - slideWidth) / 2;
                slideY = headerHeight + contentPadding + spacing + i * (slideHeight + spacing);
                break;
              case 'grid':
                slideX = spacing + (i % cols) * (slideWidth + spacing);
                slideY = headerHeight + contentPadding + spacing + Math.floor(i / cols) * (slideHeight + spacing);
                break;
              case 'radial':
                slideX = slideshowWidth / 2 + radius * Math.cos(angle) - slideWidth / 2;
                slideY = headerHeight + contentPadding + contentHeight / 2 + radius * Math.sin(angle) - slideHeight / 2;
                break;
            }

            // Create slide with positions relative to parent
            editor.createShape({
              id: slideIds[i],
              type: 'cc-slide',
              x: slideX,
              y: slideY,
              parentId: baseProps.id,
              props: {
                title: `Slide ${i + 1}`,
                w: slideWidth,
                h: slideHeight,
                headerColor: CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_COLORS.secondary,
                isLocked: false,
              },
            });

            // Create binding for slide constraints
            editor.createBinding({
              type: 'cc-slide-layout',
              fromId: baseProps.id,
              toId: slideIds[i],
              props: {
                placeholder: false
              },
            });
          }
        });
        break;
      default:
        break;
    }
  };

  // If current panel type is slides, render the CCSlidesPanel
  if (currentPanelType === 'slides') {
    return (
      <CCSlidesPanel 
        onPanelTypeChange={setCurrentPanelType} 
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
    );
  }

  // Otherwise render the CC Shapes panel
  return (
    <BasePanel
      panelTypes={PANEL_TYPES}
      currentPanelType={currentPanelType}
      onPanelTypeChange={setCurrentPanelType}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={() => handleCreateShape('cc-calendar')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Calendar Shape
        </button>
        <button 
          onClick={() => handleCreateShape('cc-settings')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Settings Shape
        </button>
        <button 
          onClick={() => handleCreateShape('cc-live-transcription')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Live Transcription
        </button>

        <div style={{ borderTop: '1px solid var(--color-divider)', margin: '8px 0' }} />
        
        <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '4px' }}>
          Slideshow Patterns
        </div>
        
        <button 
          onClick={() => handleCreateShape('cc-slideshow', 'horizontal')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Horizontal Slideshow
        </button>
        <button 
          onClick={() => handleCreateShape('cc-slideshow', 'vertical')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Vertical Slideshow
        </button>
        <button 
          onClick={() => handleCreateShape('cc-slideshow', 'grid')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Grid Slideshow
        </button>
        <button 
          onClick={() => handleCreateShape('cc-slideshow', 'radial')}
          style={BUTTON_STYLES.SHAPE_BUTTON}
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON_HOVER);
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, BUTTON_STYLES.SHAPE_BUTTON);
          }}
        >
          Radial Slideshow
        </button>
      </div>
    </BasePanel>
  );
};