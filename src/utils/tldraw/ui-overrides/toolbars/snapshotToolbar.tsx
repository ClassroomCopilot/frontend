import { useCallback, ReactNode, useEffect, useState } from 'react';
import { useEditor, loadSnapshot, useToasts } from '@tldraw/tldraw';
import { useNeo4j } from '../../../../contexts/Neo4jContext';
import { saveNodeSnapshotToDatabase } from '../../../../services/tldraw/snapshotService';
import { StorageKeys, storageService } from '../../../../services/auth/localStorageService';
import logger from '../../../../debugConfig';
import { blankCanvasSnapshot } from '../../../tldraw/assets';

export function SnapshotToolbar({ 
    children,
    pathFromCalendar
}: { 
    children: (props: { save: () => void, resetToBlankCanvas: () => void }) => ReactNode,
    pathFromCalendar: string | null
}) {
    const editor = useEditor();
    const { addToast } = useToasts();
    const { userDbName, workerDbName } = useNeo4j();
    const [currentPath, setCurrentPath] = useState<string | null>(null);

    useEffect(() => {
        if (pathFromCalendar) {
            setCurrentPath(pathFromCalendar);
        } else {
            const storedPath = storageService.get(StorageKeys.NODE_FILE_PATH);
            if (storedPath) {
                setCurrentPath(storedPath);
            }
        }
    }, [pathFromCalendar]);

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
