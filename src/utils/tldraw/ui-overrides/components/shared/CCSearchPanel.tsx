import React, { useState, useCallback, useMemo } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Button, 
  Tabs, 
  Tab,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  styled
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddBoxIcon from '@mui/icons-material/AddBox'
import LanguageIcon from '@mui/icons-material/Language'
import { SearchResult } from '../../../../../services/tldraw/searchService'
import { createSearchShape } from '../../../cc-base/shape-helpers/search-helpers'
import { createWebBrowserShape } from '../../../cc-base/shape-helpers/web-browser-helpers'
import { SearchService } from '../../../../../services/tldraw/searchService'
import { CCWebBrowserShapeUtil } from '../../../cc-base/cc-web-browser/CCWebBrowserUtil'
import { useTLDraw } from '../../../../../contexts/TLDrawContext'

const StyledTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    backgroundColor: 'var(--color-panel)',
    color: 'var(--color-text)',
    '& fieldset': {
      borderColor: 'var(--color-divider)',
    },
    '&:hover fieldset': {
      borderColor: 'var(--color-text)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--color-selected)',
    },
  },
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: 'var(--color-text-secondary)',
      opacity: 1,
    },
  },
}));

const StyledButton = styled(Button)(() => ({
  textTransform: 'none',
  backgroundColor: 'var(--color-panel)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-divider)',
  '&:hover': {
    backgroundColor: 'var(--color-hover)',
    borderColor: 'var(--color-text)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-text-disabled)',
    borderColor: 'var(--color-divider)',
  },
}));

const StyledIconButton = styled(IconButton)(() => ({
  color: 'var(--color-text)',
  '&:hover': {
    backgroundColor: 'var(--color-hover)',
  },
  '&.Mui-disabled': {
    color: 'var(--color-text-disabled)',
  },
}));

const StyledPaper = styled(Paper)(() => ({
  backgroundColor: 'var(--color-panel)',
  border: '1px solid var(--color-divider)',
  '& .MuiListItem-root': {
    borderBottom: '1px solid var(--color-divider)',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
}));

const StyledTabs = styled(Tabs)(() => ({
  '& .MuiTab-root': {
    color: 'var(--color-text-secondary)',
    textTransform: 'none',
    '&.Mui-selected': {
      color: 'var(--color-selected)',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--color-selected)',
  },
}));

export const CCSearchPanel: React.FC = () => {
  const editor = useEditor()
  const { tldrawPreferences } = useTLDraw()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const theme = useMemo(() => {
    let mode: 'light' | 'dark';
    
    if (tldrawPreferences?.colorScheme === 'system') {
      mode = prefersDarkMode ? 'dark' : 'light';
    } else {
      mode = tldrawPreferences?.colorScheme === 'dark' ? 'dark' : 'light';
    }

    return createTheme({
      palette: {
        mode,
        divider: 'var(--color-divider)',
      },
    });
  }, [tldrawPreferences?.colorScheme, prefersDarkMode]);

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
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px', gap: '8px' }}>
        <StyledTabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Search" />
          <Tab label="Browser" />
        </StyledTabs>

        {activeTab === 0 ? (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StyledTextField
                fullWidth
                size="small"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search..."
                disabled={isSearching}
              />
              <StyledIconButton 
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                <SearchIcon />
              </StyledIconButton>
            </div>

            <StyledButton
              startIcon={<AddBoxIcon />}
              onClick={handleCreateSearchShape}
              fullWidth
            >
              Add Search Box
            </StyledButton>

            <StyledPaper sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {results.map((result, index) => (
                  <ListItem 
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 1,
                      padding: '12px',
                    }}
                  >
                    <ListItemText
                      primary={result.title}
                      secondary={result.content}
                      primaryTypographyProps={{
                        sx: { 
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          color: 'var(--color-selected)',
                          mb: 0.5
                        }
                      }}
                      secondaryTypographyProps={{
                        sx: { 
                          fontSize: '0.8rem',
                          color: 'var(--color-text)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }
                      }}
                    />
                    <StyledButton
                      size="small"
                      onClick={() => handleCreateFromResult(result)}
                      fullWidth
                    >
                      Open in Browser
                    </StyledButton>
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StyledTextField
                fullWidth
                size="small"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter URL..."
              />
              <StyledIconButton 
                onClick={handleCreateBrowserShape}
                disabled={!url.trim()}
              >
                <LanguageIcon />
              </StyledIconButton>
            </div>
            <StyledButton
              startIcon={<AddBoxIcon />}
              onClick={handleCreateBrowserShape}
              disabled={!url.trim()}
              fullWidth
            >
              Add Web Browser
            </StyledButton>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
