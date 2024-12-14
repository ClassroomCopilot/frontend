import { useCallback, ReactNode, useEffect, useState } from 'react';
import { useEditor, loadSnapshot, TLStoreSnapshot, useToasts } from '@tldraw/tldraw';
import { useNeo4j } from '../../../contexts/Neo4jContext';
import { saveNodeSnapshotToDatabase } from '../../../services/tldraw/snapshotService';
import { StorageKeys, storageService } from '../../../services/auth/localStorageService';
import logger from '../../../debugConfig';
import blankCanvasSnapshotData from './blankCanvasSnapshotData.json';

export function SnapshotToolbar({ 
    children 
}: { 
    children: (props: { save: () => void, resetToBlankCanvas: () => void }) => ReactNode 
}) {
    const editor = useEditor();
    const { addToast } = useToasts();
    const { userDbName, workerDbName } = useNeo4j();
    const [currentPath, setCurrentPath] = useState<string | null>(null);

    useEffect(() => {
        const storedPath = storageService.get(StorageKeys.NODE_FILE_PATH);
        if (storedPath) {
            setCurrentPath(storedPath);
        }
    }, []);

    const save = useCallback(async () => {
        try {
            const nodePath = currentPath;
            if (!nodePath) {
                throw new Error('No path specified for saving');
            }

            const isUserDb = nodePath.includes('cc.ccusers');
            logger.warn('snapshot-toolbar', '💾 Saving snapshot using user db (worker db not supported in prod)', {
                isUserDb,
                userDbName,
                workerDbName
            });
            const dbName = isUserDb ? userDbName : workerDbName;
            logger.warn('snapshot-toolbar', '💾 Saving snapshot using db', {
                dbName
            });

            if (!dbName) {
                throw new Error('Database name not available');
            }

            logger.info('snapshot-toolbar', '💾 Saving snapshot', {
                path: nodePath,
                db_name: dbName
            });

            await saveNodeSnapshotToDatabase(nodePath, dbName, editor.store);

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
    }, [editor, currentPath, userDbName, workerDbName, addToast]);

    const resetToBlankCanvas = useCallback(() => {
        const blankSnapshot: TLStoreSnapshot = blankCanvasSnapshotData as TLStoreSnapshot;
        loadSnapshot(editor.store, blankSnapshot);
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
