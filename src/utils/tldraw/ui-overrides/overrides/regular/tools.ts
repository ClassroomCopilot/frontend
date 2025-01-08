import { TLUiOverrides } from '@tldraw/tldraw'

export const toolsRegularUiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    const commonTools = {
      microphone: {
        id: 'microphone',
        icon: 'microphone',
        label: 'Microphone',
        kbd: 'm',
        onSelect: () => editor.setCurrentTool('microphone'),
      },
      slide: {
        id: 'cc-slide',
        icon: 'group',
        label: 'Slide',
        kbd: 's',
        onSelect: () => editor.setCurrentTool('cc-slide'),
      },
    }

    const stickerTools = {
      heartSticker: {
        id: 'heartSticker',
        icon: '❤️',
        label: 'Heart Sticker',
        kbd: 'h',
        onSelect: () => editor.setCurrentTool('heartSticker'),
      },
      starSticker: {
        id: 'starSticker',
        icon: '⭐',
        label: 'Star Sticker',
        kbd: 't',
        onSelect: () => editor.setCurrentTool('starSticker'),
      },
      smileySticker: {
        id: 'smileySticker',
        icon: '😊',
        label: 'Smiley Sticker',
        kbd: 'y',
        onSelect: () => editor.setCurrentTool('smileySticker'),
      },
    }

    return {
      ...tools,
      ...commonTools,
      ...stickerTools,
    }
  },
}