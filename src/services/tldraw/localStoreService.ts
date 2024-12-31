import { 
    TLStore, 
    createTLStore,
    TLEditorSnapshot,
    loadSnapshot,
    TLAnyShapeUtilConstructor,
    TLAnyBindingUtilConstructor
} from '@tldraw/tldraw';
import { LoadingState } from './snapshotService';
import { allShapeUtils, devShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { logger } from '../../debugConfig';

interface LocalStoreConfig {
    shapeUtils?: TLAnyShapeUtilConstructor[];
    bindingUtils?: TLAnyBindingUtilConstructor[];
}

class LocalStoreService {
    private store: TLStore | null = null;
    private static instance: LocalStoreService;

    public static getInstance(): LocalStoreService {
        if (!LocalStoreService.instance) {
            LocalStoreService.instance = new LocalStoreService();
        }
        return LocalStoreService.instance;
    }

    public getStore(config?: LocalStoreConfig): TLStore {
        if (!this.store) {
            logger.debug('system', '🔄 Creating new TLStore');
            this.store = createTLStore({
                shapeUtils: config?.shapeUtils || [...allShapeUtils, ...devShapeUtils],
                bindingUtils: config?.bindingUtils || allBindingUtils,
            });
        }
        return this.store;
    }

    public async loadSnapshot(
        snapshot: Partial<TLEditorSnapshot>, 
        setLoadingState: (state: LoadingState) => void
    ): Promise<void> {
        try {
            if (!this.store) {
                throw new Error('Store not initialized');
            }

            logger.debug('system', '📥 Loading snapshot into store');
            loadSnapshot(this.store, snapshot);
            setLoadingState({ status: 'ready', error: '' });
        } catch (error) {
            logger.error('system', '❌ Failed to load snapshot:', error);
            if (this.store) {
                this.store.clear();
            }
            setLoadingState({ 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Failed to load snapshot' 
            });
        }
    }

    public clearStore(): void {
        logger.debug('system', '🧹 Clearing store');
        if (this.store) {
            this.store.clear();
        }
        this.store = null;
    }

    public isStoreReady(): boolean {
        return !!this.store;
    }
}

export const localStoreService = LocalStoreService.getInstance();
