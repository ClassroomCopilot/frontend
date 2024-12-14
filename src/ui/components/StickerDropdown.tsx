import { useEditor, TldrawUiButton } from '@tldraw/tldraw';

export function StickerDropdown() {
    const editor = useEditor()

    const handleToolSelect = (toolId: string) => {
        editor.setCurrentTool(toolId)
    }

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
            display: 'flex',
            gap: '8px',
        }}>
            <TldrawUiButton type="tool" onClick={() => handleToolSelect('heartSticker')} style={{ fontSize: '1.5rem' }}>❤️</TldrawUiButton>
            <TldrawUiButton type="tool" onClick={() => handleToolSelect('starSticker')} style={{ fontSize: '1.5rem' }}>⭐</TldrawUiButton>
            <TldrawUiButton type="tool" onClick={() => handleToolSelect('smileySticker')} style={{ fontSize: '1.5rem' }}>😊</TldrawUiButton>
        </div>
    )
}