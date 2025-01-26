import { Editor, TLShapeId, createShapeId, createBindingId } from '@tldraw/tldraw'
import { CC_SHAPE_CONFIGS } from '../cc-configs'
import { CC_BASE_STYLE_CONSTANTS, CC_SLIDESHOW_STYLE_CONSTANTS } from '../cc-styles'
import { CCSlideShowShape } from '../cc-slideshow/CCSlideShowShapeUtil'
import { CCSlideShape } from '../cc-slideshow/CCSlideShapeUtil'
import axios, { isAxiosError } from '../../../../axiosConfig'
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
        index: `a${i + 1}`,
        isMovingWithParent: true,
        placeholder: false,
      },
    })
  }
}

export const createSlideshowAtCenter = (
  editor: Editor,
  slidePattern = 'horizontal',
  numSlides = 3
) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();
  const config = CC_SHAPE_CONFIGS['cc-slideshow'];
  const shapeId = createShapeId();

  editor.run(() => {
    createSlideshow(editor, {
      id: shapeId,
      x: x - config.xOffset,
      y: y - config.yOffset,
      rotation: 0,
      isLocked: false,
    }, slidePattern, numSlides);
  });
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
    formData.append('file', file, file.name)
    
    logger.debug('slideshow-helpers', 'Uploading PowerPoint file.', {
      name: file.name,
      size: file.size,
    })

    const response = await axios.post('/api/assets/powerpoint/convert', formData)

    logger.debug('slideshow-helpers', 'Response received.', {
      status: response.status,
      data: response.data,
    })

    const { data } = response
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server')
    }

    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to process PowerPoint')
    }

    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('No slides found in PowerPoint file')
    }

    // Create slideshow with the slides from PowerPoint
    const slideshowId = createShapeId()
    const baseProps = {
      id: slideshowId,
      x,
      y,
      rotation: 0,
      isLocked: false,
    }

    // Create slideshow in a batch operation
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
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING,
          slidePattern: 'horizontal',
          title: file.name.replace('.pptx', ''),
          currentSlideIndex: 0,
        },
      })

      // Create slides with images and meta text
      data.slides.forEach((slide: { 
        index: number, 
        data: string,
        meta?: {
          text: string,
          format: string
        }
      }, i: number) => {
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
            meta: slide.meta || { text: '', format: 'markdown' }
          },
        })

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
    if (isAxiosError(error)) {
      if (!error.response) {
        logger.error('slideshow-helpers', 'Network error - Failed to reach the server', { error })
        throw new Error('Network error - Failed to reach the server. Please check your connection.')
      }
      
      const {status} = error.response
      const errorMessage = error.response.data?.message || error.message
      
      if (status === 404) {
        logger.error('slideshow-helpers', 'PowerPoint conversion endpoint not found', { error })
        throw new Error('PowerPoint conversion service is not available. Please check if the backend service is running.')
      }
      
      if (status === 413) {
        logger.error('slideshow-helpers', 'File too large', { error })
        throw new Error('The PowerPoint file is too large to process.')
      }
      
      logger.error('slideshow-helpers', `Server error (${status})`, { error: errorMessage })
      throw new Error(`Server error (${status}): ${errorMessage}`)
    }
    
    // Handle non-Axios errors
    logger.error('slideshow-helpers', 'Unexpected error creating PowerPoint slideshow', { error })
    throw new Error('An unexpected error occurred while processing the PowerPoint file.')
  }
}

export const createWordSlideshow = async (
  editor: Editor,
  file: File,
  x: number,
  y: number
) => {
  try {
    // Create form data for file upload
    const formData = new FormData()
    formData.append('file', file, file.name)
    
    logger.debug('slideshow-helpers', 'Uploading Word file.', {
      name: file.name,
      size: file.size,
    })

    const response = await axios.post('/api/assets/word/convert', formData)

    logger.debug('slideshow-helpers', 'Response received.', {
      status: response.status,
      data: response.data,
    })

    const { data } = response
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server')
    }

    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to process Word document')
    }

    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('No pages found in Word document')
    }

    // Create slideshow with the pages from Word
    const slideshowId = createShapeId()
    const baseProps = {
      id: slideshowId,
      x,
      y,
      rotation: 0,
      isLocked: false,
    }

    // Create slideshow in a batch operation
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
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING,
          slidePattern: 'horizontal',
          title: file.name.replace('.docx', ''),
          currentSlideIndex: 0,
        },
      })

      // Create slides with images and meta text
      data.slides.forEach((slide: { 
        index: number, 
        data: string, 
        dimensions?: { width: number, height: number },
        meta?: {
          text: string,
          format: string
        }
      }, i: number) => {
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
            w: slide.dimensions?.width ?? CC_SHAPE_CONFIGS['cc-slide'].width,
            h: slide.dimensions?.height ?? CC_SHAPE_CONFIGS['cc-slide'].height,
            title: `Page ${i + 1}`,
            imageData: slide.data,
            meta: slide.meta || { text: '', format: 'markdown' }
          },
        })

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
    if (isAxiosError(error)) {
      if (!error.response) {
        logger.error('slideshow-helpers', 'Network error - Failed to reach the server', { error })
        throw new Error('Network error - Failed to reach the server. Please check your connection.')
      }
      
      const {status} = error.response
      const errorMessage = error.response.data?.message || error.message
      
      if (status === 404) {
        logger.error('slideshow-helpers', 'Word conversion endpoint not found', { error })
        throw new Error('Word conversion service is not available. Please check if the backend service is running.')
      }
      
      if (status === 413) {
        logger.error('slideshow-helpers', 'File too large', { error })
        throw new Error('The Word file is too large to process.')
      }
      
      logger.error('slideshow-helpers', `Server error (${status})`, { error: errorMessage })
      throw new Error(`Server error (${status}): ${errorMessage}`)
    }
    
    // Handle non-Axios errors
    logger.error('slideshow-helpers', 'Unexpected error creating Word slideshow', { error })
    throw new Error('An unexpected error occurred while processing the Word file.')
  }
}

export const createPDFSlideshow = async (
  editor: Editor,
  file: File,
  x: number,
  y: number
) => {
  try {
    // Create form data for file upload
    const formData = new FormData()
    formData.append('file', file, file.name)
    
    logger.debug('slideshow-helpers', 'Uploading PDF file.', {
      name: file.name,
      size: file.size,
    })

    const response = await axios.post('/api/assets/pdf/convert', formData)

    logger.debug('slideshow-helpers', 'Response received.', {
      status: response.status,
      data: response.data,
    })

    const { data } = response
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server')
    }

    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to process PDF document')
    }

    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('No pages found in PDF document')
    }

    // Create slideshow with the pages from PDF
    const slideshowId = createShapeId()
    const baseProps = {
      id: slideshowId,
      x,
      y,
      rotation: 0,
      isLocked: false,
    }

    // Create slideshow in a batch operation
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
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_HEADER_HEIGHT +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_SPACING * 2 +
             CC_SLIDESHOW_STYLE_CONSTANTS.SLIDE_CONTENT_PADDING,
          slidePattern: 'horizontal',
          title: file.name.replace('.pdf', ''),
          currentSlideIndex: 0,
        },
      })

      // Create slides with images and meta text
      data.slides.forEach((slide: { 
        index: number, 
        data: string, 
        dimensions?: { width: number, height: number },
        meta?: {
          text: string,
          format: string
        }
      }, i: number) => {
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
            w: slide.dimensions?.width ?? CC_SHAPE_CONFIGS['cc-slide'].width,
            h: slide.dimensions?.height ?? CC_SHAPE_CONFIGS['cc-slide'].height,
            title: `Page ${i + 1}`,
            imageData: slide.data,
            meta: slide.meta || { text: '', format: 'markdown' }
          },
        })

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
    if (isAxiosError(error)) {
      if (!error.response) {
        logger.error('slideshow-helpers', 'Network error - Failed to reach the server', { error })
        throw new Error('Network error - Failed to reach the server. Please check your connection.')
      }
      
      const {status} = error.response
      const errorMessage = error.response.data?.message || error.message
      
      if (status === 404) {
        logger.error('slideshow-helpers', 'PDF conversion endpoint not found', { error })
        throw new Error('PDF conversion service is not available. Please check if the backend service is running.')
      }
      
      if (status === 413) {
        logger.error('slideshow-helpers', 'File too large', { error })
        throw new Error('The PDF file is too large to process.')
      }
      
      logger.error('slideshow-helpers', `Server error (${status})`, { error: errorMessage })
      throw new Error(`Server error (${status}): ${errorMessage}`)
    }
    
    // Handle non-Axios errors
    logger.error('slideshow-helpers', 'Unexpected error creating PDF slideshow', { error })
    throw new Error('An unexpected error occurred while processing the PDF file.')
  }
}

export const handleSlideshowFileUpload = async (
  editor: Editor,
  file: File,
  onComplete?: () => void
) => {
  if (!editor) return;

  const { x, y } = editor.getViewportScreenCenter();

  try {
    if (file.name.endsWith('.pptx')) {
      await createPowerPointSlideshow(editor, file, x, y);
    } else if (file.name.endsWith('.docx')) {
      await createWordSlideshow(editor, file, x, y);
    } else if (file.name.endsWith('.pdf')) {
      await createPDFSlideshow(editor, file, x, y);
    } else {
      throw new Error('Please select a PowerPoint (.pptx), Word (.docx), or PDF (.pdf) file');
    }

    onComplete?.();
  } catch (error) {
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }
}; 