import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    Tldraw,
    Editor,
    useTldrawUser,
    DEFAULT_SUPPORTED_IMAGE_TYPES,
    DEFAULT_SUPPORT_VIDEO_TYPES,
} from '@tldraw/tldraw';
import { useSync } from '@tldraw/sync';
// App context
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
// Tldraw services
import { multiplayerOptions } from '../../services/tldraw/optionsService';
import { PresentationService } from '../../services/tldraw/presentationService';
import { createSyncConnectionOptions, handleExternalAsset } from '../../services/tldraw/syncService';
// Tldraw utils
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssets } from '../../utils/tldraw/assets';
import { multiplayerTools } from '../../utils/tldraw/tools';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { customSchema } from '../../utils/tldraw/schemas';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { multiplayerEmbeds } from '../../utils/tldraw/embeds';
// Layout
import { HEADER_HEIGHT } from '../../pages/Layout';
// Styles
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';
// App debug
import { logger } from '../../debugConfig';

const SYNC_WORKER_URL = `https://` + import.meta.env.VITE_SITE_URL + `/tldraw`;

export default function TldrawMultiUser() {
    const { user } = useAuth();
    const {
        tldrawPreferences,
        setTldrawPreferences,
        initializePreferences,
        presentationMode
    } = useTLDraw();
    const navigate = useNavigate();
    const editorRef = useRef<Editor | null>(null);

    // Create editor user with memoization
    const editorUser = useTldrawUser({
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

    const connectionOptions = useMemo(() => createSyncConnectionOptions({
        userId: user?.id ?? '',
        displayName: user?.displayName,
        color: tldrawPreferences?.color ?? `hsl(${Math.random() * 360}, 70%, 50%)`,
        baseUrl: SYNC_WORKER_URL
    }), [user, tldrawPreferences]);

    const store = useSync({
        ...connectionOptions,
        schema: customSchema,
        shapeUtils: allShapeUtils,
        bindingUtils: allBindingUtils
    });

    // Log connection status changes
    useEffect(() => {
        logger.info('multiplayer-page', `🔄 Connection status changed: ${store.status}`, {
            status: store.status,
            connectionOptions
        });
    }, [store.status, connectionOptions]);

    // Effect for initializing preferences
    useEffect(() => {
        if (user?.id && !tldrawPreferences) {
            logger.info('multiplayer-page', '🔄 Initializing preferences');
            initializePreferences(user.id);
        }
    }, [user?.id, tldrawPreferences, initializePreferences]);

    // Effect for redirecting if user is not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Effect for presentation mode
    useEffect(() => {
        if (presentationMode && editorRef.current) {
            const editor = editorRef.current;
            const presentationService = new PresentationService(editor);
            const cleanup = presentationService.startPresentationMode();

            return () => {
                presentationService.stopPresentationMode();
                cleanup();
            };
        }
    }, [presentationMode]);

    // Memoize UI overrides and components
    const uiOverrides = useMemo(() => getUiOverrides(presentationMode), [presentationMode]);
    const uiComponents = useMemo(() => getUiComponents(presentationMode), [presentationMode]);

    // Render conditionally to avoid unnecessary rerenders
    if (!user) {
        return null;
    }

    if (store.status !== 'synced-remote') {
        return <div>Connecting...</div>;
    }

    return (
        <div style={{ 
            position: 'fixed',
            inset: 0,
            top: `${HEADER_HEIGHT}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Tldraw
                user={editorUser}
                store={store.store}
                onMount={(editor) => {
                    editorRef.current = editor;
                    editor.registerExternalAssetHandler('url', async ({ url }: { url: string }) => {
                        return handleExternalAsset(SYNC_WORKER_URL, url);
                    });
                }}
                options={multiplayerOptions}
                embeds={multiplayerEmbeds}
                tools={multiplayerTools}
                shapeUtils={allShapeUtils}
                bindingUtils={allBindingUtils}
                overrides={uiOverrides}
                components={uiComponents}
                assetUrls={customAssets}
                autoFocus={true}
                hideUi={false}
                acceptedImageMimeTypes={DEFAULT_SUPPORTED_IMAGE_TYPES}
                acceptedVideoMimeTypes={DEFAULT_SUPPORT_VIDEO_TYPES}
                maxImageDimension={Infinity}
                maxAssetSize={100 * 1024 * 1024}
                renderDebugMenuItems={() => []}
            />
        </div>
    );
}
