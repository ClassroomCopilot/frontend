import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    Tldraw,
    useTldrawUser,
    Editor,
} from '@tldraw/tldraw';
import { useSync } from '@tldraw/sync';
// Local imports
import { useAuth } from '../../contexts/AuthContext';
import { useTLDraw } from '../../contexts/TLDrawContext';
import { multiplayerOptions } from '../../services/tldraw/optionsService';
import { PresentationService } from '../../services/tldraw/presentationService';
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { multiplayerTools } from '../../utils/tldraw/tools';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { multiplayerEmbeds } from '../../utils/tldraw/embeds';
import { customSchema } from '../../utils/tldraw/schemas';
import { createSyncConnectionOptions, handleExternalAsset } from '../../services/tldraw/syncService';
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';
import { logger } from '../../debugConfig';

const SYNC_WORKER_URL = `ws://localhost:5000`;

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
            color: tldrawPreferences?.color ?? '',
            locale: tldrawPreferences?.locale || 'en',
            colorScheme: tldrawPreferences?.colorScheme || 'system',
            animationSpeed: tldrawPreferences?.animationSpeed || 1,
            isSnapMode: tldrawPreferences?.isSnapMode || false
        },
        setUserPreferences: setTldrawPreferences
    });

    const connectionOptions = useMemo(() => createSyncConnectionOptions({
        userId: user?.id ?? '',
        displayName: user?.displayName,
        color: tldrawPreferences?.color ?? `hsl(${Math.random() * 360}, 70%, 50%)`,
        baseUrl: SYNC_WORKER_URL
    }), [user, tldrawPreferences]);

    const sync_store = useSync({
        ...connectionOptions,
        schema: customSchema
    });

    // Log connection status changes
    useEffect(() => {
        logger.info('multiplayer-page', `🔄 Connection status changed: ${sync_store.status}`, {
            status: sync_store.status,
            connectionOptions
        });
    }, [sync_store.status, connectionOptions]);

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

    if (sync_store.status !== 'synced-remote') {
        return <div>Connecting...</div>;
    }

    return (
        <div
            className="tldraw-container"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px',
                boxSizing: 'border-box'
            }}
        >
            <Tldraw
                user={editorUser}
                store={sync_store.store}
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
                autoFocus
                hideUi={false}
            />
        </div>
    );
}
