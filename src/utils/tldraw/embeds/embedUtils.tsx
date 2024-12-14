import { TLShapeId, TLUiToolItem, createShapeId } from "@tldraw/tldraw";
import { customEmbeds } from "./embedSetup";

const createEmbedTool = (embed: typeof customEmbeds[number]): TLUiToolItem => ({
    id: `embed${embed.type.charAt(0).toUpperCase() + embed.type.slice(1)}`,
    label: `Embed ${embed.title}`,
    icon: embed.icon,
    onSelect: () => {
        console.log('embed tool selected');
        // 
    },
});

export const embedTools = customEmbeds.map(createEmbedTool);

export const handleEmbedToolSelect = (editor: any, toolId: string) => {
    const tool = embedTools.find((t) => t.id === toolId);
    if (tool) {
        tool.onSelect(editor);
        console.log('embed tool selected', toolId);
    }
};


