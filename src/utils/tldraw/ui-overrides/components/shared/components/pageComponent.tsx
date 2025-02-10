import React, { useCallback } from 'react';
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
  styled 
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

const PageSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.standard,
  }),
}));

const PageListItem = styled(ListItem, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isSelected?: boolean; isDarkMode?: boolean }>(({ theme, isSelected, isDarkMode }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
  transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: isSelected ? theme.palette.action.selected : theme.palette.action.hover,
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[1],
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
    '& .MuiIconButton-root': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  cursor: 'pointer',
  '& .MuiListItemIcon-root': {
    color: isSelected ? theme.palette.primary.main : (isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary),
    transition: theme.transitions.create(['color', 'transform'], {
      duration: theme.transitions.duration.shortest,
    }),
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  },
  '& .MuiIconButton-root': {
    opacity: 0,
    transform: 'scale(0.8)',
    transition: theme.transitions.create(['opacity', 'transform', 'background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'scale(1.1)',
    },
  },
}));

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
  color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
  transition: theme.transitions.create(['background-color', 'transform', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
  gap: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
    minWidth: '32px',
    transition: theme.transitions.create(['color', 'transform'], {
      duration: theme.transitions.duration.shortest,
    }),
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  },
  '&.Mui-disabled': {
    '& .MuiListItemIcon-root': {
      color: theme.palette.action.disabled,
    },
  },
}));

export const PageComponent = () => {
  const editor = useEditor();
  const { tldrawPreferences } = useTLDraw();
  const isDarkMode = tldrawPreferences?.colorScheme === 'dark';
  const [menuAnchor, setMenuAnchor] = React.useState<null | { element: HTMLElement; pageId: TLPageId }>(null);

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
    <PageSection>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary">Pages</Typography>
        <StyledIconButton size="small" onClick={handleCreatePage} isDarkMode={isDarkMode}>
          <AddIcon fontSize="small" />
        </StyledIconButton>
      </Box>

      <List dense>
        {pages.map((page) => (
          <PageListItem
            key={page.id}
            isSelected={page.id === currentPageId}
            isDarkMode={isDarkMode}
            onClick={() => handlePageSelect(page.id)}
          >
            <ListItemIcon>
              <PageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={page.name}
              primaryTypographyProps={{
                variant: 'body2',
                noWrap: true
              }}
            />
            <StyledIconButton 
              size="small" 
              onClick={(e) => handlePageMenuOpen(e, page.id)}
              isDarkMode={isDarkMode}
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
      >
        <StyledMenuItem onClick={handleRenamePage} isDarkMode={isDarkMode}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </StyledMenuItem>
        <StyledMenuItem onClick={handleDuplicatePage} isDarkMode={isDarkMode}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </StyledMenuItem>
        <StyledMenuItem 
          onClick={handleDeletePage}
          disabled={pages.length <= 1}
          isDarkMode={isDarkMode}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </StyledMenuItem>
      </Menu>
    </PageSection>
  );
};
