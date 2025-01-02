import { useEffect, useMemo, useRef } from 'react';
import {
    Tldraw,
    Editor,
    useTldrawUser,
    DEFAULT_SUPPORT_VIDEO_TYPES,
    DEFAULT_SUPPORTED_IMAGE_TYPES
} from '@tldraw/tldraw';
// App context
import { useTLDraw } from '../../contexts/TLDrawContext';
// Tldraw services
import { localStoreService } from '../../services/tldraw/localStoreService';
import { PresentationService } from '../../services/tldraw/presentationService';
// Tldraw utils
import { getUiOverrides, getUiComponents } from '../../utils/tldraw/ui-overrides';
import { customAssets } from '../../utils/tldraw/assets';
import { devEmbeds } from '../../utils/tldraw/embeds';
import { allShapeUtils } from '../../utils/tldraw/shapes';
import { allBindingUtils } from '../../utils/tldraw/bindings';
import { devTools } from '../../utils/tldraw/tools';
import { customSchema } from '../../utils/tldraw/schemas';
// Styles
import '../../utils/tldraw/tldraw.css';
import '../../utils/tldraw/slides/slides.css';
// App debug
import { logger } from '../../debugConfig';

const devUserId = 'dev-user';

export default function TLDrawDevPage() {
    // 1. All context hooks first
    const { 
        tldrawPreferences, 
        initializePreferences,
        presentationMode,
        setTldrawPreferences
    } = useTLDraw();

    // 2. All refs
    const editorRef = useRef<Editor | null>(null);

    // 4. All memos
    const tldrawUser = useTldrawUser({
        userPreferences: {
            id: devUserId,
            name: 'Dev User',
            color: tldrawPreferences?.color,
            locale: tldrawPreferences?.locale,
            colorScheme: tldrawPreferences?.colorScheme,
            animationSpeed: tldrawPreferences?.animationSpeed,
            isSnapMode: tldrawPreferences?.isSnapMode
        },
        setUserPreferences: setTldrawPreferences
    });

    const store = useMemo(() => localStoreService.getStore({
        schema: customSchema,
        shapeUtils: allShapeUtils,
        bindingUtils: allBindingUtils
    }), []);

    // Initialize preferences when user is available
    useEffect(() => {
        if (!tldrawPreferences) {
            logger.debug('single-player-page', '🔄 Initializing preferences');
            initializePreferences(devUserId);
        }
    }, [tldrawPreferences, initializePreferences]);

    // Load initial data when user node is available
    useEffect(() => {
        if (!tldrawUser) {
          return;
        }
    }, [tldrawUser, store]);

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
        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'fixed' }}>
            <Tldraw
                user={tldrawUser}
                store={store}
                tools={devTools}
                shapeUtils={allShapeUtils}
                bindingUtils={allBindingUtils}
                components={uiComponents}
                overrides={uiOverrides}
                embeds={devEmbeds}
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
