// External imports
import {
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
} from '@tldraw/tldraw'
// Local imports
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
// Services
import { unfurlBookmarkUrl, useSyncStore } from '../../services/tldraw/syncService';
import { loadUserNodeTldrawFile } from '../../services/tldraw/snapshotService';
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
        presentationMode
    } = useTLDraw();
    const navigate = useNavigate();

    // 3. Refs - keep only editorRef for presentation mode
    const editorRef = useRef<Editor | null>(null);

    // 4. Memos for derived data
    const syncUserInfo = useMemo(() => ({
        id: user?.id ?? '',
        name: user?.displayName,
        color: tldrawPreferences?.color ?? `hsl(${Math.random() * 360}, 70%, 50%)`,
    }), [user, tldrawPreferences]);

    // 5. Create editor user
    const editorUser = useTldrawUser({
        userPreferences: {
            id: user?.id ?? '',
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
    const initial_roomId = 'multiplayer';
    const sync_store = useSyncStore(initial_roomId, syncUserInfo);

    // 8. Effects
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            logger.info('multiplayer-page', '🔄 Initializing preferences');
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [isLoading, user, navigate]);

    useEffect(() => {
        if (!user || !editorUser || !sync_store.store || !userNodes) {
            logger.warn('multiplayer-page', '⚠️ No user node available');
            return;
        }
        if (sync_store.status !== 'synced-remote') {
            logger.warn('multiplayer-page', '⚠️ Sync store not synced-remote');
            return;
        }
        logger.info('multiplayer-page', '🔄 Loading user node tldraw file');
        loadUserNodeTldrawFile(userNodes.privateUserNode, sync_store.store);
    }, [user, editorUser, sync_store.store, sync_store.status, userNodes]);

    useEffect(() => {
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

    if (!user) {
        logger.warn('multiplayer-page', '⚠️ No user available');
        return null;
    }

    if (sync_store.status !== 'synced-remote') {
        logger.info('multiplayer-page', '⏳ Sync store is not synced-remote');
        return <div><DefaultSpinner /></div>;
    }
    
    if (sync_store.status === 'synced-remote') {
        const uiOverrides = getUiOverrides(presentationMode);
        const uiComponents = getUiComponents(presentationMode);
        
        logger.info('multiplayer-page', '🎨 Tldraw mounted', {
            editorId: sync_store.store.id,
            presentationMode,
            userId: userNodes?.privateUserNode.unique_id
        });

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
            <Tldraw
                user={editorUser}
                store={sync_store.store}
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
            </div>
        );
    }
}