import {
    DefaultKeyboardShortcutsDialog,
    DefaultKeyboardShortcutsDialogContent,
    TldrawUiMenuItem,
    useTools,
} from '@tldraw/tldraw';

export const PresentationKeyboardShortcutsDialog = () => {
    const tools = useTools();
    
    return (
        <DefaultKeyboardShortcutsDialog onClose={() => {}}>
            <div style={{ backgroundColor: 'white' }}>
                <TldrawUiMenuItem {...tools['microphone']} />
                <TldrawUiMenuItem {...tools['slide']} />
                <TldrawUiMenuItem {...tools['sticker']} />
            </div>
            <DefaultKeyboardShortcutsDialogContent />
        </DefaultKeyboardShortcutsDialog>
    );
};