import { useState } from 'react';
import {
    DefaultToolbar,
    TldrawUiMenuItem,
    useTools,
    useIsToolSelected,
} from '@tldraw/tldraw';
import { StickerDropdown } from '../../../../../ui/components/StickerDropdown';

export const PresentationToolbar = () => {
    const tools = useTools();
    const isMicrophoneSelected = useIsToolSelected(tools['microphone']);
    const micIcon = isMicrophoneSelected ? 'toggle-on' : 'toggle-off';
    const isSlideSelected = useIsToolSelected(tools['slide']);
    const [isStickerSelected, setIsStickerSelected] = useState(false);
    
    const handleStickerSelect = () => {
        setIsStickerSelected(!isStickerSelected);
    };

    return (
        <div>
            <DefaultToolbar>
                <TldrawUiMenuItem 
                    {...tools['microphone']}
                    isSelected={isMicrophoneSelected}
                    icon={micIcon}
                />
                <TldrawUiMenuItem 
                    {...tools['slide']}
                    isSelected={isSlideSelected}
                />
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