import { useState } from 'react';
import {
    DefaultToolbar,
    TldrawUiMenuItem,
    DefaultToolbarContent
} from '@tldraw/tldraw';
import { StickerDropdown } from '../../StickerDropdown';

export const RegularToolbar = () => {
    const [isStickerSelected, setIsStickerSelected] = useState(false)
    const handleStickerSelect = () => {
        setIsStickerSelected(!isStickerSelected)
    }

    return (
        <DefaultToolbar>
            <div style={{ position: 'relative' }}>
                <TldrawUiMenuItem
                    id="sticker"
                    label="Sticker"
                    icon="sticker-icon"
                    onSelect={handleStickerSelect}
                    isSelected={isStickerSelected}
                />
                {isStickerSelected && <StickerDropdown />}
            </div>
            <DefaultToolbarContent />
        </DefaultToolbar>
    )
};