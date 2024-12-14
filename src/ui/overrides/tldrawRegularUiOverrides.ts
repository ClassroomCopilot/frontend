import { TLUiOverrides } from '@tldraw/tldraw';

export const regularUiOverrides: TLUiOverrides = {
    tools(editor, tools) {
        tools.microphone = {
            id: 'microphone',
            icon: 'microphone',
            label: 'Microphone',
            kbd: 'm',
            onSelect: () => editor.setCurrentTool('microphone'),
        };
        tools.slide = {
            id: 'slide',
            icon: 'group',
            label: 'Slide',
            kbd: 's',
            onSelect: () => editor.setCurrentTool('slide'),
        };
        tools.embed = {
            id: 'embed',
            icon: 'embed',
            label: 'Embed',
            kbd: 'e',
            onSelect: () => editor.setCurrentTool('embed'),
        };
        tools.heartSticker = {
            id: 'heartSticker',
            icon: '❤️',
            label: 'Heart Sticker',
            kbd: 'h',
            onSelect: () => editor.setCurrentTool('heartSticker'),
        };
        tools.starSticker = {
            id: 'starSticker',
            icon: '⭐',
            label: 'Star Sticker',
            kbd: 't',
            onSelect: () => editor.setCurrentTool('starSticker'),
        };
        tools.smileySticker = {
            id: 'smileySticker',
            icon: '😊',
            label: 'Smiley Sticker',
            kbd: 'y',
            onSelect: () => editor.setCurrentTool('smileySticker'),
        };
        tools.embedTldraw = {
            id: 'embedTldraw',
            icon: '@tldraw/tldraw',
            label: 'Embed tldraw',
            kbd: 't',
            onSelect: () => editor.setCurrentTool('embedTldraw'),
        };
        tools.embedFigma = {
            id: 'embedFigma',
            icon: 'figma',
            label: 'Embed figma',
            kbd: 'f',
            onSelect: () => editor.setCurrentTool('embedFigma'),
        };
        tools.embedYoutube = {
            id: 'embedYoutube',
            icon: 'youtube',
            label: 'Embed youtube',
            kbd: 'y',
            onSelect: () => editor.setCurrentTool('embedYoutube'),
        };
        tools.embedCodesandbox = {
            id: 'embedCodesandbox',
            icon: 'codesandbox',
            label: 'Embed codesandbox',
            kbd: 'c',
            onSelect: () => editor.setCurrentTool('embedCodesandbox'),
        };
        tools.embedCodepen = {
            id: 'embedCodepen',
            icon: 'codepen',
            label: 'Embed codepen',
            kbd: 'p',
            onSelect: () => editor.setCurrentTool('embedCodepen'),
        };
        tools.embedScratch = {
            id: 'embedScratch',
            icon: 'scratch',
            label: 'Embed scratch',
            kbd: 's',
            onSelect: () => editor.setCurrentTool('embedScratch'),
        };
        tools.embedJsfiddle = {
            id: 'embedJsfiddle',
            icon: 'jsfiddle',
            label: 'Embed jsfiddle',
            kbd: 'j',
            onSelect: () => editor.setCurrentTool('embedJsfiddle'),
        };
        tools.embedPpt = {
            id: 'embedPpt',
            icon: 'ppt',
            label: 'Embed ppt',
            kbd: 'p',
            onSelect: () => editor.setCurrentTool('embedPpt'),
        };
        tools.embedReplit = {
            id: 'embedReplit',
            icon: 'replit',
            label: 'Embed replit',
            kbd: 'r',
            onSelect: () => editor.setCurrentTool('embedReplit'),
        };
        tools.embedFelt = {
            id: 'embedFelt',
            icon: 'felt',
            label: 'Embed felt',
            kbd: 'f',
            onSelect: () => editor.setCurrentTool('embedFelt'),
        };
        tools.embedSpotify = {
            id: 'embedSpotify',
            icon: 'spotify',
            label: 'Embed spotify',
            kbd: 's',
            onSelect: () => editor.setCurrentTool('embedSpotify'),
        };
        tools.embedVimeo = {
            id: 'embedVimeo',
            icon: 'vimeo',
            label: 'Embed vimeo',
            kbd: 'v',
            onSelect: () => editor.setCurrentTool('embedVimeo'),
        };
        tools.embedExcalidraw = {
            id: 'embedExcalidraw',
            icon: 'excalidraw',
            label: 'Embed excalidraw',
            kbd: 'e',
            onSelect: () => editor.setCurrentTool('embedExcalidraw'),
        };
        tools.embedObservable = {
            id: 'embedObservable',
            icon: 'observable',
            label: 'Embed observable',
            kbd: 'o',
            onSelect: () => editor.setCurrentTool('embedObservable'),
        };
        tools.embedDesmos = {
            id: 'embedDesmos',
            icon: 'desmos',
            label: 'Embed desmos',
            kbd: 'd',
            onSelect: () => editor.setCurrentTool('embedDesmos'),
        };
        return tools;
    },
    actions(editor, actions) {
        // Add debug mode toggle
        actions['toggle-debug-mode'] = {
            id: 'toggle-debug-mode',
            label: 'Toggle Debug Mode',
            kbd: 'ctrl+shift+d',
            readonlyOk: true,
            onSelect() {
                editor.updateInstanceState({ isDebugMode: !editor.getInstanceState().isDebugMode })
            },
        }
        return actions;
    }
}
