import React, { useState, useCallback } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { TextField, IconButton, List, ListItem, ListItemText, Paper, Button, Tabs, Tab } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddBoxIcon from '@mui/icons-material/AddBox'
import LanguageIcon from '@mui/icons-material/Language'
import { SearchResult } from '../../../../../services/tldraw/searchService'
import { createSearchShape } from '../../../cc-base/shape-helpers/search-helpers'
import { createWebBrowserShape } from '../../../cc-base/shape-helpers/web-browser-helpers'
import { SearchService } from '../../../../../services/tldraw/searchService'
import { CCWebBrowserShapeUtil } from '../../../cc-base/cc-web-browser/CCWebBrowserUtil'

export const CCSearchPanel: React.FC = () => {
  const editor = useEditor()
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await SearchService.search(query)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  const handleCreateSearchShape = useCallback(() => {
    createSearchShape(editor, { query })
  }, [editor, query])

  const handleCreateBrowserShape = useCallback(() => {
    const processedUrl = url.startsWith('http') ? url : `https://${url}`
    const { isEmbeddable } = CCWebBrowserShapeUtil.isEmbeddableUrl(processedUrl)
    
    if (isEmbeddable) {
      editor.createShape({
        type: 'embed',
        props: { url: processedUrl },
      })
    } else {
      createWebBrowserShape(editor, { url: processedUrl })
    }
  }, [editor, url])

  const handleCreateFromResult = useCallback((result: SearchResult) => {
    const { isEmbeddable } = CCWebBrowserShapeUtil.isEmbeddableUrl(result.url)
    
    if (isEmbeddable) {
      editor.createShape({
        type: 'embed',
        props: { url: result.url },
      })
    } else {
      createWebBrowserShape(editor, { url: result.url })
    }
  }, [editor])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 0) {
        handleSearch()
      } else {
        handleCreateBrowserShape()
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px' }}>
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        style={{ marginBottom: '8px' }}
      >
        <Tab label="Search" />
        <Tab label="Browser" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <TextField
              fullWidth
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
              <SearchIcon />
            </IconButton>
          </div>

          <Button
            startIcon={<AddBoxIcon />}
            variant="outlined"
            onClick={handleCreateSearchShape}
            style={{ marginBottom: '8px' }}
          >
            Add Search Box
          </Button>

          <Paper 
            style={{ 
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <List>
              {results.map((result, index) => (
                <ListItem 
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={result.title}
                    secondary={result.content}
                    primaryTypographyProps={{
                      style: { 
                        fontWeight: 'bold',
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
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCreateFromResult(result)}
                      sx={{ flex: 1 }}
                    >
                      Open in Browser
                    </Button>
                  </div>
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextField
              fullWidth
              size="small"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter URL..."
            />
            <IconButton 
              onClick={handleCreateBrowserShape}
              disabled={!url.trim()}
              color="primary"
            >
              <LanguageIcon />
            </IconButton>
          </div>
          <Button
            startIcon={<AddBoxIcon />}
            variant="outlined"
            onClick={handleCreateBrowserShape}
            disabled={!url.trim()}
          >
            Add Web Browser
          </Button>
        </div>
      )}
    </div>
  )
}
