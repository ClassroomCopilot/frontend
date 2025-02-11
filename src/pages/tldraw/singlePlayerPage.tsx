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
import { useNeo4j } from '../../contexts/Neo4jContext';
import { useNeoInstitute } from '../../contexts/NeoInstituteContext';
import { useUser } from '../../contexts/UserContext';
import { useNeoUser } from '../../contexts/NeoUserContext';
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
import { getThemeFromLabel } from '../../utils/tldraw/cc-base/cc-graph/cc-graph-styles';
import { NodeData } from '../../types/graph-shape';
import { NavigationNode } from '../../types/navigation';

export default function SinglePlayerPage() {
    // Context hooks with initialization states
    const { 
        user, 
        isInitialized: isAuthInitialized 
    } = useAuth();
    const { 
        isInitialized: isUserInitialized 
    } = useUser();
    const { 
        tldrawPreferences, 
        initializePreferences,
        presentationMode,
        setTldrawPreferences
    } = useTLDraw();
    const { 
        userDbName, 
        workerDbName, 
        isLoading: isNeo4jLoading, 
        isInitialized: isNeo4jInitialized 
    } = useNeo4j();
    const { 
        isInitialized: isInstituteInitialized 
    } = useNeoInstitute();
    const {
        isInitialized: isNeoUserInitialized
    } = useNeoUser();
    const routerNavigate = useNavigate();
    const location = useLocation();

    // Navigation store
    const { navigate: navigateNode, context } = useNavigationStore();
    const currentNode = context.node;

    // Refs
    const editorRef = useRef<Editor | null>(null);

    // Add loading state
    const [loadingState, setLoadingState] = useState<LoadingState>({ 
        status: 'ready', 
        error: '' 
    });

    // Add initialization flag
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Check if all contexts are initialized
    const areContextsInitialized = useMemo(() => {
        const initStates = {
            auth: isAuthInitialized,
            user: isUserInitialized,
            neo4j: isNeo4jInitialized,
            neoInstitute: isInstituteInitialized,
            neoUser: isNeoUserInitialized
        };

        logger.debug('single-player-page', '🔄 Checking context initialization states', initStates);

        return Object.values(initStates).every(state => state);
    }, [isAuthInitialized, isUserInitialized, isNeo4jInitialized, isInstituteInitialized, isNeoUserInitialized]);

    // Initialize user nodes and navigate to today's node
    useEffect(() => {
        const initializeUserNodes = async () => {
            // Wait for all contexts to be ready
            if (!areContextsInitialized) {
                logger.debug('single-player-page', '⏳ Waiting for context initialization...', {
                    isAuthInitialized,
                    isUserInitialized,
                    isNeo4jInitialized,
                    isInstituteInitialized,
                    isNeoUserInitialized
                });
                return;
            }

            // Check for required data
            if (!user?.email || !userDbName || isNeo4jLoading) {
                logger.debug('single-player-page', '⏳ Waiting for required data...', {
                    hasEmail: !!user?.email,
                    userDbName,
                    isNeo4jLoading
                });
                return;
            }

            try {
                setLoadingState({ status: 'loading', error: '' });
                
                logger.debug('single-player-page', '🔄 Initializing user nodes', {
                    email: user.email,
                    userDbName,
                    workerDbName
                });

                // Fetch user nodes data
                const userNodes = await UserNeoDBService.fetchUserNodesData(
                    user.email,
                    userDbName,
                    workerDbName || undefined
                );

                if (userNodes?.privateUserNode) {
                    logger.debug('single-player-page', '🔄 Navigating to user node', {
                        nodeId: userNodes.privateUserNode.unique_id,
                        dbName: userDbName
                    });
                    await navigateNode(userNodes.privateUserNode.unique_id, userDbName);
                    logger.info('single-player-page', '✅ Successfully navigated to user node');
                } else {
                    logger.warn('single-player-page', '⚠️ No private user node found');
                }
                
                setLoadingState({ status: 'ready', error: '' });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user nodes';
                logger.error('single-player-page', '❌ Failed to initialize user nodes', {
                    error: errorMessage,
                    userDbName,
                    workerDbName
                });
                setLoadingState({ 
                    status: 'error', 
                    error: errorMessage
                });
            }
        };

        initializeUserNodes();
    }, [
        user?.email, 
        userDbName, 
        workerDbName, 
        isNeo4jLoading, 
        areContextsInitialized,
        navigateNode
    ]);

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
                logger.debug('single-player-page', '🔄 Loading snapshot for node', {
                    nodeId: currentNode.id,
                    path: currentNode.path,
                    isInitialLoad
                });

                // 1. Load snapshot
                await UserNeoDBService.loadSnapshotIntoStore(currentNode.path, setLoadingState);
                
                // 2. Always fetch fresh node data
                const nodeData = await loadNodeData(currentNode);
                
                // 3. Handle the node on canvas
                const shapes = editorRef.current.getCurrentPageShapes();
                const nodeShapes = shapes.filter(s => s.id === currentNode.id);
                
                if (nodeShapes.length > 0) {
                    await NodeCanvasService.centerCurrentNode(editorRef.current, currentNode, nodeData);
                } else {
                    await NodeCanvasService.centerCurrentNode(editorRef.current, currentNode, nodeData);
                }

                // Mark initialization as complete after first snapshot load
                setIsInitialLoad(false);
            } catch (error) {
                logger.error('single-player-page', '❌ Failed to load snapshot or node data', error);
                setLoadingState({ 
                    status: 'error', 
                    error: error instanceof Error ? error.message : 'Failed to load node data'
                });
                setIsInitialLoad(false);
            }
        };

        loadSnapshot();
    }, [currentNode, isInitialLoad]);

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
            routerNavigate('/');
        }
    }, [user, routerNavigate]);

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
            {/* Loading overlay - show when loading or contexts not initialized */}
            {(loadingState.status === 'loading' || !areContextsInitialized) && (
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

const loadNodeData = async (node: NavigationNode): Promise<NodeData> => {
    // 1. Always fetch fresh data
    const dbName = UserNeoDBService.getNodeDatabaseName(node);
    const fetchedData = await UserNeoDBService.fetchNodeData(node.id, dbName);
    
    if (!fetchedData?.node_data) {
        throw new Error('Failed to fetch node data');
    }

    // 2. Process the data into the correct shape
    const theme = getThemeFromLabel(node.type);
    return {
        ...fetchedData.node_data,
        title: fetchedData.node_data.title || node.label,
        w: 500,
        h: 350,
        state: {
            parentId: null,
            isPageChild: true,
            hasChildren: null,
            bindings: null
        },
        headerColor: theme.headerColor,
        backgroundColor: theme.backgroundColor,
        isLocked: false,
        __primarylabel__: node.type,
        unique_id: node.id,
        path: node.path
    };
};
