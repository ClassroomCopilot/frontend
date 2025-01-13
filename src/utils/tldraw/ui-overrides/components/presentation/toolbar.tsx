import { useState } from 'react';
import {
    DefaultToolbar,
    TldrawUiMenuItem,
} from '@tldraw/tldraw';
import { StickerDropdown } from '../../StickerDropdown';

export const PresentationToolbar = () => {
    const [isStickerSelected, setIsStickerSelected] = useState(false);
    
    const handleStickerSelect = () => {
        setIsStickerSelected(!isStickerSelected);
    };

    return (
        <div>
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
            </DefaultToolbar>
        </div>
    );
};