// External imports
import { TLStore, TLEditorSnapshot, loadSnapshot, getSnapshot } from '@tldraw/tldraw';
// Local imports
import { logger } from '../../debugConfig';
import { LoadingState } from './snapshotService';
import { storageService, StorageKeys } from '../auth/localStorageService';

interface AutoSaveConfig {
    checkInterval: number;  // Changed to required
    saveInterval: number;   // Changed to required
}

const DEFAULT_CONFIG: AutoSaveConfig = {
    checkInterval: 5000,
    saveInterval: 30000
};

export class SharedStoreService {
    private lastSaveTime: number = Date.now();
    private autoSaveInterval: ReturnType<typeof setTimeout> | null = null;
    private config: AutoSaveConfig;

    constructor(private store: TLStore, config?: Partial<AutoSaveConfig>) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };
        logger.debug('shared-store-service', '🏗️ Initializing SharedStoreService');
    }

    public startAutoSave(setLoadingState: (state: LoadingState) => void): void {
        if (this.autoSaveInterval) {
            this.stopAutoSave();
        }

        this.autoSaveInterval = setInterval(() => {
            this.checkAndSave(setLoadingState);
        }, this.config.checkInterval);

        logger.debug('shared-store-service', '⏰ Auto-save started', {
            checkInterval: this.config.checkInterval,
            saveInterval: this.config.saveInterval
        });
    }

    public stopAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            logger.debug('shared-store-service', '⏹️ Auto-save stopped');
        }
    }

    private async checkAndSave(setLoadingState: (state: LoadingState) => void): Promise<void> {
        const now = Date.now();
        if (now - this.lastSaveTime >= this.config.saveInterval) {
            const currentSnapshot = getSnapshot(this.store);
            const savedSnapshot = storageService.get(StorageKeys.LOCAL_SNAPSHOT);

            if (!savedSnapshot || JSON.stringify(currentSnapshot) !== JSON.stringify(savedSnapshot)) {
                logger.debug('shared-store-service', '💾 Auto-saving snapshot - changes detected');
                await this.saveSnapshot(currentSnapshot, setLoadingState);
                this.lastSaveTime = now;
            } else {
                logger.trace('shared-store-service', '📝 No changes detected, skipping auto-save');
            }
        }
    }

    public async saveSnapshot(
        snapshot: Partial<TLEditorSnapshot>,
        setLoadingState: (state: LoadingState) => void
    ): Promise<void> {
        try {
            storageService.set(StorageKeys.LOCAL_SNAPSHOT, snapshot);
            setLoadingState({ status: 'ready', error: '' });
            logger.debug('shared-store-service', '✅ Snapshot saved successfully');
        } catch (error) {
            logger.error('shared-store-service', '❌ Failed to save snapshot:', error);
            setLoadingState({ 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Failed to save snapshot' 
            });
        }
    }

    public async loadSnapshot(
        snapshot: Partial<TLEditorSnapshot>,
        setLoadingState: (state: LoadingState) => void
    ): Promise<void> {
        try {
            setLoadingState({ status: 'loading', error: '' });
            loadSnapshot(this.store, snapshot);
            setLoadingState({ status: 'ready', error: '' });
            logger.debug('shared-store-service', '✅ Snapshot loaded successfully');
        } catch (error) {
            logger.error('shared-store-service', '❌ Failed to load snapshot:', error);
            this.store.clear();
            setLoadingState({ 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Failed to load snapshot' 
            });
        }
    }

    public getStore(): TLStore {
        return this.store;
    }

    public clear(): void {
        this.stopAutoSave();
        this.store.clear();
        logger.debug('shared-store-service', '🧹 Store cleared');
    }
}

export const createSharedStore = (
    store: TLStore, 
    config?: Partial<AutoSaveConfig>
): SharedStoreService => {
    return new SharedStoreService(store, config);
}; 