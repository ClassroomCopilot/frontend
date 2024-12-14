import { TLUiOverrides } from '@tldraw/tldraw';
import { getSlidesFromPage, moveToSlide, $currentSlide } from '../../slides/useSlides';

export const regularUiOverrides: TLUiOverrides = {
    tools(editor, tools) {
        // Define the regular tools here
        tools.microphone = { /* microphone tool config */ };
        tools.slide = { /* slide tool config */ };
        // Add other tools as needed
        return tools;
    },
    actions(editor, actions) {
        // Define regular actions
        actions['next-slide'] = {
            id: 'next-slide',
            label: 'Next slide',
            kbd: 'right',
            onSelect() {
                // Handle next-slide logic
            },
        };
        // Add other actions as needed
        return actions;
    }
};
