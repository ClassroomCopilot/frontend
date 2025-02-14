import { useCallback, ReactNode } from 'react';
import { useEditor, loadSnapshot, useToasts } from '@tldraw/tldraw';
import { blankCanvasSnapshot } from '../../../tldraw/assets';

export function SnapshotToolbar({ 
    children
}: { 
    children: (props: { resetToBlankCanvas: () => void }) => ReactNode
}) {
    const editor = useEditor();
    const { addToast } = useToasts();

    const resetToBlankCanvas = useCallback(() => {
        loadSnapshot(editor.store, blankCanvasSnapshot);
        addToast({
            title: 'Canvas reset',
            description: 'The canvas has been reset to blank.',
            icon: 'reset-zoom',
        });
    }, [editor, addToast]);

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {children({ resetToBlankCanvas })}
        </div>
    );
}
