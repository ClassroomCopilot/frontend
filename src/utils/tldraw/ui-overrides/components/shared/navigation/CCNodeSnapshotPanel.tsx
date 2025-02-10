import React, { useCallback } from 'react';
import { Box, Typography, styled, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useEditor, useToasts } from '@tldraw/tldraw';
import { useNavigationStore } from '../../../../../../stores/navigationStore';
import { UserNeoDBService } from '../../../../../../services/graph/userNeoDBService';
import { PageComponent } from '../components/pageComponent';
import { logger } from '../../../../../../debugConfig';

const CurrentNodeSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  textTransform: 'none',
}));

export const CCNodeSnapshotPanel: React.FC = () => {
  const editor = useEditor();
  const { addToast } = useToasts();
  const { context: navigationContext, isLoading, error } = useNavigationStore();

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
          color="primary"
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
