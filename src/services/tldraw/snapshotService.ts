// External imports
import { loadSnapshot, TLStore, getSnapshot } from '@tldraw/tldraw';
import axios from '../../axiosConfig';
import logger from '../../debugConfig';
import { SharedStoreService } from './sharedStoreService';
import { StorageKeys, storageService } from '../auth/localStorageService';
import { CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';

export interface LoadingState {
    status: 'loading' | 'ready' | 'error';
    error: string;
}

function replaceBackslashes(input: string | undefined): string {
    return input ? input.replace(/\\/g, '/') : '';
}

export const loadUserNodeTldrawFile = async (
    userNode: CCUserNodeProps,
    store: TLStore,
    sharedStore?: SharedStoreService,
    setLoadingState?: (state: LoadingState) => void
): Promise<void> => {
    try {
        if (setLoadingState) {
            setLoadingState({ status: 'loading', error: '' });
        }
        // Extract the actual user node data
        const userNodeData = userNode;
        
        logger.info('snapshot-service', '📂 Loading file for user node', { 
            email: userNodeData.user_email,
            path: userNodeData.path 
        });

        const userNodePayload = {
            unique_id: userNodeData.unique_id,
            user_id: userNodeData.user_id,
            user_type: userNodeData.user_type,
            user_name: userNodeData.user_name,
            user_email: userNodeData.user_email,
            path: replaceBackslashes(userNodeData.path),
            worker_node_data: userNodeData.worker_node_data || "{}"
        };

        const response = await axios.post(
            '/api/database/tldraw_fs/get_tldraw_user_node_file', 
            userNodePayload
        );

        const snapshot = response.data;
        if (snapshot && snapshot.document && snapshot.session) {
            logger.debug('snapshot-service', '📥 Snapshot loaded successfully');
            
            // If we have a shared store, use it for loading
            if (sharedStore && setLoadingState) {
                await sharedStore.loadSnapshot(snapshot, setLoadingState);
            } else {
                // Otherwise use the provided store directly
                loadSnapshot(store, snapshot);
                if (setLoadingState) {
                    setLoadingState({ status: 'ready', error: '' });
                }
            }
        } else {
            logger.error('snapshot-service', '❌ Invalid snapshot format');
            if (setLoadingState) {
                setLoadingState({ status: 'error', error: 'Invalid snapshot format' });
            }
        }
    } catch (error) {
        logger.error('snapshot-service', '❌ Failed to fetch snapshot', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        if (setLoadingState) {
            setLoadingState({ 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Failed to load file' 
            });
        }
    }
};

export const loadNodeSnapshotFromDatabase = async (
    nodePath: string,
    dbName: string,
    store: TLStore,
    setLoadingState: (state: LoadingState) => void,
    sharedStore?: SharedStoreService
): Promise<void> => {
    try {
        setLoadingState({ status: 'loading', error: '' });

        logger.info('snapshot-service', '📂 Loading file from path', { 
            path: nodePath,
            db_name: dbName
        });

        const response = await axios.get(
            '/api/database/tldraw_fs/get_tldraw_node_file', {
                params: {
                    path: replaceBackslashes(nodePath),
                    db_name: dbName
                }
            }
        );

        const snapshot = response.data;
        if (snapshot && snapshot.document && snapshot.session) {
            logger.debug('snapshot-service', '📥 Snapshot loaded successfully');
            
            if (sharedStore) {
                await sharedStore.loadSnapshot(snapshot, setLoadingState);
            } else {
                loadSnapshot(store, snapshot);
                storageService.set(StorageKeys.NODE_FILE_PATH, nodePath);
            }
        } else {
            logger.error('snapshot-service', '❌ Invalid snapshot format');
            setLoadingState({ status: 'error', error: 'Invalid snapshot format' });  
        }
    } catch (error) {
        logger.error('snapshot-service', '❌ Failed to fetch snapshot', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        setLoadingState({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Failed to load file' 
        });
    }
}

export const saveNodeSnapshotToDatabase = async (
    nodePath: string,
    dbName: string,
    store: TLStore
): Promise<void> => {
    try {
        logger.info('snapshot-service', '💾 Saving snapshot to database', { 
            path: nodePath,
            db_name: dbName
        });

        const snapshot = getSnapshot(store);
        
        const response = await axios.post(
            '/api/database/tldraw_fs/set_tldraw_node_file', 
            snapshot,
            {
                params: {
                    path: replaceBackslashes(nodePath),
                    db_name: dbName
                }
            }
        );

        if (response.data.status === 'success') {
            logger.debug('snapshot-service', '✅ Snapshot saved successfully');
        } else {
            throw new Error('Failed to save snapshot');
        }
    } catch (error) {
        logger.error('snapshot-service', '❌ Failed to save snapshot', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};