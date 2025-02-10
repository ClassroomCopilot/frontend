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
}));

const PageListItem = styled(ListItem)<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
}));

export const PageComponent = () => {
  const editor = useEditor();
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
        <Typography variant="subtitle2">Pages</Typography>
        <IconButton size="small" onClick={handleCreatePage}>
          <AddIcon fontSize="small" />
        </IconButton>
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
                noWrap: true
              }}
            />
            <IconButton 
              size="small" 
              onClick={(e) => handlePageMenuOpen(e, page.id)}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </PageListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handlePageMenuClose}
      >
        <MenuItem onClick={handleRenamePage}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicatePage}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleDeletePage}
          disabled={pages.length <= 1}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </PageSection>
  );
};
