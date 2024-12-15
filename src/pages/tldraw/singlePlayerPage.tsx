import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
    Tldraw,
    DefaultSpinner,
    defaultShapeUtils,
    defaultBindingUtils,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
    Editor,
} from '@tldraw/tldraw';
import { useAuth } from '../../contexts/AuthContext';
import { useNeo4j } from '../../contexts/Neo4jContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
import { createTldrawUser } from '../../services/tldraw/tldrawService';
import { localStoreService } from '../../services/tldraw/localStoreService';
import { loadNodeSnapshotFromDatabase } from '../../services/tldraw/snapshotService';
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssetUrls } from '../../ui/assetUrls';
import { defaultEmbedsToKeep, customEmbeds } from '../../utils/tldraw/embeds/embedSetup';
// Import all shape utils
import { allShapeUtils, devShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
// Import presentation service
import { PresentationService } from '../../services/tldraw/presentationService';
// Import custom tools
import MicrophoneStateTool from '../../utils/tldraw/transcription/MicrophoneStateTool';
import { SlideShapeTool, SlideShowShapeTool } from '../../utils/tldraw/slides/SlideShapeTool';
import { CalendarShapeTool } from '../../utils/tldraw/calendar/CalendarShapeTool';
// Styles
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';

import { logger } from '../../debugConfig';

// Define custom tools
const customTools = [
    MicrophoneStateTool,
    SlideShapeTool,
    SlideShowShapeTool,
    CalendarShapeTool
];

type LoadingState = {
    status: 'loading' | 'ready' | 'error';
    error?: string;
};

export default function SinglePlayerPage() {
    // 1. All context hooks first
    const { user } = useAuth();
    const { userNodes, isLoading: isNeo4jLoading, userDbName } = useNeo4j();
    const { 
        tldrawPreferences, 
        initializePreferences,
        presentationMode
    } = useTLDraw();
    const navigate = useNavigate();

    // 2. All refs
    const editorRef = useRef<Editor | null>(null);

    // 3. All state
    const [loadingState, setLoadingState] = useState<LoadingState>({ 
        status: 'loading',
        error: '' 
    });

    // 4. All memos
    const tldrawUser = useMemo(() => 
        createTldrawUser(
            user?.id || 'unknown',
            tldrawPreferences
        ),
        [user?.id, tldrawPreferences]
    );

    const store = useMemo(() => localStoreService.getStore({
        shapeUtils: [
            ...defaultShapeUtils,
            ...allShapeUtils,
            ...devShapeUtils
        ],
        bindingUtils: [
            ...defaultBindingUtils,
            ...allBindingUtils
        ]
    }), []);

    // Initialize preferences when user is available
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            logger.debug('single-player-page', '🔄 Initializing preferences for user', { userId: user.id });
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    // Redirect if no user
    useEffect(() => {
        if (!user) {
            logger.info('single-player-page', '🚪 Redirecting to home - no user logged in');
            navigate('/');
        }
    }, [isNeo4jLoading, user, navigate]);

    // Load initial data when user node is available
    useEffect(() => {
        if (!user || !userNodes || !tldrawUser || !userDbName) return;

        // Access the deeply nested user node data
        const userNode = userNodes.privateUserNode;

        loadNodeSnapshotFromDatabase(userNode.path, userDbName, store, setLoadingState);
    }, [user, userNodes, tldrawUser, store, userDbName]);

    useEffect(() => {
        if (user) {
            setLoadingState({ status: 'ready' });
        }
    }, [user]);

    useEffect(() => {
        if (loadingState.status === 'ready') {
            logger.info('single-player-page', '🎨 TLDraw is ready');
        }
    }, [loadingState]);

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

    // Loading states handling
    if (loadingState.status === 'loading') {
        return <div><DefaultSpinner /></div>;
    }

    // Modify the render logic to use presentationMode
    const uiOverrides = getUiOverrides(presentationMode);
    const uiComponents = getUiComponents(presentationMode);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'fixed' }}>
            <Tldraw
                user={tldrawUser}
                store={store}
                tools={customTools}
                shapeUtils={[...allShapeUtils, ...devShapeUtils]}
                bindingUtils={allBindingUtils}
                components={uiComponents}
                overrides={uiOverrides}
                embeds={[...defaultEmbedsToKeep, ...customEmbeds]}
                assetUrls={customAssetUrls}
                autoFocus={true}
                hideUi={false}
                inferDarkMode={false}
                acceptedImageMimeTypes={DEFAULT_SUPPORTED_IMAGE_TYPES}
                acceptedVideoMimeTypes={DEFAULT_SUPPORT_VIDEO_TYPES}
                maxImageDimension={Infinity}
                maxAssetSize={100 * 1024 * 1024}
                renderDebugMenuItems={() => []}
                onMount={(editor) => {
                    logger.info('system', '🎨 Tldraw mounted', {
                        editorId: editor.store.id,
                        presentationMode
                    });
                    editorRef.current = editor;
                }}
            />
        </div>
    );
}
