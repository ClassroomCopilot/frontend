// External imports
import { loadSnapshot, TLStore, getSnapshot } from '@tldraw/tldraw';
import axios from '../../axiosConfig';
import logger from '../../debugConfig';
import { SharedStoreService } from './sharedStoreService';
import { StorageKeys, storageService } from '../auth/localStorageService';
import { CCUserNodeProps } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-types';
import { NavigationNode } from '../../types/navigation';
import { UserNeoDBService } from '../graph/userNeoDBService';

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

export class NavigationSnapshotService {
    private store: TLStore;
    private currentNodePath: string | null = null;
    private isAutoSaveEnabled = true;
    private isSaving = false;
    private isLoading = false;
    private pendingOperation: { save?: string; load?: string } | null = null;

    constructor(store: TLStore) {
        this.store = store;
        logger.debug('snapshot-service', '🔄 Initialized NavigationSnapshotService', {
            storeId: store.id
        });
    }

    async handleNavigationStart(fromNode: NavigationNode | null, toNode: NavigationNode): Promise<void> {
        try {
            logger.debug('snapshot-service', '🔄 Starting navigation snapshot handling', {
                from: fromNode?.path,
                to: toNode.path,
                currentPath: this.currentNodePath
            });

            // If we're already in a navigation operation, queue this one
            if (this.isSaving || this.isLoading) {
                this.pendingOperation = {
                    save: fromNode?.path || undefined,
                    load: toNode.path
                };
                logger.debug('snapshot-service', '⏳ Queued navigation operation', this.pendingOperation);
                return;
            }

            // Save current snapshot if we have a current node
            if (fromNode?.path && this.isAutoSaveEnabled) {
                // Set currentNodePath if this is our first node
                if (!this.currentNodePath && fromNode.path) {
                    this.currentNodePath = fromNode.path;
                    logger.debug('snapshot-service', '📍 Initialized current node path', {
                        path: fromNode.path
                    });
                }

                await this.saveCurrentSnapshot(fromNode.path);
                logger.debug('snapshot-service', '✅ Saved current snapshot', {
                    nodePath: fromNode.path
                });
            }

            // Clear the store before loading new snapshot
            logger.debug('snapshot-service', '🔄 Clearing store');
            this.currentNodePath = null;
            logger.debug('snapshot-service', '🧹 Cleared current node path');

            // Load the new node's snapshot
            if (toNode.path) {
                await this.loadSnapshotForNode(toNode);
                logger.debug('snapshot-service', '✅ Loaded new node snapshot', {
                    nodePath: toNode.path
                });
            }

            // Process any pending operations
            if (this.pendingOperation) {
                logger.debug('snapshot-service', '🔄 Processing pending operation', this.pendingOperation);
                const operation = this.pendingOperation;
                this.pendingOperation = null;
                await this.handleNavigationStart(
                    operation.save ? { path: operation.save } as NavigationNode : null,
                    { path: operation.load } as NavigationNode
                );
                logger.debug('snapshot-service', '✅ Completed pending operation');
            }
        } catch (error) {
            logger.error('snapshot-service', '❌ Error during navigation snapshot handling', {
                error: error instanceof Error ? error.message : 'Unknown error',
                fromPath: fromNode?.path,
                toPath: toNode.path
            });
            throw error;
        }
    }

    private async saveCurrentSnapshot(nodePath: string): Promise<void> {
        if (!this.currentNodePath || this.currentNodePath !== nodePath) {
            logger.debug('snapshot-service', '⚠️ Skipping save - path mismatch', {
                currentPath: this.currentNodePath,
                savePath: nodePath
            });
            return;
        }

        try {
            this.isSaving = true;
            const dbName = UserNeoDBService.getNodeDatabaseName({ path: nodePath } as NavigationNode);
            
            logger.debug('snapshot-service', '💾 Saving snapshot', {
                nodePath,
                dbName
            });

            await saveNodeSnapshotToDatabase(nodePath, dbName, this.store);
            
            logger.debug('snapshot-service', '✅ Saved navigation snapshot', { 
                nodePath,
                storeId: this.store.id
            });
        } catch (error) {
            logger.error('snapshot-service', '❌ Failed to save navigation snapshot', {
                error: error instanceof Error ? error.message : 'Unknown error',
                nodePath
            });
            throw error;
        } finally {
            this.isSaving = false;
        }
    }

    private async loadSnapshotForNode(node: NavigationNode): Promise<void> {
        try {
            this.isLoading = true;
            const dbName = UserNeoDBService.getNodeDatabaseName(node);
            
            logger.debug('snapshot-service', '📥 Loading snapshot', {
                nodePath: node.path,
                dbName
            });

            await loadNodeSnapshotFromDatabase(
                node.path,
                dbName,
                this.store,
                (state: LoadingState) => {
                    if (state.status === 'ready') {
                        this.currentNodePath = node.path;
                        logger.debug('snapshot-service', '✅ Snapshot loaded and path updated', {
                            nodePath: node.path
                        });
                    } else if (state.status === 'error') {
                        logger.error('snapshot-service', '❌ Error in load callback', {
                            error: state.error,
                            nodePath: node.path
                        });
                    }
                }
            );
        } catch (error) {
            logger.error('snapshot-service', '❌ Failed to load navigation snapshot', {
                error: error instanceof Error ? error.message : 'Unknown error',
                nodePath: node.path
            });
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    setAutoSave(enabled: boolean): void {
        this.isAutoSaveEnabled = enabled;
        logger.debug('snapshot-service', '🔄 Auto-save setting changed', {
            enabled
        });
    }

    getCurrentNodePath(): string | null {
        return this.currentNodePath;
    }

    async forceSaveCurrentNode(): Promise<void> {
        if (this.currentNodePath) {
            await this.saveCurrentSnapshot(this.currentNodePath);
        }
    }

    clearCurrentNode(): void {
        this.currentNodePath = null;
        this.store.clear();
        logger.debug('snapshot-service', '🧹 Cleared current node and store');
    }
}