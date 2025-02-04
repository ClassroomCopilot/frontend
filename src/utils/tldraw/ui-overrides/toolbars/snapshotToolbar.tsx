import { useCallback, ReactNode } from 'react';
import { useEditor, loadSnapshot, useToasts } from '@tldraw/tldraw';
import { UserNeoDBService } from '../../../../services/graph/userNeoDBService';
import { useNavigationStore } from '../../../../stores/navigationStore';
import { blankCanvasSnapshot } from '../../../tldraw/assets';
import logger from '../../../../debugConfig';

export function SnapshotToolbar({ 
    children
}: { 
    children: (props: { save: () => void, resetToBlankCanvas: () => void }) => ReactNode
}) {
    const editor = useEditor();
    const { addToast } = useToasts();
    const { currentNode } = useNavigationStore();

    const save = useCallback(async () => {
        try {
            if (!currentNode?.path) {
                logger.error('snapshot-toolbar', '❌ No current node available for saving');
                throw new Error('No current node available for saving');
            }

            logger.info('snapshot-toolbar', '💾 Saving snapshot', {
                path: currentNode.path,
                nodeId: currentNode.id,
                nodeType: currentNode.type
            });

            const snapshot = editor.getSnapshot();

            await UserNeoDBService.saveNodeSnapshot(currentNode.path, snapshot);

            addToast({
                title: 'Snapshot saved',
                description: 'Your snapshot has been saved successfully.',
                icon: 'check',
            });
        } catch (error) {
            logger.error('snapshot-toolbar', '❌ Failed to save snapshot', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            addToast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save snapshot',
                icon: 'warning-triangle',
            });
        }
    }, [editor, currentNode, addToast]);

    const resetToBlankCanvas = useCallback(() => {
        loadSnapshot(editor.store, blankCanvasSnapshot);
        addToast({
            title: 'Canvas reset',
            description: 'The canvas has been reset to blank.',
            icon: 'reset-zoom',
        });
    }, [editor, addToast]);

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {children({ save, resetToBlankCanvas })}
        </div>
    );
}
