import React, { useState } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { IconButton, TextField, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import { CCWebBrowserShape } from './CCWebBrowserUtil'

interface WebBrowserComponentProps {
  shape: CCWebBrowserShape
}

export const WebBrowserComponent: React.FC<WebBrowserComponentProps> = ({ shape }) => {
  const editor = useEditor()
  const [urlInput, setUrlInput] = useState(shape.props.url)
  const [error, setError] = useState<string | null>(null)

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const newUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`
    
    editor.updateShape({
      id: shape.id,
      type: 'cc-web-browser',
      props: {
        ...shape.props,
        url: newUrl,
        history: [...shape.props.history.slice(0, shape.props.currentHistoryIndex + 1), newUrl],
        currentHistoryIndex: shape.props.currentHistoryIndex + 1,
        isLoading: true,
      },
    })
  }

  const handleBack = () => {
    if (shape.props.currentHistoryIndex > 0) {
      setError(null)
      const newIndex = shape.props.currentHistoryIndex - 1
      editor.updateShape({
        id: shape.id,
        type: 'cc-web-browser',
        props: {
          ...shape.props,
          url: shape.props.history[newIndex],
          currentHistoryIndex: newIndex,
          isLoading: true,
        },
      })
    }
  }

  const handleForward = () => {
    if (shape.props.currentHistoryIndex < shape.props.history.length - 1) {
      setError(null)
      const newIndex = shape.props.currentHistoryIndex + 1
      editor.updateShape({
        id: shape.id,
        type: 'cc-web-browser',
        props: {
          ...shape.props,
          url: shape.props.history[newIndex],
          currentHistoryIndex: newIndex,
          isLoading: true,
        },
      })
    }
  }

  const handleRefresh = () => {
    setError(null)
    editor.updateShape({
      id: shape.id,
      type: 'cc-web-browser',
      props: {
        ...shape.props,
        isLoading: true,
      },
    })
  }

  const handleIframeLoad = () => {
    editor.updateShape({
      id: shape.id,
      type: 'cc-web-browser',
      props: {
        ...shape.props,
        isLoading: false,
      },
    })
  }

  const handleIframeError = () => {
    setError('Failed to load the webpage. This might be due to security restrictions or the website not allowing embedding.')
    editor.updateShape({
      id: shape.id,
      type: 'cc-web-browser',
      props: {
        ...shape.props,
        isLoading: false,
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '8px',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <IconButton 
          size="small"
          onClick={handleBack}
          disabled={shape.props.currentHistoryIndex <= 0}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton 
          size="small"
          onClick={handleForward}
          disabled={shape.props.currentHistoryIndex >= shape.props.history.length - 1}
        >
          <ArrowForwardIcon />
        </IconButton>
        <IconButton 
          size="small"
          onClick={handleRefresh}
        >
          <RefreshIcon />
        </IconButton>
        <form onSubmit={handleUrlSubmit} style={{ flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter URL or search..."
            error={!!error}
            helperText={error}
          />
        </form>
      </div>
      <div style={{ 
        position: 'relative',
        flex: 1,
        backgroundColor: '#fff'
      }}>
        {shape.props.isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}>
            <CircularProgress />
          </div>
        )}
        {shape.props.url && (
          <iframe
            src={shape.props.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Web Browser"
          />
        )}
        {error && !shape.props.isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#d32f2f',
            padding: '16px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 