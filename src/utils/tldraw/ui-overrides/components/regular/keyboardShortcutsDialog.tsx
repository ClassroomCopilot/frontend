import {
    DefaultKeyboardShortcutsDialog,
    DefaultKeyboardShortcutsDialogContent,
    TldrawUiMenuItem,
    useTools,
} from '@tldraw/tldraw';

export const RegularKeyboardShortcutsDialog = () => {
    const tools = useTools();
    return (
        <DefaultKeyboardShortcutsDialog onClose={() => {}}>
            <div style={{ backgroundColor: 'thistle' }}>
                <TldrawUiMenuItem {...tools['microphone']} />
                <TldrawUiMenuItem {...tools['cc-slide']} />
                <TldrawUiMenuItem {...tools['sticker']} />
            </div>
            <DefaultKeyboardShortcutsDialogContent />
        </DefaultKeyboardShortcutsDialog>
    );
};