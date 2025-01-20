import { Editor, TLShapeId, createShapeId, createBindingId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'
import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { CCSlideShowShape } from '../cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShape } from '../cc-slideshow/CCSlideShapeUtil'
import axios from '../../../../axiosConfig'
import { logger } from '../../../../debugConfig'

export const createSlideshow = (
  editor: Editor,
  baseProps: {
    id: TLShapeId
    x: number
    y: number
    rotation: number
    isLocked: boolean
  },
  slidePattern = 'horizontal',
  numSlides = 3
) => {
  const config = CC_SHAPE_CONFIGS['cc-slideshow']
  
  // Create slideshow shape
  editor.createShape<CCSlideShowShape>({
    ...baseProps,
    type: 'cc-slideshow',
    props: {
      ...config.defaultProps,
      w: config.width,
      h: config.height,
      slidePattern,
      currentSlideIndex: 0,
    },
  })

  // Create slides
  for (let i = 0; i < numSlides; i++) {
    const slideId = createShapeId()
    editor.createShape<CCSlideShape>({
      id: slideId,
      type: 'cc-slide',
      x: baseProps.x + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING,
      y: baseProps.y + CC_BASE_STYLE_CONSTANTS.HEADER.height + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2,
      rotation: 0,
      isLocked: false,
      props: {
        ...CC_SHAPE_CONFIGS['cc-slide'].defaultProps,
        w: CC_SHAPE_CONFIGS['cc-slide'].width,
        h: CC_SHAPE_CONFIGS['cc-slide'].height,
        title: `Slide ${i + 1}`,
      },
    })

    // Create binding between slideshow and slide
    editor.createBinding({
      id: createBindingId(),
      type: 'cc-slide-layout',
      fromId: baseProps.id,
      toId: slideId,
      props: {
        index: `a${String(i + 1).padStart(3, '0')}`,
        isMovingWithParent: true,
        placeholder: false,
      },
    })
  }
}

export const createPowerPointSlideshow = async (
  editor: Editor,
  file: File,
  x: number,
  y: number
) => {
  try {
    // Create form data for file upload
    const formData = new FormData()
    // FastAPI expects the file parameter to be named 'file'
    formData.append('file', file, file.name)
    
    logger.debug('slideshow-helpers', 'Uploading PowerPoint file.', {
      name: file.name,
      size: file.size,
    })

    // Send file to backend for processing
    const response = await axios.post('/api/assets/powerpoint/convert', formData)

    logger.debug('slideshow-helpers', 'Response status.', {
      status: response.status,
    })

    if (response.status !== 200) {
      if (response.status === 404) {
        throw new Error('PowerPoint conversion endpoint not found. Please check if the backend service is running.')
      }
      const errorText = response.data.message
      logger.error('slideshow-helpers', 'Server error response.', {
        status: response.status,
        text: errorText,
      })
      throw new Error(`Server error: ${errorText || response.statusText}`)
    }

    const data = response.data
    logger.debug('slideshow-helpers', 'Response data.', {
      data,
    })

    if (data.status !== 'success') {
      logger.error('slideshow-helpers', 'PowerPoint processing error.', {
        message: data.message || 'Unknown error',
      })
      throw new Error(data.message || 'Failed to process PowerPoint')
    }

    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      logger.error('slideshow-helpers', 'No slides found in PowerPoint file.')
      throw new Error('No slides found in PowerPoint file')
    }

    // Create slideshow with the number of slides from PowerPoint
    const slideshowId = createShapeId()
    const baseProps = {
      id: slideshowId,
      x,
      y,
      rotation: 0,
      isLocked: false,
    }

    // Create slideshow with the slides from PowerPoint
    editor.batch(() => {
      const config = CC_SHAPE_CONFIGS['cc-slideshow']
      
      // Create slideshow shape
      editor.createShape<CCSlideShowShape>({
        ...baseProps,
        type: 'cc-slideshow',
        props: {
          ...config.defaultProps,
          w: config.width,
          h: CC_SLIDESHOW_STYLE_CONSTANTS.DEFAULT_SLIDE_HEIGHT + 
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT +  // Slideshow's own header
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 +    // Top and bottom spacing
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING, // Extra padding for content
          slidePattern: 'horizontal',
          title: file.name.replace('.pptx', ''),
          currentSlideIndex: 0,
        },
      })

      // Create slides with images
      data.slides.forEach((slide: { index: number, data: string }, i: number) => {
        const slideId = createShapeId()
        editor.createShape<CCSlideShape>({
          id: slideId,
          type: 'cc-slide',
          x: x + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING,
          y: y + CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT + 
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING,
          rotation: 0,
          isLocked: false,
          props: {
            ...CC_SHAPE_CONFIGS['cc-slide'].defaultProps,
            w: CC_SHAPE_CONFIGS['cc-slide'].width,
            h: CC_SHAPE_CONFIGS['cc-slide'].height,
            title: `Slide ${i + 1}`,
            imageData: slide.data,
          },
        })

        // Create binding between slideshow and slide
        editor.createBinding({
          id: createBindingId(),
          type: 'cc-slide-layout',
          fromId: slideshowId,
          toId: slideId,
          props: {
            index: `a${String(i + 1).padStart(3, '0')}`,
            isMovingWithParent: true,
            placeholder: false,
          },
        })
      })
    })

    return true
  } catch (error) {
    logger.error('slideshow-helpers', 'Error creating PowerPoint slideshow.', {
      error,
    })
    return false
  }
} 