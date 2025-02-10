import React, { useCallback, useMemo } from 'react';
import { useEditor, TLPageId, useValue } from '@tldraw/tldraw';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton,
  Menu,
  MenuItem,
  styled,
  ThemeProvider,
  createTheme,
  useMediaQuery
} from '@mui/material';
import { useTLDraw } from '../../../../../../contexts/TLDrawContext';
import {
  FileCopy as PageIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon
} from '@mui/icons-material';

const PageSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: 'var(--color-text)',
}));

const PageListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  borderRadius: '4px',
  backgroundColor: isSelected ? 'var(--color-selected-background)' : 'transparent',
  transition: 'background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
  '&:hover': {
    backgroundColor: isSelected ? 'var(--color-selected-hover)' : 'var(--color-hover)',
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': {
      color: 'var(--color-selected)',
      transform: 'scale(1.1)',
    },
    '& .MuiIconButton-root': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  cursor: 'pointer',
  '& .MuiListItemIcon-root': {
    color: isSelected ? 'var(--color-selected)' : 'var(--color-text)',
    transition: 'color 200ms ease, transform 200ms ease',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  },
  '& .MuiIconButton-root': {
    opacity: 0,
    transform: 'scale(0.8)',
    transition: 'opacity 200ms ease, transform 200ms ease, background-color 200ms ease',
    '&:hover': {
      backgroundColor: 'var(--color-hover)',
      transform: 'scale(1.1)',
    },
  },
}));

const StyledIconButton = styled(IconButton)(() => ({
  color: 'var(--color-text)',
  transition: 'background-color 200ms ease, transform 200ms ease, color 200ms ease',
  '&:hover': {
    color: 'var(--color-selected)',
    backgroundColor: 'var(--color-hover)',
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  gap: '8px',
  transition: 'background-color 200ms ease, color 200ms ease',
  '&:hover': {
    backgroundColor: 'var(--color-hover)',
    '& .MuiListItemIcon-root': {
      color: 'var(--color-selected)',
      transform: 'scale(1.1)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'var(--color-text)',
    minWidth: '32px',
    transition: 'color 200ms ease, transform 200ms ease',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  },
  '&.Mui-disabled': {
    '& .MuiListItemIcon-root': {
      color: 'var(--color-text-disabled)',
    },
  },
}));

export const PageComponent = () => {
  const editor = useEditor();
  const { tldrawPreferences } = useTLDraw();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [menuAnchor, setMenuAnchor] = React.useState<null | { element: HTMLElement; pageId: TLPageId }>(null);

  // Create a dynamic theme based on TLDraw preferences
  const theme = useMemo(() => {
    let mode: 'light' | 'dark';
    
    // Determine mode based on TLDraw preferences
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

  // Subscribe to page changes using useValue
  const pages = useValue('pages', () => editor.getPages(), [editor]);
  const currentPageId = useValue('currentPageId', () => editor.getCurrentPageId(), [editor]);

  const handlePageSelect = useCallback((pageId: TLPageId) => {
    editor.setCurrentPage(pageId);
  }, [editor]);

  const handleCreatePage = useCallback(() => {
    editor.createPage({
      name: `Page ${editor.getPages().length + 1}`
    });
  }, [editor]);

  const handlePageMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, pageId: TLPageId) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, pageId });
  }, []);

  const handlePageMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleRenamePage = useCallback(() => {
    if (!menuAnchor) return;
    
    const page = editor.getPage(menuAnchor.pageId);
    if (!page) return;

    const newName = window.prompt('Enter new page name:', page.name);
    if (newName) {
      editor.renamePage(menuAnchor.pageId, newName);
    }
    handlePageMenuClose();
  }, [editor, menuAnchor]);

  const handleDuplicatePage = useCallback(() => {
    if (!menuAnchor) return;
    editor.duplicatePage(menuAnchor.pageId);
    handlePageMenuClose();
  }, [editor, menuAnchor]);

  const handleDeletePage = useCallback(() => {
    if (!menuAnchor) return;
    
    if (pages.length <= 1) {
      alert('Cannot delete the last page');
      return;
    }

    editor.deletePage(menuAnchor.pageId);
    handlePageMenuClose();
  }, [editor, menuAnchor, pages.length]);

  return (
    <ThemeProvider theme={theme}>
      <PageSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>Pages</Typography>
          <StyledIconButton size="small" onClick={handleCreatePage}>
            <AddIcon fontSize="small" />
          </StyledIconButton>
        </Box>

        <List dense>
          {pages.map((page) => (
            <PageListItem
              key={page.id}
              isSelected={page.id === currentPageId}
              onClick={() => handlePageSelect(page.id)}
            >
              <ListItemIcon>
                <PageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={page.name}
                primaryTypographyProps={{
                  variant: 'body2',
                  noWrap: true,
                  sx: { color: 'var(--color-text)' }
                }}
              />
              <StyledIconButton 
                size="small" 
                onClick={(e) => handlePageMenuOpen(e, page.id)}
              >
                <MoreVertIcon fontSize="small" />
              </StyledIconButton>
            </PageListItem>
          ))}
        </List>

        <Menu
          anchorEl={menuAnchor?.element}
          open={Boolean(menuAnchor)}
          onClose={handlePageMenuClose}
          PaperProps={{
            elevation: 8,
            sx: {
              border: '1px solid var(--color-divider)',
              boxShadow: 'var(--shadow-popup)',
            },
          }}
        >
          <StyledMenuItem onClick={handleRenamePage}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </StyledMenuItem>
          <StyledMenuItem onClick={handleDuplicatePage}>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </StyledMenuItem>
          <StyledMenuItem 
            onClick={handleDeletePage}
            disabled={pages.length <= 1}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </StyledMenuItem>
        </Menu>
      </PageSection>
    </ThemeProvider>
  );
};
