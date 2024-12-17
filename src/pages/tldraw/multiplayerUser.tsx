// External imports
import {
    useState,
    useEffect,
    useRef,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Tldraw,
    useTldrawUser,
    DefaultSpinner,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
    Editor,
    getSnapshot,
} from '@tldraw/tldraw'
// Local imports
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
// Services
import { createSharedStore } from '../../services/tldraw/sharedStoreService';
import { localStoreService } from '../../services/tldraw/localStoreService';
import { StorageKeys, storageService } from '../../services/auth/localStorageService';
import { unfurlBookmarkUrl, useSyncStore } from '../../services/tldraw/syncService';
import { LoadingState, loadUserNodeTldrawFile } from '../../services/tldraw/snapshotService';
import { multiplayerOptions } from '../../services/tldraw/optionsService';
import { PresentationService } from '../../services/tldraw/presentationService'
// TLDraw imports
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssetUrls } from '../../ui/assetUrls';
import { multiplayerTools } from '../../utils/tldraw/tools';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { multiplayerEmbeds } from '../../utils/tldraw/embeds';
// Styles
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';
// Debug imports
import { logger } from '../../debugConfig'

export default function TldrawMultiUser() {
    // 1. Context hooks
    const { user, isLoading } = useAuth();
    const { userNodes } = useNeo4j();
    const { 
        tldrawPreferences, 
        setTldrawPreferences, 
        initializePreferences,
        presentationMode,
        handleLocalSnapshot,
        localSnapshot,
        setConnectionStatus
    } = useTLDraw();
    const navigate = useNavigate();

    // 2. State hooks
    const [loadingState, setLoadingState] = useState<LoadingState>({ 
        status: 'loading',
        error: '' 
    });

    // 3. Refs
    const editorRef = useRef<Editor | null>(null);
    const lastSaveRef = useRef<number>(Date.now());
    const setLoadingStateRef = useRef(setLoadingState);
    
    // 4. Memos for derived data
    const syncUserInfo = useMemo(() => ({
        id: user?.id ?? '',
        name: user?.displayName,
        color: tldrawPreferences?.color ?? `hsl(${Math.random() * 360}, 70%, 50%)`,
    }), [user, tldrawPreferences]);

    // 5. Create editor user
    const editorUser = useTldrawUser({
        userPreferences: {
            id: user?.id,
            name: user?.displayName,
            color: tldrawPreferences?.color ?? '',
            locale: tldrawPreferences?.locale || 'en',
            colorScheme: tldrawPreferences?.colorScheme || 'system',
            animationSpeed: tldrawPreferences?.animationSpeed || 1,
            isSnapMode: tldrawPreferences?.isSnapMode || false,
        },
        setUserPreferences: setTldrawPreferences
    });

    // 6. Initialize sync store
    const initial_roomId = user?.id ?? 'ERROR';
    const sync_store = useSyncStore(initial_roomId, syncUserInfo);

    // 7. Create shared store
    const sharedStore = useMemo(() => {
        if (!sync_store.store) return null;
        return createSharedStore(sync_store.store);
    }, [sync_store.store]);

    // 8. Effects
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [isLoading, user, navigate]);

    useEffect(() => {
        if (!sharedStore || sync_store.status !== 'synced-remote') return;
        sharedStore.startAutoSave(setLoadingState);
        return () => sharedStore.stopAutoSave();
    }, [sharedStore, sync_store.status]);

    useEffect(() => {
        if (!userNodes) {
            logger.warn('multiplayer-page', '⚠️ No user node available');
            setConnectionStatus('error');
        }
    }, [userNodes, setConnectionStatus]);

    useEffect(() => {
        if (!user || !editorUser || !sync_store.store || !userNodes || !sharedStore) return;
        if (sync_store.status !== 'synced-remote') return;

        loadUserNodeTldrawFile(userNodes.privateUserNode, sync_store.store, setLoadingState, sharedStore);
    }, [user, editorUser, sync_store.store, sync_store.status, userNodes, sharedStore]);

    useEffect(() => {
        logger.info('presentation', '🔄 Presentation mode changed', { 
            presentationMode,
            editorExists: !!editorRef.current
        });

        if (presentationMode && editorRef.current) {
            const editor = editorRef.current;
            const presentationService = new PresentationService(editor);
            const cleanup = presentationService.startPresentationMode();

            return () => {
                logger.info('presentation', '🧹 Cleaning up presentation mode');
                presentationService.stopPresentationMode();
                cleanup();
            };
        }
    }, [presentationMode]);

    useEffect(() => {
        if (!sync_store) {
            logger.warn('multiplayer-page', '⚠️ No sync store available');
            return;
        }

        if (sync_store.status === 'error' && localSnapshot) {
            logger.warn('multiplayer-page', '⚠️ Sync store error, attempting fallback', {
                syncStatus: sync_store.status,
                hasLocalSnapshot: !!localSnapshot
            });

            try {
                localStoreService.loadSnapshot(localSnapshot, setLoadingState);
                logger.info('multiplayer-page', '✅ Successfully loaded fallback snapshot');
                
                // You might want to put the app in a "offline/fallback" mode here
                // This could involve disabling certain features or showing a warning banner
                
            } catch (error) {
                logger.error('multiplayer-page', '❌ Failed to load fallback snapshot', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                setLoadingState({ 
                    status: 'error',
                    error: 'Failed to load fallback snapshot'
                });
            }
        }
    }, [sync_store, localSnapshot]);

    useEffect(() => {
        if (!sync_store || sync_store.status !== 'synced-remote') return;
        if (!sync_store.store) return;

        const saveIfNeeded = () => {
            const now = Date.now();
            if (now - lastSaveRef.current >= 30000) {
                const currentSnapshot = getSnapshot(sync_store.store);
                const savedSnapshot = storageService.get(StorageKeys.LOCAL_SNAPSHOT);

                if (!savedSnapshot || JSON.stringify(currentSnapshot) !== JSON.stringify(savedSnapshot)) {
                    logger.debug('multiplayer-page', '💾 Auto-saving snapshot - changes detected');
                    handleLocalSnapshot('put', sync_store.store, setLoadingStateRef.current);
                    lastSaveRef.current = now;
                }
            }
        };

        const saveInterval = setInterval(saveIfNeeded, 5000);
        return () => clearInterval(saveInterval);
    }, [sync_store, handleLocalSnapshot]);

    useEffect(() => {
        if (sync_store.status === 'error') {
            setConnectionStatus('error');
        } else if (sync_store.status === 'synced-remote') {
            setConnectionStatus('online');
        } else {
            setConnectionStatus('offline');
        }
    }, [sync_store.status, setConnectionStatus]);

    // 15. Monitor sync store status
    useEffect(() => {
        if (sync_store.status === 'error') {
            setConnectionStatus('error');
        } else if (sync_store.status === 'synced-remote') {
            setConnectionStatus('online');
        } else {
            setConnectionStatus('offline');
        }
    }, [sync_store.status, setConnectionStatus]);

    // 16. Modify the render logic to prevent unnecessary re-renders
    const renderTldraw = useMemo(() => {
        if (!user) {
            logger.warn('multiplayer-page', '⚠️ Attempted to render Tldraw without user');
            return null;
        }

        const uiOverrides = getUiOverrides(presentationMode);
        const uiComponents = getUiComponents(presentationMode);
        const store = sync_store.store || localStoreService.getStore();
        
        return (
            <Tldraw
                user={editorUser}
                store={store}
                onMount={(editor) => {
                    logger.info('system', '🎨 Tldraw mounted', {
                        editorId: editor.store.id,
                        presentationMode,
                        userId: userNodes?.privateUserNode.unique_id
                    });
                    editorRef.current = editor;
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl);
                }}
                options={multiplayerOptions}
                embeds={multiplayerEmbeds}
                tools={multiplayerTools}
                shapeUtils={allShapeUtils}
                bindingUtils={allBindingUtils}
                overrides={uiOverrides}
                components={uiComponents}
                assetUrls={customAssetUrls}
                autoFocus={true}
                hideUi={false}
                inferDarkMode={false}
                acceptedImageMimeTypes={DEFAULT_SUPPORTED_IMAGE_TYPES}
                acceptedVideoMimeTypes={DEFAULT_SUPPORT_VIDEO_TYPES}
                maxImageDimension={Infinity}
                maxAssetSize={100 * 1024 * 1024}
                renderDebugMenuItems={() => []}
            />
        );
    }, [
        user,
        editorUser,
        presentationMode,
        sync_store.store,
        userNodes?.privateUserNode.unique_id
    ]);

    if (isLoading) {
        logger.debug('system', '⏳ Auth context still loading')
        return <div>Loading auth context...</div>;
    }

    if (!user) {
        return null;
    }

    if (loadingState.status === 'loading') {
        return <div><DefaultSpinner /></div>;
    } else if (loadingState.status === 'error') {
        logger.error('system', '❌ Loading error', { error: loadingState.error })
        return <div>Error: {loadingState.error}</div>;
    }
    
    if (sync_store.status === 'synced-remote' || sync_store.status === 'error') {
        return (
            <div className="tldraw-container" style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px',
                boxSizing: 'border-box'
            }}>
                {sync_store.status === 'error' && (
                    <div className="offline-warning" style={{
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        padding: '12px',
                        marginBottom: '12px',
                        borderRadius: '4px',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        ⚠️ Working in offline mode with last saved version
                    </div>
                )}
                {renderTldraw}
            </div>
        );
    }
}