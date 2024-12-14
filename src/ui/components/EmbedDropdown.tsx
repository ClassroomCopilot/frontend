import { useEditor, TldrawUiButton, TLUiToolItem } from '@tldraw/tldraw';
import { embedTools, handleEmbedToolSelect } from '../../utils/tldraw/embeds/embedUtils';

export function EmbedDropdown() {
    const editor = useEditor()

    return (
        <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            zIndex: 1000,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
        }}>
            {embedTools.map((tool: TLUiToolItem) => (
                <TldrawUiButton
                    key={tool.id}
                    type="tool"
                    onClick={() => handleEmbedToolSelect(editor, tool.id)}
                    style={{ fontSize: '0.5rem' }}
                >
                    {tool.label.split(' ')[1]}
                </TldrawUiButton>
            ))}
        </div>
    )
}