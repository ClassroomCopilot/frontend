import React, { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { TLUserPreferences, TLEditorSnapshot, TLStore, getSnapshot, loadSnapshot, Editor } from '@tldraw/tldraw';
import { storageService, StorageKeys } from '../services/auth/localStorageService';
import { LoadingState } from '../services/tldraw/snapshotService';
import { SharedStoreService } from '../services/tldraw/sharedStoreService';
import { logger } from '../debugConfig';
import { PresentationService } from '../services/tldraw/presentationService';

interface TLDrawContextType {
  tldrawPreferences: TLUserPreferences | null;
  tldrawUserFilePath: string | null;
  localSnapshot: Partial<TLEditorSnapshot> | null;
  presentationMode: boolean;
  sharedStore: SharedStoreService | null;
  connectionStatus: 'online' | 'offline' | 'error';
  presentationService: PresentationService | null;
  setTldrawPreferences: (preferences: TLUserPreferences | null) => void;
  setTldrawUserFilePath: (path: string | null) => void;
  handleLocalSnapshot: (
    action: string,
    store: TLStore,
    setLoadingState: (state: LoadingState) => void
  ) => Promise<void>;
  togglePresentationMode: (editor?: Editor) => void;
  initializePreferences: (userId: string) => void;
  setSharedStore: (store: SharedStoreService | null) => void;
  setConnectionStatus: (status: 'online' | 'offline' | 'error') => void;
}

const TLDrawContext = createContext<TLDrawContextType>({
  tldrawPreferences: null,
  tldrawUserFilePath: null,
  localSnapshot: null,
  presentationMode: false,
  sharedStore: null,
  connectionStatus: 'online',
  presentationService: null,
  setTldrawPreferences: () => {},
  setTldrawUserFilePath: () => {},
  handleLocalSnapshot: async () => {},
  togglePresentationMode: () => {},
  initializePreferences: () => {},
  setSharedStore: () => {},
  setConnectionStatus: () => {}
});

export const TLDrawProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tldrawPreferences, setTldrawPreferencesState] = useState<TLUserPreferences | null>(
    storageService.get(StorageKeys.TLDRAW_PREFERENCES)
  );
  const [tldrawUserFilePath, setTldrawUserFilePathState] = useState<string | null>(
    storageService.get(StorageKeys.TLDRAW_FILE_PATH)
  );
  const [localSnapshot, setLocalSnapshot] = useState<Partial<TLEditorSnapshot> | null>(
    storageService.get(StorageKeys.LOCAL_SNAPSHOT)
  );
  const [presentationMode, setPresentationMode] = useState<boolean>(
    storageService.get(StorageKeys.PRESENTATION_MODE) || false
  );
  const [sharedStore, setSharedStore] = useState<SharedStoreService | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [presentationService, setPresentationService] = useState<PresentationService | null>(null);

  const initializePreferences = useCallback((userId: string) => {
    logger.debug('tldraw-context', '🔄 Initializing TLDraw preferences');
    const storedPrefs = storageService.get(StorageKeys.TLDRAW_PREFERENCES);
    
    if (storedPrefs) {
      logger.debug('tldraw-context', '📥 Found stored preferences');
      setTldrawPreferencesState(storedPrefs);
      return;
    }

    // Create default preferences if none exist
    const defaultPrefs: TLUserPreferences = {
      id: userId,
      name: 'User',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      locale: 'en',
      colorScheme: 'system',
      isSnapMode: false,
      isWrapMode: false,
      isDynamicSizeMode: false,
      isPasteAtCursorMode: false,
      animationSpeed: 1,
      edgeScrollSpeed: 1
    };

    logger.debug('tldraw-context', '📝 Creating default preferences');
    storageService.set(StorageKeys.TLDRAW_PREFERENCES, defaultPrefs);
    setTldrawPreferencesState(defaultPrefs);
  }, []);

  const setTldrawPreferences = useCallback((preferences: TLUserPreferences | null) => {
    logger.debug('tldraw-context', '🔄 Setting TLDraw preferences', { preferences });
    if (preferences) {
      storageService.set(StorageKeys.TLDRAW_PREFERENCES, preferences);
    } else {
      storageService.remove(StorageKeys.TLDRAW_PREFERENCES);
    }
    setTldrawPreferencesState(preferences);
  }, []);

  const setTldrawUserFilePath = (path: string | null) => {
    logger.debug('tldraw-context', '🔄 Setting TLDraw user file path');
    if (path) {
      storageService.set(StorageKeys.TLDRAW_FILE_PATH, path);
    } else {
      storageService.remove(StorageKeys.TLDRAW_FILE_PATH);
    }
    setTldrawUserFilePathState(path);
  };

  const handleLocalSnapshot = useCallback(async (
    action: string,
    store: TLStore,
    setLoadingState: (state: LoadingState) => void
  ): Promise<void> => {
    if (!store) {
      setLoadingState({ status: 'error', error: 'Store not initialized' });
      return;
    }
    
    try {
      if (sharedStore) {
        if (action === 'put') {
          const snapshot = getSnapshot(store);
          await sharedStore.saveSnapshot(snapshot, setLoadingState);
        } else if (action === 'get') {
          const savedSnapshot = storageService.get(StorageKeys.LOCAL_SNAPSHOT);
          if (savedSnapshot) {
            await sharedStore.loadSnapshot(savedSnapshot, setLoadingState);
          }
        }
      }
      else if (action === 'put') {
        logger.debug('tldraw-context', '💾 Putting snapshot into local storage');
        const snapshot = getSnapshot(store);
        logger.debug('tldraw-context', '📦 Snapshot:', snapshot);
        setLocalSnapshot(snapshot);
        storageService.set(StorageKeys.LOCAL_SNAPSHOT, snapshot);
        setLoadingState({ status: 'ready', error: '' });
      }
      else if (action === 'get') {
        logger.debug('tldraw-context', '📂 Getting snapshot from local storage');
        setLoadingState({ status: 'loading', error: '' });
        const savedSnapshot = storageService.get(StorageKeys.LOCAL_SNAPSHOT);
        
        if (savedSnapshot && savedSnapshot.document && savedSnapshot.session) {
          try {
            logger.debug('tldraw-context', '📥 Loading snapshot into editor');
            loadSnapshot(store, savedSnapshot);
            setLoadingState({ status: 'ready', error: '' });
          } catch (error) {
            logger.error('tldraw-context', '❌ Failed to load snapshot:', error);
            store.clear();
            setLoadingState({ status: 'error', error: 'Failed to load snapshot' });
          }
        } else {
          logger.debug('tldraw-context', '⚠️ No valid snapshot found in local storage');
          setLoadingState({ status: 'ready', error: '' });
        }
      }
    } catch (error) {
      logger.error('tldraw-context', '❌ Error handling local snapshot:', error);
      setLoadingState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [sharedStore]);

  const togglePresentationMode = useCallback((editor?: Editor) => {
    logger.debug('tldraw-context', '🔄 Toggling presentation mode');
    
    setPresentationMode(prev => {
      const newValue = !prev;
      storageService.set(StorageKeys.PRESENTATION_MODE, newValue);

      if (newValue && editor) {
        // Starting presentation mode
        logger.info('presentation', '🎥 Initializing presentation service');
        const service = new PresentationService(editor);
        setPresentationService(service);
        service.startPresentationMode();
      } else if (!newValue && presentationService) {
        // Stopping presentation mode
        logger.info('presentation', '🛑 Stopping presentation service');
        presentationService.stopPresentationMode();
        setPresentationService(null);
      }

      return newValue;
    });
  }, [presentationService]);

  return (
    <TLDrawContext.Provider
      value={{
        tldrawPreferences,
        tldrawUserFilePath,
        localSnapshot,
        presentationMode,
        sharedStore,
        connectionStatus,
        presentationService,
        setTldrawPreferences,
        setTldrawUserFilePath,
        handleLocalSnapshot,
        togglePresentationMode,
        initializePreferences,
        setSharedStore,
        setConnectionStatus
      }}
    >
      {children}
    </TLDrawContext.Provider>
  );
};

export const useTLDraw = () => useContext(TLDrawContext);
