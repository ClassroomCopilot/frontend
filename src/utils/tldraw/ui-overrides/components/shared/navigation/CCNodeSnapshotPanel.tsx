import React, { useCallback, useMemo } from 'react';
import { Box, Typography, styled, Button, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useEditor, useToasts } from '@tldraw/tldraw';
import { useNavigationStore } from '../../../../../../stores/navigationStore';
import { UserNeoDBService } from '../../../../../../services/graph/userNeoDBService';
import { PageComponent } from '../components/pageComponent';
import { logger } from '../../../../../../debugConfig';
import { useTLDraw } from '../../../../../../contexts/TLDrawContext';

const CurrentNodeSection = styled(Box)(() => ({
  padding: '8px',
  backgroundColor: 'var(--color-panel)',
  borderRadius: '4px',
  marginBottom: '8px',
  '&:hover': {
    backgroundColor: 'var(--color-hover)',
  }
}));

const NodeInfoContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '12px'
}));

const ActionButton = styled(Button)(() => ({
  textTransform: 'none',
  padding: '6px 16px',
  gap: '8px',
  backgroundColor: 'var(--color-panel)',
  color: 'var(--color-text)',
  border: '1px solid transparent',
  transition: 'border-color 200ms ease',
  '&:hover': {
    backgroundColor: 'var(--color-panel)',
    borderColor: 'var(--color-text)',
  },
  '&:active': {
    backgroundColor: 'var(--color-panel)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
    color: 'inherit',
    transition: 'transform 200ms ease',
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.1) rotate(-10deg)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-text-disabled)',
    borderColor: 'transparent',
  }
}));

export const CCNodeSnapshotPanel: React.FC = () => {
  const editor = useEditor();
  const { addToast } = useToasts();
  const { context: navigationContext, isLoading, error } = useNavigationStore();
  const { tldrawPreferences } = useTLDraw();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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

  const handleSaveSnapshot = useCallback(async () => {
    try {
      if (!navigationContext.node?.path) {
        logger.error('cc-node-snapshot-panel', '❌ No current node available for saving');
        addToast({
          title: 'Error',
          description: 'No current node available for saving',
          icon: 'warning-triangle',
        });
        return;
      }

      logger.info('cc-node-snapshot-panel', '💾 Saving snapshot', {
        path: navigationContext.node.path,
        nodeId: navigationContext.node.id,
        nodeType: navigationContext.node.type
      });

      const snapshot = editor.getSnapshot();
      await UserNeoDBService.saveNodeSnapshot(navigationContext.node.path, snapshot);

      addToast({
        title: 'Snapshot saved',
        description: 'Your snapshot has been saved successfully.',
        icon: 'check',
      });
    } catch (error) {
      logger.error('cc-node-snapshot-panel', '❌ Failed to save snapshot', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save snapshot',
        icon: 'warning-triangle',
      });
    }
  }, [editor, navigationContext.node, addToast]);

  const renderCurrentNode = () => {
    if (!navigationContext.node) return null;

    return (
      <CurrentNodeSection>
        <NodeInfoContainer>
          <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
            Current Node
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
            {navigationContext.node.label || navigationContext.node.id}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
            {navigationContext.node.type}
          </Typography>
        </NodeInfoContainer>
        <ActionButton
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSaveSnapshot}
          disabled={isLoading}
          fullWidth
        >
          Save Snapshot
        </ActionButton>
      </CurrentNodeSection>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {renderCurrentNode()}
        <PageComponent />
        
        {error && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: 'var(--color-error)'
            }}
          >
            {error}
          </Typography>
        )}
        
        {isLoading && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: 'var(--color-text-secondary)'
            }}
          >
            Loading...
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};
