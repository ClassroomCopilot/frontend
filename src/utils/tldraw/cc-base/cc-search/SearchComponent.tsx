import React, { useState, useCallback } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { 
  TextField, 
  IconButton, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Tooltip,
  IconButton as MuiIconButton
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewStreamIcon from '@mui/icons-material/ViewStream'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { CCSearchShape } from './CCSearchShapeUtil'
import { SearchService, SearchResult } from '../../../../services/tldraw/searchService'
import { logger } from '../../../../debugConfig'
import { createWebBrowserShape, createMultipleWebBrowsers } from '../shape-helpers/web-browser-helpers'

interface SearchComponentProps {
  shape: CCSearchShape
}

type LayoutType = 'grid' | 'cascade' | 'horizontal' | 'vertical'

export const SearchComponent: React.FC<SearchComponentProps> = ({ shape }) => {
  const editor = useEditor()
  const [query, setQuery] = useState(shape.props.query || '')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([])
  const [layoutAnchorEl, setLayoutAnchorEl] = useState<null | HTMLElement>(null)
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid')

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    logger.debug('cc-search', '🔍 Starting search', { query })
    setIsSearching(true)
    try {
      const results = await SearchService.search(query)
      logger.debug('cc-search', '✅ Search completed', { 
        query, 
        resultCount: results.length 
      })
      
      // Update the shape's properties
      editor.updateShape({
        id: shape.id,
        type: 'cc-search',
        props: {
          ...shape.props,
          query,
          results,
          isSearching: false,
        },
      })
    } catch (error) {
      logger.error('cc-search', '❌ Search failed', { error })
      // Clear results on error
      editor.updateShape({
        id: shape.id,
        type: 'cc-search',
        props: {
          ...shape.props,
          query,
          results: [],
          isSearching: false,
        },
      })
    } finally {
      setIsSearching(false)
      setSelectedResults([])
    }
  }, [query, editor, shape])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleResultClick = useCallback((result: SearchResult) => {
    logger.debug('cc-search', '🖱️ Search result clicked', { 
      resultTitle: result.title,
      resultUrl: result.url 
    })

    try {
      logger.debug('cc-web-browser', '🌐 Creating web browser shape', {
        url: result.url,
        position: { x: shape.x + shape.props.w + 20, y: shape.y }
      })

      // Create a single browser shape for direct click
      createWebBrowserShape(editor, {
        url: result.url,
        title: result.title,
        x: shape.x + shape.props.w + 20,
        y: shape.y
      })

    } catch (error) {
      logger.error('cc-web-browser', '❌ Failed to create web browser shape', { error })
    }
  }, [editor, shape])

  const handleResultSelect = (result: SearchResult, event: React.MouseEvent) => {
    // If shift key is pressed, handle multi-select
    if (event.shiftKey) {
      setSelectedResults(prev => {
        const isSelected = prev.some(r => r.url === result.url)
        if (isSelected) {
          return prev.filter(r => r.url !== result.url)
        } else {
          return [...prev, result]
        }
      })
    }
  }

  const handleLayoutMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLayoutAnchorEl(event.currentTarget)
  }

  const handleLayoutMenuClose = () => {
    setLayoutAnchorEl(null)
  }

  const handleLayoutSelect = (layout: LayoutType) => {
    setCurrentLayout(layout)
    handleLayoutMenuClose()
  }

  const openSelectedResults = () => {
    if (selectedResults.length === 0) return

    logger.debug('cc-web-browser', '🌐 Creating web browser shapes', {
      count: selectedResults.length,
      layout: currentLayout
    })

    const browsers = selectedResults.map(result => ({
      url: result.url,
      title: result.title
    }))

    // Calculate starting position relative to the search shape
    const startX = shape.x + shape.props.w + 20
    const startY = shape.y

    createMultipleWebBrowsers(editor, {
      browsers,
      layout: currentLayout,
      startX,
      startY,
      spacing: 30
    })

    // Clear selection after opening
    setSelectedResults([])
  }

  const getLayoutIcon = (layout: LayoutType) => {
    switch (layout) {
      case 'grid':
        return <GridViewIcon />
      case 'horizontal':
        return <ViewStreamIcon />
      case 'vertical':
        return <ViewWeekIcon />
      case 'cascade':
        return <FilterNoneIcon />
    }
  }

  return (
    <div 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        pointerEvents: 'all',  // Ensure we get pointer events
        position: 'relative',  // Create a new stacking context
        zIndex: 1  // Ensure our content is above TLDraw's canvas
      }}
      onPointerDown={(e) => {
        // Prevent TLDraw from handling our pointer events
        e.stopPropagation()
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search..."
          disabled={isSearching}
        />
        <IconButton 
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          color="primary"
        >
          {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
      </div>

      {shape.props.results.length > 0 && (
        <div 
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Open selected results">
              <span>
                <Button
                  onClick={openSelectedResults}
                  disabled={selectedResults.length === 0}
                  startIcon={getLayoutIcon(currentLayout)}
                >
                  Open ({selectedResults.length})
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Choose layout">
              <span>
                <Button
                  size="small"
                  onClick={handleLayoutMenuOpen}
                  disabled={selectedResults.length === 0}
                >
                  ▼
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
          <Menu
            anchorEl={layoutAnchorEl}
            open={Boolean(layoutAnchorEl)}
            onClose={handleLayoutMenuClose}
          >
            <MenuItem onClick={() => handleLayoutSelect('grid')}>
              <GridViewIcon sx={{ mr: 1 }} /> Grid
            </MenuItem>
            <MenuItem onClick={() => handleLayoutSelect('horizontal')}>
              <ViewStreamIcon sx={{ mr: 1 }} /> Horizontal
            </MenuItem>
            <MenuItem onClick={() => handleLayoutSelect('vertical')}>
              <ViewWeekIcon sx={{ mr: 1 }} /> Vertical
            </MenuItem>
            <MenuItem onClick={() => handleLayoutSelect('cascade')}>
              <FilterNoneIcon sx={{ mr: 1 }} /> Cascade
            </MenuItem>
          </Menu>
        </div>
      )}

      <Paper 
        style={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'relative',  // Create a new stacking context
          zIndex: 1  // Ensure our content is above TLDraw's canvas
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <List>
          {shape.props.results.map((result, index) => (
            <ListItem 
              key={index}
              onClick={(e) => handleResultSelect(result, e)}
              selected={selectedResults.some(r => r.url === result.url)}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.16)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#1a73e8',
                    borderRadius: '0 2px 2px 0'
                  }
                },
                transition: 'all 0.2s ease'
              }}
              onPointerDown={(e) => {
                // Prevent TLDraw from handling our pointer events
                e.stopPropagation()
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1,
                gap: '4px'
              }}>
                <ListItemText
                  primary={result.title}
                  secondary={result.content}
                  primaryTypographyProps={{
                    style: { 
                      fontWeight: selectedResults.some(r => r.url === result.url) ? 'bold' : 'normal',
                      fontSize: '0.9rem',
                      color: '#1a73e8'
                    }
                  }}
                  secondaryTypographyProps={{
                    style: { 
                      fontSize: '0.8rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#006621',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {result.url}
                  </span>
                  <Tooltip title="Open in new browser">
                    <MuiIconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResultClick(result)
                      }}
                      sx={{
                        marginLeft: 'auto',
                        color: '#1a73e8',
                        '&:hover': {
                          backgroundColor: 'rgba(26, 115, 232, 0.08)'
                        }
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </MuiIconButton>
                  </Tooltip>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  )
} 