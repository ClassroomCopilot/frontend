import React, { useCallback } from 'react';
import { Box, Typography, styled, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useEditor, useToasts } from '@tldraw/tldraw';
import { useNavigationStore } from '../../../../../../stores/navigationStore';
import { UserNeoDBService } from '../../../../../../services/graph/userNeoDBService';
import { PageComponent } from '../components/pageComponent';
import { logger } from '../../../../../../debugConfig';
import { useTLDraw } from '../../../../../../contexts/TLDrawContext';

const CurrentNodeSection = styled(Box, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
  padding: theme.spacing(1),
  backgroundColor: isDarkMode ? theme.palette.background.default : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['box-shadow', 'transform', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: isDarkMode ? theme.palette.action.hover : theme.palette.background.default,
    boxShadow: theme.shadows[2],
    transform: 'translateY(-2px)',
  }
}));

const ActionButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'isDarkMode'
})<{ isDarkMode?: boolean }>(({ theme, isDarkMode }) => ({
  marginTop: theme.spacing(1),
  textTransform: 'none',
  padding: theme.spacing(0.75, 2),
  gap: theme.spacing(1),
  backgroundColor: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: isDarkMode ? theme.palette.primary.main : theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: theme.shadows[2],
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
    color: 'inherit',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.1) rotate(-10deg)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

export const CCNodeSnapshotPanel: React.FC = () => {
  const editor = useEditor();
  const { addToast } = useToasts();
  const { context: navigationContext, isLoading, error } = useNavigationStore();
  const { tldrawPreferences } = useTLDraw();
  const isDarkMode = tldrawPreferences?.colorScheme === 'dark';

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
      <CurrentNodeSection isDarkMode={isDarkMode}>
        <Typography variant="subtitle2" color="text.secondary">
          Current Node
        </Typography>
        <Typography variant="body1">
          {navigationContext.node.label || navigationContext.node.id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {navigationContext.node.type}
        </Typography>
        <ActionButton
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSaveSnapshot}
          disabled={isLoading}
          fullWidth
          isDarkMode={isDarkMode}
        >
          Save Snapshot
        </ActionButton>
      </CurrentNodeSection>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {renderCurrentNode()}
      <PageComponent />
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {isLoading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      )}
    </Box>
  );
};
