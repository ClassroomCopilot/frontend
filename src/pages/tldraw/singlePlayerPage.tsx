import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Tldraw,
    Editor,
    useTldrawUser,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
} from '@tldraw/tldraw';
// App context
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
// Tldraw services
import { localStoreService } from '../../services/tldraw/localStoreService';
import { PresentationService } from '../../services/tldraw/presentationService';
import { UserNeoDBService } from '../../services/graph/userNeoDBService';
import { NodeCanvasService } from '../../services/tldraw/nodeCanvasService';
// Tldraw utils
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssets } from '../../utils/tldraw/assets';
import { singlePlayerTools } from '../../utils/tldraw/tools';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { singlePlayerEmbeds } from '../../utils/tldraw/embeds';
import { customSchema } from '../../utils/tldraw/schemas';
// Navigation
import { useNavigationStore } from '../../stores/navigationStore';
// Layout
import { HEADER_HEIGHT } from '../../pages/Layout';
// Styles
import '../../utils/tldraw/tldraw.css';
// App debug
import { logger } from '../../debugConfig';
import { LoadingState } from '../../services/tldraw/snapshotService';
import { saveNodeSnapshotToDatabase } from '../../services/tldraw/snapshotService';
import { CircularProgress, Alert, Snackbar } from '@mui/material';

export default function SinglePlayerPage() {
    // Context hooks
    const { user } = useAuth();
    const { 
        tldrawPreferences, 
        initializePreferences,
        presentationMode,
        setTldrawPreferences
    } = useTLDraw();
    const navigate = useNavigate();
    const location = useLocation();

    // Navigation store
    const { currentNode, navigateToNode } = useNavigationStore();

    // Refs
    const editorRef = useRef<Editor | null>(null);

    // Add loading state
    const [loadingState, setLoadingState] = useState<LoadingState>({ 
        status: 'ready', 
        error: '' 
    });

    // Add initialization flag
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initialize user nodes
    useEffect(() => {
        const initializeUserNodes = async () => {
            if (!user?.email) return;

            try {
                const userNodes = await UserNeoDBService.fetchUserNodesData(user.email);
                if (userNodes?.privateUserNode) {
                    await navigateToNode(userNodes.privateUserNode.unique_id);
                }
            } catch (error) {
                logger.error('single-player-page', '❌ Failed to initialize user nodes', error);
            }
        };

        initializeUserNodes();
    }, [user?.email, navigateToNode]);

    // Initialize preferences when user is available
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            logger.debug('single-player-page', '🔄 Initializing preferences for user', { userId: user.id });
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    // Load snapshot when current node changes
    useEffect(() => {
        const loadSnapshot = async () => {
            if (!currentNode?.path || !editorRef.current) return;

            try {
                await UserNeoDBService.loadSnapshotIntoStore(currentNode.path, setLoadingState);
                // Center the current node after loading the snapshot
                await NodeCanvasService.centerCurrentNode(editorRef.current, currentNode);
                // Mark initialization as complete after first snapshot load
                setIsInitialLoad(false);
            } catch (error) {
                logger.error('single-player-page', '❌ Failed to load snapshot', {
                    nodeId: currentNode.id,
                    path: currentNode.path,
                    error
                });
                setIsInitialLoad(false);
            }
        };

        loadSnapshot();
    }, [currentNode]);

    // Add autosave when navigating away from current node
    useEffect(() => {
        const handleBeforeNavigate = async () => {
            // Skip autosave during initial load
            if (isInitialLoad || !editorRef.current || !currentNode?.path) return;

            try {
                logger.info('single-player-page', '💾 Auto-saving before navigation', { 
                    nodeId: currentNode.id,
                    path: currentNode.path 
                });

                const dbName = UserNeoDBService.getNodeDatabaseName(currentNode);
                await saveNodeSnapshotToDatabase(currentNode.path, dbName, editorRef.current.store);
                
                logger.info('single-player-page', '✅ Node saved successfully');
            } catch (error) {
                logger.error('single-player-page', '❌ Failed to save node:', error);
            }
        };

        // Save on unmount/cleanup
        return () => {
            handleBeforeNavigate();
        };
    }, [currentNode, isInitialLoad]);

    // Add periodic autosave
    useEffect(() => {
        // Skip autosave during initial load
        if (isInitialLoad || !editorRef.current || !currentNode?.path) return;

        const autoSaveInterval = setInterval(async () => {
            try {
                const dbName = UserNeoDBService.getNodeDatabaseName(currentNode);
                await saveNodeSnapshotToDatabase(currentNode.path, dbName, editorRef.current!.store);
                logger.debug('single-player-page', '💾 Auto-saved node', { nodeId: currentNode.id });
            } catch (error) {
                logger.error('single-player-page', '❌ Auto-save failed:', error);
            }
        }, 30000); // Autosave every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [currentNode, isInitialLoad]);

    // 4. All memos
    const store = useMemo(() => localStoreService.getStore({
        schema: customSchema,
        shapeUtils: allShapeUtils,
        bindingUtils: allBindingUtils
    }), []);

    const tldrawUser = useTldrawUser({
        userPreferences: {
            id: user?.id ?? '',
            name: user?.displayName,
            color: tldrawPreferences?.color,
            locale: tldrawPreferences?.locale,
            colorScheme: tldrawPreferences?.colorScheme,
            animationSpeed: tldrawPreferences?.animationSpeed,
            isSnapMode: tldrawPreferences?.isSnapMode
        },
        setUserPreferences: setTldrawPreferences
    });

    // Handle shared content
    useEffect(() => {
        const handleSharedContent = async () => {
            if (!editorRef.current || !location.state) {
              return;
            }

            const editor = editorRef.current;
            const { sharedFile, sharedContent } = location.state as {
                sharedFile?: File;
                sharedContent?: {
                    title?: string;
                    text?: string;
                    url?: string;
                };
            };

            if (sharedFile) {
                logger.info('single-player-page', '📤 Processing shared file', { 
                    name: sharedFile.name,
                    type: sharedFile.type
                });

                try {
                    // Handle different file types
                    if (sharedFile.type.startsWith('image/')) {
                        const imageUrl = URL.createObjectURL(sharedFile);
                        await editor.createShape({
                            type: 'image',
                            props: {
                                url: imageUrl,
                                w: 320,
                                h: 240,
                                name: sharedFile.name
                            }
                        });
                        URL.revokeObjectURL(imageUrl);
                    } else if (sharedFile.type === 'application/pdf') {
                        // Handle PDF (you might want to implement PDF handling)
                        logger.info('single-player-page', '📄 PDF handling not implemented yet');
                    } else if (sharedFile.type === 'text/plain') {
                        const text = await sharedFile.text();
                        editor.createShape({
                            type: 'text',
                            props: { text }
                        });
                    }
                } catch (error) {
                    logger.error('single-player-page', '❌ Error processing shared file', { error });
                }
            }

            if (sharedContent) {
                logger.info('single-player-page', '📤 Processing shared content', { sharedContent });
                
                const { title, text, url } = sharedContent;
                let contentText = '';
                
                if (title) {
                  contentText += `${title}\n`;
                }
                if (text) {
                  contentText += `${text}\n`;
                }
                if (url) {
                  contentText += url;
                }

                if (contentText) {
                    editor.createShape({
                        type: 'text',
                        props: { text: contentText }
                    });
                }
            }
        };

        handleSharedContent();
    }, [location.state]);

    // Redirect if no user
    useEffect(() => {
        if (!user) {
            logger.info('single-player-page', '🚪 Redirecting to home - no user logged in');
            navigate('/');
        }
    }, [user, navigate]);

    // Handle presentation mode
    useEffect(() => {
        if (presentationMode && editorRef.current) {
            logger.info('presentation', '🔄 Presentation mode changed', { 
                presentationMode,
                editorExists: !!editorRef.current
            });

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

    // Modify the render logic to use presentationMode
    const uiOverrides = getUiOverrides(presentationMode);
    const uiComponents = getUiComponents(presentationMode);

    return (
        <div style={{ 
            position: 'fixed',
            inset: 0,
            top: `${HEADER_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Loading overlay */}
            {loadingState.status === 'loading' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1000,
                }}>
                    <CircularProgress />
                </div>
            )}

            {/* Error snackbar */}
            <Snackbar 
                open={loadingState.status === 'error'} 
                autoHideDuration={6000}
                onClose={() => setLoadingState({ status: 'ready', error: '' })}
            >
                <Alert severity="error" onClose={() => setLoadingState({ status: 'ready', error: '' })}>
                    {loadingState.error}
                </Alert>
            </Snackbar>

            <Tldraw
                user={tldrawUser}
                store={store}
                tools={singlePlayerTools}
                shapeUtils={allShapeUtils}
                bindingUtils={allBindingUtils}
                components={uiComponents}
                overrides={uiOverrides}
                embeds={singlePlayerEmbeds}
                assetUrls={customAssets}
                autoFocus={true}
                hideUi={false}
                inferDarkMode={false}
                acceptedImageMimeTypes={DEFAULT_SUPPORTED_IMAGE_TYPES}
                acceptedVideoMimeTypes={DEFAULT_SUPPORT_VIDEO_TYPES}
                maxImageDimension={Infinity}
                maxAssetSize={100 * 1024 * 1024}
                renderDebugMenuItems={() => []}
                onMount={(editor) => {
                    editorRef.current = editor;
                    logger.info('system', '🎨 Tldraw mounted', {
                        editorId: editor.store.id,
                        presentationMode
                    });
                }}
            />
        </div>
    );
}
